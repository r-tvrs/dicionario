export const CATEGORIA = 'Categoria:!Entrada (Português)';

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Títulos portugueses de um generator=prefixsearch com prop=categories&clcategories=CATEGORIA.
export function portugues(dados) {
  return (dados.query?.pages ?? [])
    .filter((p) => p.categories)
    .sort((a, b) => a.index - b.index)
    .map((p) => p.title);
}

// O prefixsearch é fuzzy (sauda → sauna); só fica quem começa com o digitado.
export function completar(termo, titulos) {
  const n = norm(termo);
  return titulos
    .filter((t) => norm(t).startsWith(n))
    .slice(0, 8)
    .map((t) => ({ titulo: t, digitado: t.slice(0, termo.length), resto: t.slice(termo.length) }));
}

function distancia(a, b) {
  let ant = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const lin = [i];
    for (let j = 1; j <= b.length; j++) lin[j] = Math.min(ant[j] + 1, lin[j - 1] + 1, ant[j - 1] + (a[i - 1] !== b[j - 1]));
    ant = lin;
  }
  return ant[b.length];
}

export function parecidas(palavra, titulos) {
  const n = norm(palavra);
  return titulos
    .map((t) => ({ t, d: distancia(n, norm(t)) }))
    .filter(({ d }) => d > 0 && d <= 3)
    .sort((a, b) => a.d - b.d)
    .slice(0, 3)
    .map(({ t }) => t);
}
