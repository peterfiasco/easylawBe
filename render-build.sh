#!/bin/bash
# Install dependencies
npm install

# Install type dependencies needed
npm install --save-dev @types/body-parser @types/jsonwebtoken @types/pdfkit

# Ensure TypeScript is available
npm install --save-dev typescript

# Use the permissive config
cp tsconfig.render.json tsconfig.json

# Build the project
npx tsc
