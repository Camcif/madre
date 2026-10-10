# Traspaso · Salas, Macroverso, Enlaces y BISHOP

Estado al `2026-10-09`, en `main` local, **sin push y sin publicar**. Escrito para que otra
sesión (Codex, Claude u otro agente) continúe sin leer las conversaciones que lo produjeron. Este
repositorio no lleva `.ahp/`: este archivo es el relevo, y **se reescribe al cerrar cada fase**
(la versión de 3d quedó desfasada dos fases y se corrigió en el commit de 4b). Las reglas de
ejecución siguen siendo las de `docs/MACROVERSO-ENCARGO.md`; el estado de cada hallazgo y
decisión vive en `docs/MACROVERSO.md` (§3, §7, §8, §9) y aquí solo se señala.

---

## 1 · Qué hay en el árbol

| Commit | Quién | Qué |
|---|---|---|
| `06ba8b3` | Claude | D-S01..06 cerradas, segunda lectura del código, el encargo |
| `f195583` | Claude | 3a · `public/nostromo-engine.js`, el Macroverso como flota de NOSTROMOs |
| `b93928b` | Claude | 3b · `src/enlaces.mjs`: contrato, llave del canal, `GET /api/enlace/memories`; S-008 |
| `8acdd74` · `5ae1dca` · `6085e24` | Claude | 3c · interfaz, servidor (`pulse-enlaces`), cierre |
| `891e30e` · `be0e357` | Claude | 3d · `madre salas`, la sala de Salas, tecla MACROVERSO |
| `63ab64c` | Claude | Primer traspaso |
| `ca97e94` | Codex | Preflight de 4a y 4b; S-024 (compuerta) |
| `cd023be` | Codex | S-019 y S-025: la purga conserva zona, refutación y recall; redacta correcciones |
| `20f16a3` | Codex | S-026 (compuerta del adaptador local) |
| `45a7af9` | Codex | 4a · módulo BISHOP, bloque `bishop` en el prompt, censo, notas enlazadas para `@madre` |
| `aabeb5d` | Codex | Preflight de 4b; S-027 y S-028 (compuertas) |
| `aaace0f` | Claude | 4b · órdenes de BISHOP; S-027, S-028 y S-031 arreglados; S-029 y S-030; desfase de documentos corregido |
| `ea7b253` | Claude | 4c · modos, propuestas `#3`/`#4` en su sala, `/bishop` desde cualquier sala, asistente de enlaces; S-029 arreglado, S-030 cerrado, D-S12; S-032 y S-033 |
| `78bbd2d` | Claude | D-S13 (BISHOP firma enlaces de lectura, 7 días) y S-032 (Salas no delega) |
| `d453015` | Claude | S-021 completo (cada lectura con su agente y su turno vivo) y 3e (recordar en cada turno, con casilla) |
| `cf453ca` | Claude | UX · autor y encabezado de los mensajes traídos por BISHOP |
| `e450832` | Claude | UX · ajustes de BISHOP en palabras (`choices` en el SDK) |
| `d69ae55` | Claude | UX · menos líneas por plan, pies cortos, «leyó / recordó» en el pie de su respuesta |
| `c3c7025` | Claude | UX · segunda barra (casa, recargar, engrane), burbuja de BISHOP con su robot, agentes en relieve |
| `a38e095` | Claude | UX · sala en capas (tonos de blanco y sombra, sin transparencias), agentes planos, casa y engrane con movimiento, chip de Memoria |
| `e611b5b` | Claude | UX · líneas de la sala (capa 0) con su forma también sin fondo de paisaje; los avisos conservan su color |
| `5edf35a` | Claude | UX · doce ajustes (esfuerzo, foco, escritorio, editor, ventanas, ficha de agente, selector, tableros, tablas, MU/TH/UR, sesión) y precio de lista para Codex, Gemini y OpenCode (`src/prices.mjs`) |
| `a7e5867` | Claude | UX · «sigue abierto» sin cortes, fichas de NOSTROMO como ventanas, NOSTROMO más amplio, El núcleo en el lenguaje de la sala, preguntas de módulos en la hoja |
| `dc50ec9` | Claude | UX · las barras y las esferas de agente quedan fuera del gesto del escritorio (`NOT_DESK`) |
| `c3b91f7` | Claude | UX · la conversación en planos de profundidad (`--depth-*`, una fórmula de elevación; sustituye la escalera de capas de la conversación) |
| `dbac08f` | Claude | UX · «sigue abierto aquí» en vidrio líquido (el de la barra, más claro) |
| `925e63c` | Claude | UX · «sigue abierto aquí» sin bisel, con el vidrio de modo · modelo · esfuerzo |
| `abee3ff` | Claude | UX · detener plan redondo, botones del aviso CREATE, sin subrayado en el esfuerzo, cita dentro de la caja |
| `09eb9a1` | Claude | UX · el vidrio de «sigue abierto» vuelve: el desvanecido pasa de la fila a la píldora cortada |
| `ae60641` | Claude | Cierre de la jornada de UX del 2026-10-09: resumen en §1·b |
| `6f1f4b4` | Claude | Macroverso vivo: universos lejanos animados (`frozen`), luz y tamaño por distancia, oscuridad de borde a borde, ventanas de memoria, venas con pulsos |
| `65ca14d` | Claude | El lobby: primera pantalla de `npx madre`, agregar proyectos con botón, BISHOP como sección, asistente de primera vez |
| `b0f8868` | Claude | El lobby como tablero (propuesta C2 de Bento): BISHOP al centro y abrible en pestaña nueva, buscador y filtro, te esperan, mapa de enlaces, memoria, agentes, apariencia y ajustes del lobby |
| `82f03d8` | Claude | Lobby: las teclas son las de la sala |
| `24ae480` | Claude | Lobby: resumen de @madre de lo último trabajado, decisiones recientes, «Te necesita», bienvenida animada; rieles, buscador y cerrar de la sala |
| `a99015a` | Claude | Macroverso: BISHOP al centro con las venas de sus enlaces, enlazar llevando un universo a BISHOP, teclas de la sala de noche, menos brillo y pulsos más chicos a lo lejos |
| `a801530` | Claude | Macroverso: BISHOP como esfera de gas nebuloso con un ojo que todo lo ve |
| `e457bd3` | Claude | BISHOP más real (esfera iluminada, nebulosa, ojo sobre la esfera que parpadea y sigue al puntero) y enlazar como asistente paso a paso |
| `3632ca6` | Claude | Lobby: hojas con el material de la ventana de Ajustes; enlazar rehecho en el lenguaje de Ajustes; carpetas que caen en su casilla; el pulso detrás de las salas |
| `f9127dc` | Claude | Enlazar: escena al estilo de la bienvenida (nodos, cable que fluye, notas que cruzan) y todo en una vista, sin scroll |
| `bc4c5fb` | Claude | Lobby: barra superior como la de las salas (proyectos abiertos, agentes, te esperan, versión, enlaces, macroverso; recargar y ajustes aparte) |
| *este commit* | Claude | Lobby: sin título ni subtítulo, herramientas al centro; fondo de pantalla de la sala en Ajustes del lobby |

