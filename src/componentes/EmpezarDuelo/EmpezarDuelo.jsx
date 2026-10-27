import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import './EmpezarDuelo.css';
import CartaPokemon from '../CartaPokemon/CartaPokemon';
import { getPokemon } from '../../servicios/servicioPokeApi';
import { sound } from '../../servicios/servicioSonido';
import { Trophy, Zap, Heart, Swords, Shield, Gauge, RotateCcw } from 'lucide-react';

export default function EmpezarDuelo({
  playerCollection = [],
  onRewardCoins,
}) {
  const [playerScore, setPlayerScore] = useState(0);
  const [rivalScore, setRivalScore] = useState(0);
  const [round, setRound] = useState(1);
  const maxRounds = 5;

  const [playerCard, setPlayerCard] = useState(null);
  const [rivalCard, setRivalCard] = useState(null);
  const [rivalFlipped, setRivalFlipped] = useState(true);
  const [chosenStat, setChosenStat] = useState(null);
  const [roundResult, setRoundResult] = useState(null); // 'win' | 'lose' | 'tie'
  const [gameFinished, setGameFinished] = useState(false);

  // Configurar ronda
  const setupRound = async () => {
    if (!playerCollection || playerCollection.length === 0) return;

    setRivalFlipped(true);
    setChosenStat(null);
    setRoundResult(null);

    // Carta aleatoria de tu colección
    const randomPlayerCard = playerCollection[Math.floor(Math.random() * playerCollection.length)];
    setPlayerCard(randomPlayerCard);

    // Carta rival aleatoria de PokéAPI
    const randomRivalId = Math.floor(Math.random() * 300) + 1;
    const fetchedRival = await getPokemon(randomRivalId);
    setRivalCard(fetchedRival);
  };

  useEffect(() => {
    setupRound();
  }, [playerCollection]);

  const handleStatSelect = (statKey) => {
    if (!playerCard || !rivalCard || !rivalFlipped || roundResult || gameFinished) return;

    setChosenStat(statKey);
    sound.playCardFlip();
    setRivalFlipped(false);

    const playerVal = playerCard[statKey] || 0;
    const rivalVal = rivalCard[statKey] || 0;

    setTimeout(() => {
      if (playerVal > rivalVal) {
        sound.playSuperEffective();
        setRoundResult('win');
        setPlayerScore(p => p + 1);
      } else if (rivalVal > playerVal) {
        sound.playAttack();
        setRoundResult('lose');
        setRivalScore(r => r + 1);
      } else {
        sound.playClick();
        setRoundResult('tie');
      }

      if (round >= maxRounds) {
        setTimeout(() => {
          setGameFinished(true);
          if (playerScore + (playerVal > rivalVal ? 1 : 0) > rivalScore + (rivalVal > playerVal ? 1 : 0)) {
            sound.playVictory();
            confetti({ particleCount: 70, spread: 60 });
            onRewardCoins?.(75);
          } else {
            sound.playDefeat();
          }
        }, 1200);
      }
    }, 600);
  };

  const handleNextRound = () => {
    sound.playClick();
    setRound(r => r + 1);
    setupRound();
  };

  const handleRestartGame = () => {
    sound.playClick();
    setPlayerScore(0);
    setRivalScore(0);
    setRound(1);
    setGameFinished(false);
    setupRound();
  };

  return (
    <div className="stat-duel-container">
      {/* MARCADOR */}
      <div className="duel-header">
        <div className="duel-title-info">
          <h2>Duelo Rápido de Estadísticas</h2>
          <p>Elige tu mejor atributo (PS, ATK, DEF o VEL). ¡El valor más alto gana la ronda!</p>
        </div>

        <div className="duel-scoreboard">
          <div className="score-box player">
            <span>TÚ</span>
            <strong>{playerScore}</strong>
          </div>
          <div className="score-round">
            <span>Ronda</span>
            <strong>{round} / {maxRounds}</strong>
          </div>
          <div className="score-box rival">
            <span>RIVAL</span>
            <strong>{rivalScore}</strong>
          </div>
        </div>
      </div>

      {/* ENFRENTAMIENTO */}
      <div className="clash-arena">
        {/* TU CARTA */}
        <div className="clash-column">
          <div className="clash-badge player">TU CARTA</div>
          {playerCard && (
            <CartaPokemon
              pokemon={playerCard}
              size="md"
              showStats={true}
              isHoverable={false}
            />
          )}
        </div>

        {/* SELECTOR DE ATRIBUTO */}
        <div className="clash-controls-center">
          <div className="clash-vs">VS</div>

          {!roundResult && !gameFinished && (
            <div className="stat-selector-box">
              <span className="selector-title">¡Selecciona un Atributo!</span>
              <div className="stat-buttons-list">
                <button
                  className="btn-stat-choice hp"
                  onClick={() => handleStatSelect('hp')}
                >
                  <Heart size={18} /> PS: {playerCard?.hp}
                </button>
                <button
                  className="btn-stat-choice atk"
                  onClick={() => handleStatSelect('attack')}
                >
                  <Swords size={18} /> ATK: {playerCard?.attack}
                </button>
                <button
                  className="btn-stat-choice def"
                  onClick={() => handleStatSelect('defense')}
                >
                  <Shield size={18} /> DEF: {playerCard?.defense}
                </button>
                <button
                  className="btn-stat-choice spd"
                  onClick={() => handleStatSelect('speed')}
                >
                  <Gauge size={18} /> VEL: {playerCard?.speed}
                </button>
              </div>
            </div>
          )}

          {roundResult && !gameFinished && (
            <div className={`round-verdict-banner ${roundResult}`}>
              <h3>
                {roundResult === 'win' && '¡Ganaste la Ronda! 🎉'}
                {roundResult === 'lose' && '¡Perdiste la Ronda! 💥'}
                {roundResult === 'tie' && '¡Empate Técnico! ⚖️'}
              </h3>
              <p>
                {chosenStat?.toUpperCase()}: {playerCard?.[chosenStat]} vs {rivalCard?.[chosenStat]}
              </p>
              <button className="btn-next-round" onClick={handleNextRound}>
                Siguiente Ronda
              </button>
            </div>
          )}
        </div>

        {/* CARTA RIVAL */}
        <div className="clash-column">
          <div className="clash-badge rival">CARTA RIVAL</div>
          {rivalCard && (
            <CartaPokemon
              pokemon={rivalCard}
              flipped={rivalFlipped}
              size="md"
              showStats={true}
              isHoverable={false}
            />
          )}
        </div>
      </div>

      {/* MODAL RESULTADO FINAL */}
      {gameFinished && (
        <div className="duel-modal-overlay">
          <div className="duel-summary-card">
            <Trophy className="summary-trophy" size={56} />
            <h2>
              {playerScore > rivalScore
                ? '¡CAMPEÓN DEL DUELO!'
                : playerScore === rivalScore
                ? '¡EMPATE ÉPICO!'
                : '¡DERROTA EN EL DUELO!'}
            </h2>
            <p className="final-score-display">
              Marcador Final: {playerScore} a {rivalScore}
            </p>
            {playerScore > rivalScore && (
              <div className="duel-reward-pill">🪙 +75 Monedas Ganadas</div>
            )}
            <button className="btn-restart-duel" onClick={handleRestartGame}>
              <RotateCcw size={18} /> Jugar Otro Duelo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
