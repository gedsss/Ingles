// Pronúncia em inglês usando a síntese de voz do navegador.
export function speak(text) {
  if (!text || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 0.85;
  const voices = speechSynthesis.getVoices();
  const voice = voices.find((v) => v.lang === 'en-US') || voices.find((v) => v.lang.startsWith('en'));
  if (voice) u.voice = voice;
  speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) speechSynthesis.getVoices();
