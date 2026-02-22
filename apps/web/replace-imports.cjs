const fs = require('fs');
const path = require('path');

function walk(dir) {
  for (const file of fs.readdirSync(dir)) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      let content = fs.readFileSync(p, 'utf8');
      const lines = content.split('\n');
      let changed = false;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          const match = lines[i].match(/(from\s+['"])([^'"]+)(['"])/);
          if (match) {
            const importPath = match[2];
            if (importPath.startsWith('.')) {
              const absoluteImportPath = path.resolve(path.dirname(p), importPath);
              const srcDir = path.resolve('src');
              if (absoluteImportPath.startsWith(srcDir)) {
                const relativeToSrc = path.relative(srcDir, absoluteImportPath);
                const newImport = '@/' + relativeToSrc.replace(/\\/g, '/');
                lines[i] = lines[i].replace(importPath, newImport);
                changed = true;
              }
            }
          }
        }
      }
      if (changed) fs.writeFileSync(p, lines.join('\n'));
    }
  }
}
walk('src');
