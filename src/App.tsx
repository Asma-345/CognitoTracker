/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useKeystrokeDynamics, KeystrokeMetrics } from './hooks/useKeystrokeDynamics';
import { Activity, Brain, Timer, ShieldCheck, AlertTriangle, RefreshCw, Zap, Binary } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';
import { cn } from './lib/utils';

type TestState = 'idle' | 'baseline' | 'current' | 'analyzing' | 'finished';

interface AnalysisResult {
  fatigueScore: number;
  primaryIndicator: string;
  scientificSummary: string;
  recommendation: string;
  strategy: string;
}

const TEST_DURATION = 30; // seconds

export default function App() {
  const [testState, setTestState] = useState<TestState>('idle');
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [baselineData, setBaselineData] = useState<KeystrokeMetrics | null>(null);
  const [currentData, setCurrentData] = useState<KeystrokeMetrics | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [inputText, setInputText] = useState("");
  
  const { metrics, handleKeyDown, handleKeyUp, resetMetrics } = useKeystrokeDynamics();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTest = (type: 'baseline' | 'current') => {
    resetMetrics();
    setInputText("");
    setTestState(type);
    setTimeLeft(TEST_DURATION);
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (timeLeft === 0) {
      if (testState === 'baseline') {
        setBaselineData(metrics);
        setTestState('idle');
      } else if (testState === 'current') {
        setCurrentData(metrics);
        performAnalysis(baselineData!, metrics);
      }
    }
  }, [timeLeft, testState, metrics]);

  const performAnalysis = async (baseline: KeystrokeMetrics, current: KeystrokeMetrics) => {
    setTestState('analyzing');
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseline, current }),
      });
      const result = await response.json();
      setAnalysis(result);
      setTestState('finished');
    } catch (error) {
      console.error("Analysis failed", error);
      // Even if fetch fails, the server has a fallback, but if the server IS DOWN:
      setTestState('idle');
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-green-400 border-green-400/30';
    if (score < 60) return 'text-yellow-400 border-yellow-400/30';
    return 'text-red-400 border-red-400/30';
  };

  const [userProfile, setUserProfile] = useState("Alpha-1");

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto relative overflow-hidden">
      <div className="scanline" />
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter flex items-center gap-3">
            <Zap className="text-yellow-400 fill-yellow-400/20" />
            COGNI-TRACK <span className="text-xs font-mono opacity-40 ml-2 tracking-widest uppercase">v2.0 PRO</span>
          </h1>
          <p className="text-white/40 font-mono text-xs mt-1 uppercase tracking-wider">
            Scientific Keystroke Dynamics & Neurological Fatigue Monitoring
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="hidden md:block text-right">
             <p className="text-[10px] font-mono opacity-30 uppercase tracking-widest">Active Profile</p>
             <select 
              value={userProfile} 
              onChange={(e) => setUserProfile(e.target.value)}
              className="bg-transparent text-xs font-mono text-blue-400 focus:outline-none cursor-pointer hover:text-blue-300"
             >
                <option value="Alpha-1">Subject: ALPHA-1</option>
                <option value="Beta-2">Subject: BETA-2</option>
                <option value="Guest">Subject: GUEST_MODE</option>
             </select>
          </div>
          <div className="px-4 py-2 border border-white/10 bg-white/5 rounded-sm flex items-center gap-2">
            <ShieldCheck size={16} className="text-blue-400" />
            <span className="text-[10px] font-mono opacity-60 uppercase tracking-widest">Secure Kernel Verified</span>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Metrics and Tests */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricBox 
              label="Dwell Time" 
              value={`${metrics.avgDwellTime.toFixed(1)}ms`} 
              icon={<Timer className="text-purple-400" />} 
              subtext="Key persistence on sensor"
            />
            <MetricBox 
              label="Flight Time" 
              value={`${metrics.avgFlightTime.toFixed(1)}ms`} 
              icon={<Brain className="text-blue-400" />} 
              subtext="Inter-key motor latency"
            />
             <MetricBox 
              label="Error Rate" 
              value={`${(metrics.errorRate * 100).toFixed(1)}%`} 
              icon={<AlertTriangle className={cn(metrics.errorRate > 0.05 ? "text-orange-400" : "text-emerald-400")} />} 
              subtext="Corrective neuro-feedback"
            />
          </div>

          {/* Test Control Area */}
          <div className="data-grid-item bg-white/[0.02] border-white/10 relative overflow-hidden h-[400px] flex flex-col">
            <AnimatePresence mode="wait">
              {testState === 'idle' ? (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center p-8"
                >
                  <Activity size={48} className="text-white/20 mb-6 animate-pulse" />
                  <h2 className="text-2xl font-semibold mb-2">Initialize Cognitive Scan</h2>
                  <p className="text-white/40 text-sm max-w-md mb-8">
                    To detect fatigue, we first need a baseline of your rested state. 
                    Then, perform the current test to identify cognitive degradation.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                    <button 
                      onClick={() => startTest('baseline')}
                      className="flex-1 px-6 py-3 border border-white/10 hover:border-white/40 bg-white/5 hover:bg-white/10 transition-all font-mono text-xs tracking-widest uppercase flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={14} /> 1. Start Baseline
                    </button>
                    <button 
                      onClick={() => baselineData ? startTest('current') : null}
                      disabled={!baselineData}
                      className={cn(
                        "flex-1 px-6 py-3 border font-mono text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition-all",
                        baselineData 
                          ? "border-blue-500/50 hover:border-blue-500 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400" 
                          : "border-white/5 opacity-30 cursor-not-allowed"
                      )}
                    >
                      <Activity size={14} /> 2. Current Test
                    </button>
                  </div>
                  {!baselineData && (
                    <p className="text-[10px] uppercase tracking-widest text-orange-400/60 mt-4">
                      * System requires baseline data for delta calculation
                    </p>
                  )}
                </motion.div>
              ) : (testState === 'baseline' || testState === 'current') ? (
                <motion.div 
                  key="testing"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col p-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-mono text-xs tracking-[0.2em] text-blue-400 uppercase">
                      Capturing Telemetry: {testState}
                    </span>
                    <span className="font-mono text-2xl font-bold text-white/80 tabular-nums">
                      00:{timeLeft.toString().padStart(2, '0')}
                    </span>
                  </div>
                  
                  <textarea
                    autoFocus
                    placeholder="Type continuously to provide enough telemetry data. Focus on speed and accuracy. You can type about your day or repeat the alphabet..."
                    className="flex-1 bg-black/40 border border-white/5 p-4 font-mono text-sm resize-none focus:outline-none focus:border-blue-500/30"
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyUp}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  
                  <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-blue-500"
                      initial={{ width: "100%" }}
                      animate={{ width: `${(timeLeft / TEST_DURATION) * 100}%` }}
                      transition={{ duration: 1, ease: "linear" }}
                    />
                  </div>
                </motion.div>
              ) : testState === 'analyzing' ? (
                <motion.div 
                  key="analyzing"
                  className="flex-1 flex flex-col items-center justify-center p-8"
                >
                  <div className="relative w-24 h-24 mb-6">
                    <motion.div 
                      className="absolute inset-0 border-2 border-blue-500/20 rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div 
                      className="absolute inset-2 border-2 border-blue-500/40 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Binary className="text-blue-500 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="font-mono text-xs tracking-widest text-blue-400 uppercase mb-2">Consulting Hybrid Engine</h3>
                  <p className="text-white/40 text-xs font-mono">Running cross-matrix telemetry correlation...</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="finished"
                  className="flex-1 overflow-y-auto custom-scrollbar"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                      <div>
                        <h2 className="text-xl font-bold uppercase tracking-tight">Fatigue Assessment Complete</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-white/10 text-white/60">STRATEGY: {analysis?.strategy}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => { setTestState('idle'); setAnalysis(null); }}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                      >
                        <RefreshCw size={20} className="text-white/40" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-6">
                          <div className={cn("p-6 border rounded-lg bg-black/40", getScoreColor(analysis?.fatigueScore || 0))}>
                            <span className="text-[10px] uppercase tracking-widest font-mono opacity-60">Fatigue Index</span>
                            <div className="text-6xl font-black mt-2 leading-none flex items-baseline gap-2">
                              {analysis?.fatigueScore}
                              <span className="text-xl font-medium opacity-40">/100</span>
                            </div>
                            <p className="mt-4 font-bold uppercase tracking-tight text-lg">{analysis?.primaryIndicator}</p>
                          </div>
                          
                          <div className="space-y-2">
                             <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Scientific Summary</h4>
                             <p className="text-sm leading-relaxed text-white/70 italic">"{analysis?.scientificSummary}"</p>
                          </div>
                          
                          <div className="p-4 border border-white/5 bg-white/5 rounded flex gap-3">
                            <Zap className="text-yellow-400 shrink-0" size={20} />
                            <div>
                               <h5 className="text-xs font-bold uppercase text-yellow-500/80">Clinician Advice</h5>
                               <p className="text-xs text-white/50 mt-1">{analysis?.recommendation}</p>
                            </div>
                          </div>
                       </div>

                       <div className="h-[300px] border border-white/5 p-4 bg-black/20 rounded">
                          <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-4">Dwell vs Flight Distribution (Current)</h4>
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={currentData?.rawDwellTimes.slice(-20).map((d, i) => ({ 
                              idx: i, 
                              dwell: d, 
                              flight: currentData?.rawFlightTimes[i] || 0 
                            }))}>
                              <defs>
                                <linearGradient id="colorDwell" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorFlight" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                              <XAxis dataKey="idx" hide />
                              <YAxis hide domain={['auto', 'auto']} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                                itemStyle={{ color: '#fff' }}
                              />
                              <Area type="monotone" dataKey="dwell" stroke="#818cf8" fillOpacity={1} fill="url(#colorDwell)" strokeWidth={2} />
                              <Area type="monotone" dataKey="flight" stroke="#38bdf8" fillOpacity={1} fill="url(#colorFlight)" strokeWidth={2} />
                            </AreaChart>
                          </ResponsiveContainer>
                       </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Comparative Viz */}
        <div className="lg:col-span-4 space-y-6">
           <div className="data-grid-item bg-white/[0.02]">
              <h3 className="font-mono text-[10px] tracking-widest uppercase text-white/40 mb-6 flex items-center gap-2">
                <Binary size={12} /> System Topology
              </h3>
              
              <div className="space-y-8">
                 <ComparisonProgress label="Dwell Consistency" baseline={baselineData?.avgDwellTime} current={metrics.avgDwellTime} />
                 <ComparisonProgress label="Processing Lag" baseline={baselineData?.avgFlightTime} current={metrics.avgFlightTime} />
                 <ComparisonProgress label="Inhibitory Control (Error Rate)" baseline={baselineData ? baselineData.errorRate * 100 : 0} current={metrics.errorRate * 100} inverse />
              </div>

              <div className="mt-8 pt-8 border-t border-white/5">
                 <p className="text-[10px] font-mono text-white/20 uppercase leading-relaxed">
                   Kernel processes active. All keyboard events are timestamped with microsecond precision via high-resolution performance.now() API.
                 </p>
              </div>
           </div>

           <div className="border border-yellow-500/20 bg-yellow-500/5 p-4 font-mono text-[10px] text-yellow-500/60 flex gap-3">
              <AlertTriangle className="shrink-0" size={14} />
              <p>PRE-ALPHA: This tool offers cognitive estimations based on motor kinetics. It is not a clinical medical device.</p>
           </div>
        </div>
      </main>

      {/* Footer Meta */}
      <footer className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between gap-4 opacity-40">
        <div className="text-[10px] font-mono uppercase tracking-[0.3em]">
          Local Node IP: 127.0.0.1 // Scan Active
        </div>
        <div className="text-[10px] font-mono uppercase tracking-[0.3em]">
          CogniTrack Neural Kernel v.2.0.4 - Hackathon Edition
        </div>
      </footer>
    </div>
  );
}

function MetricBox({ label, value, icon, subtext }: { label: string, value: string, icon: React.ReactNode, subtext: string }) {
  return (
    <div className="data-grid-item group">
      <div className="flex items-center justify-between mb-4">
        {icon}
        <span className="text-[10px] font-mono opacity-40 uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-3xl font-bold tracking-tighter group-hover:translate-x-1 transition-transform">
        {value}
      </div>
      <p className="text-[10px] font-mono text-white/20 mt-2 uppercase">{subtext}</p>
    </div>
  );
}

function ComparisonProgress({ label, baseline, current, inverse = false }: { label: string, baseline?: number, current: number, inverse?: boolean }) {
  const delta = baseline ? ((current - baseline) / baseline) * 100 : 0;
  const isWorse = inverse ? delta < 0 : delta > 15;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-mono uppercase tracking-widest">{label}</span>
        <span className={cn(
          "font-mono text-xs",
          !baseline ? "opacity-20" : isWorse ? "text-red-400" : "text-green-400"
        )}>
          {baseline ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%` : 'WAITING'}
        </span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          className={cn("h-full", isWorse ? "bg-red-500" : "bg-blue-500")}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(Math.abs(delta) + 20, 100)}%` }}
        />
      </div>
    </div>
  );
}
