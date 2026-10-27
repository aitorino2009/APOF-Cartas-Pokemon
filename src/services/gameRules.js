// Complete Pokémon Elemental Type Effectiveness and Combat Engine

export const TYPE_CHART = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  ice:      { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground:   { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying:   { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:      { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  fairy:    { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

/**
 * Returns type effectiveness multiplier: 0, 0.5, 1, or 2 (or 4 if dual type)
 */
export function getTypeMultiplier(attackType, defenderPrimaryType, defenderSecondaryType = null) {
  if (!attackType || !defenderPrimaryType) return 1.0;

  const atk = attackType.toLowerCase();
  const def1 = defenderPrimaryType.toLowerCase();

  let mult = 1.0;
  if (TYPE_CHART[atk] && TYPE_CHART[atk][def1] !== undefined) {
    mult *= TYPE_CHART[atk][def1];
  }

  if (defenderSecondaryType) {
    const def2 = defenderSecondaryType.toLowerCase();
    if (TYPE_CHART[atk] && TYPE_CHART[atk][def2] !== undefined) {
      mult *= TYPE_CHART[atk][def2];
    }
  }

  return mult;
}

/**
 * Calculate damage for combat
 */
export function calculateDamage({
  attacker,
  defender,
  moveType = 'physical', // 'physical' | 'elemental'
  isGuarding = false
}) {
  const isElemental = moveType === 'elemental';
  const attackStat = isElemental ? (attacker.spAttack || attacker.attack) : attacker.attack;
  const defenseStat = isElemental ? (defender.spDefense || defender.defense) : defender.defense;

  // Base move power
  const basePower = isElemental ? 50 : 40;

  // Type effectiveness multiplier
  const typeMultiplier = isElemental 
    ? getTypeMultiplier(attacker.primaryType, defender.primaryType, defender.secondaryType)
    : 1.0;

  // Critical hit check (10% base + speed bonus)
  const critChance = 0.08 + (attacker.speed / 1000);
  const isCritical = Math.random() < critChance;
  const critMultiplier = isCritical ? 1.5 : 1.0;

  // Random variance between 0.85 and 1.15
  const variance = 0.85 + Math.random() * 0.3;

  // Damage formula
  const rawDamage = ((attackStat / Math.max(defenseStat, 20)) * basePower * 0.5 + 5);
  let finalDamage = Math.round(rawDamage * typeMultiplier * critMultiplier * variance);

  if (isGuarding) {
    finalDamage = Math.max(1, Math.round(finalDamage * 0.5));
  }

  return {
    damage: Math.max(1, finalDamage),
    typeMultiplier,
    isCritical,
    effectivenessText: getEffectivenessDescription(typeMultiplier)
  };
}

function getEffectivenessDescription(multiplier) {
  if (multiplier === 0) return '¡No tiene ningún efecto!';
  if (multiplier >= 2) return '¡Es súper eficaz!';
  if (multiplier < 1) return 'No es muy eficaz...';
  return '¡Golpe certero!';
}

/**
 * Rival AI decision engine
 */
export function chooseAiAction(aiActiveCard, playerActiveCard, aiDeck) {
  // Check type advantage for elemental attack
  const multiplier = getTypeMultiplier(
    aiActiveCard.primaryType,
    playerActiveCard.primaryType,
    playerActiveCard.secondaryType
  );

  // If AI HP is critically low (<25%) and has bench pokemon, might guard or strike desperately
  const hpRatio = aiActiveCard.hp / aiActiveCard.maxHp;

  if (hpRatio < 0.25 && Math.random() < 0.4) {
    return { type: 'guard' };
  }

  // If elemental attack is super effective (>= 2x), use elemental attack
  if (multiplier >= 1.5 || Math.random() < 0.55) {
    return { type: 'elemental' };
  }

  return { type: 'physical' };
}
