'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const toIco = require('png-to-ico').default;

async function main() {
  const source = path.resolve(__dirname, '../../../web/public/icon-512.png');
  const outputDirectory = path.resolve(__dirname, '../build');
  await fs.mkdir(outputDirectory, { recursive: true });
  await fs.writeFile(path.join(outputDirectory, 'icon.ico'), await toIco(source, { sizes: [16, 24, 32, 48, 64, 128, 256] }));
}

main().catch((error) => {
  console.error('Could not generate Windows icon:', error.message);
  process.exit(1);
});
