#!/usr/bin/env bash
npm ci --legacy-peer-deps
npm run build

# Ensure dist directory exists
ls -la dist/

# Ensure Node.js knows this is CommonJS
echo '{"type": "commonjs"}' > dist/package.json

echo "Build completed successfully"
