#!/bin/bash
# Install dependencies
npm install

# Install type dependencies needed
npm install --save-dev @types/body-parser @types/jsonwebtoken @types/pdfkit

# Fix imports in the TypeScript files
node fix-imports.js

# Use the permissive config
cp tsconfig.render.json tsconfig.json

# Build the project
npx tsc --skipLibCheck
"