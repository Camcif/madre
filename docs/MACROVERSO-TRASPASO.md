# Traspaso · Salas, Macroverso, Enlaces y la sala de Salas

Estado al `2026-10-08`, en `main` local, **sin push y sin publicar**. Escrito para que otra
sesión (Codex u otro agente) continúe sin leer la conversación que lo produjo. Este
repositorio no lleva `.ahp/`: este archivo es el relevo. Las reglas de ejecución siguen
siendo las de `docs/MACROVERSO-ENCARGO.md`; el estado de cada hallazgo y decisión vive en
`docs/MACROVERSO.md` (§3, §7, §8, §9) y este archivo no lo repite, lo señala.

---

## 1 · Qué hay en el árbol

| Commit | Qué |
|---|---|
| `06ba8b3` | D-S01..06 cerradas, segunda lectura del código, el encargo (`docs/MACROVERSO-ENCARGO.md`) |
| `f195583` | 3a · `public/nostromo-engine.js` (motor extraído de `app.js`), el Macroverso como flota de NOSTROMOs |
| `b93928b` | 3b · `src/enlaces.mjs`: contrato, llave del canal, `GET /api/enlace/memories`; S-008 |
| `8acdd74` | 3c interfaz · sección Enlaces y hoja de firma en Salas, venas del Macroverso, línea en la sala |
| `5ae1dca` | 3c servidor · módulo `src/modules/enlaces.mjs` (MCP `pulse-enlaces`), `/api/enlace/ask`, `/notice`, firma y revocación desde la página |
| `6085e24` | 3c · cierre tras la prueba de punta a punta |
| `891e30e` | 3d servidor y CLI · `madre salas`, `madre` desde `$HOME`, `isSalasRoom`, `/api/state.salas`; S-022 |
| `be0e357` | 3d · tecla MACROVERSO en la sala de Salas, tarjeta primero en Salas; fusión |

`main` está 62 commits por delante de `origin/main` y ninguno por detrás. Ramas de trabajo
(`enlaces/3b`, `enlaces/3c`, `salas/3d`) ya fusionadas y borradas. Quedan dos árboles
anteriores a este trabajo, que no se tocaron: `.claude/worktrees/ux-ajustes` (detached en
`0d8f700`) y `.claude/worktrees/loving-gates-a4d7cd` (rama `claude/loving-gates-a4d7cd`).

**Suite:** `npm test` 633 pruebas en verde y `npm run pack:check` en la última fusión
(`be0e357`); se volvió a correr al escribir este archivo (ver §7).

## 2 · Mapa de lo construido (dónde buscar cada cosa)

**Motor y Macroverso (3a).**
- `public/nostromo-engine.js`: la física y los pintores de NOSTROMO, extraídos verbatim de
  `app.js`. `createNostromo(scene)` cierra sobre el objeto de escena; ganchos `words`,
  `covered`, `onClang`; bandera `bare` (sin cielo, estrellas ni viñeta) para el Macroverso.
  Lo compartido (paleta `MEMORY_COLORS`, `travels`, `magmaMap`, texturas) está arriba, a nivel
  de módulo; `shading` y `magmaSprite` son por escena.
- `public/app.js`: importa del motor; crea `nostromo.words/covered/onClang` y luego
  `createNostromo(nostromo)`; expone `__pulse.nostromoTick` para medir en síncrono.
- `public/macroverso.js`: flota de NOSTROMOs. Lejos, cada sala es un sprite (≤ 300 memorias,
  ≤ 1024 px, repintado cuando llegan las texturas); cerca, **una sola** escena viva
  (`LIVE_SIDE` 760). Espacio infinito: arrastre, rueda, RECENTRAR. `drawVeins` es el único
  lugar que dibuja curvas (una prueba lo fija). Arrastrar un universo sobre otro llama
  `actions.link`. `globalThis.__macroverso.peek()` devuelve `{ live, universes, veins, camera, textures, raf }`.
