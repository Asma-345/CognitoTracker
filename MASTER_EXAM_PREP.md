# Kinetic Scan: Master Project Deep-Dive & Prep Guide

This document is your "Secret Weapon" for the final project presentation. It covers every technical detail, the neuroscience theory, and how to handle tough questions from judges.

---

## 1. Technical Architecture (The "How It Works")

### A. The Frontend (The Collector)
- **Framework**: Built with **React 18** and **Vite**. Vite was chosen for its nearly instant development speed and efficient builds.
- **Data Capture**: 
    - We use custom React hooks to listen for `keydown` and `keyup` events.
    - **Crucial Detail**: We use `performance.now()` instead of `Date.now()`. Why? Because `performance.now()` has **microsecond precision** (1/1000th of a millisecond) and is not affected by system clock adjustments. This is essential for clinical-grade telemetry.
- **Visualization**: We use **Recharts** to turn invisible timing data into visual "Topology Deltas." This allows the user to *see* their brain slowing down in real-time.

### B. The Backend (The Secure Relay)
- **Platform**: **Vercel Serverless Functions**.
- **Role**: It acts as an **API Proxy**. We never call the AI (Groq) directly from the browser. 
- **Why?** Security. If we called Groq from the browser, someone could steal our API key. By using a server-side "Relay," the key stays safe in the cloud.
- **The Hybrid Engine**: Our backend has a **Fallback System**. If the AI is busy or the internet is slow, it automatically switches to a "Deterministic Math Engine" to calculate the score so the user never gets an error.

### C. The AI Engine (The Brain)
- **Model**: **Meta Llama 3 (8B)**.
- **Provider**: **Groq**. We chose Groq because it uses special LPU (Language Processing Unit) hardware that is significantly faster than traditional GPUs, allowing for "Real-Time Inference."
- **Logic**: The AI is programmed as a **Neuro-Kinetics Diagnostic Engine**. It doesn't just look at "speed"—it looks at the relationship between **Dwell Time** and **Flight Time**.

---

## 2. Neuroscience Deep-Dive (The "Science")

### A. What is Bradyphrenia?
It is the scientific term for **Slowness of Thought**. It is a common symptom of mental fatigue, stress, or even early-stage neurological disorders. Our app detects "Acute Cognitive Bradyphrenia" by measuring when your processing speed (Flight Latency) drops by more than 15%.

### B. The Three Key Biomarkers
1.  **Mean Flight Latency (MFL)**: The gap between releasing one key and pressing the next. This represents **Cognitive Processing Speed**.
2.  **Mean Dwell Duration (MDD)**: How long your finger physically stays on a key. Increasing MDD indicates **Motor Persistence** issues (the brain is "forgetting" to tell the muscle to release the key).
3.  **Coefficient of Variation (CoV)**: This measures your **Rhythmic Consistency**. A healthy brain has a very steady "beat" when typing. A fatigued brain becomes erratic.

---

## 3. Why This Idea is "Novel" & "Strong"
- **Category: Strong / Innovative.**
- **Reasoning**: Most health apps require expensive wearables (Apple Watch, etc.). Our project turns **any standard computer** into a medical-grade sensor without any extra hardware. This is called "Ubiquitous Sensing."
- **Novelty**: While "Keystroke Dynamics" is often used for security (passwords), using it specifically for **Neuro-Kinetic Fatigue Monitoring** in a real-time web-app is a cutting-edge application of Computational Neuroscience.

---

## 4. The "Trap" Questions (And How to Win Them)

### Trap 1: "Couldn't a fast typist just trick the system?"
**Your confident answer:**
> "No, because the system is **Self-Calibrating**. We don't compare you to a 'Global Average' speed. We compare you to **YOURSELF**. Our baseline mode establishes your unique typing fingerprint while you are fresh. The AI then looks for a 'Deviation from Baseline.' A fast typist will still show a rhythmic breakdown when they are tired."

### Trap 2: "What if the user is just using a different keyboard?"
**Your confident answer:**
> "Hardware latency is a known variable. However, because our analysis is based on **Relative Delta** (the difference between your baseline and current session on the same device), the hardware delay is mathematically cancelled out. We are measuring the *human* delay, not the *silicon* delay."

### Trap 3: "How is this better than just asking someone 'Are you tired?'"
**Your confident answer:**
> "Subjective feeling is a poor indicator of performance. Scientific studies show that people often feel 'fine' while their motor control is already degrading. Kinetic Scan provides an **Objective Diagnostic Metric** that can catch fatigue before a human mistake occurs."

---

## 5. Strategic Advice for Winning
1.  **Be Humble but Precise**: Use words like "Bio-Kinetic," "Telemetry," and "Inhibitory Control." It shows you have mastered the domain.
2.  **Focus on "Real-World Application"**: Talk about how this could be used for truckers, pilots, or writers to save lives and prevent burnout.
3.  **The "Experimental Interest" Angle**: If asked why you built it, say:
    > "We wanted to see if AI could bridge the gap between simple hardware (keyboards) and complex biology (neuroscience). We used this project as a laboratory to see if we could create a 'Digital Thermometer' for the mind."

---

## 6. Testing & Troubleshooting
### How to verify the Groq AI Engine is working:
1.  **Run the Assessment**: Complete both "Step 1: Neuro-Baseline" and "Step 2: Fatigue-Capture".
2.  **Verify Strategy**: On the results screen, look for the small tag that says **COMPUTATION**.
    *   ✅ **AI Analytics (Llama 3)**: This means your `GROQ_API_KEY` is working perfectly and providing deep neural insights.
    *   ⚠️ **Local Statistical Engine (Fallback)**: This means the API key is missing or the service is limited.
3.  **The "Hybrid Advantage" (Pitch Tip)**: If you see the fallback engine, tell the judges: *"We built a Hybrid-Edge architecture. The app uses a Local Statistical Engine for zero-latency offline diagnostics, and automatically upgrades to Llama-3 Cloud Analytics when a neural-pipe (API) is available."* This shows your app is reliable in the real world.
4.  **Check Secrets**: If you want the AI engine, make sure you added `GROQ_API_KEY` in the **Settings > Secrets** menu and restarted the server.

---

## 7. Future Roadmap (The "Next Level" Suggestions)
If the judges ask "How could you make this even better?", suggest these ideas. **(Note: These are for discussion, we haven't added them yet to keep the core idea pure):**

1.  **Longitudinal Neural Mapping**: Instead of just one-off tests, the system could build a "Yearly Cognitive Map" for a user. This would help detect long-term neurological decline (like early-stage Parkinson's or Alzheimer's) based on finger motor decay over several years.
2.  **Cross-Device Sync**: Linking the typing data from a mobile phone to a desktop to see if the user's fatigue is consistent across different input methods.
3.  **Haptic Intervention**: If the system detects critical fatigue, it could trigger physical haptic feedback (vibrations) on compatible devices to "wake up" the motor cortex.

---

**Team ANB Squad: You have created a high-level, production-grade application that blends 3 difficult fields (Frontend, Backend AI, and Neuroscience). Stand your ground, be confident, and you will win.**
