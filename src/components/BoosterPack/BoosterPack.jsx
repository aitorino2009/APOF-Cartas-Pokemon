import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import './BoosterPack.css';
import PokemonCard from '../PokemonCard/PokemonCard';
import { generateBoosterPack } from '../../services/pokeApi';
import { sound } from '../../services/soundService';
import { Sparkles, PackageOpen, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function BoosterPack({
  packsCount = 2,
  coins = 100,
  onAddCardsToCollection,
  onConsumePack,
  onBuyPack,
}) {
  const [packStage, setPackStage] = useState('sealed'); // 'sealed' | 'ripping' | 'revealing' | 'done'
  const [cards, setCards] = useState([]);
  const [revealedIndices, setRevealedIndices] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenPack = async () => {
    if (packsCount <= 0 && coins < 50) return;
    setIsLoading(true);

    try {
      // Consume pack or coins
      if (packsCount > 0) {
        onConsumePack?.();
      } else {
        onBuyPack?.(50);
      }

      sound.playBoosterRip();
      setPackStage('ripping');

      // Fetch 5 random cards from PokéAPI
      const newCards = await generateBoosterPack();
      setCards(newCards);
      setRevealedIndices(new Set());

      setTimeout(() => {
        setPackStage('revealing');
        setIsLoading(false);
      }, 700);
    } catch (err) {
      console.error('Error opening pack:', err);
      setIsLoading(false);
      setPackStage('sealed');
    }
  };

  const handleFlipCard = (index) => {
    if (revealedIndices.has(index)) return;

    sound.playCardFlip();
    const updated = new Set(revealedIndices);
    updated.add(index);
    setRevealedIndices(updated);

    const card = cards[index];
    if (card && (card.rarity === 'legendary' || card.rarity === 'epic')) {
      sound.playSuperEffective();
      confetti({
        particleCount: card.rarity === 'legendary' ? 80 : 40,
        spread: 60,
        origin: { y: 0.65 },
        colors: card.rarity === 'legendary' ? ['#fbbf24', '#f59e0b', '#fff'] : ['#c084fc', '#a855f7', '#38bdf8']
      });
    }

    if (updated.size === cards.length) {
      setTimeout(() => setPackStage('done'), 600);
    }
  };

  const handleRevealAll = () => {
    sound.playSuperEffective();
    const all = new Set([0, 1, 2, 3, 4]);
    setRevealedIndices(all);
    setPackStage('done');
  };

  const handleCollectAndFinish = () => {
    sound.playClick();
    if (onAddCardsToCollection && cards.length > 0) {
      onAddCardsToCollection(cards);
    }
    setCards([]);
    setRevealedIndices(new Set());
    setPackStage('sealed');
  };

  return (
    <div className="booster-pack-container">
      {/* Top Banner Stats */}
      <div className="booster-header">
        <div className="booster-info">
          <h2>Tienda & Apertura de Sobres</h2>
          <p>Cada sobre contiene 5 cartas aleatorias con probabilidades de cartas Épicas y Legendarias.</p>
        </div>
        <div className="booster-inventory-pill">
          <span className="pill-item">
            <PackageOpen size={18} /> Sobres listos: <strong>{packsCount}</strong>
          </span>
          <span className="pill-item">
            🪙 Monedas: <strong>{coins}</strong>
          </span>
        </div>
      </div>

      {/* STAGE 1: SEALED BOOSTER PACK */}
      {packStage === 'sealed' && (
        <div className="booster-stage-sealed">
          <div className="foil-wrapper" onClick={handleOpenPack}>
            <div className="foil-card-pack">
              <div className="foil-shine" />
              <div className="foil-seal-top" />
              <div className="foil-content">
                <div className="foil-badge">EDICIÓN ESPECIAL</div>
                <div className="foil-pokeball-art">
                  <div className="foil-glow-circle" />
                  <Sparkles className="sparkle-icon" size={32} />
                  <div className="foil-title">POKÉCARD</div>
                  <div className="foil-subtitle">SERIE KANTO & HOENN</div>
                </div>
                <div className="foil-footer">
                  <span>5 CARTAS COLECCIONABLES</span>
                  <span className="foil-tag">POKÉAPI CERTIFIED</span>
                </div>
              </div>
              <div className="foil-seal-bottom" />
            </div>
          </div>

          <div className="booster-actions">
            <button
              className="btn-open-booster primary"
              disabled={isLoading || (packsCount <= 0 && coins < 50)}
              onClick={handleOpenPack}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="spin-icon" size={18} /> Generando sobre...
                </>
              ) : packsCount > 0 ? (
                <>
                  <PackageOpen size={20} /> Abrir Sobre Gratis ({packsCount} disponibles)
                </>
              ) : (
                <>
                  🪙 Comprar y Abrir (50 Monedas)
                </>
              )}
            </button>
            {packsCount <= 0 && coins < 50 && (
              <p className="no-coins-warning">¡Gana batallas en la Arena para conseguir más monedas y sobres!</p>
            )}
          </div>
        </div>
      )}

      {/* STAGE 2: RIPPING ANIMATION */}
      {packStage === 'ripping' && (
        <div className="booster-stage-ripping">
          <div className="foil-card-pack is-ripping">
            <div className="foil-tear-line" />
            <div className="foil-content">
              <Sparkles className="sparkle-icon spin-icon" size={48} />
              <h3>¡Abriendo Sobre!</h3>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3 & 4: CARDS REVEALING & SUMMARY */}
      {(packStage === 'revealing' || packStage === 'done') && (
        <div className="booster-stage-revealing">
          <div className="reveal-instruction">
            {revealedIndices.size < cards.length ? (
              <p>Toca cada carta para revelar su identidad o pulsa <strong>Revelar Todo</strong>.</p>
            ) : (
              <p className="success-text">¡Todas las cartas han sido descubiertas! Añádelas a tu colección.</p>
            )}
          </div>

          <div className="cards-reveal-grid">
            {cards.map((card, idx) => {
              const isFlipped = !revealedIndices.has(idx);
              return (
                <div
                  key={card.uid || idx}
                  className="reveal-card-slot"
                  onClick={() => handleFlipCard(idx)}
                >
                  <PokemonCard
                    pokemon={card}
                    flipped={isFlipped}
                    size="md"
                    showStats={true}
                    badge={revealedIndices.has(idx) ? card.rarity.toUpperCase() : 'TAP'}
                  />
                </div>
              );
            })}
          </div>

          <div className="reveal-controls">
            {revealedIndices.size < cards.length && (
              <button className="btn-secondary" onClick={handleRevealAll}>
                <Sparkles size={18} /> Revelar Todo
              </button>
            )}

            <button className="btn-collect-all" onClick={handleCollectAndFinish}>
              <CheckCircle2 size={18} /> Guardar en Mi Colección
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
