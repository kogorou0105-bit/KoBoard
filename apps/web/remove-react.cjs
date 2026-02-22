const fs = require('fs');
const p = require('path');

function walk(d) {
  fs.readdirSync(d).forEach(f => {
    const pf = p.join(d, f);
    if (fs.statSync(pf).isDirectory()) {
      walk(pf);
    } else if (pf.endsWith('.tsx') || pf.endsWith('.ts')) {
      let c = fs.readFileSync(pf, 'utf8');
      
      // Replace "import React, { ... } from 'react';" with "import { ... } from 'react';"
      c = c.replace(/import React,\s*\{([^}]+)\}\s*from\s*'react';?/g, "import { $1 } from 'react';");
      
      // Replace "import React from 'react';" with ""
      c = c.replace(/import React from 'react';?\n?/g, "");
      
      fs.writeFileSync(pf, c);
    }
  });
}

walk('src/components');
