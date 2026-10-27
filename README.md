# 🎴 PokéCard Arena — Juego de Cartas Pokémon

Aplicación web interactiva desarrollada con **Vite**, **React** y la API oficial gratuita de **[PokéAPI](https://pokeapi.co/)**.

Cuenta con una arquitectura modular orientada a componentes nombrados en castellano, estilos desacoplados en CSS puro (sin Tailwind), motor de sonido retro con Web Audio API y flujo de trabajo estructurado en ramas de Git.

---

## 🌟 Componentes Principales (en Castellano)

1. **CartaPokemon (`CartaPokemon.jsx` / `CartaPokemon.css`)**:
   - Efecto de inclinación 3D dependiente de la posición del cursor (`transform: perspective(...)`).
   - Brillo y textura *foil* reflectante según la rareza (Común, Rara, Épica, Legendaria).
   - Barras dinámicas de puntos de salud (PS), tipos elementales oficiales y estadísticas completas (ATK, DEF, SP.A, VEL).

2. **SobreCartas (`SobreCartas.jsx` / `SobreCartas.css`)**:
   - Experiencia de sobre metalizado 3D con animación de desgarre (*tear effect*).
   - Generación aleatoria de 5 cartas de PokéAPI con pesos de rareza.
   - Revelación manual de cartas con volteo interactivo y explosión de confeti en cartas Épicas y Legendarias.

3. **CreadorMazo (`CreadorMazo.jsx` / `CreadorMazo.css`)**:
   - Selección de equipo de batalla (3 ranuras activas).
   - Panel de estadísticas promedio del mazo (PS Total, Ataque Medio, Defensa Media).
   - Bóveda de colección con buscador en tiempo real, filtros por Tipo Elemental y filtros por Rareza.

4. **ArenaBatalla (`ArenaBatalla.jsx` / `ArenaBatalla.css`)**:
   - Combates 3 vs 3 entre el jugador y entrenadores rivales controlados por IA (Rival Azul, Cynthia, Brock, Misty).
   - Tres acciones estratégicas por turno:
     - **Ataque Físico**: Daño directo basado en la estadística de Ataque.
     - **Ataque Elemental**: Aplica la tabla oficial de efectividad de tipos (x2.0 daño súper eficaz, x0.5 poco eficaz o x0 inmune).
     - **Guardia / Escudo**: Reduce el daño recibido en un 50% en el siguiente turno.
   - Banquillo interactivo para sustituir Pokémon en combate.
   - Registro de combate en tiempo real (*Battle Log*) y recompensas de monedas y sobres al vencer.

5. **EmpezarDuelo (`EmpezarDuelo.jsx` / `EmpezarDuelo.css`)**:
   - Minijuego estilo *Top Trumps* al mejor de 5 rondas.
   - Compara PS, Ataque, Defensa o Velocidad contra la carta oculta del rival.

6. **Cabecera (`Cabecera.jsx` / `Cabecera.css`)**:
   - Barra superior flotante con efecto *glassmorphism*.
   - Pestañas de navegación rápida entre modos de juego.
   - Balance en tiempo real de Monedas, Victorias y Sobres.
   - Botón para silenciar/activar los efectos de sonido y ventana modal de guía de tipos.

---

## 🏗️ Estructura del Código

```text
src/
├── componentes/
│   ├── CartaPokemon/        # Carta 3D, inclinación física y badges
│   │   ├── CartaPokemon.jsx
│   │   └── CartaPokemon.css
│   ├── SobreCartas/         # Sobre 3D, desgarre y revelación
│   │   ├── SobreCartas.jsx
│   │   └── SobreCartas.css
│   ├── CreadorMazo/         # Mazo de batalla y filtros de colección
│   │   ├── CreadorMazo.jsx
│   │   └── CreadorMazo.css
│   ├── ArenaBatalla/        # Combate por turnos con ventajas de tipo
│   │   ├── ArenaBatalla.jsx
│   │   └── ArenaBatalla.css
│   ├── EmpezarDuelo/        # Minijuego de atributos estilo Top Trumps
│   │   ├── EmpezarDuelo.jsx
│   │   └── EmpezarDuelo.css
│   └── Cabecera/            # HUD superior, recursos y modal de reglas
│       ├── Cabecera.jsx
│       └── Cabecera.css
├── servicios/
│   ├── servicioPokeApi.js   # Peticiones a PokéAPI con caché y normalización
│   ├── servicioSonido.js    # Sintetizador Web Audio API
│   └── reglasJuego.js       # Matriz completa de efectividad elemental e IA
├── estilos/
│   └── index.css            # Variables CSS globales, tokens y animaciones
├── App.jsx                  # Estado global y persistencia en localStorage
├── App.css
└── main.jsx
```

---

## 🌿 Ramas de Componentes en Git

| Rama | Descripción |
| :--- | :--- |
| `main` | Rama principal del proyecto |
| `componente/carta-pokemon` | Componente `CartaPokemon` y `CartaPokemon.css` |
| `componente/sobre-cartas` | Componente `SobreCartas` y `SobreCartas.css` |
| `componente/creador-mazo` | Componente `CreadorMazo` y `CreadorMazo.css` |
| `componente/arena-batalla` | Componente `ArenaBatalla` y `ArenaBatalla.css` |
| `componente/empezar-duelo` | Componente `EmpezarDuelo` y `EmpezarDuelo.css` |
| `componente/cabecera` | Componente `Cabecera` y `Cabecera.css` |
| `refactor/servicios-y-estilos` | Servicios y estilos en castellano |

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
