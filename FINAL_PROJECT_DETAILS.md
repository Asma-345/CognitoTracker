# Project Submission Details: Kinetic Scan

## 1. Team & Project Information
*   **Team Name**: [ANB sqaud]
*   **Team Lead**: [Asma Khalid]
*   **Project Name**: Kinetic Scan (Neuro-Kinetic Fatigue Monitor)

## 2. Problem Statement
In high-stakes environments (aviation, medical surgery, critical coding), there is no objective, non-invasive way to measure "Cognitive Readiness" in real-time. Subjective self-tests are unreliable. Kinetic Scan solves this by using "Digital Biomarkers"—the subtle timing patterns in how you type—to detect the exact moment your brain begins to slow down due to fatigue (Acute Cognitive Bradyphrenia), allowing for preemptive safety breaks.

## 3. Frontend Details
*   **Framework**: React 18, Vite, TypeScript.
*   **Styling**: Tailwind CSS (Custom "Cyber-Scientific" Theme).
*   **Core Logic**: Uses high-resolution `performance.now()` hooks to capture inter-key flight latency and key-hold dwell times with millisecond precision (<1ms accuracy).

## 4. AI Integration (12 Lines Summary)
Kinetic Scan leverages the Groq SDK and the Llama 3 model (Llama3-8b-8192) to perform real-time neurological assessment. The system transforms raw timing data (Flight Latency, Dwell Duration, and Rhythmic Jitter) into a structured prompt for the AI. Instead of simple data visualization, the AI acts as a virtual Neuro-Ergonomist. It specifically analyzes clinical markers such as "Rhythmic Decomposition" (the loss of typing rhythm) and "Motor Persistence" (muscular fatigue). The model compares a user's live performance against their unique calculated baseline to determine a 0-100 Fatigue Score. By utilizing Groq’s ultra-low latency inference, the app provides a clinical-grade scientific summary and safety recommendations in under 200ms. This enables a sophisticated diagnostic feedback loop that would be impossible with traditional hard-coded logic.

## 5. System Design (ByteByteGo Reference)
1. **Collector**: React Hook listens to DOM keyboard events.
2. **Buffer**: Metrics computed locally (MFL, MDD, CoV) to minimize payload size.
3. **Endpoint**: Vercel Serverless Function (Node.js) handles authentication and analysis routing.
4. **Logic**: Hybrid engine (AI Neural Inference + Statistical Fallback).
5. **Insights**: Recharts rendering for real-time comparative visualization.

## 6. Deployment & Repository
*   **GitHub**: [Insert Your Repository Link]
*   **Live Demo**: https://kinetic-scan.vercel.app (Example)