Árbol limpio al cerrar la jornada de UX del 2026-10-09. Suite **649/649** y `npm run pack:check` en
verde. Con la máquina cargada (load ~7–9, salas y agentes trabajando) fallan sueltas algunas pruebas
de tiempo (un turno detenido por el humano, split, Ollama, una de MCP): cada una pasa sola; no son de
los cambios de UX. La de NOSTROMO con muestra aleatoria sigue fallando a veces, verde al repetir.

### 1·b · Jornada de UX del 2026-10-09 (de `a38e095` a este commit)

Diez rondas pedidas por el humano con capturas, cada una en su commit, verificadas en el navegador
(Claude Browser, sala `pulse` en 4401). Lo esencial, para no tener que leer los diez:

- **La conversación en planos** (`c3b91f7`, THE CANVAS IN PLANES al final de `public/styles.css`):
  `--depth-user` 60 · `--depth-critical` 50 · `--depth-system` 40 · `--depth-agent` 30 ·
  `--depth-metadata` 20 · `--depth-canvas` 0. Profundidad por material (sólido → translúcido),
  borde de contacto y una sola fórmula de elevación que crece con el plano. Sustituyó la escalera
  de tonos de blanco de `a38e095`, que sigue solo para la caja de texto (capa 4, con su hundido).
- **Vidrio**: las preguntas de «sigue abierto aquí» llevan el material de la fila modo · modelo ·
  esfuerzo (`925e63c`), no el bisel de la barra (lo pidió así tras verlo en `dbac08f`). Su fila
  encaja por pregunta y desvanece solo la píldora cortada (`09eb9a1`).
