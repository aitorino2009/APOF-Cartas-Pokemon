import React, { useState, useEffect } from 'react';
import './App.css';
import Cabecera from './componentes/Cabecera/Cabecera';
import ArenaBatalla from './componentes/ArenaBatalla/ArenaBatalla';
import SobreCartas from './componentes/SobreCartas/SobreCartas';
import CreadorMazo from './componentes/CreadorMazo/CreadorMazo';
import EmpezarDuelo from './componentes/EmpezarDuelo/EmpezarDuelo';
import { getStarterDeck } from './servicios/servicioPokeApi';

const CLAVE_GUARDADO_COLECCION = 'pokecard_saved_collection';
const CLAVE_GUARDADO_MAZO = 'pokecard_saved_battle_deck';
const CLAVE_GUARDADO_MONEDAS = 'pokecard_saved_coins';
const CLAVE_GUARDADO_SOBRES = 'pokecard_saved_packs';
const CLAVE_GUARDADO_VICTORIAS = 'pokecard_saved_wins';

export default function App() {
  const [activeTab, setActiveTab] = useState('arena');
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Estado del juego
  const [collection, setCollection] = useState([]);
  const [battleDeck, setBattleDeck] = useState([]);
  const [coins, setCoins] = useState(150);
  const [packsCount, setPacksCount] = useState(2);
  const [wins, setWins] = useState(0);

  // Carga inicial
  useEffect(() => {
    async function initGameData() {
      try {
        const savedCollection = localStorage.getItem(CLAVE_GUARDADO_COLECCION);
        const savedDeck = localStorage.getItem(CLAVE_GUARDADO_MAZO);
        const savedCoins = localStorage.getItem(CLAVE_GUARDADO_MONEDAS);
        const savedPacks = localStorage.getItem(CLAVE_GUARDADO_SOBRES);
        const savedWins = localStorage.getItem(CLAVE_GUARDADO_VICTORIAS);

        if (savedCoins) setCoins(parseInt(savedCoins, 10));
        if (savedPacks) setPacksCount(parseInt(savedPacks, 10));
        if (savedWins) setWins(parseInt(savedWins, 10));

        if (savedCollection && JSON.parse(savedCollection).length > 0) {
          const parsedColl = JSON.parse(savedCollection);
          setCollection(parsedColl);

          if (savedDeck) {
            setBattleDeck(JSON.parse(savedDeck));
          } else {
            setBattleDeck(parsedColl.slice(0, 3));
          }
        } else {
          // Obtener mazo inicial de PokéAPI
          const starters = await getStarterDeck();
          setCollection(starters);
          setBattleDeck(starters.slice(0, 3));
          localStorage.setItem(CLAVE_GUARDADO_COLECCION, JSON.stringify(starters));
          localStorage.setItem(CLAVE_GUARDADO_MAZO, JSON.stringify(starters.slice(0, 3)));
        }
      } catch (err) {
        console.error('Error al inicializar mazo:', err);
      } finally {
        setLoadingInitial(false);
      }
    }

    initGameData();
  }, []);

  // Persistencia en localStorage
  useEffect(() => {
    if (!loadingInitial && collection.length > 0) {
      localStorage.setItem(CLAVE_GUARDADO_COLECCION, JSON.stringify(collection));
    }
  }, [collection, loadingInitial]);

  useEffect(() => {
    if (!loadingInitial) {
      localStorage.setItem(CLAVE_GUARDADO_MAZO, JSON.stringify(battleDeck));
    }
  }, [battleDeck, loadingInitial]);

  useEffect(() => {
    if (!loadingInitial) {
      localStorage.setItem(CLAVE_GUARDADO_MONEDAS, coins.toString());
      localStorage.setItem(CLAVE_GUARDADO_SOBRES, packsCount.toString());
      localStorage.setItem(CLAVE_GUARDADO_VICTORIAS, wins.toString());
    }
  }, [coins, packsCount, wins, loadingInitial]);

  // Acciones de sobres y recompensas
  const handleAddCardsToCollection = (newCards) => {
    setCollection(prev => [...newCards, ...prev]);
  };

  const handleConsumePack = () => {
    setPacksCount(p => Math.max(0, p - 1));
  };

  const handleBuyPack = (cost = 50) => {
    setCoins(c => Math.max(0, c - cost));
  };

  const handleBattleVictory = (coinsReward = 100) => {
    setCoins(c => c + coinsReward);
    setPacksCount(p => p + 1);
    setWins(w => w + 1);
  };

  const handleBattleDefeat = () => {
    // Registro de derrota
  };

  const handleRewardCoins = (amount) => {
    setCoins(c => c + amount);
  };

  return (
    <div className="pokecard-app">
      {/* CABECERA */}
      <Cabecera
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        coins={coins}
        packsCount={packsCount}
        wins={wins}
      />

      {/* CONTENIDO PRINCIPAL */}
      <main className="app-main-content">
        {loadingInitial ? (
          <div className="initial-loading-screen">
            <div className="pokeball-loading-spinner" />
            <h3>Conectando con PokéAPI...</h3>
            <p>Descargando cartas y datos de Kanto & Hoenn</p>
          </div>
        ) : (
          <>
            {activeTab === 'arena' && (
              <ArenaBatalla
                playerDeck={battleDeck}
                onBattleVictory={handleBattleVictory}
                onBattleDefeat={handleBattleDefeat}
              />
            )}

            {activeTab === 'packs' && (
              <SobreCartas
                packsCount={packsCount}
                coins={coins}
                onAddCardsToCollection={handleAddCardsToCollection}
                onConsumePack={handleConsumePack}
                onBuyPack={handleBuyPack}
              />
            )}

            {activeTab === 'deck' && (
              <CreadorMazo
                collection={collection}
                battleDeck={battleDeck}
                onUpdateDeck={setBattleDeck}
                maxDeckSize={3}
              />
            )}

            {activeTab === 'duel' && (
              <EmpezarDuelo
                playerCollection={collection}
                onRewardCoins={handleRewardCoins}
              />
            )}
          </>
        )}
      </main>

      {/* PIE DE PÁGINA */}
      <footer className="game-footer">
        <div className="footer-content">
          <p>
            🎮 <strong>PokéCard Arena</strong> — Desarrollado con <strong>Vite</strong>, <strong>React</strong> y la API gratuita de <a href="https://pokeapi.co/" target="_blank" rel="noopener noreferrer">PokéAPI</a>.
          </p>
          <span className="footer-tag">CSS Modular Puro en Castellano</span>
        </div>
      </footer>
    </div>
  );
}
