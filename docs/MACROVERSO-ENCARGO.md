# MADRE · ENCARGO · Enlaces, BISHOP y el Macroverso como flota de NOSTROMOs

Este documento **es el prompt**. Está escrito para quien lo ejecute: una sesión de Claude
Code que orquesta, sola o con agentes en paralelo. Se lee entero, y después se lee
`docs/MACROVERSO.md` (el documento único de decisiones y hallazgos, que este encargo no
sustituye) antes de tocar un archivo.

| | |
|---|---|
| Repositorio | `main` @ `888184a` · 615 pruebas en verde · nada publicado |
| Citas | Verificadas el 2026-10-08 sobre `888184a` leyendo el código, no la documentación. Las líneas se mueven: **antes de apoyarte en una, confírmala con `grep`** |
| Decisiones | D-S01..D-S06 cerradas por el humano el 2026-10-08 (§1). D-S07..D-S10 abiertas, con qué se puede asumir y qué no |
| Reglas en vigor | `AGENTS.md`, `docs/WINDOWS.md`, `docs/ZONAS.md`, `docs/SDK.md`. Nada de aquí las relaja |
| Regla madre | **Un enlace lee; nunca escribe en otra sala. Una orden entra a una sala solo por la puerta que esa sala ya tiene para el humano.** |

---

## 0 · Protocolo contra la alucinación

Cada afirmación de este encargo lleva una etiqueta. Respétalas al leer y al escribir tu reporte.

| Etiqueta | Significa | Qué haces con ella |
|---|---|---|
| **[V]** | Verificado en el código, con `ruta:línea` | Confírmalo con `grep` antes de usarlo. Si la cita no está, es una **cita rota**: repórtala, no la reinterpretes |
| **[I]** | Inferido de lo verificado; no ejecutado | Verifícalo antes de construir encima. Si resulta falso, detente |
| **[D]** | Decidido por el humano | No se discute. Si choca con el código, se reporta el choque; no se cambia la decisión |
| **[P]** | Propuesta de diseño | Es la recomendación. Puedes apartarte solo con una razón verificable, anotada en `docs/MACROVERSO.md` |
| **[?]** | Abierto | No se construye. Si bloquea, se pregunta |

**Las reglas, en orden de precedencia.**

1. **Si no está en el código, no existe.** No asumas rutas, campos, eventos, ajustes, módulos ni
   comportamientos. Lee antes de citar; cita antes de cambiar. Una frase de la documentación no es
   evidencia: esta lectura encontró seis lugares donde documentación y código no coinciden (§3).
2. **El núcleo no crece** (`AGENTS.md`, reglas de la casa). Lo nuevo vive en `src/modules/` o en
   archivos nuevos. Los únicos cambios al núcleo permitidos están en §6; cualquier otro es una
   **parada** (§5, compuertas).
3. **Nada cambia lo que un agente lee** sin un contrato firmado por el humano. Ni una nota, ni un
   conteo, ni un nombre de sala entra al prompt de una sala por un enlace que el humano no firmó.
4. **Pruebas primero, pantalla después.** Cada regla nueva tiene una prueba que la fija antes de que
   exista la interfaz. `npm test` entero en verde y `npm run pack:check` antes de cada commit.
   El español se traduce literal por literal, a mano, en `public/es.js`; todo archivo nuevo con
   `t()` se añade a la lista de `test/i18n.test.mjs:69-72` [V].
5. **Todo en local.** Commits sí, a criterio y por higiene, con mensaje en español y la suite en
   verde. **Nada de push, nada de deploy, nada de `npm publish`**; ni siquiera lo propongas.
6. **Windows.** Antes de tocar algo que ejecute procesos, resuelva rutas o aplique permisos, lee
   `docs/WINDOWS.md`. Sin shell (WIN-016), `fileURLToPath` y no `.pathname` (WIN-004/006), sin matar
   grupos de proceso (WIN-007). MADRE no declara soporte ni no-soporte de Windows en ninguna copia.
7. **El teléfono no entra.** Toda ruta nueva de Salas, enlaces o BISHOP responde 403 cuando la
   petición viene del puente, verificado en la sala y no solo en el puente, como las de
   `src/server.mjs:1423-1425` [V]. Salas en el teléfono se queda como está.
8. **Mide antes de afirmar.** Ningún número de rendimiento, de tokens ni de ruido entra al reporte
   sin la medición que lo produjo (qué máquina, qué tamaño, cuántas muestras).
9. **Reporta en el formato de §9.** Nunca «debería funcionar»: o lo verificaste y dices cómo, o
   dices que no lo verificaste.
10. **Voz MADRE.** Lo que ve el humano se escribe como producto: descubrible en la sala, sin
    comandos que teclear, sin mencionar el proceso de desarrollo. Nada flota sobre la conversación;
    legibilidad primero. Nombres nuevos solo los de §1 (D-S07).

---

## 1 · Decisiones del humano [D]

Palabras del humano del 2026-10-08, y su lectura operativa. La lectura es la que se construye.

| ID | El humano dijo | Lectura operativa |
|---|---|---|
| **D-S01** | «RUN es el módulo Runs que corre comandos» | «Aprovechar RUN» = aprovechar **el patrón de Runs**: el agente propone, cada línea es un botón, nada corre hasta que el humano lo pulsa, hay checkpoint antes y la salida vuelve como tarjeta que los agentes leen (`src/room.mjs:814-877`, `src/room/runs.mjs:82-89` [V]). Las órdenes de BISHOP usan ese patrón. Runs sigue siendo lo que es; no se le añade nada |
| **D-S02** | «sí abre salas directamente» | `madre` sin proyecto abre Salas. El disparador exacto es D-S09 |
| **D-S03** | «sí» | Un enlace solo deja cruzar **memorias destiladas que viajan** (`travels()`: zonas `hold` y `bridge`, `src/memory.mjs:60,82` [V]), de los tipos elegidos, limpias por el guardia de privacidad de la sala que las entrega. Nunca el registro crudo, archivos, aberraciones, enfermería, esclusa ni llaves |
| **D-S04** | «sí» | Lo que cruza llega **primero por una herramienta** que el agente pide (se ve quién lo pidió y para qué turno). El recall automático es una fase posterior con su propia compuerta (§5, 3e) |
| **D-S05** | «El super agente lo elige el usuario, siempre en modo default 1 y 2 por gobernanza… es un meta guardián al que se le puede preguntar todo sobre los proyectos, decisiones tomadas, movimientos, cualquier cosa que no implique mover los proyectos por dentro… otro chat que se abre en salas… crear planes, crear elementos, editar o incluso dirigir a otros agentes en modo 3 y 4 pero siempre cuidando la lógica, la protección del proyecto, las acciones dentro y el seguimiento… sin volver ruidosas las transacciones… canales, candados y puentes… si es madre como super agente revisar qué permisos le podemos dar, cómo destila incluso sus propias memorias… puede gobernar a todos desde salas, hacer planes, dar órdenes» | El super agente (**BISHOP**, D-S07) es **una sala más**: su conversación vive en la sala de Salas, con el núcleo intacto (registro, memoria, modos, archivista). Lo elige el humano entre los agentes detectados o `@madre`. Sus turnos salen en `#1`/`#2`; **nunca edita un proyecto**: lo que mueve un proyecto lo hace el agente de esa sala, en esa sala, bajo el guardia de esa sala. Da órdenes con un bloque al cierre de su respuesta, como la delegación de hoy, y cada orden pasa por canales, candados y puentes definidos en §4C. Sus memorias se destilan como las de cualquier sala, con dos reglas extra (§4C.7) |
| **D-S06** | «De esto se desprenden las demás decisiones» | Hay modo **manual, híbrido y automático** para las órdenes (§4C.5). El automático existe solo dentro de un techo que el humano firmó en cada contrato, con aviso de cada orden y revocable. `#3` y `#4` **nunca** se envían solos, en ningún modo: llegan como propuesta a la sala destino y las arma el humano ahí, con las dos llaves de siempre |
| **Macroverso** | «se ve muy raro, quiero que repliques el estilo del nostromo, cada proyecto es un nostromo en el macroverso, igual, solo que ahora el canvas del macroverso es el infinito espacio sideral» | Cada sala se dibuja **con los mismos pintores de NOSTROMO** (MOTHER de magma, memorias como enanas, venas entre ellas), no con una imitación. El lienzo es espacio abierto que se recorre y se acerca sin borde. §4A |

