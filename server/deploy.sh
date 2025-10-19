#!/bin/bash

# AI HeartBridge Server Deployment Script
echo "🚀 Starting AI HeartBridge Server Deployment..."

# Check if we're in production
if [ "$NODE_ENV" = "production" ]; then
    echo "📦 Building TypeScript..."
    npm run build
    
    echo "🔧 Starting production server..."
    npm start
else
    echo "🔧 Starting development server..."
    npm run dev
fi
