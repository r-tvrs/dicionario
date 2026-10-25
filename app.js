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

async function pagina(titulo) {
  const url = `${API}?action=parse&prop=wikitext&format=json&formatversion=2&redirects=1&origin=*&page=${encodeURIComponent(titulo)}`;
  const dados = await (await fetch(url)).json();
  return dados.parse && { titulo: dados.parse.title, verbete: lerVerbete(dados.parse.wikitext) };
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
  let pag;
  try {
    pag = await pagina(palavra);
    // Segue no máximo 1 remissão ("ver efémero"); se o destino não existir, fica a original.
    if (pag?.verbete?.remissao) {
      const destino = await pagina(pag.verbete.remissao);
      if (destino?.verbete?.classes.length) pag = destino;
    }
  } catch {
    if (id !== buscaAtual) return;
    const div = estado('Sem conexão', 'Verifique sua internet e tente de novo.');
    const botao = el('button', 'acao', 'Tentar de novo');
    botao.type = 'button';
    botao.addEventListener('click', () => buscar(palavra));
    div.append(botao);
    return mostrar(div);
  } finally {
    clearTimeout(esqueleto);
  }
  if (id !== buscaAtual) return;
  const verbete = pag?.verbete;
  if (!verbete?.classes.length) return mostrar(estado('Palavra não encontrada', `Nenhum verbete para “${palavra}”.`));
  const artigo = el('article');
  artigo.append(el('h1', 'palavra', pag.titulo));
  for (const { classe, acepcoes } of verbete.classes) {
    const ol = el('ol', 'defs');
    for (const a of acepcoes) {
      const div = el('div');
      const p = el('p', null, a.texto);
      if (a.etiqueta) p.prepend(el('span', 'etiqueta', a.etiqueta));
      div.append(p, ...a.exemplos.map((ex) => el('p', 'exemplo', ex)));
      const li = el('li');
      li.append(div);
      ol.append(li);
    }
    artigo.append(el('p', 'classe', classe), ol);
  }
  if (verbete.sinonimos.length) {
    const sec = el('section', 'sinonimos');
    const chips = el('div', 'chips');
    for (const s of verbete.sinonimos) {
      const b = el('button', null, s);
      b.addEventListener('click', () => buscar((q.value = s)));
      chips.append(b);
    }
    sec.append(el('h2', null, 'Sinônimos'), chips);
    artigo.append(sec);
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
