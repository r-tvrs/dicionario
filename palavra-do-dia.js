// shortcut: lista fixa curta (repete a cada ~2 meses); trocar por uma lista maior se cansar.
export const PALAVRAS = ['saudade', 'efêmero', 'resiliência', 'procrastinar', 'cafuné', 'serendipidade', 'alvorada', 'quimera', 'melancolia', 'acalanto', 'devaneio', 'inefável', 'sonhar', 'ternura', 'crepúsculo', 'altruísmo', 'utopia', 'nostalgia', 'epifania', 'perspicaz', 'lacônico', 'idílio', 'âmago', 'plenitude', 'sublime', 'efervescente', 'mormaço', 'chuvisco', 'xodó', 'aconchego', 'luar', 'brisa', 'esperança', 'gratidão', 'empatia', 'sagaz', 'audaz', 'outono', 'oásis', 'enigma', 'harmonia', 'mistério', 'paciência', 'liberdade', 'coragem', 'silêncio', 'horizonte', 'orvalho', 'murmúrio', 'fugaz', 'ímpeto', 'vislumbre', 'elegância', 'alegria', 'deslumbre', 'jangada', 'saraiva', 'baderna', 'pândega', 'pachorra'];

// Mesma palavra o dia inteiro, no fuso local.
export function palavraDoDia(data = new Date()) {
  const dia = Math.floor(Date.UTC(data.getFullYear(), data.getMonth(), data.getDate()) / 864e5);
  return PALAVRAS[dia % PALAVRAS.length];
}
