import { useCallback, useEffect, useRef, useState } from 'react';
import { PHASES } from './data/phases';
import { ACHIEVEMENTS, MAX_HEARTS, QUESTION_TIME, levelOf } from './lib/game';
import { setSoundEnabled, sfx } from './lib/sound';
import { freshState, loadState, saveState } from './lib/storage';
import MapScreen from './components/MapScreen';
import Quiz from './components/Quiz';
import Result from './components/Result';
import Modal from './components/Modal';
import Confetti from './components/Confetti';
import Stars from './components/Stars';
import Icon from './components/Icon';

export default function App() {
  const [state, setState] = useState(loadState);
  const [screen, setScreen] = useState('map'); // map | quiz | result
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [run, setRun] = useState(0); // muda a cada partida para remontar o Quiz
  const [result, setResult] = useState(null);
  const [modal, setModal] = useState(null); // intro | quit | achievements | reset
  const [toasts, setToasts] = useState([]);
  const [burst, setBurst] = useState(null);

  // espelho síncrono do estado para evitar conquistas duplicadas no mesmo ciclo
  const unlocked = useRef(new Set(state.achievements));

  useEffect(() => { saveState(state); }, [state]);
  useEffect(() => { setSoundEnabled(state.sound); }, [state.sound]);

  const starsOf = useCallback((i) => (state.progress[PHASES[i].id] || {}).stars || 0, [state.progress]);
  const isUnlocked = useCallback((i) => i === 0 || starsOf(i - 1) > 0, [starsOf]);

  const toast = useCallback((icon, title, sub) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, icon, title, sub }]);
    setTimeout(() => setToasts((t) => t.map((x) => (x.id === id ? { ...x, out: true } : x))), 3200);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  const unlockAchievement = useCallback((id) => {
    if (unlocked.current.has(id)) return;
    unlocked.current.add(id);
    const a = ACHIEVEMENTS.find((x) => x.id === id);
    setState((s) => ({ ...s, achievements: [...s.achievements, id] }));
    sfx.unlock();
    toast(a.icon, `Conquista: ${a.title}`, a.desc);
  }, [toast]);

  const closeModal = useCallback(() => setModal(null), []);

  const startPhase = (i) => {
    setModal(null);
    setPhaseIndex(i);
    setRun((r) => r + 1);
    setScreen('quiz');
    window.scrollTo({ top: 0 });
  };

  const goMap = () => {
    sfx.click();
    setModal(null);
    setScreen('map');
    window.scrollTo({ top: 0 });
  };

  const finishPhase = useCallback(({ hearts, correctCount, total, maxCombo, xp }) => {
    const phase = PHASES[phaseIndex];
    const win = hearts > 0;
    const stars = win ? hearts : 0;
    const bonus = stars * 10;
    const xpTotal = xp + bonus;
    const prevStars = (state.progress[phase.id] || {}).stars || 0;
    const newXp = state.xp + xpTotal;
    const progress = { ...state.progress, [phase.id]: { stars: Math.max(prevStars, stars) } };
    const hasNext = phaseIndex + 1 < PHASES.length;

    setState((s) => ({ ...s, xp: newXp, progress }));
    setResult({ win, stars, correctCount, total, maxCombo, xpTotal, bonus });
    setScreen('result');
    window.scrollTo({ top: 0 });

    if (win) {
      sfx.win();
      setBurst({ count: stars === 3 ? 220 : 120 });
      unlockAchievement('first_win');
      if (stars === 3) unlockAchievement('perfect');
      if (prevStars === 0 && hasNext) {
        const n = PHASES[phaseIndex + 1];
        setTimeout(() => toast(n.icon, 'Nova fase desbloqueada!', `Fase ${phaseIndex + 2}: ${n.title}`), 1200);
      }
    } else {
      sfx.lose();
    }

    const starsAfter = PHASES.map((p) => (progress[p.id] || {}).stars || 0);
    if (newXp >= 500) unlockAchievement('xp500');
    if (starsAfter.every((s) => s > 0)) unlockAchievement('all_phases');
    if (starsAfter.every((s) => s === 3)) unlockAchievement('all_stars');
    const before = levelOf(state.xp);
    const after = levelOf(newXp);
    if (after > before) setTimeout(() => toast('arrowUp', `Subiu para o nível ${after}!`, 'Continue assim!'), 1800);
  }, [phaseIndex, state.progress, state.xp, unlockAchievement, toast]);

  const resetProgress = () => {
    unlocked.current = new Set();
    setState((s) => ({ ...freshState(), sound: s.sound }));
    setModal(null);
  };

  const renderModal = () => {
    if (!modal) return null;
    if (modal.type === 'intro') {
      const i = modal.i;
      const p = PHASES[i];
      const best = starsOf(i);
      return (
        <>
          <div className="m-icon" style={{ background: p.color }}><Icon name={p.icon} /></div>
          <h2>Fase {i + 1}: {p.title}</h2>
          <p className="muted">{p.subtitle}</p>
          {best > 0 && <Stars n={best} />}
          <div className="rules">
            <span><Icon name="help" /> {p.questions.length} perguntas</span>
            <span><Icon name="heart" /> {MAX_HEARTS} vidas</span>
            <span><Icon name="clock" /> {QUESTION_TIME}s cada</span>
          </div>
          <button className="btn" onClick={() => { sfx.click(); startPhase(i); }}>{best ? 'Jogar de novo' : 'Começar!'}</button>
          <button className="btn ghost" onClick={closeModal}>Agora não</button>
        </>
      );
    }
    if (modal.type === 'quit') {
      return (
        <>
          <div className="m-icon"><Icon name="frown" /></div>
          <h2>Sair da fase?</h2>
          <p className="muted">Você vai perder o progresso desta partida.</p>
          <div style={{ height: 18 }} />
          <button className="btn" onClick={closeModal}>Continuar jogando</button>
          <button className="btn ghost" onClick={goMap}>Sair</button>
        </>
      );
    }
    if (modal.type === 'achievements') {
      return (
        <>
          <h2><Icon name="trophy" className="gold" /> Conquistas</h2>
          <p className="muted">{state.achievements.length} de {ACHIEVEMENTS.length} desbloqueadas</p>
          <div className="ach-list">
            {ACHIEVEMENTS.map((a) => (
              <div key={a.id} className={`ach ${state.achievements.includes(a.id) ? '' : 'locked'}`}>
                <span className="a-icon"><Icon name={a.icon} /></span>
                <div><b>{a.title}</b><small>{a.desc}</small></div>
              </div>
            ))}
          </div>
          <button className="btn" onClick={closeModal}>Fechar</button>
        </>
      );
    }
    return (
      <>
        <div className="m-icon danger"><Icon name="alert" /></div>
        <h2>Reiniciar progresso?</h2>
        <p className="muted">Todo o seu XP, estrelas e conquistas serão apagados.</p>
        <div style={{ height: 18 }} />
        <button className="btn danger" onClick={resetProgress}>Sim, apagar tudo</button>
        <button className="btn ghost" onClick={closeModal}>Cancelar</button>
      </>
    );
  };

  return (
    <>
      <div className="bg-blobs" aria-hidden="true"><span /><span /><span /></div>
      <Confetti burst={burst} />

      <main className="app">
        {screen === 'map' && (
          <MapScreen
            state={state}
            starsOf={starsOf}
            isUnlocked={isUnlocked}
            onOpenPhase={(i) => { sfx.click(); setModal({ type: 'intro', i }); }}
            onLocked={(i) => { sfx.wrong(); toast('lock', 'Fase bloqueada', `Complete "${PHASES[i - 1].title}" para desbloquear`); }}
            onToggleSound={() => { setSoundEnabled(true); sfx.click(); setState((s) => ({ ...s, sound: !s.sound })); }}
            onAchievements={() => { sfx.click(); setModal({ type: 'achievements' }); }}
            onReset={() => setModal({ type: 'reset' })}
          />
        )}
        {screen === 'quiz' && (
          <Quiz
            key={run}
            phase={PHASES[phaseIndex]}
            paused={!!modal}
            onQuit={() => setModal({ type: 'quit' })}
            onFinish={finishPhase}
            onAchievement={unlockAchievement}
          />
        )}
        {screen === 'result' && result && (
          <Result
            key={run}
            result={result}
            hasNext={phaseIndex + 1 < PHASES.length}
            onNext={() => { sfx.click(); startPhase(phaseIndex + 1); }}
            onRetry={() => { sfx.click(); startPhase(phaseIndex); }}
            onMap={goMap}
          />
        )}
      </main>

      <Modal open={!!modal} onClose={closeModal}>{renderModal()}</Modal>

      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.out ? 'out' : ''}`}>
            <span className="t-icon"><Icon name={t.icon} /></span>
            <div>{t.title}<small>{t.sub}</small></div>
          </div>
        ))}
      </div>
    </>
  );
}
