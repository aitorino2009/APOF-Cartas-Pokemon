import React, { useState } from 'react';
import './Cabecera.css';
import { sound } from '../../servicios/servicioSonido';
import { 
  Swords, 
  PackageOpen, 
  Layers, 
  Zap, 
  Volume2, 
  VolumeX, 
  HelpCircle,
  Trophy,
  X
} from 'lucide-react';

export default function Cabecera({
  activeTab = 'arena',
  onSelectTab,
  coins = 100,
  packsCount = 2,
  wins = 0,
}) {
  const [isMuted, setIsMuted] = useState(sound.isMuted());
  const [showRulesModal, setShowRulesModal] = useState(false);

  const handleTabChange = (tab) => {
    sound.playClick();
    onSelectTab(tab);
  };

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playClick();
  };

  return (
    <header className="game-header">
      {/* LOGO */}
      <div className="header-brand">
        <div className="header-pokeball-icon">
          <div className="pokeball-mini-top" />
          <div className="pokeball-mini-bottom" />
          <div className="pokeball-mini-center" />
        </div>
        <div className="brand-text">
          <h1>POKÉCARD</h1>
          <span className="brand-tag">ARENA & TCG</span>
        </div>
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN */}
      <nav className="header-nav">
        <button
          className={`nav-btn ${activeTab === 'arena' ? 'active' : ''}`}
          onClick={() => handleTabChange('arena')}
        >
          <Swords size={18} />
          <span>Arena</span>
        </button>

        <button
          className={`nav-btn ${activeTab === 'packs' ? 'active' : ''}`}
          onClick={() => handleTabChange('packs')}
        >
          <PackageOpen size={18} />
          <span>Sobres</span>
          {packsCount > 0 && <span className="nav-badge">{packsCount}</span>}
        </button>

        <button
          className={`nav-btn ${activeTab === 'deck' ? 'active' : ''}`}
          onClick={() => handleTabChange('deck')}
        >
          <Layers size={18} />
          <span>Colección & Mazo</span>
        </button>

        <button
          className={`nav-btn ${activeTab === 'duel' ? 'active' : ''}`}
          onClick={() => handleTabChange('duel')}
        >
          <Zap size={18} />
          <span>Duelo Rápido</span>
        </button>
      </nav>

      {/* RECURSOS Y UTILIDADES */}
      <div className="header-utilities">
        <div className="stat-badge coins" title="Monedas para comprar sobres">
          <span>🪙</span>
          <strong>{coins}</strong>
        </div>

        <div className="stat-badge wins" title="Victorias en combate">
          <Trophy size={16} color="#fbbf24" />
          <strong>{wins}</strong>
        </div>

        <button
          className="utility-icon-btn"
          onClick={() => setShowRulesModal(true)}
          title="Tabla de Tipos y Reglas"
        >
          <HelpCircle size={20} />
        </button>

        <button
          className="utility-icon-btn"
          onClick={handleToggleSound}
          title={isMuted ? 'Activar Sonido' : 'Silenciar'}
        >
          {isMuted ? <VolumeX size={20} color="#f87171" /> : <Volume2 size={20} color="#38bdf8" />}
        </button>
      </div>

      {/* MODAL DE REGLAS Y VENTAJAS DE TIPO */}
      {showRulesModal && (
        <div className="rules-modal-backdrop" onClick={() => setShowRulesModal(false)}>
          <div className="rules-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="rules-modal-header">
              <h3>Guía de Tipos & Reglas del Juego</h3>
              <button className="btn-close-modal" onClick={() => setShowRulesModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="rules-modal-body">
              <section className="rule-section">
                <h4>🔥 Ventajas Elementales Principales (2.0x Daño)</h4>
                <div className="type-matchups-grid">
                  <div className="matchup-chip">
                    <span className="chip-tag type-water">AGUA</span> vence a <span className="chip-tag type-fire">FUEGO</span>
                  </div>
                  <div className="matchup-chip">
                    <span className="chip-tag type-fire">FUEGO</span> vence a <span className="chip-tag type-grass">PLANTA</span>
                  </div>
                  <div className="matchup-chip">
                    <span className="chip-tag type-grass">PLANTA</span> vence a <span className="chip-tag type-water">AGUA</span>
                  </div>
                  <div className="matchup-chip">
                    <span className="chip-tag type-electric">ELÉCTRICO</span> vence a <span className="chip-tag type-water">AGUA</span> / <span className="chip-tag type-flying">VOLADOR</span>
                  </div>
                  <div className="matchup-chip">
                    <span className="chip-tag type-ground">TIERRA</span> inmune a <span className="chip-tag type-electric">ELÉCTRICO</span>
                  </div>
                  <div className="matchup-chip">
                    <span className="chip-tag type-psychic">PSÍQUICO</span> vence a <span className="chip-tag type-fighting">LUCHA</span> / <span className="chip-tag type-poison">VENENO</span>
                  </div>
                </div>
              </section>

              <section className="rule-section">
                <h4>⚔️ Modos de Juego</h4>
                <ul>
                  <li><strong>Arena de Batalla:</strong> Combate por turnos 3 vs 3. Alterna entre Ataque Físico, Ataque Elemental y Guardia.</li>
                  <li><strong>Apertura de Sobres:</strong> Abre sobres de 5 cartas de PokéAPI. ¡Busca cartas Épicas y Legendarias con efectos holográficos!</li>
                  <li><strong>Duelo Rápido:</strong> Minijuego de atributos estilo Top Trumps al mejor de 5 rondas.</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