**Abiertas** [?], con lo que se puede asumir mientras tanto:

| ID | Decisión | Recomendación | ¿Se puede asumir? |
|---|---|---|---|
| **D-S07** | Nombre del super agente en la interfaz | **BISHOP**: el sintético de *Aliens* que protege a la tripulación, en la misma familia que ASH, RIPLEY, NOSTROMO y MU/TH/UR. Se escribe en mayúsculas y no se traduce, como los demás | Sí. Es una cadena en un solo lugar; renombrar cuesta un commit |
| **D-S08** | Dónde vive el proyecto de la sala de Salas (el «cuaderno» de BISHOP: planes y contratos como archivos) | `~/.pulse/salas/`, carpeta de MADRE, creada al primer `madre salas`. El checkpoint funciona sin repo propio: usa un repo sombra (`src/checkpoint.mjs:33-43,54` [V]). Las zonas prohibidas de CONTROL son relativas al proyecto (`src/checkpoint.mjs:20-27` [V]), no `~/.pulse` entero. **Riesgo a anotar, no nuevo:** un CLI en cualquier sala ya puede leer `~/.pulse/credentials/*` porque corre como el usuario; el briefing de BISHOP no nombra `~/.pulse` | Sí, con la carpeta mostrada en Ajustes de esa sala para cambiarla después |
| **D-S09** | Disparador de D-S02 | Nuevo comando `madre salas`. Además, `madre` sin `--project` abre Salas **solo cuando el directorio actual es `$HOME`**; dentro de cualquier otra carpeta sigue abriendo la sala de esa carpeta (`bin/madre.mjs:80` [V]). Ninguna heurística de «¿esto es un proyecto?» | Sí, con esa regla y ninguna otra |
| **D-S10** | Cómo queda en el registro una orden de BISHOP: ¿`role: 'you'` con `via: 'bishop'`, o un rol propio? | Ver §4C.4. Es una decisión técnica del orquestador, dentro de las excepciones de §6, con una prueba que la fije y una línea en la bitácora | Sí, dentro de §6 |

---

## 2 · Hechos verificados que sostienen el diseño [V]

Si uno de estos resulta falso al hacer `grep`, el diseño que depende de él se detiene (§5).

### 2.1 · Modos, techos y llaves

- Los modos son **por mensaje**, no por sala: `MODES` en `src/capabilities.mjs:85-91`, `MODE_MAX = 4` en `:92`; cada mensaje nace en `#1` (`src/room.mjs:962`). No hay «modo de sala» persistente ni ruta que lo fije.
- Lo persistente son los techos **por agente y para toda la Mac** en `~/.pulse/config.json`: `scopes.<agente>.maxMode` y `.defaultMode` (`src/server.mjs:515-527`); `maxMode` por defecto `#2` si el CLI puede escribir, `#1` si no (`src/capabilities.mjs:116`); `defaultMode` nunca pasa de `#2` (`:120`). **No existe un techo por sala.**
- `modeCheck` responde 403 si el mensaje supera el techo del agente y 409 si ya hay titular de CONTROL (`src/room.mjs:702-707`). Un solo escritor por proyecto (`src/room/control.mjs:12-16`).
- **La llave de `#3`/`#4` (designación + `AIRLOCK`) se valida solo en el navegador** (`src/override.mjs:3,10,16`; `public/app.js:3054-3062`). `POST /api/messages` no la pide (`src/server.mjs:2492-2524`). Consecuencia: un proceso local puede pedir `#3` por HTTP si el techo del agente lo permite. §4C lo respeta: nada ≥ `#3` viaja por el canal.
- Escalación cuando un paso pide más modo del que tiene: `#askForMode` (`src/room.mjs:263-291`), decisión por `POST /api/modes/:requestId/decide` con `once | plan | deny` (`src/server.mjs:2482-2491`, `src/room/escalation.mjs:28-34`). Solo el humano concede.
- Desde el teléfono el tope es `#2`: `PHONE_MAX_MODE` (`src/bridge/policy.mjs:57`); la sala lo vuelve a comprobar (`src/server.mjs:2496-2499`).

### 2.2 · Delegación y Runs

- Delegación: bloque ```` ```pulse ```` al cierre, `@agente #n: texto`; el regex acepta solo `#0`–`#3` (`src/directives.mjs:50`); solo cuenta el último bloque y nada va después (`:32-40`); hasta 4 pasos (`src/room.mjs:172`); un plan a la vez (`:1081-1085`); los delegados no delegan (`depth: 1, allowDelegation: false`, `:1807,1826`); el modo de cada paso es el mínimo entre lo pedido, el techo del plan y el `maxMode` del agente (`:1748-1753`).
- Runs: `parseRunRequest` (`src/runs.mjs:104-128`) exige motivo y hasta 5 comandos; `splitCommand` rechaza `| & ; < > ( ) $` y comodines (`:44-90`); el humano pulsa → `POST /api/runs` (`src/server.mjs:2372-2380`) y **el servidor relee el comando de su propio ledger, nunca de la página** (`src/room.mjs:828-830`); corre con `shell: false` (`src/room/runs.mjs:82-89`); la salida es un evento `command.output` (`src/room.mjs:855-862`) que todos los agentes leen en su siguiente turno con rol `command` (`src/conversation-context.mjs:9-13`) y que el índice de memoria también indexa (`src/memory.mjs:940`).

### 2.3 · Mensajes, origen y guardia

- `POST /api/messages` acepta `{ text, target, model, effort, attachments, create, mode, ash, draft }` (`public/app.js:10170`; firma de `send` en `src/room.mjs:960`) y responde `202 { accepted: true }` sin id de mensaje (`src/server.mjs:2523`).
- `via` se **borra** salvo que la petición venga del puente del teléfono (`src/server.mjs:2494-2500`): «solo la palabra del puente cuenta, nunca la del cuerpo». `VIA_KINDS` solo conoce teléfonos (`src/room.mjs:46,1008`).
- `request-guard` deja pasar sin `Origin` (un proceso local) si `Host` es loopback (`src/request-guard.mjs:10-23`). No mandes `x-madre-device`: la sala trataría la llamada como del teléfono (`src/server.mjs:1266`).
- `outbound.mjs` clasifica toda llamada loopback como `room` y `local: true` (`src/outbound.mjs:29,142`): hablar entre salas ya está declarado y queda en `outbound.jsonl` de cada sala (`src/server.mjs:192-195`).
- `@madre` solo funciona como `target` explícito (`src/router.mjs:1`).

### 2.4 · Lo que un agente lee

