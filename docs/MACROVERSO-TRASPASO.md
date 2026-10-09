# Traspaso · Salas, Macroverso, Enlaces y BISHOP

Estado al `2026-10-08`, en `main` local, **sin push y sin publicar**. Escrito para que otra
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
| *este commit* | Claude | 4c · modos, propuestas `#3`/`#4` en su sala, `/bishop` desde cualquier sala, asistente de enlaces; S-029 arreglado, S-030 cerrado, D-S12; S-032 y S-033 |

Árbol limpio al cerrar 4c. Suite **644/644** y `npm run pack:check` en verde. Una prueba de
NOSTROMO con muestra aleatoria falla a veces (vista por Codex y por Claude: 636/637 o 639/640 en
una corrida, verde al repetir); no es de BISHOP.

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
- Pruebas: `test/bishop-4c.test.mjs`.

**Documentación al día:** `CHANGELOG.md` (*Sin publicar*), `docs/REFERENCE.md` (SALAS: Macroverso,
Enlaces, La sala de Salas, BISHOP y sus rutas), `docs/SDK.md` (`onEvent`, `viaPhone`),
`docs/MACROVERSO.md` (bitácora completa).

## 3 · Lo que falta

| Fase | Qué | Compuerta para empezar |
|---|---|---|
| **3e** | Recall automático de notas enlazadas en cada turno (D-S04, segunda parte) | **preguntar al humano antes**: cambia lo que cada turno lee |

Fuera de las fases del encargo, lo que el humano pidió y quedó con una decisión abierta está en §4.
Reglas que cualquier cambio hereda sin discusión: D-S11 y D-S12 (cerradas por el humano; ver
`docs/MACROVERSO.md` §7); el canal nunca lleva `#3`/`#4`; una orden a la vez por sala y nunca
sobre una sala ocupada; lo automático cuenta contra el `perHour` de órdenes del contrato y se
detiene con un fallo o STOP ALL; `Room.order()` es la única puerta de una orden o de una pregunta
traída por el canal; un enlace lo firma el humano.

## 4 · Decisiones que necesita el humano

| # | Qué | Recomendación | Bloquea |
|---|---|---|---|
| 1 | **D-S13** · ¿BISHOP puede firmar un enlace sin el humano? («wizard automático») | Hoy propone y el humano firma con un toque. Si se quiere más: solo enlaces de lectura, sin órdenes, con caducidad de 7 días como máximo, revocables con un toque y avisados en las dos salas | — |
| 2 | **S-032** · la sala de Salas carga el bloque `delegation` en el prompt de BISHOP | Apagar la delegación solo en la sala de Salas (`room.delegation` al abrirla); toca `src/server.mjs`: necesita permiso | — |
| 3 | **S-021** · `enlace.received` no sabe qué agente ni qué turno leyó | `PULSE_ENLACES_AGENT` en el `env` del servidor MCP y `agent` en el cuerpo de `/api/enlace/ask`; aditivo | — |
| 4 | **D-S08** · la carpeta de la sala de Salas no se cambia en Ajustes | Dejarlo, o nunca | — |
| 5 | `madre doctor` desde `$HOME` reporta el cuaderno de Salas (consecuencia de D-S09) | Mantener | — |
| 6 | `enlaces.jsonl` y `bishop-plans.json` no rotan por tamaño (los planes guardan los últimos 40); ENLACES y BISHOP sin ícono propio; el aviso de firma no llega a salas dormidas | Rotar si crece; dibujar los íconos (sin Zappicon en `public/`); mantener el aviso | — |
| 7 | **3e** | Preguntar | 3e |
| 8 | `package.json` en `0.7.2` con `CHANGELOG.md` en `1.0.0 · Sin publicar` | Decidir al publicar | — |

Resueltas en 4b y 4c: S-019 (Codex), D-S10 (asumida), el `perHour` único (contadores separados por
tipo), S-029 (autorizado y arreglado), S-030 (cerrado: con `@madre`, BISHOP solo responde), D-S12.

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
- **Fusiones en paralelo**: conflictos en la bitácora y tablas de `docs/MACROVERSO.md`; se
  conservan los dos lados y la bitácora solo se añade al final.

## 6 · Reglas de trabajo vigentes (del humano)

- **Nada de push, nada de deploy, nada publicado.** Commits locales a criterio, por higiene.
- No inventar: lo que se afirma se cita con `ruta:línea`; una cita rota es una parada.
- No cambiar el núcleo fuera de las excepciones de §6 del encargo y de las que el humano autorizó
  por nombre (S-019, S-024, S-026, S-027, S-028, S-029).
- Español neutro mexicano, conciso; cada clave nueva de la interfaz con su español a mano en
  `public/es.js`; lo que lee un agente, en inglés.
- Credenciales nunca en `config.json`, ledger ni logs.
- Antes de tocar procesos, rutas o permisos, leer `docs/WINDOWS.md`; MADRE no declara soporte ni
  no-soporte de Windows.
- Nada de esto llega al teléfono: cada ruta nueva niega `x-madre-device` y el puente no la lista.
- **Antes de empezar, comprobar que nadie más trabaja en el árbol** (`git status`, sesiones de
  Codex con `cwd` en este repo) y, al cerrar, reescribir este archivo.

## 7 · Entorno de esta Mac al cerrar 4c

- Salas abiertas por la sesión de Claude: la sala de Salas en el puerto 4318
  (`~/.pulse/salas`, id `salas-68dee27f3c55f1a3`) y la de este repo en el 4401
  (`pulse-3c377cb62303118e`). La sala del humano `gumball` (4317) no es de pruebas.
- En `~/.pulse/config.json` hay cuatro contratos de prueba **revocados** (nunca se borran, por
  diseño) y ninguno vigente. BISHOP quedó en su agente por defecto (`agent: null`) y en `manual`.
- La sala de Salas tiene conversaciones de prueba de 4b y 4c («BISHOP prueba 1…5», «BISHOP en
  pantalla», «BISHOP con Claude», «BISHOP 4c») y sus planes en `bishop-plans.json`; la sala `pulse`
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
