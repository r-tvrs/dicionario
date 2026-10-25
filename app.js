import { lerVerbete } from './verbete.js';

const API = 'https://pt.wiktionary.org/w/api.php';
const $ = (id) => document.getElementById(id);
const conteudo = $('conteudo');
const q = $('q');
let buscaAtual = 0;

const el = (tag, classe, texto) => {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texto !== undefined) e.textContent = texto;
  return e;
};

function mostrar(...filhos) {
  conteudo.replaceChildren(...filhos);
  window.scrollTo(0, 0);
}

function estado(titulo, texto) {
  const div = el('div', 'estado');
  div.append(el('h2', null, titulo), el('p', null, texto));
  return div;
}

async function buscar(palavra) {
  const id = ++buscaAtual;
  const esqueleto = setTimeout(() => {
    const sk = el('div', 'esqueleto');
    for (const w of ['46%', '100%', '94%', '58%', '100%', '72%']) {
      const linha = el('div');
      linha.style.width = w;
      sk.append(linha);
    }
    mostrar(el('h1', 'palavra', palavra), sk);
  }, 300);
  const url = `${API}?action=parse&prop=wikitext&format=json&formatversion=2&redirects=1&origin=*&page=${encodeURIComponent(palavra)}`;
  let dados;
  try {
    dados = await (await fetch(url)).json();
  } catch {
    if (id === buscaAtual) mostrar(estado('Sem conexão', 'Verifique sua internet e tente de novo.'));
    return;
  } finally {
    clearTimeout(esqueleto);
  }
  if (id !== buscaAtual) return;
  const verbete = dados.parse && lerVerbete(dados.parse.wikitext);
  if (!verbete?.classes.length) return mostrar(estado('Palavra não encontrada', `Nenhum verbete para “${palavra}”.`));
  const artigo = el('article');
  artigo.append(el('h1', 'palavra', dados.parse.title));
  for (const { classe, acepcoes } of verbete.classes) {
    const ol = el('ol', 'defs');
    for (const a of acepcoes) ol.append(el('li', null, a.texto));
    artigo.append(el('p', 'classe', classe), ol);
  }
  artigo.append(el('p', 'fonte', 'Fonte: Wikcionário · CC BY-SA 4.0'));
  mostrar(artigo);
}

$('busca').addEventListener('submit', (e) => {
  e.preventDefault();
  const palavra = q.value.trim();
  if (!palavra) return;
  q.blur();
  buscar(palavra);
});

function aba(nome) {
  $('buscar').hidden = nome !== 'buscar';
  $('historico').hidden = nome !== 'historico';
  for (const n of ['buscar', 'historico']) {
    if (n === nome) $(`aba-${n}`).setAttribute('aria-current', 'page');
    else $(`aba-${n}`).removeAttribute('aria-current');
  }
}

$('aba-buscar').addEventListener('click', () => {
  aba('buscar');
  // O iOS só abre o teclado se o focus() rodar direto no handler do toque.
  q.focus();
  q.select();
});
$('aba-historico').addEventListener('click', () => aba('historico'));
