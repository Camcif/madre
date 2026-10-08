# MADRE · SALAS EN ESCRITORIO Y MACROVERSO

Documento único de este trabajo, como `docs/MOBILE.md` y `docs/WINDOWS.md`: lo que se
decida, se construya o se descarte sobre Salas, los enlaces entre salas y el Macroverso
se anota aquí. Lo que toca procesos o rutas sigue además las reglas de `docs/WINDOWS.md`.

| | |
|---|---|
| Estado | **Fases 1 y 2 · hechas** (Salas en escritorio y el Macroverso para ver). **3 y 4 · encargadas**: D-S01..06 cerradas el 2026-10-08; el prompt de ejecución es `docs/MACROVERSO-ENCARGO.md` |
| Origen | Pedido del 2026-10-08, después de probar Salas en el teléfono; ampliado el mismo día (§1, puntos 6-8) |
| Regla en vigor | Nada aquí cambia el núcleo de una sala (registro, memoria, modos). Un enlace lee; nunca escribe en otra sala. Una orden entra a una sala solo por la puerta que esa sala ya tiene para el humano |
| Encargo | `docs/MACROVERSO-ENCARGO.md`: hechos verificados con `ruta:línea`, diseño, compuertas, pruebas y presupuestos de las fases 3 y 4. Este documento sigue siendo el único lugar de hallazgos (`S-0xx`), decisiones (`D-Sxx`) y bitácora |

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

Ampliado el 2026-10-08, después de ver las fases 1 y 2:

6. **El Macroverso se ve raro.** Cada proyecto es **un NOSTROMO** dentro del Macroverso, igual
   que en su sala, y el lienzo es el espacio sideral, infinito.
7. **El super agente es otro chat que se abre en Salas**, elegido por el humano, por defecto en
   `#1`/`#2`: un meta-guardián al que se le pregunta todo sobre los proyectos, las decisiones y
   los movimientos; crea planes, crea elementos y puede dirigir a otros agentes en `#3`/`#4`,
   siempre cuidando la lógica, la protección de cada proyecto, las acciones y su seguimiento,
   sin volver ruidosos los intercambios. Con canales, candados y puentes.
8. Si `@madre` es el super agente: revisar qué permisos puede tener y cómo destila sus
   propias memorias. El super agente **gobierna a todos desde Salas**: planes y órdenes.

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
| **S-008** | `memory_note` guarda notas sin pasar por el guardia de privacidad (`openMemory` no llama a `attachPrivacy`); una nota así podría cruzar un enlace | `src/mcp/memory-server.mjs:74-84` | 3b | ABIERTO |
| **S-009** | La llave de `#3`/`#4` se valida solo en el navegador; `POST /api/messages` acepta `#3` de un proceso local si el techo del agente lo permite. El canal de órdenes nunca manda ≥ `#3` | `src/override.mjs:3`, `src/server.mjs:2492-2524` | — | SIN CAMBIO |
| **S-010** | El techo de modo (`scopes.<agente>.maxMode`) es por agente y por Mac, no por sala. El techo por sala vive en el contrato del enlace | `src/server.mjs:515-527` | — | SIN CAMBIO |
| **S-011** | El regex de pasos de delegación ignora `@x #4:` en silencio | `src/directives.mjs:50` | — | ANOTADO |
| **S-012** | El bloque `mode` del prompt dice «Read-only…» también en `#3` y `#4` | `src/room/prompt.mjs:98` | — | ANOTADO |
| **S-013** | Purgar la privacidad reescribe solo el ledger de la conversación abierta. Falta verificar que limpia la tabla `memories`, que es lo que cruza un enlace | `src/room.mjs:660`, `src/memory.mjs:333-370` | 3b | VERIFICAR |
| **S-014** | En tema claro el Macroverso, siempre oscuro, recibe el acento claro | `public/salas-mac.js:258-264` | 3a | ABIERTO |
| **S-015** | `FOCUS_ZOOM` se usa antes de declararse; hoy no falla por el orden de las llamadas | `public/macroverso.js:211,228,447` | 3a | ABIERTO |
| **S-016** | `resize` repinta todos los sprites sin debounce | `public/macroverso.js:226-228,489-490` | 3a | ABIERTO |
| **S-017** | El NOSTROMO de la sala no tiene tope de densidad, ni pausa al ocultar la pestaña, ni medición de cuadro | `public/app.js:15343,15746-15751` | 3a | MEDIR |
| **S-018** | `docs/INTERNALS.md:83` dice que varios turnos `#2` corren a la vez; el código deja un solo escritor por proyecto | `src/room/control.mjs:12-16` | — | ANOTADO |

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

