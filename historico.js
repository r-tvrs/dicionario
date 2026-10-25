const CHAVE = 'historico';

// armazenamento: algo com getItem/setItem (localStorage no app).
export function historico(armazenamento) {
  const lista = () => {
    try {
      const v = JSON.parse(armazenamento.getItem(CHAVE));
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  };
  const salvar = (v) => armazenamento.setItem(CHAVE, JSON.stringify(v));
  const remover = (palavra) => salvar(lista().filter((x) => x.palavra !== palavra));
  return {
    lista,
    remover,
    adicionar: (palavra, data = new Date().toISOString()) => salvar([{ palavra, data }, ...lista().filter((x) => x.palavra !== palavra)]),
    limpar: () => salvar([]),
  };
}

// Conta dias de calendário locais, não blocos de 24 h.
export function quando(iso, agora = new Date()) {
  const meia = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const d = Math.round((meia(agora) - meia(new Date(iso))) / 864e5);
  if (d <= 0) return 'hoje';
  if (d === 1) return 'ontem';
  if (d < 7) return `${d} dias atrás`;
  const s = Math.floor(d / 7);
  return s === 1 ? '1 semana atrás' : `${s} semanas atrás`;
}
