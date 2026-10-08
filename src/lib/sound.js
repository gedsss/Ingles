// Efeitos sonoros gerados com Web Audio (sem arquivos de áudio).
let enabled = true;
let actx;

export const setSoundEnabled = (on) => { enabled = on; };

export function tone(freqs, dur = 0.12, type = 'sine', vol = 0.15) {
  if (!enabled) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = actx.currentTime;
    freqs.forEach((f, i) => {
      const o = actx.createOscillator();
      const g = actx.createGain();
      const st = t0 + i * dur;
      o.type = type;
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, st);
      g.gain.exponentialRampToValueAtTime(vol, st + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, st + dur);
      o.connect(g).connect(actx.destination);
      o.start(st);
      o.stop(st + dur + 0.05);
    });
  } catch (e) { /* sem áudio */ }
}

export const sfx = {
  click: () => tone([520], 0.05, 'sine', 0.06),
  correct: () => tone([660, 880], 0.1, 'triangle'),
  combo: () => tone([660, 880, 1175], 0.08, 'triangle'),
  wrong: () => tone([220, 160], 0.16, 'sawtooth', 0.07),
  tick: () => tone([900], 0.04, 'square', 0.03),
  win: () => tone([523, 659, 784, 1047], 0.13, 'triangle'),
  lose: () => tone([392, 330, 262, 196], 0.2, 'triangle'),
  unlock: () => tone([784, 988, 1319], 0.09, 'sine', 0.12),
  star: (k) => tone([600 + k * 200], 0.12, 'triangle', 0.12),
};
