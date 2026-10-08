import { useEffect, useState } from 'react';
import { sfx } from '../lib/sound';
import Icon from './Icon';

export default function Result({ result, hasNext, onNext, onRetry, onMap }) {
  const { win, stars, correctCount, total, maxCombo, xpTotal, bonus } = result;
  const [shownXp, setShownXp] = useState(0);

  // contador de XP subindo
  useEffect(() => {
    let raf;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / 900);
      setShownXp(Math.round(xpTotal * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [xpTotal]);

  // som de cada estrela acendendo (sincronizado com o atraso da animação CSS)
  useEffect(() => {
    const timers = Array.from({ length: stars }, (_, k) => setTimeout(() => sfx.star(k), 400 + k * 350));
    return () => timers.forEach(clearTimeout);
  }, [stars]);

  const icon = !win ? 'heartCrack' : stars === 3 ? 'trophy' : stars === 2 ? 'sparkles' : 'smile';
  const title = !win ? 'Sem vidas!' : stars === 3 ? 'Perfeito!' : 'Fase concluída!';
  const sub = win ? (bonus ? `Bônus de estrelas: +${bonus} XP` : '') : 'Não desista! Cada erro é uma lição. Tente de novo.';

  return (
    <section className="screen active">
      <div className="result-card">
        <div className={`result-icon ${win ? '' : 'lose'}`}><Icon name={icon} /></div>
        <h2>{title}</h2>
        {sub && <p className="muted">{sub}</p>}
        <div className="stars">
          {[0, 1, 2].map((k) => (
            <span key={k} className={`star ${k < stars ? 'on' : 'off'}`} style={{ animationDelay: `${0.4 + k * 0.35}s` }}><Icon name="star" /></span>
          ))}
        </div>
        <div className="res-grid">
          <div><b>{correctCount}/{total}</b><span>Acertos</span></div>
          <div><b>{maxCombo}</b><span>Maior combo</span></div>
          <div><b>+{shownXp}</b><span>XP ganho</span></div>
        </div>
        <div className="res-actions">
          {win && hasNext && <button className="btn" onClick={onNext}>Próxima fase <Icon name="arrowRight" /></button>}
          <button className={win ? 'btn secondary' : 'btn'} onClick={onRetry}>{win ? 'Jogar de novo' : 'Tentar de novo'}</button>
          <button className="btn ghost" onClick={onMap}>Voltar ao mapa</button>
        </div>
      </div>
    </section>
  );
}
