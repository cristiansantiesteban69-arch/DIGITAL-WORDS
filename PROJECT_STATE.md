# PROJECT_STATE.md

> Documento de memoria técnica. Si esta conversación llega al límite de
> contexto, abre una nueva conversación, sube/adjunta este archivo (o el
> proyecto completo) y pide a Claude que lo lea antes de continuar.
> Actualízalo al terminar cada fase — no antes.

---

## 1. Concepto general

Sitio web premium para una agencia/estudio digital que construye
soluciones digitales para cualquier tipo de negocio (sitios web, sitios
3D, experiencias interactivas, menús digitales, tiendas online, sistemas
de reservación, formularios inteligentes, automatizaciones, WhatsApp, IA
y chatbots, sistemas para despachos y notarías, inmobiliarias,
profesionales, empresas, proyectos personalizados).

**Filosofía de marca:** "IF YOU CAN IMAGINE IT, WE CAN BUILD IT."

**Concepto visual:** "FROM EARTH TO THE MOON." El visitante inicia en la
Tierra, llega a una ciudad, observa la construcción de un rascacielos
mientras hace scroll — **"THE WEBSITE IS THE BUILDING"** (concepto central
de la Fase 2) — y la cámara continúa hacia el cielo, el espacio y la
Luna. Cierre: "THE SKY IS NOT THE LIMIT." / "THE ONLY LIMIT IS THE IDEA."

## 2. Objetivo del sitio

Ser en sí mismo la demostración del servicio: una experiencia 3D
cinematográfica, no una landing corporativa. Debe convertir (contacto,
portfolio, paquetes) sin dejar de sentirse como estudio creativo /
arquitectura futurista / tecnología premium.

## 3. Arquitectura del proyecto

Proyecto Vite + React. El sitio se estructura en tres capas:

- **Capa 3D (fija):** un único `<Canvas>` de React Three Fiber montado en
  `Experience.jsx`, fijo a viewport completo, detrás de todo.
- **Capa cinematográfica (fija, solo CSS):** `cinematic-vignette`, entre
  el canvas y el contenido (viñeta + grano sutil, sin draw calls extra).
- **Capa de contenido (scrollable):** secciones HTML en `src/sections/`,
  dentro de un `journey-track` cuya altura determina cuánto dura el
  scroll. Un único `ScrollTrigger` (GSAP) sobre ese track publica el
  progreso 0-1 en `JourneyContext`.

`JourneyContext` (`src/context/JourneyContext.jsx`) sigue siendo la
única fuente de verdad de `progress` (0–1).

**Mapeo de progreso (Fase 2):** `src/lib/journeyMap.js` divide ese
`progress` compartido en dos tramos:
- `[0, HERO_END=0.08]` → hero fijado + aproximación a la ciudad.
- `[HERO_END, 1]` → narrativa de construcción del rascacielos,
  renormalizada a su propio 0-1 vía `buildingLocal(progress)`.

`src/scenes/skyscraper/buildingConfig.js` define las 7 etapas de
construcción como fracciones de `buildingLocal` (foundation 0-0.10,
structure 0.10-0.25, floors 0.25-0.45, facade 0.45-0.60, windows
0.60-0.75, systems 0.75-0.90, completion 0.90-1), siguiendo los
porcentajes aproximados del brief. `ConstructionSite.jsx` calcula estas
7 fracciones una sola vez y las reparte a los sub-componentes — sigue
existiendo un único `ScrollTrigger` para todo el sitio, sin triggers
independientes compitiendo.

**Altura del `journey-track`:** 1600vh en desktop, 1300vh en ≤1024px
(`global.css`). Se amplió respecto a la Fase 1 (400vh) porque ahora el
progreso 0-1 completo cubre las 7 etapas de construcción — con el track
corto original, todo el edificio se habría construido en un scroll de
apenas un par de pantallas.

