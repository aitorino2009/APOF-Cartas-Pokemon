import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import './ArenaBatalla.css';
import CartaPokemon from '../CartaPokemon/CartaPokemon';
import { getPokemon } from '../../servicios/servicioPokeApi';
import { calculateDamage, chooseAiAction, getTypeMultiplier } from '../../servicios/reglasJuego';
import { sound } from '../../servicios/servicioSonido';
import { 
  Swords, 
  Flame, 
  ShieldAlert, 
  Trophy, 
  Skull, 
  RotateCcw
} from 'lucide-react';

const NOMBRES_RIVAL = ['Rival Azul', 'Entrenador Rojo', 'Líder Brock', 'Líder Misty', 'Campeona Cynthia'];

export default function ArenaBatalla({
  playerDeck = [],
  onBattleVictory,
  onBattleDefeat,
}) {
  const [battleState, setBattleState] = useState('loading'); // 'loading' | 'fighting' | 'player_won' | 'player_lost'
  const [rivalName, setRivalName] = useState('Rival Azul');
  
  // Cartas del jugador en la Arena
  const [playerCards, setPlayerCards] = useState([]);
  const [playerActiveIdx, setPlayerActiveIdx] = useState(0);
  const [playerGuarding, setPlayerGuarding] = useState(false);

  // Cartas del rival en la Arena
  const [rivalCards, setRivalCards] = useState([]);
  const [rivalActiveIdx, setRivalActiveIdx] = useState(0);
  const [rivalGuarding, setRivalGuarding] = useState(false);

  // Turnos y combate
  const [currentTurn, setCurrentTurn] = useState('player'); // 'player' | 'ai'
  const [turnCount, setTurnCount] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Animaciones de impacto
  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [rivalAttacking, setRivalAttacking] = useState(false);
  const [playerDamaged, setPlayerDamaged] = useState(false);
  const [rivalDamaged, setRivalDamaged] = useState(false);
  const [floatingDamage, setFloatingDamage] = useState({ target: null, text: '' });

  // Registro de combate
  const [battleLogs, setBattleLogs] = useState([]);
  const logEndRef = useRef(null);

  const addLog = (text, type = 'normal') => {
    setBattleLogs(prev => [...prev, { id: Date.now() + Math.random(), text, type }]);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [battleLogs]);

  // Iniciar / Reiniciar batalla
  const startNewBattle = async () => {
    if (!playerDeck || playerDeck.length === 0) {
      setBattleState('no_deck');
      return;
    }

    setBattleState('loading');
    setBattleLogs([]);
    setTurnCount(1);
    setCurrentTurn('player');
    setPlayerGuarding(false);
    setRivalGuarding(false);
    setFloatingDamage({ target: null, text: '' });

    const chosenRival = NOMBRES_RIVAL[Math.floor(Math.random() * NOMBRES_RIVAL.length)];
    setRivalName(chosenRival);

    const freshPlayerCards = playerDeck.map(card => ({
      ...card,
      hp: card.maxHp || card.hp || 50,
      isFainted: false,
    }));
    setPlayerCards(freshPlayerCards);
    setPlayerActiveIdx(0);

    // Generar equipo rival
    const rivalPokemonIds = [6, 9, 3, 149, 130, 94, 65, 143, 59, 131, 248];
    const chosenIds = [];
    for (let i = 0; i < freshPlayerCards.length; i++) {
      const randomId = rivalPokemonIds[Math.floor(Math.random() * rivalPokemonIds.length)];
      chosenIds.push(randomId);
    }

    try {
      const rivalFetched = await Promise.all(chosenIds.map(id => getPokemon(id)));
      const freshRivalCards = rivalFetched.map(card => ({
        ...card,
        hp: card.maxHp || card.hp || 50,
        isFainted: false,
      }));

      setRivalCards(freshRivalCards);
      setRivalActiveIdx(0);
      setBattleState('fighting');
      addLog(`¡Comienza la batalla contra ${chosenRival}!`, 'highlight');
      addLog(`¡${chosenRival} envía a ${freshRivalCards[0].name}!`);
      addLog(`¡Adelante, ${freshPlayerCards[0].name}!`);
    } catch (e) {
      console.error(e);
      setBattleState('fighting');
    }
  };

  useEffect(() => {
    startNewBattle();
  }, [playerDeck]);

  const playerActiveCard = playerCards[playerActiveIdx];
  const rivalActiveCard = rivalCards[rivalActiveIdx];

  // ==========================================
  // ACCIONES DEL JUGADOR
  // ==========================================
  const executePlayerAction = async (actionType) => {
    if (currentTurn !== 'player' || isAnimating || battleState !== 'fighting') return;
    if (!playerActiveCard || playerActiveCard.hp <= 0) return;

    setIsAnimating(true);

    if (actionType === 'guard') {
      sound.playShield();
      setPlayerGuarding(true);
      addLog(`¡${playerActiveCard.name} adopta una postura defensiva! Escudo activado.`, 'shield');
      finishPlayerTurn();
      return;
    }

    setPlayerAttacking(true);
    sound.playAttack();

    setTimeout(() => {
      setPlayerAttacking(false);
      setRivalDamaged(true);

      const combatResult = calculateDamage({
        attacker: playerActiveCard,
        defender: rivalActiveCard,
        moveType: actionType,
        isGuarding: rivalGuarding,
      });

      if (combatResult.typeMultiplier >= 2) {
        sound.playSuperEffective();
      }

      setFloatingDamage({
        target: 'rival',
        text: `-${combatResult.damage} ${combatResult.isCritical ? '¡CRÍTICO!' : ''}`,
      });

      const updatedRivalCards = [...rivalCards];
      const newHp = Math.max(0, rivalActiveCard.hp - combatResult.damage);
      updatedRivalCards[rivalActiveIdx] = {
        ...rivalActiveCard,
        hp: newHp,
        isFainted: newHp <= 0,
      };
      setRivalCards(updatedRivalCards);

      const moveLabel = actionType === 'elemental' ? `Ataque Elemental (${playerActiveCard.primaryType.toUpperCase()})` : 'Ataque Físico';
      addLog(
        `¡${playerActiveCard.name} usa ${moveLabel}! ${combatResult.effectivenessText} (-${combatResult.damage} PS)`,
        combatResult.typeMultiplier >= 2 ? 'effective' : 'normal'
      );

      setRivalGuarding(false);

      setTimeout(() => {
        setRivalDamaged(false);
        setFloatingDamage({ target: null, text: '' });

        if (newHp <= 0) {
          handleRivalFainted(updatedRivalCards);
        } else {
          finishPlayerTurn();
        }
      }, 700);
    }, 400);
  };

  const handlePlayerSwitch = (benchIndex) => {
    if (currentTurn !== 'player' || isAnimating || benchIndex === playerActiveIdx) return;
    const targetCard = playerCards[benchIndex];
    if (targetCard.hp <= 0) return;

    sound.playCardFlip();
    setPlayerActiveIdx(benchIndex);
    setPlayerGuarding(false);
    addLog(`¡Cambio! Vuelve ${playerActiveCard.name}, ¡adelante ${targetCard.name}!`, 'switch');
    finishPlayerTurn();
  };

  const finishPlayerTurn = () => {
    setCurrentTurn('ai');
    setIsAnimating(false);
  };

  // ==========================================
  // TURNO DE LA IA
  // ==========================================
  useEffect(() => {
    if (currentTurn !== 'ai' || battleState !== 'fighting' || isAnimating) return;

    const timer = setTimeout(() => {
      executeAiTurn();
    }, 1100);

    return () => clearTimeout(timer);
  }, [currentTurn, battleState]);

  const executeAiTurn = () => {
    if (!rivalActiveCard || rivalActiveCard.hp <= 0 || !playerActiveCard) return;

    setIsAnimating(true);
    const aiAction = chooseAiAction(rivalActiveCard, playerActiveCard, rivalCards);

    if (aiAction.type === 'guard') {
      sound.playShield();
      setRivalGuarding(true);
      addLog(`¡${rivalActiveCard.name} rival activa una barrera defensiva!`, 'shield');
      finishAiTurn();
      return;
    }

    setRivalAttacking(true);
    sound.playAttack();

    setTimeout(() => {
      setRivalAttacking(false);
      setPlayerDamaged(true);

      const combatResult = calculateDamage({
        attacker: rivalActiveCard,
        defender: playerActiveCard,
        moveType: aiAction.type,
        isGuarding: playerGuarding,
      });

      if (combatResult.typeMultiplier >= 2) {
        sound.playSuperEffective();
      }

      setFloatingDamage({
        target: 'player',
        text: `-${combatResult.damage} ${combatResult.isCritical ? '¡CRÍTICO!' : ''}`,
      });

      const updatedPlayerCards = [...playerCards];
      const newHp = Math.max(0, playerActiveCard.hp - combatResult.damage);
      updatedPlayerCards[playerActiveIdx] = {
        ...playerActiveCard,
        hp: newHp,
        isFainted: newHp <= 0,
      };
      setPlayerCards(updatedPlayerCards);

      const moveLabel = aiAction.type === 'elemental' ? `Ataque Elemental (${rivalActiveCard.primaryType.toUpperCase()})` : 'Ataque Físico';
      addLog(
        `¡${rivalActiveCard.name} rival usa ${moveLabel}! ${combatResult.effectivenessText} (-${combatResult.damage} PS)`,
        combatResult.typeMultiplier >= 2 ? 'effective' : 'normal'
      );

      setPlayerGuarding(false);

      setTimeout(() => {
        setPlayerDamaged(false);
        setFloatingDamage({ target: null, text: '' });

        if (newHp <= 0) {
          handlePlayerFainted(updatedPlayerCards);
        } else {
          finishAiTurn();
        }
      }, 700);
    }, 400);
  };

  const finishAiTurn = () => {
    setTurnCount(prev => prev + 1);
    setCurrentTurn('player');
    setIsAnimating(false);
  };

  // ==========================================
  // FIN DE COMBATE
  // ==========================================
  const handleRivalFainted = (updatedRivals) => {
    addLog(`¡${rivalActiveCard.name} enemigo se ha debilitado!`, 'faint');

    const nextAliveIdx = updatedRivals.findIndex(c => c.hp > 0);
    if (nextAliveIdx === -1) {
      sound.playVictory();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      setBattleState('player_won');
      addLog(`¡Victoria! Has derrotado a todo el equipo de ${rivalName}.`, 'highlight');
      onBattleVictory?.(100);
      setIsAnimating(false);
    } else {
      setTimeout(() => {
        setRivalActiveIdx(nextAliveIdx);
        addLog(`¡${rivalName} envía a ${updatedRivals[nextAliveIdx].name}!`, 'switch');
        finishPlayerTurn();
      }, 800);
    }
  };

  const handlePlayerFainted = (updatedPlayers) => {
    addLog(`¡Tu ${playerActiveCard.name} se ha debilitado!`, 'faint');

    const nextAliveIdx = updatedPlayers.findIndex(c => c.hp > 0);
    if (nextAliveIdx === -1) {
      sound.playDefeat();
      setBattleState('player_lost');
      addLog(`¡Derrota! Todo tu equipo Pokémon ha sido debilitado.`, 'highlight');
      onBattleDefeat?.();
      setIsAnimating(false);
    } else {
      setTimeout(() => {
        setPlayerActiveIdx(nextAliveIdx);
        addLog(`¡Adelante, ${updatedPlayers[nextAliveIdx].name}!`, 'switch');
        finishAiTurn();
      }, 800);
    }
  };

  const elementalMultiplier = playerActiveCard && rivalActiveCard
    ? getTypeMultiplier(playerActiveCard.primaryType, rivalActiveCard.primaryType, rivalActiveCard.secondaryType)
    : 1;

  if (battleState === 'no_deck') {
    return (
      <div className="battle-arena-empty">
        <ShieldAlert size={48} className="warn-icon" />
        <h3>¡Tu Mazo de Batalla está vacío!</h3>
        <p>Dirígete a la pestaña <strong>Mi Mazo</strong> y selecciona al menos 1 Pokémon para combatir.</p>
      </div>
    );
  }

  return (
    <div className="battle-arena-container">
      {/* CABECERA DE LA ARENA */}
      <div className="arena-header">
        <div className="trainer-profile player-trainer">
          <div className="trainer-avatar">🧢</div>
          <div>
            <span className="trainer-role">ENTRENADOR</span>
            <h4>Tú</h4>
          </div>
        </div>

        <div className="arena-center-info">
          <div className="vs-badge">VS</div>
          <span className="turn-indicator">
            Turno {turnCount} — {currentTurn === 'player' ? '🟢 Tu Turno' : '🔴 Turno del Rival'}
          </span>
        </div>

        <div className="trainer-profile rival-trainer">
          <div>
            <span className="trainer-role">RIVAL</span>
            <h4>{rivalName}</h4>
          </div>
          <div className="trainer-avatar rival-avatar">🕶️</div>
        </div>
      </div>

      {/* CAMPO DE BATALLA */}
      <div className="battlefield-grid">
        {/* LADO RIVAL */}
        <div className="battlefield-side rival-side">
          <div className="side-bench">
            <span className="bench-title">Banquillo Rival:</span>
            <div className="bench-cards-row">
              {rivalCards.map((c, idx) => (
                <div
                  key={c.uid || idx}
                  className={`bench-dot ${idx === rivalActiveIdx ? 'active' : ''} ${c.hp <= 0 ? 'fainted' : ''}`}
                  title={`${c.name} (${c.hp}/${c.maxHp} PS)`}
                >
                  <img src={c.image} alt={c.name} />
                </div>
              ))}
            </div>
          </div>

          <div className="active-card-podium">
            {rivalActiveCard && (
              <div className="card-with-float">
                {floatingDamage.target === 'rival' && (
                  <div className="floating-damage-number">{floatingDamage.text}</div>
                )}
                <CartaPokemon
                  pokemon={rivalActiveCard}
                  size="md"
                  isAttacking={rivalAttacking}
                  isDamaged={rivalDamaged}
                  isGuarding={rivalGuarding}
                  isDefeated={rivalActiveCard.hp <= 0}
                  badge="RIVAL"
                />
              </div>
            )}
          </div>
        </div>

        {/* LADO JUGADOR */}
        <div className="battlefield-side player-side">
          <div className="active-card-podium">
            {playerActiveCard && (
              <div className="card-with-float">
                {floatingDamage.target === 'player' && (
                  <div className="floating-damage-number">{floatingDamage.text}</div>
                )}
                <CartaPokemon
                  pokemon={playerActiveCard}
                  size="md"
                  isAttacking={playerAttacking}
                  isDamaged={playerDamaged}
                  isGuarding={playerGuarding}
                  isDefeated={playerActiveCard.hp <= 0}
                  badge="TU POKÉMON"
                />
              </div>
            )}
          </div>

          <div className="side-bench">
            <span className="bench-title">Tu Banquillo (Click para cambiar):</span>
            <div className="bench-cards-row">
              {playerCards.map((c, idx) => (
                <div
                  key={c.uid || idx}
                  className={`bench-dot player-bench-dot ${idx === playerActiveIdx ? 'active' : ''} ${c.hp <= 0 ? 'fainted' : ''}`}
                  onClick={() => handlePlayerSwitch(idx)}
                  title={`Cambiar a ${c.name} (${c.hp}/${c.maxHp} PS)`}
                >
                  <img src={c.image} alt={c.name} />
                  {idx === playerActiveIdx && <span className="bench-dot-badge">ACTIVO</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PANEL DE CONTROL DE COMBATE */}
      <div className="combat-dashboard">
        <div className="action-panel">
          <h4 className="panel-title">Comandos de Batalla</h4>
          <div className="actions-grid">
            <button
              className="btn-combat-action attack-physical"
              disabled={currentTurn !== 'player' || isAnimating || battleState !== 'fighting'}
              onClick={() => executePlayerAction('physical')}
            >
              <Swords size={20} />
              <div>
                <strong>Ataque Físico</strong>
                <small>Golpe neutral basado en ATK</small>
              </div>
            </button>

            <button
              className="btn-combat-action attack-elemental"
              disabled={currentTurn !== 'player' || isAnimating || battleState !== 'fighting'}
              onClick={() => executePlayerAction('elemental')}
            >
              <Flame size={20} />
              <div>
                <strong>Ataque Elemental ({playerActiveCard?.primaryType.toUpperCase()})</strong>
                <small>
                  Eficacia: {elementalMultiplier}x {elementalMultiplier >= 2 ? '🔥 ¡Súper Eficaz!' : ''}
                </small>
              </div>
            </button>

            <button
              className="btn-combat-action defense-guard"
              disabled={currentTurn !== 'player' || isAnimating || battleState !== 'fighting'}
              onClick={() => executePlayerAction('guard')}
            >
              <ShieldAlert size={20} />
              <div>
                <strong>Guardia / Escudo</strong>
                <small>Reduce 50% el daño del rival</small>
              </div>
            </button>
          </div>
        </div>

        {/* REGISTRO DE COMBATE EN VIVO */}
        <div className="battle-log-panel">
          <div className="log-header">
            <span>Registro de Combate</span>
            <span className="log-pulse" />
          </div>
          <div className="log-entries-scroll">
            {battleLogs.map(log => (
              <div key={log.id} className={`log-entry log-${log.type}`}>
                {log.text}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>

      {/* MODAL DE VICTORIA */}
      {battleState === 'player_won' && (
        <div className="battle-modal-overlay">
          <div className="battle-result-card victory">
            <Trophy className="result-icon gold" size={64} />
            <h2>¡VICTORIA!</h2>
            <p>Has derrotado al equipo de {rivalName}.</p>
            <div className="reward-box">
              <span className="reward-item">🪙 +100 Monedas</span>
              <span className="reward-item">📦 +1 Sobre de Regalo</span>
            </div>
            <button className="btn-result-action" onClick={startNewBattle}>
              <RotateCcw size={18} /> Luchar de Nuevo
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE DERROTA */}
      {battleState === 'player_lost' && (
        <div className="battle-modal-overlay">
          <div className="battle-result-card defeat">
            <Skull className="result-icon red" size={64} />
            <h2>DERROTA</h2>
            <p>{rivalName} ha vencido a tu equipo.</p>
            <small>Consejo: Mejora tu mazo con más cartas y aprovecha las ventajas de tipo.</small>
            <button className="btn-result-action retry" onClick={startNewBattle}>
              <RotateCcw size={18} /> Intentar de Nuevo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