- **Barras**: segunda barra (casa, recargar, engrane) de la ronda anterior; la casa se sacude y el
  engrane gira y se ilumina con el centro hueco; las esferas de agente son planas y ya no son
  «escritorio» para el gesto de apartar ventanas (`dc50ec9`).
- **NOSTROMO**: fichas de memoria como ventanas (hasta cuatro, se mueven por el encabezado),
  `CORE_R` 114 y `NOSTROMO_ORBIT` 360 (`a7e5867`).
- **El núcleo**: deja la terminal verde por el lenguaje de Ajustes y MU/TH/UR; sus frases siguen en
  mayúsculas en el código y se leen en oración con `coreWords` (`a7e5867`).
- **Precios** (`5edf35a`, `src/prices.mjs`): Codex, Gemini y OpenCode con «≈ $» a precio de lista
  de su modelo, solo para modelos leídos dos veces en la página del proveedor el 2026-10-09.
  Confirmado en vivo: una respuesta de Codex (gpt-5.6-luna) mostró «≈ < $0.01».
- **Pequeños**: chip de memoria en Ajustes; ficha de consumo por grupos; tablas con encabezados y
  cifras a la derecha; tableros de módulos alineados; MU/TH/UR con sus herramientas junto al riel;
  indicadores de sesión verde/ámbar/rojo de la marca; selector con los no elegidos atenuados;
  editor con tipo junto al nombre y LEER · EDITAR · ABRIR EN CRUDO en un chip; detener plan como
  botón redondo; botones del aviso CREATE en cápsulas; la cita de respuesta dentro de la caja.

**Reglas visuales que dejó el humano en esta jornada** (vigentes para lo que siga):
- Profundidad por planos, no por sombras grandes; sin glow, halo, neón ni bordes brillantes; sin
  desenfoque del texto; no cambiar tamaños, letra, colores de marca ni alineación del chat.
- Vidrio de las píldoras sobre la caja = el de la fila modo · modelo · esfuerzo (sin bisel).
- Los textos de las piezas nuevas, en oración y en la letra de la sala; mono solo para lo literal.
- Los indicadores de sesión son lo único con tres colores de estado (verde, ámbar, rojo de marca).

**Sin verificar en pantalla**: el modal de desinstalar con un módulo propio (no hay uno instalado);
el giro y la sacudida de la casa y el engrane (el panel del navegador no anima oculto); el
teléfono; un turno real de Gemini u OpenCode con precio. OpenCode solo tendrá precio con un modelo
elegido en la caja o `PULSE_OPENCODE_MODEL`, y no para variantes `-fast` (no están en la tabla).

**Trampas técnicas** (detalle en §5): `backdrop-filter` nunca dentro de `#messages`; una máscara o
filtro en un contenedor corta el vidrio de sus hijos; `#messages#messages` existe para ganarle a
las reglas de los fondos de paisaje; sin fondo de paisaje la página borra `data-wallpaper`; en el
panel oculto del navegador no avanzan transiciones, `requestAnimationFrame` ni `ResizeObserver`.

## 2 · Mapa de lo construido

**Motor y Macroverso (3a).** `public/nostromo-engine.js` (física y pintores de NOSTROMO,
`createNostromo(scene)` con ganchos `words`, `covered`, `onClang` y bandera `bare`);
`public/macroverso.js` (sprites lejos, una sola escena viva cerca, `drawVeins` único lugar con
curvas, `__macroverso.peek()`); datos por `GET /api/salas/universe`.

**Enlaces (3b, 3c).** `src/enlaces.mjs`: contrato en `config.json` bajo `enlaces`, revocar sella
y nunca borra; llave del canal en `~/.pulse/credentials/enlaces.json`, cabecera `x-madre-enlace`;
`a→b` = las notas viajan de a a b. Cruces en `<sala>/enlaces.jsonl` con tres tipos: `read`,
`received` y, desde 4b, `order`. Rutas `/api/enlace/*` y `/api/salas/enlaces[/revoke]` en
`src/server.mjs`. Módulo ENLACES (`src/modules/enlaces.mjs`) = servidor MCP `pulse-enlaces`.

**La sala de Salas (3d).** `src/salas.mjs` (`salasRoomId`, `isSalasRoom`, `projectRootFor`…);
`madre salas`; `madre` desde `$HOME` abre ese cuaderno; `GET /api/state` trae `salas: true` solo
ahí. Nunca entrega notas; es la única que puede recibir permiso de órdenes.

