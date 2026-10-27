import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header/Header';
import BattleArena from './components/BattleArena/BattleArena';
import BoosterPack from './components/BoosterPack/BoosterPack';
import DeckBuilder from './components/DeckBuilder/DeckBuilder';
import StatDuel from './components/StatDuel/StatDuel';
import { getStarterDeck } from './services/pokeApi';

const STORAGE_KEY_COLLECTION = 'pokecard_saved_collection';
const STORAGE_KEY_DECK = 'pokecard_saved_battle_deck';
const STORAGE_KEY_COINS = 'pokecard_saved_coins';
const STORAGE_KEY_PACKS = 'pokecard_saved_packs';
const STORAGE_KEY_WINS = 'pokecard_saved_wins';

export default function App() {
  const [activeTab, setActiveTab] = useState('arena');
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Game state
  const [collection, setCollection] = useState([]);
  const [battleDeck, setBattleDeck] = useState([]);
  const [coins, setCoins] = useState(150);
  const [packsCount, setPacksCount] = useState(2);
  const [wins, setWins] = useState(0);

  // Initialize data on mount
  useEffect(() => {
    async function initGameData() {
      try {
        const savedCollection = localStorage.getItem(STORAGE_KEY_COLLECTION);
        const savedDeck = localStorage.getItem(STORAGE_KEY_DECK);
        const savedCoins = localStorage.getItem(STORAGE_KEY_COINS);
        const savedPacks = localStorage.getItem(STORAGE_KEY_PACKS);
        const savedWins = localStorage.getItem(STORAGE_KEY_WINS);

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
          // Fetch starters from PokéAPI
          const starters = await getStarterDeck();
          setCollection(starters);
          setBattleDeck(starters.slice(0, 3));
          localStorage.setItem(STORAGE_KEY_COLLECTION, JSON.stringify(starters));
          localStorage.setItem(STORAGE_KEY_DECK, JSON.stringify(starters.slice(0, 3)));
        }
      } catch (err) {
        console.error('Failed to initialize starter deck:', err);
      } finally {
        setLoadingInitial(false);
      }
    }

    initGameData();
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!loadingInitial && collection.length > 0) {
      localStorage.setItem(STORAGE_KEY_COLLECTION, JSON.stringify(collection));
    }
  }, [collection, loadingInitial]);

  useEffect(() => {
    if (!loadingInitial) {
      localStorage.setItem(STORAGE_KEY_DECK, JSON.stringify(battleDeck));
    }
  }, [battleDeck, loadingInitial]);

  useEffect(() => {
    if (!loadingInitial) {
      localStorage.setItem(STORAGE_KEY_COINS, coins.toString());
      localStorage.setItem(STORAGE_KEY_PACKS, packsCount.toString());
      localStorage.setItem(STORAGE_KEY_WINS, wins.toString());
    }
  }, [coins, packsCount, wins, loadingInitial]);

  // Card & Booster Actions
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
    setPacksCount(p => p + 1); // Reward 1 free booster pack on victory!
    setWins(w => w + 1);
  };

  const handleBattleDefeat = () => {
    // Keep stats intact
  };

  const handleRewardCoins = (amount) => {
    setCoins(c => c + amount);
  };

  return (
    <div className="pokecard-app">
      {/* GLOBAL HEADER */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        coins={coins}
        packsCount={packsCount}
        wins={wins}
      />

      {/* MAIN VIEWPORT */}
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
              <BattleArena
                playerDeck={battleDeck}
                onBattleVictory={handleBattleVictory}
                onBattleDefeat={handleBattleDefeat}
              />
            )}

            {activeTab === 'packs' && (
              <BoosterPack
                packsCount={packsCount}
                coins={coins}
                onAddCardsToCollection={handleAddCardsToCollection}
                onConsumePack={handleConsumePack}
                onBuyPack={handleBuyPack}
              />
            )}

            {activeTab === 'deck' && (
              <DeckBuilder
                collection={collection}
                battleDeck={battleDeck}
                onUpdateDeck={setBattleDeck}
                maxDeckSize={3}
              />
            )}

            {activeTab === 'duel' && (
              <StatDuel
                playerCollection={collection}
                onRewardCoins={handleRewardCoins}
              />
            )}
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="game-footer">
        <div className="footer-content">
          <p>
            🎮 <strong>PokéCard Arena</strong> — Desarrollado con <strong>Vite</strong>, <strong>React</strong> y la API gratuita de <a href="https://pokeapi.co/" target="_blank" rel="noopener noreferrer">PokéAPI</a>.
          </p>
          <span className="footer-tag">CSS Modular Puro • Git Component Branches</span>
        </div>
      </footer>
    </div>
  );
}
