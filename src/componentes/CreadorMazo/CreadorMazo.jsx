import React, { useState, useMemo } from 'react';
import './CreadorMazo.css';
import CartaPokemon from '../CartaPokemon/CartaPokemon';
import { sound } from '../../servicios/servicioSonido';
import { 
  Shield, 
  Swords, 
  Heart, 
  Filter, 
  Search, 
  ArrowUpDown, 
  PlusCircle, 
  MinusCircle,
  Layers,
  Sparkles
} from 'lucide-react';

const TIPOS_POKEMON = [
  'todos', 'normal', 'fire', 'water', 'grass', 'electric', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'steel', 'dark', 'fairy'
];

export default function CreadorMazo({
  collection = [],
  battleDeck = [],
  onUpdateDeck,
  maxDeckSize = 3,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('todos');
  const [selectedRarity, setSelectedRarity] = useState('todos');
  const [sortBy, setSortBy] = useState('dex'); // 'dex', 'hp', 'attack', 'defense', 'speed'

  // UIDs del mazo para búsqueda instantánea
  const deckUids = useMemo(() => new Set(battleDeck.map(c => c.uid)), [battleDeck]);

  // Filtrado y ordenación
  const filteredCollection = useMemo(() => {
    return collection
      .filter(card => {
        const matchesName = card.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === 'todos' || 
          card.primaryType === selectedType || 
          card.secondaryType === selectedType;
        const matchesRarity = selectedRarity === 'todos' || card.rarity === selectedRarity;
        return matchesName && matchesType && matchesRarity;
      })
      .sort((a, b) => {
        if (sortBy === 'hp') return (b.maxHp || 0) - (a.maxHp || 0);
        if (sortBy === 'attack') return (b.attack || 0) - (a.attack || 0);
        if (sortBy === 'defense') return (b.defense || 0) - (a.defense || 0);
        if (sortBy === 'speed') return (b.speed || 0) - (a.speed || 0);
        return (a.id || 0) - (b.id || 0);
      });
  }, [collection, searchQuery, selectedType, selectedRarity, sortBy]);

  // Estadísticas del mazo
  const deckStats = useMemo(() => {
    if (battleDeck.length === 0) return { avgAtk: 0, avgDef: 0, totalHp: 0 };
    const totalHp = battleDeck.reduce((acc, c) => acc + (c.maxHp || 0), 0);
    const avgAtk = Math.round(battleDeck.reduce((acc, c) => acc + (c.attack || 0), 0) / battleDeck.length);
    const avgDef = Math.round(battleDeck.reduce((acc, c) => acc + (c.defense || 0), 0) / battleDeck.length);
    return { totalHp, avgAtk, avgDef };
  }, [battleDeck]);

  const handleToggleDeckCard = (card) => {
    sound.playClick();
    if (deckUids.has(card.uid)) {
      const newDeck = battleDeck.filter(c => c.uid !== card.uid);
      onUpdateDeck(newDeck);
    } else {
      if (battleDeck.length >= maxDeckSize) {
        alert(`Tu mazo de batalla ya está completo (máximo ${maxDeckSize} cartas). Quita una antes.`);
        return;
      }
      onUpdateDeck([...battleDeck, card]);
    }
  };

  return (
    <div className="deck-builder-container">
      {/* SECCIÓN 1: MAZO DE BATALLA ACTIVO */}
      <div className="active-deck-panel">
        <div className="deck-panel-header">
          <div className="deck-title-group">
            <Layers className="deck-icon" size={24} />
            <div>
              <h3>Mazo de Batalla Activo ({battleDeck.length}/{maxDeckSize})</h3>
              <p>Estas cartas lucharán en la Arena Pokémon contra otros entrenadores.</p>
            </div>
          </div>

          <div className="deck-stats-pill">
            <span className="stat-chip">
              <Heart size={16} color="#ef4444" /> {deckStats.totalHp} PS Total
            </span>
            <span className="stat-chip">
              <Swords size={16} color="#fbbf24" /> {deckStats.avgAtk} ATK Medio
            </span>
            <span className="stat-chip">
              <Shield size={16} color="#38bdf8" /> {deckStats.avgDef} DEF Media
            </span>
          </div>
        </div>

        {/* Ranuras del mazo */}
        <div className="deck-slots-grid">
          {Array.from({ length: maxDeckSize }).map((_, index) => {
            const card = battleDeck[index];
            return (
              <div key={card ? card.uid : `empty-${index}`} className="deck-slot-card">
                {card ? (
                  <div className="slot-card-active">
                    <CartaPokemon
                      pokemon={card}
                      size="sm"
                      badge={`SLOT ${index + 1}`}
                      onClick={() => handleToggleDeckCard(card)}
                    />
                    <button
                      className="btn-remove-slot"
                      onClick={() => handleToggleDeckCard(card)}
                      title="Quitar del mazo"
                    >
                      <MinusCircle size={18} /> Quitar
                    </button>
                  </div>
                ) : (
                  <div className="slot-empty">
                    <div className="empty-slot-plus">+</div>
                    <span>Ranura {index + 1} Vacía</span>
                    <small>Elige una carta de tu colección abajo</small>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN 2: FILTROS Y BÚSQUEDA */}
      <div className="collection-filters-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar Pokémon por nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={16} />
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            {TIPOS_POKEMON.map(t => (
              <option key={t} value={t}>
                {t === 'todos' ? 'Todos los Tipos' : t.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <Sparkles size={16} />
          <select value={selectedRarity} onChange={(e) => setSelectedRarity(e.target.value)}>
            <option value="todos">Todas las Rarezas</option>
            <option value="common">Común</option>
            <option value="rare">Rara</option>
            <option value="epic">Épica</option>
            <option value="legendary">Legendaria</option>
          </select>
        </div>

        <div className="filter-group">
          <ArrowUpDown size={16} />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="dex">Número Pokédex</option>
            <option value="hp">Mayor PS</option>
            <option value="attack">Mayor Ataque</option>
            <option value="defense">Mayor Defensa</option>
            <option value="speed">Mayor Velocidad</option>
          </select>
        </div>
      </div>

      {/* SECCIÓN 3: BÓVEDA DE COLECCIÓN */}
      <div className="collection-vault-header">
        <h4>Tu Colección ({filteredCollection.length} {filteredCollection.length === 1 ? 'carta' : 'cartas'})</h4>
        <small>Haz clic en cualquier carta para añadirla o retirarla de tu mazo activo.</small>
      </div>

      {filteredCollection.length === 0 ? (
        <div className="collection-empty">
          <p>No se encontraron cartas con esos filtros.</p>
        </div>
      ) : (
        <div className="collection-cards-grid">
          {filteredCollection.map(card => {
            const inDeck = deckUids.has(card.uid);
            return (
              <div key={card.uid} className={`collection-card-item ${inDeck ? 'is-in-deck' : ''}`}>
                <CartaPokemon
                  pokemon={card}
                  size="sm"
                  badge={inDeck ? 'EN MAZO' : null}
                  onClick={() => handleToggleDeckCard(card)}
                />
                <button
                  className={`btn-card-action ${inDeck ? 'remove' : 'add'}`}
                  onClick={() => handleToggleDeckCard(card)}
                >
                  {inDeck ? (
                    <>
                      <MinusCircle size={14} /> Quitar
                    </>
                  ) : (
                    <>
                      <PlusCircle size={14} /> Usar en Mazo
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