**BISHOP, consulta (4a, Codex).** `src/modules/bishop.mjs`: ficha solo en Salas, elección del
agente (por defecto `@madre` si Ollama está listo), bloque `bishop` ≤ 1500 caracteres en el prompt
(`src/room/prompt.mjs`, conducto `bishopForTurn` en `src/room.mjs`/`src/server.mjs`); para
`@madre`, hasta 12 notas enlazadas por turno con reglas propias en `src/adapters/madre.mjs`.

**BISHOP, órdenes (4b).**
- `Room.order({ text, target, mode })` en `src/room.mjs` (S-028): mismo camino que `send()`,
  con `via: 'bishop'`, `depth: 1` y sin delegación fijos en el proceso; solo `#0`–`#2`.
- `wireModules()` en `src/server.mjs` (S-027): `onEvent` de los módulos sobre cada conversación
  viva; `services.recordIn(chat, …)`; rutas de módulo con `viaPhone`.
- `src/modules/bishop.mjs`: `parsePlan`, `resolveOrders`, `orderHeader`, planes en
  `bishop-plans.json` junto a la sala de Salas, rutas `POST /api/x/bishop/send|skip|order|result`.
- `src/dataset.mjs`: un mensaje `via: 'bishop'` no forma pares.
- Página (`public/app.js`): `renderBishopPlan`, `markBishopOrder`, `renderBishopLine`, la tarjeta
  de respuesta en `renderCommandCard` y la insignia «de BISHOP · orden n de m» en el mensaje.
- Pruebas: `test/bishop.test.mjs` (4a) y `test/bishop-orders.test.mjs` (4b).

**BISHOP, 4c y D-S12.**
- `src/modules/bishop-plan.mjs`: lo puro (bloque con órdenes y enlaces, `resolveOrder`,
  `resolveLinks`, planes, `orderHeader`, `consultHeader`). `src/modules/bishop.mjs`: el módulo.
- Modos `manual` / `hybrid` / `auto` en la ficha (`modules.bishop.mode`); `advance()` envía lo que el
  modo deja, `halt()` lo detiene tras un fallo o un STOP ALL (`room.stopped` en Salas).
- Propuestas `#3`/`#4` a su sala en cualquier modo (`/api/x/bishop/proposal`), tarjeta «Armar y
  enviar» en la página y «te espera» en Salas (`trackAsks`, S-033).
- `/bishop` (comando del módulo): despierta Salas si duerme, `/api/x/bishop/consult` corre la
  pregunta allí con `Room.order()` y `/api/x/bishop/answer` la devuelve como `bishop.answer`.
- Asistente de enlaces: líneas `enlace A → B: tipos; N días; órdenes #n`; `/api/x/bishop/link`
  firma por la misma ruta que la hoja de Salas y libera las órdenes que esperaban ese enlace.
- S-030: con `@madre`, solo responde (`onlyAnswers`); S-029: patrón de plan en `#runTurn`.
- D-S13: `signed.by: 'bishop'` en el contrato (solo lectura, ≤ 7 días), `signLink(…, { by: 'bishop' })`,
  ajuste `modules.bishop.links` (`bishop` | `you`). S-032: `delegation: false` en la sala de Salas.
- Pruebas: `test/bishop-4c.test.mjs`.

**S-021 y 3e.**
- `src/room.mjs`: `#liveTurns` y `runningTurn(id)` (agente y modo del turno vivo, por el id de su
  respuesta); el id viaja a `toolsForTurn`, `bishopForTurn` y `linkedForTurn` (nuevo).
- `src/server.mjs`: `POST /api/enlace/ask` no lee si el turno no corre ahí para ese agente arriba
  de GHOST; `POST /api/salas/enlaces/recall` (solo la página); `linkedForTurn` → `recallForTurn`.
- `src/enlaces.mjs`: `recall` en el contrato, `RECALL_NOTES` = 3, agente y turno en cada cruce,
  `linkTraffic` con el último agente. `src/modules/enlaces.mjs`: `PULSE_ENLACES_AGENT` y
  `PULSE_ENLACES_TURN`, y `recallForTurn`. `src/room/prompt.mjs`: bloque `linked`.
