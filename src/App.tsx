/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useKeystrokeDynamics, KeystrokeMetrics } from './hooks/useKeystrokeDynamics';
import { Activity, Brain, Timer, ShieldCheck, AlertTriangle, RefreshCw, Zap, Binary, Info } from 'lucide-react';
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

/**
 * Neural Topology Visualization
 * Shows a synthetic heatmap of motor-kinetic stability
 */
const NeuralTopology = ({ score }: { score: number }) => {
  const points = [
    { label: 'Latency', value: 30 + (score * 0.7) },
    { label: 'Jitter', value: 40 + (score * 0.6) },
    { label: 'Stability', value: 100 - score },
    { label: 'Precision', value: 90 - (score * 0.5) },
    { label: 'Rhythm', value: 80 - (score * 0.4) },
  ];

  return (
    <div className="relative w-full h-48 flex items-center justify-center p-4">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
        {/* Background Grid */}
        {[20, 40, 60, 80, 100].map((r) => (
          <circle key={r} cx="50" cy="50" r={r/2} fill="none" stroke="rgba(59,130,246,0.1)" strokeWidth="0.5" />
        ))}
        {/* Axes */}
        {points.map((_, i) => {
          const angle = (i / points.length) * Math.PI * 2;
          return (
            <line 
              key={i}
              x1="50" y1="50" 
              x2={50 + Math.cos(angle) * 50} 
              y2={50 + Math.sin(angle) * 50} 
              stroke="rgba(59,130,246,0.1)" 
              strokeWidth="0.5"
            />
          );
        })}
        {/* Data Shape */}
        <polygon 
          points={points.map((p, i) => {
            const angle = (i / points.length) * Math.PI * 2;
            const r = (p.value / 100) * 50;
            return `${50 + Math.cos(angle) * r},${50 + Math.sin(angle) * r}`;
          }).join(' ')}
          fill="rgba(59,130,246,0.2)"
          stroke="rgba(59,130,246,0.8)"
          strokeWidth="1"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-mono text-blue-400 opacity-50 uppercase tracking-tighter">Your Typing Beat</span>
      </div>
    </div>
  );
};

interface SessionRecord {
  id: string;
  score: number;
  indicator: string;
  timestamp: string;
}

