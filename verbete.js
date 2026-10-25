// Seções de nível 2 da parte em português que não são classes gramaticais.
const NAO_CLASSES = ['Ver também', 'Ligações externas', 'Anagramas', 'Anagrama', 'Referências', 'Notas', 'Etimologia', 'Pronúncia'];

export function limpar(texto) {
  // Remove de dentro para fora, para predefinições aninhadas.
  for (let antes; antes !== texto; ) texto = (antes = texto).replace(/\{\{[^{}]*\}\}/g, '');
  return texto
    .replace(/\[\[(?:[^|\]]*\|)?([^\]]*)\]\]/g, '$1')
    .replace(/'{2,}/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Recebe o wikitext da página e devolve as classes da seção em português (e a remissão, se for só "ver [[x]]"), ou null se não houver.
export function lerVerbete(wikitext) {
  const pt = wikitext.split(/^=\{\{-pt-\}\}=\s*$/m)[1]?.split(/^=[^=]/m)[0];
  if (pt === undefined) return null;
  const classes = [];
  const sinonimos = [];
  let remissao;
  let atual = null;
  let emSinonimos = false;
  for (const linha of pt.split('\n')) {
    const h2 = linha.match(/^==([^=].*?)==\s*$/);
    if (h2) {
      // O cabeçalho pode vir como predefinição: {{Substantivo|pt}} → Substantivo; <sup>1</sup> sai.
      let nome = h2[1].replace(/<sup>.*?<\/sup>/g, '').trim().replace(/^\{\{([^|}]+)\|pt\}\}$/, '$1');
      nome = nome[0].toUpperCase() + nome.slice(1);
      atual = nome.includes('{{') || NAO_CLASSES.includes(nome) ? null : { classe: nome, acepcoes: [] };
      if (atual) classes.push(atual);
      emSinonimos = false;
    } else if (linha.startsWith('===')) {
      atual = null;
      emSinonimos = /^===\s*Sinônimos?\s*===/.test(linha);
    } else if (emSinonimos && linha.startsWith('*')) {
      sinonimos.push(limpar(linha.slice(1)));
    } else if (atual && /^#[^*:]/.test(linha)) {
      remissao ??= linha.match(/^#\s*ver\s+\[\[([^\]|]+)/i)?.[1].trim();
      const etiqueta = linha.match(/\{\{escopo\|pt\|([^|}]+)/)?.[1].trim();
      atual.acepcoes.push({
        texto: limpar(linha.slice(1)),
        etiqueta: etiqueta && etiqueta[0].toUpperCase() + etiqueta.slice(1),
        exemplos: [],
      });
    } else if (atual && /^#\*:?/.test(linha)) {
      // #* e #*: são exemplos; #: é a citação bibliográfica e fica de fora.
      const exemplos = atual.acepcoes.at(-1)?.exemplos;
      if (exemplos?.length < 2) exemplos.push(limpar(linha.replace(/^#\*:?/, '')));
    }
  }
  const comAcepcoes = classes.filter((c) => c.acepcoes.length);
  // Só é remissão quando "ver [[x]]" é a única acepção da página.
  if (comAcepcoes.flatMap((c) => c.acepcoes).length !== 1) remissao = undefined;
  return { classes: comAcepcoes, sinonimos: sinonimos.filter(Boolean), remissao };
}