- Página: «leyó / recordó N notas de …» bajo cada respuesta; Salas: casilla en la hoja y en cada
  enlace, y quién leyó al último. Pruebas: `test/enlaces-recall.test.mjs` y la de 3c reescrita.

**Documentación al día:** `CHANGELOG.md` (*Sin publicar*), `docs/REFERENCE.md` (SALAS: Macroverso,
Enlaces, La sala de Salas, BISHOP y sus rutas), `docs/SDK.md` (`onEvent`, `viaPhone`),
`docs/MACROVERSO.md` (bitácora completa).

## 3 · Lo que falta

Ninguna fase del encargo. Todo cambio futuro hereda sin discusión D-S11 a D-S14 (cerradas por el
humano; `docs/MACROVERSO.md` §7): el canal nunca lleva `#3`/`#4`; una orden a la vez por sala y
nunca sobre una sala ocupada; lo automático cuenta contra el `perHour` del contrato y se detiene
con un fallo o STOP ALL; `Room.order()` es la única puerta de una orden o de una pregunta traída por
el canal; un enlace con órdenes lo firma el humano y BISHOP solo firma enlaces de lectura de 7 días
como máximo; toda lectura pertenece a un turno vivo; el recuerdo automático solo lo marca el humano.

## 4 · Decisiones que necesita el humano

| # | Qué | Recomendación | Bloquea |
|---|---|---|---|
| 1 | **D-S08** · la carpeta de la sala de Salas no se cambia en Ajustes | Dejarlo, o nunca | — |
| 2 | `madre doctor` desde `$HOME` reporta el cuaderno de Salas (consecuencia de D-S09) | Mantener | — |
| 3 | `enlaces.jsonl` y `bishop-plans.json` no rotan por tamaño (los planes guardan los últimos 40); ENLACES y BISHOP sin ícono propio; el aviso de firma no llega a salas dormidas | Rotar si crece; dibujar los íconos (sin Zappicon en `public/`); mantener el aviso | — |
| 4 | El recuerdo automático (3e) no descuenta su bloque del presupuesto `recallShare` de la sala: tiene su propio tope (3 notas, ~900 caracteres) | Mantener mientras el tope sea así de chico; si crece, restarlo de `recallShare` | — |
| 5 | `package.json` en `0.7.2` con `CHANGELOG.md` en `1.0.0 · Sin publicar` | Decidir al publicar | — |

Resueltas en 4b y 4c: S-019 (Codex), D-S10 (asumida), el `perHour` único (contadores separados por
tipo), S-029 (autorizado y arreglado), S-030 (cerrado: con `@madre`, BISHOP solo responde), D-S12,
D-S13 (BISHOP firma enlaces de lectura de 7 días como máximo; con órdenes, el humano), S-032
(la sala de Salas no delega), S-021 (agente y turno vivo en cada lectura) y 3e (D-S14).

## 5 · Problemas encontrados y cómo se resolvieron

- **Medir el dibujo**: ticks síncronos (`__pulse.nostromoTick`, `__macroverso.peek()`), no rAF;
  el panel del navegador baja a 1-2 fps.
- **Prueba de idioma**: correr pruebas con `node --test` a secas da fallas de texto en español;
  siempre con la preparación del proyecto (`node --import ./test/setup.mjs --test …` o `npm test`).
- **Acentos graves dentro de una plantilla de JS**: escribir ```` ``` ```` dentro de un texto entre
  acentos graves rompe el archivo; se escapan (`\`\`\``).
- **`@madre` y las palabras de acción**: su regla fija rechaza un texto con «order», «delegate»,
  «run»… (`ACTION_EN`/`ACTION_ES` en `src/adapters/madre.mjs`). Todo texto que el sistema pone
  delante de una pregunta a `@madre` debe evitarlas (S-031).
- **Medir a un modelo pequeño**: repite sus respuestas anteriores desde el transcrito y el archivo;
  cada intento va en una conversación nueva (`POST /api/chats` desde la Mac la deja abierta).
- **zsh**: un comodín sin coincidencias aborta la línea entera (`no matches found`), y una espera
  posterior vigila un archivo vacío para siempre.
- **Varias conversaciones por sala**: el registro de la conversación principal es
  `<sala>/events.jsonl`; las demás, `<sala>/chats/<id>/events.jsonl`. Una orden entra a la
  conversación **abierta** de la sala destino.
