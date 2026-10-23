import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanName, limitName } from '../src/name.js';

test('name entry cleans pasted whitespace and rejects whitespace-only names', () => {
  assert.equal(cleanName('  Mariam\t  Abu\nAli  '), 'Mariam Abu Ali');
  assert.equal(cleanName(' \t\n\u00a0 '), '');
});
test('name entry preserves Unicode names and normalizes combining marks', () => {
  assert.equal(cleanName('  مريم  أحمد  '), 'مريم أحمد');
  assert.equal(cleanName('Jose\u0301'), 'José');
});
test('30-character limit handles typed and pasted text without splitting surrogate pairs', () => {
  assert.equal(limitName('x'.repeat(31)), 'x'.repeat(30));
  assert.equal(limitName('  ' + '🙂'.repeat(31) + '  '), '🙂'.repeat(30));
  assert.equal(limitName('  Mariam  '), 'Mariam');
});