## 6 · Fases 3 y 4 · Enlazar y BISHOP (encargadas, sin construir)

El diseño completo, con cada hecho citado, está en `docs/MACROVERSO-ENCARGO.md`. Lo que no
cambia respecto a la primera versión de este plan:

**Un enlace es un contrato** entre dos salas, que firma el humano:

| Campo | Qué dice |
|---|---|
| Sentido | De A a B, de B a A, o ambos |
| Qué cruza | Solo memorias destiladas, de los tipos elegidos (decisión, hecho, preferencia, pregunta) y solo las que viajan (bodega y puente). **Nunca** el registro crudo, archivos, aberraciones, memorias en enfermería o esclusa, ni credenciales |
| Validaciones | El guardia de privacidad (`src/privacy.mjs`) limpia cada memoria **en la sala que la entrega**; los términos son de toda la Mac |
| Lógica | La sala que recibe las lee **primero con una herramienta** (`pulse-enlaces`), marcadas con el nombre de la otra sala; el recall automático es una fase aparte (3e) que se pregunta. **Nada se escribe en la otra sala** |
| Seguridad | Solo lectura; revocable al instante; con caducidad opcional; los candados viven en la sala que entrega, nunca en la que pide |
| Órdenes | El contrato fija además hasta dónde llegan las órdenes de BISHOP en esa sala: `maxMode ≤ 2` y un tope por hora. `#3`/`#4` nunca viajan por el canal: llegan como propuesta y las arma el humano en esa sala con las llaves de siempre |
| Monitor | Cada lectura cruzada queda registrada en las dos salas como contador, no como burbuja; Salas muestra el tráfico por enlace y el Macroverso lo dibuja como una vena con pulsos |

**BISHOP** (D-S07) es el super agente: una sala más —la sala de Salas, `madre salas`— cuyo
agente elige el humano (`@madre` por defecto si Ollama está listo). Responde sobre todas las
salas citando cada una, propone planes y da órdenes con un bloque `pulse-salas` al cierre de su
respuesta, con el patrón de Runs: cada orden es un botón y nada sale hasta que se pulsa, salvo
dentro del techo que un contrato firmó.

| Modo | `#0`–`#1` | `#2` | `#3`–`#4` |
|---|---|---|---|
| Manual | Espera el botón | Espera el botón | Propuesta en la sala destino |
| Híbrido | Se envía sola dentro del contrato | Espera el botón | Propuesta en la sala destino |
| Automático | Se envía sola dentro del contrato | Se envía sola dentro del contrato | Propuesta en la sala destino |

Nunca edita un proyecto: lo que mueve un proyecto lo hace el agente de esa sala, en esa sala,
bajo el guardia de esa sala. Sus memorias se destilan como las de cualquier sala; la sala de
Salas no sirve de origen en ningún contrato.

---

## 7 · Decisiones

Ninguna se toma sin el usuario. Las cerradas llevan su respuesta literal; las abiertas dicen si
el encargo puede asumir la recomendación mientras tanto.

