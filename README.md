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

## 🧠 How It Works (Architecture)

### 1. User submits a GitHub URL + future date
- Frontend sends a `POST /api/analysis/start` request.
- Backend creates a **Bull job**, stores it in Redis, and returns a job ID immediately (<200 ms).
- User sees "Analysis started" and a progress bar that polls every 3 seconds.

### 2. Background worker processes the job
- Uses GitHub's **recursive tree API** to fetch the entire file list of the repo.
- Filters for all `package.json` files (ignores `node_modules`, `dist`, `build`).
- For each `package.json`, extracts `dependencies` and `devDependencies`.
- For every dependency, fetches live metadata from the **npm registry** (latest version, last publish date, deprecation flag, download counts).

### 3. Risk engine calculates break probability for the **future date**
- **Deprecation** → +40% if marked deprecated.
- **Staleness** → months since last publish: +10% (6‑12 months), +20% (1‑2 years), +30% (>2 years).
- **Version gap** → each major version behind adds +10% (up to +35%).
- **Future multiplier** → `multiplier = 1 + min(yearsToFuture × 0.15, 0.3)`.  
  Example: 2 years → multiplier = 1.30 → risk increased by 30%.
- **Final risk** = (deprecation + staleness + version gap) × multiplier, capped at 100%.

### 4. Results are stored and displayed
- Each dependency's risk percentage, level (high/medium/low), and reasons are saved to **MongoDB**.
- Redis caches npm metadata for 7 days to avoid repeated API calls.
- Frontend polls `/api/analysis/status/:id` until completion, then fetches `/api/analysis/results/:id` to show the per‑package breakdown.

---

## 🛠️ Tech Stack

| Area | Package | Documentation |
|------|---------|---------------|
| **Backend** | Express | [expressjs.com](https://expressjs.com) |
| | Mongoose | [mongoosejs.com](https://mongoosejs.com) |
| | Bull | [github.com/OptimalBits/bull](https://github.com/OptimalBits/bull) |
| | ioredis | [github.com/luin/ioredis](https://github.com/luin/ioredis) |
| | Axios | [axios-http.com](https://axios-http.com) |
| | bcryptjs | [github.com/dcodeIO/bcrypt.js](https://github.com/dcodeIO/bcrypt.js) |
| | jsonwebtoken | [github.com/auth0/node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) |
| | Nodemailer | [nodemailer.com](https://nodemailer.com) |
| **Frontend** | React | [react.dev](https://react.dev) |
| | Vite | [vitejs.dev](https://vitejs.dev) |
| | Tailwind CSS | [tailwindcss.com](https://tailwindcss.com) |
| | React Router DOM | [reactrouter.com](https://reactrouter.com) |
| | Zustand | [github.com/pmndrs/zustand](https://github.com/pmndrs/zustand) |
| **Databases** | MongoDB | [mongodb.com](https://www.mongodb.com) |
| | Redis | [redis.io](https://redis.io) |

---

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Redis (local)

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/adityaboxi/code-break-predictor-docker.git
cd code-break-predictor-docker





# 🐳 Code Break Predictor - Docker Setup

**Predict when your npm dependencies will break** – run the entire application (MongoDB, Redis, Node.js backend, React frontend) with just one command using Docker.

---

## 📋 Prerequisites

Before you begin, make sure you have Docker installed on your system:

| Platform | Download Link | Instructions |
|----------|--------------|--------------|
| **Windows** | [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/) | Run the installer, restart your computer |
| **macOS** | [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/) | Drag Docker to Applications folder |
| **Linux (Ubuntu/Debian)** | [Docker Engine for Linux](https://docs.docker.com/engine/install/ubuntu/) | Run: `sudo apt install docker.io docker-compose` |
| **Linux (Fedora/RHEL)** | [Docker Engine for Linux](https://docs.docker.com/engine/install/fedora/) | Run: `sudo dnf install docker docker-compose` |

---

## 🚀 Quick Start (7 Steps)

### Step 1: Download and Install Docker

1. Go to [Docker.com](https://www.docker.com/products/docker-desktop/)
2. Download Docker Desktop for your operating system
3. Install Docker (follow the installation wizard)
4. **Restart your computer** after installation

### Step 2: Keep Docker running

- **Windows/macOS**: Open Docker Desktop application (wait for it to show "Docker is running")
- **Linux**: Run `sudo systemctl start docker` and `sudo systemctl enable docker`

### Step 3: Clone the repository

```bash
git clone https://github.com/adityaboxi/code-break-predictor-docker.git
cd code-break-predictor-docker