- **Rutas reales**: `cwd` y `$HOME` se comparan con `realpath` (difieren bajo `/var` en esta Mac).
- **`config.json` compartido**: todo cambio por `updateConfig` con candado; cada módulo escribe
  solo su clave.
- **Lo que «te espera» y los mensajes traídos**: un mensaje `role: 'user'` con `via: 'bishop'` no es
  el humano; no debe limpiar lo que una sala espera (S-033).
- **La disponibilidad de un comando de módulo es asíncrona**: el servidor llama `available(...)` y
  encadena `.catch`; una función síncrona rompe `/api/commands` con 400.
- **El transcrito de Salas lleva los bloques de planes anteriores**: para saber qué le enseñó el
  bloque de BISHOP a un turno, buscar su texto («Solo consulta», «Si el humano pide actuar»), no la
  cerca ```` ```pulse-salas ````.
- **Un turno GHOST no deja eventos en el registro**: una prueba que espera `agent.completed` de un
  turno `#0` espera para siempre.
- **Una prueba que retiene un turno lo suelta en `finally`**: si una aserción falla antes, el cierre
  del servidor espera ese turno y la corrida se cuelga. En macOS no hay `timeout`; usar
  `--test-timeout` del corredor.
- **Toda lectura entre salas necesita un turno vivo** (S-021): para probar `/api/enlace/ask` hay que
  tener un turno corriendo en la sala que pide (un agente falso que espera) y mandar su agente y su id.
- **Un mensaje traído por BISHOP empieza con un encabezado para el agente**: todo lo que se le
  muestra al humano pasa por `relayedOf` (página) o `withoutRelayHeader` (lista de conversaciones).
- **Nombres de clase CSS**: antes de inventar uno, buscarlo en `public/styles.css`; `.mem-cross` ya era
  de otra gráfica (posición absoluta, 1 px) y la marca nueva salía letra por letra.
- **Un `.bar` es contenedor de tamaño** (`container-type: inline-size`): un elemento con esa clase no
  toma el ancho de su contenido; la segunda barra lo anula (`container-type: normal`).
- **Las reglas de las burbujas con fondo de paisaje** (`:root[data-scheme][data-wallpaper]…`) pesan más
  que un selector `#messages …`: la escalera de capas escribe el id dos veces (`#messages#messages`)
  para ganarles. Y `--lift-1…` ya eran fichas globales: las sombras de las capas se llaman `--rise-*`.
- **Una máscara, filtro u opacidad en un contenedor lo vuelve la raíz del fondo de sus hijos**: un
  `backdrop-filter` dentro ya no ve el paisaje. Por eso el desvanecido de «sigue abierto» va en la
  píldora cortada (`.cut-end`, `--fade-end`) y no en `.openq-rail`.
- **El lobby** (2026-10-10): es la página `/salas` servida por el proceso de BISHOP (carpeta
  `~/.pulse/salas`), y la primera pantalla de un `madre` sin palabra de comando. Agregar un proyecto
  es `associateProject` (escribe `project.json`, no abre); `PULSE_LOBBY_HOME` cambia la carpeta de
  usuario que explora (para pruebas). Una sala vieja sin `project.json` se reconoce por su id.
  Desde el 2026-10-10 es un tablero en mosaicos (`.sm-bento`, 12 columnas): BISHOP con «Lo último
  trabajado», «Te esperan» y Enlaces arriba; los proyectos (buscador + filtro); Decisiones
  recientes, «Te necesita» y Memoria abajo. Agentes y Apariencia viven en Ajustes del lobby. Desde
  el lobby **no se le escribe a BISHOP**: sus dos accesos son enlaces (`target="_blank"` el de
  pestaña nueva); dormido, se despierta primero y la pestaña se abre al presionar (`about:blank`).
  «Lo último trabajado» es `/api/salas/work` (`src/lobby-work.mjs`): lee de las carpetas de las salas
  (abiertas o dormidas) las conversaciones más nuevas y sus últimas líneas, sin pedirles nada, y
  @madre (Ollama, el modelo de la sala) escribe una línea por conversación **numerada**; el proyecto
  lo pone el lobby por el número, nunca el modelo (qwen2.5:7b mezclaba proyectos). Se guarda en
  `lobby-work.json` junto al registro de BISHOP y se reescribe a lo más cada 5 min o al pedirlo.
  «Decisiones recientes» es `/api/salas/decisions`: las decisiones que viajan (hold/bridge) de las
  salas abiertas, por su `/api/memory`, con caché de 5 min. Teclas, rieles (`sx-seg`), buscador
  (`settings-search`) y cerrar (`surface-modes` + `x-close`) son las clases de la sala, no copias. El
  panel de vista previa de la app abre `_blank` en la misma pestaña: en un navegador normal es pestaña
  nueva. Tema y acento se guardan con las mismas llaves que la sala (`pulse.theme`, `pulse.accent`).
