# MADRE · EN EL TELÉFONO

Documento único del trabajo para usar MADRE desde el teléfono. Ids `MOV-xxx` para el trabajo,
`D-Mxx` para las decisiones. Nada aquí está construido todavía; el estado de cada id vive en la
tabla de la sección 6.

---

## 1 · La idea, en una frase

**Tus salas siguen en tu Mac; el teléfono es otra ventana a ellas.** Los agentes, el proyecto y la
memoria no se mudan: lo que viaja es la conversación, y viaja cifrada. Desde el teléfono hablas
con todas tus salas a la vez, en casa o fuera, y pasas de la computadora al teléfono y de vuelta
sin perder el hilo, como Handoff en los equipos de Apple.

Qué no es:

- **No es MADRE en la nube.** Ningún servidor nuestro corre agentes, guarda proyectos ni lee
  conversaciones.
- **No es una app nativa.** Es la misma interfaz, instalable en la pantalla de inicio (PWA).
  Una app de tienda queda fuera de este plan.
- **No es un control remoto sin límites.** Desde el teléfono se pregunta, se lee, se aprueba lo
  que no toca el proyecto y se frena todo. Lo que modifica el proyecto se queda en la computadora
  salvo que la persona lo abra (sección 4).

## 2 · La experiencia (lo que la persona vive)

El listón: **dos pasos para empezar, cero comandos, nada que configurar después.**

### 2.1 · Emparejar: dos pasos

1. En MADRE, una tecla nueva en la barra, **Teléfono**, abre una tarjeta con un QR y una sola
   frase: «Escanéalo con la cámara de tu teléfono».
2. La persona apunta la cámara. Se abre MADRE en el teléfono, ya dentro: «Listo. Tu Mac está en tu
   teléfono». Una segunda pantalla le enseña, con un dibujo del propio sistema, cómo añadirla a la
   pantalla de inicio (en iOS es lo que habilita los avisos).

No hay cuenta, ni correo, ni contraseña, ni código que teclear. El QR vale una sola vez y caduca en
diez minutos. La tecla Teléfono también entra en «Primeros pasos» como un paso opcional.

### 2.2 · Todas las salas, en una pantalla

El teléfono abre en **Salas**: una lista como la de Mensajes, una fila por proyecto abierto en la
Mac, con lo último que se dijo, quién está trabajando ahora y una marca cuando un agente espera
algo de ti (un permiso, una elección, una pregunta). Tocar una fila abre esa sala; volver regresa a
la lista sin perder lo que pasa en las demás. El botón **STOPALL** está siempre a la mano: frenar
todo desde cualquier lugar es la función de seguridad más valiosa del teléfono.

### 2.3 · Continuidad (el Handoff de MADRE)

- **De la Mac al teléfono.** Al abrir MADRE en el teléfono, arriba aparece «Seguir donde ibas ·
  Gumball · prueba de multitarea»: la misma sala, la misma conversación, a la altura donde estabas
  leyendo y con el borrador que dejaste en la caja.
- **Del teléfono a la Mac.** Cuando vuelves a la computadora, una píldora en la barra (donde vive
  la de versión nueva) dice «Continuar desde el iPhone · borrador en Gumball». Un clic y estás ahí.
- **Presencia.** La barra de la Mac muestra un teléfono pequeño cuando hay uno conectado. El
  teléfono dice si la Mac está despierta («Tu Mac está dormida: te avisamos cuando vuelva»).
- **Quién lo dijo.** Lo que se escribe desde el teléfono queda en el registro de la sala con su
  origen: «Tú · desde iPhone».

### 2.4 · Avisos (fase 2)

Solo lo que pide tu atención, agrupado por sala: un agente terminó, un agente pide permiso o una
elección, MU/TH/UR detectó un problema. Nada de un aviso por cada línea de la sala.

## 3 · Arquitectura

### 3.1 · Lo que ya hay en MADRE y se respeta

| Pieza | Dónde | Qué implica |
|---|---|---|
| Una sala por proyecto, un proceso y un puerto cada una | `src/server.mjs:192-206` | Cada sala abierta deja `~/.pulse/rooms/<proyecto>/open.json` con `{pid, port, at}`: el registro de salas ya existe. |
| La sala solo escucha en `127.0.0.1` | `src/server.mjs:2344` | No se cambia. Ninguna sala se expone nunca. |
| Guarda de peticiones: Host local y Origin propio | `src/request-guard.mjs` | No se relaja. El puente habla con la sala como `127.0.0.1`. |
| Flujo en vivo por SSE | `/api/events`, `public/app.js:9061` | El puente lo reenvía tal cual (fase 1) o lo convierte en tramas (fase 2). |
| Interfaz para teléfono | `public/styles.css` (`max-width: 720px`), barra con «Más» | Base de la vista móvil; falta la pantalla Salas y la continuidad. |
| Registro de salidas | `src/outbound.mjs` | El relevo de la fase 2 se declara como un destino más, visible en Privacidad. |
| Sin dependencias, Node ≥ 22.5 | `package.json` | Node trae `WebSocket` (cliente) y `node:crypto`: alcanza para el puente y el cifrado sin paquetes. |

