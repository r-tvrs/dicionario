import { lerVerbete } from './verbete.js';
import { CATEGORIA, portugues, completar, parecidas } from './sugestoes.js';

const API = 'https://pt.wiktionary.org/w/api.php';
const $ = (id) => document.getElementById(id);
const conteudo = $('conteudo');
const q = $('q');
const lista = $('sugestoes');
const cancelar = $('cancelar');
let buscaAtual = 0;
let palavraAtual = '';

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

async function titulosPt(termo, signal) {
  const url = `${API}?action=query&format=json&formatversion=2&origin=*&generator=prefixsearch&gpslimit=50&prop=categories&cllimit=max&clcategories=${encodeURIComponent(CATEGORIA)}&gpssearch=${encodeURIComponent(termo)}`;
  return portugues(await (await fetch(url, { signal })).json());
}

// Toca numa palavra sugerida: fecha o teclado e abre a definição.
function ir(palavra) {
  q.value = palavra;
  q.blur();
  buscar(palavra);
}

async function buscar(palavra) {
  const id = ++buscaAtual;
  palavraAtual = palavra;
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
  if (!verbete?.classes.length) {
    const div = estado('Palavra não encontrada', `Nenhum verbete para “${palavra}”.`);
    mostrar(div);
    const quis = parecidas(palavra, await titulosPt(palavra).catch(() => []));
    if (id !== buscaAtual || !quis.length) return;
    const ul = el('ul');
    for (const w of quis) {
      const b = el('button', null, w);
      b.type = 'button';
      b.addEventListener('click', () => ir(w));
      const li = el('li');
      li.append(b);
      ul.append(li);
    }
    div.append(el('p', 'quis', 'Você quis dizer:'), ul);
    return;
  }
  palavraAtual = pag.titulo;
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

const LUPA = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true" style="flex:none"><circle cx="10.5" cy="10.5" r="6.5"/><line x1="15.5" y1="15.5" x2="20.5" y2="20.5"/></svg>';

function item(digitado, resto, acao) {
  const b = el('button');
  b.type = 'button';
  b.innerHTML = LUPA;
  const span = el('span', null, digitado);
  span.append(el('b', null, resto));
  b.append(span);
  // Sem isso o mousedown tira o foco do campo e o teclado fecha antes do clique.
  b.addEventListener('mousedown', (e) => e.preventDefault());
  b.addEventListener('click', acao);
  const li = el('li');
  li.append(b);
  return li;
}

let espera, pedido;
function fecharSugestoes() {
  clearTimeout(espera);
  pedido?.abort();
  lista.hidden = true;
}

q.addEventListener('input', () => {
  fecharSugestoes();
  const termo = q.value.trim();
  if (termo.length < 2) return;
  espera = setTimeout(async () => {
    const controle = (pedido = new AbortController());
    let titulos;
    try {
      titulos = await titulosPt(termo, controle.signal);
    } catch {
      return;
    }
    if (controle.signal.aborted) return;
    const s = completar(termo, titulos);
    lista.replaceChildren(...(s.length ? s.map((x) => item(x.digitado, x.resto, () => ir(x.titulo))) : [item('Buscar ', `“${termo}”`, () => ir(termo))]));
    lista.hidden = false;
  }, 150);
});
q.addEventListener('focus', () => (cancelar.hidden = false));
q.addEventListener('blur', () => {
  cancelar.hidden = true;
  fecharSugestoes();
});
cancelar.addEventListener('mousedown', (e) => e.preventDefault());
cancelar.addEventListener('click', () => {
  q.value = palavraAtual;
  q.blur();
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