- Datos: `GET /api/salas/universe?id=<sala>[&full=1]` (`universeOf` en `src/salas.mjs`);
  sin `full` no viajan los textos; 403 desde el teléfono.

**Enlaces (3b, 3c).**
- `src/enlaces.mjs`: contrato `{ id, rooms:{a,b}, direction 'a→b'|'b→a'|'both', kinds, zones (fijas: hold, bridge), expires, revoked, orders:{allowed, maxMode ≤ 2, perHour}, signed }`
  en `config.json` bajo `enlaces` (objeto por id, nunca se borra: revocar sella). Reglas:
  `normalizeContract`, `activeContracts`, `mayServe`, `receivesOrders`, `servingRooms`;
  firma y revocación con `updateConfig` (con candado). La llave del canal vive en
  `~/.pulse/credentials/enlaces.json` (`0600`), cabecera `x-madre-enlace`.
  **`a→b` significa que las notas viajan de a a b** (b pide, a entrega).
- Rutas en `src/server.mjs`, sección ENLACES después de las de Salas (líneas ~1512-1640):
  `GET /api/enlace/memories` (la sala que entrega), `POST /api/enlace/ask` (la sala que pide,
  por sí misma), `POST /api/enlace/notice` (`enlace.signed`/`enlace.revoked`),
  `POST /api/salas/enlaces` y `POST /api/salas/enlaces/revoke` (desde la página).
  Todas: teléfono 403, `Origin` 403, llave obligatoria; contrato que no sirve = 404 `No such link.`;
  CODE000 423; `perHour` 429. `GET /api/salas` devuelve `salas` (id de la sala de Salas) y
  `enlaces[].traffic` (`reads24h`, `reads1h`, `lastAt`, desde `<sala>/enlaces.jsonl`).
- `src/modules/enlaces.mjs`: módulo ENLACES (encendido por defecto). Al ejecutarse es el
  servidor MCP `pulse-enlaces` (`enlace_rooms`, `enlace_search`); viaja solo en `#1`+ y solo
  cuando un contrato vigente deja leer a esa sala. Sin contrato, la herramienta no existe.
- Interfaz: `public/salas-mac.{html,js,css}` (sección `#sm-links-group`, `openLinkSheet`,
  `drawLinks`, `revokeLink`, `darkAccent`), `public/macroverso.js` (`drawVeins`, arrastre para
  enlazar), `public/app.js` (`renderEnlace` para `enlace.signed`/`enlace.revoked`),
  `public/es.js` (bloques Macroverso y ENLACES).

**La sala de Salas (3d).**
- `src/salas.mjs`: `salasProjectRoot` (`~/.pulse/salas`, bajo `PULSE_HOME` cuando está),
  `salasRoomId`, `isSalasRoom`, `ensureSalasProject`, `projectRootFor` (regla pura:
  `--project` gana; `salas` abre el cuaderno; `madre` sin `--project` abre el cuaderno solo si
  `cwd` es `$HOME`, comparados como rutas reales), `projectRoomId` (movido aquí desde el servidor).
- `bin/madre.mjs` y `src/cli-args.mjs`: comando `salas`; `--help` en cualquier posición (S-022).
- `GET /api/state` trae `salas: true` solo en esa sala. En ella la barra lleva **Macroverso**
  (`BAR_DEFAULT`/`BAR_JOINED` en `app.js`; abre `/salas#macroverso`). Salas la lista primero
  con el chip «La sala de Salas». Nunca entrega notas; es la única que puede recibir
  `orders.allowed`, y entonces la **otra** sala recibe las órdenes y la firma pide su designación.

**Pruebas que fijan todo esto:** `test/enlaces.test.mjs`, `test/enlaces-module.test.mjs`,
`test/salas-room.test.mjs`, `test/salas.test.mjs`, `test/nostromo.test.mjs`,
`test/nostromo-3d.test.mjs`, `test/ui-smoke.test.mjs`, `test/folds.test.mjs`, `test/modules.test.mjs`.