- El prompt se arma en `promptParts` (`src/room/prompt.mjs:71-161`) con bloques en orden fijo (`PROMPT_BLOCKS`, `:51`) y condiciones por bloque (`BLOCK_SOURCES`, `:21-49`). Un módulo integrado ya tiene bloque propio: `ash` (`:100`). Vista previa: `Room.briefing()` (`src/room.mjs:1316-1369`) y `GET /api/briefing` (`src/server.mjs:2056-2071`); hay fixture dorado en `test/fixtures/prompt-golden.json`.
- El recall solo entra cuando el transcript no cabe (`src/room/context.mjs:10`), con presupuesto `contextMaxChars × recallShare` (`:14`; 16000 y 0.3 por defecto, `src/server.mjs:143`, `src/room.mjs:160`). Solo viajan zonas `hold`/`bridge`: `ZONE_GATE` (`src/memory.mjs:80,758,768`) y `travels()` (`:82,790,804`).
- Privacidad: `Privacy.redact(text) → { text, hits, kinds }` (`src/privacy.mjs:126-140`); la respuesta del agente se redacta **antes** del ledger (`src/room.mjs:1587-1590`); el índice redacta al indexar (`src/memory.mjs:318,942`); el texto del humano no se redacta, solo avisa (`src/room.mjs:1021-1023`). Los términos viven en `config.json`, es decir, son de toda la Mac.
- **`memory_note` guarda sin redactar**: `openMemory` en `src/mcp/memory-server.mjs:74-84` no llama a `attachPrivacy`. Es S-008 (§3) y se arregla antes de que una nota cruce.

### 2.5 · Memoria y zonas

- Tipos: `decision · fact · preference · question · aberration` (`src/memory.mjs:37`). Zonas `hold · bridge · medbay · jettisoned` (`:46-57`), `RECALLED_ZONES = [HOLD, BRIDGE]` (`:60`), `zoneFor` (`:87-100`). Forma de una memoria: `memories()` (`:735-742`).
- Enlaces entre memorias = similitud coseno entre embeddings, `floor 0.6`, hasta 4 por nodo, O(V²) por llamada (`:676-704`). Sin embeddings no hay venas.
- Destilación: tras cada turno no-GHOST cuando no queda ninguno corriendo (`src/room.mjs:1302`) → `schedule()` (`src/room/archivist.mjs:53-67`: 10 entradas o 10 min); archivista en orden `ollama, gemini, opencode, codex, claude` (`src/distiller.mjs:10`); hasta 5 notas de 240 caracteres (`:12-13`), nacen en `hold` (`src/memory.mjs:537`).
- MCP `pulse-memory`: `memory_search`, `memory_recall`, `memory_notes` (no filtra por zona), `memory_timeline`, `memory_note`, `project_state` (`src/mcp/memory-server.mjs:104-161`).
- `GET /api/memory?designation=` exige la designación igual al nombre de la carpeta (`src/server.mjs:1263,2017-2026`), responde 423 sellada por CODE000 (`:2019-2020`) y devuelve hasta 500 memorias y sus enlaces (`src/room.mjs:483-499`).

### 2.6 · `@madre`

- Adaptador `madre-local` (`src/adapters/madre.mjs:8-9`). **Sin herramientas MCP** (`src/room.mjs:1543`; `:248` del adaptador), no lee archivos, no escribe, no ejecuta (`SYSTEM`, `:16-24`); techo efectivo `#1` (`src/capabilities.mjs:13,55,114-116`); `num_ctx 8192` (`src/ollama.mjs:15,97`) con un `<context>` de hasta 16000 caracteres sacado del briefing (`src/adapters/madre.mjs:29`, `src/room.mjs:1262`); tokens a cero (`:230`); prefiere `madre-<proyecto>` si existe (`src/server.mjs:326-329`); varias respuestas las resuelve sin modelo (`localReply`, `:180-196`).

### 2.7 · Proceso, Salas y puente

- `madre` = `start` sobre el directorio actual (`src/cli-args.mjs:9-11`, `bin/madre.mjs:80`); `startPulse` escucha solo en `127.0.0.1` (`src/server.mjs:2584`); `open.json` lo escribe `markOpen` (`:216`) y `project.json` lo escribe `markProject` (`src/salas.mjs:25-31`).
- Salas: `knownRooms` (`src/salas.mjs:36-58`), `startRoom` sin shell (`:62-81`), `askRoom` con `{outdated}` en 404 y `{unreachable}` en fallo (`:99-113`); `GET /api/salas` devuelve `{ mac, language, here, version, rooms, handoff }` (`src/server.mjs:1436-1444`); `glance.census` son solo conteos `{ memories, kinds, travelling }` (`:232-242`) y la prueba fija esa forma exacta (`test/salas.test.mjs:85`): **no se le añaden campos**.
- El puente del teléfono lo hospeda la primera sala que logra `listen` en `0.0.0.0:4316`; las demás lo reintentan cada 15 s (`src/bridge/host.mjs:5-24,41,57-62`). Es el precedente de «un servicio compartido que cualquier sala puede sostener».
- Ledger: un `events.jsonl` por conversación (`src/chats.mjs:12-14`), `{ id, sequence, type, timestamp, payload }` con fsync (`src/event-store.mjs:178-191`). **No existe ningún registro de eventos entre salas.**
- Módulos (`docs/SDK.md`): un archivo; rutas solo bajo `/api/x/<id>/`; `record()` rechaza `message.*` y `agent.*` («no puede fabricar turnos ni mensajes»); `onEvent` recibe cada evento del ledger; `toolsForTurn` adjunta servidores MCP con `brief`; `ctx.vault` guarda en `~/.pulse/credentials/<id>.json` con `0600`, compartido por todas las salas; `ctx.room` es la sala.

### 2.8 · Dibujo: NOSTROMO y el Macroverso

- `app.js` es un módulo ES (`public/index.html:387`) que exporta solo `renderMarkdown` (`public/app.js:2150`). NOSTROMO vive en el ámbito del módulo, líneas **14648-17757**, atado a singletons: `nostromo` (`:14670`), `flat` (`:15389`), `magmaSprite` (`:16211`), `dwarfSkins` (`:15836`), `dwarfAlbedos`/`sphereTables` (`:15951-15952`), `shading` (`:16144`), `grainCanvas` (`:15781`), y a `t`, `el`, `state`, `motion`, `toast`, `openCore`. Importar `app.js` desde otra página ejecutaría el arranque de la sala (`await fetch('/api/state')`, `:8959`). **Hoy el Macroverso no puede usar los pintores.**
- Es **canvas 2D puro**: todos los `getContext('2d')` (`:14746,14783,15508,15791,15854,16166,16387,16765`); ni WebGL ni GLSL en ningún archivo. El «magma» es un pintor por píxel en CPU: `magmaMap` 512×256 a 12 filas por cuadro (`:16229-16255,16380`), `shadeMagma` (`:16266-16344`), `magmaFace` cada dos cuadros (`:16378-16406`), `MAGMA_SIZE = 220` (`:16205`), explosiones `magmaBlasts` (`:16352-16374`). Memorias: `dwarfSprite` con `SHADE_BUDGET = 28` repintados por cuadro (`:16142-16191`); física `stepNostromo` O(n²) (`:16431-16525`); venas `:16791-16822`; `drawMemory` `:16890-17033`; nebulosa `:16669-16762`. `MEMORY_SCALE = 0.64` (`:16429`). Paleta `MEMORY_COLORS` (`:344`), espejada en `--mem-*` (`public/styles.css:549-550`) **y copiada una tercera vez** en `KIND_COLOURS` (`public/macroverso.js:15-19`), sin prueba que las ate.
- En el canvas principal de NOSTROMO **no hay tope de densidad** (`:15343`), **no hay pausa al ocultar la pestaña** (solo `stopNostromo` al cerrar, `:15746-15751`) y **no hay medición en ms del cuadro**.
- Datos: `/api/memory?designation=` (`:14862`); el radio de una memoria representa cuánto ledger cubre (`:14986-14987`), y la actividad (uso, recencia, conexión; `:14953-14967`) gobierna brillo y pulsos.
- Macroverso: `openMacroverso({ host, rooms, here, accent, words, actions }) → { update, close }` (`public/macroverso.js:160,512-515`); sprites en caché por `face` (`:207-212`); `view.dpr ≤ 2` (`:223`); `FOCUS_ZOOM = 2.1` se declara en `:447` pero se usa en `:211,228` (riesgo TDZ si se reordena); `size()` repinta todo en cada `resize` sin debounce (`:226-228,489-490`); el acento llega de `--s-acc` del `body` (`public/salas-mac.js:258-264`), así que **en tema claro el Macroverso, siempre oscuro, recibe el acento claro** (`public/styles.css:105-123`).
- El servidor sirve JS solo de listas cerradas (`src/server.mjs:1274,1430`): un módulo compartido nuevo da 404 hasta añadirlo. El puente tiene su propia lista `STATIC` (`src/bridge/policy.mjs`).
- Pruebas que fijan el estado actual: `test/salas.test.mjs:112` (sin `webgl`, incluso en un comentario), `:113` (tope de dpr), `:115` (caché por `face`), `:117` (`visibilitychange`), `:118` (movimiento reducido), **`:120` (`doesNotMatch /lineTo\(/` en todo `macroverso.js`)**, `:122` (oculto bajo 900 px); `test/nostromo-3d.test.mjs:8-30` extrae funciones **por texto desde `public/app.js`**, igual que `test/nostromo.test.mjs:10-21,80-160,144-158` y `test/ui-smoke.test.mjs:711-717`; `test/nostromo.test.mjs:727-730` exige paridad `--mem-*`; `:733-744` texturas una vez por clase; `:457-471` menos de 12 `shadowBlur` por cuadro.
- Medido: el Macroverso actual cuesta 0.4 ms de mediana y 1 ms en p95 a 1440×900 y densidad 2 (`docs/MACROVERSO.md:194-195`). NOSTROMO: sin medir. Derivado por aritmética, no medido: el sprite enfocado con 500 memorias saldría de ≈2300 px de lado, ≈21 MB.

