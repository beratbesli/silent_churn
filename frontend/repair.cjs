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
      
      // Fix rounded-xl- breakages
      content = content.replace(/rounded-xl-/g, 'rounded-');
      
      // Fix stripped 'border' prefixes.
      // -white -> border-white
      // -zinc -> border-zinc
      // -indigo -> border-indigo
      // -emerald -> border-emerald
      // -rose -> border-rose
      // -amber -> border-amber
      // -slate -> border-slate
      // -blue -> border-blue
      // -transparent -> border-transparent
      // -2 -> border-2
      // -4 -> border-4
      // -t- -> border-t-
      // -b- -> border-b-
      // -r- -> border-r-
      // -l- -> border-l-
      
      // We need to be careful not to replace legitimate negative margins or other dashes.
      // E.g. " -2 " -> " border-2 ".
      content = content.replace(/ -2 /g, ' border-2 ');
      content = content.replace(/ -4 /g, ' border-4 ');
      content = content.replace(/ -white/g, ' border-white');
      content = content.replace(/ -zinc/g, ' border-zinc');
      content = content.replace(/ -indigo/g, ' border-indigo');
      content = content.replace(/ -emerald/g, ' border-emerald');
      content = content.replace(/ -rose/g, ' border-rose');
      content = content.replace(/ -amber/g, ' border-amber');
      content = content.replace(/ -slate/g, ' border-slate');
      content = content.replace(/ -blue/g, ' border-blue');
      content = content.replace(/ -transparent/g, ' border-transparent');
      content = content.replace(/ -t-/g, ' border-t-');
      content = content.replace(/ -b-/g, ' border-b-');
      content = content.replace(/ -r-/g, ' border-r-');
      content = content.replace(/ -l-/g, ' border-l-');

      // Re-fix rounded-xl to be just rounded-2xl or 3xl
      // Actually rounded-xl-2xl became rounded-2xl, which is fine!
      
      fs.writeFileSync(fullPath, content);
      console.log('Repaired:', fullPath);
    }
  }
}

processDirectory(directoryPath);
console.log('Repair complete.');