**Documentación ya actualizada:** `CHANGELOG.md` (sección *Sin publicar*: «Salas en tu Mac»,
«Enlaces entre salas (avance)»), `docs/REFERENCE.md` (SALAS: Macroverso, Enlaces, La sala de
Salas), `docs/MACROVERSO.md` (bitácora completa por fase).

## 3 · Lo que falta (en este orden)

Las fases 4a → 4b → 4c están **encargadas, no construidas**. El diseño exacto está en
`docs/MACROVERSO-ENCARGO.md` §4C (BISHOP) y §5 (compuertas); las pruebas exigidas en §7; los
presupuestos en §8; las únicas excepciones al núcleo en §6. No se resume aquí para no
desviarse del texto que vale.

| Fase | Compuerta para empezar | Compuerta para cerrar |
|---|---|---|
| **4a** · módulo `src/modules/bishop.mjs`, bloque `bishop` en `src/room/prompt.mjs` (excepción §6.2), censo de salas y contratos, elección del agente en la ficha | 3c y 3d cerradas (lo están) | fixture dorado del prompt actualizado con razón escrita; BISHOP responde citando salas |
| **4b** · bloque ```` ```pulse-salas ```` al cierre de la respuesta, tarjeta (patrón Runs), canal `POST /api/x/bishop/order` y `/result`, `via: 'bishop'` (D-S10), resultado como `command.output` | **verificar y anotar antes** 4C.4 pasos 3 y 5: que `ctx.room.send` existe y qué devuelve (`src/room.mjs`), que `ctx.record` acepta `command.output` y que `renderCommandCard` pinta un `name` distinto de `run` | una orden `#1` manual de punta a punta |
| **4c** · modos manual/híbrido/automático, topes, propuestas `#3`/`#4` en la sala destino, aprendizaje | 4b cerrada | aceptación de §4C |
| **3e** · recall automático de notas enlazadas | **preguntar al humano antes de empezar** (cambia lo que cada turno lee) | — |

**Gobernanza contra los bucles (D-S11, cerrada por el humano; vale para 4b y 4c):** solo
BISHOP ordena, y solo dentro de un plan que arrancó un mensaje del humano; una sala que recibe
una orden no puede ordenar ni delegar hacia fuera (`depth: 1`); el resultado vuelve a la sala
de Salas como tarjeta y **no arranca ningún turno**; a lo sumo 4 órdenes y un cierre por plan,
y el cierre no abre otro plan; una orden a una sala que ya corre una orden espera o falla, nunca
se encola sin tope; el modo automático cuenta contra `perHour` y se detiene con STOP ALL.
`#3`/`#4` nunca viajan por el canal: llegan como propuesta y las arma el humano en esa sala.

**Decisiones asumidas por el ejecutor que 4a-4c heredan:** D-S07 el nombre es BISHOP; D-S08 el
cuaderno es `~/.pulse/salas` (sin ajuste para cambiarlo todavía); D-S09 `madre salas` y `madre`
en `$HOME`; D-S10 `via: 'bishop'` queda por decidir al construir 4b (ver §4).

## 4 · Decisiones que necesita el humano

Ninguna bloquea 4a. Las que tocan 4b se marcan.