---

## 3 · Hallazgos de esta lectura (ids nuevos para `docs/MACROVERSO.md`)

| ID | Qué pasa | Dónde | Estado para este encargo |
|---|---|---|---|
| **S-008** | `memory_note` guarda notas sin pasar por el guardia de privacidad; una nota así podría cruzar un enlace | `src/mcp/memory-server.mjs:74-84` | **ARREGLAR en 3b**, antes del primer cruce (§6, excepción 3) |
| **S-009** | La llave de `#3`/`#4` se valida solo en el navegador; `POST /api/messages` acepta `#3` de un proceso local si el techo del agente lo permite | `src/override.mjs:3`, `src/server.mjs:2492-2524` | **SIN CAMBIO.** El canal de órdenes nunca manda ≥ `#3`; lo fija una prueba |
| **S-010** | El techo de modo es por agente y por Mac, no por sala | `src/server.mjs:515-527` | **SIN CAMBIO.** El techo por sala vive en el contrato (§4B) |
| **S-011** | El regex de pasos ignora `@x #4:` en silencio | `src/directives.mjs:50` | FUERA DE ALCANCE. Anotar |
| **S-012** | El bloque `mode` del prompt dice «Read-only…» también en `#3`/`#4` | `src/room/prompt.mjs:98` | FUERA DE ALCANCE. Anotar |
| **S-013** | Purgar la privacidad reescribe solo el ledger de la conversación abierta | `src/room.mjs:660`, `src/server.mjs:1935` | FUERA DE ALCANCE para el ledger. **Verificar** que la purga sí limpia la tabla `memories` (`src/memory.mjs:333-370`), porque por un enlace cruzan notas, no entradas |
| **S-014** | En tema claro el Macroverso recibe el acento claro sobre fondo oscuro | `public/salas-mac.js:258-264` | ARREGLAR en 3a |
| **S-015** | `FOCUS_ZOOM` se usa antes de declararse | `public/macroverso.js:211,228,447` | ARREGLAR en 3a |
| **S-016** | `resize` repinta todos los sprites sin debounce | `public/macroverso.js:226-228,489-490` | ARREGLAR en 3a |
| **S-017** | El NOSTROMO de la sala no tiene tope de densidad, ni pausa al ocultar la pestaña, ni medición de cuadro | `public/app.js:15343,15746-15751` | Medir en 3a. Tope y pausa solo si la medición lo pide y sin cambiar lo que se ve |
| **S-018** | `INTERNALS.md:83` dice que varios turnos `#2` corren a la vez; el código deja un solo escritor por proyecto | `src/room/control.mjs:12-16` | FUERA DE ALCANCE. Anotar |

---

## 4 · Qué se construye

Cuatro entregables. Cada uno dice qué es, cómo se ve, qué no hace y cómo se acepta.

### 4A · El Macroverso como flota de NOSTROMOs

**Qué es.** Cada sala es un NOSTROMO: MOTHER al centro con su magma, sus memorias como enanas del color de su tipo, sus venas entre ellas; dibujado por **los mismos pintores** que la sala, no por una copia. El lienzo es espacio abierto: se recorre arrastrando, se acerca con la rueda o el trackpad, no tiene borde, y las estrellas y nebulosas se mueven con paralaje. La Mac sigue al centro y las salas abiertas orbitan cerca y las dormidas lejos y frías (lo que ya funciona se queda); «Recentrar» vuelve a casa.

**Cómo se hace** [P], en este orden y con sus compuertas:

1. **Un solo origen de pintores.** Extraer de `app.js` a un módulo nuevo (`public/nostromo-engine.js`, nombre a confirmar por el orquestador) la física y los pintores de NOSTROMO: `brainRadius`, `shellDepth`, `sizeNostromo`, `stepNostromo`, `projectNostromo`, `pulseNostromo`, `heartbeat`, todo el magma (`magmaMap`, `shadeMagma`, `lavaColour`, `magmaFace`, `magmaBlasts`), las enanas (`dwarfAlbedo`, `sphereTable`, `shadeDwarf`, `dwarfSprite`, `surfaceOf` y sus tablas), las venas, los pulsos, la nebulosa y las estrellas, y las constantes que las pruebas extraen (`test/nostromo-3d.test.mjs:34-35,113-116,246-247,306,348,390`).
   - Los singletons pasan a ser **estado por escena**: `createNostromoScene({ canvas, dpr, reduced, palette })` devuelve un objeto con sus propias cachés (magma, pieles, albedos, tablas). `app.js` crea una escena; el Macroverso crea una por NOSTROMO vivo.
   - `app.js` la importa estáticamente (ya es módulo). `macroverso.js` también. Se añade el archivo a las listas de `src/server.mjs:1274,1430`; si el mapa plano del teléfono (`flat*`, `drawFlat`) se mueve también, se añade a `STATIC` del puente.
   - Las pruebas que extraen por texto (`nostromo-3d`, `nostromo`, `ui-smoke`) se apuntan al archivo nuevo **sin cambiar lo que comprueban**. Ninguna aserción de comportamiento se relaja.
   - **Compuerta 3a-1:** la suite entera en verde y una captura del NOSTROMO de una sala real antes y después, a 1440×900, visualmente idénticas. Si no, se revierte la extracción y se reporta.
   - **Compuerta 3a-2:** medir el NOSTROMO de la sala antes de tocarlo (mediana y p95 de ≥300 cuadros con ≥150 memorias): es la línea base. Después de la extracción, no empeora.
2. **Nivel de detalle en el Macroverso.**
   - **Lejos:** cada sala es un sprite pintado **una vez** por los pintores compartidos: una cara de magma quieta (sin explosiones), sus memorias colocadas con la espiral inicial más una relajación acotada (≤ 300 memorias y ≤ 60 pasos por sprite; si hay más, se muestran las 300 más activas y la ficha dice cuántas son), sus venas quietas. Tamaño del sprite ≤ 512 px de lado a cualquier zoom lejano. Animación barata: giro lento en el plano (lo que ya hay) y el latido de MOTHER como un halo prepintado que respira con `globalAlpha`. Nada por píxel por cuadro.
   - **Cerca:** solo **un** NOSTROMO vivo a la vez, el elegido: la escena real con las mismas constantes de la sala (magma cada dos cuadros, 28 enanas por cuadro), densidad ≤ 2, en el lugar y la escala del sprite al que sustituye. Al salir, la escena se detiene y el sprite se repinta desde su estado, así las memorias no saltan.
   - El sprite «enfocado» de hoy (`sharpen`, `macroverso.js:448-452`) desaparece: lo sustituye la escena viva. Ningún sprite supera 1024 px de lado.
