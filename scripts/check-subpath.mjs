import { build } from 'vite';

// A representative local path, independent of any future GitHub owner/repository.
const base = '/milestone-7-check/';
const outDir = '.tmp/subpath-dist';
await build({ base, build: { outDir } });
process.env.TEST_BASE_PATH = base;
process.env.TEST_OUT_DIR = outDir;
await import('./check-round-flow.mjs');
