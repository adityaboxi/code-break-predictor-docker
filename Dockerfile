FROM node:20-alpine

# Install supervisor (and MongoDB/Redis if needed - but they run in separate containers)
RUN apk add --no-cache supervisor

WORKDIR /app

# Copy package files
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN cd server && npm install --production
RUN cd client && npm install

# Copy source code
COPY server/ ./server/
COPY client/ ./client/

# Build React client
RUN cd client && npm run build

# Move built client to server public directory
RUN mkdir -p server/public && cp -r client/dist/* server/public/

# Create logs directory
RUN mkdir -p /app/server/logs

# Environment variables (defaults, override via docker-compose)
ENV NODE_ENV=production
ENV PORT=3000

# Create supervisor config (for running both server and worker)
RUN mkdir -p /etc/supervisor/conf.d && \
    cat > /etc/supervisor/supervisord.conf <<EOF
[supervisord]
nodaemon=true
user=root
logfile=/dev/null
logfile_maxbytes=0

[program:server]
directory=/app/server
command=node src/index.js
autorestart=true
stdout_logfile=/dev/fd/1
stdout_logfile_maxbytes=0
stderr_logfile=/dev/fd/2
stderr_logfile_maxbytes=0

[program:worker]
directory=/app/server
command=node src/workers/analysisWorker.js
autorestart=true
stdout_logfile=/dev/fd/1
stdout_logfile_maxbytes=0
stderr_logfile=/dev/fd/2
stderr_logfile_maxbytes=0
priority=10
startsecs=5
EOF

EXPOSE 3000

# Start supervisor (manages both server and worker)
CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf", "-n"]