3. **El espacio infinito.** Cámara con coordenadas de mundo, arrastre sobre el vacío, zoom con rueda/pinch acotado a `[0.25, FOCUS_ZOOM × 1.5]`; las teselas de estrellas (ya de 512 px) repiten sin costura bajo cualquier desplazamiento; nebulosa fija a la cámara con paralaje bajo. Sin borde visible.
4. **Venas entre salas** solo cuando existe un contrato (4B): la misma curva con gradiente de las venas de NOSTROMO, con un pulso por cada cruce reciente (tope `PULSE_CAP`), en el sentido del contrato. La prueba `test/salas.test.mjs:120` se sustituye en el mismo commit por una que exija: sin contratos, cero líneas; con uno, una.
5. **Arreglos de paso:** S-014 (el Macroverso siempre usa el acento del tema oscuro), S-015 (declarar `FOCUS_ZOOM` antes de usarlo), S-016 (debounce ≥ 150 ms en `resize`).
6. **Datos.** Ruta nueva en el servidor de Salas: `GET /api/salas/universe?id=<sala>` → `askRoom(puerto, '/api/memory?designation=<nombre>')`; 423 → `{ sealed: true }` (se dibuja enjaulado, como CODE000 en la sala); 404 → `{ outdated: true }`. Sin `&full=1` devuelve, por memoria, solo `id, kind, zone, fromSequence, throughSequence, sourcesCount, recalled, lastRecalled, cold` y los enlaces: **sin texto**. Con `&full=1` (la escena viva y su ficha) devuelve el texto: es el humano mirando sus propias salas; **desde el teléfono, 403**. Se pide una vez por sala y se vuelve a pedir solo cuando cambia su `census` (la misma idea de la caché por `face`). La sala que sirve Salas lee la suya sin HTTP. `census` no cambia de forma.
7. **En el teléfono, nada cambia.**

**Qué no hace.** No usa WebGL ni sombreadores; no dibuja más de una escena viva; no copia pintores; no lee memorias de una sala sellada; no añade campos a `census`.

**Aceptación.** Capturas a 1440×900: vista lejana con ≥ 3 salas, una sala elegida viva, movimiento reducido (cuadro quieto), tema claro (acento oscuro correcto). Mediciones: vista lejana con 10 salas ≤ 1 ms de mediana (hoy 0.4 con soles); escena viva ≤ 1.2 × la línea base del NOSTROMO de la sala; pestaña oculta: cero cuadros. Consola sin errores. El NOSTROMO de la sala: idéntico, con la suite en verde.

### 4B · Enlaces: contratos, validaciones, lógica, seguridad y monitor

**Qué es.** Un enlace es un **contrato entre dos salas, firmado por el humano**, que deja a los agentes de una leer memorias destiladas de la otra, y que fija hasta dónde pueden llegar las órdenes de BISHOP en esa sala.

**El contrato** [P]:

| Campo | Valor | Regla |
|---|---|---|
| `id` | hash corto de las dos salas + nonce | Permanente |
| `rooms` | `{ a, b }` ids de sala | Las dos deben existir en `knownRooms` al firmar; una dormida vale (se lee al despertar) |
| `direction` | `a→b`, `b→a`, `both` | Quién lee de quién |
| `kinds` | subconjunto de `decision, fact, preference, question` | `aberration` nunca |
| `zones` | **fijo** `hold, bridge` (`travels()`) | No es configurable |
| `expires` | ISO o `null` | Caducado = inexistente |
| `revoked` | ISO o `null` | Revocado = inexistente, al instante |
| `orders` | `{ allowed: bool, maxMode: 0..2, perHour: n }` | Techo de las órdenes de BISHOP hacia cada sala. `maxMode` nunca > 2 |
| `signed` | `{ at, by: 'you' }` | — |

- Vive en `~/.pulse/config.json` bajo `enlaces`, escrito con `updateConfig` (candado y renombre atómico, S-001 [V]). Así toda sala lo conoce y Ajustes lo guarda como cualquier cosa.
- **Firmar** = en Salas (escritorio) o arrastrando en el Macroverso de un NOSTROMO a otro: una hoja con sentido, tipos, caducidad y órdenes. Si `orders.allowed`, firmar pide **teclear la designación de la sala que recibirá órdenes**, como armar `#3` pide la del proyecto. Firmar o revocar deja una línea de MU/TH/UR en las dos salas («Enlace con *gumball*: decisiones y hechos, hasta el 30 de noviembre»); nada más entra a sus conversaciones.
- Un contrato cuya sala origen es la sala de Salas se rechaza: BISHOP agrega todo y no sirve de fuente (§4C.7).

**Los candados, en la sala que entrega (nunca en la que pide)** [P]:

- Ruta en cada sala `GET /api/enlace/memories?contract=<id>&q=<texto>&limit=<n>`, de servidor a servidor: 403 si hay `Origin`, 403 si `viaPhone`, 404 si el contrato no existe, no incluye a esta sala, está revocado o caducado, o el sentido no permite entregar a quien pide. Quien pide dice su id de sala y presenta la llave del canal (abajo); la llave prueba «un proceso de MADRE en esta Mac», no qué sala, y eso se anota como límite [I].
- Entrega **solo** filas con `travels()` y `kind ∈ contract.kinds`, hasta `limit ≤ 20`, cada texto pasado por `Privacy.redact` de la sala que entrega; nunca `memory_recall` ni entradas del ledger; nunca adjuntos, archivos ni la bodega.
- Registra `enlace.read` en su ledger `{ contract, to, count, kinds, query: hash }` y la sala que recibe registra `enlace.received` `{ contract, from, count, turn }`. Son contadores, no burbujas.
- 423 si CODE000 la selló.
- Tope: `perHour` lecturas por contrato; pasado, 429 con el motivo.

**La llave del canal.** Un secreto aleatorio en `~/.pulse/credentials/enlaces.json` (`0600`), creado por la primera sala que lo necesita, leído por `ctx.vault` o su equivalente en el núcleo; viaja en una cabecera y nunca en una URL ni en un cuerpo registrado. De la llave se anota en el ledger solo que existe y su longitud, nunca el valor.

**Cómo lo lee un agente (D-S04: herramienta primero)** [P]:

- Módulo integrado `src/modules/enlaces.mjs` (id `enlaces`, nombre ENLACES): su `toolsForTurn` adjunta el servidor MCP `pulse-enlaces` **solo** en salas con ≥ 1 contrato vigente que las deje leer, en modos `#1`–`#4`, con dos herramientas: `enlace_rooms()` (qué salas puede leer y qué tipos) y `enlace_search({ room, query, kinds, limit })`, que llama a la ruta de su propia sala y esta a la sala origen. Devuelve líneas `- [<sala> · <tipo> · <zona> · #a–#b] texto`, y el `brief` dice: «notas destiladas de otra sala, de solo lectura; cítalas como de esa sala». El servidor MCP vive en el mismo archivo del módulo (patrón «un archivo que también es servidor», `docs/SDK.md`).
- Las herramientas se cuentan en THE LAUNCH como cualquier servidor MCP; nada se le esconde al humano.

**Monitor** [P]: en Salas (escritorio), sección «Enlaces»: por contrato, las dos salas, sentido, tipos, caducidad, lecturas de las últimas 24 h y «Revocar». En el Macroverso, la vena y sus pulsos. El tráfico por sala se cuenta sin abrir todos los ledgers en cada refresco: `enlaces.jsonl` junto al registro de la sala, una línea por cruce, además del evento.