- **BISHOP, centro del Macroverso** (2026-10-10, D-S12): la sala de BISHOP no es un universo en
  órbita sino el centro (`core`, `drawCentre`): un cuerpo propio (`bishopOrb`), esfera de gas
  nebuloso en violetas y azules que gira, con un ojo (vórtice, iris, pupila que sigue al universo
  elegido, al señalado o al puntero, y se dilata al llevarle uno), atmósfera, jirones y motas;
  pintada chica a lo más 30 veces por segundo y escalada. Solo ruido propio, nada de terceros. Sus venas son los contratos vigentes con su sala, que salen del centro; ninguna sin
  contrato. Llevar un universo a BISHOP abre la hoja con BISHOP como el que lee; su tarjeta lista lo
  que lee y una tecla por cada proyecto sin enlace. Elegido, no se entra (no hay escena viva) ni se
  oscurece el espacio. `.mv` lleva los tokens de la noche, así que sus teclas, el cerrar de las
  ventanas de memoria, «Volver al lobby» y RECENTRAR son los de la sala en oscuro. A lo lejos: luz del
  cuerpo `0.36 + 0.64·depth`, halo más chico, y en el motor, solo en escenas `bare`, resplandor,
  pulsos y anillos del latido se atenúan y achican con `nearness` (`farLight`, `farSize`).
- **Enlazar es un asistente** (`openLinkSheet`, 2026-10-10): pasos Quién lee · Qué cruza · Cuánto
  tiempo · Órdenes (solo con BISHOP de un lado) · Revisión; cada paso dice qué decide, las opciones
  van en filas como Ajustes (lo seguro marcado «Recomendado»); arriba, una escena al estilo de la
  bienvenida que se conserva entre pasos: las dos salas, el cable que fluye hacia la que lee, una nota
  por tipo cruzándolo y los términos. Cabe en una vista (≥ 760 px de alto) sin scroll.
  Todas las hojas del lobby llevan el material de `dialog.settings-window` (`--bg-2` al 94 %).
  Valores seguros por defecto: **una semana** (antes 30 días), decisiones y hechos, sin recuerdo,
  sin órdenes; avisa si la que entrega duerme o corre una MADRE vieja; con órdenes exige la
  designación; la revisión dice el contrato en frases. El cuerpo del POST no cambió.
- **Macroverso vivo**: un universo lejano conserva su escena con `scene.frozen` (el motor no calcula
  fuerzas, solo gira, late y pulsa) y se redibuja en `animateFar`, a lo más `FAR_FPS` por segundo y
  con `FAR_BUDGET` ms por cuadro entre todos; su lienzo sigue su tamaño en pantalla
  (`resizeUniverse`, pasos de `SIDE_STEP`). La luz y los tamaños por distancia viven en el motor
  (`nearness` desde `cam.scale`), así que valen también para el NOSTROMO de cada sala. En una escena
  `bare` el velo del foco usa `source-atop`; el Macroverso oscurece su propio espacio.
  `__macroverso.step(now)` avanza un cuadro a mano (en un panel oculto no hay cuadros).
- **Planos de la conversación** (THE CANVAS IN PLANES, final de styles.css): un mensaje nuevo se
  clasifica asignándole `--plane: var(--depth-…)`; la sombra sale sola de la fórmula. Nada de
  `backdrop-filter` dentro de `#messages` (dibujaba bloques vacíos al desplazar).
- **El núcleo lee sus palabras en oración** (`coreWords`/`coreSentences` en app.js, con un
  MutationObserver): las frases siguen en mayúsculas en el código y el catálogo. Una palabra con
  cifras, barra, siglas de `CORE_KEEP` o ya en minúsculas no se toca. Si una frase nueva sale mal,
  se arregla en `CORE_KEEP`, no con `text-transform`, que convertiría «11.0M» en «11.0m».
- **Fichas de NOSTROMO**: `#nostromo-card` es la plantilla (siempre oculta); cada ficha es una copia
  con sus piezas por `data-part`. `nostromo.selected` es la del frente.
