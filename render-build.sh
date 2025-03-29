#!/bin/bash
# Install dependencies
npm install

# Install type dependencies needed
npm install --save-dev @types/body-parser @types/jsonwebtoken @types/pdfkit

# Create the permissive tsconfig
cat > tsconfig.render.json << 'EOL'
{
  "compilerOptions": {
    "target": "es2016",
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./dist",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": false,
    "skipLibCheck": true,
    "noImplicitAny": false,
    "typeRoots": ["./node_modules/@types", "./src/types"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
EOL

# Use the permissive config
cp tsconfig.render.json tsconfig.json

# Build the project
npx tsc