```
agency-site/
├── PROJECT_STATE.md
├── index.html
├── src/
│   ├── App.jsx                    ← Provider + Layout + Canvas + journey-track (Hero + Captions)
│   ├── main.jsx
│   ├── styles/
│   │   ├── tokens.css              ← paleta, tipografía, espaciado
│   │   └── global.css              ← reset + vignette/grain + hero + botones + captions + journey-track (1600vh/1300vh) + responsive
│   ├── context/
│   │   └── JourneyContext.jsx      ← progress/phase compartido
│   ├── hooks/
│   │   └── useJourneyScroll.js     ← ScrollTrigger (GSAP) → progress
│   ├── lib/
│   │   ├── seededRandom.js          ← PRNG determinista (mulberry32)
│   │   ├── journeyMap.js            ← (Fase 2) HERO_END + buildingLocal()
│   │   └── device.js                ← (Fase 2) isLowDetailDevice() para reducir detalle
│   ├── components/
│   │   ├── layout/Layout.jsx       ← canvas fijo + cinematic-vignette + contenido scrollable
│   │   ├── canvas/
│   │   │   ├── Experience.jsx       ← <Canvas> único: calcula lowDetail y reveal, ensambla CityScene + ConstructionSite + AtmosphereDust + CameraRig
│   │   │   ├── CameraRig.jsx        ← (Fase 2) 8 keyframes cubriendo hero→ciudad→las 7 etapas del edificio
│   │   │   └── AtmosphereDust.jsx   ← partículas ligeras, cuenta reducida con lowDetail
│   │   └── ui/                     (vacío)
│   ├── scenes/
│   │   ├── city/
│   │   │   ├── CityScene.jsx        ← terreno + sky dome + luces frías/cálidas
│   │   │   ├── CityBlocks.jsx       ← skyline en 2 capas, cuenta reducida y capa lejana omitida con lowDetail
│   │   │   └── SkyDome.jsx          ← shader de gradiente, 1 draw call
│   │   ├── skyscraper/                                  ← (Fase 2, contenido nuevo)
│   │   │   ├── buildingConfig.js     ← constantes compartidas: FLOOR_COUNT=16, FLOOR_HEIGHT=1.9, FINAL_HEIGHT≈30.4, FOOTPRINT=4.6, STAGES, bandT(), skeletonHeightT()
│   │   │   ├── ConstructionSite.jsx  ← ensamblador: plataforma+hoarding, calcula las 7 fracciones de etapa y las reparte
│   │   │   ├── Skeleton.jsx          ← 4 columnas de esquina + núcleo central + vigas de anillo por piso (Foundation+Structure)
│   │   │   ├── Floors.jsx            ← losas por piso, InstancedMesh, revelado piso por piso con variación sutil
│   │   │   ├── Facade.jsx            ← paneles perimetrales tipo vidrio, InstancedMesh (16 pisos × 4 lados = 64 instancias)
│   │   │   ├── Windows.jsx           ← ventanas InstancedMesh con patrón de encendido escalonado (algunas nunca se encienden); `lowDetail` reduce ventanas por lado (3→2)
│   │   │   ├── RooftopSystems.jsx    ← elevador de obra que sube (etapa systems) + antena/baliza de azotea (etapa completion)
│   │   │   ├── GhostOutline.jsx      ← contorno fantasma de la altura final; ahora se disuelve por completo al llegar a completion
│   │   │   └── Crane.jsx             ← grúa (heredada de Fase 1), extraída a su propio componente, integrada con `active`
│   │   ├── earth/                  (vacío — Fase 4)
│   │   ├── space/                  (vacío — Fase 4)
│   │   └── moon/                   (vacío — Fase 4)
│   ├── sections/
│   │   ├── HeroSection.jsx         ← hero con reveal enmascarado, pin + fade/scale-out
│   │   └── ScrollCaptions.jsx      ← (Fase 2) narrativa actualizada: 01 Foundation, 02 Structure, 03 Design, 04 Development, 05 Interaction, sobre `buildingLocal`
│   ├── data/                       (vacío — Fase 3/5)
```

