#!/bin/bash

# Local test script for the Competition Test Script

echo "🧪 Testing the Competition Test Script locally..."
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Start the server in the background
echo "🚀 Starting local server..."
npm start &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 3

# Test the server
echo "🔍 Testing server endpoints..."

# Test health endpoint
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ Health check endpoint: OK"
else
    echo "❌ Health check endpoint: FAILED"
fi

# Test main page
if curl -s http://localhost:8080/ | grep -q "Competition Scoring System"; then
    echo "✅ Main page: OK"
else
    echo "❌ Main page: FAILED"
fi

echo ""
echo "🌐 Local server is running at: http://localhost:8080"
echo "📋 Open this URL in your browser to test the interactive script"
echo ""
echo "Press CTRL+C to stop the server"

# Wait for user to stop
wait $SERVER_PID