import { PHASES } from '../data/phases';
import { XP_PER_LEVEL, levelOf } from '../lib/game';
import Icon from './Icon';
import Stars from './Stars';

export default function MapScreen({ state, starsOf, isUnlocked, onOpenPhase, onLocked, onToggleSound, onAchievements, onReset }) {
  const totalStars = PHASES.reduce((n, _, i) => n + starsOf(i), 0);
  const current = PHASES.findIndex((_, i) => isUnlocked(i) && starsOf(i) === 0);
  const levelXp = state.xp % XP_PER_LEVEL;

  return (
    <section className="screen active">
      <header className="hud">
        <div className="brand">
          <span className="logo"><Icon name="book" /></span>
          <div>
            <h1>Nathiely Quest</h1>
            <p>Aprenda inglês fase por fase</p>
          </div>
        </div>
        <div className="hud-actions">
          <button className="icon-btn" title="Conquistas" onClick={onAchievements}><Icon name="trophy" /></button>
          <button className="icon-btn" title="Som" onClick={onToggleSound}><Icon name={state.sound ? 'volume' : 'volumeOff'} /></button>
        </div>
      </header>

      <div className="stats">
        <div className="stat level">
          <div className="level-badge">{levelOf(state.xp)}</div>
          <div className="level-info">
            <span className="label">Nível</span>
            <div className="bar"><div style={{ width: `${(levelXp / XP_PER_LEVEL) * 100}%` }} /></div>
            <span className="small">{levelXp} / {XP_PER_LEVEL} XP</span>
          </div>
        </div>
        <div className="stat"><span className="big"><Icon name="star" className="gold" /> <b>{totalStars}/{PHASES.length * 3}</b></span><span className="label">Estrelas</span></div>
        <div className="stat"><span className="big"><Icon name="zap" className="gold" /> <b>{state.xp}</b></span><span className="label">XP total</span></div>
      </div>

      <div className="path">
        {PHASES.map((p, i) => {
          const unlocked = isUnlocked(i);
          return (
            <div key={p.id} className="node-wrap" style={{ '--x': `${Math.round(Math.sin(i * 1.15) * 80)}px`, '--c': p.color }}>
              {i === current && <span className="start-bubble">COMEÇAR</span>}
              <button
                className={`node ${unlocked ? '' : 'locked'} ${i === current ? 'current' : ''}`}
                style={{ '--c': p.color }}
                aria-label={`Fase ${i + 1}: ${p.title}`}
                onClick={() => (unlocked ? onOpenPhase(i) : onLocked(i))}
              >
                <Icon name={unlocked ? p.icon : 'lock'} />
              </button>
              <div className="node-label">
                <b>Fase {i + 1} · {p.title}</b>
                <span>{p.subtitle}</span>
                <Stars n={starsOf(i)} />
              </div>
            </div>
          );
        })}
      </div>

      <footer className="map-footer">
        <button className="link-btn" onClick={onReset}>Reiniciar progresso</button>
      </footer>
    </section>
  );
}
