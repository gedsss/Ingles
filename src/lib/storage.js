const STORE_KEY = 'nathielyQuest.v1';
const OLD_KEY = 'englishQuest.v1'; // nome anterior do jogo, lido para não perder o progresso

export const freshState = () => ({ xp: 0, progress: {}, achievements: [], sound: true });

export function loadState() {
  try {
    return { ...freshState(), ...(JSON.parse(localStorage.getItem(STORE_KEY) || localStorage.getItem(OLD_KEY)) || {}) };
  } catch (e) {
    return freshState();
  }
}

export function saveState(state) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* armazenamento indisponível */ }
}
