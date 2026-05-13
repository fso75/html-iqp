#!/bin/bash

PORT=8080

echo ""
echo "============================================"
echo "  Starting Case Report..."
echo "  Press Ctrl+C to stop the server."
echo "============================================"
echo ""

# Open browser (works on macOS and Linux)
if command -v open &> /dev/null; then
    open "http://localhost:$PORT/index.html" &
elif command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:$PORT/index.html" &
fi

# Start server
if command -v python3 &> /dev/null; then
    echo "Starting server on http://localhost:$PORT"
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    echo "Starting server on http://localhost:$PORT"
    python -m http.server $PORT
else
    echo "ERROR: Python is not installed."
    echo "Please install Python 3 or open index.html with Firefox."
    exit 1
fi