### 3.2 · El puente (MOV-001)

Un proceso nuevo y único por Mac, **el puente**, es lo único que el teléfono alcanza:

```
teléfono ──(fase 1: Wi-Fi · fase 2: relevo cifrado)──▶ PUENTE ──▶ 127.0.0.1:<puerto de cada sala>
```

- **Nace solo.** Lo lanza la primera sala que arranca si hay un teléfono emparejado, o la tecla
  Teléfono al emparejar el primero. Un archivo de marca (`~/.pulse/bridge.json`) evita que haya
  dos. Se apaga solo unos minutos después de que se cierra la última sala. La persona nunca lo
  arranca ni lo ve como proceso.
- **Conoce las salas** leyendo los `open.json`, comprobando que su proceso vive y preguntando a
  cada una `/api/version`. Una sala de una versión que no habla con el puente aparece en la lista
  con «Actualiza esta sala para usarla desde el teléfono».
- **Reenvía** `/r/<sala>/…` a `http://127.0.0.1:<puerto>/…` reescribiendo `Host` y `Origin` a los
  de la sala, de modo que la guarda de la sala no cambia. Añade `x-madre-device: <id>` para que
  el registro diga desde dónde se habló.
- **Sirve la interfaz** desde su propio paquete, con un pequeño cargador que antepone `/r/<sala>`
  a cada `fetch` y `EventSource` de la página. La página de la sala no necesita saber que está
  detrás de un puente.
- **Aplica la política del teléfono** (sección 4) con una lista de rutas **permitidas**, no
  prohibidas: lo que no está en la lista no pasa.
- **Límites:** un tope de peticiones por dispositivo, cabeceras de seguridad (CSP, `nosniff`,
  `no-referrer`), cookie `HttpOnly` + `SameSite=Strict`, y acciones solo con
  `Sec-Fetch-Site: same-origin`. Patrones tomados de Apex OS (sección 7).

### 3.3 · Dispositivos y llaves (MOV-002)

Portado de Apex OS (`apps/api/src/devices.ts`, `session.ts`) a `node:crypto`, con un archivo local
en lugar de Postgres:

- **Invitación:** 32 bytes al azar, un solo uso, 10 minutos. Viaja solo dentro del QR.
- **Dispositivo:** al canjearla nace una sesión de 30 días que se renueva con el uso. En disco solo
  se guarda su HMAC-SHA256: `~/.pulse/devices.json`, con `{id, nombre, creado, visto, hmac}`.
- **La llave del HMAC** (y en la fase 2 la identidad de la Mac) vive en
  `~/.pulse/credentials/bridge.key`, solo para el dueño. Nunca en `config.json`, en el registro ni
  en un log. **Ver D-M01:** contradice hoy la regla «MADRE no guarda credenciales propias».
- **En Ajustes › Privacidad**, la lista de teléfonos emparejados, con «Olvidar este teléfono» en
  cada uno. Olvidar revoca al instante, y la Mac avisa al teléfono si está conectado.

### 3.4 · Fase 1 · En tu Wi-Fi

El puente escucha además en la red local, en un puerto fijo, y se anuncia por su nombre Bonjour
(`<tu-mac>.local`), para que la dirección no cambie cuando el router reparte otra IP. El QR lleva
`http://<tu-mac>.local:<puerto>/emparejar#<invitación>`.

**Límites honestos de esta fase** (ver D-M02):

- **Es `http`, no `https`.** En una red ajena, alguien en el mismo Wi-Fi podría leer el tráfico.
- Sin `https`, el navegador del teléfono no concede un contexto seguro: no hay service worker
  (no se instala como app de verdad, no hay avisos) ni `crypto.subtle` (la frase de #3/#4 no se
  puede comprobar en el teléfono).
- La primera vez, macOS pregunta si permite conexiones entrantes a `node`. La tarjeta Teléfono lo
  anticipa con una frase.
- No funciona fuera de esa red.

Por eso la fase 1 se ofrece **solo en redes que la persona marca como de confianza** («Esta es mi
red de casa») y se presenta como **avance**: sirve para construir y validar todo lo que la fase 2
reutiliza (puente, emparejamiento, política, Salas, continuidad) con la persona real, antes de que
exista el relevo.

### 3.5 · Fase 2 · En cualquier lugar, cifrado de extremo a extremo

