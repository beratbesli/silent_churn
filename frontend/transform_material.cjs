const fs = require('fs');
const path = require('path');

const directoryPath = 'C:\\Users\\berat\\Desktop\\hackathon\\frontend\\src';

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Remove generic 'border border-[color]' definitions entirely
      content = content.replace(/\bborder border-\w+-\d+(?:\/\d+)?\b/g, '');
      content = content.replace(/\bdark:border-\w+-\d+(?:\/\d+)?\b/g, '');
      content = content.replace(/\bborder-zinc-\d+\b/g, '');
      content = content.replace(/\bdark:border-\w+-\d+\b/g, '');
      
      // Specifically remove things like "border-t border-zinc-200 dark:border-zinc-800" if we want absolutely NO borders,
      // but Material You sometimes uses dividers. For a super minimal look without borders, we'll strip them.
      // Wait, let's keep border-b / border-t for Navbars or list items, but remove the color so they disappear or use very light colors.
      // Let's actually remove ALL "border " and "border-" color utilities to get that soft flat look.
      content = content.replace(/\bborder-b\b/g, '');
      content = content.replace(/\bborder-t\b/g, '');
      content = content.replace(/\bborder-r\b/g, '');
      content = content.replace(/\bborder-l\b/g, '');
      content = content.replace(/\bborder\b/g, ''); // Removes 'border' class itself
      
      // Remove Shadows
      content = content.replace(/\bshadow-sm\b/g, '');
      content = content.replace(/\bshadow-md\b/g, '');
      content = content.replace(/\bshadow-lg\b/g, '');
      content = content.replace(/\bshadow-xl\b/g, '');
      content = content.replace(/\bshadow-2xl\b/g, '');
      content = content.replace(/\bshadow-inner\b/g, '');
      content = content.replace(/\bshadow-none\b/g, '');
      content = content.replace(/\bdark:shadow-none\b/g, '');
      
      // Google Pixel / Material You corner rounding
      content = content.replace(/\brounded-md\b/g, 'rounded-xl');
      content = content.replace(/\brounded-lg\b/g, 'rounded-2xl');
      content = content.replace(/\brounded-xl\b/g, 'rounded-3xl');
      content = content.replace(/\brounded\b/g, 'rounded-xl'); // default rounded to rounded-xl
      
      // Clean up multiple spaces
      content = content.replace(/ +/g, ' ').replace(/ ">/g, '">');

      fs.writeFileSync(fullPath, content);
      console.log('Processed:', fullPath);
    }
  }
}

processDirectory(directoryPath);
console.log('Material You transformation complete.');
