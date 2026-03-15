/**
 * scripts/fix-next-auth.js
 * 
 * Patch for @auth/core to ensure ESM compatibility in Nuxt 4.
 * This script adds "type": "module" to @auth/core's package.json.
 */

const fs = require('fs');
const path = require('path');

const patchAuthCore = () => {
  const pkgPath = path.resolve(__dirname, '../node_modules/@auth/core/package.json');

  if (!fs.existsSync(pkgPath)) {
    console.warn('[Fix Auth] @auth/core package.json not found. Skipping patch.');
    return;
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    
    if (pkg.type === 'module') {
      console.log('[Fix Auth] @auth/core is already patched.');
      return;
    }

    pkg.type = 'module';
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
    console.log('[Fix Auth] Successfully patched @auth/core for ESM compatibility.');
  } catch (error) {
    console.error('[Fix Auth] Failed to patch @auth/core:', error);
  }
};

patchAuthCore();
