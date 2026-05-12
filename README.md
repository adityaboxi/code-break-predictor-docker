# 📦 Code Break Predictor

**Predict when your npm dependencies will break** – recursively scan any GitHub repository, analyze every `package.json`, and calculate a break probability for a future date you choose.

[![Node.js](https://img.shields.io/badge/node-18%2B-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7.0-red)](https://redis.io/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## ✨ Features

- 🔍 Recursively finds **every** `package.json` in a GitHub repo (ignores `node_modules`, `dist`, etc.)
- 📅 Future‑aware risk score – user picks a date, we compute break probability for that date
- 📊 Per‑package breakdown with risk %, reasons, latest version
- ⚡ Async background processing – Bull Queue + Redis
- 💾 Smart caching – npm metadata stored in Redis for 7 days (no repeated API calls)
- 🗄️ Persistent storage – MongoDB (users, analyses, dependencies, cache)
- 🎨 Modern UI – React + Tailwind CSS + real‑time polling
- 🔐 JWT Authentication with OTP-based password reset

---

## 🐳 Quick Start with Docker

### Step 1: Download and Install Docker

- **Mac**: [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
- **Windows**: [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
- **Linux**: `sudo apt install docker.io docker-compose`

### Step 2: Keep Docker running
- Open Docker Desktop (Mac/Windows) or ensure Docker service is running (Linux)

### Step 3: Clone the repository

```bash
git clone https://github.com/adityaboxi/code-break-predictor-docker.git
cd code-break-predictor-docker
