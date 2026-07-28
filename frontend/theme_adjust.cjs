const fs = require('fs');
const path = require('path');

const directoryPath = 'C:\\Users\\berat\\Desktop\\hackathon\\frontend\\src';

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // We want to avoid replacing things twice, so let's use a temporary token
      content = content.replace(/\bbg-zinc-50\b/g, 'bg-zinc-100');
      content = content.replace(/\bbg-white\b/g, 'bg-zinc-50');
      
      fs.writeFileSync(fullPath, content);
      console.log('Theme updated:', fullPath);
    }
  }
}

processDirectory(directoryPath);
console.log('Theme adjustment complete.');
