const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../src/emails/templates');
const destDir = path.resolve(__dirname, '../dist/emails/templates');

try {
  if (fs.existsSync(srcDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    const files = fs.readdirSync(srcDir);
    for (const file of files) {
      const srcFile = path.join(srcDir, file);
      const destFile = path.join(destDir, file);
      if (fs.statSync(srcFile).isFile()) {
        fs.copyFileSync(srcFile, destFile);
        console.log(`[copy-templates] Copied ${file} -> dist/emails/templates/${file}`);
      }
    }
    console.log('[copy-templates] Successfully copied email templates to dist.');
  } else {
    console.warn(`[copy-templates] Source templates directory not found at ${srcDir}`);
  }
} catch (err) {
  console.error('[copy-templates] Failed to copy email templates:', err);
  process.exit(1);
}