```
teléfono (app.madre.run, https, PWA) ──WebSocket──▶ relay.madre.run (Cloudflare Worker + Durable Object)
                                                        ▲
                                     PUENTE en la Mac ──┘ (conexión de salida; no se abre ningún puerto)
```

- **Un solo camino, en casa y fuera.** El teléfono siempre entra por `app.madre.run`, que es
  `https`: es instalable, tiene service worker y recibe avisos. La persona no elige entre «local»
  y «remoto»; simplemente funciona.
- **Buzón por Mac.** Un Durable Object por Mac empareja la conexión de salida del puente con la del
  teléfono. El id del buzón es opaco e imposible de adivinar.
- **Cifrado de extremo a extremo.** El QR lleva, en el fragmento de la URL (que nunca llega a un
  servidor), un secreto compartido. Mac y teléfono derivan llaves de sesión (X25519 efímero + HKDF,
  AES-GCM), con `node:crypto` de un lado y WebCrypto del otro. El relevo solo ve tramas cifradas,
  tamaños y horas. Ni nosotros podemos leer una conversación.
- **Avisos cifrados.** El puente cifra el contenido del aviso con las llaves de la suscripción del
  teléfono (RFC 8291) y el relevo solo firma con VAPID y entrega bytes opacos.
- **La interfaz** de `app.madre.run` es la misma de la sala, servida como estática. Las llamadas
  de la página se vuelven RPC cifrado sobre el WebSocket, y el flujo SSE se vuelve tramas.
- **Privacidad visible.** El relevo aparece en Ajustes › Privacidad como destino de salida, con la
  frase «cifrado de extremo a extremo; el relevo no puede leerlo». Emparejar un teléfono es el
  acto explícito que lo enciende; sin teléfonos emparejados, nada sale.
- **Operación.** El Worker y el Durable Object viven junto al sitio de `madre.run` (ya en
  Cloudflare). Tope de tramas por buzón y buzones que caducan sin uso.

## 4 · Qué se puede hacer desde el teléfono

Propuesta para D-M03:

| Acción | Teléfono |
|---|---|
| Leer salas y conversaciones, buscar, abrir archivos en el visor | Sí |
| Escribir en #0 GHOST, #1 EXCHANGE y #2 CREATE | Sí |
| Responder elecciones y aprobar comandos que un agente pide en #2 | Sí |
| **STOPALL** y detener un turno | Sí, siempre |
| #3 CONTROL | No por defecto. Se habilita en Ajustes › Permisos con «Permitir desde el teléfono», y pide la frase. |
| #4 AIRLOCK | Nunca desde el teléfono en esta versión |
| Instalar o quitar módulos, cambiar llaves de proveedor, ajustes de sala | No: «Esto se hace en la Mac» |
| Emparejar otro teléfono | No: solo desde la Mac |

## 5 · Fases y entregas

**Fase 1 · En tu Wi-Fi (avance).**

- MOV-001 Puente.
- MOV-002 Dispositivos y llaves.
- MOV-003 Política del teléfono.
- MOV-004 Pantalla Salas.
- MOV-005 Continuidad: borrador, conversación y posición; píldora «Continuar desde…».
- MOV-006 Tecla Teléfono y emparejamiento en dos pasos.
- MOV-007 Teléfonos en Ajustes › Privacidad.
- MOV-008 Origen «desde iPhone» en el registro.
- MOV-009 Pruebas, incluido un recorrido de punta a punta con un navegador en tamaño teléfono.

D-M01, D-M02 y D-M03 resueltas el 2026-10-07.

**Fase 2 · En cualquier lugar.**

- MOV-010 Relevo: Worker y Durable Object.
- MOV-011 Protocolo cifrado de extremo a extremo y RPC.
- MOV-012 `app.madre.run` como PWA (manifiesto, íconos PNG de 192 y 512 px y `apple-touch-icon`, service worker).
- MOV-013 Avisos cifrados.
- MOV-014 Presencia, y Mac dormida o despierta.
- MOV-015 El relevo en Privacidad y en el registro de salidas.

Requiere D-M04 y D-M05.

La versión de cada fase se decide al cerrarla (D-M06). El puerto a Windows apunta a `1.1.0`
(`docs/WINDOWS.md`, D-003).

## 6 · Trazabilidad

