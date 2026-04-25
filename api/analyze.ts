import { VercelRequest, VercelResponse } from '@vercel/node';
import Groq from "groq-sdk";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { baseline, current } = req.body;

  if (!baseline || !current) {
    return res.status(400).json({ error: "Missing telemetry data" });
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  let strategy = "AI Neural Engine (Llama 3)";
  let result;

  try {
    if (!groqApiKey) {
      throw new Error("GROQ_API_KEY not configured");
    }

    const groq = new Groq({ apiKey: groqApiKey });

    const prompt = `
      You are a Neuro-Kinetics Diagnostic Engine. Analyze the following high-resolution keystroke dynamics telemetry for indicators of acute cognitive fatigue and motor program degradation.
      
      BASELINE (Rested/Asymptomatic):
      - Mean Flight Latency (MFL): ${baseline.avgFlightTime.toFixed(2)}ms
      - Mean Dwell Duration (MDD): ${baseline.avgDwellTime.toFixed(2)}ms
      - MFL Variation (SD): ${baseline.stdDevFlightTime.toFixed(2)}ms
      - MDD Variation (SD): ${baseline.stdDevDwellTime.toFixed(2)}ms
      - Error Correction Rate: ${(baseline.errorRate * 100).toFixed(2)}%
      
      CURRENT (Capture Window):
      - Mean Flight Latency (MFL): ${current.avgFlightTime.toFixed(2)}ms 
      - Mean Dwell Duration (MDD): ${current.avgDwellTime.toFixed(2)}ms
      - MFL Variation (SD): ${current.stdDevFlightTime.toFixed(2)}ms
      - MDD Variation (SD): ${current.stdDevDwellTime.toFixed(2)}ms
      - Error Correction Rate: ${(current.errorRate * 100).toFixed(2)}%
      
      CLINICAL MARKERS:
      1. Bradyphrenia: Indicated by significant >15% increase in MFL (processing slowdown).
      2. Motor Persistence: MDD increase >10% correlates with peripheral neural fatigue.
      3. Rhythmic Decomposition: Increase in Coefficient of Variation of MFL (>15%) suggests central executive fatigue.
      4. Inhibitory Control failure: Elevated error rates indicate sustained attention lapses.

      Return a JSON report with zero conversational filler:
      {
        "fatigueScore": number (0-100),
        "primaryIndicator": "Clinical Term",
        "scientificSummary": "Concise neuro-kinetic diagnostic summary referencing metrics.",
        "recommendation": "Prescriptive operational safety advice."
      }
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a professional neuro-ergonomics analyst specializing in motor kinetics and cognitive load assessment. Your tone is clinical, precise, and objective." }, 
        { role: "user", content: prompt }
      ],
      model: "llama3-8b-8192",
      response_format: { type: "json_object" },
    });

    result = JSON.parse(chatCompletion.choices[0]?.message?.content || "{}");
  } catch (error) {
    strategy = "Stat-Kinetics-Engine v3.1 (Deterministic Fallback)";
    const dDelta = (current.avgDwellTime - baseline.avgDwellTime) / baseline.avgDwellTime;
    const fDelta = (current.avgFlightTime - baseline.avgFlightTime) / baseline.avgFlightTime;
    const stdDevFlightDelta = (current.stdDevFlightTime - baseline.stdDevFlightTime) / (baseline.stdDevFlightTime || 1);
    const eDelta = current.errorRate - baseline.errorRate;

    let score = 0;
    let primaryIndicator = "Metric Equilibrium";
    
    score += Math.max(0, fDelta * 150); 
    score += Math.max(0, dDelta * 100); 
    score += Math.max(0, stdDevFlightDelta * 120); 
    score += Math.max(0, eDelta * 200); 

    score = Math.min(Math.max(Math.round(score), 0), 100);

    if (score > 70) primaryIndicator = "Ataxia-type Rhythmic Decomposition";
    else if (score > 40) primaryIndicator = "Sub-Acute Cognitive Bradyphrenia";
    else if (score > 15) primaryIndicator = "Minimal Regulatory Shift";

    result = {
      fatigueScore: score,
      primaryIndicator: primaryIndicator,
      scientificSummary: `Analysis detected a ${Math.abs(Math.round(fDelta * 100))}% shift in processing latency and a ${Math.abs(Math.round(stdDevFlightDelta * 100))}% deviation in rhythmic consistency.`,
      recommendation: score > 50 
        ? "Critical degradation of motor programs detected. Safety rest recommended." 
        : "Metrics consistent with baseline parameters."
    };
  }

  res.status(200).json({ ...result, strategy });
}
