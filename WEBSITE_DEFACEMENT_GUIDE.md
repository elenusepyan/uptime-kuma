# Uptime Kuma Website Defacement Monitor

Custom Uptime Kuma monitor for detecting website defacement using an external Playwright-based detection service.

The integration adds a new monitor type:

```text
Website Defacement

Uptime Kuma sends the monitored URL to the detector API, which compares the current website state against a stored baseline.

Architecture
Uptime Kuma
    |
    | POST /scan
    v
Website Defacement API
FastAPI + Playwright
    |
    v
Target Website

Both services communicate through the Docker network:

kuma-deface-net
Installation
1. Create Docker network
docker network create kuma-deface-net
2. Start Website Defacement Detector

Clone the detector:

git clone https://github.com/Vahesahakyann/website-deface-v1.git
cd website-deface-v1

Build and start:

docker compose up -d --build

Verify:

docker ps

Test the API:

curl http://127.0.0.1:8001/health

Expected:

{"status":"ok"}
3. Build Custom Uptime Kuma

Clone the custom fork:

git clone https://github.com/elenusepyan/uptime-kuma.git
cd uptime-kuma

Install dependencies:

npm ci

Build the frontend:

npm run build

Verify:

ls dist/index.html

Build the Docker image:

docker build \
  -f docker/dockerfile \
  --target nightly \
  -t uptime-kuma-custom:dev \
  .
4. Run Uptime Kuma

Example compose.yaml:

services:
  uptime-kuma:
    image: uptime-kuma-custom:dev
    container_name: uptime-kuma
    restart: unless-stopped

    ports:
      - "3001:3001"

    volumes:
      - uptime-kuma-data:/app/data

    networks:
      - kuma-deface-net

volumes:
  uptime-kuma-data:

networks:
  kuma-deface-net:
    external: true

Start:

docker compose up -d

Verify:

docker ps

Open:

http://SERVER_IP:3001
Usage

Create a new monitor in Uptime Kuma:

Monitor Type: Website Defacement
Friendly Name: Website Integrity
URL: https://example.com
Heartbeat Interval: 60

On the first scan, the detector creates a baseline.

On subsequent scans, the current website is compared with that baseline.

Normal result:

UP

Website integrity OK |
Verdict: LIKELY_NORMAL |
Confidence: 0%

Detected defacement:

DOWN

Possible website defacement |
Verdict: VERY_LIKELY_DEFACED |
Confidence: 100%
Detection

The detector evaluates multiple signals, including:

DOM structure changes
visual changes
title changes
removed page identity elements
new external domains
external scripts
new iframes
new forms
form submission to external domains

Example defacement result:

{
  "confidence_percent": 100,
  "verdict": "VERY_LIKELY_DEFACED",
  "likely_defaced": true,
  "suspicious": true
}

Uptime Kuma maps:

likely_defaced = false → UP
likely_defaced = true  → DOWN
