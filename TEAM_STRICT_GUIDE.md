# Kinetic Scan: The "Brain Fatigue" Project Guide

This guide is for **Team ANB Squad** to understand exactly how our project works, from the code to the neuroscience.

---

## 1. The "Elevator Pitch" (Simple Summary)
**What is Kinetic Scan?**
It is a health-tech tool that detects if your brain is tired just by watching how you type. We don't use a camera; we only use the **timing** of your keys.

**The Problem:** People in dangerous jobs (pilots, surgeons, or even students) don't always realize their brain is slowing down until they make a mistake.
**The Solution:** Kinetic Scan acts like a "thermometer" for your brain. It measures your typing speed and rhythm, sends it to an AI, and tells you: *"You are 80% fatigued. Take a 10-minute break."*

---

## 2. The Neuroscience (The "Why")
When your brain gets tired, your **motor control** (how you move your fingers) is the first thing to degrade. Specifically, we look for **Acute Cognitive Bradyphrenia** (mental slowing).

**Key Markers we measure:**
1.  **Mean Flight Latency (MFL):** This is the time *between* keys. If this gets longer, your brain is taking more time to plan the next move.
2.  **Mean Dwell Duration (MDD):** This is how long you hold a key down. If you start "lingering" on keys, it shows your muscles are losing their sharp response.
3.  **Coefficient of Variation (CoV):** This measures **Rhythm**. A "fresh" brain is rhythmic. A "tired" brain is erratic (sometimes fast, sometimes slow).

---

## 3. How the "SystemOutestcher" Works (The "How")
In our project, we have a module called `SystemOutestcher`. 
- **Think of it as a referee.** 
- It sits inside the browser and uses a tool called `performance.now()`. 
- Most clocks in computers are a bit "blurry," but `performance.now()` is sharp down to the **microsecond**. This allows us to catch the tiny, invisible delays in your fingers that a human wouldn't notice.

---

## 4. The AI Integration (The "Brain")
We use **Llama 3** running on a platform called **Groq**. 

**Why Groq?** 
Because it is ultra-fast. We need the analysis to happen in "Real-Time" (<200ms). If it takes 5 seconds, the user has already moved on.

**What the AI does:**
- It doesn't just look at numbers. It looks at **patterns**. 
- It compares your "Calibration" (how you typed when you were fresh) to your "Live Typing." 
- It looks for "Rhythmic Decomposition"—which is a fancy way of saying your typing rhythm is falling apart.

---

## 5. Potential Exam/Interview Questions & Answers

**Q: Why use Keyboard data instead of a Heart Rate monitor?**
*A: Because everyone has a keyboard in front of them! It’s "Passive" and "Non-Invasive." You don’t need to wear a chest strap or a watch to see if your brain is tired while you work.*

**Q: How do you know the data is accurate?**
*A: We use High-Resolution telemetry hooks. We aren't measuring "seconds"; we are measuring "milliseconds." These tiny variations are scientifically proven to correlate with cognitive load.*

**Q: Is the user's data safe?**
*A: Yes. We don't send *what* you type (the letters) to the AI. We only send the *timing* (the numbers). Even if someone stole the data, they wouldn't know what you wrote; they'd just see a list of time gaps.*

**Q: Why call it "Kinetic Scan"?**
*A: "Kinetic" refers to motion (finger movement) and "Scan" refers to our AI analyzing those movements like a medical scanner.*

---

## 6. How to explain "Computational Neuroscience"
If the instructor asks why you used this complicated field:
> *"We were fascinated by the idea that our digital footprint (how we interact with devices) actually mirrors our mental health. We wanted to see if we could turn a regular laptop into a diagnostic tool. It started as a 'what if' experiment, and it turned into Kinetic Scan."*

---

## 7. Tech Specs for the Report
- **Frontend:** React 18 & Vite (for speed).
- **Styling:** Tailwind CSS (for a "Cyber-Scientific" look).
- **Backend:** Vercel Serverless (to keep our AI keys hidden and safe).
- **AI:** Groq Llama 3 (The fastest AI inference engine available).
- **Graphs:** Recharts (So users can *see* their fatigue trend).
- **Kinetic Sonic Interface:** We added a real-time audio-visual feedback system. Every keystroke generates a "Neuro-Tick" (sound pulse) and a "Kinetic Ripple" (visual wave). This isn't just for show—it helps the user maintain a rhythmic baseline during testing.
- **Cyber-Diagnostic Chime:** When the analysis is complete, a 3-stage digital chime plays, followed immediately by the "Neural Match" diagnostic report.

---
## 8. Neuro-Feedback System
- **Real-time Stability Gauge:** During the test, a stability bar fluctuates at the bottom of the input field. It vishualizes the "rhythm" of the motor cortex in real-time based on variance from the mean flight latency.
- **Kinetic Ripples:** A visual representation of neural energy. Each keystroke creates a ripple that propagates through the interface, emphasizing the "Kinetic" nature of the telemetry.
- **The Chime:** A 3-tone harmonic sequence (880Hz -> 1320Hz -> 1760Hz) that announces the final assessment results and triggers the display of the diagnostic profile.

---
## 9. How to Explan the "Bio-Pulse" to Judges
If the judges ask: "What is that brain button in the corner?"
- **The Pitch:** "It's a Neurological Synchronizer. While other apps just measure fatigue, we provide a tool for 'Cognitive Reset'."
- **The Science:** "It uses a 432Hz sine-wave resonance. In neuroscience, this frequency is often associated with the Alpha-state (relaxed focus). If the user detects high fatigue in their test, they can use the Bio-Pulse to 'refresh' their motor-cortex baseline."
- **Autonomous Intelligence:** "Notice how it pulses even when idle? This represents the 'Neural Watchdog'—a persistent background process that monitors system stability and synaptic coherence without needing manual input. It makes the diagnostic engine feel 'alive' and constantly vigilant."
- **The Integration:** "During analysis, the heartbeat intensity increases, representing the Llama-3 AI Engine physically mapping the user's synaptic latency in real-time."

---
**Team Lead Note:** Asma, share this with the team. Once everyone reads this, you will all be speaking the same scientific language!
