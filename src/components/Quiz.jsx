import { useCallback, useEffect, useRef, useState } from 'react';
import { MAX_HEARTS, OOPS, PRAISE, QUESTION_TIME, buildRound, pick, xpForAnswer } from '../lib/game';
import { sfx } from '../lib/sound';
import { speak, stopSpeaking } from '../lib/speech';
import Icon from './Icon';

export default function Quiz({ phase, paused, onQuit, onFinish, onAchievement }) {
  const [list] = useState(() => buildRound(phase));
  const [idx, setIdx] = useState(0);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [correctCount, setCorrectCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [xp, setXp] = useState(0);
  const [choice, setChoice] = useState(null); // null = aguardando, -1 = tempo esgotado
  const [feedback, setFeedback] = useState(null);
  const [floats, setFloats] = useState([]);

  const timerFill = useRef(null);
  const remaining = useRef(QUESTION_TIME * 1000);
  const nextBtn = useRef(null);

  const q = list[idx];
  const answered = choice !== null;
  const isLast = hearts <= 0 || idx + 1 >= list.length;

  const answer = useCallback((k, anchorEl) => {
    if (choice !== null) return;
    const ok = k === q.correct;
    const elapsed = QUESTION_TIME - remaining.current / 1000;
    setChoice(k);

    if (ok) {
      const newCombo = combo + 1;
      const gain = xpForAnswer(newCombo, elapsed);
      setCombo(newCombo);
      setMaxCombo((m) => Math.max(m, newCombo));
      setCorrectCount((c) => c + 1);
      setXp((x) => x + gain);
      newCombo >= 3 ? sfx.combo() : sfx.correct();

      const r = (anchorEl || document.querySelector('.card')).getBoundingClientRect();
      const id = Date.now();
      setFloats((f) => [...f, { id, text: `+${gain} XP`, x: r.left + r.width / 2 - 40, y: r.top - 10 }]);
      setTimeout(() => setFloats((f) => f.filter((p) => p.id !== id)), 1000);

      if (elapsed < 3) onAchievement('speed');
      if (newCombo >= 5) onAchievement('combo5');
      if (newCombo >= 10) onAchievement('combo10');
      setFeedback({
        ok: true,
        icon: newCombo >= 3 ? 'flame' : 'check',
        title: pick(PRAISE),
        text: newCombo >= 3 ? `${newCombo} acertos seguidos!` : `Resposta: ${q.opts[q.correct].text}`,
      });
    } else {
      setHearts((h) => h - 1);
      setCombo(0);
      sfx.wrong();
      if (navigator.vibrate) navigator.vibrate(120);
      setFeedback({
        ok: false,
        icon: k === -1 ? 'clock' : 'x',
        title: k === -1 ? 'Tempo esgotado!' : pick(OOPS),
        text: `Resposta certa: ${q.opts[q.correct].text}`,
      });
    }
  }, [choice, combo, q, onAchievement]);

  // cronômetro: roda enquanto a pergunta está aberta e nenhum modal está aberto
  useEffect(() => {
    if (answered || paused) return;
    let raf;
    let last = performance.now();
    let lastSec = Math.ceil(remaining.current / 1000);
    const loop = (now) => {
      remaining.current -= now - last;
      last = now;
      const pct = Math.max(0, remaining.current / (QUESTION_TIME * 1000));
      const el = timerFill.current;
      if (el) {
        el.style.width = `${pct * 100}%`;
        el.className = pct < 0.25 ? 'danger' : pct < 0.5 ? 'warn' : '';
      }
      const sec = Math.ceil(remaining.current / 1000);
      if (sec <= 5 && sec > 0 && sec < lastSec) sfx.tick();
      lastSec = sec;
      if (remaining.current <= 0) { answer(-1); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [answered, paused, answer]);

  useEffect(() => {
    if (answered) setTimeout(() => nextBtn.current?.focus({ preventScroll: true }), 50);
  }, [answered]);

  const next = useCallback(() => {
    if (!answered) return;
    sfx.click();
    stopSpeaking();
    if (isLast) {
      onFinish({ hearts, correctCount, total: list.length, maxCombo, xp });
      return;
    }
    remaining.current = QUESTION_TIME * 1000;
    setChoice(null);
    setFeedback(null);
    setIdx((i) => i + 1);
  }, [answered, isLast, hearts, correctCount, list.length, maxCombo, xp, onFinish]);

  // atalhos: 1-4 respondem, Enter/Espaço continua
  useEffect(() => {
    const onKey = (e) => {
      if (paused) return;
      if (!answered && /^[1-4]$/.test(e.key)) {
        const k = +e.key - 1;
        if (k < q.opts.length) answer(k, document.querySelectorAll('.opt')[k]);
      } else if (answered && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paused, answered, q, answer, next]);

  const wrongNow = answered && choice !== q.correct;
  const progress = ((idx + (answered ? 1 : 0)) / list.length) * 100;

  return (
    <section className={`screen active ${answered ? 'with-fb' : ''}`}>
      <div className="quiz-top">
        <button className="icon-btn" title="Sair" onClick={onQuit}><Icon name="x" /></button>
        <div className="progress"><div style={{ width: `${progress}%` }} /></div>
        <div className="hearts">
          {Array.from({ length: MAX_HEARTS }, (_, k) => (
            <span key={k} className={`${k >= hearts ? 'lost' : ''} ${wrongNow && k === hearts ? 'breaking' : ''}`}><Icon name="heart" /></span>
          ))}
        </div>
      </div>

      <div className="quiz-meta">
        <span className="tag">{phase.icon} {phase.title}</span>
        <span key={combo} className={`combo ${combo >= 2 ? 'show pop' : ''}`}><Icon name="flame" /> x{combo}</span>
        <span className="xp-live"><Icon name="zap" /> {xp}</span>
      </div>

      <div className="timer"><div ref={timerFill} key={idx} /></div>

      <div key={idx} className={`card ${wrongNow ? 'shake' : 'enter'}`}>
        <span className="q-count">{idx + 1} / {list.length}</span>
        {q.swatch && <div className="q-swatch" style={{ background: q.swatch }} />}
        <h2>{q.q}</h2>
        {q.l && <button className="speak-btn" onClick={() => speak(q.say)}><Icon name="volume" /> Ouvir</button>}
      </div>

      <div className="options" key={`o${idx}`}>
        {q.opts.map((o, k) => {
          let cls = 'opt';
          if (answered) cls += k === q.correct ? ' correct' : k === choice ? ' wrong' : ' dim';
          return (
            <button key={k} className={cls} disabled={answered} onClick={(e) => answer(k, e.currentTarget)}>
              <span className="key">{k + 1}</span>
              {o.text}
            </button>
          );
        })}
      </div>

      <div className={`feedback ${feedback ? 'show' : ''} ${feedback && !feedback.ok ? 'bad' : ''}`}>
        {feedback && (
          <div className="fb-inner">
            <div className="fb-head">
              <span className="fb-icon"><Icon name={feedback.icon} /></span>
              <div>
                <h3>{feedback.title}</h3>
                <p>{feedback.text}</p>
              </div>
              <button className="icon-btn small" title="Ouvir pronúncia" onClick={() => speak(q.say)}><Icon name="volume" /></button>
            </div>
            <p className="tip"><Icon name="lightbulb" /> {q.tip}</p>
            <button ref={nextBtn} className="btn" onClick={next}>{isLast ? 'Ver resultado' : 'Continuar'}</button>
          </div>
        )}
      </div>

      {floats.map((f) => (
        <div key={f.id} className="float-xp" style={{ left: f.x, top: f.y }}>{f.text}</div>
      ))}
    </section>
  );
}
