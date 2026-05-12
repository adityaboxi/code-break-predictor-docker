# 🔮 Code Break Predictor

> Predict code breakage before it happens — powered by Docker & SendGrid.

---

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Step 1 — Install Docker](#-step-1--install-docker)
- [Step 2 — Clone the Repository](#-step-2--clone-the-repository)
- [Step 3 — Configure SendGrid Email](#-step-3--configure-sendgrid-email)
- [Step 4 — Run the Application](#-step-4--run-the-application)
- [Step 5 — Open in Browser](#-step-5--open-in-browser)
- [Ecosystem Support](#-ecosystem-support)
- [Troubleshooting](#-troubleshooting)

---

## 🧰 Prerequisites

Before you begin, make sure your machine has one of the following package managers or runtimes installed (the app runs inside Docker, so only Docker itself is strictly required):

| Ecosystem     | Tool            | Official Link |
|---------------|-----------------|---------------|
| **Docker**    | Docker Desktop  | [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) |
| Node.js / JS  | Node.js + npm   | [https://nodejs.org](https://nodejs.org) |
| Node.js / JS  | Yarn            | [https://yarnpkg.com](https://yarnpkg.com) |
| Node.js / JS  | pnpm            | [https://pnpm.io](https://pnpm.io) |
| Python        | pip / pip3      | [https://pip.pypa.io](https://pip.pypa.io) |
| Python        | Poetry          | [https://python-poetry.org](https://python-poetry.org) |
| Java / JVM    | Maven           | [https://maven.apache.org](https://maven.apache.org) |
| Java / JVM    | Gradle          | [https://gradle.org](https://gradle.org) |
| Ruby          | Bundler / gem   | [https://bundler.io](https://bundler.io) |
| PHP           | Composer        | [https://getcomposer.org](https://getcomposer.org) |
| Go            | Go Modules      | [https://go.dev](https://go.dev) |
| Rust          | Cargo           | [https://doc.rust-lang.org/cargo](https://doc.rust-lang.org/cargo) |
| .NET / C#     | NuGet / dotnet  | [https://dotnet.microsoft.com](https://dotnet.microsoft.com) |
| Swift         | Swift Package Manager | [https://swift.org/package-manager](https://swift.org/package-manager) |

> **Note:** Docker wraps the entire application — you do **not** need to install any of the above to run the project. They are listed here for local development or if you choose to run services outside Docker.

---

## 🐳 Step 1 — Install Docker

Docker is required to build and run the application containers.

### Download Docker Desktop (GUI — Recommended)

| Platform | Download Link |
|----------|--------------|
| 🪟 Windows | [https://docs.docker.com/desktop/install/windows-install/](https://docs.docker.com/desktop/install/windows-install/) |
| 🍎 macOS (Apple Silicon / Intel) | [https://docs.docker.com/desktop/install/mac-install/](https://docs.docker.com/desktop/install/mac-install/) |
| 🐧 Linux | [https://docs.docker.com/desktop/install/linux-install/](https://docs.docker.com/desktop/install/linux-install/) |

### Install Docker Engine (CLI only — for Linux servers)

```bash
# Ubuntu / Debian
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Fedora / RHEL / CentOS
sudo dnf install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Arch Linux
sudo pacman -S docker docker-compose
```

> 📖 Full engine install guide: [https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/)

### Verify Installation

```bash
docker --version
docker compose version
```

> ⚠️ **Keep Docker Desktop open** (running in the background) before proceeding to the next steps.

---

## 📦 Step 2 — Clone the Repository

Choose the method that matches your environment:

### Using Git (Recommended)

```bash
# HTTPS
git clone https://github.com/your-username/code-break-predictor.git

# SSH (if you have SSH keys configured)
git clone git@github.com:your-username/code-break-predictor.git

# GitHub CLI
gh repo clone your-username/code-break-predictor
```

> 📖 Install Git: [https://git-scm.com/downloads](https://git-scm.com/downloads)  
> 📖 Install GitHub CLI: [https://cli.github.com](https://cli.github.com)

### Navigate into the project directory

```bash
cd code-break-predictor
```

---

## 📧 Step 3 — Configure SendGrid Email

This project uses **SendGrid** as its SMTP email provider.

### 3a. Create a SendGrid Account

Go to: [https://sendgrid.com/en-us/free](https://sendgrid.com/en-us/free)

Sign up for a free account (100 emails/day free tier).

### 3b. Generate an API Key

1. Log in to [https://app.sendgrid.com](https://app.sendgrid.com)
2. Navigate to **Settings → API Keys**
3. Click **Create API Key**
4. Choose **Full Access** (or **Restricted Access** with Mail Send enabled)
5. Copy the generated key — it starts with `SG.`

> 📖 Official guide: [https://docs.sendgrid.com/ui/account-and-settings/api-keys](https://docs.sendgrid.com/ui/account-and-settings/api-keys)

### 3c. Update `docker-compose.yml`

Open `docker-compose.yml` in your editor and replace the placeholder values:

```yaml
environment:
  - SMTP_PASS=SG.your_sendgrid_api_key_here      # 👈 Replace with your actual API key
  - EMAIL_FROM=Code Break Predictor <noreply@yourdomain.com>  # 👈 Replace with your sender email
```

**Example (after replacing):**

```yaml
environment:
  - SMTP_PASS=SG.aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890
  - EMAIL_FROM=Code Break Predictor <noreply@mycompany.com>
```

> ⚠️ **Important:** Never commit your real API key to version control. Use a `.env` file and add it to `.gitignore` for production setups.

#### Recommended: Use a `.env` file instead

Create a `.env` file in the project root:

```env
SMTP_PASS=SG.your_real_api_key_here
EMAIL_FROM=Code Break Predictor <noreply@yourdomain.com>
```

Then reference it in `docker-compose.yml`:

```yaml
environment:
  - SMTP_PASS=${SMTP_PASS}
  - EMAIL_FROM=${EMAIL_FROM}
```

---

## 🚀 Step 4 — Run the Application

Make sure Docker Desktop is **open and running**, then execute:

```bash
docker compose up -d --build
```

| Flag | Meaning |
|------|---------|
| `up` | Start all services defined in `docker-compose.yml` |
| `-d` | Detached mode — runs containers in the background |
| `--build` | Rebuild images before starting (picks up any code changes) |

### Useful Docker Commands

```bash
# View running containers
docker compose ps

# View live logs
docker compose logs -f

# View logs for a specific service
docker compose logs -f app

# Stop all containers
docker compose down

# Stop and remove volumes (full reset)
docker compose down -v

# Rebuild without cache
docker compose build --no-cache
```

---

## 🌐 Step 5 — Open in Browser

Once the containers are up and healthy, open your browser and navigate to:

```
http://localhost:3000/login
```

> If port `3000` is already in use on your machine, update the port mapping in `docker-compose.yml`:
> ```yaml
> ports:
>   - "3001:3000"   # Change 3001 to any free port
> ```
> Then access via `http://localhost:3001/login`

---

## 🌍 Ecosystem Support

This project is containerized with Docker, meaning it runs identically regardless of your local development ecosystem. Below is a reference for developers who want to work on the source code locally (outside Docker):

### JavaScript / TypeScript

```bash
npm install && npm run dev        # npm
yarn install && yarn dev          # Yarn
pnpm install && pnpm dev          # pnpm
bun install && bun dev            # Bun — https://bun.sh
```

### Python

```bash
pip install -r requirements.txt   # pip
poetry install && poetry run dev  # Poetry
pipenv install && pipenv run dev  # Pipenv — https://pipenv.pypa.io
```

### Java / Kotlin

```bash
./mvnw spring-boot:run            # Maven Wrapper
./gradlew bootRun                 # Gradle Wrapper
```

### Ruby

```bash
bundle install
bundle exec rails server          # Rails
bundle exec rackup                # Rack / Sinatra
```

### PHP

```bash
composer install
php -S localhost:3000 -t public   # Built-in server
```

### Go

```bash
go mod download
go run ./cmd/server               # Standard Go
```

### Rust

```bash
cargo build
cargo run
```

### .NET / C#

```bash
dotnet restore
dotnet run
```

### Swift

```bash
swift package resolve
swift run
```

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| `docker: command not found` | Install Docker and ensure it's in your PATH |
| `Cannot connect to the Docker daemon` | Open Docker Desktop and wait for it to fully start |
| `Port 3000 already in use` | Change the host port in `docker-compose.yml` |
| `SMTP authentication failed` | Double-check your SendGrid API key in `docker-compose.yml` or `.env` |
| Containers exit immediately | Run `docker compose logs` to see the error output |
| `permission denied` on Linux | Add your user to the docker group: `sudo usermod -aG docker $USER` then log out/in |

---

## 📚 Official Documentation Links

- 🐳 Docker Desktop: [https://docs.docker.com/desktop/](https://docs.docker.com/desktop/)
- 🐳 Docker Compose: [https://docs.docker.com/compose/](https://docs.docker.com/compose/)
- 📧 SendGrid: [https://docs.sendgrid.com](https://docs.sendgrid.com)
- 📧 SendGrid API Keys: [https://docs.sendgrid.com/ui/account-and-settings/api-keys](https://docs.sendgrid.com/ui/account-and-settings/api-keys)
- 🔗 Git: [https://git-scm.com/doc](https://git-scm.com/doc)
- 🔗 GitHub CLI: [https://cli.github.com/manual/](https://cli.github.com/manual/)

---

## 🔐 Security Best Practices

- Never hardcode API keys in source files — use environment variables
- Add `.env` to your `.gitignore`
- Rotate SendGrid API keys periodically
- Use SendGrid's **Restricted Access** keys with only `Mail Send` permission for production

---

<p align="center">Made with ❤️ — Happy Predicting! 🔮</p>
