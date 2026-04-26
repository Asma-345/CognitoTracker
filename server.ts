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
        You are a friendly AI Typing Coach. Analyze these two typing sessions to see how focused the student is.
        
        SESSION 1 (Rested/Normal):
        - Key Press Speed: ${baseline.avgDwellTime.toFixed(2)}ms
        - Thinking Gaps: ${baseline.avgFlightTime.toFixed(2)}ms
        - Rhythm Consistency: ${baseline.stdDevFlightTime.toFixed(2)}ms
        
        SESSION 2 (Recent Performance):
        - Key Press Speed: ${current.avgDwellTime.toFixed(2)}ms
        - Thinking Gaps: ${current.avgFlightTime.toFixed(2)}ms
        - Rhythm Consistency: ${current.stdDevFlightTime.toFixed(2)}ms
        
        Compare these sets. If the Thinking Gaps or Rhythm Consistency numbers are much higher in Session 2, the student is likely getting tired or distracted.
        
        Return a JSON response using simple, encouraging language:
        {
          "fatigueScore": number (0-100, where 100 is very tired),
          "primaryIndicator": string (e.g., "Slower Thinking Gaps", "Stable Rhythm", "Fast Fingers"),
          "scientificSummary": string (1-2 sentences explaining why the score is what it is in simple terms),
          "recommendation": string (actionable student advice like "Take a 5-minute water break" or "You're in the flow zone!")
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
        indicators.push("Neuromuscular Slowing");
      } else if (dwellTimeDelta > 0.05) {
        score += 15;
      }

      // Flight time: Processing lag
      if (flightTimeDelta > 0.20) {
        score += 30;
        indicators.push("Cognitive Processing Latency");
      } else if (flightTimeDelta > 0.10) {
        score += 15;
      }

      // Variance: Loss of rhythmic control (CRITICAL)
      if (stdDevFlightDelta > 0.30) {
        score += 30;
        indicators.push("Rhythmic Decomposition");
      } else if (stdDevFlightDelta > 0.15) {
        score += 15;
      }

      // Error Rate
      if (errorRateDelta > 0.10) {
        score += 20;
        indicators.push("Inhibitory Control Loss");
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
