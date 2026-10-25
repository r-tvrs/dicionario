import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PALAVRAS, palavraDoDia } from '../palavra-do-dia.js';

test('mesma palavra o dia todo, outra no dia seguinte', () => {
  assert.equal(palavraDoDia(new Date(2026, 9, 24, 0, 1)), palavraDoDia(new Date(2026, 9, 24, 23, 59)));
  assert.notEqual(palavraDoDia(new Date(2026, 9, 24)), palavraDoDia(new Date(2026, 9, 25)));
});

test('percorre a lista toda sem repetir', () => {
  const vistas = new Set(PALAVRAS.map((_, i) => palavraDoDia(new Date(2026, 0, 1 + i))));
  assert.equal(vistas.size, PALAVRAS.length);
});
