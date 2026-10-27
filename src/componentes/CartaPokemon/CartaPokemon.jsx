import React, { useRef, useState } from 'react';
import './CartaPokemon.css';
import { sound } from '../../servicios/servicioSonido';

export default function CartaPokemon({
  pokemon,
  flipped = false,
  isHoverable = true,
  isSelected = false,
  isAttacking = false,
  isDamaged = false,
  isGuarding = false,
  isDefeated = false,
  size = 'md', // 'sm', 'md', 'lg'
  onClick,
  badge = null,
  showStats = true,
}) {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});
  const [glareStyle, setGlareStyle] = useState({});

  if (!pokemon) return null;

  const handleMouseMove = (e) => {
    if (!isHoverable || flipped || isDefeated) return;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -14;
    const rotateY = ((x - centerX) / centerX) * 14;

    setTiltStyle({
      transform: `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.04, 1.04, 1.04)`,
    });

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setGlareStyle({
      background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 70%)`,
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    if (!isHoverable) return;
    setTiltStyle({
      transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.4s ease-out',
    });
    setGlareStyle({
      opacity: 0,
      transition: 'opacity 0.4s ease-out',
    });
  };

  const handleClick = (e) => {
    if (onClick) {
      sound.playClick();
      onClick(pokemon, e);
    }
  };

  const hpPercent = Math.max(0, Math.min(100, ((pokemon.hp || 0) / (pokemon.maxHp || 100)) * 100));

  return (
    <div
      ref={cardRef}
      className={`pokemon-card-wrapper size-${size} ${isSelected ? 'selected' : ''} ${isAttacking ? 'attacking' : ''} ${isDamaged ? 'damaged' : ''} ${isGuarding ? 'guarding' : ''} ${isDefeated ? 'defeated' : ''}`}
      style={tiltStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      role="button"
      tabIndex={onClick ? 0 : -1}
      aria-label={`Carta de ${pokemon.name || 'Pokemon'}`}
    >
      <div className={`pokemon-card-inner ${flipped ? 'is-flipped' : ''} rarity-${pokemon.rarity || 'common'}`}>
        
        {/* CARA FRONTAL DE LA CARTA */}
        <div className={`card-face card-front type-${pokemon.primaryType || 'normal'}`}>
          {/* Capa de reflejo holográfico */}
          <div className="card-glare" style={glareStyle} />
          
          {/* Brillo especial para cartas Épicas y Legendarias */}
          {(pokemon.rarity === 'legendary' || pokemon.rarity === 'epic') && (
            <div className="card-holo-shimmer" />
          )}

          {/* Encabezado: Nombre, PS y número Pokédex */}
          <div className="card-header">
            <div className="card-name-group">
              <span className="card-dex-num">#{String(pokemon.id || 0).padStart(3, '0')}</span>
              <h3 className="card-name">{pokemon.name}</h3>
            </div>
            <div className="card-hp-badge">
              <span className="hp-label">PS</span>
              <span className="hp-value">{pokemon.hp}/{pokemon.maxHp}</span>
            </div>
          </div>

          {/* Barra de Puntos de Salud */}
          <div className="card-hp-track">
            <div
              className={`card-hp-fill ${hpPercent < 25 ? 'critical' : hpPercent < 50 ? 'warning' : 'healthy'}`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>

          {/* Marco de ilustración Pokémon */}
          <div className="card-artwork-frame">
            <div className="artwork-bg-glow" />
            <img
              src={pokemon.image}
              alt={pokemon.name}
              className="card-image"
              loading="lazy"
            />
            {badge && <div className="card-corner-badge">{badge}</div>}
          </div>

          {/* Etiquetas de tipos elementales */}
          <div className="card-types-row">
            <span className={`type-tag type-${pokemon.primaryType}`}>
              {pokemon.primaryType}
            </span>
            {pokemon.secondaryType && (
              <span className={`type-tag type-${pokemon.secondaryType}`}>
                {pokemon.secondaryType}
              </span>
            )}
            <span className={`rarity-tag rarity-${pokemon.rarity}`}>
              {pokemon.rarity}
            </span>
          </div>

          {/* Rejilla de Atributos / Estadísticas */}
          {showStats && (
            <div className="card-stats-grid">
              <div className="stat-item">
                <span className="stat-label">ATK</span>
                <span className="stat-val">{pokemon.attack}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">DEF</span>
                <span className="stat-val">{pokemon.defense}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">SP.A</span>
                <span className="stat-val">{pokemon.spAttack}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">VEL</span>
                <span className="stat-val">{pokemon.speed}</span>
              </div>
            </div>
          )}

          {/* Escudo Defensivo */}
          {isGuarding && (
            <div className="guard-overlay">
              <div className="guard-shield-icon">🛡️</div>
              <span>ESCUDO</span>
            </div>
          )}
        </div>

        {/* REVERSO DE LA CARTA (POKÉBALL) */}
        <div className="card-face card-back">
          <div className="card-back-pattern">
            <div className="pokeball-back">
              <div className="pokeball-top" />
              <div className="pokeball-center">
                <div className="pokeball-button" />
              </div>
              <div className="pokeball-bottom" />
            </div>
            <div className="card-back-brand">POKÉCARD</div>
          </div>
        </div>

      </div>
    </div>
  );
}
