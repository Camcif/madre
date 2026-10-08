# MADRE · SALAS EN ESCRITORIO Y MACROVERSO

Documento único de este trabajo, como `docs/MOBILE.md` y `docs/WINDOWS.md`: lo que se
decida, se construya o se descarte sobre Salas, los enlaces entre salas y el Macroverso
se anota aquí. Lo que toca procesos o rutas sigue además las reglas de `docs/WINDOWS.md`.

| | |
|---|---|
| Estado | **Fase 1 · hecha** (Salas en escritorio). Fase 2 en curso; 3 y 4 esperan decisiones |
| Origen | Pedido del 2026-10-08, después de probar Salas en el teléfono |
| Regla en vigor | Nada aquí cambia el núcleo de una sala (registro, memoria, modos). Un enlace lee; nunca escribe en otra sala |

---

## 1 · Qué se pidió

1. **Salas en escritorio**, como puerta de entrada: abrir varios proyectos, administrarlos,
   cerrarlos y enlazarlos, sin que una sala pise a otra. Salas en el teléfono ya funciona y
   se queda como está.
2. **Enlazar salas** para trabajar en varios proyectos a la vez y compartir lo que saben,
   con una capa de **contratos, validaciones, lógica, seguridad y monitor**.
3. **El Macroverso**: todas las salas como universos, con la UX de NOSTROMO adaptada para
   que se sienta imponente sin cargar la GPU ni fallar al dibujar. Un **super agente**
   elegido por el humano sugiere enlaces, revisa riesgos y arma lo necesario, en modo
   **manual, automático o híbrido**.
4. El Macroverso **solo se entra desde Salas y solo en escritorio**. En el teléfono, una
   versión simple que no sature.
5. Mantener el estilo de MADRE: coherencia visual, navegación y usabilidad primero.

---

## 2 · Cómo funcionan hoy las salas (verificado en el código)

| Hecho | Dónde |
|---|---|
| Una sala es un proceso `madre start` por proyecto. Sin `--port` empieza en 4317 y avanza al siguiente puerto libre | `bin/madre.mjs` (`openRoom`, `roomAlreadyOpen`) |
| Si el proyecto ya tiene una sala abierta cerca, `madre start` muestra esa y no abre otra | `bin/madre.mjs:20-36` |
| La sala misma se niega a abrir dos veces el mismo proyecto: `open.json` guarda `pid` y puerto, y si ese `pid` vive responde `ROOM_IN_USE` | `src/server.mjs:204-211` |
| Los datos de cada sala viven en `~/.pulse/rooms/<carpeta>-<hash>/`: conversaciones, `memory.sqlite`, adjuntos, `outbound.jsonl` | `src/server.mjs:186` |
| El id de la sala es el nombre de la carpeta más un hash de la ruta: **no se puede volver a la ruta**, y la ruta completa no se guarda (solo el nombre, en `open.json`) | `src/server.mjs:130`, `:214` |
| `open.json` se borra al cerrar; si el proceso murió, el `pid` muerto lo delata | `src/server.mjs:229`, `src/bridge/server.mjs:34` |
| No hay una forma de cerrar una sala desde otra: se cierra con una señal del sistema o al reiniciarse por una actualización | `src/server.mjs:2518`, `:1908-1919` |
| Cada sala solo acepta peticiones con `Host` local, y las que cambian algo solo si vienen de su propia página (`Origin` = su puerto) o sin `Origin` (otro proceso local) | `src/request-guard.mjs` |
| El puente del teléfono ya lista las salas abiertas (leyendo `open.json`) y les habla de servidor a servidor | `src/bridge/server.mjs:37-47`, `:230-248` |
| Compartido por todas las salas en `~/.pulse`: `config.json`, `credentials/`, `modules/`, `devices.json`, `handoff.json`, `updates.json`, `whats-new.json` | `src/config.mjs`, `src/bridge/*.mjs` |
| La memoria es de cada sala: su propio `memory.sqlite` y su propio servidor MCP de memoria | `src/memory.mjs`, `src/mcp/memory-server.mjs` |

En esta Mac, `~/.pulse/rooms` tiene 17 carpetas; varias son de pruebas o temporales
(`tmp…`, `agent-…`, `pulse-npx-…`), sin proyecto real detrás.

---

## 3 · Que no se pisen: hallazgos

Cada hallazgo tiene id permanente (`S-0xx`); un id no se reusa.

