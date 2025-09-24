import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNote } from '../src/audio.js';

function approxEqual(actual, expected, epsilon = 1e-6) {
  assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} ≉ ${expected}`);
}

test('parses scientific pitch notation accurately', () => {
  approxEqual(parseNote('A4'), 440);
  approxEqual(parseNote('C4'), 261.6255653005986);
});

test('supports sharps, flats, and unicode accidentals', () => {
  const sharp = parseNote('F♯4');
  const flat = parseNote('Gb4');
  approxEqual(sharp, flat);
  approxEqual(parseNote('D♭5'), parseNote('C#5'));
});

test('accepts lowercase and full-width characters', () => {
  const value = parseNote('ｇ♭４');
  approxEqual(value, parseNote('Gb4'));
});

test('treats rest tokens as silence', () => {
  assert.equal(parseNote('REST'), null);
  assert.equal(parseNote('0'), null);
});

test('passes through numeric frequencies', () => {
  approxEqual(parseNote(329.63), 329.63);
});

test('rejects invalid inputs', () => {
  assert.throws(() => parseNote('H2'));
  assert.throws(() => parseNote('C#'));
  assert.throws(() => parseNote(0));
  assert.throws(() => parseNote({}));
});
