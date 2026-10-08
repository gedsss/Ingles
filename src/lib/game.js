export const QUESTION_TIME = 20; // segundos por pergunta
export const MAX_HEARTS = 3;
export const XP_PER_LEVEL = 100;

export const ACHIEVEMENTS = [
  { id: 'first_win', icon: 'target', title: 'Primeiro Passo', desc: 'Complete sua primeira fase' },
  { id: 'perfect', icon: 'gem', title: 'Perfeição', desc: 'Termine uma fase sem errar (3 estrelas)' },
  { id: 'combo5', icon: 'flame', title: 'Em Chamas', desc: 'Acerte 5 perguntas seguidas' },
  { id: 'combo10', icon: 'rocket', title: 'Imparável', desc: 'Acerte 10 perguntas seguidas' },
  { id: 'speed', icon: 'zap', title: 'Relâmpago', desc: 'Acerte uma pergunta em menos de 3 segundos' },
  { id: 'xp500', icon: 'coins', title: 'Colecionador', desc: 'Acumule 500 XP' },
  { id: 'all_phases', icon: 'crown', title: 'Mestre do Inglês', desc: 'Complete todas as fases' },
  { id: 'all_stars', icon: 'sparkles', title: 'Lenda', desc: 'Consiga 3 estrelas em todas as fases' },
];

export const PRAISE = ['Mandou bem!', 'Excelente!', 'Perfeito!', 'Isso aí!', 'Show de bola!', 'Arrasou!'];
export const OOPS = ['Quase!', 'Ops!', 'Não foi dessa vez', 'Errou, mas aprendeu!'];

export const levelOf = (xp) => Math.floor(xp / XP_PER_LEVEL) + 1;
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Embaralha perguntas e alternativas; a correta é sempre options[0] nos dados.
export function buildRound(phase) {
  return shuffle(phase.questions).map((q) => {
    const opts = shuffle(q.options.map((text, k) => ({ text, ok: k === 0 })));
    return { ...q, opts, correct: opts.findIndex((o) => o.ok) };
  });
}

// XP por acerto: base + bônus de combo + bônus de velocidade.
export const xpForAnswer = (combo, elapsed) => 10 + Math.min(combo - 1, 5) * 2 + (elapsed < 5 ? 5 : 0);
