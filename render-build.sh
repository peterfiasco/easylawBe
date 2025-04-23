#!/usr/bin/env bash
npm ci --legacy-peer-deps
npm install bcrypt --force
npm run build


# Ensure Node.js knows this is CommonJS
echo "{\"type\": \"commonjs\"}" > dist/package.json

echo "Build completed successfully"