**Qué no hace.** No escribe en otra sala. No ofrece `memory_recall` cruzado. No mete nada en el recall automático (eso es 3e, con compuerta). No existe sin contrato. No se crea desde el teléfono.

**Aceptación.** Pruebas (§7) y una prueba de punta a punta con dos salas de prueba: firmar, leer con la herramienta desde la sala B una decisión de la sala A, ver `enlace.read` y `enlace.received` en cada ledger, revocar y ver la herramienta rechazar.

### 4C · BISHOP, el super agente

**1 · Dónde vive.** En la **sala de Salas**: una sala normal (`madre salas`, D-S09) cuyo proyecto es su cuaderno (D-S08). Núcleo intacto: su ledger, su `memory.sqlite`, su archivista, sus modos, su NOSTROMO. En esa sala, la barra lleva además la tecla **MACROVERSO**, y Salas la muestra primero, con «Hablar con BISHOP». Así «otro chat que se abre en Salas» es literal y no se duplica ningún chat.

**2 · Quién es.** Lo elige el humano en la ficha del módulo `src/modules/bishop.mjs` (id `bishop`, nombre BISHOP): un agente detectado o `@madre`. Por defecto `@madre` si Ollama está listo; si no, nadie, y la ficha lo dice. El módulo solo actúa en la sala de Salas; en cualquier otra está apagado y no aparece.

**3 · Qué sabe y qué le decimos.** Un bloque `bishop` en el prompt (§6, excepción 2), presente solo en esa sala con el módulo encendido, ≤ 1500 caracteres, que lleva:

- Su papel: meta-guardián. Responde sobre los proyectos, las decisiones tomadas, los movimientos; cita la sala de cada hecho; dice cuando una sala nunca lo discutió; **nunca mueve un proyecto por dentro**.
- El censo: por sala, nombre, abierta/dormida, quién trabaja, qué espera, conteos por tipo. Sin textos.
- Los contratos vigentes y qué puede leer por cada uno.
- Cómo dar órdenes (abajo) y qué pasará con cada una según el modo del módulo.
- Sus límites: no pide llaves, no propone publicar, no nombra `~/.pulse`, una orden por sala a la vez, hasta 4 órdenes por plan.

Lo que lee, lo lee con `pulse-enlaces` (4B) y con `pulse-memory` de su propia sala. Con `@madre` como BISHOP no hay herramientas (2.6): el bloque `bishop` entra en su `<context>` (`src/adapters/madre.mjs:29`) y el módulo le prepara, por turno, hasta 12 notas de las salas enlazadas que casan con la pregunta, dentro de los 16000 caracteres. Eso se mide (§8).

**4 · Las órdenes.** Al cierre de su respuesta, un bloque ```` ```pulse-salas ````: la primera línea el motivo; después una por línea, `@<sala>/<agente> #<0-2>: texto`. Solo cuenta el último bloque y nada va después; hasta 4; salas y agentes deben existir; `#3`/`#4` se aceptan como sintaxis y siempre se vuelven propuesta. Lo parsea el módulo en `onEvent` sobre la respuesta y registra `bishop.plan.proposed`. La página de la sala de Salas pinta ese bloque como una tarjeta (patrón `renderRunRequest`, `public/app.js:4725-4767` [V]): un botón por orden, «Enviar» y «Omitir», con sala, agente y modo a la vista.

Una orden que se envía recorre el **canal**:

1. El módulo de la sala de Salas llama a `POST /api/x/bishop/order` de la sala destino, de servidor a servidor, con la llave del canal y `{ contract, plan, step, agent, mode, text }`.
2. El módulo de la sala destino comprueba **él mismo**: llave, `viaPhone` → 403, contrato vigente con `orders.allowed`, `mode ≤ orders.maxMode` (y ≤ 2 siempre), tope `perHour`, que no haya otra orden corriendo en esa sala. Si falla, responde con el motivo y la tarjeta lo dice.
3. Si pasa, crea el turno **por la puerta de la sala**: `ctx.room.send({ text, target: agent, mode, via: 'bishop' })`, con el texto encabezado por una línea «BISHOP › orden *n* del plan *m*». **Verificar antes** que `ctx.room` es la `Room` real y qué devuelve `send` (`src/room.mjs:960-1100`): si no se puede obtener el id del mensaje, la correlación se hace por el encabezado y se anota. Si `send` no es alcanzable desde un módulo, **parada**: se pregunta antes de abrir otra puerta.
4. El turno corre con el guardia de esa sala, su `modeCheck`, sus límites de TURNS (429 si está ocupada: el módulo reintenta hasta 10 min y luego marca la orden como no entregada, con motivo).
5. Al terminar, el módulo destino ve la respuesta en `onEvent` y la devuelve a la sala de Salas: `POST /api/x/bishop/result`. Allí se registra como `command.output` `{ name: 'bishop', title: '@claude en gumball', text ≤ 1200 caracteres, link }` — el mismo evento de Runs, que los agentes leen en su siguiente turno (`src/conversation-context.mjs:9-13` [V]) y que la página pinta como tarjeta. **Verificar** que `ctx.record` acepta `command.output` y que `renderCommandCard` (`public/app.js:10672-10705`) pinta un `name` que no sea `run`.
6. Una orden `#3`/`#4` no recorre 3–5: la sala destino registra `bishop.order.proposed`, su página la pinta como tarjeta con «Armar y enviar» que pasa por la llave de siempre (designación, y `AIRLOCK` para `#4`, `public/app.js:3003-3030,3071-3093` [V]) y por `POST /api/messages` desde esa página; Salas y el Macroverso la muestran como «te espera».

**D-S10, lo que queda en el registro:** la recomendación es `via: 'bishop'` en el mensaje (una palabra más en `VIA_KINDS`, `src/room.mjs:46`) y que la burbuja diga el origen como ya dice «desde tu iPhone». Si `send` deja al mensaje como `role: 'you'`, el dataset debe **excluir** `via: 'bishop'` de los pares de entrenamiento (`src/dataset.mjs`), porque no son palabras del humano. Se fija con prueba.

**5 · Los tres modos** (ajuste del módulo, por defecto *manual*):

| Modo | `#0`–`#1` | `#2` | `#3`–`#4` |
|---|---|---|---|
| Manual | Espera el botón | Espera el botón | Propuesta en la sala destino |
| Híbrido | Se envía sola dentro del contrato | Espera el botón | Propuesta en la sala destino |
| Automático | Se envía sola dentro del contrato | Se envía sola dentro del contrato | Propuesta en la sala destino |

Toda orden enviada sola deja una línea en la sala de Salas («BISHOP envió a @codex en *gumball* `#1`: …») y se detiene desde su tarjeta, que llama al stop de esa sala (verificar cuál: por plan `POST /api/plans/:id/stop` existe, `src/server.mjs:2354-2360` [V]; por turno, buscar; si solo hay `stop-all`, se confirma antes).

**6 · Canales, candados y puentes**, con las palabras del humano:

| | Qué es | Dónde se impone |
|---|---|---|
| **Canal** | HTTP loopback entre procesos, sin `Origin`, con la llave del canal; `outbound.jsonl` lo registra como `room` | `request-guard`, llave, `viaPhone` |
| **Candado 1** | El contrato: sentido, tipos, caducidad, revocación | La sala que entrega (4B) |
| **Candado 2** | `orders.maxMode ≤ 2`; `#3`/`#4` solo por la llave del humano en esa sala | La sala destino, en su módulo, y el núcleo de siempre |
| **Candado 3** | Techos por agente de la Mac (`scopes.maxMode`) y `modeCheck` | Núcleo, sin tocar |
| **Candado 4** | `perHour`, una orden a la vez por sala, TURNS | Módulo destino + núcleo |
| **Candado 5** | Privacidad: todo texto que cruza pasa por `redact` al salir y al indexar | Núcleo, sin tocar; S-008 arreglado |
| **Puente 1** | Memorias: `pulse-enlaces` | Módulo `enlaces` |
| **Puente 2** | Órdenes y resultados: `/api/x/bishop/order` y `/result` | Módulo `bishop` |
| **Puente 3** | Lo que el humano ve: tarjetas en las dos salas, Salas, Macroverso | `app.js`, `salas-mac.js`, `macroverso.js` |