| Id | Qué | Dónde | Fase | Estado |
|---|---|---|---|---|
| MOV-001 | Puente: proceso único, registro de salas, reenvío con `Host`/`Origin` reescritos, interfaz servida con cargador | `src/bridge/` (nuevo) | 1 | ABIERTO |
| MOV-002 | Invitaciones, sesiones por dispositivo, HMAC en `~/.pulse/devices.json`, llave en `~/.pulse/credentials/` | `src/bridge/devices.mjs` (nuevo) | 1 | ABIERTO |
| MOV-003 | Lista de rutas permitidas y política por modo (sección 4), tope de peticiones, cabeceras | `src/bridge/policy.mjs` (nuevo) | 1 | ABIERTO |
| MOV-004 | Pantalla Salas: estado por sala, marca de «te espera», STOPALL global | `public/` | 1 | ABIERTO |
| MOV-005 | Continuidad en ambos sentidos | `public/app.js`, puente | 1 | ABIERTO |
| MOV-006 | Tecla Teléfono, QR, pantalla «Listo» y guía de «Añadir a inicio» | `public/` | 1 | ABIERTO |
| MOV-007 | Teléfonos emparejados y «Olvidar» | Ajustes › Privacidad | 1 | ABIERTO |
| MOV-008 | `x-madre-device` → «desde iPhone» en el registro | `src/room.mjs` | 1 | ABIERTO |
| MOV-009 | Pruebas de puente, política, emparejamiento y continuidad | `test/` | 1 | ABIERTO |
| MOV-010 | Relevo en Cloudflare | sitio de `madre.run` | 2 | ABIERTO |
| MOV-011 | Cifrado de extremo a extremo y RPC sobre WebSocket | puente + `app.madre.run` | 2 | ABIERTO |
| MOV-012 | PWA instalable | `app.madre.run` | 2 | ABIERTO |
| MOV-013 | Avisos cifrados (RFC 8291 + VAPID) | puente + relevo | 2 | ABIERTO |
| MOV-014 | Presencia, Mac dormida o despierta | puente + interfaz | 2 | ABIERTO |
| MOV-015 | El relevo como destino declarado en Privacidad | `src/outbound.mjs` | 2 | ABIERTO |

## 7 · Qué se toma de Apex OS

Revisión del 2026-10-07 de `~/Developer/apex-os`. Apex no tiene túnel, relevo, SSE ni avisos, y
es de un solo dueño. **No se usan sus servidores ni su base de datos para MADRE.** Se toman
patrones, reescritos sin dependencias:

| Patrón | En Apex | Para |
|---|---|---|
| Invitación por QR de un solo uso y sesión de dispositivo con HMAC | `apps/api/src/devices.ts`, `session.ts`, `server.ts:277-345` | MOV-002 |
| Lista blanca de rutas, `Sec-Fetch-Site`, orígenes explícitos | `apps/api/src/server.ts:110-152`, `:555` | MOV-003 |
| Cascarón PWA | `apps/web/public/manifest.webmanifest`, `sw.js` | MOV-012 (y le falta lo de iOS) |
| OAuth 2.1 + MCP por HTTP | `apps/api/src/oauth*.ts`, `mcp.ts` | Futuro: la sala como conector de Claude en el teléfono |

## 8 · Decisiones abiertas

| Id | Pregunta | Bloquea | Estado |
|---|---|---|---|
| **D-M01** | La regla decía que MADRE no guarda credenciales propias (`src/credentials.mjs:3-6`). Emparejar exige al menos una llave propia. Se enmienda: MADRE no guarda credenciales de proveedores; la llave de sus teléfonos vive solo en `~/.pulse/credentials/`, solo para el dueño, y de cada teléfono se guarda la huella, nunca el token (`AGENTS.md`). En Windows `0o600` no protege nada (WIN-014): la función no se ofrece allí hasta que ese id se cierre. | Fase 1 | **RESUELTA · 2026-10-07** |
| **D-M02** | La fase 1 sale como avance, limitada a las redes que la persona marca como de confianza. | Fase 1 | **RESUELTA · 2026-10-07** |
| **D-M03** | La política de la sección 4, tal cual. #3 desde el teléfono pide la frase, que se comprueba con `crypto.subtle`; en la fase 1 (`http`) el navegador no lo ofrece, así que #3 desde el teléfono llega con la fase 2. | Fase 1 | **RESUELTA · 2026-10-07** |
| **D-M04** | Costos y límites del relevo: plan de Cloudflare, tope por buzón, caducidad. | Fase 2 | **ABIERTA** |
| **D-M05** | ¿`app.madre.run` como subdominio del sitio actual, o proyecto aparte en Cloudflare? | Fase 2 | **ABIERTA** |
| **D-M06** | Número de versión de cada fase. | Cierre de cada fase | **ABIERTA** |
| **D-M07** | ¿Mantener la Mac despierta mientras un agente trabaja y hay un teléfono conectado? Lanza un proceso del sistema; revisar `docs/WINDOWS.md` antes. | Fase 2 | **ABIERTA** |

## 9 · Bitácora

- `2026-10-07` · Plan escrito. Revisión de Apex OS para reutilizar patrones. Fases 1 y 2 sin
  empezar.
- `2026-10-07` · D-M01, D-M02 y D-M03 resueltas. Empieza la fase 1.