| ID | Decisión | Respuesta / recomendación | Bloquea | Estado |
|---|---|---|---|---|
| **D-S01** | ¿Qué es «RUN» en «aprovechando que ya tenemos RUN»? | «RUN es el módulo Runs que corre comandos.» Se aprovecha su patrón: proponer → botón → correr → tarjeta | — | **CERRADA 2026-10-08** |
| **D-S02** | ¿`madre` sin proyecto abre Salas? | «Sí, abre Salas directamente.» El disparador exacto es D-S09 | — | **CERRADA 2026-10-08** |
| **D-S03** | ¿Qué cruza un enlace? | «Sí» a la recomendación: solo memorias destiladas que viajan, limpias por el guardia de privacidad | — | **CERRADA 2026-10-08** |
| **D-S04** | ¿Dónde se ve lo que cruzó? | «Sí» a la recomendación: herramienta primero; el recall automático es la fase 3e y se pregunta antes | — | **CERRADA 2026-10-08** |
| **D-S05** | Super agente: ¿quién y con qué techo? | «Lo elige el usuario, siempre en modo default 1 y 2 por gobernanza… un meta guardián… otro chat que se abre en Salas… puede dirigir a otros agentes en modo 3 y 4 cuidando la lógica, la protección del proyecto, las acciones y su seguimiento… canales, candados y puentes.» Lectura operativa en el encargo, §1 y §4C | — | **CERRADA 2026-10-08** |
| **D-S06** | Modo automático: ¿se permite? | «De esto se desprenden las demás decisiones»: sí, dentro del techo de cada contrato, con aviso y revocable; `#3`/`#4` nunca solos | — | **CERRADA 2026-10-08** |
| **D-S07** | Nombre del super agente en la interfaz | **BISHOP**, en la familia de ASH, RIPLEY, NOSTROMO y MU/TH/UR. Se puede asumir; renombrar cuesta un commit | — | **ABIERTA** |
| **D-S08** | Dónde vive el proyecto de la sala de Salas (planes y contratos como archivos) | `~/.pulse/salas/`, creada al primer `madre salas`, mostrada en Ajustes para cambiarla. Se puede asumir | 3d | **ABIERTA** |
| **D-S09** | Disparador de D-S02 | `madre salas`, y `madre` sin `--project` solo cuando el directorio actual es `$HOME`. Ninguna heurística de «¿esto es un proyecto?». Se puede asumir | 3d | **ABIERTA** |
| **D-S10** | Cómo queda en el registro una orden de BISHOP | `via: 'bishop'` en el mensaje y, si queda como `role: 'you'`, excluido del dataset. Técnica, del orquestador, dentro de las excepciones del encargo §6 | 4b | **ABIERTA** |

---

## 8 · Fases

| Fase | Qué | Estado |
|---|---|---|
| 1 | Salas en escritorio, S-001..005 y S-007 | HECHA |
| 2 | Macroverso para ver | HECHA |
| 3a | El Macroverso como flota de NOSTROMOs: pintores compartidos, escena viva, espacio infinito; S-014..S-017 | ENCARGADA |
| 3b | S-008; contratos, candados en la sala que entrega, llave del canal, contadores | ENCARGADA |
| 3c | Herramienta `pulse-enlaces`, monitor en Salas, firma desde Salas y el Macroverso, venas | ENCARGADA |
| 3d | `madre salas`, la sala de Salas, tecla MACROVERSO (D-S08, D-S09) | ENCARGADA |
| 4a | Módulo `bishop`, bloque `bishop`, censo, elección del agente | ENCARGADA |
| 4b | Bloque `pulse-salas`, tarjeta, canal, `via`, resultado como tarjeta (D-S10) | ENCARGADA |
| 4c | Modos híbrido y automático, topes, propuestas `#3`/`#4`, aprendizaje | ENCARGADA |
| 3e | Recall automático de notas enlazadas | Se pregunta antes de empezar |

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
- `2026-10-08` · Fase 2 hecha: el Macroverso (`public/macroverso.js`), entrado desde Salas con
  pantalla de 900 px o más. Cada sala es un sol con la galaxia de sus memorias en sus proporciones
  reales, las abiertas en la órbita de adentro y las dormidas en la de afuera; quién trabaja
  respira, quién te espera lleva un anillo en tu acento; clic o ← → vuela a un universo y abre su
  ficha. Medido en Chrome a 1440×900 y densidad 2: dibujar un cuadro cuesta 0.4 ms de mediana y
  1 ms en el percentil 95. En el teléfono, cada sala de Salas lleva la misma franja de memorias.
- `2026-10-08` · D-S01..06 cerradas por el humano; el pedido se amplía (§1, 6-8): cada proyecto es
  un NOSTROMO en el Macroverso y el super agente es un chat en Salas que gobierna a todos. Segunda
  lectura del código (modos, Runs, delegación, mensajes, memoria, `@madre`, proceso; y el motor de
  dibujo de NOSTROMO): salen S-008..S-018 y D-S07..D-S10. Se escribe `docs/MACROVERSO-ENCARGO.md`,
  el prompt de ejecución de las fases 3 y 4 con cada hecho citado, compuertas, pruebas y
  presupuestos. Nada construido todavía.