**7 · Ruido y aprendizaje.**

- Una orden = **un** mensaje en la sala destino y **una** tarjeta en la sala de Salas. Nada se transmite en vivo entre salas; los turnos intermedios de la sala destino no cruzan. Los eventos `enlace.*` y `bishop.*` son contadores, no burbujas.
- El bloque `bishop` ≤ 1500 caracteres; una tarjeta de resultado ≤ 1200 (el resto, «ver en la sala»); ≤ 12 notas preparadas para `@madre`; `perHour` por defecto 6.
- BISHOP aprende como cualquier sala: las tarjetas de resultado entran a su ledger, se indexan (`src/memory.mjs:940` [V]) y se destilan; sus memorias llevan sala de origen en el texto; el pulgar del humano las mueve de zona como en toda sala. Dos reglas extra: la sala de Salas **no sirve de origen** en ningún contrato, y su archivista es el local si existe (ya es el primero de la lista, `src/distiller.mjs:10` [V]).
- Con `@madre` como BISHOP: solo consulta y propone; el modo automático no puede pasar de `#1`. Si en una prueba de 5 intentos el modelo local no cierra con un bloque `pulse-salas` válido, BISHOP con `@madre` queda como «consulta» y el reporte lo dice. No se le enseña dos veces ni se le fuerza por heurística.

**Qué no hace.** No edita proyectos. No crea turnos por `record()`. No manda `#3`/`#4` por el canal. No escribe en la memoria de otra sala. No guarda llaves. No delega dentro de su propia sala con ```` ```pulse ````: el bloque `bishop` se lo dice, y si el orquestador encuentra cómo apagar la delegación solo en esa sala (`PULSE_DELEGATION`, `room.delegation`, `src/server.mjs:154,491-496` [V]) sin tocar el núcleo, lo hace.

**Aceptación.** Pruebas de §7 y, de punta a punta con dos salas de prueba y la sala de Salas: BISHOP responde una pregunta sobre dos salas citando cada una; propone un plan; en manual el humano envía una orden `#1` a la sala A y la tarjeta de resultado vuelve; en automático, una orden `#2` sale sola dentro del contrato y una `#3` llega como propuesta y se arma con la designación; con el contrato revocado, el canal responde 404 y la tarjeta lo dice.

### 4D · Salas como puerta de entrada

- `madre salas` abre la sala de Salas; `madre` en `$HOME` también (D-S09). Si ya está abierta, la muestra, como hoy con cualquier sala (`bin/madre.mjs:21-35` [V]). En Salas, su tarjeta va primero con «Hablar con BISHOP»; `/salas` lo siguen sirviendo todas las salas.
- Sección «Enlaces» (4B) y el botón del Macroverso (4A).
- Nada de esto llega al teléfono.

---

## 5 · Orden de ejecución y compuertas

Cada fase cierra con la suite en verde, `pack:check`, su línea en la bitácora de `docs/MACROVERSO.md` y un commit. Las fases se pueden repartir entre agentes en paralelo **solo** donde no comparten archivos: `app.js`, `server.mjs` y `es.js` los toca uno a la vez, en secuencia.

| Fase | Qué | Compuerta para empezar | Compuerta para cerrar |
|---|---|---|---|
| **3a** | 4A: medir, extraer pintores, flota de NOSTROMOs, espacio infinito, S-014/015/016 | Citas de 2.8 confirmadas | 3a-1, 3a-2, aceptación de 4A |
| **3b** | S-008 y contratos: forma, `updateConfig`, candados en la sala que entrega, llave del canal, eventos y contadores | Citas de 2.3–2.5 confirmadas | Pruebas de contrato y de candados en verde; 403 del teléfono |
| **3c** | 4B herramienta `pulse-enlaces`, monitor en Salas, firma desde Salas y desde el Macroverso, venas | 3b cerrada | Punta a punta de 4B |
| **3d** | 4D: `madre salas`, sala de Salas, tecla MACROVERSO en esa sala | D-S08/D-S09 asumidas y anotadas | `madre salas` abre y cierra como cualquier sala; Windows: spawn sin shell |
| **4a** | 4C.1–3: módulo `bishop`, bloque `bishop`, censo, elección del agente | 3c y 3d cerradas | Fixture dorado del prompt actualizado con razón; BISHOP responde citando salas |
| **4b** | 4C.4: `pulse-salas`, tarjeta, canal, `via`, resultado como `command.output` | Verificaciones de 4C.4 pasos 3 y 5 hechas y anotadas | Orden `#1` manual de punta a punta |
| **4c** | 4C.5–7: modos híbrido y automático, topes, propuestas `#3`/`#4`, aprendizaje | 4b cerrada | Aceptación de 4C |
| **3e** | Recall automático de notas enlazadas (D-S04, segunda parte): bloque en el prompt, presupuesto dentro de `recallShare` | **Pregunta al humano** antes: cambia lo que cada turno lee | — |

**Paradas obligatorias**, en cualquier fase:

- Una cita [V] rota o un hecho [I] falso que sostiene el paso.
- Un cambio fuera de la lista de §6.
- Algo que haga leer a un agente contenido nuevo sin contrato.
- Un presupuesto de §8 que no se cumple después de dos intentos.
- Una dependencia nueva, por pequeña que sea.
- Un dato que tendría que salir de la Mac.
- Una decisión [?] que no esté marcada como asumible.

Al parar: se deja el árbol en verde (revertir si hace falta), se escribe la línea en la bitácora y se reporta con §9. No se rodea el obstáculo.

---

## 6 · Lo que no se toca, y las excepciones permitidas al núcleo

**Solo lectura para este encargo:** `src/room/guard.mjs`, `src/room/control.mjs`, `src/room/escalation.mjs`, `src/checkpoint.mjs`, `src/directives.mjs`, `src/memory.mjs` (salvo lo que 3e decida con el humano), `src/distiller.mjs`, `src/room/archivist.mjs`, `src/privacy.mjs`, `src/request-guard.mjs`, `src/bridge/*`, `src/adapters/{claude,codex,gemini,opencode,process}.mjs`, `src/event-store.mjs`, `src/vault.mjs`, `src/outbound.mjs`.

**Excepciones permitidas**, cada una aditiva, pequeña, con su prueba y su línea en la bitácora:

1. `VIA_KINDS` + `'bishop'` (`src/room.mjs:46`) y que la burbuja muestre ese origen (`public/app.js`). Si `POST /api/messages` llega a usarse para una orden, la palabra la pone el módulo destino en su propio proceso, nunca el cuerpo de una petición.
2. Un bloque `bishop` en `src/room/prompt.mjs` (`PROMPT_BLOCKS` y `BLOCK_SOURCES`), vacío salvo en la sala de Salas con el módulo encendido; el fixture dorado se actualiza con razón escrita. El mismo texto entra al briefing de `src/adapters/madre.mjs` por su propio camino.
3. `src/mcp/memory-server.mjs:74-84`: `memory_note` pasa por el guardia de privacidad (S-008).
4. Los manejadores de rutas de módulo reciben `viaPhone` (donde `src/server.mjs` despacha `/api/x/<id>/`), para que un módulo pueda negar al teléfono por su lado.
5. `src/dataset.mjs`: excluir `via: 'bishop'` de los pares, si D-S10 deja el mensaje como `role: 'you'`.
6. `bin/madre.mjs` y `src/cli-args.mjs`: comando `salas` y la regla de `$HOME` (D-S09). Sin shell, con `docs/WINDOWS.md` leído.
7. `src/server.mjs`: listas de archivos estáticos, rutas `/api/salas/universe` y `/api/enlace/*` junto a las de Salas (precedente de la fase 1), 403 al teléfono en cada una.
8. `public/app.js`: extracción de pintores (refactor sin cambio de comportamiento), tarjetas de `pulse-salas`, de resultado y de propuesta, tecla MACROVERSO en la sala de Salas, origen `bishop` en la burbuja.

