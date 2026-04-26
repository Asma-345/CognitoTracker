# KINETIC-SCAN: Neurological Telemetry Interface
> **The Motor-Kinetic Sensory System for Cognitive Fatigue Detection**

[🚀 Live Interactive Demo](https://ais-pre-hcato2echpbpyohmo5hmgu-344601355778.asia-southeast1.run.app)

---

## 🔬 Project Overview
KINETIC-SCAN is a high-resolution diagnostic interface designed to detect sub-clinical neurological fatigue. By capturing keyboard interaction telemetry at 1000Hz, the system analyzes the "Kinetic Topology" of a user's motor-cortex execution. It measures synaptic latency (Dwell Time) and sequence processing (Flight Time) to identify cognitive drift before it becomes visible to the human eye.

## 🏗️ System Architecture: The Sensor-to-Neural Pipeline

### 1. The Kinetic Sensor (Front-End)
Built with **React 18** and **Framer Motion**, the front-end acts as a micro-precision kinetic sensor. It utilizes high-frequency event listeners to track millisecond-level variances in motor programs.

### 2. The Neural Coordinator (Back-End)
A **Node.js/Express** server acts as the central coordinator. It processes raw telemetry data into delta-metric arrays, comparing current motor output against a baseline homeostatic reference.

### 3. The Hybrid Analysis Engine
*   **Primary Engine:** Cloud-Tier AI (**Llama-3 via Groq Cloud**). The system pipes telemetry to a 70B neural model for deep-pattern recognition of motor-program degradation.
*   **Edge Fallback:** **Local Statistical Analytics**. In the absence of an API connection, the system utilizes a local heuristic engine to ensure zero-latency diagnostic continuity.

## 🧠 Diagnostic Indicators
*   **Flight Time Variance:** Indicates executive processing deceleration or "processing bottleneck."
*   **Dwell Time Delta:** Flags neuromuscular fatigue and motor-cortex slowing.
*   **Synaptic Jitter:** Measures rhythmic periodicity decomposition—a primary marker of acute cognitive fatigue.

---
**Developed by:** Asma & Team
**Application Version:** v2.5 (Professional Release)
