#!/bin/bash
set -e

echo "======================================"
echo "Building TetsuBot on Railway"
echo "======================================"

echo ""
echo "Step 1: Checking Python..."
python --version || python3 --version || (echo "ERROR: Python not found!" && exit 1)

echo ""
echo "Step 2: Installing Node.js dependencies..."
npm install

echo ""
echo "Step 3: Installing Python dependencies for voiranime scraper..."
if [ -f "scripts/requirements.txt" ]; then
    python -m pip install -r scripts/requirements.txt || python3 -m pip install -r scripts/requirements.txt || (echo "ERROR: Failed to install Python packages" && exit 1)
    echo "✓ Python packages installed successfully"
else
    echo "ERROR: scripts/requirements.txt not found"
    exit 1
fi

echo ""
echo "======================================"
echo "Build complete! Ready to start."
echo "======================================"