## 4. Tecnologías utilizadas

- **React 19 + Vite**, **Three.js + @react-three/fiber + @react-three/drei**, **GSAP + ScrollTrigger**.
- Sin router, sin CSS framework.
- **No se agregaron librerías nuevas en la Fase 2**, conforme a la
  instrucción explícita del brief — toda la construcción usa geometría
  procedural nativa de Three.js (`InstancedMesh`, `BoxGeometry`,
  `CylinderGeometry`, `ShaderMaterial`).

## 5. Sistema de diseño (decisiones de diseño)

Paleta sin cambios respecto al polish pass de Fase 1 (`--color-void`,
`--color-crane`, `--color-concrete`, `--color-blueprint`,
`--color-earth-clay`). Tipografía sin cambios (Space Grotesk / Inter /
IBM Plex Mono).

**Regla de iluminación de tres capas (Fase 2):**
- **Ciudad = ambiente frío** (`CityScene`: luz clave azulada, ambiental
  fría tenue).
- **Sitio de construcción = cálido** (`ConstructionSite`: luz puntual +
  spotlight ámbar, más intensos mientras el esqueleto/pisos suben, se
  atenúan una vez que el edificio tiene su propia iluminación).
- **Edificio = iluminación elegante y controlada** (`Windows`: mezcla
  mayoritariamente de blanco frío (`#dce6f5`) con acentos cálidos
  ocasionales (`#f2d9a8`, ~22% de las ventanas), encendido escalonado
  por umbral seedeado, ~12% de ventanas que nunca se encienden — evita
  que el edificio compita visualmente con el ámbar saturado de la grúa).

## 6. Componentes existentes

Ver el árbol de la sección 3 para la lista completa. Resumen de lo nuevo
en Fase 2, todos en `src/scenes/skyscraper/`:

- `buildingConfig.js` — única fuente de verdad numérica (alturas, pisos,
  huella, bandas de etapa).
- `Skeleton` — columnas de esquina + núcleo + vigas de anillo; crecen por
  escala/posición (no opacidad), cubriendo Foundation y Structure como
  una misma estructura que sube.
- `Floors` — losas InstancedMesh, revelado piso por piso con easing
  cuadrático, variación de huella por piso vía PRNG con semilla.
- `Facade` — paneles perimetrales InstancedMesh tipo vidrio estilizado,
  crecen verticalmente desde la línea de piso hacia arriba.
- `Windows` — InstancedMesh con `instanceColor` recalculado solo cuando
  el progreso cambia de forma significativa (cuantizado), no cada frame.
- `RooftopSystems` — elevador que sube una vez durante la etapa systems,
  antena + baliza que aparecen en completion.
- `GhostOutline` — ahora se disuelve del todo (`opacity → 0`) conforme
  `completionT → 1`, en vez de estabilizarse en una opacidad fija.
- `Crane` — misma grúa de Fase 1, extraída a componente propio, con
  parámetro `active` que modula la amplitud del balanceo idle.

`CameraRig` (Fase 2): 8 keyframes en vez de 5, cubriendo desde el
establishing shot de la ciudad hasta el plano final del edificio
terminado, siempre lo bastante alejados para que el edificio completo
quepa en cuadro (posición final `[14,16,30]`, mirando a `[0,16,-10]`).

`Experience.jsx` calcula `lowDetail` una vez al montar
(`isLowDetailDevice()`) y lo distribuye a `CityScene` (capa lejana
omitida + cuenta cercana reducida), `ConstructionSite`→`Windows`
(ventanas por lado 3→2) y `AtmosphereDust` (partículas reducidas
~45%), además de desactivar sombras y limitar `dpr` a 1 en el propio
`Canvas`.

## 7. Secciones existentes

