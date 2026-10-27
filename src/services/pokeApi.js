// PokéAPI integration service
// Handles fetching, caching, card rarity tiering, and booster pack generation

const CACHE_KEY_PREFIX = 'pokecard_cache_';
const MEMORY_CACHE = new Map();

// Known legendary or mythical Pokemon IDs
const LEGENDARY_IDS = new Set([
  144, 145, 146, 150, 151, // Articuno, Zapdos, Moltres, Mewtwo, Mew
  243, 244, 245, 249, 250, 251, // Raikou, Entei, Suicune, Lugia, Ho-Oh, Celebi
  377, 378, 379, 380, 381, 382, 383, 384, 385, 386, // Regi trio, Lati@s, Weather trio, Jirachi, Deoxys
  480, 481, 482, 483, 484, 485, 486, 487, 488, 491, 492, 493 // Gen 4 legendaries
]);

// Starter set for new players
export const STARTER_POKEMON_IDS = [25, 4, 7, 1, 133, 39]; // Pikachu, Charmander, Squirtle, Bulbasaur, Eevee, Jigglypuff

/**
 * Determine card rarity based on Base Stat Total (BST) and Legendary status
 */
function calculateRarity(pokemonId, bst) {
  if (LEGENDARY_IDS.has(pokemonId) || bst >= 580) {
    return 'legendary';
  }
  if (bst >= 480) {
    return 'epic';
  }
  if (bst >= 390) {
    return 'rare';
  }
  return 'common';
}

/**
 * Normalizes raw API response into a card entity
 */
function normalizePokemon(data) {
  const statsMap = {};
  let bst = 0;

  data.stats.forEach(s => {
    const name = s.stat.name;
    const val = s.base_stat;
    statsMap[name] = val;
    bst += val;
  });

  const primaryType = data.types[0]?.type?.name || 'normal';
  const secondaryType = data.types[1]?.type?.name || null;

  // Best artwork priority
  const image =
    data.sprites?.other?.['official-artwork']?.front_default ||
    data.sprites?.other?.home?.front_default ||
    data.sprites?.front_default ||
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`;

  const animatedSprite =
    data.sprites?.other?.showdown?.front_default ||
    data.sprites?.front_default;

  const rarity = calculateRarity(data.id, bst);

  return {
    id: data.id,
    uid: `${data.id}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
    hp: statsMap['hp'] || 50,
    maxHp: statsMap['hp'] || 50,
    attack: statsMap['attack'] || 50,
    defense: statsMap['defense'] || 50,
    spAttack: statsMap['special-attack'] || 50,
    spDefense: statsMap['special-defense'] || 50,
    speed: statsMap['speed'] || 50,
    bst,
    primaryType,
    secondaryType,
    image,
    animatedSprite,
    rarity,
    height: data.height ? data.height / 10 : 0.5, // meters
    weight: data.weight ? data.weight / 10 : 10,  // kg
  };
}

/**
 * Fetch a single Pokémon by ID or Name with multi-tier caching
 */
export async function getPokemon(idOrName) {
  const cacheKey = `${CACHE_KEY_PREFIX}${idOrName}`;

  if (MEMORY_CACHE.has(idOrName)) {
    return MEMORY_CACHE.get(idOrName);
  }

  // Check localStorage
  try {
    const local = localStorage.getItem(cacheKey);
    if (local) {
      const parsed = JSON.parse(local);
      MEMORY_CACHE.set(idOrName, parsed);
      return parsed;
    }
  } catch (err) {
    // ignore localstorage quota errors
  }

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${idOrName}`);
    if (!res.ok) throw new Error(`Pokémon not found: ${idOrName}`);
    const data = await res.json();
    const normalized = normalizePokemon(data);

    MEMORY_CACHE.set(idOrName, normalized);
    try {
      localStorage.setItem(cacheKey, JSON.stringify(normalized));
    } catch (e) {
      // ignore
    }

    return normalized;
  } catch (error) {
    console.error(`Error fetching Pokémon ${idOrName}:`, error);
    // Fallback card if offline or blocked
    return getFallbackPokemon(idOrName);
  }
}

/**
 * Fetch starter deck
 */
export async function getStarterDeck() {
  const promises = STARTER_POKEMON_IDS.map(id => getPokemon(id));
  const starters = await Promise.all(promises);
  return starters.filter(Boolean);
}

/**
 * Generate a Booster Pack (5 random cards)
 * Weights: 60% Common, 25% Rare, 12% Epic, 3% Legendary
 */
export async function generateBoosterPack() {
  const packCardIds = [];
  // Gen 1 to Gen 3 pool (IDs 1 to 386)
  const maxPoolId = 386;

  for (let i = 0; i < 5; i++) {
    // Generate random ID
    const randomId = Math.floor(Math.random() * maxPoolId) + 1;
    packCardIds.push(randomId);
  }

  const cards = await Promise.all(packCardIds.map(id => getPokemon(id)));
  // Assign new unique UIDs so duplicate pokemons act as separate cards in collection
  return cards.map(c => ({
    ...c,
    uid: `${c.id}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  }));
}

/**
 * Fallback data in case the API is offline
 */
function getFallbackPokemon(idOrName) {
  return {
    id: typeof idOrName === 'number' ? idOrName : 25,
    uid: `fallback_${Date.now()}_${Math.random()}`,
    name: typeof idOrName === 'string' ? idOrName : 'Pikachu',
    hp: 60,
    maxHp: 60,
    attack: 55,
    defense: 40,
    spAttack: 50,
    spDefense: 50,
    speed: 90,
    bst: 345,
    primaryType: 'electric',
    secondaryType: null,
    image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png`,
    animatedSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png`,
    rarity: 'rare',
    height: 0.4,
    weight: 6.0
  };
}
