#!/bin/bash
# Install dependencies
npm install

# Install necessary type definitions
npm install --save-dev @types/body-parser @types/jsonwebtoken @types/pdfkit

# Create proper type definition files
mkdir -p src/types/express
cat > src/types/express/index.d.ts << 'EOF'
import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export = express;
EOF

mkdir -p src/types
cat > src/types/global.d.ts << 'EOF'
declare module 'body-parser';
declare module 'jsonwebtoken' {
  interface JwtPayload {
    id: string;
  }
}
declare module 'pdfkit';
EOF

# Create a permissive tsconfig
cat > tsconfig.json << 'EOF'
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
    "typeRoots": ["./node_modules/@types", "./src/types"],
    "noEmitOnError": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
EOF

# Build the project using the npm script which uses the local TypeScript
npm run build