- **Hero** (Fase 1 + polish pass, sin cambios en Fase 2).
- **Scroll captions** (Fase 2): narrativa actualizada con las 5 etapas
  del brief — "01 Foundation", "02 Structure", "03 Design",
  "04 Development", "05 Interaction" — mapeadas sobre `buildingLocal`.

## 8. Estado actual

**Fase actual: Fase 2 — "THE BUILDING" (COMPLETADA).**

Todo lo especificado en el brief de Fase 2 está implementado y conectado:
foundation, structure, floors, facade, windows+light, systems, y
completion, todas controladas por un único progreso centralizado
(`JourneyContext` → `buildingLocal`), con la grúa integrada, el ghost
outline disolviéndose en el edificio terminado, la cámara cubriendo las
7 etapas sin acercarse demasiado, los captions narrativos actualizados,
y la reducción de detalle (`lowDetail`) aplicada a ciudad, ventanas y
partículas para iPad/móvil.

La pieza que faltaba al retomar esta sesión — la altura del
`journey-track` (seguía en 400vh de la Fase 1, insuficiente para que las
7 etapas se sientan como una construcción progresiva y no un salto) — se
identificó al inspeccionar el proyecto y se corrigió (1600vh desktop /
1300vh ≤1024px).

- Build de producción verificado: `npx vite build` ✅ sin errores (57
  módulos, sin warnings nuevos más allá del aviso de tamaño de bundle ya
  conocido).
- Servidor de preview levantado y respondiendo 200 OK.
- No se avanzó a Fase 3: sin servicios, portfolio, contacto, Luna,
  espacio, Earth 3D, pricing, IA ni automatizaciones — tal como se pidió.

## 9. Funcionalidades terminadas

Fase 1 + polish pass: sin cambios (ver historial debajo en la sección 11
si se necesita detalle).

**Fase 2 — todas completadas:**
- [x] `buildingConfig.js` con constantes y bandas de etapa compartidas.
- [x] Foundation + Structure unificadas en `Skeleton` (columnas, núcleo,
      vigas de anillo), creciendo por escala/posición.
- [x] `Floors`: losas reveladas piso por piso, con variación sutil.
- [x] `Facade`: paneles perimetrales tipo vidrio, revelados tras la
      estructura.
- [x] `Windows`: patrón de encendido escalonado y parcial, respetando
      la regla ciudad-fría / sitio-cálido / edificio-elegante.
- [x] `RooftopSystems`: elevador animado + antena/baliza en completion.
- [x] `GhostOutline` extendido: se disuelve por completo al terminar.
- [x] `Crane` extraída e integrada, sin física compleja.
- [x] `CameraRig` con 8 keyframes cubriendo toda la construcción sin
      perder de vista el edificio completo.
- [x] `ScrollCaptions` actualizado con la narrativa de 5 etapas del brief.
- [x] Sistema de progreso centralizado (`journeyMap.js` + `buildingConfig.js`),
      sin ScrollTriggers adicionales compitiendo.
- [x] `lowDetail` (`device.js`) conectado de punta a punta: `Experience`
      (dpr, shadows) → `CityBlocks` (cuenta cercana/lejana) →
      `ConstructionSite`→`Windows` (ventanas por lado) → `AtmosphereDust`
      (cuenta de partículas).
- [x] Altura de `journey-track` recalibrada (1600vh / 1300vh) para dar
      espacio real a las 7 etapas.
- [x] Build de producción verificado sin errores.

## 10. Funcionalidades pendientes

- [ ] Fase 3: Secciones de servicios, industrias, sistemas digitales
      (`src/data/`, aún vacío).
- [ ] Fase 4: Transición Tierra → cielo → espacio → Luna (`scenes/earth`,
      `scenes/space`, `scenes/moon`, aún vacíos).
- [ ] Fase 5: Portfolio, paquetes, contacto, conversión.
- [ ] Fase 6: Optimización (code-splitting del bundle de three.js),
      medición de rendimiento en hardware real (iPad/iPhone físicos).