| # | Qué | Recomendación | Bloquea |
|---|---|---|---|
| 1 | **S-021** · `enlace.received` no sabe qué agente ni qué turno pidió la lectura (`turn: null`) | El módulo ENLACES pone `PULSE_ENLACES_AGENT` en el `env` del servidor MCP y añade `agent` al cuerpo de `/api/enlace/ask`; aditivo, sin tocar el núcleo | — |
| 2 | **S-019** · `RoomMemory.purge()` reinserta cada nota redactada sin `zone`, `refuted_by`, `contradicts`, `correction`, `detector`, `confidence` ni `recalled` (`src/memory.mjs:339,363`): tras purgar, una nota de enfermería o esclusa vuelve a viajar (a un turno y por un enlace) | Conservar las columnas al reinsertar. `src/memory.mjs` es solo lectura en el encargo: necesita permiso explícito | — |
| 3 | El contrato tiene **un solo `perHour`** para lecturas y para órdenes | Separar en `orders.perHour` y `reads.perHour` cuando 4b lo necesite; hoy las lecturas usan `orders.perHour` (por defecto 6) | 4b |
| 4 | **D-S10** · cómo queda la orden en el registro | `via: 'bishop'` en `VIA_KINDS` (`src/room.mjs:46`) y, si `send` lo deja como `role: 'you'`, excluirlo del dataset (`src/dataset.mjs`); con prueba | 4b |
| 5 | **D-S08** · la carpeta de la sala de Salas no se puede cambiar en Ajustes | Dejarlo para después de 4c, o nunca | — |
| 6 | `madre doctor` desde `$HOME` reporta el cuaderno de Salas (consecuencia de D-S09: la regla vale para todo comando) | Mantener; documentar en REFERENCE si molesta | — |
| 7 | `enlaces.jsonl` por sala no rota | Rotar como `outbound.jsonl` si existe un patrón; si no, dejar | — |
| 8 | ENLACES aparece en MÓDULOS con el ícono por defecto | Dibujar uno en la familia de los demás (ver memoria de íconos: nada de Zappicon en `public/`) | — |
| 9 | Una sala **dormida** no recibe la línea de firma al despertar (el aviso solo llega a salas abiertas; lee el contrato al despertar) | Mantener: el contrato es la verdad, la línea es cortesía | — |
| 10 | **3e** · recall automático de notas enlazadas | Preguntar; si se aprueba, bloque en el prompt dentro de `recallShare` | 3e |
| 11 | `package.json` sigue en `0.7.2` (último bump: `0fdec33`) mientras `CHANGELOG.md` lleva `1.0.0 · Sin publicar` | Decidir el número al publicar; nada de este trabajo lo tocó | — |

## 5 · Problemas encontrados y cómo se resolvieron

Para no repetirlos. Los que siguen abiertos están en §4 y en `docs/MACROVERSO.md` §3.

- **Medir el dibujo en el panel del navegador.** `requestAnimationFrame` cae a 1-2 fps a
  ratos en el panel; las mediciones por rAF salían infladas. Se mide en síncrono:
  `__pulse.nostromoTick(now)` en la sala y `__macroverso.peek()` en el Macroverso, con un
  reloj continuo (`window.__now`); un reloj que retrocede produce radios negativos en el motor.
- **A/B de la extracción (S-017).** Misma sala, mismo minuto, 300 ticks: antes 6.9-7.2 ms,
  después 5.8-6.0 ms de mediana. La extracción no empeora; no hace falta tope ni pausa.
- **`dirty` perdido entre refrescos del Macroverso.** El layout conservaba el anterior solo si
  cara y densidad coincidían, y perdía la marca de repintado: `dirty: !same || Boolean(before?.dirty)`.
  Al descartar la escena viva, `live.screen` quedaba viejo: se pone en `null`.
- **Acento en tema claro (S-014).** El Macroverso es siempre oscuro; `darkAccent()` lee `--acc`
  de la regla `[data-accent="x"]` de la hoja de estilos antes de que el esquema claro lo recoloree.
- **Fecha en inglés en la línea de la sala.** `toLocaleDateString(language(), { day: 'numeric', month: 'short' })`.
- **`.sm-link .who` heredaba mayúsculas y mono.** `font-family: var(--read)`, `text-transform: none`.
- **`ui-smoke`:** añadir `macroverso` a la lista de teclas embarcadas rompía la prueba de la
  barra; la lista queda igual y se afirma que una sala ordinaria **no** ofrece la tecla.
- **Prueba de Ollama** falla a veces bajo carga (5.5 s); sola pasa. No es de este trabajo.
- **Fusiones.** Conflictos en las tablas y la bitácora de `docs/MACROVERSO.md` y en el `import`
  de `src/server.mjs` cuando dos agentes trabajaron en paralelo: se conservan los dos lados, la
  bitácora solo se añade al final. Un árbol de trabajo bloqueado se quita con
  `git worktree unlock` y luego `remove --force`.
