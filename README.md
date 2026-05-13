# 🚀 Code Break Predictor — Beginner Setup Guide

Run the app on your laptop in under 10 minutes. No coding experience needed.

---

## What You'll Need

- A laptop running **Mac, Windows, or Linux**
- An internet connection (to download Docker and the app)
- A **SendGrid account** for email features (free tier works)

---

## Step 1 — Install Docker

Docker is the only software you need to install. It runs the entire app for you.

**Mac**
1. Go to [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Download **Docker Desktop for Mac** and open the `.dmg` file
3. Drag the Docker icon into your **Applications** folder
4. Open Docker Desktop from Applications
5. Wait until you see **"Docker is running"** in the menu bar

**Windows**
1. Go to [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Download **Docker Desktop for Windows** and run the installer
3. **Restart your computer** after installation
4. Open Docker Desktop and wait for it to start

**Linux (Ubuntu/Debian)**
```bash
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
```

> ✅ **How to confirm Docker is working:** Open Terminal and run `docker --version`. You should see a version number like `Docker version 24.x.x`.

---

## Step 2 — Get a SendGrid API Key (for emails)

The app sends emails (e.g. password reset). SendGrid has a free plan.

1. Go to [https://sendgrid.com](https://sendgrid.com) and create a free account
2. After logging in, go to **Settings → API Keys**
3. Click **Create API Key** → give it any name → choose **Full Access**
4. Copy the key — it starts with `SG.` — and save it somewhere safe (you won't see it again)
5. Go to **Settings → Sender Authentication** and verify the email address you'll send from

---

## Step 3 — Create Your Project Folder

Open **Terminal** (Mac/Linux) or **Command Prompt** (Windows) and run these commands one by one:

```bash
# Go to your Desktop
cd ~/Desktop

# Create a new folder for the app
mkdir code-break-app

# Enter the folder
cd code-break-app
```

---

## Step 4 — Create the Configuration File

This file tells Docker how to run the app. Copy the entire block below, **replace the 3 values** marked with `← CHANGE THIS`, then paste it into your terminal and press Enter.

```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  mongodb:
    image: mongo:7
    container_name: code-break-mongodb
    restart: unless-stopped
    volumes:
      - mongodb_data:/data/db
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    container_name: code-break-redis
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - app-network

  app:
    image: adityaisme/code-break-predictor-docker:latest
    container_name: code-break-predictor
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - MONGODB_URI=mongodb://mongodb:27017/code-break-predictor
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=your_super_secret_key_change_this
      - JWT_EXPIRES_IN=7d
      - ADMIN_EMAIL=admin@example.com
      - ADMIN_PASSWORD=admin123
      - CORS_ORIGIN=http://localhost:3000
      - FRONTEND_URL=http://localhost:3000
      - SMTP_HOST=smtp.sendgrid.net
      - SMTP_PORT=587
      - SMTP_USER=apikey
      - SMTP_PASS=YOUR_SENDGRID_API_KEY        ← CHANGE THIS
      - EMAIL_FROM="Code Break Predictor <your-verified-email@example.com>"  ← CHANGE THIS
    depends_on:
      - mongodb
      - redis
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  mongodb_data:
  redis_data:
EOF
```

> 💡 **What to replace:**
> - `YOUR_SENDGRID_API_KEY` → your `SG.xxxxx` key from Step 2
> - `your-verified-email@example.com` → the email you verified in SendGrid

---

## Step 5 — Download and Start the App

Run these two commands:

```bash
#open the docker app(manually/command)
 open -a Docker

# Download the app image
docker pull adityaisme/code-break-predictor-docker:latest

# Start everything
docker-compose up -d
```

The first time this runs, Docker will download MongoDB and Redis automatically. This may take 1–2 minutes depending on your internet speed.

---

## Step 6 — Confirm Everything is Running

```bash
docker-compose ps
```

You should see three containers all showing **Up**:

```
NAME                   STATE    PORTS
code-break-mongodb     Up       27017/tcp
code-break-redis       Up       6379/tcp
code-break-predictor   Up       0.0.0.0:3000->3000/tcp
```

You can also do a quick health check:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok","timestamp":"...","uptime":"..."}
```

---

## Step 7 — Open the App

1. Open any browser (Chrome, Firefox, Safari)
2. Go to: **[http://localhost:3000](http://localhost:3000)**
3. Click **Register** to create your account
4. Log in and start using the app 🎉

---

## Daily Use — Starting and Stopping

| What you want to do | Command |
|---|---|
| Start the app | `docker-compose up -d` |
| Stop the app (keeps your data) | `docker-compose down` |
| Restart the app | `docker-compose restart` |
| View live logs | `docker-compose logs -f` |
| Wipe everything and start fresh | `docker-compose down -v` |

> Always run these commands from inside the `code-break-app` folder on your Desktop.

---

## Troubleshooting

**"Port 3000 already in use" error**

Something else on your laptop is using port 3000. Open `docker-compose.yml`, find `"3000:3000"` and change it to `"3001:3000"`, then restart:

```bash
docker-compose down
docker-compose up -d
```

Now open the app at **http://localhost:3001** instead.

**Containers won't start**

```bash
# See what went wrong
docker-compose logs

# Make sure Docker Desktop is open and running
docker ps
```

**Forgot to change the SendGrid key**

Open `docker-compose.yml` in any text editor, update the `SMTP_PASS` and `EMAIL_FROM` lines, save the file, then run:

```bash
docker-compose down
docker-compose up -d
```

---

## File Locations

| Item | Location |
|---|---|
| Configuration file | `~/Desktop/code-break-app/docker-compose.yml` |
| App in browser | http://localhost:3000 |
| All app data | Stored inside Docker volumes (managed automatically) |

---

*Built with Docker · MongoDB · Redis · Node.js*
