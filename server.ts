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

    const groqApiKey = process.env.GROQ_API_KEY;
    let strategy = "AI Analytics (Llama 3)";
    let result;

    try {
      if (!groqApiKey) {
        throw new Error("GROQ_API_KEY not configured");
      }

      const groq = new Groq({ apiKey: groqApiKey });

      const prompt = `
        Analyze these two sets of keystroke dynamics data to detect cognitive fatigue.
        
        BASELINE (Rested):
        - Avg Flight Time: ${baseline.avgFlightTime.toFixed(2)}ms
        - Avg Dwell Time: ${baseline.avgDwellTime.toFixed(2)}ms
        - Error Correction Rate: ${(baseline.errorRate * 100).toFixed(2)}%
        
        CURRENT (Potential Fatigue):
        - Avg Flight Time: ${current.avgFlightTime.toFixed(2)}ms
        - Avg Dwell Time: ${current.avgDwellTime.toFixed(2)}ms
        - Error Correction Rate: ${(current.errorRate * 100).toFixed(2)}%
        
        Return ONLY a JSON response in this format:
        {
          "fatigueScore": number (0-100),
          "primaryIndicator": string,
          "scientificSummary": string,
          "recommendation": string
        }
      `;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama3-8b-8192",
        response_format: { type: "json_object" },
      });

      result = JSON.parse(chatCompletion.choices[0]?.message?.content || "{}");
    } catch (error) {
      // Fallback Strategy: Local Statistical Algorithm
      strategy = "Local Statistical Engine (Fallback)";
      console.warn("Groq API failed or restricted, using fallback engine:", error);

      // Scientific heuristic: Fatigue typically increases dwell time and error rates
      // Flight time variance usually increases (slower responses)
      const dwellTimeDelta = (current.avgDwellTime - baseline.avgDwellTime) / baseline.avgDwellTime;
      const flightTimeDelta = (current.avgFlightTime - baseline.avgFlightTime) / baseline.avgFlightTime;
      const errorRateDelta = current.errorRate - baseline.errorRate;

      let score = 0;
      let indicators = [];

      // Dwell time: Muscles/nerves slow down, keys held longer
      if (dwellTimeDelta > 0.15) {
        score += 40;
        indicators.push("Significant Dwell Time Increase");
      } else if (dwellTimeDelta > 0.05) {
        score += 15;
        indicators.push("Moderate Dwell Time Increase");
      }

      // Flight time: Processing lag between thoughts/actions
      if (flightTimeDelta > 0.20) {
        score += 35;
        indicators.push("High Cognitive Latency");
      } else if (flightTimeDelta > 0.10) {
        score += 15;
        indicators.push("Mild Latency");
      }

      // Error Rate: Loss of inhibitory control / focus
      if (errorRateDelta > 0.10) {
        score += 25;
        indicators.push("Elevated Error Correction");
      }

      score = Math.min(Math.max(Math.round(score), 0), 100);

      result = {
        fatigueScore: score,
        primaryIndicator: indicators[0] || "Stable Metrics",
        scientificSummary: `Statistical analysis detected a ${Math.abs(Math.round(dwellTimeDelta * 100))}% shift in dwell times and ${Math.abs(Math.round(flightTimeDelta * 100))}% shift in flight latency compared to baseline environment.`,
        recommendation: score > 50 ? "High fatigue detected. Immediate cognitive rest suggested." : "Metrics remain within safe operational bounds."
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