- **zsh:** `${...}` dentro de `node -e "..."` con comillas dobles da *bad substitution*; usar
  comillas simples.
- **Rutas reales.** `process.cwd()` es la ruta física y `homedir()` la de `$HOME`; en esta Mac
  difieren bajo `/var`. `projectRootFor` compara con `realFolder`, nunca como texto.
- **`config.json` compartido.** Dos salas escribiendo a la vez se pisaban (S-001, S-007):
  todo cambio pasa por `updateConfig` con candado y cada módulo escribe solo su clave. Las
  firmas de contratos siguen ese camino.

## 6 · Reglas de trabajo vigentes (del humano)

- **Nada de push, nada de deploy, nada publicado.** Commits locales a criterio, por higiene.
- No inventar: lo que se afirma se cita con `ruta:línea`; una cita rota es una parada
  (`docs/MACROVERSO-ENCARGO.md` §0 y §5).
- No cambiar el núcleo fuera de las ocho excepciones de §6 del encargo.
- Español neutro mexicano, conciso; cada clave nueva de la interfaz con su español a mano en
  `public/es.js`; copia en la terminal en inglés como el resto.
- Credenciales nunca en `config.json`, ledger ni logs (la llave del canal vive en `~/.pulse/credentials/`).
- Antes de tocar procesos, rutas o permisos, leer `docs/WINDOWS.md`; MADRE no declara soporte
  ni no-soporte de Windows.
- Nada de esto llega al teléfono: cada ruta nueva responde 403 con `x-madre-device` y la
  política del puente (`src/bridge/policy.mjs`) no la lista.

## 7 · Entorno de esta Mac al momento del traspaso

- Salas de verdad usadas para probar: `pulse` (este repo) y `sala-prueba` (carpeta de
  pruebas de la sesión, puede no existir ya); la sala de Salas (`~/.pulse/salas`, id
  `salas-68dee27f3c55f1a3`). Los registros viven en `~/.pulse/rooms/<nombre>-<sha16>/`.
- Al escribir esto seguían abiertas dos salas lanzadas por la sesión anterior: la de este
  repo en el puerto 4401 y la de Salas en el 4318 (`madre salas --no-open`). La sala del
  humano (`gumball`, 4317) no es de pruebas. Se cierran con `POST /api/room/close` desde Salas
  o con `SIGTERM` al proceso.
- En `~/.pulse/config.json` quedan **dos contratos de prueba sellados** (revocados, por
  diseño nunca se borran): `pulse → sala-prueba` y `pulse → salas` (este con `orders.allowed`,
  `maxMode 1`). No estorban: `activeContracts` los ignora. Si se quieren quitar, a mano.
- Cómo probar lo hecho sin navegador:

```bash
npm test
```

```bash
npm run pack:check
```

```bash
node bin/madre.mjs salas --no-open
```

  y en otra terminal `curl -s http://127.0.0.1:<puerto>/api/state` debe traer `"salas":true`.

- Cómo probar un enlace de punta a punta: abrir dos salas, en `/salas` de cualquiera pulsar
  **Enlazar salas**, firmar, y desde la sala que lee `POST /api/enlace/ask` con la llave de
  `~/.pulse/credentials/enlaces.json` en `x-madre-enlace` y `{ "contract": "<id>", "q": "..." }`;
  `enlaces.jsonl` de la sala que entrega gana una línea y Salas muestra el tráfico. Todo esto
  lo hace solo `test/enlaces-module.test.mjs` con dos salas reales.

## 8 · Formato del reporte al cerrar cada fase

El de `docs/MACROVERSO-ENCARGO.md` §9, siempre las ocho secciones: Hecho · Verificado · No
verificado · Hallazgos nuevos · Decisiones del ejecutor · Decisiones del humano · Paradas · Lo
que no se hizo. Cada fase cierra con la suite en verde, `pack:check`, su línea al final de la
bitácora de `docs/MACROVERSO.md` y un commit local.
