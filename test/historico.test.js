import { test } from 'node:test';
import assert from 'node:assert/strict';
import { historico, quando } from '../historico.js';

const memoria = () => {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) };
};

test('adicionar: mais recente no topo, sem duplicar', () => {
  const h = historico(memoria());
  h.adicionar('casa', '2026-10-20T10:00:00.000Z');
  h.adicionar('saudade', '2026-10-21T10:00:00.000Z');
  h.adicionar('casa', '2026-10-22T10:00:00.000Z');
  assert.deepEqual(h.lista(), [{ palavra: 'casa', data: '2026-10-22T10:00:00.000Z' }, { palavra: 'saudade', data: '2026-10-21T10:00:00.000Z' }]);
});

test('remover e limpar', () => {
  const h = historico(memoria());
  h.adicionar('casa', 'a');
  h.adicionar('sagaz', 'b');
  h.remover('casa');
  assert.deepEqual(h.lista().map((x) => x.palavra), ['sagaz']);
  h.limpar();
  assert.deepEqual(h.lista(), []);
});

test('persiste no armazenamento e tolera lixo', () => {
  const a = memoria();
  historico(a).adicionar('casa', 'a');
  assert.deepEqual(historico(a).lista(), [{ palavra: 'casa', data: 'a' }]);
  a.setItem('historico', '{lixo');
  assert.deepEqual(historico(a).lista(), []);
});

test('quando: hoje, ontem, N dias, N semanas', () => {
  const agora = new Date(2026, 9, 24, 9);
  const dia = (d, h = 23) => new Date(2026, 9, 24 - d, h).toISOString();
  assert.equal(quando(dia(0, 1), agora), 'hoje');
  assert.equal(quando(dia(1), agora), 'ontem');
  assert.equal(quando(dia(5, 0), agora), '5 dias atrás');
  assert.equal(quando(dia(8), agora), '1 semana atrás');
  assert.equal(quando(dia(15), agora), '2 semanas atrás');
});
