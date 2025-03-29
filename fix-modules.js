const fs = require('fs');
const path = require('path');

// Function to recursively walk through dist directory and fix any remaining module issues
function walkAndFix(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkAndFix(filePath);
    } else if (filePath.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix any remaining import statements
      content = content.replace(/import\s+.*?from\s+['"]([^'"]+)['"]/g, 
        (match, source) => {
          // Add .js extension for relative imports
          if (source.startsWith('./') || source.startsWith('../')) {
            if (!source.endsWith('.js')) {
              return match.replace(source, `${source}.js`);
            }
          }
          return match;
        }
      );
      
      // Fix require statements to add .js extension for relative paths
      content = content.replace(/require\(['"]([^'"]+)['"]\)/g, 
        (match, source) => {
          if (source.startsWith('./') || source.startsWith('../')) {
            if (!source.endsWith('.js') && !source.includes('node_modules')) {
              return match.replace(source, `${source}.js`);
            }
          }
          return match;
        }
      );
      
      // Fix syntax errors that might remain
      content = content.replace(/class\s+(\w+)\s*;/g, 'class $1 {}');
      content = content.replace(/;\s*}/g, ' }');
      
      fs.writeFileSync(filePath, content);
    }
  }
}

// Fix specific files that are known to cause problems
function fixSpecificFiles() {
  // Check if index.js exists
  const indexPath = path.join('dist', 'index.js');
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Make sure the import of ChatController is correct
    content = content.replace(
      /const\s*\{\s*ChatController\s*\}\s*=\s*require\(['"](.*?)['"]\)/g,
      'const { ChatController } = require("./controllers/Chat/ChatController.js")'
    );
    
    fs.writeFileSync(indexPath, content);
    console.log('Fixed imports in index.js');
  }
}

console.log('Starting module path fixes...');
walkAndFix('dist');
fixSpecificFiles();
console.log('Module path fixes completed!');
