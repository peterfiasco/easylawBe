#!/bin/bash

# Install dependencies
npm install

# Build with TypeScript
npx tsc

# Ensure Node.js knows this is CommonJS
echo "{\"type\": \"commonjs\"}" > dist/package.json

echo "Build completed successfully"
