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

// Recebe o wikitext da página e devolve as classes da seção em português, ou null se não houver.
export function lerVerbete(wikitext) {
  const pt = wikitext.split(/^=\{\{-pt-\}\}=\s*$/m)[1]?.split(/^=[^=]/m)[0];
  if (pt === undefined) return null;
  const classes = [];
  let atual = null;
  for (const linha of pt.split('\n')) {
    const h2 = linha.match(/^==([^=].*?)==\s*$/);
    if (h2) {
      // O cabeçalho pode vir como predefinição: {{Substantivo|pt}} → Substantivo; <sup>1</sup> sai.
      let nome = h2[1].replace(/<sup>.*?<\/sup>/g, '').trim().replace(/^\{\{([^|}]+)\|pt\}\}$/, '$1');
      nome = nome[0].toUpperCase() + nome.slice(1);
      atual = nome.includes('{{') || NAO_CLASSES.includes(nome) ? null : { classe: nome, acepcoes: [] };
      if (atual) classes.push(atual);
    } else if (linha.startsWith('===')) {
      atual = null;
    } else if (atual && /^#[^*:]/.test(linha)) {
      atual.acepcoes.push({ texto: limpar(linha.slice(1)) });
    }
  }
  return { classes: classes.filter((c) => c.acepcoes.length) };
}
