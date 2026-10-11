import './patch-fs.js';
import path from 'path';
import fs from 'fs';
import type { NextConfig } from 'next';

// On Windows FAT32, child worker processes must preload patch-fs.js
if (process.platform === 'win32') {
  const patchFile = path.resolve(__dirname, 'patch-fs.js').replace(/\\/g, '/');
  if (!process.env.NODE_OPTIONS || !process.env.NODE_OPTIONS.includes('patch-fs')) {
    process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ''} --require "${patchFile}"`.trim();
  }
}

const monorepoRoot = fs.existsSync(path.resolve(__dirname, '../package.json'))
  ? path.resolve(__dirname, '../')
  : __dirname;

const typesIndexPath = fs.existsSync(path.resolve(monorepoRoot, 'packages/types/src/index.ts'))
  ? path.resolve(monorepoRoot, 'packages/types/src/index.ts')
  : path.resolve(__dirname, 'src/packages/types/index.ts');

const typesDir = fs.existsSync(path.resolve(monorepoRoot, 'packages/types/src'))
  ? path.resolve(monorepoRoot, 'packages/types/src')
  : path.resolve(__dirname, 'src/packages/types');

const nextConfig: NextConfig = {
  output: 'export',
  outputFileTracingRoot: monorepoRoot,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  webpack: (config) => {
    config.resolve.symlinks = false;
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@sharpmind/types$': typesIndexPath,
      '@sharpmind/types': typesDir,
    };
    return config;
  },
};

export default nextConfig;