## 11. Decisiones técnicas

Heredadas de Fase 1 + polish pass: un solo `<Canvas>`, progreso
centralizado en `JourneyContext`, PRNG con semilla para layouts
estables, `damp` en vez de `lerp` fijo, geometría procedural en vez de
`.glb`.

**Nuevas en Fase 2:**
- El esqueleto (columnas+núcleo+vigas) se completa al final de la etapa
  "floors" (`skeletonHeightT` normaliza sobre 0-0.45), y todo lo que
  viene después (fachada, ventanas, sistemas, finalización) es
  decoración/detalle sobre un frame ya completo — evita tener que
  animar la altura de columnas y núcleo en cuatro lugares distintos.
- `Windows` recalcula el buffer de `instanceColor` solo cuando el
  progreso cuantizado cambia (pasos de 0.005), no en cada frame — con
  192 instancias esto habría sido barato de todos modos, pero se
  mantiene la disciplina de no subir buffers a GPU sin necesidad.
- El elevador de obra (`RooftopSystems`) se anima con una sola
  interpolación de posición (ground→roof) en vez de una animación de
  cable/polea simulada — cumple "no crear una simulación física
  compleja" del brief mientras da la sensación de actividad.
- `lowDetail` se calcula una sola vez al montar (`useMemo`, no reactivo
  a resize) porque varios de los ajustes (cuenta de instancias en
  `InstancedMesh`, `dpr` del `Canvas`) están fijados en la creación del
  objeto — cambiarlos a mitad de sesión requeriría remontar esas
  escenas. Ver "Problemas conocidos".
- La altura de `journey-track` se fijó en un valor concreto (1600vh)
  en vez de derivarla proporcionalmente del número de pisos u otra
  fórmula — es una decisión de ritmo/sensación cinematográfica, no un
  cálculo técnico, y se ajusta a mano si el resultado se siente
  demasiado largo o corto al revisar.
- No se agregó ninguna librería nueva, conforme a la instrucción
  explícita del brief.

## 12. Problemas conocidos

- El bundle de producción supera 500kB (three.js) — se resuelve con
  code-splitting en Fase 6.
- No se realizó verificación visual con captura de pantalla en este
  entorno (sin navegador headless disponible); la validación se apoyó en
  build exitoso + revisión de código + servidor de preview respondiendo
  correctamente. Se recomienda que Cristian revise visualmente
  (`npm run dev`) el ritmo del scroll de las 7 etapas — la altura de
  1600vh es una primera estimación razonable, pero el "sentir" correcto
  del ritmo solo se confirma probándolo.
- `lowDetail` (Fase 2) se calcula una sola vez al montar y no reacciona
  a cambios de tamaño de ventana/orientación en vivo — aceptable para
  el caso de uso (detectar teléfono vs. desktop al cargar), pero un
  redimensionamiento de ventana a mitad de sesión (p. ej. modo
  responsive del navegador) no recalculará las cuentas de instancias.
- El rendimiento en iPad/iPhone reales (no emulados) sigue sin medirse
  en este entorno; las decisiones de `lowDetail` están pensadas para
  mantenerlo dentro de presupuesto, pero la verificación en hardware
  real queda pendiente (Fase 6 o antes, si Cristian lo detecta al
  revisar).
- Los rangos de `JOURNEY_PHASES` en `JourneyContext.jsx` (heredados de
  Fase 0/1) no se usan activamente por el código de Fase 2 — el mapeo
  real de progreso ahora vive en `journeyMap.js` y `buildingConfig.js`.
  Quedan en `JourneyContext` como metadata (`phase` derivada) pero
  podrían desalinearse de la experiencia real; revisar/unificar si se
  nota inconsistencia en fases futuras.

## 13. Próximos pasos

Esperar instrucción explícita para iniciar **Fase 3: Servicios,
industrias y sistemas digitales.**
