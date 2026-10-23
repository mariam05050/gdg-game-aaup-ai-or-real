import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { pairs } from '../src/data/pairs.js';

const publicRoot = new URL('../public/', import.meta.url);
const pictureRoot = new URL('assets/pictures/', publicRoot);
const actualNames = await readdir(pictureRoot);
const expectedNames = [];

assert.equal(pairs.length, 15, 'Expected exactly 15 image pairs');
assert.equal(new Set(pairs.map(({ id }) => id)).size, 15, 'Pair IDs must be unique');

for (const pair of pairs) {
  assert.equal(pair.real, `assets/pictures/${pair.id}.webp`, 'Unexpected real image path');
  assert.equal(pair.ai, `assets/pictures/${pair.id}_AI.webp`, 'Unexpected AI image path');
  for (const kind of ['real', 'ai']) {
    const name = pair[kind].split('/').at(-1);
    assert.ok(actualNames.includes(name), `Missing file or incorrect casing: ${name}`);
    const bytes = await readFile(new URL(pair[kind], publicRoot));
    assert.ok(bytes.length > 12, `Empty or truncated image: ${name}`);
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', `Invalid WebP header: ${name}`);
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', `Invalid WebP header: ${name}`);
    expectedNames.push(name);
  }
  console.log(`${pair.id}: ${pair.real.split('/').at(-1)} + ${pair.ai.split('/').at(-1)}`);
}

assert.equal(new Set(expectedNames).size, 30, 'Image paths must be unique');
assert.deepEqual(actualNames.sort(), expectedNames.sort(), 'Unexpected or unpaired picture files');
const logo = await readFile(new URL('assets/branding/logo.png', publicRoot));
assert.deepEqual([...logo.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], 'Invalid PNG logo header');
console.log('Verified 15 pairs (30 WebP files) and the PNG logo.');
