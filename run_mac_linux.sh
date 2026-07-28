#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "=================================================="
echo "        SILENT CHURN - HACKATHON DEMO"
echo "=================================================="
echo ""

echo "[*] Starting Backend Server (FastAPI)..."
cd "$DIR/backend"
if [ -d "venv" ]; then
    source venv/bin/activate
fi
uvicorn app.main:app --port 8000 > /dev/null 2>&1 &
BACKEND_PID=$!

echo "[*] Starting Frontend Server (React/Vite)..."
cd "$DIR/frontend"
npm run dev > /dev/null 2>&1 &
FRONTEND_PID=$!

echo "[*] Waiting for services to initialize..."
sleep 3

if [ "$(uname)" == "Darwin" ]; then
    open http://localhost:5173
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    xdg-open http://localhost:5173
fi

echo ""
echo "[OK] All systems ready! Window opened in your browser."
echo "[NOTE] Press Ctrl+C in this terminal to stop both servers."
echo "=================================================="

cleanup() {
    echo ""
    echo "[*] Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

while true; do
    sleep 1
done