Nada más. Si una necesidad real no cabe aquí, es una parada.

---

## 7 · Pruebas exigidas

Antes de la interfaz, una prueba por regla. Mínimo:

- **Contrato:** forma válida e inválida; `aberration` rechazado; zonas no configurables; caducado y revocado = inexistente; `orders.maxMode > 2` rechazado; la sala de Salas no es origen.
- **Candados en la sala que entrega** (dos `createPulseServer` reales, como `test/salas.test.mjs:71-105`): sin contrato 404; sentido contrario 404; con `Origin` 403; desde teléfono 403; sellada 423; `perHour` 429; solo `travels()` y `kinds`; texto redactado; `enlace.read` y `enlace.received` en cada ledger; sin llave 403.
- **S-008:** una `memory_note` con un término privado llega redactada.
- **Herramienta:** `pulse-enlaces` solo viaja con contrato vigente; el `brief` dice de solo lectura; contado en THE LAUNCH.
- **`pulse-salas`:** último bloque, nada después, ≤ 4, sala o agente inexistente, `#3`/`#4` → propuesta, motivo obligatorio.
- **Canal:** una orden `#3` **nunca** llega a `send` (la prueba lo intenta y lo demuestra); `perHour`; una a la vez; resultado ≤ 1200; `via: 'bishop'` en el ledger; excluido del dataset si aplica.
- **Modos:** manual no envía nada solo; híbrido envía `#1` y espera `#2`; automático envía `#2` dentro del contrato y nunca fuera.
- **`madre salas`:** parse del comando y regla de `$HOME`; el spawn de Salas sigue sin shell (`test/salas.test.mjs:43-61` sigue en verde).
- **Macroverso:** sin `webgl`; `dpr ≤ 2`; una sola escena viva; sprites ≤ 1024 px; líneas solo con contrato; movimiento reducido; `visibilitychange`; el engine compartido es la única fuente de pintores (ninguna función de la lista de 4A.1 queda duplicada en `app.js` ni en `macroverso.js`); `KIND_COLOURS` desaparece o se ata a `MEMORY_COLORS` con prueba.
- **Extracción:** `nostromo-3d`, `nostromo` y `ui-smoke` apuntados al archivo nuevo, mismas aserciones.
- **i18n:** archivos nuevos en la lista; cada clave nueva con su español a mano.
- **Teléfono:** cada ruta nueva responde 403 con `x-madre-device`, en la sala, y la política del puente no la lista.

**Verificación manual obligatoria:** Chrome a 1440×900 para 4A y las tarjetas; mediciones de §8 con sus números; dos salas de prueba de verdad (como `sala-prueba`) para 4B y 4C; el simulador de iOS para comprobar que Salas en el teléfono no cambió y que las rutas nuevas niegan.

---

## 8 · Presupuestos

| Qué | Tope | Cómo se mide |
|---|---|---|
| Macroverso, vista lejana, 10 salas | ≤ 1 ms mediana, ≤ 3 ms p95 | ≥ 300 cuadros, Chrome 1440×900, densidad 2, `performance.now()` alrededor de `draw` |
| Escena viva | ≤ 1.2 × línea base del NOSTROMO de la sala | Misma sala, mismo tamaño, antes y después |
| Memoria de sprites | ≤ 1024 px de lado cada uno; ≤ 64 MB en total | Suma de `width × height × 4` |
| Bloque `bishop` | ≤ 1500 caracteres | THE CORE de la sala de Salas |
| Notas preparadas para `@madre` | ≤ 12, dentro de 16000 caracteres de `<context>` | Longitud del `<context>` medida |
| Tarjeta de resultado | ≤ 1200 caracteres | Prueba |
| Órdenes automáticas | `perHour` por contrato, 6 por defecto; una a la vez por sala | Prueba |
| Lecturas cruzadas | `limit ≤ 20` notas, ≤ 240 caracteres cada una | Prueba |
| Pestaña oculta | 0 cuadros | `visibilitychange` + contador |

Un presupuesto que no se cumple no se «ajusta»: se reporta con la medición y se para si no sale al segundo intento.

---

## 9 · Formato del reporte final

En español, conciso, para el humano. Ocho secciones, siempre las ocho aunque una diga «nada»:

1. **Hecho** — por fase, qué se construyó, con los commits (hash y título). Nada publicado.
2. **Verificado** — qué prueba o captura o medición lo demuestra, con los números.
3. **No verificado** — lo que no se pudo probar y por qué (hardware real, modelo local, tiempo).
4. **Hallazgos nuevos** — ids S-0xx añadidos a `docs/MACROVERSO.md`, con estado.
5. **Decisiones tomadas por el orquestador** — cada [P] donde se apartó de la recomendación, con la razón verificable; y D-S07..D-S10 tal como se asumieron.
6. **Decisiones que necesita el humano** — las [?] nuevas, con recomendación. Incluye 3e.
7. **Paradas** — si hubo, dónde y por qué; el árbol quedó en verde.
8. **Lo que no se hizo** — y qué falta para hacerlo.

Sin adjetivos sobre el propio trabajo. Sin «debería». Lo que se afirma, se cita.

---

## 10 · Lectura del ejecutor (auto-revisión de este encargo)

Antes de cerrar este documento se leyó como lo leería quien lo ejecute, buscando el primer punto donde tendría que inventar. Esto es lo que esa lectura cambió:

1. **El techo de modo es de toda la Mac, no de la sala** (`src/server.mjs:515-527`). La primera versión suponía un techo por sala; no existe. Ahora el techo de las órdenes vive en el contrato (S-010).
2. **La llave de `#3`/`#4` no existe en el servidor** (`src/override.mjs:3`). La primera versión decía que «el núcleo ya impide que BISHOP pase del modo armado». Es falso por HTTP. Ahora el canal nunca manda ≥ `#3` y una prueba lo demuestra (S-009).
3. **Un módulo no fabrica turnos con `record()`** (`docs/SDK.md`). La primera versión hacía que el módulo registrara la orden como mensaje. Ahora la orden entra por `ctx.room.send` desde el proceso de la sala destino, y si eso no es alcanzable, es una parada, no un rodeo.
4. **`memory_note` no redacta** (`src/mcp/memory-server.mjs:74-84`). Sin S-008, una nota con un término privado cruzaría limpia por diseño y sucia de hecho. Va antes del primer cruce.
5. **Los pintores de NOSTROMO son singletons de `app.js`** y tres suites los extraen por texto. «Reutilizar la UX de NOSTROMO» no es copiar funciones: es una extracción con estado por escena y pruebas apuntadas de nuevo, con captura antes y después.
6. **Dos pruebas fijan el presente** (`lineTo`, `census`). La primera versión las habría roto «por el camino»; ahora cada una se sustituye en el mismo commit que la justifica, y `census` no cambia.
7. **`@madre` no tiene herramientas.** Por eso el bloque `pulse-salas` es el canal canónico (vale para cualquier agente) y las herramientas son un complemento; y por eso BISHOP con `@madre` se mide antes de prometerse.
8. **Dos fallas ya estaban ahí** (S-014 acento claro, S-015 TDZ) y entran en 3a para no dejar un Macroverso «imponente» con un error latente.
9. **La fase 3e cambia lo que cada turno lee.** No se asume: se pregunta.
