import { test } from 'node:test';
import assert from 'node:assert/strict';
import { portugues, completar, parecidas } from '../sugestoes.js';

const pagina = (index, title, pt = true) => ({ index, title, ...(pt && { categories: [{ title: 'Categoria:!Entrada (Português)' }] }) });

test('portugues: só páginas com a categoria, na ordem do prefixsearch', () => {
  const dados = { query: { pages: [pagina(3, 'saudar'), pagina(2, 'Sauda Arabio', false), pagina(1, 'saudade')] } };
  assert.deepEqual(portugues(dados), ['saudade', 'saudar']);
  assert.deepEqual(portugues({ batchcomplete: true }), []);
});

test('completar: "sauda" vira parte digitada + completação, sem fuzzy, máx. 8', () => {
  const titulos = ['saudade', 'sauna', 'saudação', 'saudar', 'saída', 'a', 'b', 'saudades', 'saudável', 'saudoso', 'saudadense', 'saudações', 'saudavelmente', 'saudação romana'];
  const s = completar('sauda', titulos);
  assert.equal(s.length, 8);
  assert.deepEqual(s[0], { titulo: 'saudade', digitado: 'sauda', resto: 'de' });
  assert.ok(!s.some((x) => ['sauna', 'saída', 'saudoso'].includes(x.titulo)));
});

test('completar: ignora acento e caixa', () => {
  assert.deepEqual(completar('Efeme', ['efêmero']), [{ titulo: 'efêmero', digitado: 'efême', resto: 'ro' }]);
});

test('parecidas: até 3, por distância de edição, sem a própria palavra', () => {
  assert.deepEqual(parecidas('saudadi', ['saudade', 'saudades', 'saudadense', 'salgadinho', 'saudar']), ['saudade', 'saudades', 'saudar']);
  assert.deepEqual(parecidas('xyzwq', ['saudade']), []);
});
