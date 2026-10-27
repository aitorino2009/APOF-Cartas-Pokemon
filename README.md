# 🎴 PokéCard Arena — Juego de Cartas Pokémon

Aplicación web interactiva desarrollada con **Vite**, **React** y la API oficial gratuita de **[PokéAPI](https://pokeapi.co/)**.

Cuenta con una arquitectura modular orientada a componentes, estilos desacoplados en CSS puro (sin dependencias como Tailwind), motor de sonido retro con Web Audio API y flujo de trabajo estructurado en ramas de Git.

---

## 🌟 Características Principales

1. **Cartas Holográficas 3D (`PokemonCard`)**:
   - Efecto de inclinación 3D dependiente de la posición del cursor (`transform: perspective(...)`).
   - Brillo y textura *foil* reflectante según la rareza (Común, Rara, Épica, Legendaria).
   - Barras dinámicas de puntos de salud (HP), tipos elementales oficiales y estadísticas completas (ATK, DEF, SP.A, SPD).

2. **Simulador de Apertura de Sobres (`BoosterPack`)**:
   - Experiencia de sobre metalizado 3D con animación de desgarre (*tear effect*).
   - Generación aleatoria de 5 cartas de PokéAPI con pesos de rareza.
   - Revelación manual de cartas con volteo interactivo y explosión de confeti en cartas Épicas y Legendarias.

3. **Gestor de Mazo y Colección (`DeckBuilder`)**:
   - Selección de equipo de batalla (3 ranuras activas).
   - Panel de estadísticas promedio del mazo (HP Total, Ataque Medio, Defensa Media).
   - Bóveda de colección con buscador en tiempo real, filtros por Tipo Elemental y filtros por Rareza.

4. **Arena de Batalla por Turnos (`BattleArena`)**:
   - Combates 3 vs 3 entre el jugador y entrenadores rivales controlados por IA (Rival Azul, Cynthia, Brock, Misty).
   - Tres acciones estratégicas por turno:
     - **Ataque Físico**: Daño directo basado en la estadística de Ataque.
     - **Ataque Elemental**: Aplica la tabla oficial de efectividad de tipos (x2.0 daño súper eficaz, x0.5 poco eficaz o x0 inmune).
     - **Guardia / Escudo**: Reduce el daño recibido en un 50% en el siguiente turno.
   - Banquillo interactivo para sustituir Pokémon en combate.
   - Registro de combate en tiempo real (*Battle Log*) y recompensas de monedas y sobres al vencer.

5. **Duelo Rápido de Atributos (`StatDuel`)**:
   - Minijuego estilo *Top Trumps* al mejor de 5 rondas.
   - Compara HP, Ataque, Defensa o Velocidad contra la carta oculta del rival.

6. **Efectos de Sonido Nativo (`soundService`)**:
   - Sintetizador de audio con **Web Audio API** integrado (sin dependencias de archivos de audio externos ni retardos de carga).
   - Sonidos arcade para golpes, golpes súper eficaces, volteo de cartas, apertura de sobres, fanfarria de victoria y derrota.
   - Botón de silenciar/activar audio accesible desde el encabezado.

---

## 🏗️ Estructura de Componentes y Código

```text
src/
├── components/
│   ├── PokemonCard/         # Carta 3D, inclinación física y badges
│   │   ├── PokemonCard.jsx
│   │   └── PokemonCard.css
│   ├── BoosterPack/         # Sobre 3D, desgarre y revelación
│   │   ├── BoosterPack.jsx
│   │   └── BoosterPack.css
│   ├── DeckBuilder/         # Mazo de batalla y filtros de colección
│   │   ├── DeckBuilder.jsx
│   │   └── DeckBuilder.css
│   ├── BattleArena/         # Combate por turnos con ventajas de tipo
│   │   ├── BattleArena.jsx
│   │   └── BattleArena.css
│   ├── StatDuel/            # Minijuego de atributos estilo Top Trumps
│   │   ├── StatDuel.jsx
│   │   └── StatDuel.css
│   └── Header/              # HUD superior, recursos y modal de reglas
│       ├── Header.jsx
│       └── Header.css
├── services/
│   ├── pokeApi.js           # Peticiones a PokéAPI con caché y normalización
│   ├── soundService.js      # Sintetizador Web Audio API
│   └── gameRules.js         # Matriz completa de efectividad elemental e IA
├── styles/
│   └── index.css            # Variables CSS globales, tokens y animaciones
├── App.jsx                  # Estado global y persistencia en localStorage
├── App.css
└── main.jsx
```

---

## 🌿 Estructura de Ramas en Git

El proyecto ha sido desarrollado siguiendo un flujo de ramas de características (*feature branches*) independientes:

| Rama | Descripción |
| :--- | :--- |
| `main` | Rama principal estable del proyecto |
| `feature/pokemon-card-component` | Desarrollo del componente `PokemonCard` |
| `feature/booster-pack-component` | Desarrollo del componente `BoosterPack` |
| `feature/deck-builder-component` | Desarrollo del componente `DeckBuilder` |
| `feature/battle-arena-component` | Desarrollo del componente `BattleArena` |
| `feature/stat-duel-component` | Desarrollo del componente `StatDuel` |
| `feature/header-navigation-component` | Desarrollo del componente `Header` |
| `feature/app-integration` | Integración general, persistencia y estado |

---

## 🚀 Instalación y Ejecución Local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo en Vite
npm run dev

# 3. Compilar bundle de producción
npm run build
```

Abre en tu navegador: **http://localhost:5173/**
