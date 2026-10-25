import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { lerVerbete } from '../verbete.js';

const fixture = (palavra) => readFileSync(new URL(`fixtures/${palavra}.wiki`, import.meta.url), 'utf8');
const textos = (classe) => classe.acepcoes.map((a) => a.texto);

test('saudade: 5 definições limpas do substantivo, galego ignorado', () => {
  const { classes } = lerVerbete(fixture('saudade'));
  assert.deepEqual(classes.map((c) => c.classe), ['Substantivo']);
  assert.deepEqual(textos(classes[0]), [
    'memória ou recordação grata de pessoas, familiares ou objetos',
    'sentimento experimentado entre duas ou mais pessoas que estão distantes, ou que ficam muito tempo sem se ver',
    'lembrança',
    'lembrança de pessoas ou coisas distantes ou não mais existentes, acompanhada da vontade de tornar a vê-las ou possuí-las',
    'condição em que se tem sentimento de perda, lastimação, amargura, diante de aparente possibilidade de poder ter obtido o que desejava e parecia alcançável, que não se concretizou',
  ]);
});

test('casa: substantivo e forma verbal; anagramas e outros idiomas ignorados', () => {
  const { classes } = lerVerbete(fixture('casa'));
  assert.deepEqual(classes.map((c) => c.classe), ['Substantivo', 'Forma verbal']);
  assert.equal(classes[0].acepcoes.length, 7);
  assert.equal(classes[0].acepcoes[3].texto, 'quantificação graduativa métrica');
  assert.deepEqual(textos(classes[1]), ['terceira pessoa do singular do presente do indicativo do verbo casar']);
});

test('procrastinar: verbo com uma definição, catalão e espanhol ignorados', () => {
  const { classes } = lerVerbete(fixture('procrastinar'));
  assert.deepEqual(classes.map((c) => c.classe), ['Verbo']);
  assert.deepEqual(textos(classes[0]), ['deixar para fazer algo mais tarde']);
});

test('resiliência: links com rótulo e predefinições de escopo limpos', () => {
  const { classes } = lerVerbete(fixture('resiliência'));
  assert.deepEqual(textos(classes[0]), [
    'propriedade do material de retornar à forma ou posição original uma vez cessada a tensão sobre o mesmo',
    'habilidade que uma pessoa desenvolve para resistir, lidar e reagir de modo positivo em situações adversas',
  ]);
});

test('efêmero: adjetivo com a acepção "ver efémero"', () => {
  const { classes } = lerVerbete(fixture('efêmero'));
  assert.deepEqual(classes.map((c) => c.classe), ['Adjetivo']);
  assert.deepEqual(textos(classes[0]), ['ver efémero']);
});

test('página sem seção em português: null', () => {
  assert.equal(lerVerbete('={{-en-}}=\n==Noun==\n# [[house]]\n'), null);
});

test('predefinições aninhadas somem por inteiro', () => {
  const { classes } = lerVerbete('={{-pt-}}=\n==Substantivo==\n# {{a|{{b}}}} [[x]]\n');
  assert.deepEqual(textos(classes[0]), ['x']);
});

test('escola: classe em predefinição ({{Substantivo|pt}}); etimologia e pronúncia ignoradas', () => {
  const { classes } = lerVerbete(fixture('escola'));
  assert.deepEqual(classes.map((c) => c.classe), ['Substantivo']);
  assert.equal(classes[0].acepcoes[0].texto, 'instituição social que tem a missão de educar');
});

test('cabeçalho com <sup> vira texto puro; "Anagrama" no singular ignorado', () => {
  const { classes } = lerVerbete('={{-pt-}}=\n==Substantivo<sup>1</sup>==\n# a\n==Anagrama==\n# b\n');
  assert.deepEqual(classes.map((c) => c.classe), ['Substantivo']);
});

test('casa: exemplos sob a definição certa, no máximo 2; citação bibliográfica descartada', () => {
  const [sub] = lerVerbete(fixture('casa')).classes;
  assert.deepEqual(sub.acepcoes[0].exemplos, ['Sua casa é muito bonita!', 'Essa casa é muito grande.']);
  assert.deepEqual(sub.acepcoes[3].exemplos, [
    'A erva-mate ocupa uma área de aproximadamente 4.700 hectares, e a produção anual do produto fica na casa dos 25 milhões de quilos.',
  ]);
});

test('resiliência: escopo vira etiqueta; saudade: etiqueta com maiúscula e sem exemplo onde não há', () => {
  const [res] = lerVerbete(fixture('resiliência')).classes;
  assert.deepEqual(res.acepcoes.map((a) => a.etiqueta), ['Física', 'Figurado']);
  assert.equal(res.acepcoes[1].exemplos.length, 1);
  assert.equal(lerVerbete('={{-pt-}}=\n==Verbo==\n# {{escopo|pt|figurado}} x\n').classes[0].acepcoes[0].etiqueta, 'Figurado');
  assert.deepEqual(lerVerbete(fixture('saudade')).classes[0].acepcoes[0].exemplos, []);
});

test('procrastinar: 7 sinônimos; saudade sem sinônimos', () => {
  assert.deepEqual(lerVerbete(fixture('procrastinar')).sinonimos, [
    'adiar', 'deferir', 'demorar', 'empurrar com a barriga', 'espaçar', 'protelar', 'usar de delongas',
  ]);
  assert.deepEqual(lerVerbete(fixture('saudade')).sinonimos, []);
});