| ID | Qué pasa | Dónde | Fase | Estado |
|---|---|---|---|---|
| **S-001** | `config.json` se escribe sin candado y sin escritura atómica. Dos salas que cambian ajustes a la vez: gana la última y una puede borrar el cambio de la otra | `src/config.mjs` | 1 | ARREGLADO |
| **S-002** | La ruta del proyecto no se guarda: una sala cerrada no se puede volver a abrir desde Salas | `src/server.mjs:214` | 1 | ARREGLADO |
| **S-003** | No hay cierre por HTTP: Salas no puede cerrar una sala | — | 1 | ARREGLADO |
| **S-004** | Salas de pruebas sin proyecto se mezclarían con las reales | `~/.pulse/rooms` | 1 | ARREGLADO |
| **S-005** | Una sala con una MADRE anterior no tiene las rutas nuevas: Salas debe decirlo en vez de fallar | — | 1 | ARREGLADO |
| **S-006** | Dos `madre start` a la vez pueden tomar el mismo puerto libre; hoy el segundo recibe `EADDRINUSE` y avanza. Se conserva | `bin/madre.mjs` | — | SIN CAMBIO |
| **S-007** | Los módulos escribían en `config.json` todo su bloque `modules` tal como lo tenían en memoria: un cambio de otra sala a otro módulo se perdía. Ahora cada uno escribe solo su clave | `src/modules/*.mjs` | 1 | ARREGLADO |

---

## 4 · Fase 1 · Salas en escritorio

**Dónde vive.** Cada sala sirve `/salas` en su propio puerto, con la lista de **todas** las
salas de la Mac. La página habla solo con su sala, y su sala habla con las demás de
servidor a servidor, como ya hace el puente. Así no se abre un proceso nuevo y el guardia
de cada sala no cambia.

**Qué muestra.**

- Arriba, *Seguir donde ibas*, igual que en el teléfono.
- Las salas abiertas primero, ordenadas por quién te espera, quién trabaja y la más reciente.
- Después las **dormidas**: salas cerradas cuyo proyecto sigue en disco.
- Cada tarjeta: nombre del proyecto, carpeta, estado (abierta, trabajando, te espera,
  cerrada), la última conversación, cuántas conversaciones y memorias tiene.

**Qué hace.**

| Acción | Cómo | Regla |
|---|---|---|
| Abrir | Lleva a la sala en su puerto | — |
| Iniciar una dormida | La sala que sirve Salas lanza `madre start --project <ruta> --no-open` | Sin shell (WIN-016), con `process.execPath` y la ruta de `bin/madre.mjs` por `fileURLToPath` (WIN-004/006), `windowsHide`, `detached` solo fuera de Windows; su salida a `start.log` en la carpeta de la sala |
| Cerrar | Le pide a esa sala `POST /api/room/close`: detiene sus turnos y se cierra como con una señal | Si alguien trabaja, pide confirmación. Desde el teléfono, no |
| Detener todo | Igual que en el teléfono | — |

**Puerta de entrada.** Una tecla *Salas* en la barra del escritorio (se acomoda como las
demás). Que `madre` abra Salas sin ninguna sala abierta es la decisión **D-S02**.

**Arreglos de la fase:**

- S-001: candado y renombre atómico en `config.json`.
- S-002: la sala guarda `project.json` (ruta, nombre, última apertura) junto a su registro.
- S-003: `/api/room/close`.
- S-004: sin `project.json`, una carpeta no se ofrece para iniciar.
- S-005: una sala que no conoce la ruta nueva se muestra con «Actualiza MADRE en esta sala».

---

## 5 · Fase 2 · El Macroverso (verlo)

Solo en escritorio y solo desde Salas. **Fase 2 solo muestra; no enlaza.**

- **Qué es.** Cada sala es un universo: un sol del color de MADRE con su halo de memorias
  (cuántas de cada tipo, cuántas viajan). Los proyectos dormidos, apagados. Más adelante,
  los enlaces serán corrientes de plasma entre soles.
- **Imponente sin cargar la GPU.**
  - Canvas 2D, sin WebGL ni sombreadores por píxel como el magma de NOSTROMO.
  - Cada universo se pinta una vez en un sprite y luego solo se mueve, gira y escala.
  - Nunca más de dos cuadros de alta resolución.
  - Se detiene si la pestaña no se ve.
  - Respeta *reducir movimiento*.
  - Cámara con vuelo al universo elegido y profundidad por capas (estrellas lejanas lentas,
    cercanas rápidas).
- **Lo que se lee.** Al elegir un universo: su ficha (memorias por tipo, conversaciones, quién
  trabaja, qué te espera) y *Entrar a la sala*.
- **En el teléfono.** Sin mapa: la misma información en la lista de Salas.

---

## 6 · Fases 3 y 4 · Enlazar y el super agente (diseño, sin construir)

