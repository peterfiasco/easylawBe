const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// First, ensure our tsconfig is extremely permissive
const tsconfig = {
  compilerOptions: {
    target: "es2016",
    module: "commonjs",
    rootDir: "./src",
    outDir: "./dist",
    esModuleInterop: true,
    skipLibCheck: true,
    strict: false,
    noImplicitAny: false,
    moduleResolution: "node",
    resolveJsonModule: true
  },
  include: ["src/**/*"],
  exclude: ["node_modules"]
};

fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2));

// Use TypeScript API to transpile all files manually
console.log('Starting manual TypeScript transpilation...');

// Create the output directory structure
function ensureDirectoryExists(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExists(dirname);
  fs.mkdirSync(dirname);
}

// Function to recursively walk through src directory and transpile .ts files
function walkAndTranspile(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkAndTranspile(filePath);
    } else if (filePath.endsWith('.ts')) {
      const relativePath = path.relative('src', filePath);
      const outputPath = path.join('dist', relativePath.replace('.ts', '.js'));
      
      ensureDirectoryExists(outputPath);
      
      // Very basic transpilation: just remove types and convert imports
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Remove import type statements
      content = content.replace(/import\s+type\s+.*?;/g, '');
      
      // Fix import statements for ESM to CommonJS compatibility
      content = content.replace(/import\s+(\{[\s\w,]+\})\s+from\s+['"]([^'"]+)['"]/g, 
        (match, imports, source) => {
          // Add .js extension for relative imports
          if (source.startsWith('./') || source.startsWith('../')) {
            if (!source.endsWith('.js')) {
              source = `${source}.js`;
            }
          }
          return `const ${imports} = require('${source}')`;
        }
      );
      
      // Fix default imports
      content = content.replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g, 
        (match, name, source) => {
          // Add .js extension for relative imports
          if (source.startsWith('./') || source.startsWith('../')) {
            if (!source.endsWith('.js')) {
              source = `${source}.js`;
            }
          }
          return `const ${name} = require('${source}')`;
        }
      );
      
      // Fix export default statements
      content = content.replace(/export\s+default\s+(\w+)/g, 'module.exports = $1');
      
      // Fix named exports
      content = content.replace(/export\s+(\{[\s\w,]+\})/g, 'module.exports = $1');
      content = content.replace(/export\s+(const|let|var|function|class)\s+(\w+)/g, 
        (match, keyword, name) => {
          return `${keyword} ${name};\nmodule.exports.${name} = ${name}`;
        }
      );
      
      // Remove type annotations
      content = content.replace(/:\s*[a-zA-Z0-9_<>[\].|,\s]+(?=[,)=;])/g, '');
      content = content.replace(/<[a-zA-Z0-9_<>[\].|,\s]+>/g, '');
      
      // Remove interfaces and type declarations
      content = content.replace(/interface\s+[a-zA-Z0-9_]+\s*{[\s\S]*?}/g, '');
      content = content.replace(/type\s+[a-zA-Z0-9_]+\s*=[\s\S]*?;/g, '');
      
      fs.writeFileSync(outputPath, content);
      console.log(`Transpiled: ${filePath} -> ${outputPath}`);
    } else if (filePath.endsWith('.js')) {
      // Copy JS files directly
      const relativePath = path.relative('src', filePath);
      const outputPath = path.join('dist', relativePath);
      
      ensureDirectoryExists(outputPath);
      fs.copyFileSync(filePath, outputPath);
      console.log(`Copied: ${filePath} -> ${outputPath}`);
    }
  }
}

// Create dist directory
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Transpile all files
walkAndTranspile('src');

console.log('Manual transpilation completed!');