export default function App() {
  const [testState, setTestState] = useState<TestState>('idle');
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [baselineData, setBaselineData] = useState<KeystrokeMetrics | null>(null);
  const [currentData, setCurrentData] = useState<KeystrokeMetrics | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [inputText, setInputText] = useState("");
  const [ripples, setRipples] = useState<{ id: number, x: number, y: number }[]>([]);
  const [showArch, setShowArch] = useState(false);
  const [neuralHeat, setNeuralHeat] = useState<number[]>(new Array(64).fill(0));
  const [history, setHistory] = useState<SessionRecord[]>([]);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('kinetic_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveToHistory = (res: AnalysisResult) => {
    const newRecord: SessionRecord = {
      id: Date.now().toString(),
      score: res.fatigueScore,
      indicator: res.primaryIndicator,
      timestamp: new Date().toLocaleTimeString()
    };
    const newHistory = [newRecord, ...history].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('kinetic_history', JSON.stringify(newHistory));
  };

  // Neural Map Simulation (Degrades over time)
  useEffect(() => {
    const interval = setInterval(() => {
      setNeuralHeat(prev => prev.map(v => Math.max(0, v - 5)));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const { metrics, handleKeyDown, handleKeyUp, resetMetrics } = useKeystrokeDynamics();

  const onKeyDown = (e: React.KeyboardEvent) => {
    handleKeyDown(e);
    playClick();
    setRipples(prev => [...prev.slice(-15), { id: Date.now(), x: Math.random() * 100, y: Math.random() * 100 }]);
    
    // Light up neural nodes
    setNeuralHeat(prev => {
      const next = [...prev];
      const idx = Math.floor(Math.random() * 64);
      next[idx] = 100;
      return next;
    });
  };
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [pulseMessage, setPulseMessage] = useState<string | null>(null);
  const [isPulsing, setIsPulsing] = useState(false);
  const [isHeartbeat, setIsHeartbeat] = useState(false);

  // Autonomous Heartbeat Cycle
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      if (!isPulsing && testState === 'idle') {
        setIsHeartbeat(true);
        setTimeout(() => setIsHeartbeat(false), 2000);
        
        // Occasionally show a background scan message
        if (Math.random() > 0.7) {
          const passiveMessages = [
            "LATENCY WATCHDOG: MONITORING",
            "NEURAL BASELINE: STABLE",
            "SYNC-LEVEL: OPTIMAL",
            "BACKGROUND SCAN COMPLETED"
          ];
          setPulseMessage(passiveMessages[Math.floor(Math.random() * passiveMessages.length)]);
          setTimeout(() => setPulseMessage(null), 3000);
        }
      }
    }, 12000);

    return () => clearInterval(heartbeatInterval);
  }, [isPulsing, testState]);

  const playPulseSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const createResonance = (freq: number, type: OscillatorType, startTime: number, duration: number, volume: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(volume, startTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      // Create a "Synapse Pulse" chord (432Hz base - often associated with focus/calm)
      const now = audioCtx.currentTime;
      createResonance(432, 'sine', now, 2, 0.15); // Base
      createResonance(864, 'sine', now + 0.1, 1.5, 0.1); // Harmonic
      createResonance(216, 'triangle', now, 1.2, 0.05); // Deep sub
    } catch (e) {}
  };

  const triggerPulse = () => {
    if (isPulsing) return;
    setIsPulsing(true);
    playPulseSound();
    
    const messages = [
      "SYNAPTIC PATHWAY ALIGNMENT: 98% OPTIMAL",
      "COGNITIVE COHERENCE RESONANCE DETECTED",
      "NEURO-PLASTICITY POTENTIAL: HIGH",
      "FRONTAL LOBE CALIBRATION: COMPLETE",
      "ALPHA-WAVE SYNCHRONICITY ESTABLISHED",
      "MOTOR-CORTEX JITTER: MINIMAL",
      "PRE-FRONTAL FOCUS FLOW: ACTIVE"
    ];
    setPulseMessage(messages[Math.floor(Math.random() * messages.length)]);
    
    setTimeout(() => {
      setIsPulsing(false);
      setPulseMessage(null);
    }, 4000);
  };

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (freq: number, start: number, duration: number, type: OscillatorType = 'sine') => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start);
        gain.gain.setValueAtTime(0, audioCtx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + start + duration);
        osc.start(audioCtx.currentTime + start);
        osc.stop(audioCtx.currentTime + start + duration);
      };

      // Cyber-Diagnostic Chime
      playTone(880, 0, 0.5);
      playTone(1320, 0.1, 0.4);
      playTone(1760, 0.2, 0.3);
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  const playClick = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, audioCtx.currentTime); 
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {}
  };

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
      saveToHistory(result); 
      setTestState('finished');
      playBeep();
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

  const PASSAGES = [
    "Learning to code requires significant mental energy and a consistent neurological state. This initial test helps us establish your rested 'baseline'—the reference we use to detect mental fatigue in later sessions.",
    "As we execute complex tasks, mental fatigue can cause our cognitive processing speed to slow down. This second test checks your current rhythm to see if it has deviated due to mental exhaustion.",
    "Analysis complete. The system is now evaluating your motor-kinetic patterns for signs of mental fatigue. This data helps we understand the relationship between your resting state and your current level of exhaustion."
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto relative overflow-hidden text-slate-100 bg-[#0a0a0c]">
      <div className="scanline" />
      
      {/* Neural Background Grid */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full p-12 gap-8">
          {neuralHeat.map((heat, i) => (
            <motion.div 
              key={i}
              className="rounded-full blur-xl"
              animate={{ 
                backgroundColor: heat > 0 ? `rgba(59, 130, 246, ${heat / 100})` : 'transparent',
                scale: heat > 0 ? [1, 1.2, 1] : 1
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4 relative z-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter flex items-center gap-3">
            <Zap className="text-blue-400 fill-blue-400/20" />
            KINETIC-SCAN <span className="text-xs font-mono opacity-40 ml-2 tracking-widest uppercase px-2 py-1 border border-white/10 rounded">v2.6 Hybrid-Lite</span>
          </h1>
          <p className="text-white/40 font-mono text-[10px] mt-2 uppercase tracking-[0.2em]">
            Neural Telemetry Interface // Mental Fatigue Tracking
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="hidden md:block text-right mr-4 border-r border-white/5 pr-4">
             <p className="text-[9px] font-mono opacity-30 uppercase tracking-widest">Active Profiling</p>
             <select 
              value={userProfile} 
              onChange={(e) => setUserProfile(e.target.value)}
              className="bg-transparent text-xs font-mono text-blue-400 focus:outline-none cursor-pointer hover:text-blue-300 appearance-none"
             >
                <option value="Alpha-1" className="bg-[#111]">SUBJECT: ALPHA-1</option>
                <option value="Beta-2" className="bg-[#111]">SUBJECT: BETA-2</option>
                <option value="Guest" className="bg-[#111]">MODE: GUEST_DEBUG</option>
             </select>
          </div>
          <div className="px-4 py-2 border border-blue-500/10 bg-blue-500/5 rounded-sm flex items-center gap-3">
            <ShieldCheck size={14} className="text-blue-500/60" />
            <span className="text-[9px] font-mono opacity-60 uppercase tracking-widest">Auth: Encrypted Node</span>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left Column: Metrics and Tests */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricBox 
              label="Dwell Latency" 
              value={`${metrics.avgDwellTime.toFixed(1)}ms`} 
              icon={<Timer className="text-blue-400/60" />} 
              subtext="Motor Precision Strike"
              info="The duration a key is held down. Longer dwell times suggest neurological fatigue."
            />
            <MetricBox 
              label="Flight Latency" 
              value={`${metrics.avgFlightTime.toFixed(1)}ms`} 
              icon={<Brain className="text-indigo-400/60" />} 
              subtext="Cognitive Synthesis Gap"
              info="The interval between key releases and next presses. Higher values indicate processing 'bottlenecks'."
            />
            <MetricBox 
              label="Coefficient of Var." 
              value={`${metrics.stdDevFlightTime.toFixed(1)}ms`} 
              icon={<Activity className="text-pink-400/60" />} 
              subtext="Rhythmic Periodicity"
              info="The standard deviation of your flight times. High jitter is a top indicator of acute exhaustion."
            />
             <MetricBox 
              label="Inhibitory Control" 
              value={`${(metrics.errorRate * 100).toFixed(1)}%`} 
              icon={<AlertTriangle className={cn(metrics.errorRate > 0.05 ? "text-orange-400/60" : "text-emerald-400/60")} />} 
              subtext="Corrective Motor Accuracy"
              info="Frequency of typos and deletions, reflecting a loss of fine motor inhibitory control."
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
                  <h2 className="text-2xl font-semibold mb-2">Mental Fatigue Scan</h2>
                  <p className="text-white/40 text-sm max-w-md mb-8">
                    Let's see if you're experiencing mental fatigue. First, we'll record your "Rested Beat," then we'll check your current rhythm.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                    <button 
                      onClick={() => startTest('baseline')}
                      className="flex-1 px-6 py-3 border border-white/10 hover:border-white/40 bg-white/5 hover:bg-white/10 transition-all font-mono text-xs tracking-widest uppercase flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={14} /> 1. Record Normal Beat
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
                      <Activity size={14} /> 2. Check My Sync
                    </button>
                  </div>
                  {!baselineData && (
                    <p className="text-[10px] uppercase tracking-widest text-orange-400/60 mt-4">
                      * Start with step 1 to establish your base beat
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

                  <div className="bg-white/5 p-4 border-l-2 border-blue-500/50 mb-4">
                    <p className="text-xs text-white/60 italic leading-relaxed">
                      {PASSAGES[testState === 'baseline' ? 0 : 1]}
                    </p>
                  </div>
                  
                  <div className="relative flex-1 flex flex-col">
                    <textarea
                      autoFocus
                      placeholder="Type continuously to provide enough telemetry data. Focus on speed and accuracy. You can type about your day or repeat the alphabet..."
                      className="flex-1 bg-black/40 border border-white/5 p-4 font-mono text-sm resize-none focus:outline-none focus:border-blue-500/30 relative z-10"
                      onKeyDown={onKeyDown}
                      onKeyUp={handleKeyUp}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />
                    
                    {/* Real-time Stability Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 z-20 flex px-1 gap-1">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <motion.div 
                          key={i}
                          className="flex-1 rounded-t-sm"
                          animate={{ 
                            height: metrics.rawFlightTimes.length > 5 
                              ? Math.max(2, (1 - (Math.abs(metrics.rawFlightTimes[metrics.rawFlightTimes.length - 1] - metrics.avgFlightTime) / (metrics.avgFlightTime || 1))) * 100) 
                              : 2,
                            backgroundColor: metrics.rawFlightTimes.length > 5 && Math.abs(metrics.rawFlightTimes[metrics.rawFlightTimes.length - 1] - metrics.avgFlightTime) > 50
                              ? '#f87171' 
                              : '#60a5fa'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-col gap-1">
                    <div className="flex justify-between text-[8px] font-mono opacity-30 uppercase tracking-[0.2em]">
                      <span>Buffer Latency</span>
                      <span>Capture Progress</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden flex">
                      <motion.div 
                        className="h-full bg-blue-500"
                        initial={{ width: "100%" }}
                        animate={{ width: `${(timeLeft / TEST_DURATION) * 100}%` }}
                        transition={{ duration: 1, ease: "linear" }}
                      />
                    </div>
                  </div>
                </motion.div>
              ) : testState === 'analyzing' ? (
                <motion.div 
                  key="analyzing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                  transition={{ duration: 0.5, ease: "circOut" }}
                  className="flex-1 flex flex-col items-center justify-center p-8 relative"
                >
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div 
                      className="w-full h-1 bg-blue-500/30 blur-sm absolute top-0"
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                  </div>

                  <div className="relative w-32 h-32 mb-8">
                    <motion.div 
                      className="absolute inset-0 border border-blue-500/20 rounded-full"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <motion.div 
                      className="absolute inset-3 border-2 border-dashed border-blue-500/40 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div 
                      className="absolute inset-6 border border-indigo-500/30 rounded-full"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Binary className="text-blue-500 w-10 h-10" />
                      </motion.div>
                    </div>
                  </div>
                  <motion.h3 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="font-mono text-xs tracking-[0.3em] text-blue-400 uppercase mb-3"
                  >
                    Consulting Hybrid Engine
                  </motion.h3>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-white/40 text-[10px] font-mono tracking-widest uppercase"
                  >
                    Running cross-matrix telemetry correlation...
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div 
                  key="finished"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="flex-1 overflow-y-auto custom-scrollbar"
                >
                  <div className="p-6">
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center justify-between mb-8 border-b border-white/5 pb-4"
                    >
                      <div>
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex items-center gap-3 mb-2"
                        >
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                          <span className="text-[10px] font-mono text-blue-400 tracking-[0.4em] uppercase">Neural Match Confirmed</span>
                        </motion.div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">Diagnostic Profile: {analysis?.primaryIndicator}</h2>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[9px] font-mono px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-sm">COMPUTATION: {analysis?.strategy}</span>
                          <span className="text-[9px] font-mono px-2 py-1 bg-white/5 text-white/40 border border-white/5 rounded-sm">REF: KINETIC-DELTA-IV</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => { setTestState('idle'); setAnalysis(null); }}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                      >
                        <RefreshCw size={20} className="text-white/40" />
                      </button>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <motion.div 
                         initial={{ opacity: 0, x: -20 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ duration: 0.5, delay: 0.3 }}
                         className="space-y-6"
                       >
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

                          <div className="p-3 border border-blue-500/10 bg-blue-500/5 rounded font-mono text-[9px] text-blue-300/40">
                             <p className="mb-1 border-b border-blue-500/10 pb-1 uppercase tracking-widest">Neural Watchdog Log</p>
                             <ul className="space-y-1">
                               <li>[SYS] Telemetry Pipeline: ACTIVE</li>
                               <li>[SYNC] Cognitive Sync: {Math.random() > 0.5 ? "STABLE" : "VAR_DETECTED"}</li>
                               <li>[KERNEL] Inference Method: {analysis?.strategy}</li>
                             </ul>
                          </div>

                          <button 
                            onClick={() => {
                              const data = {
                                profile: userProfile,
                                score: analysis?.fatigueScore,
                                baseline: baselineData,
                                current: currentData,
                                timestamp: new Date().toISOString()
                              };
                              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `fatigue_report_${userProfile}.json`;
                              a.click();
                            }}
                            className="w-full py-3 border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-mono uppercase tracking-[0.2em] transition-all"
                          >
                            Export Session Logs (.JSON)
                          </button>
                       </motion.div>

                       <motion.div 
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ duration: 0.5, delay: 0.4 }}
                         className="flex flex-col gap-6"
                       >
                         <div className="border border-blue-500/10 bg-blue-500/5 rounded p-4">
                           <NeuralTopology score={analysis?.fatigueScore || 0} />
                         </div>

                         <div className="h-[300px] border border-white/5 p-4 bg-black/20 rounded flex-1">
                          <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-4">Real-time Kinetic Stream (Dwell/Flight)</h4>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={(currentData?.rawDwellTimes || []).map((d, i) => {
                              const flights = currentData?.rawFlightTimes || [];
                              return { 
                                idx: i, 
                                dwell: d, 
                                flight: flights[i] || 0 
                              };
                            })}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                              <XAxis dataKey="idx" hide />
                              <YAxis hide domain={['auto', 'auto']} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                                itemStyle={{ color: '#fff' }}
                              />
                              <Line type="monotone" dataKey="dwell" stroke="#818cf8" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                              <Line type="monotone" dataKey="flight" stroke="#38bdf8" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Comparative Viz */}
        <div className="lg:col-span-4 space-y-6">
          <div className="data-grid-item bg-white/[0.02] border-white/5">
              <h3 className="font-mono text-[10px] tracking-widest uppercase text-white/40 mb-6 flex items-center gap-2">
                <Binary size={12} /> Mental Fatigue Assessment
              </h3>
              
              <div className="space-y-8">
                 <ComparisonProgress label="Dwell Latency Offset" baseline={baselineData?.avgDwellTime} current={metrics.avgDwellTime} />
                 <ComparisonProgress label="Flight Latency Offset" baseline={baselineData?.avgFlightTime} current={metrics.avgFlightTime} />
                 <ComparisonProgress label="Coeff. of Variance Offset" baseline={baselineData ? (baselineData.stdDevFlightTime / baselineData.avgFlightTime) * 100 : 0} current={(metrics.stdDevFlightTime / (metrics.avgFlightTime || 1)) * 100} />
              </div>

              <div className="mt-8 pt-8 border-t border-white/5">
                <h4 className="text-[10px] font-mono text-white/40 uppercase mb-4 tracking-widest">Recent Sessions</h4>
                <div className="space-y-2">
                  {history.length === 0 && <p className="text-[10px] font-mono text-white/20 italic">No history yet</p>}
                  {history.map(record => (
                    <div key={record.id} className="flex justify-between items-center p-2 bg-white/5 border border-white/5 rounded">
                      <div>
                        <p className="text-[10px] font-mono text-white/60">{record.timestamp}</p>
                        <p className="text-[8px] font-mono text-blue-400 uppercase">{record.indicator}</p>
                      </div>
                      <div className={cn("text-xs font-bold", record.score > 50 ? "text-red-400" : "text-green-400")}>
                        {record.score}%
                      </div>
                    </div>
                  ))}
                </div>
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

      {/* Unique Feature: Cognitive Calibration Pulse */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
        <AnimatePresence>
          {pulseMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20, x: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              className="bg-blue-600/20 backdrop-blur-xl border border-blue-400/30 px-6 py-3 rounded-sm shadow-[0_0_30px_rgba(59,130,246,0.2)]"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-blue-400 uppercase">
                  {pulseMessage}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={triggerPulse}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-700 relative bg-black border",
            (isPulsing || testState === 'analyzing' || isHeartbeat)
              ? "border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.5)]" 
              : "border-white/5 hover:border-blue-500/50"
          )}
        >
          <div className="absolute inset-0 rounded-full bg-blue-500/5 animate-pulse" />
          
          {(isPulsing || testState === 'analyzing' || isHeartbeat) ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: isHeartbeat ? 4 : 2, repeat: Infinity, ease: "linear" }}
            >
              <Brain className={cn("transition-colors duration-500", isHeartbeat ? "text-blue-500/60" : "text-blue-400")} size={24} />
            </motion.div>
          ) : (
            <Brain className="text-white/20 hover:text-blue-400 transition-colors" size={24} />
          )}
          
          {/* Animated rings */}
          {(isPulsing || testState === 'analyzing' || isHeartbeat) && (
            <>
              <motion.div 
                className="absolute inset-0 rounded-full border border-blue-500/50"
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: isHeartbeat ? 2 : 1.5, repeat: Infinity }}
              />
              <motion.div 
                className="absolute inset-0 rounded-full border border-blue-400/30"
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: isHeartbeat ? 2.5 : 2, delay: 0.5, repeat: Infinity }}
              />
            </>
          )}
        </motion.button>
        <span className="text-[8px] font-mono opacity-20 uppercase tracking-[0.4em] mr-1">Bio-Pulse</span>
      </div>
    </div>
  );
}

function MetricBox({ label, value, icon, subtext, info }: { label: string, value: string, icon: React.ReactNode, subtext: string, info?: string }) {
  return (
    <div className="data-grid-item group">
      <div className="flex items-center justify-between mb-4">
        {icon}
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono opacity-40 uppercase tracking-widest">{label}</span>
          {info && (
            <span className="cursor-help text-blue-400/40 hover:text-blue-400 transition-colors relative group/info">
              <Info size={10} />
              <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-[#121214] border border-blue-500/30 text-[9px] normal-case tracking-normal z-50 rounded hidden group-hover/info:block italic leading-relaxed shadow-2xl">
                {info}
              </div>
            </span>
          )}
        </div>
      </div>
      <div className="text-3xl font-bold tracking-tighter group-hover:translate-x-1 transition-transform">
        {value}
      </div>
      <p className="text-[10px] font-mono text-white/20 mt-2 uppercase">{subtext}</p>
    </div>
  );
}

function ComparisonProgress({ label, baseline, current, inverse = false }: { label: string, baseline?: number, current: number, inverse?: boolean }) {
  // Use absolute delta to prevent "negative" feelings in the UI as requested
  const rawDelta = baseline ? ((current - baseline) / baseline) * 100 : 0;
  const delta = Math.abs(rawDelta);
  const isWorse = inverse ? rawDelta < 0 : rawDelta > 15;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-mono uppercase tracking-widest">{label}</span>
        <span className={cn(
          "font-mono text-xs",
          !baseline ? "opacity-20" : isWorse ? "text-amber-400" : "text-blue-400"
        )}>
          {baseline ? `${delta.toFixed(1)}% SHIFT` : 'WAITING'}
        </span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          className={cn("h-full", isWorse ? "bg-amber-500" : "bg-blue-500")}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(delta + 5, 100)}%` }}
        />
      </div>
    </div>
  );
}