- **Precios (`src/prices.mjs`)**: solo modelos leídos dos veces en la página del proveedor
  (2026-10-09); uno que no está, sin precio. Cada CLI cuenta distinto (caché dentro o fuera de la
  entrada, razonamiento dentro o fuera de la salida): la tabla `COUNTING` lo dice por fuente. Las
  direcciones de las fuentes van sin esquema para que la guarda de salidas no las tome por destinos.
- **Sin fondo de paisaje la página borra `data-wallpaper`** (el primer valor de cada apariencia no se
  escribe): una forma que solo vive bajo `:root[data-wallpaper]` desaparece con el fondo liso.
- **En el panel oculto del navegador las transiciones no avanzan**: un color leído tras recargar puede
  ser el de la transición congelada; `document.getAnimations().forEach(a => a.finish())` antes de medir.
- **Fusiones en paralelo**: conflictos en la bitácora y tablas de `docs/MACROVERSO.md`; se
  conservan los dos lados y la bitácora solo se añade al final.

## 6 · Reglas de trabajo vigentes (del humano)

- **Nada de push, nada de deploy, nada publicado.** Commits locales a criterio, por higiene.
- No inventar: lo que se afirma se cita con `ruta:línea`; una cita rota es una parada.
- No cambiar el núcleo fuera de las excepciones de §6 del encargo y de las que el humano autorizó
  por nombre (S-019, S-021, S-024, S-026, S-027, S-028, S-029, S-032).
- Español neutro mexicano, conciso; cada clave nueva de la interfaz con su español a mano en
  `public/es.js`; lo que lee un agente, en inglés.
- Credenciales nunca en `config.json`, ledger ni logs.
- Antes de tocar procesos, rutas o permisos, leer `docs/WINDOWS.md`; MADRE no declara soporte ni
  no-soporte de Windows.
- Nada de esto llega al teléfono: cada ruta nueva niega `x-madre-device` y el puente no la lista.
- **Antes de empezar, comprobar que nadie más trabaja en el árbol** (`git status`, sesiones de
  Codex con `cwd` en este repo) y, al cerrar, reescribir este archivo.

## 7 · Entorno de esta Mac al cerrar S-021 y 3e

- Salas abiertas por la sesión de Claude: la sala de Salas en el puerto 4318
  (`~/.pulse/salas`, id `salas-68dee27f3c55f1a3`), la de este repo en el 4401
  (`pulse-3c377cb62303118e`) y `sala-prueba` en el 4403 (carpeta en el scratchpad de la sesión). La sala del humano `gumball` (4317) no es de pruebas.
- En `~/.pulse/config.json` hay seis contratos de prueba **revocados** (nunca se borran, por
  diseño; uno firmado por BISHOP, uno con recuerdo automático) y ninguno vigente. BISHOP quedó en su agente por defecto
  (`agent: null`), en `manual` y con «Enlaces de lectura: bishop».
- La sala de Salas tiene conversaciones de prueba de 4b y 4c («BISHOP prueba 1…5», «BISHOP en
  pantalla», «BISHOP con Claude», «BISHOP 4c», «BISHOP firma») y sus planes en `bishop-plans.json`; la sala `pulse`
  tiene en «prueba de multitarea» las órdenes recibidas y una respuesta de `/bishop`. No se borró
  nada: borrar es del humano.
- Cómo probar sin navegador:

```bash
npm test
```

```bash
npm run pack:check
```

- Cómo probar una orden de punta a punta: abrir la sala de Salas y otra sala; firmar en Salas un
  enlace de esa sala hacia la de Salas con órdenes (la hoja pide la designación de la otra);
  elegir en la ficha de BISHOP un agente CLI; pedirle un plan; pulsar **Enviar** en la tarjeta.
  `test/bishop-orders.test.mjs` y `test/bishop-4c.test.mjs` hacen lo mismo con salas reales y
  agentes falsos. Para `/bishop`: en cualquier otra sala, `/bishop` y la pregunta.

## 8 · Formato del reporte al cerrar cada fase

El de `docs/MACROVERSO-ENCARGO.md` §9, siempre las ocho secciones. Cada fase cierra con la suite
en verde, `pack:check`, su línea al final de la bitácora de `docs/MACROVERSO.md`, este archivo
reescrito y un commit local.