**Un enlace es un contrato** entre dos salas, que firma el humano:

| Campo | Qué dice |
|---|---|
| Sentido | De A a B, de B a A, o ambos |
| Qué cruza | Solo memorias destiladas, de los tipos elegidos (decisión, hecho, preferencia, pregunta) y solo las que viajan (bodega y puente). **Nunca** el registro crudo, archivos, aberraciones, memorias en enfermería o esclusa, ni credenciales |
| Validaciones | El guardia de privacidad (`src/privacy.mjs`) limpia cada memoria antes de cruzar; los términos privados de cada sala se respetan en las dos |
| Lógica | La sala que recibe ve esas memorias en su recall, marcadas con el nombre de la otra sala; los agentes las citan como de ella. **Nada se escribe en la otra sala** |
| Seguridad | Solo lectura; revocable en cualquier momento; con caducidad opcional; ninguno se crea sin el humano en modo manual o híbrido |
| Monitor | Cada lectura cruzada queda registrada en las dos salas (qué cruzó, para qué turno); un panel muestra el tráfico por enlace |

**El super agente** es el agente que el humano elija (o `@madre` local, que no gasta ni saca
nada de la Mac). Trabaja en `#1 EXCHANGE` (solo lee) sobre las memorias destiladas de las
salas, nunca sobre sus archivos. Sugiere enlaces y dice los riesgos: datos privados,
contradicciones entre salas y decisiones que se filtrarían.

| Modo | Qué hace el agente | Qué hace el humano |
|---|---|---|
| Manual | Revisa riesgos del enlace que el humano trazó | Traza y firma |
| Híbrido | Propone enlaces con su contrato | Aprueba o rechaza cada uno |
| Automático | Aplica enlaces dentro de un techo que el humano fijó antes (tipos, sentido, caducidad) | Recibe aviso de cada uno y puede revocarlo |

---

## 7 · Decisiones abiertas

Ninguna se toma sin el usuario. Fase 1 no espera por ellas; las fases 3 y 4 sí.

| ID | Decisión | Recomendación | Bloquea | Estado |
|---|---|---|---|---|
| **D-S01** | ¿Qué es «RUN» en «aprovechando que ya tenemos RUN»? En el código hay tres: el módulo Runs (comandos que propone un agente), `madre start` y el dominio madre.run | Que lo diga el usuario | Dónde vive Salas a largo plazo | **ABIERTA** |
| **D-S02** | ¿`madre` sin proyecto abre Salas (un proceso ligero solo para Salas), o Salas se entra siempre desde una sala? | Fase 1 desde una sala; el proceso ligero después | Fase 1b | **ABIERTA** |
| **D-S03** | ¿Qué cruza un enlace? | Solo memorias destiladas que viajan, limpias por el guardia de privacidad | Fase 3 | **ABIERTA** |
| **D-S04** | ¿Dónde se ve lo que cruzó? ¿En el recall automático de cada turno, o solo cuando un agente lo pide con una herramienta? | Herramienta primero (se ve quién lo pidió y para qué), recall después | Fase 3 | **ABIERTA** |
| **D-S05** | Super agente: ¿cualquiera o solo `@madre` local? ¿Con qué techo? | Cualquiera, siempre en `#1 EXCHANGE`; `@madre` por defecto | Fase 4 | **ABIERTA** |
| **D-S06** | Modo automático: ¿se permite? | Sí, solo dentro de un techo firmado antes, con aviso y revocable | Fase 4 | **ABIERTA** |

---

## 8 · Fases

| Fase | Qué | Estado |
|---|---|---|
| 1 | Salas en escritorio, S-001..005 y S-007 | HECHA |
| 2 | Macroverso para ver | SIN EMPEZAR |
| 3 | Enlaces: contratos, validaciones, monitor | Espera D-S03, D-S04 |
| 4 | Super agente y sus tres modos | Espera D-S05, D-S06 |

---

## 9 · Bitácora

Una línea por cambio de estado. Se añade al final, nunca se reescribe.

- `2026-10-08` · Plan escrito. Revisión del ciclo de vida de una sala; se abren S-001..006 y
  D-S01..06. Empieza la Fase 1.
- `2026-10-08` · Fase 1 hecha: `/salas` en cada sala, tecla *Salas* en la barra del escritorio,
  abrir, cerrar (`/api/room/close`, el mismo cierre que una señal), despertar una dormida (lanza
  `bin/madre.mjs` sin shell) y detener todo. Probado de punta a punta con una sala de prueba:
  cerrar la deja dormida en unos segundos y despertarla la abre en unos 12. Arreglados S-001..005
  y S-007, encontrado al hacer S-001.
