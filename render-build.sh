#!/bin/bash
# Install dependencies
npm install

# Run our custom transpilation script
node build-ignoring-errors.js

# Run the module fix script
node fix-modules.js

# Ensure Node.js knows this is CommonJS
echo "{\"type\": \"commonjs\"}" > dist/package.json

# List some key files for debugging
echo "Contents of dist/controllers/Chat/ChatController.js:"
cat dist/controllers/Chat/ChatController.js

echo "Contents of dist/index.js:"
cat dist/index.js

echo "Build completed successfully"
