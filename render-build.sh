#!/bin/bash
# Install dependencies
npm install

# Run our custom transpilation script
node build-ignoring-errors.js

# Run the module fix script
node fix-modules.js

# Ensure Node.js knows this is CommonJS
echo "{\"type\": \"commonjs\"}" > dist/package.json
