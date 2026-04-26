import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Hybrid Analysis Engine
  app.post("/api/analyze", async (req, res) => {
    const { baseline, current } = req.body;

    if (!baseline || !current) {
      return res.status(400).json({ error: "Missing telemetry data" });
    }

    // Enhanced Key Discovery (checks for various naming conventions)
    const groqApiKey = process.env.GROQ_API_KEY || 
                       process.env.VITE_GROQ_API_KEY || 
                       process.env.GROQ_KEY ||
                       process.env.API_KEY;

    console.log(`[DEBUG] Neural Neural-Pipe Check:`);
    console.log(` - GROQ_API_KEY: ${process.env.GROQ_API_KEY ? "CONFIGURED" : "MISSING"}`);
    console.log(` - VITE_GROQ_API_KEY: ${process.env.VITE_GROQ_API_KEY ? "CONFIGURED" : "MISSING"}`);
    
    let strategy = "AI Analytics (Llama 3)";
    let result;

    try {
      if (!groqApiKey) {
        throw new Error("GROQ_API_KEY not configured");
      }

      const groq = new Groq({ apiKey: groqApiKey });

      const prompt = `
        You are an Advanced AI Mental Fatigue Analyst. Analyze these two motor-kinetic telemetry datasets to detect cognitive exhaustion and mental fatigue patterns.
        
        BASELINE (Normal State):
        - Avg Flight Latency: ${baseline.avgFlightTime.toFixed(2)}ms (latency between sequences)
        - Avg Dwell Latency: ${baseline.avgDwellTime.toFixed(2)}ms (key strike duration)
        - Coeff. of Variance (Flight): ${baseline.stdDevFlightTime.toFixed(2)}ms (rhythmic consistency)
        
        CURRENT (Capture State):
        - Avg Flight Latency: ${current.avgFlightTime.toFixed(2)}ms 
        - Avg Dwell Latency: ${current.avgDwellTime.toFixed(2)}ms
        - Coeff. of Variance (Flight): ${current.stdDevFlightTime.toFixed(2)}ms
        
        Fatigue Indicators:
        1. Higher Flight Latency = Slower executive processing.
        2. Higher Dwell Latency = Neuromuscular slowing (tired muscles).
        3. Higher Coeff. of Variance = Rhythmic decomposition (brain-finger desync).
        
        Return a JSON response using professional terminology (Latency, Flight, Dwell, Control, Variance):
        {
          "fatigueScore": number (0-100),
          "primaryIndicator": string (e.g., "Rhythmic Jitter Detected", "Processing Latency Increase", "Steady Baseline"),
          "scientificSummary": string (1-2 sentences explaining how the motor-kinetic deltas indicate current cognitive state),
          "recommendation": string (actionable advice)
        }
      `;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "system", content: "You are a professional neuro-ergonomics analyst specializing in motor kinetics and cognitive load assessment." }, { role: "user", content: prompt }],
        model: "llama3-8b-8192",
        response_format: { type: "json_object" },
      });

      result = JSON.parse(chatCompletion.choices[0]?.message?.content || "{}");
    } catch (error) {
      // Fallback Strategy: Local Statistical Algorithm
      strategy = "Local Edge Analytics (Hybrid-Safe)";
      console.warn("Groq API failed or restricted, using hybrid fallback:", error);

      const dwellTimeDelta = (current.avgDwellTime - baseline.avgDwellTime) / baseline.avgDwellTime;
      const flightTimeDelta = (current.avgFlightTime - baseline.avgFlightTime) / baseline.avgFlightTime;
      const stdDevFlightDelta = (current.stdDevFlightTime - baseline.stdDevFlightTime) / (baseline.stdDevFlightTime || 1);
      const errorRateDelta = current.errorRate - baseline.errorRate;

      let score = 0;
      let indicators = [];

      // Dwell time: Muscles/nerves slow down
      if (dwellTimeDelta > 0.15) {
        score += 35;
        indicators.push("Dwell Latency Drift");
      } else if (dwellTimeDelta > 0.05) {
        score += 15;
      }

      // Flight time: Processing lag
      if (flightTimeDelta > 0.20) {
        score += 30;
        indicators.push("Flight Latency Increase");
      } else if (flightTimeDelta > 0.10) {
        score += 15;
      }

      // Variance: Loss of rhythmic control (CRITICAL)
      if (stdDevFlightDelta > 0.30) {
        score += 30;
        indicators.push("Coeff. of Variance Shift");
      } else if (stdDevFlightDelta > 0.15) {
        score += 15;
      }

      // Error Rate
      if (errorRateDelta > 0.10) {
        score += 20;
        indicators.push("Inhibitory Control Failure");
      }

      score = Math.min(Math.max(Math.round(score), 0), 100);

      result = {
        fatigueScore: score,
        primaryIndicator: indicators[0] || "Homeostatic Stability",
        scientificSummary: `Kinetics analysis indicates a ${Math.abs(Math.round(stdDevFlightDelta * 100))}% shift in rhythmic variability and ${Math.abs(Math.round(flightTimeDelta * 100))}% deviation in processing latency.`,
        recommendation: score > 50 ? "Significant cognitive fatigue detected. Cease critical tasks immediately." : "Motor kinetics remain within baseline parameters."
      };
    }

    res.json({ ...result, strategy });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
