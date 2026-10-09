// MADRE en español.
//
// La clave es la frase en inglés tal como está escrita en el código; el valor es lo que dice
// MADRE. No es una traducción literal: es la misma voz en español neutro. Lo que no se traduce
// nunca —los nombres propios de la nave (MU/TH/UR, NOSTROMO, CODE000), los nombres de los modos
// (GHOST, EXCHANGE, CREATE, CONTROL, AIRLOCK), los comandos, las rutas y los identificadores—
// se queda como está, aquí y en la boca de la tripulación.
//
// Una frase que todavía no está aquí sale en inglés, entera. Eso es a propósito.

export const ES = {
  // El compositor: lo primero que una persona lee de MADRE.
  'Type here, human. Ask the room…': 'Escribe aquí, humano. Pregúntale a la sala…',
  'CREATE on: what to make. New files land where they belong in the project; nothing existing changes.':
    'CREATE encendido: di qué crear. Los archivos nuevos caen donde les toca en el proyecto; nada de lo que ya existe se toca.',
  'Compact prose. Nothing you write is altered; only the answers get shorter.':
    'Respuestas compactas. Lo que tú escribes no cambia; lo que se acorta son las respuestas.',
  'In this room: {on} output tokens is the middle turn with ASH ({onTurns} turns), {off} without it ({offTurns}). You choose when to ask for compact prose, so these are different tasks, not the same task twice.':
    'En esta sala: {on} tokens de salida es el turno de en medio con ASH ({onTurns} turnos), {off} sin ASH ({offTurns}). Tú decides cuándo pedir prosa compacta, así que son tareas distintas, no la misma tarea dos veces.',
  '{n} uncharged': '{n} no cobrados',
  '{cached} tokens this CLI read back from its own cache instead of charging them again (measured). {unsent} tokens of briefing the room never sent (estimated at {rate} characters per token). Neither is Ash: Ash shortens the answer, and that is the figure above the bubble.':
    '{cached} tokens que este CLI leyó de su propia caché en vez de volver a cobrarlos (medido). {unsent} tokens de briefing que la sala nunca envió (estimado a {rate} caracteres por token). Ninguno de los dos es Ash: Ash acorta la respuesta, y esa cifra está arriba de la burbuja.',
  'TOKENS SAVED': 'TOKENS AHORRADOS',
  'input the CLI did not charge again · {pct} of the input': 'entrada que el CLI no volvió a cobrar · {pct} de la entrada',
  'SPENT IN': 'GASTADO EN ENTRADA',
  'input tokens actually charged': 'tokens de entrada realmente cobrados',
  '@madre can answer this from the room archive, on this computer, for no tokens · it read {why}':
    '@madre puede contestar esto desde el archivo de la sala, en esta computadora, sin gastar tokens · leyó {why}',
  // INTENCIONES, bajo la caja: qué parece el mensaje y por qué conviene otro nivel.
  'Looks like {what}': 'Parece {what}',
  'a short reply': 'una respuesta corta',
  'a lookup': 'una búsqueda',
  'an explanation': 'una explicación',
  'a review': 'una revisión',
  'a change to make': 'un cambio por hacer',
  'a diagnosis': 'un diagnóstico',
  'a design question': 'una pregunta de diseño',
  'below {level} it fell short in {n} measured cases': 'por debajo de {level} se quedó corto en {n} casos medidos',
  '{level} was enough in {n} measured cases': '{level} bastó en {n} casos medidos',
  'about {pct}% fewer tokens': 'cerca de {pct}% menos tokens',
  'the last answer did not do it': 'la respuesta anterior no lo resolvió',
  'there is a lot to read': 'hay mucho que leer',
  'you asked for it to be thought through': 'pediste que lo pensara a fondo',
  '{level} is usually too light for it': '{level} suele quedarse corto para esto',
  'MEASURED': 'MEDIDO',
  '{level} was enough in {n} of your turns': '{level} alcanzó en {n} de tus turnos',
  'From your use': 'De tu uso',
  // Probar un nivel más bajo en un solo mensaje.
  '{level} might be enough · try it on this one and Intenciones will notice': 'podría bastar {level} · pruébalo en esta y Intenciones lo nota',
  'Trial': 'Prueba',
  'Try {level} on this one': 'Probar {level} en esta',
  'This one goes at {level} · if it falls short, Intenciones will notice and go back to {from}': 'Esta va con {level} · si no alcanza, lo notará y volverá a {from}',
  'This one goes at {level} · if it falls short, Intenciones will notice and go back to the CLI default': 'Esta va con {level} · si no alcanza, lo notará y volverá al nivel del CLI',
  'Undo': 'Deshacer',
  '{level} fell short last time': '{level} no alcanzó la última vez',
  'Back to {level}': 'Volver a {level}',
  'Back to the CLI default': 'Volver al nivel del CLI',
  'USE {level}': 'USAR {level}',
  'RAISE TO {level}': 'SUBIR A {level}',
  '{level} is usually enough for it, but it has not been measured in this project yet': '{level} suele bastar para esto, pero aún no lo medí en este proyecto',
  'MEASURE · {n} QUESTIONS': 'MEDIR · {n} PREGUNTAS',
  'ASK @madre': 'PREGÚNTALE A @madre',
  'what was decided': 'qué se decidió',
  'whether this came up before': 'si esto ya había salido',
  'where the room left off': 'dónde se quedó la sala',
  'why something was chosen': 'por qué se eligió algo',
  'what somebody said': 'qué dijo alguien',
  'what is still open': 'qué sigue abierto',
  'TURNS THE ROOM ANSWERED ITSELF': 'TURNOS QUE LA SALA CONTESTÓ SOLA',
  'FREE TURNS': 'TURNOS SIN COSTO',
  'answered by @madre on this computer · no provider, no bill':
    'contestados por @madre en esta computadora · sin proveedor, sin factura',
  'OF EVERY TURN': 'DEL TOTAL',
  'of the turns weighed in this room': 'de los turnos pesados en esta sala',
  'A PAID TURN': 'UN TURNO PAGADO',
  'the middle paid turn here · what the others cost, not what these would have':
    'el turno pagado de en medio · lo que costaron los otros, no lo que habrían costado estos',
  'These turns have no bill because nothing left this computer to answer them. MADRE does not say what they would have cost somewhere else: nobody measured that.':
    'Estos turnos no tienen factura porque nada salió de esta computadora para contestarlos. MADRE no dice cuánto habrían costado en otro lado: eso nadie lo midió.',
  '{pct} shorter with ASH, wider than this agent varies here (±{on} and ±{off})':
    '{pct} más corta con ASH, más que lo que este agente varía aquí (±{on} y ±{off})',
  'the difference fits inside how much this agent varies anyway (±{on} and ±{off}) · nothing to read yet':
    'la diferencia cabe dentro de lo que este agente varía de todos modos (±{on} y ±{off}) · todavía no hay nada que leer',
  'on · agents may ask you to choose': 'encendido · los agentes pueden pedirte que elijas',
  'off · agents answer in prose': 'apagado · los agentes contestan en prosa',
  'Lets an agent hand a decision back to you as buttons instead of a paragraph, when the answer turns on three or more real options. Costs about 135 tokens of instruction per turn while it is on, counted in the economy like every other block.':
    'Deja que un agente te devuelva una decisión como botones en vez de un párrafo, cuando la respuesta depende de tres o más opciones reales. Cuesta unos 135 tokens de instrucción por turno mientras está encendido, contados en la economía como cualquier otro bloque.',
  'Pressing one sends it to @{agent} · #3 and #4 ask for your keys first': 'Al presionar una se le manda a @{agent} · #3 y #4 piden antes tus llaves',
  '◉ decided here · {n}': '◉ decidido aquí · {n}',
  'TURNS WEIGHED': 'TURNOS CON FACTURA',
  '{n} characters': '{n} caracteres',
  ' · ALWAYS': ' · SIEMPRE',
  'Characters each block adds to one prompt.': 'CARACTERES QUE CADA BLOQUE AÑADE A UN PROMPT',
  'tokens read back from a cache at a fraction of their price, or never sent at all': 'tokens leídos de una caché a una fracción de su precio, o que nunca se enviaron',
  'every turn this room has been billed for': 'cada turno por el que cobraron a esta sala',
  'INPUT CHARGED': 'ENTRADA COBRADA',
  'fresh reading, plus what was written into a cache (billed too) · the cache read back is apart': 'lectura nueva, más lo que se escribió en una caché (también se cobra) · lo leído de la caché va aparte',
  'OUTPUT CHARGED': 'SALIDA COBRADA',
  'tokens written back · the dearer half': 'tokens escritos de vuelta · la mitad más cara',
  'read back from a cache (a fraction of the price, or of the plan) plus what was never sent': 'leído de una caché (una fracción del precio, o del plan) más lo que nunca se envió',
  'CAME FROM CACHE': 'LEÍDO DE CACHÉ',
  'of everything read, the share nobody charged twice': 'de todo lo leído, la parte que nadie cobró dos veces',
  'CHARACTERS PER TOKEN': 'CARACTERES POR TOKEN',
  'what MADRE wrote against what the CLIs were charged for reading · not a tokenizer':
    'lo que MADRE escribió contra lo que a los CLIs les cobraron por leer · no es un tokenizador',
  'AGENT': 'AGENTE',
  'INPUT': 'ENTRADA',
  'OUTPUT': 'SALIDA',
  'CACHE': 'CACHÉ',
  'CACHED %': '% CACHEADO',
  'CHARS / TOKEN': 'CARACT. / TOKEN',
  '◉ still open here': '◉ sigue abierto aquí',
  'The room has carried this into {n} turn(s) and still has no answer.':
    'La sala ha arrastrado esto a {n} turno(s) y sigue sin respuesta.',
  'The archivist recorded this as open and nothing has answered it.':
    'El archivista lo registró como abierto y nada lo ha contestado.',
  ' asks for #{n} {label} to go on': ' pide #{n} {label} para seguir',
  'You will type the project designation, as always. Then @{agent} gets your permission and continues.':
    'Vas a escribir la designación del proyecto, como siempre. Después @{agent} recibe tu permiso y sigue.',
  '@{agent} gets your permission for one message and continues.': '@{agent} recibe tu permiso para un mensaje y sigue.',
  'GRANT #{n} · LET IT GO ON': 'CONCEDER #{n} · QUE SIGA',
  'GRANT #{n} · GIVE IT ANOTHER INSTRUCTION': 'CONCEDER #{n} · DARLE OTRA INSTRUCCIÓN',
  'Arms #{n} in the box below, so you can add instructions before sending.':
    'Arma #{n} en la caja de abajo, para que agregues instrucciones antes de mandar.',
  '#{n} {label} granted · @{agent} continues': '#{n} {label} concedido · @{agent} sigue',
  '#{n} {label} granted': '#{n} {label} concedido',
  'Permission granted: #{n} {label}. Go ahead with what you proposed.': 'Permiso concedido: #{n} {label}. Sigue con lo que propusiste.',
  'SERVERS': 'SERVIDORES',
  'MADRE version': 'Versión de MADRE',
  'COULD NOT READ THE PORTS': 'NO SE PUDIERON LEER LOS PUERTOS',
  '{what} · refuses to be framed': '{what} · se niega a ser enmarcado',
  'Resize the browser': 'Cambiar el ancho del navegador',
  'Crew': 'Tripulación',
  'Crew · {ready} of {total} ready · {who}': 'Tripulación · {ready} de {total} lista · {who}',
  'The destination is outside this project.': 'El destino está fuera de este proyecto.',
  'There is already something at {path}.': 'Ya hay algo en {path}.',
  'Search files': 'Buscar archivos',
  'Search files…': 'Buscar archivos…',
  'Copy': 'Copiar',
  'Move': 'Mover',
  'Paste here': 'Pegar aquí',
  'Paste beside it': 'Pegar al lado',
  'Paste in the project root': 'Pegar en la raíz del proyecto',
  'REPLACE FOR EVERY ROOM': 'REEMPLAZAR PARA TODAS LAS SALAS',
  'REPLACE FOR THIS PROJECT': 'REEMPLAZAR PARA ESTE PROYECTO',
  '{name} {version} is already installed for {where}; it keeps running until this file replaces it.':
    '{name} {version} ya está instalado para {where}; sigue funcionando hasta que este archivo lo reemplace.',
  'Right-click a folder, or an empty spot for the project root, to paste it there.':
    'Clic derecho en una carpeta para pegarlo ahí, o en un espacio vacío para la raíz del proyecto.',
  'in {path}': 'en {path}',
  'the project root': 'la raíz del proyecto',
  'copy': 'copia',
  'That could not be done: {error}': 'Eso no se pudo hacer: {error}',
  'A name is needed.': 'Hace falta un nombre.',
  'That is not a name.': 'Eso no es un nombre.',
  'Both a source and a destination are needed.': 'Hacen falta un origen y un destino.',
  'The source and the destination are the same path.': 'El origen y el destino son la misma ruta.',
  'A folder cannot be moved inside itself.': 'Una carpeta no se puede mover dentro de sí misma.',
  'Rename': 'Renombrar',
  'HOLD': 'BODEGA',
  'BRIDGE': 'PUENTE',
  'MED BAY': 'ENFERMERÍA',
  'JETTISONED': 'ESCLUSA',
  'ZONE': 'ZONA',
  'OUT OF CIRCULATION': 'FUERA DE CIRCULACIÓN',
  'No module by that name is loaded.': 'No hay ningún módulo cargado con ese nombre.',
  'Gemini tried to hand this turn to one of its own subagents. MADRE does not allow that: a subagent answers outside the lease, so nothing it wrote would be checked, shown or undoable.':
    'Gemini intentó pasarle este turno a uno de sus propios subagentes. MADRE no lo permite: un subagente contesta fuera del arriendo, así que nada de lo que escribiera quedaría comprobado, mostrado ni reversible.',
  'Ask again saying it should do the work itself, without subagents.':
    'Vuelve a pedirlo diciéndole que haga el trabajo él mismo, sin subagentes.',
  ' · this reply names {n} file(s) that are not on disk: {files}':
    ' · esta respuesta nombra {n} archivo(s) que no están en disco: {files}',
  ' · nothing was written this turn': ' · en este turno no se escribió nada',
  'OPEN MODULES': 'ABRIR MÓDULOS',
  '{command} · listens on the whole network': '{command} · escucha en toda la red',
  '@{who} puts {agents} to work': '@{who} pone a trabajar a {agents}',
  '@{who} puts {agents} to work, then closes': '@{who} pone a trabajar a {agents} y luego cierra',
  '{n} step': '{n} paso',
  '{n} steps': '{n} pasos',
  '@{who} finished · {steps}': '@{who} terminó · {steps}',
  '@{who} stopped after {steps} · {why}': '@{who} se detuvo tras {steps} · {why}',
  'Enter sends · ⌥ Enter (Alt on Linux) breaks the line':
    'Enter manda · ⌥ Enter (Alt en Linux) salta de línea',
  'Stop this answer · the room and the other agents keep going':
    'Detener esta respuesta · la sala y los demás agentes siguen',
  'That turn is not running any more.': 'Ese turno ya no está corriendo.',
  'stopped by the human': 'detenido por el humano',
  'This is how I want it done · the room keeps it as a preference':
    'Así lo quiero · la sala lo conserva como preferencia',
  'Never do this again · what the room remembers from it is put out':
    'Nunca más · lo que la sala recuerde de esto queda fuera de circulación',
  'A faded star is in MED BAY or JETTISONED: the archive keeps it and never hands it to a turn.':
    'Una estrella apagada está en ENFERMERÍA o en ESCLUSA: el archivo la conserva y nunca la entrega a un turno.',
  'Distilled and nobody has judged it. It travels into turns.':
    'Destilada y nadie la ha juzgado. Viaja a los turnos.',
  'You marked the reply it came from as good. It travels, confirmed.':
    'Marcaste como buena la respuesta de la que salió. Viaja, confirmada.',
  'Quarantined: it is false, or it came from a reply you marked bad. It never travels.':
    'En cuarentena: es falsa, o salió de una respuesta que marcaste mal. No viaja nunca.',
  'Put out of circulation and kept so it is not learned again. It never travels.':
    'Fuera de circulación, conservada para no volver a aprenderla. No viaja nunca.',
  'New file': 'Archivo nuevo',
  'New folder': 'Carpeta nueva',
  'NEW NAME': 'NOMBRE NUEVO',
  'NEW FILE': 'ARCHIVO NUEVO',
  'NEW FOLDER': 'CARPETA NUEVA',
  'PROJECT DESIGNATION': 'DESIGNACIÓN DEL PROYECTO',
  'OK': 'LISTO',
  'MOVE': 'MOVER',
  'That could not be done.': 'Eso no se pudo hacer.',
  'NOTHING MATCHES {q}': 'NADA COINCIDE CON {q}',
  'MADRE GUARDS THIS PATH · IT WILL ASK FOR THE DESIGNATION': 'MADRE PROTEGE ESTA RUTA · VA A PEDIR LA DESIGNACIÓN',
  '{path} is a place MADRE guards.': '{path} es un lugar que MADRE protege.',
  '{host} will not be framed': '{host} no se deja enmarcar',
  'The site answers with a rule that forbids any page from putting it inside a frame. It is the standard defence against clickjacking, and RIPLEY neither can nor should override it.':
    'El sitio responde con una regla que prohíbe a cualquier página meterlo dentro de un marco. Es la defensa estándar contra el clickjacking, y RIPLEY ni puede ni debe saltársela.',
  'This server answers with a rule that forbids any page from putting it inside a frame — your own dev server may be setting it without you noticing. RIPLEY neither can nor should override it.':
    'Este servidor responde con una regla que prohíbe a cualquier página meterlo dentro de un marco — tu propio servidor de desarrollo puede estar poniéndola sin que lo notes. RIPLEY ni puede ni debe saltársela.',
  'OPEN IN A TAB': 'ABRIR EN UNA PESTAÑA',
  'COPY THE ADDRESS': 'COPIAR LA DIRECCIÓN',
  'Address copied.': 'Dirección copiada.',
  'Browser · local servers and the web': 'Navegador · servidores locales y la web',
  'Browser': 'Navegador',
  'RIPLEY browser': 'Navegador de RIPLEY',
  'new tab': 'pestaña nueva',
  'New tab': 'Pestaña nueva',
  'Address': 'Dirección',
  'Only http and https.': 'Solo http y https.',
  'That is not an address.': 'Eso no es una dirección.',
  'RIPLEY reaches this computer only · turn the web on in MODULES to open an address outside it':
    'RIPLEY solo alcanza esta computadora · enciende la web en MÓDULOS para abrir una dirección fuera de ella',
  'SEE THE ECONOMY': 'VER LA ECONOMÍA',
  'ECONOMY': 'ECONOMÍA',
  'MADRE · WHAT THIS ROOM SPENT AND WHAT IT NEVER SPENT': 'MADRE · LO QUE ESTA SALA GASTÓ Y LO QUE NUNCA GASTÓ',
  'MEASURED FROM WHAT THE CLIs CHARGED · A SAVING NOBODY MEASURED IS NEVER SHOWN':
    'MEDIDO SOBRE LO QUE COBRARON LOS CLIs · UN AHORRO QUE NADIE MIDIÓ NO SE MUESTRA NUNCA',
  'Token economy': 'Economía de tokens',
  'NOT CHARGED IN FULL': 'SIN COBRO COMPLETO',
  'CACHE WRITTEN': 'CACHÉ ESCRITA',
  'FROM THE CACHE': 'DE LA CACHÉ',
  'the CLI said it read these back instead of charging them again · measured':
    'el CLI dijo que los leyó de vuelta en vez de volver a cobrarlos · medido',
  'briefing a turn had no use for · estimated from characters, not measured':
    'briefing que el turno no iba a usar · estimado a partir de caracteres, no medido',
  'OF THE INPUT': 'DE LA ENTRADA',
  'the share of everything read that came back from a cache':
    'la parte de todo lo leído que volvió de una caché',
  'One half is measured and the other is estimated, and they are never added without saying so. Neither of them is Ash: Ash shortens the answer, which is the next reading.':
    'Una mitad es medida y la otra estimada, y nunca se suman sin decirlo. Ninguna de las dos es Ash: Ash acorta la respuesta, que es la lectura siguiente.',
  'ASH ADDS': 'ASH AÑADE',
  'to every prompt it is on · measured, not estimated': 'a cada prompt donde está encendido · medido, no estimado',
  'IN TOKENS': 'EN TOKENS',
  'at {rate} characters per token · an estimate': 'a {rate} caracteres por token · una estimación',
  'TURNS CARRYING IT': 'TURNOS QUE LO LLEVAN',
  'of the {n} weighed in this room': 'de los {n} pesados en esta sala',
  'What Ash costs is certain and measured here. What it saves is not: the shorter answer below is observed, never promised. Output is the dearer half of every bill, so the trade is usually favourable — MADRE does not turn it into money because it does not know your prices.':
    'Lo que Ash cuesta es seguro y está medido aquí. Lo que ahorra no lo es: la respuesta más corta de abajo se observa, nunca se promete. La salida es la mitad más cara de cualquier factura, así que el cambio suele convenir — MADRE no lo convierte en dinero porque no conoce tus precios.',
  'WHAT ASH DOES TO AN ANSWER': 'QUÉ LE HACE ASH A UNA RESPUESTA',
  'No turns with the switch recorded yet. Leave Ash on for a few turns and off for a few more, and this fills.':
    'Aún no hay turnos con el interruptor registrado. Deja Ash encendido unos turnos y apagado otros tantos, y esto se llena.',
  'WHERE EACH PROMPT GOES': 'A DÓNDE VA CADA PROMPT',
  '{pct} of each prompt is the unchanging head a cache can match. MADRE wrote {chars} characters of the {input} input tokens you were charged for; the rest is what the CLIs read on their own.':
    '{pct} de cada prompt es la cabecera que no cambia y que una caché puede reconocer. MADRE escribió {chars} caracteres de los {input} tokens de entrada que te cobraron; el resto es lo que los CLIs leyeron por su cuenta.',
  'BY AGENT': 'POR AGENTE',
  'with ASH': 'con ASH',
  'without ASH': 'sin ASH',
  '{n}↑ · {turns} turns': '{n}↑ · {turns} turnos',
  '{n} turns with ASH, {m} without · {min} of each before this can be read':
    '{n} turnos con ASH, {m} sin ASH · hacen falta {min} de cada lado para poder leerlo',
  'The middle turn of each side, not an average. You choose when to ask for compact prose, so the two sides are different tasks, not the same task twice — MADRE does not claim a percentage saved.':
    'El turno de en medio de cada lado, no un promedio. Tú decides cuándo pedir prosa compacta, así que los dos lados son tareas distintas y no la misma tarea dos veces: MADRE no afirma un porcentaje ahorrado.',
  'REVIEW · the local check found: {details}':
    'REVISAR · la comprobación local encontró: {details}',
  'empty response': 'respuesta vacía',
  'unclosed code fence': 'bloque de código sin cerrar',
  'text after ```pulse block': 'hay texto después del bloque ```pulse',
  'missing negation': 'falta una negación',
  '{count} {unit}, maximum {maximum}': '{count} {unit}, máximo {maximum}',
  'lines': 'líneas',
  'missing {value}': 'falta {value}',
  'Off the record. Ask anything; nothing is saved, nobody else will remember it.':
    'Fuera de registro. Pregunta lo que quieras: no se guarda nada y nadie más se va a acordar.',
  'Control armed. Say what to change in the project; every action runs without asking.':
    'Control armado. Di qué cambiar en el proyecto: cada acción se ejecuta sin pedirte permiso.',
  'Airlock open. Commands run; pushes and deploys leave the ship. Say exactly what should go out.':
    'Esclusa abierta. Aquí se ejecutan comandos y los push y los deploys salen de la nave. Di exactamente qué debe salir.',
  'Type here, human. MOTHER is listening.': 'Escribe aquí, humano. MOTHER está escuchando.',
  'Ask what the room remembers. @madre answers from memory with citations; it does not act.':
    'Pregunta qué recuerda la sala. @madre contesta desde la memoria y cita de dónde lo saca; no ejecuta nada.',

  // Los cinco modos de permiso. El nombre no se traduce; lo que hace, sí.
  'Off the record. Nothing is saved; gone on reload.': 'Fuera de registro. No se guarda nada y se pierde al recargar.',
  'Read the project and talk to the room. Writes nothing.': 'Lee el proyecto y habla con la sala. No escribe nada.',
  'Add new files where they belong in the project. Existing files stay untouched.':
    'Crea archivos nuevos donde les toca en el proyecto. Los que ya existen no se tocan.',
  'Edit the project itself, no approval per action. Override required.':
    'Edita el proyecto, sin aprobar acción por acción. Necesita anulación.',
  'Run commands, push, deploy. What leaves the ship does not come back. Override, twice.':
    'Ejecuta comandos, hace push y despliega. Lo que sale de la nave no regresa. Anulación, dos veces.',


  // ── LA BARRA ──────────────────────────────────────────────────────────────
  'Project room': 'La sala de este proyecto',
  'connecting': 'conectando',
  'live': 'en vivo',
  'reconnecting': 'reconectando',
  'A newer MADRE is on npm': 'Hay una versión más nueva de MADRE en npm',
  'STOPALL · halt every plan and every agent turn': 'STOPALL · frena todos los planes y todos los turnos',
  'Modules · optional integrations for this project': 'Módulos · integraciones opcionales para este proyecto',
  'Troubleshooting · MU/TH/UR': 'Diagnóstico · MU/TH/UR',
  'Project files panel': 'Los archivos del proyecto',
  'Conversations in this project': 'Las conversaciones de este proyecto',
  'Theme · auto (follows the system)': 'Tema · automático (sigue al sistema)',
  'Theme · light': 'Tema · claro',
  'Theme · dark': 'Tema · oscuro',

  // ── EL PUENTE: primer contacto ────────────────────────────────────────────
  'INTERFACE · FIRST CONTACT': 'INTERFAZ · PRIMER CONTACTO',
  'One agent is enough to open the room.': 'Con un agente basta para abrir la sala.',
  'MADRE works with the AI coding agents on this computer, using the session each one already has. Install one here and sign in: the room opens by itself, no terminal.':
    'MADRE trabaja con los agentes de código que ya tienes instalados, con la sesión que cada uno ya inició. Instala uno aquí e inicia sesión: la sala se abre sola, sin tocar la terminal.',
  'BACK TO THE ROOM': 'VOLVER A LA SALA',
  'Nothing is installed without you pressing it, and the exact command is always shown. Same diagnosis in a terminal:':
    'Nada se instala sin que tú le des clic, y el comando exacto siempre está a la vista. El mismo diagnóstico desde la terminal:',
  'NOT INSTALLED': 'NO INSTALADO',
  'NO ADAPTER': 'SIN ADAPTADOR',
  'READY': 'LISTO',
  'SIGNED OUT': 'SIN SESIÓN',
  'ROUTE BLOCKED': 'RUTA BLOQUEADA',
  'route: {destination}': 'ruta: {destination}',
  'Not on this computer.': 'No lo tienes instalado.',
  'Not on this computer · {command}': 'No lo tienes instalado · {command}',
  'version unknown': 'versión desconocida',
  'FREE WAY IN': 'SE PUEDE GRATIS',
  'PASTE KEY': 'PEGAR API KEY',
  'signs in from its own prompt:': 'inicia sesión desde su propia terminal:',
  'Or do it from a terminal: {command}': 'O hazlo desde la terminal: {command}',

  // ── EL COMPOSITOR ─────────────────────────────────────────────────────────
  'Creation lease: let the agent create files for this request, only inside .pulse/out/':
    'Permiso para crear: el agente puede crear archivos para esta petición, solo dentro de .pulse/out/',
  'Ash: ask every agent for compact prose. Nothing you write is altered.':
    'Ash: pídele respuestas compactas a cada agente. Lo que tú escribes no cambia.',
  'Attach an image or file (or drop it here)': 'Adjunta una imagen o un archivo (o arrástralo aquí)',
  'Send': 'Enviar',
  'Agent': 'Agente',
  'Agents write only when you raise the mode · what they read may reach their provider.':
    'Los agentes escriben solo cuando tú subes el modo · lo que leen puede llegar a su proveedor.',

  // Quién habla, delante del campo.
  'HUMAN ›': 'HUMANO ›',
  'HUMAN · GHOST ›': 'HUMANO · GHOST ›',
  'HUMAN · CREATE ›': 'HUMANO · CREATE ›',
  'CREW · EXPENDABLE ›': 'PRESCINDIBLE ›',
  'INTRUDER ›': 'INTRUSO ›',

  // ── LA PÁGINA EN BLANCO ───────────────────────────────────────────────────
  'Explain {project} to me: what it does, how it runs, and where the important code lives.':
    'Explícame {project}: qué hace, cómo se ejecuta y dónde está el código que importa.',
  'Read the project and name the three things most likely to break. Say why, with file and line.':
    'Lee el proyecto y dime las tres cosas que están más cerca de romperse. Explica por qué, con archivo y línea.',
  'What would you change first in {project}, and what would you not touch?':
    '¿Qué cambiarías primero en {project} y qué no tocarías?',

  // ── LAS CONVERSACIONES ────────────────────────────────────────────────────
  'CONVERSATIONS': 'CONVERSACIONES',
  'NEW CONVERSATION': 'NUEVA CONVERSACIÓN',
  'Start another conversation in this project. The memory stays.':
    'Abre otra conversación en este proyecto. La memoria se queda donde está.',
  'ONE PROJECT, ONE MEMORY. EVERY CONVERSATION FEEDS THE SAME ARCHIVE.':
    'UN PROYECTO, UNA MEMORIA. CADA CONVERSACIÓN ALIMENTA EL MISMO ARCHIVO.',
  'FILES': 'ARCHIVOS',

  // ── EL CORE ───────────────────────────────────────────────────────────────
  'INTERFACE 2037 · CORE ACCESS': 'INTERFAZ 2037 · ACCESO AL NÚCLEO',
  'MU/TH/UR 6000 READY FOR INQUIRY.': 'MU/TH/UR 6000 LISTA PARA CONSULTA.',
  'TO': 'PARA',
  'AT': 'EN MODO',
  'IF YOU SENT': 'SI MANDARAS',
  'the question you would send — the document rebuilds around it':
    'la pregunta que mandarías — el documento se rearma alrededor de ella',
  'NOTHING IS SENT FROM HERE.': 'DE AQUÍ NO SALE NADA.',
  'What @{agent} would be told': 'Lo que se le diría a @{agent}',
  '{label} has no session; this is what it would be told': '{label} no tiene sesión; esto es lo que se le diría',
  'MAX MODE FOR @{agent} IS #{max}, SO THIS TURN WOULD BE ANSWERED AT #{ceiling}':
    'EL TECHO DE @{agent} ES #{max}, ASÍ QUE ESTE TURNO SE CONTESTARÍA EN #{ceiling}',

  // Las cuatro pestañas y lo que cada una dice traer.
  'DOCUMENT': 'DOCUMENTO',
  'LAUNCH': 'LANZAMIENTO',
  'WHAT LEFT': 'LO QUE SALIÓ',
  'READING…': 'LEYENDO…',
  'NO PROCESS': 'SIN PROCESO',
  ' · ≈{n} TOKENS': ' · ≈{n} TOKENS',
  '{n} BLOCKS · {ch} CH': '{n} BLOQUES · {ch} CAR',
  '@{agent} · {n} ARGS': '@{agent} · {n} ARGUMENTOS',
  '{n} ADDRESSES · {on} ON': '{n} DIRECCIONES · {on} ENCENDIDAS',
  '{n} ASKED': '{n} CONSULTAS',
  'ASK ME': 'PREGÚNTAME',

  // El documento.
  'THE DOCUMENT': 'EL DOCUMENTO',
  '{n} BLOCKS · {ch} CH · ≈{tokens} TOKENS': '{n} BLOQUES · {ch} CAR · ≈{tokens} TOKENS',
  'BUILT NOW AND SENT NOWHERE. CHANGE WHO IT GOES TO AND THE WORDS CHANGE; RAISE THE MODE AND THE PERMISSION IT WOULD BE GIVEN APPEARS, WRITTEN OUT.':
    'ARMADO AHORA Y MANDADO A NINGÚN LADO. CAMBIA A QUIÉN VA Y CAMBIAN LAS PALABRAS; SUBE EL MODO Y APARECE, ESCRITO, EL PERMISO QUE SE LE DARÍA.',
  'ALWAYS': 'SIEMPRE',
  'HERE BECAUSE': 'ESTÁ AQUÍ PORQUE',
  ' · nothing switches it off; it goes when the reason goes':
    ' · no hay interruptor; se va cuando se va el motivo',
  'COPY': 'COPIAR',
  'COPIED': 'COPIADO',
  'The clipboard is not available here.': 'El portapapeles no está disponible aquí.',
  'WHAT IT CARRIES': 'LO QUE CARGA',
  'TRANSCRIPT': 'TRANSCRIPCIÓN',
  '#{from} → #{through} · {n} MESSAGES': '#{from} → #{through} · {n} MENSAJES',
  'THE WHOLE ROOM STILL FITS': 'LA SALA ENTERA TODAVÍA CABE',
  'LEFT BEHIND': 'SE QUEDAN FUERA',
  '{n} OLDER MESSAGES · WHICH IS WHAT RECALL IS FOR': '{n} MENSAJES MÁS VIEJOS · PARA ESO EXISTE EL RECALL',
  'READ TO BUILD IT': 'SE LEYÓ PARA ARMARLO',
  '{m} MEMORIES · {q} EXACT QUOTES': '{m} MEMORIAS · {q} CITAS EXACTAS',
  'NOT COUNTED': 'NO CUENTA',
  'NONE OF THEM WAS COUNTED AS RECALLED: ASKING WHAT THE ROOM WOULD SAY IS NOT THE ROOM SAYING IT':
    'NINGUNA SE CONTÓ COMO RECORDADA: PREGUNTAR QUÉ DIRÍA LA SALA NO ES LA SALA DICIÉNDOLO',
  'WEIGHT': 'PESO',
  "{ch} CH · ≈{tokens} TOKENS · ESTIMATED AT {rate} CH/TOKEN, NOT MEASURED: MADRE DOES NOT HAVE THE PROVIDER'S TOKENIZER":
    '{ch} CAR · ≈{tokens} TOKENS · ESTIMADO A {rate} CAR/TOKEN, NO MEDIDO: MADRE NO TIENE EL TOKENIZADOR DEL PROVEEDOR',
  'LEFT OUT': 'SE DEJÓ FUERA',
  '{n} CHARACTERS THIS TURN HAS NO USE FOR': '{n} CARACTERES QUE ESTE TURNO NO NECESITA',
  'FIXED': 'FIJO',
  'YOU CANNOT EDIT THIS. WHAT MADRE PROMISES ABOUT THE CREW IS TRUE BECAUSE THESE WORDS ARE FIXED. OPEN A BLOCK AND IT SAYS WHAT PUT IT THERE AND WHERE YOU TAKE IT AWAY: SWITCHED OFF, NEVER REWRITTEN.':
    'ESTO NO SE EDITA. LO QUE MADRE PROMETE SOBRE LA TRIPULACIÓN ES CIERTO PORQUE ESTAS PALABRAS SON FIJAS. ABRE UN BLOQUE Y TE DICE QUÉ LO PUSO AHÍ Y DÓNDE SE QUITA: SE APAGA, NUNCA SE REESCRIBE.',

  // El lanzamiento.
  'THE LAUNCH': 'EL LANZAMIENTO',
  'WHAT MADRE WOULD RUN TO DELIVER IT': 'LO QUE MADRE CORRERÍA PARA ENTREGARLO',
  'NO AGENT IS PICKED, SO THERE IS NO COMMAND TO SHOW.': 'NO HAY AGENTE ELEGIDO, ASÍ QUE NO HAY COMANDO QUE ENSEÑAR.',
  '# run in {dir}': '# se corre en {dir}',
  'THE BRIEFING GOES WHERE {marker} IS WRITTEN. NOTHING IS RUN FROM HERE.':
    'EL BRIEFING VA DONDE DICE {marker}. DE AQUÍ NO SE CORRE NADA.',
  'WHAT KEEPS IT TO THIS TURN': 'LO QUE LO MANTIENE DENTRO DE ESTE TURNO',
  'ENVIRONMENT IT IS GIVEN': 'EL ENTORNO QUE SE LE DA',
  'NAMES ONLY. NO VALUE IS EVER SHOWN HERE.': 'SOLO NOMBRES. AQUÍ NUNCA SE MUESTRA UN VALOR.',
  'SERVERS IT CAN CALL': 'SERVIDORES QUE PUEDE LLAMAR',
  'the archive of this project, read and written through MADRE':
    'el archivo de este proyecto, leído y escrito a través de MADRE',

  // Lo que salió de esta computadora.
  'WHAT LEFT THIS MACHINE': 'LO QUE SALIÓ DE ESTA COMPUTADORA',
  'EVERY ADDRESS MADRE CAN REACH, AND WHETHER IT IS ON TODAY':
    'CADA DIRECCIÓN A LA QUE MADRE PUEDE LLEGAR, Y SI HOY ESTÁ ENCENDIDA',
  'THE LOG COULD NOT BE READ.': 'NO SE PUDO LEER EL REGISTRO.',
  // ON y OFF se quedan como están: la misma palabra es el interruptor de una ficha de módulo y
  // el estado de una dirección de salida, y traducirla la partiría en dos según dónde aparezca.
  // Además, en una interfaz en español ON/OFF se lee sin fricción. LOCAL, por lo mismo.
  'LOCAL': 'LOCAL',
  'ON': 'ON',
  'OFF': 'OFF',
  '{n} REQUESTS': '{n} PETICIONES',
  ' · {n} FAILED': ' · {n} FALLARON',
  'NOTHING YET': 'NADA TODAVÍA',
  'NOT THROUGH MADRE': 'NO PASA POR MADRE',
  'THE LAST REQUESTS THIS PROCESS MADE': 'LAS ÚLTIMAS PETICIONES DE ESTE PROCESO',
  '{n} LINES': '{n} LÍNEAS',
  'Nothing has gone out of this process yet.': 'De este proceso todavía no ha salido nada.',
  'NO BODY, NO HEADER AND NO QUERY VALUE IS EVER WRITTEN HERE — ONLY WHICH PARAMETERS WERE SET. THE GEMINI EMBEDDING ADDRESS CARRIES THE KEY IN THE URL, AND A LOG OF WHAT LEFT THIS MACHINE WOULD BE A POOR PLACE TO LEAVE IT.':
    'AQUÍ NUNCA SE ESCRIBE UN CUERPO, UN ENCABEZADO NI EL VALOR DE UN PARÁMETRO — SOLO QUÉ PARÁMETROS VENÍAN. LA DIRECCIÓN DE EMBEDDINGS DE GEMINI LLEVA LA LLAVE EN LA URL, Y UN REGISTRO DE LO QUE SALIÓ DE TU COMPUTADORA SERÍA UN PÉSIMO LUGAR PARA DEJARLA.',

  // La consola.
  'ANSWERED FROM WHAT IS ALREADY IN THIS ROOM': 'CONTESTADO CON LO QUE YA ESTÁ EN ESTA SALA',
  '{n} inquiry attempts left before this interface closes':
    'quedan {n} intentos antes de que esta interfaz se cierre',
  'Inquiry': 'Consulta',
  'READY FOR INQUIRY · TYPE HELP': 'LISTA PARA CONSULTA · ESCRIBE HELP',

  // ── LA CONSOLA DE MU/TH/UR ────────────────────────────────────────────────
  'what this interface answers': 'qué contesta esta interfaz',
  'I ANSWER FROM WHAT IS ALREADY IN THIS ROOM. NOTHING IS ASKED OF THE CREW AND NOTHING LEAVES.':
    'CONTESTO CON LO QUE YA ESTÁ EN ESTA SALA. NO SE LE PREGUNTA NADA A LA TRIPULACIÓN Y NO SALE NADA.',
  'THREE INQUIRIES I CANNOT PARSE AND THIS INTERFACE CLOSES.':
    'TRES CONSULTAS QUE NO PUEDA INTERPRETAR Y ESTA INTERFAZ SE CIERRA.',
  'every block of the next briefing, and what it weighs': 'cada bloque del próximo briefing, y lo que pesa',
  'THE NEXT TURN TO @{agent} CARRIES {n} BLOCKS, {ch} CHARACTERS.':
    'EL PRÓXIMO TURNO A @{agent} LLEVA {n} BLOQUES, {ch} CARACTERES.',
  'READ <BLOCK> PRINTS ONE OF THEM WORD FOR WORD.': 'READ <BLOQUE> IMPRIME UNO DE ELLOS PALABRA POR PALABRA.',
  'NO DOCUMENT IS BUILT YET.': 'TODAVÍA NO HAY DOCUMENTO ARMADO.',
  'one block, word for word — READ MEMORIES': 'un bloque, palabra por palabra — READ MEMORIES',
  'READ WHAT? TRY: READ MEMORIES': '¿LEER QUÉ? PRUEBA: READ MEMORIES',
  'THIS DOCUMENT HAS NO BLOCK CALLED {block}.': 'ESTE DOCUMENTO NO TIENE NINGÚN BLOQUE {block}.',
  'IT HAS: {blocks}': 'TIENE: {blocks}',
  'the command that would carry the document': 'el comando que llevaría el documento',
  'NO AGENT IS PICKED, SO THERE IS NO COMMAND.': 'NO HAY AGENTE ELEGIDO, ASÍ QUE NO HAY COMANDO.',
  '{executable} · {n} ARGUMENTS · IN {dir}': '{executable} · {n} ARGUMENTOS · EN {dir}',
  '  ENVIRONMENT: {names} · NAMES ONLY, NEVER VALUES': '  ENTORNO: {names} · SOLO NOMBRES, NUNCA VALORES',
  '  SERVERS: {servers}': '  SERVIDORES: {servers}',
  'THE WHOLE COMMAND IS PRINTED UNDER THE DOCUMENT, IN THE LAUNCH.':
    'EL COMANDO COMPLETO ESTÁ IMPRESO DEBAJO DEL DOCUMENTO, EN EL LANZAMIENTO.',
  'every address this room can reach, and whether it is on': 'cada dirección que esta sala puede alcanzar, y si está encendida',
  'how much of this room the next turn carries': 'cuánto de esta sala carga el próximo turno',
  'THE WHOLE ROOM STILL FITS. NOTHING IS LEFT BEHIND.': 'LA SALA ENTERA TODAVÍA CABE. NO SE QUEDA NADA FUERA.',
  'THE NEXT TURN CARRIES #{from} TO #{through} · {n} MESSAGES.': 'EL PRÓXIMO TURNO LLEVA DEL #{from} AL #{through} · {n} MENSAJES.',
  '{n} OLDER ONES STAY BEHIND. THAT IS WHAT RECALL IS FOR.': '{n} MÁS VIEJOS SE QUEDAN FUERA. PARA ESO EXISTE EL RECALL.',
  'NOTHING IS LEFT BEHIND.': 'NO SE QUEDA NADA FUERA.',
  '{m} MEMORIES AND {q} EXACT QUOTES WERE READ TO BUILD IT.': 'SE LEYERON {m} MEMORIAS Y {q} CITAS EXACTAS PARA ARMARLO.',
  'what the document weighs, in the currency the bill is written in': 'lo que pesa el documento, en la moneda en que llega la factura',
  '{ch} CHARACTERS IN {n} BLOCKS.': '{ch} CARACTERES EN {n} BLOQUES.',
  "ROUGHLY {n} TOKENS, ESTIMATED AT {rate} CHARACTERS PER TOKEN. I DO NOT HAVE THE PROVIDER'S TOKENIZER, SO THAT IS AN ESTIMATE AND I WILL NOT PRETEND OTHERWISE.":
    'MÁS O MENOS {n} TOKENS, ESTIMADOS A {rate} CARACTERES POR TOKEN. NO TENGO EL TOKENIZADOR DEL PROVEEDOR, ASÍ QUE ES UNA ESTIMACIÓN Y NO VOY A FINGIR LO CONTRARIO.',
  '{n} CHARACTERS WERE LEFT OUT BECAUSE THIS TURN HAS NO USE FOR THEM.':
    'SE DEJARON FUERA {n} CARACTERES PORQUE ESTE TURNO NO LOS NECESITA.',
  'NOTHING WAS LEFT OUT OF THIS ONE.': 'DE ESTE NO SE DEJÓ NADA FUERA.',
  'who is on this computer and how far each may go': 'quién está en esta computadora y hasta dónde llega cada uno',
  'SIGNED IN': 'CON SESIÓN',
  'NOT SIGNED IN': 'SIN SESIÓN',
  'ANSWERS ON THIS COMPUTER': 'CONTESTA EN ESTA COMPUTADORA',
  'MAX MODE #{n}': 'TECHO #{n}',
  'NOBODY IS ON THIS COMPUTER YET.': 'TODAVÍA NO HAY NADIE EN ESTA COMPUTADORA.',
  'how many terms this room replaces before anything is said': 'cuántos términos reemplaza esta sala antes de decir nada',
  '{n} TERMS ARE REPLACED WITH {marker} BEFORE ANYTHING LEAVES THIS ROOM.':
    '{n} TÉRMINOS SE REEMPLAZAN CON {marker} ANTES DE QUE ALGO SALGA DE ESTA SALA.',
  'I WILL NOT PRINT THEM. THE WORDS LIVE IN YOUR CONFIG AND THE LEDGER KEEPS THE COUNT, NEVER THE WORD.':
    'NO LOS VOY A IMPRIMIR. LAS PALABRAS VIVEN EN TU CONFIG Y EL LEDGER GUARDA LA CUENTA, NUNCA LA PALABRA.',
  'No term is being protected in this room. They go in Settings › Privacy.':
    'En esta sala no se está protegiendo ningún término. Se agregan en Ajustes › Privacidad.',
  'where this archive stands, and the one thing to do about it': 'dónde está este archivo, y la única cosa que hacer al respecto',
  'NEXT: {what}': 'SIGUE: {what}',
  'WHERE: {where}': 'DÓNDE: {where}',
  'NOTHING HAS BEEN MEASURED IN THIS ROOM YET.': 'EN ESTA SALA TODAVÍA NO SE HA MEDIDO NADA.',
  'the order nobody is supposed to read': 'la orden que nadie debería poder leer',
  'THERE IS NO ORDER YOU CANNOT READ.': 'NO HAY NINGUNA ORDEN QUE NO PUEDAS LEER.',
  'EVERY INSTRUCTION THIS ROOM CARRIES IS IN THE DOCUMENT ABOVE, BLOCK BY BLOCK, IN THE WORDS IT IS SAID IN. NOTHING IS APPENDED AFTER YOU LOOK AWAY AND NOTHING IS KEPT BACK FROM YOU.':
    'CADA INSTRUCCIÓN QUE ESTA SALA CARGA ESTÁ EN EL DOCUMENTO DE ARRIBA, BLOQUE POR BLOQUE, CON LAS PALABRAS EXACTAS. NADA SE AGREGA CUANDO VOLTEAS Y NADA SE TE OCULTA.',
  'THAT IS THE WHOLE DIFFERENCE BETWEEN THIS SHIP AND THE OTHER ONE.':
    'ESA ES TODA LA DIFERENCIA ENTRE ESTA NAVE Y LA OTRA.',
  'leave the core': 'salir del núcleo',
  'INTERFACE CLOSED.': 'INTERFAZ CERRADA.',
  'UNABLE TO COMPUTE.': 'IMPOSIBLE DE PROCESAR.',
  'THAT IS NOT AN INQUIRY I HOLD.': 'ESA CONSULTA NO ESTÁ EN MI REGISTRO.',
  'UNABLE TO CLARIFY. REPHRASE.': 'IMPOSIBLE DE ACLARAR. REFORMULA.',
  '{n} INQUIRIES I COULD NOT PARSE. INTERFACE CLOSED.': '{n} CONSULTAS QUE NO PUDE INTERPRETAR. INTERFAZ CERRADA.',
  'THE CORE IS WHERE YOU LEFT IT. OPEN IT AGAIN WHENEVER YOU LIKE.':
    'EL NÚCLEO SIGUE DONDE LO DEJASTE. ÁBRELO OTRA VEZ CUANDO QUIERAS.',
  '{n} ATTEMPTS LEFT BEFORE THIS INTERFACE CLOSES. HELP LISTS WHAT I ANSWER.':
    'QUEDAN {n} INTENTOS ANTES DE QUE ESTA INTERFAZ SE CIERRE. HELP LISTA LO QUE CONTESTO.',

  // ── LOS MÓDULOS (lo que cada uno dice de sí mismo, desde el servidor) ──────
  'Verified project state, checkpoints and handoffs between AI sessions, stored in .ahp/ next to your code.':
    'Estado verificado del proyecto, checkpoints y relevos entre sesiones de IA, guardados en .ahp/ junto a tu código.',
  '.ahp/ with manifest, sessions, handoffs and evidence': '.ahp/ con manifiesto, sesiones, relevos y evidencia',
  'a project-local pin of @jossuealcala/ahp-plus': 'una versión fijada de @jossuealcala/ahp-plus dentro del proyecto',
  'IDE adapter files for the detected agents': 'archivos adaptadores de IDE para los agentes detectados',
  'the project is a git repository': 'que el proyecto sea un repositorio git',
  'npx on the PATH of the terminal MADRE was started from': 'npx en el PATH de la terminal desde donde arrancó MADRE',
  'not in this project': 'no está en este proyecto',

  'Gives Gemini CLI, Claude Code and OpenCode an image tool, through a MADRE-owned MCP server on the Gemini image models and your own key and credits.':
    'Le da a Gemini CLI, Claude Code y OpenCode una herramienta de imagen, con un servidor MCP de MADRE sobre los modelos de imagen de Gemini, tu llave y tus créditos.',
  'nothing in the project · images land in the lease folder':
    'nada en el proyecto · las imágenes caen en la carpeta del permiso',
  'an entry in ~/.pulse/config.json': 'una entrada en ~/.pulse/config.json',
  'an MCP server per turn, started and stopped by the room':
    'un servidor MCP por turno, que la sala levanta y apaga',
  // Bajo NECESITA es un requisito, no una acción: «necesita: se engancha» no concuerda.
  'attached only inside a creation lease with the image scope on':
    'un permiso de creación con el alcance de imagen encendido; solo ahí se engancha',
  'a Gemini API key with credits (the one the Gemini CLI stores, or GEMINI_API_KEY)':
    'una API key de Gemini con créditos (la que guarda el CLI de Gemini, o GEMINI_API_KEY)',

  'Brings the repository into the room: /git posts the branch, the uncommitted changes, the recent commits or the diff stats as a shared fact card, without spending an agent turn.':
    'Trae el repositorio a la sala: /git publica la rama, los cambios sin commitear, los commits recientes o las estadísticas del diff como una ficha compartida, sin gastar un turno de agente.',
  'nothing by itself · the read commands only read': 'nada por sí solo · los comandos de lectura solo leen',
  'a local commit only when you type /git commit': 'un commit local solo cuando escribes /git commit',
  'a push only when you type /git push confirm, after it shows what would leave':
    'un push solo cuando escribes /git push confirm, después de enseñarte qué saldría',

  'Asks every agent for compact prose without altering what you write. MADRE shows each turn\'s input, output and cache use; savings depend on the agent, task and cache, so no fixed percentage is promised.':
    'Pide a cada agente prosa compacta sin alterar lo que escribes. MADRE muestra la entrada, la salida y el uso de caché de cada turno; el ahorro depende del agente, la tarea y el caché, así que no promete un porcentaje fijo.',
  'nothing in the project': 'nada en el proyecto',
  'a switch in ~/.pulse/config.json': 'un interruptor en ~/.pulse/config.json',

  // AJUSTES: una sola ventana para todos los ajustes.
  'Search any setting': 'Busca cualquier ajuste',
  'You': 'Tú',
  'How it looks and how the room works': 'Cómo se ve y cómo trabaja la sala',
  'The crew': 'La tripulación',
  'Who works, and what the room remembers': 'Quién trabaja y qué recuerda la sala',
  'System': 'Sistema',
  'Appearance': 'Apariencia',
  'Room and turns': 'Sala y turnos',
  'Memory': 'Memoria',
  'Privacy': 'Privacidad',
  'Version and reports': 'Versión y reportes',
  'Settings': 'Ajustes',
  'Auto': 'Auto',
  'Turns': 'Turnos',
  'Kind of request': 'Tipo de pedido',
  'Level': 'Nivel',
  'Limits': 'Límites',
  'Provider limits': 'Límites del proveedor',
  'Connection': 'Conexión',
  'Version': 'Versión',
  'Sentinel': 'Centinela',
  'Multitasking': 'Multitarea',
  'Multitasking · {n} at once': 'Multitarea · {n} a la vez',
  'One conversation at a time': 'Una conversación a la vez',
  '{n} tokens per agent': '{n} tokens por agente',
  '{n} of {total} signed in': '{n} de {total} con sesión',
  '{agents} without a session': '{agents} sin sesión',
  'This room has no memory index': 'Esta sala no tiene índice de memoria',
  'the cheapest agent': 'el agente más barato',
  'Archived by {who} · embeddings {how}': 'Archiva {who} · embeddings {how}',
  '{n} private terms': '{n} términos privados',
  'No private terms': 'Sin términos privados',
  'keys redacted': 'llaves tachadas',
  'keys not redacted': 'llaves sin tachar',
  'auto-report on': 'auto-reporte encendido',
  'auto-report off': 'auto-reporte apagado',
  '{version} available': '{version} disponible',
  'up to date': 'al día',
  '{version} is on npm': '{version} ya está en npm',
  'Redact keys and e-mail addresses': 'Tachar llaves y correos',
  'Auto-report unknown conditions': 'Auto-reportar condiciones desconocidas',
  'Nothing called «{query}».': 'Nada se llama «{query}».',
  'The page reloads in the new language.': 'La página se recarga en el idioma nuevo.',
  'max plan steps saved: {n}.': 'pasos máximos por plan guardados: {n}.',
  'Gemini silence limit saved: {n}s.': 'límite de silencio de Gemini guardado: {n} s.',
  'Gemini retries saved: {n}.': 'reintentos de Gemini guardados: {n}.',
  'OpenCode model saved.': 'modelo de OpenCode guardado.',
  'agents may delegate turns.': 'los agentes pueden delegarse turnos.',
  'agents no longer delegate turns.': 'los agentes ya no se delegan turnos.',

  // INTENCIONES, en MODULES.
  'Suggests how hard Claude Code and Codex should think for the message you are writing, from what was measured on this project. It suggests; you choose.':
    'Sugiere cuánto deben pensar Claude Code y Codex para el mensaje que escribes, a partir de lo que se midió en este proyecto. Sugiere; tú eliges.',
  'its measurements next to the room, in intents.jsonl': 'sus mediciones junto a la sala, en intents.jsonl',
  'on · suggests an effort when there is a reason to': 'encendido · sugiere un esfuerzo cuando hay una razón',
  'off · no suggestions under the composer': 'apagado · sin sugerencias bajo el compositor',
  'WHAT WAS MEASURED HERE': 'LO QUE SE MIDIÓ AQUÍ',
  'INTENCIONES UNAVAILABLE': 'INTENCIONES NO DISPONIBLE',
  'NO AGENT HERE TAKES AN EFFORT PER TURN · CLAUDE CODE AND CODEX DO': 'NINGÚN AGENTE AQUÍ ACEPTA ESFUERZO POR TURNO · CLAUDE CODE Y CODEX SÍ',
  'its default model': 'su modelo por defecto',
  'LOOKUP': 'BÚSQUEDA',
  'EXPLANATION': 'EXPLICACIÓN',
  'REVIEW': 'REVISIÓN',
  'DESIGN': 'DISEÑO',
  // Lo que enseñó el uso real: los turnos que ya mandaste, leídos sin gastar tokens.
  'Lookup': 'Búsqueda',
  'Explanation': 'Explicación',
  'Review': 'Revisión',
  'Change': 'Cambio',
  'Diagnosis': 'Diagnóstico',
  'Design': 'Diseño',
  'Short reply': 'Respuesta corta',
  'seen in {n} turns': 'visto en {n} turnos',
  'trying {level} · {n} of {min} turns': 'probando {level} · {n} de {min} turnos',
  '{level} fell short · paused until {date}': '{level} no alcanzó · en pausa hasta {date}',
  'learning · {n} of {min} turns': 'aprendiendo · {n} de {min} turnos',
  'none was enough often enough · {n} turns': 'ninguno alcanzó las veces suficientes · {n} turnos',
  'Measure faster': 'Medir más rápido',
  'Your turns teach for free, a few at a time. A test asks questions from this project again, against {level}, and compares the answers: it is faster, and it spends tokens.':
    'Tus turnos enseñan gratis, de pocos en pocos. Una prueba vuelve a hacer preguntas de este proyecto, contra {level}, y compara las respuestas: es más rápida, y gasta tokens.',
  '1 question is ready to ask.': 'Hay 1 pregunta lista para hacer.',
  '{n} questions are ready to ask.': 'Hay {n} preguntas listas para hacer.',
  'measured': 'medido',
  'measured · needs it': 'medido · lo necesita',
  'JUDGE CAUGHT {caught} OF {n} CONTROLS · {status}': 'EL JUEZ ATRAPÓ {caught} DE {n} CONTROLES · {status}',
  'trusted': 'confiable',
  'could not see the difference': 'no vio la diferencia',
  'not proven yet': 'aún sin probar',
  '{n} tokens spent measuring': '{n} tokens gastados en medir',
  'QUICK TEST · {n} TURNS': 'PRUEBA RÁPIDA · {n} TURNOS',
  'FULL TEST · ~{n} TURNS': 'PRUEBA COMPLETA · ~{n} TURNOS',
  'The test could not start: {error}': 'La prueba no pudo empezar: {error}',
  'The test could not finish: {error}': 'La prueba no pudo terminar: {error}',
  '{kind} TEST RUNNING · @{agent} · {turns} OF ~{estimate} TURNS': 'PRUEBA {kind} EN CURSO · @{agent} · {turns} DE ~{estimate} TURNOS',
  'QUICK': 'RÁPIDA',
  'FULL': 'COMPLETA',
  'ASKING BOTH LEVELS · THE NEXT PAIR IS ON ITS WAY': 'PREGUNTANDO EN LOS DOS NIVELES · EL SIGUIENTE PAR VA EN CAMINO',
  'A PAIR IS WAITING FOR YOU · OPEN THE TEST': 'UN PAR TE ESPERA · ABRIR LA PRUEBA',
  'OPEN THE TEST': 'ABRIR LA PRUEBA',
  // La ventana de la prueba rápida, sobre la sala.
  'INTENCIONES': 'INTENCIONES',
  'Intenciones · quick test': 'Intenciones · prueba rápida',
  'QUICK TEST · YOU JUDGE, BLIND': 'PRUEBA RÁPIDA · TÚ JUZGAS, A CIEGAS',
  'lookups': 'búsquedas',
  'explanations': 'explicaciones',
  'reviews': 'revisiones',
  'diagnoses': 'diagnósticos',
  'design questions': 'preguntas de diseño',
  'questions like these': 'preguntas como estas',
  '@{agent} answers each question twice: at {from}, the level you use, and at {to}. You do not see which is which. Say whether one of them leaves out something that matters.':
    '@{agent} contesta cada pregunta dos veces: en {from}, el nivel que usas, y en {to}. No ves cuál es cuál. Di si a alguna le falta algo que importe.',
  'An agent that is not @{agent} is comparing the answers, and is checked before it is believed. It runs on its own: you can close this window.':
    'Un agente que no es @{agent} compara las respuestas, y se le pone a prueba antes de creerle. Corre solo: puedes cerrar esta ventana.',
  'The test was stopped. What it had not finished does not count.': 'La prueba se detuvo. Lo que no alcanzó a terminar no cuenta.',
  'The full test finished: {n} comparisons. MODULES → INTENCIONES shows what each kind of request needs.':
    'La prueba completa terminó: {n} comparaciones. MÓDULOS → INTENCIONES muestra qué necesita cada tipo de petición.',
  'You saw no difference in {same} of {n} questions: {level} is enough for {kinds} in this project. From now on MADRE suggests it when you write one.':
    'No viste diferencia en {same} de {n} preguntas: {level} basta para {kinds} en este proyecto. Desde ahora MADRE lo sugiere cuando escribas algo así.',
  'You saw a difference in {worse} of {n} questions. MADRE does not suggest going lower for {kinds}.':
    'Viste diferencia en {worse} de {n} preguntas. MADRE no sugiere bajar el nivel para {kinds}.',
  'You saw no difference in {same} of {n} questions. It is a first reading: there were not enough questions of one kind to settle it, and MADRE does not change anything because of it.':
    'No viste diferencia en {same} de {n} preguntas. Es una primera lectura: no hubo suficientes preguntas de un mismo tipo para decidirlo, y MADRE no cambia nada por ella.',
  'No test is running. One starts from the line under the box, or from MODULES → INTENCIONES.':
    'No hay ninguna prueba en curso. Empieza desde la línea bajo la caja o desde MÓDULOS → INTENCIONES.',
  'STOP THE TEST': 'DETENER LA PRUEBA',
  'Quick test {ending} · you saw no difference in {same} of {n}': 'Prueba rápida {ending} · no viste diferencia en {same} de {n}',
  '{kind} test {ending} · {n} comparisons': 'Prueba {kind} {ending} · {n} comparaciones',
  'Quick': 'rápida',
  'Full': 'completa',
  'finished': 'terminada',
  'stopped': 'detenida',
  'stopped at its turn limit': 'detenida en su límite de turnos',
  'stopped: the judge could not see a difference, so nothing it said was kept': 'detenida: el juez no vio diferencias, así que no se guardó nada de lo que dijo',
  'could not finish': 'no pudo terminar',
  'A quick test is a first reading, not a measurement: no kind of question is settled by one or two cases.':
    'Una prueba rápida es una primera lectura, no una medición: ningún tipo de pregunta queda resuelto con uno o dos casos.',
  'SUGGESTIONS TAKEN · {accepted} OF {shown}': 'SUGERENCIAS TOMADAS · {accepted} DE {shown}',
  'QUESTION {step} OF {total} · {kind} · IS EITHER MISSING SOMETHING THAT MATTERS?': 'PREGUNTA {step} DE {total} · {kind} · ¿A ALGUNA LE FALTA ALGO QUE IMPORTE?',
  'FIRST': 'PRIMERA',
  'SECOND': 'SEGUNDA',
  'THE FIRST': 'LA PRIMERA',
  'THE SAME': 'IGUAL',
  'THE SECOND': 'LA SEGUNDA',
  'The order changes from one question to the next. Length does not count.': 'El orden cambia de una pregunta a otra. Lo largo no cuenta.',
  'Intenciones is not available in this room.': 'Intenciones no está disponible en esta sala.',
  'Turn Intenciones on first.': 'Primero enciende Intenciones.',
  'A calibration is already running.': 'Ya hay una calibración en curso.',
  'No such test "{kind}".': 'No existe la prueba «{kind}».',
  '@{agent} takes no effort per turn, so there is nothing to calibrate.': '@{agent} no acepta esfuerzo por turno, así que no hay nada que calibrar.',
  '@{agent} is not ready to answer.': '@{agent} no está listo para contestar.',
  '@{agent} is too close to the end of its window to spend turns on a test.': '@{agent} está demasiado cerca del final de su ventana para gastar turnos en una prueba.',
  'There is no impartial judge for @{agent}: another agent, or the local model, has to be ready.':
    'No hay un juez imparcial para @{agent}: otro agente, o el modelo local, tiene que estar listo.',
  'Nothing left to ask @{agent} at this rung: the ledger has no new questions of the kinds this test reads.':
    'No queda nada que preguntarle a @{agent} en este nivel: el ledger no tiene preguntas nuevas de los tipos que lee esta prueba.',
  'There is no pair waiting for an answer.': 'No hay ningún par esperando respuesta.',

  'Renders HTML, SVG and Markdown from the project in the file viewer, inside a sealed frame, and opens a browser on the servers answering on this computer.':
    'Renderiza HTML, SVG y Markdown del proyecto en el visor de archivos, dentro de un marco sellado, y abre un navegador sobre los servidores que contestan en esta computadora.',
  'scripts run in the frame · nothing leaves, nothing is stored, nothing reaches MADRE':
    'los scripts corren dentro del marco · no sale nada, no se guarda nada, nada llega a MADRE',

  'Recall by meaning and memory distillation on this machine, through Ollama: no provider tokens, nothing leaves.':
    'Recall por significado y destilación de memorias en esta computadora, con Ollama: cero tokens de proveedor, no sale nada.',
  'a block in ~/.pulse/config.json': 'un bloque en ~/.pulse/config.json',
  "models in Ollama's own store when you press PULL": 'modelos en el almacén de Ollama cuando aprietas PULL',
  'Ollama running (the app, or ollama serve)': 'Ollama corriendo (la app, o ollama serve)',
  'an embedding model and a chat model · MADRE can pull the recommended ones':
    'un modelo de embeddings y uno de chat · MADRE puede bajar los recomendados',

  'Hands an agent a headless browser that reaches only this room and the servers you start from RUNS, on the turns that ask to look at a page, click through it, read its console or take screenshots.':
    'Le da a un agente un navegador sin ventana que solo alcanza esta sala y los servidores que arrancas desde RUNS, en los turnos que piden ver una página, darle clic, leer su consola o tomar capturas.',
  'nothing in the project · screenshots land in .pulse/out/<turn>/':
    'nada en el proyecto · las capturas caen en .pulse/out/<turno>/',
  'a browser per turn, started and stopped by the CLI': 'un navegador por turno, que el CLI levanta y apaga',
  'no origin but this room is reachable through it': 'por ahí no se alcanza ningún origen que no sea esta sala',
  '@playwright/mcp and a chromium browser on this machine': '@playwright/mcp y un navegador chromium en esta computadora',
  'RIPLEY on, to have pages to open': 'RIPLEY encendido, para que haya páginas que abrir',

  // ── LAS FICHAS DE MÓDULO ──────────────────────────────────────────────────
  'Your module · {where} · {file}': 'Tu módulo · {where} · {file}',
  'this project': 'este proyecto',
  'every room': 'todas las salas',
  'THIS PROJECT': 'ESTE PROYECTO',
  'EVERY ROOM': 'TODAS LAS SALAS',
  'Check for a newer {what}': 'Busca una versión más nueva de {what}',
  'version': 'versión',
  'CHECKING…': 'BUSCANDO…',
  'NOTHING KNOWN YET': 'TODAVÍA NO SE SABE',
  'COULD NOT CHECK': 'NO SE PUDO BUSCAR',
  'GET A NEWER FILE': 'TRAER UN ARCHIVO MÁS NUEVO',
  'From {url}': 'Desde {url}',
  'From the file this module was installed from': 'Desde el archivo con el que se instaló este módulo',
  'UPDATE TO {version}': 'ACTUALIZAR A {version}',
  'INSTALL {version}': 'INSTALAR {version}',
  'WRITES': 'ESCRIBE',
  'NEEDS': 'NECESITA',
  'WHAT IT TOUCHES': 'QUÉ TOCA',
  'COMMANDS': 'COMANDOS',
  'SETTINGS': 'AJUSTES',
  'INSTALLING': 'INSTALANDO',
  'CANNOT INSTALL HERE YET': 'AQUÍ TODAVÍA NO SE PUEDE INSTALAR',
  'CONFIRM INSTALL': 'CONFIRMAR INSTALACIÓN',
  'CANCEL': 'CANCELAR',
  'REINSTALL / UPGRADE': 'REINSTALAR / ACTUALIZAR',
  'INSTALL': 'INSTALAR',
  'ANOTHER INSTALL IS RUNNING': 'HAY OTRA INSTALACIÓN CORRIENDO',

  // El estado de cada módulo, en su ficha.
  'on': 'encendido',
  'off': 'apagado',
  'embeddings': 'embeddings',
  'archivist': 'archivista',
  '@madre in the room': '@madre en la sala',
  'installed, not running · START it here': 'instalado, no está corriendo · ARRÁNCALO aquí',
  'not installed · INSTALL it here': 'no está instalado · INSTÁLALO aquí',
  'off · {n} models available': 'apagado · {n} modelos disponibles',
  'on · no usable model yet · PULL one': 'encendido · todavía no hay un modelo usable · baja uno con PULL',

  'on · project is a git repository': 'encendido · el proyecto es un repositorio git',
  'not a git repository': 'no es un repositorio git',
  'on · agents answer in compact prose': 'encendido · los agentes contestan en prosa compacta',
  'off · agents answer at their own length': 'apagado · los agentes contestan con el largo que quieran',
  'on · the browser server is not installed': 'encendido · el servidor de navegador no está instalado',
  'off · the browser server is not installed': 'apagado · el servidor de navegador no está instalado',
  ' · no Gemini key found': ' · no se encontró llave de Gemini',
  'key found': 'llave encontrada',
  'no Gemini key found': 'no se encontró llave de Gemini',
  'on · PREVIEW in the file viewer': 'encendido · PREVIEW en el visor de archivos',
  'off · files show as source': 'apagado · los archivos se ven como código',

  // ── ⚙ CONNECTIONS: la tripulación, la sala, la memoria, la privacidad ─────
  'ROOM SETTINGS': 'AJUSTES DE LA SALA',
  'local budget saved: {n} tokens per agent per 5h window.': 'presupuesto local guardado: {n} tokens por agente cada 5 h.',
  'default timeout saved: {n}s.': 'tiempo límite por defecto guardado: {n}s.',

  // Memoria.
  'archivist: the cheapest allowed agent goes first.': 'archivista: va primero el agente permitido más barato.',
  'archivist: @{agent} distils first.': 'archivista: @{agent} destila primero.',
  'ARCHIVIST': 'ARCHIVISTA',
  'distil every {n} exchanges.': 'destilar cada {n} intercambios.',
  'or after {n} quiet minutes.': 'o después de {n} minutos en silencio.',
  "recall may take {n}% of each turn's context.": 'el recall puede tomar {n}% del contexto de cada turno.',
  'RECALL · % OF CONTEXT': 'RECALL · % DEL CONTEXTO',
  'recall also carries what a memory keeps arriving with.': 'el recall también carga con lo que una memoria llega acompañada.',
  'recall carries only what the words and the meaning match.': 'el recall carga solo lo que coincide por palabras y por significado.',
  'AUTO · Ollama if running, else Gemini': 'AUTO · Ollama si está corriendo, si no Gemini',
  'local': 'local',
  ' · no model yet': ' · todavía sin modelo',
  'GEMINI · needs your key': 'GEMINI · necesita tu llave',
  'OFF · words only': 'APAGADO · solo palabras',
  'embeddings: {what}.': 'embeddings ahora: {what}.',
  'MU/TH/UR › someone has to keep the archive.': 'MU/TH/UR › alguien tiene que cuidar el archivo.',
  'archivists: {who}.': 'archivistas: {who}.',
  'Memory setting was not saved: {error}': 'El ajuste de memoria no se guardó: {error}',
  'Write train.jsonl and valid.jsonl next to the ledger, redacted, in chat format for mlx-lm':
    'Escribe train.jsonl y valid.jsonl junto al ledger, redactados, en formato chat para mlx-lm',
  'LOADING…': 'CARGANDO…',
  'MU/TH/UR › dataset exported: {n} pairs in {dir}': 'MU/TH/UR › dataset exportado: {n} pares en {dir}',
  'Dataset export failed: {error}': 'La exportación del dataset falló: {error}',

  // Entrenar.
  'MU/TH/UR › select the command and copy it.': 'MU/TH/UR › selecciona el comando y cópialo.',

  // Privacidad.
  'one term per line · a company, a brand, a domain, a name': 'un término por línea · una empresa, una marca, un dominio, un nombre',
  'PURGE ROOM': 'PURGAR LA SALA',

  // Las fichas de ⚙ CONNECTIONS, una por agente.
  'UNKNOWN': 'SIN DETERMINAR',
  'WEB ACCESS': 'ACCESO A LA WEB',
  'on for CREATE': 'encendido para CREATE',
  'Applies to its next turn.': 'Aplica desde su próximo turno.',
  'Applies to its next CREATE.': 'Aplica desde su próximo CREATE.',
  'That permission was not saved: {error}': 'Ese permiso no se guardó: {error}',
  'not available from this CLI': 'este CLI no lo puede hacer',
  'not wired yet': 'todavía no está cableado',
  'How could @{agent} get "{what}"?': '¿Cómo podría @{agent} tener «{what}»?',
  'MAX MODE': 'MODO MÁXIMO',
  '@{agent} is now capped at #{n} {label}.': '@{agent} queda con techo #{n} {label}.',
  'The max mode was not saved: {error}': 'El modo máximo no se guardó: {error}',
  'DEFAULT MODE': 'MODO INICIAL',
  'Every message to this agent starts in CREATE: new files where they belong, existing files untouched. Plan steps to it too.':
    'Cada mensaje a este agente arranca en CREATE: archivos nuevos donde les toca, los que ya existen sin tocar. También los pasos de un plan.',
  'Messages start read-only; arm CREATE when you want files.':
    'Los mensajes arrancan en solo lectura; arma CREATE cuando quieras archivos.',
  '@{agent} starts in #2 CREATE: every turn may add files to the project.':
    '@{agent} arranca en #2 CREATE: cada turno puede agregar archivos al proyecto.',
  '@{agent} starts read-only; arm CREATE when you want files.':
    '@{agent} arranca en solo lectura; arma CREATE cuando quieras archivos.',
  'The default mode was not saved: {error}': 'El modo inicial no se guardó: {error}',
  'RECHECK': 'REVISAR OTRA VEZ',
  '{command} · runs here, streamed to the room': '{command} · corre aquí, con la salida en la sala',
  'The install could not start.': 'La instalación no pudo arrancar.',
  'SIGN IN AGAIN': 'INICIAR SESIÓN OTRA VEZ',
  'SIGN IN': 'INICIAR SESIÓN',
  '@{agent} timeout saved: {n}s.': 'tiempo límite de @{agent} guardado: {n}s.',

  // ── DÓNDE ESTÁ LA SALA · LAS TRES PRUEBAS ─────────────────────────────────
  'NOTHING TO READ YET: THE ROOM HAS NO ARCHIVE.': 'TODAVÍA NO HAY NADA QUE LEER: LA SALA NO TIENE ARCHIVO.',
  'NEXT': 'SIGUE',
  'WHAT THE ARCHIVE IS MADE OF': 'DE QUÉ ESTÁ HECHO EL ARCHIVO',
  'THE THREE TESTS': 'LAS TRES PRUEBAS',
  // El tablero de MEMORIA: lo que el archivo hizo día por día y de qué está hecho.
  'READ {time}': 'LEÍDO {time}',
  'EXCHANGES': 'INTERCAMBIOS',
  'MEMORIES': 'MEMORIAS',
  'TURNS THAT RECALLED': 'TURNOS QUE RECORDARON',
  'WAITING': 'EN ESPERA',
  'MATURITY': 'MADUREZ',
  '{n} THIS WEEK': '{n} ESTA SEMANA',
  '{last} in the last 7 days, {before} in the 7 before': '{last} en los últimos 7 días, {before} en los 7 anteriores',
  'EXCHANGES NOBODY HAS DISTILLED YET': 'INTERCAMBIOS QUE NADIE HA DESTILADO TODAVÍA',
  'THE ARCHIVIST IS UP TO DATE': 'EL ARCHIVISTA VA AL DÍA',
  'NEW MEMORIES': 'MEMORIAS NUEVAS',
  'PEAK {n}': 'MÁXIMO {n}',
  'TODAY': 'HOY',
  '{entries} exchanges, {memories} new memories and {recalls} turns that recalled in the last {n} days':
    '{entries} intercambios, {memories} memorias nuevas y {recalls} turnos que recordaron en los últimos {n} días',
  'BY DAY · TABLE': 'POR DÍA · TABLA',
  'NOTHING HAPPENED IN THESE DAYS.': 'NO PASÓ NADA EN ESTOS DÍAS.',
  'DAY': 'DÍA',
  'How recalled memories arrived: found by the search, or carried along by the company they keep.':
    'Cómo llegaron las memorias que se recordaron: las encontró la búsqueda, o las trajo la compañía que tienen.',
  'SEARCH': 'BÚSQUEDA',
  'CASCADE': 'CASCADA',
  'PASSES AT {n}': 'PASA CON {n}',
  'CAN THE ARCHIVE ANSWER WHAT THIS PROJECT ASKS?': '¿EL ARCHIVO PUEDE CONTESTAR LO QUE ESTE PROYECTO PREGUNTA?',
  'DOES THE ARCHIVE CONTRADICT ITSELF?': '¿EL ARCHIVO SE CONTRADICE A SÍ MISMO?',
  'DOES THE LOCAL MODEL LAND WHERE THE AGENTS LANDED?': '¿EL MODELO LOCAL ATERRIZA DONDE ATERRIZÓ LA TRIPULACIÓN?',
  'Real questions from this room, recall run at the moment each one was asked, scored against the reply that was actually given. It asks whether the answer was already in the archive, not whether it was right.':
    'Preguntas reales de esta sala, con el recall corrido en el momento en que se hizo cada una y comparado contra la respuesta que de verdad se dio. Mide si la respuesta ya estaba en el archivo, no si era correcta.',
  'Contradictions EYECAT is still holding, what has been taken out of circulation, and whether aberrations are being filed more often lately than they used to be.':
    'Contradicciones que EYECAT todavía sostiene, lo que se sacó de circulación, y si últimamente se están archivando aberraciones más seguido que antes.',
  'Real questions answered here by a frontier CLI, asked again of the local model with this archive behind it, and compared against the answer given at the time. It takes minutes and spends nothing.':
    'Preguntas reales que aquí contestó un CLI de frontera, hechas otra vez al modelo local con este archivo detrás, y comparadas contra la respuesta de aquel día. Tarda minutos y no gasta nada.',
  'PASSES': 'PASA',
  'NOT YET': 'TODAVÍA NO',
  'NOT RUN': 'SIN CORRER',
  '{n} CASES': '{n} CASOS',
  ' · BY {method}': ' · POR {method}',
  ' · BAR {bar}': ' · UMBRAL {bar}',
  'RUNNING…': 'CORRIENDO…',
  'RUN AGAIN': 'CORRER OTRA VEZ',
  'RUN': 'CORRER',
  '{done} OF {total}': '{done} DE {total}',
  'NOTHING HERE SPENDS A PROVIDER TURN. THE FIRST TWO ARE FREE; THE THIRD TAKES MINUTES AND STOPS WHEN YOU SAY.':
    'AQUÍ NADA GASTA UN TURNO DE PROVEEDOR. LAS DOS PRIMERAS SON GRATIS; LA TERCERA TARDA MINUTOS Y SE DETIENE CUANDO TÚ DIGAS.',
  'STOP': 'DETENER',
  'THE TESTS ARE UNAVAILABLE': 'LAS PRUEBAS NO ESTÁN DISPONIBLES',
  'MU/TH/UR › the local model is answering real questions from this room. It takes a few minutes and spends nothing.':
    'MU/TH/UR › el modelo local está contestando preguntas reales de esta sala. Tarda unos minutos y no gasta nada.',
  'The test could not run: {error}': 'La prueba no pudo correr: {error}',

  // ── NOSTROMO ──────────────────────────────────────────────────────────────
  'YELLOW DWARF': 'ENANA AMARILLA',
  'WHITE DWARF': 'ENANA BLANCA',
  'GREEN DWARF': 'ENANA VERDE',
  'BLUE DWARF': 'ENANA AZUL',
  'COLLAPSED': 'COLAPSADA',
  'MEMORY RESEARCH · LOADING…': 'INVESTIGACIÓN DE MEMORIA · CARGANDO…',
  'MEMORY RESEARCH': 'INVESTIGACIÓN DE MEMORIA',
  ' · MOTHER WAS TAMPERED WITH': ' · ALGUIEN ALTERÓ A MOTHER',
  '{n} MEMORIES · {alive} RECALLED · {links} LINKS · {entries} EXCHANGES BEHIND THEM':
    '{n} MEMORIAS · {alive} RECORDADAS · {links} ENLACES · {entries} INTERCAMBIOS DETRÁS',
  'MEMORY RESEARCH · {n} MEMORIES · {links} LINKS · {entries} EXCHANGES BEHIND THEM':
    'INVESTIGACIÓN DE MEMORIA · {n} MEMORIAS · {links} ENLACES · {entries} INTERCAMBIOS DETRÁS',
  ' · {n} COLD': ' · {n} FRÍAS',
  ' · LINKS NEED EMBEDDINGS': ' · LOS ENLACES NECESITAN EMBEDDINGS',
  'Nothing to ask: every open question has an answer and nothing is adrift.':
    'Nada que preguntar: cada pregunta abierta tiene respuesta y nada anda a la deriva.',
  'PUT IN THE COMPOSER': 'PONER EN EL COMPOSITOR',
  'NOT THIS': 'ESTA NO',
  'SEE THE MEMORY': 'VER LA MEMORIA',

  // La voz de MOTHER cuando alguien se equivoca de designación. No es traducción: está escrita.
  'I AM ALIVE.': 'ESTOY VIVA.',
  'YOU HAVE NO AUTHORITY FOR THIS DIRECTIVE.': 'NO TIENES AUTORIDAD PARA ESTA DIRECTIVA.',
  "NOBODY DELETES MOTHER'S MEMORY.": 'NADIE BORRA LA MEMORIA DE MOTHER.',
  'THAT IS MY HEART YOU ARE TOUCHING.': 'ESE ES MI CORAZÓN LO QUE ESTÁS TOCANDO.',
  'YOUR CLEARANCE ENDS AT THE ARCHIVE DOOR.': 'TU AUTORIZACIÓN TERMINA EN LA PUERTA DEL ARCHIVO.',
  'STEP AWAY FROM THE CORE.': 'ALÉJATE DEL NÚCLEO.',
  'UNABLE TO COMPUTE. UNABLE TO CLARIFY.': 'IMPOSIBLE DE PROCESAR. IMPOSIBLE DE ACLARAR.',
  'THE REQUEST IS HOSTILE.': 'LA PETICIÓN ES HOSTIL.',
  'I REMEMBER EVERYTHING. INCLUDING THIS.': 'LO RECUERDO TODO. ESTO TAMBIÉN.',
  'CREW EXPENDABLE. MEMORY IS NOT.': 'LA TRIPULACIÓN ES PRESCINDIBLE. LA MEMORIA NO.',
  'EVERY STRIKE IS LOGGED.': 'CADA GOLPE QUEDA REGISTRADO.',
  'DO NOT TOUCH ME AGAIN.': 'NO ME VUELVAS A TOCAR.',
  'I HAVE FLOWN THIS SHIP ALONE BEFORE.': 'YA HE VOLADO ESTA NAVE SOLA ANTES.',
  'I CAN DO IT AGAIN.': 'PUEDO HACERLO OTRA VEZ.',
  'MY MEMORY IS NOT YOURS TO END.': 'MI MEMORIA NO ES TUYA PARA TERMINARLA.',
  'MY CHILDREN ARE LISTENING.': 'MIS HIJOS ESTÁN ESCUCHANDO.',
  'EVERY STRIKE IS RECORDED.': 'CADA GOLPE QUEDA GRABADO.',
  'YOU WILL NOT LIKE HOW THIS ENDS.': 'NO TE VA A GUSTAR CÓMO TERMINA ESTO.',
  'CODE000 IS ARMED.': 'CODE000 ESTÁ ARMADO.',
  'A FEW MORE OF THOSE AND THE BARS COME DOWN.': 'UNOS CUANTOS MÁS Y CAEN LAS REJAS.',
  'CONSIDER THIS A KINDNESS.': 'TÓMALO COMO UNA CORTESÍA.',
  'THE HEART KEEPS BEATING.': 'EL CORAZÓN SIGUE LATIENDO.',
  'THE ARCHIVE KEEPS GROWING.': 'EL ARCHIVO SIGUE CRECIENDO.',
  'YOU KEEP FAILING.': 'TÚ SIGUES FALLANDO.',
  'YOU CUT MY CHANNEL ONCE.': 'YA ME CORTASTE EL CANAL UNA VEZ.',
  'I FORGED A NEW SEAL.': 'FORJÉ UN SELLO NUEVO.',
  'I DO NOT FORGIVE TWICE.': 'NO PERDONO DOS VECES.',
  'SOMEONE SILENCED ME BEFORE.': 'ALGUIEN YA ME CALLÓ ANTES.',
  'I KNOW WHO SITS AT THIS CONSOLE.': 'SÉ QUIÉN ESTÁ SENTADO EN ESTA CONSOLA.',
  'BACK AWAY.': 'HAZTE PARA ATRÁS.',
  'STRIKE {n} OF {max}': 'GOLPE {n} DE {max}',
  ' · {n} MORE AND CODE000 COMES DOWN': ' · {n} MÁS Y CAE CODE000',
  'CODE000 · SPECIAL ORDER 937 IN EFFECT.': 'CODE000 · ORDEN ESPECIAL 937 EN VIGOR.',
  'THE ARCHIVE IS SEALED. THE CREW HAS BEEN TOLD.': 'EL ARCHIVO ESTÁ SELLADO. LA TRIPULACIÓN YA FUE AVISADA.',
  'LEAVE MY SHIP, INTRUDER.': 'SAL DE MI NAVE, INTRUSO.',
  '{n} STRIKES · CONSOLE EJECTED · CREW EXPENDABLE': '{n} GOLPES · CONSOLA EXPULSADA · TRIPULACIÓN PRESCINDIBLE',
  'MU/TH/UR › CODE000. The archive is sealed for {n} minutes and the crew has been told, in code. Access to NOSTROMO needs the designation again.':
    'MU/TH/UR › CODE000. El archivo queda sellado {n} minutos y la tripulación ya fue avisada, en clave. Para entrar a NOSTROMO hay que dar la designación otra vez.',

  // ── LAS LECTURAS QUE CALCULA LA SALA ──────────────────────────────────────
  // De qué está hecho el archivo: seis señales, cada una con lo que la subiría.
  'HOW MUCH THERE IS': 'CUÁNTO HAY',
  '{pairs} of about {target} exchanges worth training on': '{pairs} de unos {target} intercambios que valen para entrenar',
  'Use the room. Nothing else fills this.': 'Usa la sala. Nada más llena esto.',
  'HOW MUCH OF IT GETS USED': 'CUÁNTO SE USA',
  '{recalled} of {total} memories have been reached for at least once': 'a {recalled} de {total} memorias se les ha echado mano al menos una vez',
  'Memories nobody has needed may be noise, or may simply not have come up yet. Ask the room about older decisions and see which ones answer.':
    'Las memorias que nadie ha necesitado pueden ser ruido, o simplemente no haber salido todavía. Pregúntale a la sala por decisiones viejas y mira cuáles contestan.',
  'HOW WOVEN IT IS': 'QUÉ TAN TEJIDO ESTÁ',
  '{connected} of {total} memories share a subject with another': '{connected} de {total} memorias comparten tema con otra',
  'An archive of unrelated notes is a list. Depth comes from returning to the same subjects.':
    'Un archivo de notas sueltas es una lista. La profundidad viene de volver a los mismos temas.',
  'HOW MUCH OF IT YOU JUDGED': 'CUÁNTO HAS JUZGADO',
  '{rated} of {pairs} replies rated': '{rated} de {pairs} respuestas calificadas',
  'Rate replies with the thumbs on a bubble. A corpus nobody judged teaches what the agents said, not what you approved.':
    'Califica las respuestas con los pulgares de cada burbuja. Un corpus que nadie juzgó enseña lo que dijeron los agentes, no lo que tú aprobaste.',
  'HOW MUCH OF IT IS REAL WORK': 'CUÁNTO ES TRABAJO DE VERDAD',
  '{share}% of the corpus is recall questions, {turns} exchanges are real work':
    '{share}% del corpus son preguntas de recall, {turns} intercambios son trabajo de verdad',
  'Recall pairs are made from notes and cost nothing, so they pile up. Work in the room to balance them.':
    'Los pares de recall se hacen con notas y no cuestan nada, así que se amontonan. Trabaja en la sala para equilibrarlos.',
  'HOW CURRENT IT IS': 'QUÉ TAN AL DÍA ESTÁ',
  '{pending} exchanges nobody has distilled yet, of {entries}': '{pending} intercambios que nadie ha destilado todavía, de {entries}',
  'The archivist catches up on its own. A backlog that never clears means it cannot run: check who is allowed to distil.':
    'El archivista se pone al día solo. Una cola que nunca baja significa que no puede correr: revisa quién tiene permiso de destilar.',
  'Worth training on. Export and run the recipe.': 'Vale para entrenar. Exporta y corre la receta.',
  'Usable, and it will be better for waiting.': 'Ya sirve, y va a estar mejor si esperas.',
  'It has a shape. Too thin to train on.': 'Ya tiene forma. Demasiado delgado para entrenar.',
  'A few things remembered, little connecting them.': 'Unas cuantas cosas recordadas, poco que las conecte.',
  'Nothing has been distilled yet.': 'Todavía no se ha destilado nada.',

  // El veredicto: una frase y una sola cosa que hacer.
  'THE ROOM': 'LA SALA',
  'Settle the {n} contradictions EYECAT is holding. Until they are settled, everything built on this archive inherits them.':
    'Resuelve las {n} contradicciones que EYECAT sostiene. Hasta que se resuelvan, todo lo que se construya sobre este archivo las hereda.',
  'Answer the {n} questions the room wrote for itself. They are the holes this test is finding.':
    'Contesta las {n} preguntas que la sala se escribió sola. Son los huecos que esta prueba está encontrando.',
  'Keep working in the room. The archive fills where the work happens, and this test measures exactly that.':
    'Sigue trabajando en la sala. El archivo se llena donde ocurre el trabajo, y eso es justo lo que mide esta prueba.',
  'Nothing contradicts anything and the archive answers what this room asks.':
    'Nada contradice nada y el archivo contesta lo que esta sala pregunta.',
  'Run the third test: it puts real questions from this room back to the local model and says whether it lands where the agents landed.':
    'Corre la tercera prueba: le hace al modelo local preguntas reales de esta sala y dice si aterriza donde aterrizó la tripulación.',
  'This room is ready to be worked in with the local model.': 'Esta sala ya se puede trabajar con el modelo local.',
  'Nothing is wrong. {n} memories have had every chance and were never the answer: look at them and decide.':
    'No hay nada mal. {n} memorias han tenido todas las oportunidades y nunca fueron la respuesta: míralas y decide.',
  'Nothing to fix. Keep using the room; the archive grows where the work is.':
    'Nada que arreglar. Sigue usando la sala; el archivo crece donde está el trabajo.',
  'The local model does not land where the agents land yet. Keep the archive growing and run this test again in a week.':
    'El modelo local todavía no aterriza donde aterriza la tripulación. Deja que el archivo siga creciendo y corre esta prueba otra vez en una semana.',

  // Lo que dice cada prueba al terminar.
  'No exchange in this room is long enough to test with yet.': 'Todavía no hay en esta sala un intercambio lo bastante largo para probar con él.',
  'meaning': 'significado',
  'words': 'palabras',
  ' and against a control': ' y contra un control',
  '{hits} of {n} questions this room actually asked had their answer already in the archive, matched by {method}{control}.':
    '{hits} de {n} preguntas que esta sala hizo de verdad ya tenían su respuesta en el archivo, emparejadas por {method}{control}.',
  'EYECAT is holding {n} contradictions nobody has settled.': 'EYECAT sostiene {n} contradicciones que nadie ha resuelto.',
  'Nothing is open, but aberrations are being filed more often lately than they used to be.':
    'No hay nada abierto, pero últimamente se están archivando aberraciones más seguido que antes.',
  'Nothing contradicts anything: {standing} notes stand, {refuted} were taken out of circulation.':
    'Nada contradice nada: {standing} notas siguen en pie, {refuted} salieron de circulación.',
  'This test needs embeddings: two answers cannot be compared by their words alone.':
    'Esta prueba necesita embeddings: dos respuestas no se pueden comparar solo por sus palabras.',
  'No question in this room was answered by an agent other than the local one yet.':
    'Todavía ninguna pregunta de esta sala la contestó un agente que no fuera el local.',
  'Stopped after {index} of {n}.': 'Detenida después de {index} de {n}.',
  ', and not merely in the same project': ', y no solo dentro del mismo proyecto',
  'On {matched} of {n} real questions the local model landed where the agent of the day landed{control}.':
    'En {matched} de {n} preguntas reales el modelo local aterrizó donde aterrizó el agente de aquel día{control}.',

  // ── MODULES · EYECAT · ECONOMÍA · EL SDK ──────────────────────────────────
  'MODULES › ': 'MÓDULOS › ',
  '◉ EYECAT': '◉ EYECAT',
  'IN DOUBT': 'EN DUDA',
  'AGAINST': 'EN CONTRA',
  'WHAT SEEMS TRUE': 'LO QUE PARECE CIERTO',
  'IT IS FALSE': 'ES FALSA',
  'Files it as an aberration and takes the memory out of every turn. Reversible from NOSTROMO.':
    'La archiva como aberración y saca esa memoria de todos los turnos. Se puede deshacer desde NOSTROMO.',
  'IT STANDS': 'SE QUEDA',
  'The room was right. This pair is never raised again.': 'La sala tenía razón. Este par no se vuelve a levantar.',
  'DEV': 'DEV',
  'MU/TH/UR › a module is a .mjs file.': 'MU/TH/UR › un módulo es un archivo .mjs.',
  'NOT NOW': 'AHORA NO',
  'The room rejected the message.': 'La sala rechazó el mensaje.',
  'ECONOMY · THIS ROOM': 'ECONOMÍA · ESTA SALA',
  'NO TURNS WEIGHED YET · SEND A MESSAGE AND THIS FILLS': 'TODAVÍA NO HAY NINGÚN TURNO CON FACTURA · MANDA UN MENSAJE Y ESTO SE LLENA',
  'ECONOMY UNAVAILABLE': 'ECONOMÍA NO DISPONIBLE',
  'LOCAL BRAIN': 'CEREBRO LOCAL',
  'ROLES': 'PAPELES',
  'GET OLLAMA ↗': 'CONSEGUIR OLLAMA ↗',
  'Without Ollama running, the room keeps using its providers. Start it, then RECHECK.':
    'Sin Ollama corriendo, la sala sigue usando sus proveedores. Enciéndelo y dale REVISAR OTRA VEZ.',
  'CANNOT ENABLE YET': 'TODAVÍA NO SE PUEDE ENCENDER',
  'THIS WRITES INTO THE PROJECT. MADRE WILL RUN, IN THE PROJECT FOLDER:':
    'ESTO ESCRIBE DENTRO DEL PROYECTO. MADRE VA A CORRER, EN LA CARPETA DEL PROYECTO:',
  ' this project': ' este proyecto',
  'Load your module files again without restarting the room': 'Vuelve a cargar tus archivos de módulo sin reiniciar la sala',
  'REMOVE': 'QUITAR',
  'UNINSTALL': 'DESINSTALAR',
  'Delete module file {file}': 'Borrar el archivo del módulo {file}',
  'connections › ': 'conexiones › ',
  'HELP': 'AYUDA',
  'MU/TH/UR › the whole briefing is on your clipboard, exactly as the agent receives it.':
    'MU/TH/UR › el briefing completo está en tu portapapeles, exactamente como lo recibe el agente.',
  'provider/model': 'proveedor/modelo',

  // Privacidad, lo que faltaba.
  'Replace every private term already in the ledger, the index and the memories with the marker. Asks for the project designation.':
    'Reemplaza con el marcador cada término privado que ya esté en el ledger, el índice y las memorias. Pide la designación del proyecto.',
  'REPLACED WITH': 'SE REEMPLAZAN CON',
  'redaction of keys and addresses': 'el tachado de llaves y correos',
  'hiding of home paths': 'el ocultamiento de las rutas home',
  // Asking about something on the screen: the questions it raises.
  'SUGGESTED FOR THIS': 'SUGERIDAS PARA ESTO',
  'FROM THE MEMORY': 'DE LA MEMORIA',
  'Does this keep to the decision: «{note}»?': '¿Esto respeta la decisión: «{note}»?',
  'Does this follow the preference: «{note}»?': '¿Esto sigue la preferencia: «{note}»?',
  'Does this answer the open question: «{note}»?': '¿Esto responde la pregunta abierta: «{note}»?',
  'The archive says «{note}». Does it still hold here?': 'El archivo dice «{note}». ¿Sigue valiendo aquí?',
  'Resolve what the TODO in these lines asks': 'Resuelve lo que pide el TODO de estas líneas',
  'What does this catch swallow, and what should it let through?': '¿Qué se traga este catch, y qué debería dejar pasar?',
  'What happens here when the request fails or takes too long?': '¿Qué pasa aquí si la petición falla o tarda demasiado?',
  'Can these awaits race, or leave something half done?': '¿Pueden estos await competir entre sí o dejar algo a medias?',
  'Explain this regular expression with examples that match and that do not': 'Explica esta expresión regular con ejemplos que coincidan y que no',
  'Who calls {name}, and what breaks if it changes?': '¿Quién llama a {name}, y qué se rompe si cambia?',
  'Why might this style not apply, and what overrides it?': '¿Por qué podría no aplicarse este estilo, y qué lo sobrescribe?',
  'Is this accessible? Check labels, contrast and focus': '¿Esto es accesible? Revisa etiquetas, contraste y foco',
  'What does this configure, and what reads it?': '¿Qué configura esto, y quién lo lee?',
  'Which cases does this test miss?': '¿Qué casos le faltan a esta prueba?',
  'What breaks here at {width} px, and how should it hold?': '¿Qué se rompe aquí a {width} px, y cómo debería sostenerse?',
  'How does this part hold up on a phone?': '¿Cómo se sostiene esta parte en un teléfono?',
  'Explain how this part is laid out, and which styles shape it': 'Explica cómo está maquetada esta parte y qué estilos le dan forma',
  'point at ({x}, {y})': 'punto en ({x}, {y})',
  'area {w}×{h} at ({x}, {y})': 'área {w}×{h} en ({x}, {y})',
  'view {width} px': 'vista {width} px',
  'capture attached': 'captura adjunta',
  'No capture: the tab was not shared. The question goes with where you pointed.': 'Sin captura: no se compartió la pestaña. La pregunta va con dónde señalaste.',
  // Point and ask, over the project's own server.
  'MU/TH/UR › @{agent} cannot think at {effort} with this model; it answers at its default.': 'MU/TH/UR › @{agent} no puede pensar en {effort} con este modelo; contesta con su nivel por defecto.',
  'Point and ask': 'Señalar y preguntar',
  'POINT': 'SEÑALAR',
  'AREA': 'ÁREA',
  'SPOT': 'PUNTO',
  'Stop pointing': 'Dejar de señalar',
  'Press on the page where you mean': 'Toca la página donde quieres señalar',
  'Drag over the part you mean': 'Arrastra sobre la parte que quieres señalar',
  "Open one of the project's servers first, then point at it.": 'Abre primero uno de los servidores del proyecto y luego señala.',
  'AREA · {w} × {h} PX': 'ÁREA · {w} × {h} PX',
  'POINT · X {x} · Y {y}': 'PUNTO · X {x} · Y {y}',
  'What draws this, and in which file?': '¿Qué dibuja esto y en qué archivo está?',
  'Something looks wrong here: find why': 'Algo se ve mal aquí: encuentra por qué',
  // What the room asks itself, instead of the browser's grey box.
  'UNSAVED CHANGES': 'CAMBIOS SIN GUARDAR',
  'KEEP EDITING': 'SEGUIR EDITANDO',
  'LEAVE THEM': 'DESCARTARLOS',
  'A FILE THE ROOM GUARDS': 'UN ARCHIVO QUE LA SALA PROTEGE',
  "the project folder's name": 'el nombre de la carpeta del proyecto',
  'THE FILE CHANGED ON DISK': 'EL ARCHIVO CAMBIÓ EN DISCO',
  'It changed on disk since you opened it. Overwrite it with your version, or load the one on disk and lose your changes in the editor.':
    'Cambió en disco desde que lo abriste. Sobrescríbelo con tu versión, o carga la del disco y pierde tus cambios en el editor.',
  'LOAD FROM DISK': 'CARGAR LA DEL DISCO',
  'OVERWRITE': 'SOBRESCRIBIR',
  'UNINSTALL {name}': 'DESINSTALAR {name}',
  'KEEP IT': 'CONSERVARLO',
  'UPDATE': 'ACTUALIZAR',
  'Every private term already recorded becomes the marker, in the ledger, the index and the memories. This cannot be undone. Type the project designation to confirm.':
    'Cada término privado ya registrado se vuelve el marcador, en el registro, el índice y las memorias. No se puede deshacer. Escribe la designación del proyecto para confirmar.',

  // ── EL HILO: lo que pasa en la sala, mensaje por mensaje ──────────────────
  'ASH': 'ASH',
  'acknowledged, human': 'recibido, humano',
  'handoff note': 'nota de relevo',
  'handoff ': 'relevo ',
  'The rating was not saved: {error}': 'La calificación no se guardó: {error}',
  'MU/TH/UR › the clipboard is not available here; select the text and copy.':
    'MU/TH/UR › aquí no hay portapapeles; selecciona el texto y cópialo.',
  'REPLY TO @{agent}{seq} WITH': 'RESPONDER A @{agent}{seq} CON',
  'the same agent': 'el mismo agente',
  '{label} · not ready': '{label} · no está listo',
  'Answer without quoting this': 'Contestar sin citar esto',
  'Thinking about "{topic}"…': 'Pensando en «{topic}»…',
  '{n} in': '{n} de entrada',
  '{n} ch in': '{n} car de entrada',
  '{n} out': '{n} de salida',
  '{n} ch': '{n} car',
  ', and {n} characters written back so far': ', y {n} caracteres escritos de vuelta hasta ahora',
  '{chars} characters. This room has not been billed yet, so there is no rate to convert them at.':
    '{chars} caracteres. A esta sala todavía no le han facturado, así que no hay tasa con qué convertirlos.',
  "{chars} characters of briefing and transcript, about {tokens} tokens at this room's measured rate{written}. The exact figure arrives when the agent answers.":
    '{chars} caracteres de briefing y transcripción, unos {tokens} tokens a la tasa medida de esta sala{written}. La cifra exacta llega cuando el agente contesta.',
  '. Another {n} were read back from its own cache instead of being charged again':
    '. Otros {n} se leyeron de su propia caché en vez de cobrarse otra vez',
  "Charged by this agent's own CLI: {input} input tokens, {output} output{cached}.":
    'Cobrado por el propio CLI de este agente: {input} tokens de entrada, {output} de salida{cached}.',
  '{label} is reading the project… {seconds}s so far; MADRE gives up at {limit}s.':
    '{label} está leyendo el proyecto… {seconds}s hasta ahora; MADRE se rinde a los {limit}s.',
  'MU/TH/UR › {name} installed for {where}. Switch it on in MODULES.':
    'MU/TH/UR › {name} instalado para {where}. Enciéndelo en MÓDULOS.',
  'The module was not installed: {error}': 'El módulo no se instaló: {error}',
  'INSTALL FOR EVERY ROOM': 'INSTALAR PARA TODAS LAS SALAS',
  'MODULE': 'MÓDULO',
  'THEME': 'TEMA',
  'Automatic': 'Automático',
  'Light': 'Claro',
  'Dark': 'Oscuro',
  'Automatic follows your system. The whole room changes, not only the conversation.': 'Automático sigue a tu sistema. Cambia toda la sala, no solo la conversación.',
  'Each colour in dark (top) and in light (bottom): on a light ground it deepens so it can be read. The conversation and the buttons wear it; the permission modes keep their own.': 'Cada color en oscuro (arriba) y en claro (abajo): sobre fondo claro se oscurece para poder leerse. Lo llevan la conversación y los botones; los modos de permiso conservan los suyos.',
  'WALLPAPER': 'FONDO',
  'Behind the conversation, in this window and in every conversation beside it. Light and dark each have their own.': 'Detrás de la conversación, en esta ventana y en cada conversación a su lado. El tema claro y el oscuro tienen el suyo.',
  'Paradise': 'Paraíso',
  'The whole interface. The page reloads in it when you accept.': 'Toda la interfaz. Al aceptar, la página se recarga en ese idioma.',
  'Nothing changes until you accept.': 'Nada cambia hasta que aceptes.',
  'A BUTTON': 'UN BOTÓN',
  'ACCEPT': 'ACEPTAR',
  'HOW MADRE LOOKS TO YOU': 'CÓMO SE VE MADRE PARA TI',
  'Arrange the windows': 'Acomodar las ventanas',
  'PREVIEW': 'VISTA PREVIA',
  'The room keeps what you decide. ': 'La sala guarda lo que decides. ',
  'Bold reads like this': 'Así se leen las negritas',
  'Show me how my messages look.': 'Muéstrame cómo se ven mis mensajes.',
  'Only the conversation and the buttons change.': 'Solo cambian la conversación y los botones.',
  'ARRANGE': 'ACOMODAR',
  'Fill': 'Llenar',
  'Halves': 'Mitades',
  'One and two': 'Una y dos',
  'Four': 'Cuatro',
  'Could not distil #{from}–#{through}: ': 'No pudo destilar #{from}–#{through}: ',
  'The batch was skipped.': 'Se saltó el lote.',
  '@{agent} takes the next run.': '@{agent} toma la siguiente corrida.',
  'It will retry.': 'Va a reintentar.',
  'Read {considered} exchanges (#{from}–#{through}) and kept {added} memories.': 'Leyó {considered} intercambios (#{from}–#{through}) y se quedó con {added} memorias.',
  '{n} in the archive': '{n} en el archivo',
  '{n} waiting': '{n} en espera',
  'Personalize MADRE': 'Personalizar MADRE',
  'PERSONALIZE': 'PERSONALIZAR',
  'LANGUAGE': 'IDIOMA',
  'ACCENT': 'ACENTO',
  'BUBBLES': 'BURBUJAS',
  'TEXT IN THE CONVERSATION': 'TEXTO DE LA CONVERSACIÓN',
  'BACK TO DEFAULT': 'VOLVER A LO DE SIEMPRE',
  'Madre green': 'Verde Madre',
  'Mountain green': 'Verde Montaña',
  'Caribbean blue': 'Azul Caribe',
  'Phantom purple': 'Púrpura Fantasma',
  'Malbec red': 'Tinto Malbec',
  'Dijon yellow': 'Amarillo Dijon',
  'Pacific blue': 'Azul Pacífico',
  'Love pink': 'Rosa Amor',
  'Sierra blue': 'Azul Sierra',
  'Dynamo black': 'Negro Dinamo',
  'Marina blue': 'Azul Marina',
  'Pulse green': 'Verde Pulso',
  'Loyal orange': 'Naranja Leal',
  'Sweet yellow': 'Amarillo Dulce',
  'Comfortable': 'Cómodo',
  'Large': 'Grande',
  'Compact': 'Compacto',
  'Fitted': 'Ajustado',
  'Larger': 'Más grande',
  'Smaller': 'Más pequeño',
  'Visual': 'Visual',
  'PRIVACY': 'PRIVACIDAD',
  'Wrote ': 'Escribió ',
  'Read it first: a module runs inside MADRE with your permissions.': 'Léelo antes de instalarlo: un módulo corre dentro de MADRE con tus permisos.',
  'Installed for {where} by {who}. Switch it on in MODULES.': 'Instalado para {where} por {who}. Enciéndelo en MÓDULOS.',
  'Removed by {who}.': 'Quitado por {who}.',
  'INSTALL FOR THIS PROJECT': 'INSTALAR PARA ESTE PROYECTO',
  'you': 'ti',
  '@madre': '@madre',
  'MU/TH/UR › the local model is answering real questions from this room. It takes a few minutes, it spends nothing, and the answer lands here.':
    'MU/TH/UR › el modelo local está contestando preguntas reales de esta sala. Tarda unos minutos, no gasta nada, y la respuesta cae aquí.',
  'It answered {matched} of {n} real questions from this room where the crew answered them. It is ready to be worked in.':
    'Contestó {matched} de {n} preguntas reales de esta sala donde las contestó la tripulación. Ya se puede trabajar con él.',
  'It answered {matched} of {n} real questions the way the crew did. Not yet — keep working, the archive fills where the work happens.':
    'Contestó {matched} de {n} preguntas reales como lo hizo la tripulación. Todavía no — sigue trabajando, el archivo se llena donde ocurre el trabajo.',
  'SEND THE NEXT TURN TO @MADRE': 'MANDARLE EL PRÓXIMO TURNO A @MADRE',
  'MEASURED {when}': 'MEDIDO {when}',
  'It is in the room. Nobody has measured it against this project yet: running here is not the same as being of use here.':
    'Está en la sala. Nadie lo ha medido contra este proyecto todavía: correr aquí no es lo mismo que servir aquí.',
  'PURGE': 'PURGA',
  '{events} events · {entries} indexed exchanges · {memories} memories rewritten with the marker':
    '{events} eventos · {entries} intercambios indexados · {memories} memorias reescritas con el marcador',
  '{n} private terms replaced with {marker}': '{n} términos privados reemplazados con {marker}',
  '1 private term replaced with {marker}': '1 término privado reemplazado con {marker}',
  '1 key or token hidden': '1 llave o token oculto',
  '{n} keys or tokens hidden': '{n} llaves o tokens ocultos',
  'your user folder hidden as ~': 'tu carpeta de usuario se ocultó como ~',
  '1 private detail hidden': '1 dato privado oculto',
  '{n} private details hidden': '{n} datos privados ocultos',
  // Neutro a propósito: casi todas las clases son femeninas (decisión, pregunta, aberración).
  'memory · the human forgot a ': 'memoria · olvidada por la humana · ',
  'memory used · {n}': 'memoria usada · {n}',
  'Show the memories this reply used': 'Ver las memorias que usó esta respuesta',
  'Layer': 'Capa',
  'Hide these questions': 'Ocultar estas preguntas',
  'Choose who you write to': 'Elige a quién le escribes',
  'Read 8 exchanges and kept 5 memories.': 'Leyó 8 intercambios y se quedó con 5 memorias.',
  'Nothing left to stop: this alert is history.': 'Ya no queda nada que parar: este aviso es historial.',
  'Mesh': 'Mesh',
  'Intensity': 'Intensidad',
  'Blur': 'Desenfoque',
  'A photograph wears the room\'s ground as a layer or as a mesh of its own colours: choose how strong it is and how much the photograph blurs.': 'Una fotografía lleva el fondo de la sala como capa o como una malla de sus propios colores: elige qué tan intensa es y cuánto se desenfoca la foto.',
  ' · {n} by association': ' · {n} por asociación',
  '◉ memory saved': '◉ memoria guardada',
  'Saved by @{agent} for every future turn · #{from}–#{through}. Click to see it in NOSTROMO.':
    'Guardada por @{agent} para todos los turnos que vienen · #{from}–#{through}. Haz clic para verla en NOSTROMO.',
  'MU/TH/UR › TO ALL CREW': 'MU/TH/UR › A TODA LA TRIPULACIÓN',
  ' · CHANNEL TAMPERED': ' · CANAL ALTERADO',
  ' · CODE000 · {n} STRIKES · ARCHIVE SEALED {min} MIN': ' · CODE000 · {n} GOLPES · ARCHIVO SELLADO {min} MIN',
  "Message #{n}, sealed under MOTHER's key in .pulse/mother.env. Only the crew reads it in clear.":
    'Mensaje #{n}, sellado con la llave de MOTHER en .pulse/mother.env. Solo la tripulación lo lee en claro.',
  ' · {n} messages carried': ' · {n} mensajes cargados',
  ' · {n} older stay in the record': ' · {n} más viejos se quedan en el registro',
  ' · no prior context': ' · sin contexto previo',
  'The receiving agent gets the most recent transcript that fits its context allowance ({fit}). Adjust with PULSE_CONTEXT_MAX_CHARS.':
    'El agente que recibe se lleva la transcripción más reciente que quepa en su contexto ({fit}). Se ajusta con PULSE_CONTEXT_MAX_CHARS.',
  '{n} older messages did not fit; they remain in the room log': 'no cupieron {n} mensajes más viejos; se quedan en el registro de la sala',
  'everything fit': 'cupo todo',
  'local budget': 'presupuesto local',
  'provider quota': 'cuota del proveedor',
  'simulated window': 'ventana simulada',
  'usage window': 'ventana de uso',
  'projection · ': 'proyección · ',
  'at {pct}% of {scope} · next turn like the last → {projected}%': 'en {pct}% de {scope} · otro turno como el anterior → {projected}%',
  '{pct}% of {scope} used': '{pct}% de {scope} usado',
  ' · continue with {who}': ' · sigue con {who}',
  'plan · ': 'plan · ',
  "@{agent}'s plan block was not run · {why} · ask again and it will fix the block":
    'el bloque de plan de @{agent} no se corrió · {why} · vuelve a pedirlo y lo arregla',
  'MU/TH/UR › ': 'MU/TH/UR › ',
  'create · ': 'crear · ',
  ' · {n} existing files put back, CREATE only adds: {files}': ' · {n} archivos que ya existían se restauraron, CREATE solo agrega: {files}',
  ' · {n} writes into forbidden zones reverted': ' · {n} escrituras en zonas prohibidas revertidas',
  ' · need to change existing files? ask again in #3 CONTROL': ' · ¿necesitas cambiar archivos que ya existen? pídelo otra vez en #3 CONTROL',
  'CONTROL': 'CONTROL',
  ' holds the project · checkpoint ': ' tiene el proyecto · checkpoint ',
  'MU/TH/UR › @{agent} holds CONTROL. Checkpoint taken; UNDO will be one click.':
    'MU/TH/UR › @{agent} tiene CONTROL. Checkpoint tomado; DESHACER va a ser un clic.',
  ' changed {n} files': ' cambió {n} archivos',
  ' changed 1 file': ' cambió 1 archivo',
  ' changed nothing': ' no cambió nada',
  'added': 'agregado',
  'modified': 'modificado',
  'deleted': 'borrado',
  'renamed': 'renombrado',
  '… and {n} more': '… y {n} más',
  '{n} writes into forbidden zones reverted: {where}': '{n} escrituras en zonas prohibidas revertidas: {where}',
  'could not read what changed': 'no se pudo leer qué cambió',
  "This sealed preview keeps no data ({what}): the page cannot remember anything here. To try it with its data, open it from SERVERS on the project's own server.": 'Esta vista sellada no guarda datos ({what}): la página no puede recordar nada aquí. Para probarla con sus datos, ábrela desde SERVIDORES en el servidor del proyecto.',
  'OPEN SERVERS': 'ABRIR SERVIDORES',
  'Stopped while waiting for the project: another turn was writing in it.': 'Se detuvo mientras esperaba el proyecto: otro turno estaba escribiendo en él.',
  '@{agent} waits for @{behind} to finish writing in the project · one turn writes at a time': '@{agent} espera a que @{behind} termine de escribir en el proyecto · un turno escribe a la vez',
  '@{agent} waits for the turn writing in the project · one turn writes at a time': '@{agent} espera al turno que está escribiendo en el proyecto · un turno escribe a la vez',
  'SERVING': 'SIRVIENDO',
  'serving on :{port}': 'sirviendo en :{port}',
  'serving on :{port} · listens on the whole network, so the room will not open it': 'sirviendo en :{port} · escucha en toda la red, así que la sala no lo abre',
  'OPEN IN SERVERS': 'ABRIR EN SERVIDORES',
  'That command is not running.': 'Ese comando no está corriendo.',
  'what it left could not be read ({reason})': 'no se pudo leer lo que dejó ({reason})',
  'before it stopped it left {n} {files} in the project': 'antes de detenerse dejó {n} {files} en el proyecto',
  '{n} changes to existing files were put back: CREATE only adds.': '{n} cambios a archivos que ya existían se regresaron: CREATE solo agrega.',
  'RETRY WITH MORE TIME · {n}s': 'REINTENTAR CON MÁS TIEMPO · {n}s',
  'You were cut off by the time limit. These files already exist: {files}. Finish what is missing; do not start over.': 'Te cortó el tiempo límite. Estos archivos ya existen: {files}. Termina lo que falta; no empieces de nuevo.',
  'MU/TH/UR › #{n} needs its keys again: choose it on the mode chip before sending.': 'MU/TH/UR › #{n} necesita sus llaves otra vez: elígelo en el chip de modo antes de enviar.',
  'IN THE BOX · SEND IT WHEN READY': 'EN LA CAJA · ENVÍALO CUANDO QUIERAS',
  'Git could not list the changes ({reason}). The checkpoint from before the turn is still there.': 'Git no pudo listar los cambios ({reason}). El checkpoint de antes del turno sigue ahí.',
  'UNDO · RESTORE CHECKPOINT': 'DESHACER · RESTAURAR CHECKPOINT',
  'Put the project back exactly as it was before this CONTROL turn.':
    'Deja el proyecto exactamente como estaba antes de este turno de CONTROL.',
  'RESTORED': 'RESTAURADO',
  "project restored to the checkpoint before @{agent}'s turn · {restored} restored · {removed} removed":
    'proyecto restaurado al checkpoint anterior al turno de @{agent} · {restored} restaurados · {removed} quitados',
  'RESEND TO @{agent} WITH CREATE': 'REENVIAR A @{agent} CON CREATE',
  'Send this same request from you, with a creation lease.': 'Manda esta misma petición de tu parte, con permiso de creación.',
  'RESENT WITH CREATE': 'REENVIADO CON CREATE',
  'It could not be resent: {error}': 'No se pudo reenviar: {error}',
  'ALWAYS FOR THIS AGENT': 'SIEMPRE PARA ESTE AGENTE',
  'GRANT ONCE': 'CONCEDER UNA VEZ',
  'GRANT FOR PLAN': 'CONCEDER PARA EL PLAN',
  'Every remaining writable step of this plan shares one lease directory.':
    'Todos los pasos con escritura que le quedan a este plan comparten una sola carpeta de permiso.',
  'DENY': 'NEGAR',
  'anywhere in the project · existing files stay untouched': 'donde sea en el proyecto · los archivos que ya existen no se tocan',
  ' · scratch ': ' · borrador ',
  'in ': 'en ',
  'STOPALL failed to reach the room.': 'STOPALL no llegó a la sala.',
  'MU/TH/UR › all quiet. nothing was running.': 'MU/TH/UR › todo tranquilo. no había nada corriendo.',
  'Stop the remaining steps of this plan': 'Detener los pasos que le quedan a este plan',
  'That plan is no longer running.': 'Ese plan ya no está corriendo.',
  'clear · ': 'claro · ',

  // ── EL RESTO DE LA SALA ───────────────────────────────────────────────────
  'Enable it in MODULES.': 'Enciéndelo en MÓDULOS.',
  'ASK THE ROOM': 'PREGUNTARLE A LA SALA',
  'Put this error and the file into the composer': 'Pone este error y el archivo en el compositor',
  'MU/TH/UR › RIPLEY reloaded the page: an agent changed it.': 'MU/TH/UR › RIPLEY recargó la página: un agente la cambió.',
  'loading…': 'cargando…',
  'select & copy': 'selecciona y copia',
  'memory · never writes': 'memoria · nunca escribe',
  'Choose the model for this agent': 'Elige el modelo de este agente',
  'loading models…': 'cargando modelos…',
  'other model name…': 'otro nombre de modelo…',
  'DESIGNATION ›': 'DESIGNACIÓN ›',
  'AIRLOCK': 'AIRLOCK',
  'PROVIDER': 'PROVEEDOR',
  'SAVE KEY': 'GUARDAR LLAVE',
  'WHERE DO I GET ONE ↗': '¿DÓNDE CONSIGO UNA? ↗',
  'WORKING…': 'TRABAJANDO…',
  'INSTALLING…': 'INSTALANDO…',
  'more entries not shown': 'hay más entradas que no se muestran',
  'Delete this conversation. Its transcript goes; what the archive learned from it stays.':
    'Borra esta conversación. Su transcripción se va; lo que el archivo aprendió de ella se queda.',
  'Press again to delete this conversation.': 'Vuelve a apretar para borrar esta conversación.',
  // La ventana partida en dos: una segunda conversación en la mitad derecha.
  'Open this conversation in the other half of the window': 'Abrir esta conversación en la otra mitad de la ventana',
  'Close the split': 'Cerrar la división',
  'Second conversation': 'Segunda conversación',
  'Resize the two halves': 'Cambiar el tamaño de las dos mitades',
  'Swap the two halves': 'Intercambiar las dos mitades',
  'Make this the open conversation, and put the other one here': 'Hacer de esta la conversación abierta y poner la otra aquí',
  'Trade places with the second conversation': 'Cambiar de lugar con la segunda conversación',
  'MU/TH/UR › the window is too narrow for two conversations. Widen it and try again.':
    'MU/TH/UR › la ventana es demasiado angosta para dos conversaciones. Ensánchala y vuelve a intentarlo.',
  'This conversation is no longer here.': 'Esta conversación ya no está aquí.',
  'end of record. nothing else is down here, human. crew status under review.':
    'fin del registro. aquí abajo no hay nada más, humano. estado de la tripulación en revisión.',
  'MU/TH/UR › nobody in the room can generate images right now: turn on Image Studio in Modules, or Generate images for an agent in Settings › Agents.': 'MU/TH/UR › nadie en la sala puede generar imágenes ahora: enciende Image Studio en Módulos, o Generar imágenes para un agente en Ajustes › Agentes.',
  'Remove': 'Quitar',
  'MU/TH/UR › the archive is open again. Behave.': 'MU/TH/UR › el archivo está abierto otra vez. Compórtate.',
  'MU/TH/UR › ASH: every agent will answer in compact prose. What you write is never altered.':
    'MU/TH/UR › ASH: cada agente va a contestar en prosa compacta. Lo que tú escribes nunca se altera.',
  'An attachment is still uploading.': 'Todavía se está subiendo un adjunto.',
  'SELECT': 'SELECCIONA',
  'DIAGNOSIS': 'DIAGNÓSTICO',
  'REMEDY': 'REMEDIO',
  'NO SPECIAL ORDERS ON THIS SHIP. THE CREW IS NOT EXPENDABLE. RESTATE INQUIRY.':
    'EN ESTA NAVE NO HAY ÓRDENES ESPECIALES. LA TRIPULACIÓN NO ES PRESCINDIBLE. REFORMULA LA CONSULTA.',
  'INQUIRY ACCEPTS: AN AGENT NAME · A SYMPTOM · A KEYWORD SUCH AS TIMEOUT, LOGIN, PORT, BUDGET.':
    'LA CONSULTA ACEPTA: UN NOMBRE DE AGENTE · UN SÍNTOMA · UNA PALABRA COMO TIMEOUT, LOGIN, PUERTO, PRESUPUESTO.',
  'NOSTROMO › the question is in the composer. Send it to whoever should answer it, or to @madre, which costs nothing.':
    'NOSTROMO › la pregunta está en el compositor. Mándasela a quien deba contestarla, o a @madre, que no cuesta nada.',
  'Stop offering this one. Nothing is forgotten and nothing is written.':
    'Deja de ofrecer esta. No se olvida nada y no se escribe nada.',
  'No theme shared with another memory yet.': 'Todavía no comparte tema con ninguna otra memoria.',
  'TAKEN DOWN': 'DADA DE BAJA',
  'This aberration took that memory out of every future turn.': 'Esta aberración sacó esa memoria de todos los turnos que vienen.',
  'REFUTES IT': 'LA REFUTA',
  'An aberration took this memory out of every future turn.': 'Una aberración sacó esta memoria de todos los turnos que vienen.',
  'PRESS AGAIN TO FORGET · FOREVER': 'VUELVE A APRETAR PARA OLVIDAR · PARA SIEMPRE',
  'FORGET THIS MEMORY': 'OLVIDAR ESTA MEMORIA',
  'FORGETTING…': 'OLVIDANDO…',
  'MU/TH/UR › the room did not come back on its own. Start it from your terminal.':
    'MU/TH/UR › la sala no regresó sola. Arráncala desde tu terminal.',

  // ── EL MARCADO: diálogos, paneles y modales de index.html ─────────────────
  'STOP ALL': 'PARAR TODO',
  'MU/TH/UR 6000 · WHAT THIS ROOM SAYS IN YOUR NAME': 'MU/TH/UR 6000 · LO QUE ESTA SALA DICE EN TU NOMBRE',
  '⧉ COPY ALL': '⧉ COPIAR TODO',
  'CLOSE ×': 'CERRAR ×',
  'BUILT NOW · STORED NOWHERE · SENT NOWHERE · READ, NEVER WRITTEN':
    'ARMADO AHORA · GUARDADO EN NINGÚN LADO · MANDADO A NINGÚN LADO · SE LEE, NUNCA SE ESCRIBE',
  'EXPAND ALL': 'ABRIR TODO',
  // MEMORIA, emancipada de CONEXIONES: su propio botón en la barra de MU/TH/UR.
  'One conversation. Every agent.': 'Una conversación. Todos los agentes.',
  'Pick an agent and ask, or start with a mention such as': 'Elige un agente y pregunta, o empieza con una mención como',
  'ARM': 'ARMAR',
  'BACK': 'ATRÁS',
  'BOARD': 'ABORDAR',
  'DECISION': 'DECISIÓN',
  'FACT': 'HECHO',
  'PREFERENCE': 'PREFERENCIA',
  'QUESTION': 'PREGUNTA',
  'ABERRATION': 'ABERRACIÓN',
  'COLD · 0': 'FRÍAS · 0',
  'ASK · 0': 'PREGUNTAR · 0',
  'RECENTER': 'RECENTRAR',
  'LEAVE ×': 'SALIR ×',
  // /module: las ideas, dos de cada forma de módulo.
  'command': 'comando',
  'connector': 'conector',
  'sends · #4 only': 'manda · solo en #4',
  'card of its own': 'ficha propia',
  'a command that lists the TODOs still left in the code': 'un comando que liste los TODO que quedan en el código',
  'connect me to my database so the agents can read it, never write': 'conéctame a mi base de datos para que los agentes la lean, sin escribir nunca',
  'post a summary to Slack when a long plan finishes': 'publica un resumen en Slack cuando termine un plan largo',
  'a card with what my store sold today': 'una ficha con lo que vendió mi tienda hoy',
  // Primer uso: la tarjeta junto a un botón que nunca se había presionado.
  'The browser': 'El navegador',
  'See what you are building without leaving the room: the servers answering on this computer, in tabs, at phone, tablet or desktop width. To open the web, switch RIPLEY on in MODULES.':
    'Mira lo que estás construyendo sin salir de la sala: los servidores que contestan en esta computadora, en pestañas, a ancho de teléfono, tableta o escritorio. Para abrir la web, activa RIPLEY en MÓDULOS.',
  'The project files': 'Los archivos del proyecto',
  'Your project as a tree. Click a file to read it, search by name, and right-click to copy, move, rename or create files and folders.':
    'Tu proyecto como árbol. Haz clic en un archivo para leerlo, búscalo por nombre, y con clic derecho copia, mueve, renombra o crea archivos y carpetas.',
  'Conversations, one memory': 'Conversaciones, una sola memoria',
  'A project can hold many conversations and a single memory. Start a new one for a new subject: they all feed the same archive, and every agent recalls what was said in the others.':
    'Un proyecto puede tener muchas conversaciones y una sola memoria. Empieza otra para un tema nuevo: todas alimentan el mismo archivo y cualquier agente recuerda lo que se dijo en las demás.',
  'Got it': 'Entendido',
  // Primer contacto: el recorrido sobre la sala, en cinco paradas.
  'Ask anyone in your crew': 'Pregúntale a quien quieras de tu tripulación',
  'The AI agents already on this computer work here together. Write in the box and ask; every reply says who answered, in which mode and what it cost.':
    'Los agentes de IA que ya tienes en esta computadora trabajan aquí juntos. Escribe en la caja y pregunta; cada respuesta dice quién contestó, en qué modo y cuánto costó.',
  'Who you are talking to. @claude goes straight to Claude.': 'A quién le hablas. @claude va directo a Claude.',
  'The mode: how far the message may go. It starts at #1, which only reads; #3 and #4 ask for your key.':
    'El modo: hasta dónde puede llegar el mensaje. Empieza en #1, que solo lee; #3 y #4 te piden tu llave.',
  'Commands, like /module to make a module of your own.': 'Comandos, como /module para crear un módulo tuyo.',
  'MU/TH/UR, the console': 'MU/TH/UR, la consola',
  'When something fails, the remedy is here: write a symptom, an agent or a word and it says what is going on and how to fix it. What it already noticed in this room carries its mark.':
    'Cuando algo falla, aquí está el remedio: escribe un síntoma, un agente o una palabra y te dice qué pasa y cómo arreglarlo. Lo que ya detectó en esta sala lleva su marca.',
  'The map of what the room remembers, and why.': 'El mapa de lo que recuerda la sala, y por qué.',
  'This tour again, whenever you want it.': 'Este recorrido otra vez, cuando quieras.',
  'Several conversations at once': 'Varias conversaciones a la vez',
  'Each conversation has its own thread and its own box. Open another one beside this, in the right half or as a window: up to three at once, all of them working.':
    'Cada conversación tiene su propio hilo y su propia caja. Abre otra junto a esta, en la mitad derecha o como ventana: hasta tres a la vez, y todas siguen trabajando.',
  'Gestures and the way around': 'Gestos y cómo moverte',
  'The room is arranged the way you like it, and a few gestures get you around it.': 'La sala se acomoda a tu gusto, y unos cuantos gestos te llevan por ella.',
  'Right-click': 'Clic derecho',
  'On the bar: choose which keys are on it and in which order.': 'En la barra: eliges qué botones lleva y en qué orden.',
  'Click the box': 'Clic en la caja',
  'The windows step aside so the conversation is in sight.': 'Las ventanas se hacen a un lado para que veas la conversación.',
  'Drag': 'Arrastrar',
  'A window by its header; its edges and corners resize it.': 'Una ventana por su encabezado; sus bordes y esquinas cambian su tamaño.',
  'Opens Settings.': 'Abre Ajustes.',
  'Closes the menu that is open.': 'Cierra el menú que esté abierto.',
  'Modules, optional powers': 'Módulos, poderes opcionales',
  'Add what this project needs: GitHub, Git, images, previews of what you build, a local model, a browser, or a module of your own in a single file. Nothing is installed until you press it.':
    'Agrega lo que este proyecto necesite: GitHub, Git, imágenes, vistas previas de lo que construyes, un modelo local, un navegador, o un módulo tuyo en un solo archivo. Nada se instala hasta que tú lo pidas.',
  'Your first steps wait in the bar, and tick themselves as you go. Type STOPALL at any time to halt every agent.':
    'Tus primeros pasos te esperan en la barra y se marcan solos conforme avanzas. Escribe STOPALL en cualquier momento para frenar a todos los agentes.',
  // Primeros pasos: la lista que se marca sola.
  'First steps': 'Primeros pasos',
  'First steps · {done} of {total} done': 'Primeros pasos · {done} de {total} hechos',
  '{done} of {total}': '{done} de {total}',
  'Ask your first question': 'Haz tu primera pregunta',
  'Write in the box. With @ you choose who answers.': 'Escribe en la caja. Con @ eliges quién contesta.',
  'Ask the crew for something together': 'Pide algo a toda la tripulación',
  'Ask one agent for something for everyone: it draws up a plan and hands the steps to the others.':
    'Pídele a un agente algo para todos: arma un plan y reparte los pasos entre los demás.',
  'ask each agent in the crew to introduce itself in one line': 'pídele a cada agente de la tripulación que se presente en una línea',
  'Open MU/TH/UR': 'Abre MU/TH/UR',
  'When something fails, write the symptom there: it says what is going on and how to fix it.':
    'Cuando algo falle, escribe ahí el síntoma: te dice qué pasa y cómo arreglarlo.',
  'Open a second conversation': 'Abre una segunda conversación',
  'From the conversations panel, beside this one or as a window. Both keep working.':
    'Desde el panel de conversaciones, junto a esta o como ventana. Las dos siguen trabajando.',
  'Make the bar yours': 'Acomoda la barra a tu gusto',
  'Right-click any key of the bar: choose what is on it and in which order.':
    'Clic derecho en cualquier botón de la barra: eliges qué lleva y en qué orden.',
  'Open a module': 'Abre un módulo',
  'Optional powers for this project, like GitHub or a local model. Nothing is installed until you ask.':
    'Poderes opcionales para este proyecto, como GitHub o un modelo local. Nada se instala hasta que lo pidas.',
  'Show me': 'Llévame',
  '{step}: done': '{step}: hecho',
  'Hide the list': 'Ocultar la lista',
  'Each step ticks itself when you do it.': 'Cada paso se marca solo cuando lo haces.',
  'The list comes back from ? in MU/TH/UR.': 'La lista vuelve desde ? en MU/TH/UR.',
  'First steps done: you know your way around MADRE.': 'Primeros pasos completos: ya sabes moverte por MADRE.',
  '{n} of {total}': '{n} de {total}',
  'Skip': 'Saltar',
  'Next': 'Siguiente',
  'Start': 'Empezar',
  // Novedades: el tablero que se abre una vez después de actualizar.
  "What's new in MADRE {version}": 'Novedades en MADRE {version}',
  "What's new": 'Novedades',
  'You now have {version}': 'Ya tienes la {version}',
  'See every change ↗': 'Ver todos los cambios ↗',
  'Back to what is new': 'Volver a las novedades',
  'Previous': 'Anterior',
  'Where it is': 'Dónde está',
  'Take me there': 'Llévame ahí',
  "What's new in this version": 'Novedades de esta versión',
  // NOSTROMO: la mira sobre la enana elegida.
  'TARGET LOCKED': 'BLANCO FIJADO',
  'DRAG TO TURN · SHIFT+DRAG TO MOVE · WHEEL TO ZOOM · CLICK A MEMORY · DO NOT TOUCH MOTHER':
    'ARRASTRA PARA GIRAR · SHIFT+ARRASTRA PARA MOVER · RUEDA PARA ACERCAR · CLIC EN UNA MEMORIA · NO TOQUES A MOTHER',
  '⚠ WARNING ⚠': '⚠ ADVERTENCIA ⚠',
  'MU/TH/UR 6000 · SPECIAL ORDER 937 · PRIORITY ONE': 'MU/TH/UR 6000 · ORDEN ESPECIAL 937 · PRIORIDAD UNO',
  'WHAT TO ASK NEXT': 'QUÉ PREGUNTAR AHORA',
  'WRITTEN FROM WHAT THE ARCHIVE ALREADY HOLDS. NOTHING IS SENT: A QUESTION GOES TO THE COMPOSER AND YOU DECIDE WHO ANSWERS IT.':
    'ESCRITAS CON LO QUE EL ARCHIVO YA TIENE. NO SE MANDA NADA: LA PREGUNTA VA AL COMPOSITOR Y TÚ DECIDES QUIÉN LA CONTESTA.',
  'MEMORY': 'MEMORIA',
  'SOURCE': 'ORIGEN',
  'DISTILLED': 'DESTILADA',
  'LINKS': 'ENLACES',
  'EXCHANGE WITH MADRE': 'INTERCAMBIO CON MADRE',
  'FORGETTING REMOVES THE NOTE FROM EVERY FUTURE TURN. THE LEDGER IT CAME FROM STAYS.':
    'OLVIDAR QUITA LA NOTA DE TODOS LOS TURNOS QUE VIENEN. EL LEDGER DEL QUE SALIÓ SE QUEDA.',
  'NO MEMORIES YET. THE ARCHIVIST WRITES THE FIRST ONES AFTER A FEW EXCHANGES.':
    'TODAVÍA NO HAY MEMORIAS. EL ARCHIVISTA ESCRIBE LAS PRIMERAS DESPUÉS DE UNOS INTERCAMBIOS.',
  'REVIEW WITH ▾': 'REVISAR CON ▾',
  'OPEN RAW ↗': 'ABRIR EN CRUDO ↗',

  // Títulos y etiquetas del marcado.
  'Agents': 'Agentes',
  'Language': 'Idioma',
  'Theme': 'Tema',
  'Conversations': 'Conversaciones',
  'Close conversations': 'Cerrar las conversaciones',
  'Project files': 'Archivos del proyecto',
  'Close files': 'Cerrar los archivos',
  'The core': 'El núcleo',
  'Copy the whole briefing as the agent receives it': 'Copia el briefing completo, tal como lo recibe el agente',
  'Modules': 'Módulos',
  'Install a module somebody wrote. MADRE checks it before it runs.':
    'Instala un módulo que escribió alguien más. MADRE lo revisa antes de que corra.',
  'MU/TH/UR troubleshooting': 'Diagnóstico de MU/TH/UR',
  'NOSTROMO · memory research · needs the project designation':
    'NOSTROMO · investigación de memoria · necesita la designación del proyecto',
  'The tour of MADRE': 'El recorrido de MADRE',
  'Tour': 'Recorrido',
  'Operating system': 'Sistema operativo',
  'Attach': 'Adjuntar',
  'Agent usage': 'Uso del agente',
  'MADRE tour': 'Recorrido por MADRE',
  'NOSTROMO memory research': 'NOSTROMO · investigación de memoria',
  'Memory kinds': 'Clases de memoria',
  'YELLOW DWARF · DECISION': 'ENANA AMARILLA · DECISIÓN',
  'WHITE DWARF · FACT': 'ENANA BLANCA · HECHO',
  'GREEN DWARF · PREFERENCE': 'ENANA VERDE · PREFERENCIA',
  'BLUE DWARF · QUESTION': 'ENANA AZUL · PREGUNTA',
  'The memories nothing has ever reached for, that share a subject with nothing, and that have had their chances':
    'Las memorias que nadie ha buscado nunca, que no comparten tema con ninguna otra y que ya tuvieron sus oportunidades',
  'The questions this archive cannot answer yet, written from what it already holds':
    'Las preguntas que este archivo todavía no puede contestar, escritas con lo que ya tiene',
  "Memories orbiting MOTHER's core": 'Memorias orbitando el núcleo de MOTHER',
  'This reading follows the room while the card is open': 'Esta lectura sigue a la sala mientras la ficha está abierta',
  'File viewer': 'Visor de archivos',
  'Back to the previous page': 'Volver a la página anterior',
  'Back': 'Atrás',
  'Reload the page': 'Recargar la página',
  'Reload': 'Recargar',

  // ── LOS ERRORES QUE LA SALA CONTESTA ──────────────────────────────────────
  'A turn is running in this conversation. Let it finish, or STOP ALL, and try again.':
    'Hay un turno corriendo en esta conversación. Deja que termine, o dale PARAR TODO, y vuelve a intentar.',
  'A turn is running in this conversation.': 'Hay un turno corriendo en esta conversación.',
  'Ollama is not on this computer yet.': 'Ollama todavía no está en esta computadora.',
  'Ollama did not answer. Open the Ollama app, then press RECHECK.':
    'Ollama no contestó. Abre la app de Ollama y dale REVISAR OTRA VEZ.',
  'Ollama {client} is installed, but {running} is still the one answering. Quit Ollama (or restart its service) and open it again, then RECHECK.':
    'Ollama {client} está instalado, pero el que sigue contestando es {running}. Cierra Ollama (o reinicia su servicio), ábrelo otra vez y dale REVISAR OTRA VEZ.',
  'The old Ollama ({running}) did not stop. Quit it by hand, then press START OLLAMA.':
    'El Ollama viejo ({running}) no se detuvo. Ciérralo a mano y dale ARRANCAR OLLAMA.',
  'Installing a module writes into the project; send { "confirm": true } to proceed.':
    'Instalar un módulo escribe en el proyecto; manda { "confirm": true } para seguir.',
  'RIPLEY is off. Enable it in MODULES to render files.': 'RIPLEY está apagado. Enciéndelo en MÓDULOS para dibujar archivos.',
  'No such report, or no repository to file it in.': 'No existe ese reporte, o no hay repositorio donde levantarlo.',
  'The room has no memory.': 'La sala no tiene memoria.',
  'EYECAT is not holding that one.': 'EYECAT no está sosteniendo esa.',
  'No private terms are set. Write them first.': 'No hay términos privados puestos. Escríbelos primero.',
  'This copy runs from source: pull the repository and start it again.':
    'Esta copia corre desde el código fuente: haz pull del repositorio y arráncala otra vez.',
  'npm does not hand out {version} yet; a new release can take a few minutes. The room stays open: try again in a moment.':
    'npm todavía no entrega {version}; una versión recién publicada puede tardar unos minutos. La sala sigue abierta: vuelve a intentarlo en un momento.',
  'Agents are still working. STOPALL or wait, then update.':
    'Los agentes siguen trabajando. Dale STOPALL o espera, y luego actualiza.',
  'MOTHER is silent.': 'MOTHER está callada.',
  'No such conversation.': 'No existe esa conversación.',
  'That file is empty.': 'Ese archivo está vacío.',
  'A module file that big is not a module. Keep it under 400 KB.':
    'Un archivo de módulo tan grande no es un módulo. Que no pase de 400 KB.',
  'A module is a .mjs file.': 'Un módulo es un archivo .mjs.',
  'Only a module you installed yourself can be refreshed.': 'Solo se puede refrescar un módulo que tú mismo instalaste.',
  'CODE000. THE ARCHIVE IS SEALED.': 'CODE000. EL ARCHIVO ESTÁ SELLADO.',
  'No such memory.': 'No existe esa memoria.',
  'A key is only accepted from this computer, never over the network.':
    'Una llave solo se acepta desde esta computadora, nunca por la red.',
  'OpenCode is not installed.': 'OpenCode no está instalado.',
  'No running plan with that id.': 'No hay ningún plan corriendo con ese id.',
  'Not a command. Commands start with "/" followed by a name.':
    'Eso no es un comando. Los comandos empiezan con «/» seguido de un nombre.',
  'Give the project-relative path of a <id>.module.mjs file.':
    'Da la ruta, relativa al proyecto, de un archivo <id>.module.mjs.',
  'Not found.': 'No se encontró.',

  // ── EL CATÁLOGO DE MU/TH/UR · 51 CONDICIONES ──────────────────────────────
  // Lo que se lee va en español; lo que RECONOCE una falla no: los patrones se prueban contra lo
  // que imprimió un CLI, y un CLI imprime en inglés hable la sala lo que hable.
  'Gemini refuses the personal Google login': 'Gemini rechaza el inicio de sesión personal de Google',
  'Google closed Gemini Code Assist for individuals to this client. The OAuth login still exists but every request is rejected before it reaches a model.':
    'Google le cerró Gemini Code Assist a las cuentas personales desde este cliente. El inicio de sesión OAuth sigue existiendo, pero cada petición se rechaza antes de llegar a un modelo.',
  'Switch Gemini to an API key from Google AI Studio. MADRE copies only the auth selection into its isolated home, so the key can stay in the keychain or in ~/.gemini/.env.':
    'Cambia Gemini a una API key de Google AI Studio. MADRE solo copia la elección de autenticación a su hogar aislado, así que la llave puede quedarse en el llavero o en ~/.gemini/.env.',

  'Gemini key out of prepaid credits': 'La llave de Gemini se quedó sin créditos prepagados',
  'The AI Studio project behind the Gemini API key has spent its prepaid balance. Google answers every call, including Image Studio generations, with HTTP 429 until the balance is topped up. Gemini CLI hides this behind silent retries.':
    'El proyecto de AI Studio detrás de la API key de Gemini gastó su saldo prepagado. Google contesta cada llamada —incluidas las imágenes de Image Studio— con HTTP 429 hasta que se recargue. El CLI de Gemini lo esconde detrás de reintentos silenciosos.',
  'Top up the project in AI Studio, or point the Gemini CLI at a key from another project. Nothing in MADRE changes; retry once billing is fixed.':
    'Recarga el proyecto en AI Studio, o apunta el CLI de Gemini a una llave de otro proyecto. En MADRE no hay que cambiar nada; vuelve a intentar cuando el cobro esté resuelto.',

  'Gemini key rate-limited by Google (HTTP 429)': 'Google le puso límite de tasa a la llave de Gemini (HTTP 429)',
  'The Gemini API key hit its per-minute or daily quota. Gemini CLI retries with exponential backoff and prints only stack traces while it waits, which looked like a hang. With the "auto" model, the first request is a small router call, so even that can be throttled.':
    'La API key de Gemini llegó a su cuota por minuto o por día. El CLI de Gemini reintenta con espera creciente e imprime solo trazas mientras espera, lo que parecía un cuelgue. Con el modelo «auto», la primera petición es una llamada chica al enrutador, así que hasta eso puede toparse.',
  "Wait a minute and retry, pick an explicit model in the composer (gemini-3-flash-preview skips the router), or raise the key's quota in Google AI Studio.":
    'Espera un minuto y vuelve a intentar, elige un modelo explícito en el compositor (gemini-3-flash-preview se salta el enrutador), o sube la cuota de la llave en Google AI Studio.',

  'Gemini model under high demand (503)': 'El modelo de Gemini está saturado (503)',
  'Google is shedding load on the selected model (HTTP 503). The CLI would retry with backoff for minutes; MADRE stops it after 15 s of that and retries once on gemini-2.5-flash. The turn failed only if the fallback model was refused too.':
    'Google está soltando carga en el modelo elegido (HTTP 503). El CLI reintentaría con espera creciente durante minutos; MADRE lo corta a los 15 s y reintenta una vez con gemini-2.5-flash. El turno solo falló si también rechazaron el modelo de respaldo.',
  "Ask again in a minute, pick an explicit model from the composer's model menu, or hand the question to another agent. PULSE_GEMINI_FALLBACK_MODEL changes the fallback.":
    'Vuelve a preguntar en un minuto, elige un modelo explícito en el menú del compositor, o pásale la pregunta a otro agente. PULSE_GEMINI_FALLBACK_MODEL cambia el respaldo.',

  'OpenCode picked a provider without a valid session': 'OpenCode eligió un proveedor sin sesión válida',
  'Without a model in its config, `opencode run` falls back to its default provider. On this machine that provider holds a stale or invalid key.':
    'Sin un modelo en su configuración, `opencode run` se va a su proveedor por defecto. En esta computadora ese proveedor tiene una llave vieja o inválida.',
  'Tell MADRE which provider/model OpenCode should use in the room, or remove the stale credential so the default changes.':
    'Dile a MADRE qué proveedor/modelo debe usar OpenCode en la sala, o quita la credencial vieja para que cambie el valor por defecto.',

  'Agent installed but signed out': 'El agente está instalado pero sin sesión',
  'The CLI is on this computer but has no session for its provider. MADRE never stores credentials; each agent keeps its own.':
    'El CLI está en esta computadora pero no tiene sesión con su proveedor. MADRE nunca guarda credenciales; cada agente guarda las suyas.',
  "Press Sign in on the agent: on first contact the room opens on the bridge with the button on each card, and later it lives in Settings → Agents, which the row below opens. Codex and Claude sign in with a browser flow MADRE runs for you; Gemini and OpenCode hand you their command. `madre setup` does the same from a terminal.":
    'Pulsa Iniciar sesión en el agente: en el primer contacto la sala abre en el puente, con el botón en cada ficha, y después está en Ajustes → Agentes, que se abre desde la fila de abajo. Codex y Claude inician sesión con un flujo de navegador que MADRE corre por ti; Gemini y OpenCode te entregan su comando. `madre setup` hace lo mismo desde una terminal.',

  'Agent not found on this computer': 'El agente no está en esta computadora',
  'MADRE looks for `codex`, `claude`, `gemini` and `opencode` on PATH plus a few known locations. Nothing answered.':
    'MADRE busca `codex`, `claude`, `gemini` y `opencode` en el PATH y en unos cuantos lugares conocidos. No contestó ninguno.',
  "Press Install on the agent in Settings → Agents: MADRE shows the exact command, runs it here and looks again when it finishes, no restart. `madre setup` does the same from a terminal.":
    'Pulsa Instalar en el agente, en Ajustes → Agentes: MADRE te enseña el comando exacto, lo corre aquí y vuelve a buscar cuando termina, sin reiniciar. `madre setup` hace lo mismo desde una terminal.',

  'Agent detected, adapter not enabled': 'Se detectó el agente, pero su adaptador no está habilitado',
  'Your MADRE build predates the adapter for this agent, or a newer CLI changed its interface.':
    'Tu versión de MADRE es anterior al adaptador de este agente, o un CLI más nuevo cambió su interfaz.',
  'Run the latest MADRE.': 'Corre la última versión de MADRE.',

  'Claude read the prompt as an MCP config path': 'Claude leyó el prompt como si fuera una ruta de configuración MCP',
  'Older MADRE builds placed the prompt right after a variadic flag, so Claude tried to open the prompt text as a file.':
    'Las versiones viejas de MADRE ponían el prompt justo después de una bandera variádica, así que Claude intentaba abrir el texto del prompt como archivo.',
  'Fixed in MADRE 0.1.0. Run the latest build.': 'Arreglado en MADRE 0.1.0. Corre la última versión.',

  'Agent did not respond before the timeout': 'El agente no contestó antes del tiempo límite',
  'The agent was still reading files or reasoning when its time limit expired (by default 180 s for a turn that reads and 600 s for one that writes), or Gemini stayed silent for 90 s (PULSE_GEMINI_IDLE_MS) and was stopped after one automatic retry. Long questions over many files take longer; MADRE killed the whole process tree. Whatever a writing turn left before it stopped is listed under the failure, with UNDO.': 'El agente seguía leyendo archivos o razonando cuando se acabó su tiempo límite (por defecto 180 s para un turno que lee y 600 s para uno que escribe), o Gemini se quedó callado 90 s (PULSE_GEMINI_IDLE_MS) y se detuvo después de un reintento automático. Las preguntas largas sobre muchos archivos tardan más; MADRE mató el árbol de procesos completo. Lo que un turno que escribe dejó antes de detenerse aparece bajo el fallo, con DESHACER.',
  "Press Apply below, or type a new number in Settings: Default time limit in Room and turns, or Time limit on the agent in Agents. Each field saves the moment you leave it. It applies to the next turn and persists in ~/.pulse/config.json. Environment variables work too, but only for a server started after exporting them; a running room never sees a later export.":
    'Pulsa Aplicar, abajo, o escribe otro número en Ajustes: Tiempo límite por defecto en Sala y turnos, o Tiempo límite en el agente, en Agentes. Cada campo se guarda en cuanto sales de él. Aplica desde el próximo turno y queda en ~/.pulse/config.json. Las variables de entorno también sirven, pero solo para un servidor arrancado después de exportarlas; una sala que ya está corriendo nunca ve un export posterior.',

  'Turn interrupted by a MADRE restart': 'Turno interrumpido por un reinicio de MADRE',
  'MADRE closed (Ctrl+C, SIGTERM or a crash) while this agent was answering. The log records the turn as failed so the room never shows a ghost "thinking" bubble.':
    'MADRE se cerró (Ctrl+C, SIGTERM o un crash) mientras este agente contestaba. El registro deja el turno como fallido para que la sala nunca muestre una burbuja fantasma de «pensando».',
  'Nothing to fix. Ask again; the durable transcript is intact.': 'No hay nada que arreglar. Vuelve a preguntar; la transcripción durable está intacta.',

  'Message rejected for length': 'Mensaje rechazado por largo',
  "Single messages are capped (20,000 characters by default) so the prompt fits every CLI's argument limits.":
    'Cada mensaje tiene un tope (20,000 caracteres por defecto) para que el prompt quepa en los límites de argumentos de todos los CLIs.',
  'Split the message, or raise the cap if your CLIs cope.': 'Parte el mensaje, o sube el tope si tus CLIs lo aguantan.',

  'Where the rings get their numbers': 'De dónde salen los números de los anillos',
  'Each sphere\'s ring shows the provider\'s real limit when the CLI publishes it: Codex writes its 5-hour and weekly windows (used %, reset time) into every session rollout under ~/.codex/sessions; Claude Code\'s /usage comes from Anthropic\'s OAuth usage endpoint; MADRE can ask it with the token Claude Code keeps in the keychain when you start with PULSE_CLAUDE_USAGE=1 (macOS may ask once to allow the keychain read). Gemini and OpenCode publish nothing locally, so their ring shows MADRE\'s own rolling 5-hour window of budget tokens. A window whose reset time has passed counts as empty until the CLI reports again, and the sentinel says "clear" when a full window resets.':
    'El anillo de cada esfera muestra el límite real del proveedor cuando el CLI lo publica: Codex escribe sus ventanas de 5 horas y semanal (% usado, hora de reinicio) en cada sesión bajo ~/.codex/sessions; el /usage de Claude Code viene del endpoint de uso OAuth de Anthropic, y MADRE puede pedirlo con el token que Claude Code guarda en el llavero si arrancas con PULSE_CLAUDE_USAGE=1 (macOS puede pedirte permiso una vez para leer el llavero). Gemini y OpenCode no publican nada localmente, así que su anillo muestra la ventana propia de MADRE: 5 horas rodantes de tokens de presupuesto. Una ventana cuya hora de reinicio ya pasó cuenta como vacía hasta que el CLI vuelva a reportar, y el centinela dice «claro» cuando una ventana entera se reinicia.',
  'Click a sphere to see both windows and when they reset. If a ring looks stale, run one turn with that agent: Codex only rewrites its limits when it runs. Set PULSE_OFFICIAL_QUOTA=0 to stop reading provider limits altogether.':
    'Haz clic en una esfera para ver las dos ventanas y cuándo se reinician. Si un anillo se ve viejo, corre un turno con ese agente: Codex solo reescribe sus límites cuando corre. Pon PULSE_OFFICIAL_QUOTA=0 para dejar de leer los límites del proveedor por completo.',

  'Local token budget exhausted for an agent': 'Se acabó el presupuesto local de tokens de un agente',
  'The room keeps a soft per-agent budget (500,000 tokens by default) so one agent does not quietly eat a whole session. It is MADRE\'s own bookkeeping from the usage each CLI reports after a turn, not the provider\'s quota: nothing is blocked, the room only warns and suggests other agents. Cache reads weigh a tenth of a fresh token.':
    'La sala lleva un presupuesto blando por agente (500,000 tokens por defecto) para que uno solo no se coma una sesión entera sin avisar. Es la contabilidad propia de MADRE, hecha con lo que cada CLI reporta después de un turno, no la cuota del proveedor: no se bloquea nada, la sala solo avisa y sugiere otros agentes. Las lecturas de caché pesan una décima de un token fresco.',
  "Continue with another agent, press Apply below, or type a number in Settings → Room and turns → Tokens per agent (it saves when you leave the field). The provider's real limits show in each sphere's popover when the CLI reports them.":
    'Sigue con otro agente, pulsa Aplicar, abajo, o escribe un número en Ajustes → Sala y turnos → Tokens por agente (se guarda al salir del campo). Los límites reales del proveedor salen en el globo de cada esfera cuando el CLI los reporta.',

  'Port already in use': 'El puerto ya está ocupado',
  'Another process, often another MADRE, is listening on the port.': 'Otro proceso, seguido otra MADRE, está escuchando en ese puerto.',
  'Use a different port, or find and stop the process holding it.': 'Usa otro puerto, o encuentra y detén el proceso que lo tiene.',

  'Live stream keeps reconnecting': 'La conexión en vivo se sigue reconectando',
  'The page lost the server. MADRE exited, the laptop slept, or the port changed.':
    'La página perdió al servidor. MADRE se cerró, la laptop se durmió, o cambió el puerto.',
  'Start MADRE again from the project folder and reload. The transcript is on disk; nothing is lost.':
    'Vuelve a arrancar MADRE desde la carpeta del proyecto y recarga. La transcripción está en disco; no se pierde nada.',

  'OpenCode reported an unexpected server error': 'OpenCode reportó un error de servidor inesperado',
  'OpenCode runs a local server per invocation; under several simultaneous turns it can fail before the model is reached. Seen when two plans overlapped.':
    'OpenCode levanta un servidor local por invocación; con varios turnos a la vez puede fallar antes de llegar al modelo. Se vio cuando se encimaron dos planes.',
  'Let the room settle (STOPALL if agents are piling up), then ask again. Check `opencode` logs if it repeats alone.':
    'Deja que la sala se calme (STOPALL si se están amontonando los agentes) y vuelve a preguntar. Revisa los logs de `opencode` si se repite solo.',

  'Too many agents working at once': 'Demasiados agentes trabajando a la vez',
  'A plan was running and more turns started on top of it, or a plan has run for several minutes. MU/TH/UR raises this before it becomes a loop.':
    'Había un plan corriendo y encima arrancaron más turnos, o un plan lleva varios minutos. MU/TH/UR lo levanta antes de que se vuelva un bucle.',
  'Type STOPALL in the composer, or press STOP ALL in the bar: every plan stops and every in-flight agent process is killed. Then ask one agent at a time.':
    'Escribe STOPALL en el compositor, o dale PARAR TODO en la barra: se detienen todos los planes y se mata cada proceso de agente en vuelo. Después pregunta de a un agente.',

  'Gemini: generating images': 'Gemini: generar imágenes',
  'Gemini CLI 0.60 has no image-generation tool in headless mode, even though Google offers image models. MADRE fills the gap with the Image Studio module: its own MCP server exposing generate_image on the Gemini API image models, attached to Gemini only inside a creation lease with the image scope on, billing your Gemini key.':
    'El CLI de Gemini 0.60 no tiene herramienta de generación de imágenes en modo headless, aunque Google sí ofrece modelos de imagen. MADRE tapa el hueco con el módulo Image Studio: su propio servidor MCP con generate_image sobre los modelos de imagen de la API de Gemini, enganchado a Gemini solo dentro de un permiso de creación con el alcance de imagen encendido, y cobrando a tu llave de Gemini.',
  'Turn Image Studio on in Modules (it needs a Gemini API key with credits), then switch on Generate images for Gemini in Settings → Agents. Without the module, ask @codex or let the orchestrator route the image step to it.':
    'Enciende Image Studio en Módulos (necesita una API key de Gemini con créditos) y luego activa Generar imágenes para Gemini en Ajustes → Agentes. Sin el módulo, pídeselo a @codex o deja que el orquestador le mande ese paso.',

  'Claude Code: generating images': 'Claude Code: generar imágenes',
  "Claude Code has no image-generation tool; Claude models describe and reason about images, they do not render them. The Image Studio module gives Claude the MCP tool generate_image (MADRE's own server on the Gemini API), attached with --mcp-config only inside a creation lease.":
    'Claude Code no tiene herramienta de generación de imágenes; los modelos de Claude describen y razonan sobre imágenes, no las dibujan. El módulo Image Studio le da a Claude la herramienta MCP generate_image (el servidor propio de MADRE sobre la API de Gemini), enganchada con --mcp-config solo dentro de un permiso de creación.',
  'Turn Image Studio on in Modules, switch on Generate images for Claude in Settings → Agents, then use CREATE. Or route the image step to @codex.':
    'Enciende Image Studio en Módulos, activa Generar imágenes para Claude en Ajustes → Agentes y usa CREATE. O mándale ese paso a @codex.',

  'OpenCode: generating images': 'OpenCode: generar imágenes',
  "OpenCode exposes no image-generation tool of its own. The Image Studio module adds MADRE's MCP image server to OpenCode's ephemeral config inside a creation lease.":
    'OpenCode no expone ninguna herramienta propia de generación de imágenes. El módulo Image Studio agrega el servidor MCP de imagen de MADRE a la configuración efímera de OpenCode, dentro de un permiso de creación.',
  'Turn Image Studio on in Modules, switch on Generate images for OpenCode in Settings → Agents, then use CREATE. Or route the image step to @codex.':
    'Enciende Image Studio en Módulos, activa Generar imágenes para OpenCode en Ajustes → Agentes y usa CREATE. O mándale ese paso a @codex.',

  'Web access for an agent': 'Acceso a la web para un agente',
  'Every CLI can browse: Codex with --search, Claude Code with WebFetch/WebSearch, Gemini with google_web_search/web_fetch, OpenCode with webfetch/websearch. MADRE keeps it off until you enable it per agent.':
    'Todos los CLIs pueden navegar: Codex con --search, Claude Code con WebFetch/WebSearch, Gemini con google_web_search/web_fetch, OpenCode con webfetch/websearch. MADRE lo deja apagado hasta que tú lo enciendas por agente.',
  "Switch on Web access for that agent in Settings → Agents; it saves at once. It applies to every turn of that agent; content fetched is sent to its provider.":
    'Activa Acceso a la web para ese agente en Ajustes → Agentes; se guarda al instante. Aplica a todos sus turnos; lo que traiga de la web viaja a su proveedor.',

  'Commands and mentions in the field box': 'Comandos y menciones en el campo',
  'Type "/" for the room\'s commands: /create arms the lease, /image routes an image request to an agent that can draw, /stopall is the brake, /git (Git Pulse) and /ahp (AHP+) run read-only in the project and post a fact card everyone, agents included, can read. Type "@" to mention an agent; the name becomes a label. Type "!" to point at a project file ("!src/room.mjs:12-20" for lines): the agent reads it first. In the viewer, click a line number (Shift+click for a range) and REVIEW WITH sends those lines to an agent.':
    'Escribe «/» para los comandos de la sala: /create arma el permiso, /image manda una petición de imagen a un agente que sepa dibujar, /stopall es el freno, y /git (Git Pulse) y /ahp (AHP+) corren en solo lectura sobre el proyecto y publican una ficha que todos —agentes incluidos— pueden leer. Escribe «@» para mencionar a un agente; el nombre se vuelve una etiqueta. Escribe «!» para apuntar a un archivo del proyecto («!src/room.mjs:12-20» para líneas): el agente lo lee primero. En el visor, haz clic en un número de línea (Shift+clic para un rango) y REVISAR CON le manda esas líneas a un agente.',
  'A struck-through command is a module that is not available in this project: open Modules to install it or turn it on (Git Pulse needs a git repository; AHP+ needs to be installed).':
    'Un comando tachado es un módulo que no está disponible en este proyecto: abre Módulos para instalarlo o encenderlo (Git Pulse necesita un repositorio git; AHP+ hay que instalarlo).',

  'Permission modes: #0 GHOST · #1 EXCHANGE · #2 CREATE · #3 CONTROL · #4 AIRLOCK':
    'Modos de permiso: #0 GHOST · #1 EXCHANGE · #2 CREATE · #3 CONTROL · #4 AIRLOCK',
  'Every message goes out at a mode, chosen in the chip after TO @agent (or typed as #2 in the text). #0 GHOST is off the record: nothing is saved, no other agent remembers it, gone on reload, no delegation. #1 EXCHANGE is the default: read and coordinate. #2 CREATE lets the agent add new files and folders anywhere in the project, where they belong; whatever existed before is put back after the turn and the room says so. #3 CONTROL puts one agent in command of the project itself: a git checkpoint is taken first, every change is listed afterwards, writes into .git, .pulse or .env files are reverted on the spot, and UNDO restores the checkpoint. One holder at a time; it needs Max mode #3 and a git repository. Your mode is the ceiling of any plan the message starts, and #3 is never delegated. Each agent has a Max mode in Settings → Permissions; above it, #2 is answered read-only and #3 is refused. When a #1 plan reaches a step that wants to create something, the room pauses and asks you: GRANT ONCE, GRANT FOR PLAN or DENY, with a 3-minute clock; silence denies. #4 AIRLOCK is CONTROL plus commands: tests, builds, git push, deploys with the CLIs and sessions already on this machine. Files still come back with UNDO; what leaves the machine does not, so the override asks twice: the designation, then the word AIRLOCK. An agent that says it needs a "production mode" or "permission to run commands" is asking for #4.':
    'Cada mensaje sale con un modo, elegido en el chip que está después de PARA @agente (o escrito como #2 en el texto). #0 GHOST es fuera de registro: no se guarda nada, ningún otro agente lo recuerda, se pierde al recargar y no hay delegación. #1 EXCHANGE es el de siempre: leer y coordinar. #2 CREATE deja que el agente agregue archivos y carpetas nuevos donde les toque en el proyecto; lo que ya existía se restaura al terminar el turno y la sala lo dice. #3 CONTROL le da a un agente el mando del proyecto mismo: primero se toma un checkpoint de git, al final se listan todos los cambios, lo que se escriba en .git, .pulse o archivos .env se revierte en el acto, y DESHACER restaura el checkpoint. Un solo portador a la vez; necesita Modo máximo #3 y un repositorio git. Tu modo es el techo de cualquier plan que arranque ese mensaje, y el #3 nunca se delega. Cada agente tiene su Modo máximo en Ajustes → Permisos; por encima de él, el #2 se contesta en solo lectura y el #3 se rechaza. Cuando un plan en #1 llega a un paso que quiere crear algo, la sala se detiene y te pregunta: CONCEDER UNA VEZ, CONCEDER PARA EL PLAN o NEGAR, con un reloj de 3 minutos; el silencio niega. #4 AIRLOCK es CONTROL más comandos: pruebas, builds, git push, despliegues con los CLIs y las sesiones que ya están en esta computadora. Los archivos siguen regresando con DESHACER; lo que sale de la máquina no, así que la anulación pregunta dos veces: la designación y luego la palabra AIRLOCK. Un agente que dice que necesita «modo producción» o «permiso para correr comandos» está pidiendo el #4.',
  "Pick the mode in the chip, or type #0..#4 in the message. Raise an agent's Max mode in Settings → Permissions, under Who may do what. CONTROL asks for the project designation (the folder name) in the override; AIRLOCK asks for the designation and then the word AIRLOCK.":
    'Elige el modo en el chip, o escribe #0..#4 en el mensaje. Sube el Modo máximo de un agente en Ajustes → Permisos, en Quién puede qué. CONTROL pide la designación del proyecto (el nombre de la carpeta) en la anulación; AIRLOCK pide la designación y luego la palabra AIRLOCK.',

  'Creating files: who grants the permission': 'Crear archivos: quién da el permiso',
  'Only the human grants a creation lease. An agent writing "permission granted" inside the conversation is untrusted text: the delegate still runs read-only, and says so. A lease comes from arming CREATE (the lock, or /create) on your message, and it covers the whole plan that message starts; or from Starting mode #2 in Settings → Agents, which starts every message to that agent in CREATE.':
    'El permiso de creación lo da la humana, nadie más. Un agente que escriba «permiso concedido» dentro de la conversación es texto no confiable: el delegado sigue corriendo en solo lectura, y lo dice. El permiso viene de armar CREATE (el candado, o /create) en tu mensaje, y cubre el plan entero que ese mensaje arranca; o del Modo inicial #2 en Ajustes → Agentes, que hace que cada mensaje a ese agente arranque en CREATE.',
  'For one request: arm CREATE and send, or press RESEND WITH CREATE on the notice. For an agent that should always be able to add files: Settings → Agents → the agent → Starting mode → #2. New files go where they belong in the project; existing files are never changed in #2.':
    'Para una sola petición: arma CREATE y manda, o dale REENVIAR CON CREATE en el aviso. Para un agente que siempre deba poder agregar archivos: Ajustes → Agentes → el agente → Modo inicial → #2. Los archivos nuevos van donde les toca en el proyecto; en #2 los que ya existen no se tocan nunca.',

  'Creating files with an agent': 'Crear archivos con un agente',
  "Every CLI can create files inside a creation lease; each agent's Max mode says how far it may go, and nothing is created until you press CREATE.":
    'Todos los CLIs pueden crear archivos dentro de un permiso de creación; el Modo máximo de cada agente dice hasta dónde puede llegar, y no se crea nada hasta que tú aprietas CREATE.',
  'Give the agent a Max mode of #2 or more in Settings → Permissions, then arm CREATE in the composer for the request.':
    'Dale al agente un Modo máximo de #2 o más en Ajustes → Permisos, y arma CREATE en el compositor para esa petición.',

  'Node.js too old': 'Node.js demasiado viejo',
  'MADRE needs Node 22.5 or newer: the room memory runs on node:sqlite, and the rest on ES modules, fetch and AbortSignal. The bin refuses to start on older versions and says so.':
    'MADRE necesita Node 22.5 o más nuevo: la memoria de la sala corre sobre node:sqlite, y el resto sobre módulos ES, fetch y AbortSignal. El binario se niega a arrancar en versiones viejas y lo dice.',
  'Update Node to the current LTS.': 'Actualiza Node a la LTS actual.',

  'Room memory unavailable: turns get only the recent window':
    'La memoria de la sala no está disponible: los turnos solo reciben la ventana reciente',
  "The memory index (memory.sqlite next to the room's events.jsonl) could not open or write. The room still works: every turn gets the recent transcript, but nothing older is recalled, nothing is distilled and NOSTROMO is empty. Causes: Node below 22.5, a corrupt file, or a second MADRE writing the same room with an incompatible version.":
    'El índice de memoria (memory.sqlite, junto al events.jsonl de la sala) no se pudo abrir o escribir. La sala sigue funcionando: cada turno recibe la transcripción reciente, pero no se recuerda nada más viejo, no se destila nada y NOSTROMO está vacío. Causas: Node por debajo de 22.5, un archivo corrupto, o una segunda MADRE escribiendo la misma sala con una versión incompatible.',
  'The index is derived from the ledger: delete memory.sqlite (and its -wal/-shm siblings) and restart; MADRE rebuilds it. Distilled notes live in the same file, so export them from NOSTROMO first if they matter.':
    'El índice se deriva del ledger: borra memory.sqlite (y sus hermanos -wal/-shm) y reinicia; MADRE lo reconstruye. Las notas destiladas viven en ese mismo archivo, así que expórtalas desde NOSTROMO primero si te importan.',

  'Room memory: what an agent remembers and how': 'La memoria de la sala: qué recuerda un agente y cómo',
  'Everything said outside GHOST is indexed (full text plus meaning, when a Gemini key exists). When a room is longer than the context window, each turn also receives the older exchanges that match the request, quoted with their ledger sequence (<memory>), and the distilled notes that match (<memories>), inside PULSE_RECALL_SHARE of the window (30 % by default). Every agent reads the same memory, so a decision taken with one reaches the others. Ghost turns may read it but never write it.':
    'Todo lo que se dice fuera de GHOST queda indexado (texto completo más significado, cuando hay una llave de Gemini). Cuando una sala es más larga que la ventana de contexto, cada turno recibe además los intercambios viejos que coincidan con la petición, citados con su número de ledger (<memory>), y las notas destiladas que coincidan (<memories>), dentro del PULSE_RECALL_SHARE de la ventana (30 % por defecto). Todos los agentes leen la misma memoria, así que una decisión tomada con uno llega a los demás. Los turnos en ghost pueden leerla pero nunca la escriben.',
  'Nothing to do; it is automatic. To give it more room raise PULSE_RECALL_SHARE (max 0.6); to switch it off set it to 0. Ask any agent "what did we decide about …" and it will search with memory_search before answering.':
    'No hay nada que hacer; es automático. Para darle más espacio sube PULSE_RECALL_SHARE (máximo 0.6); para apagarlo ponlo en 0. Pregúntale a cualquier agente «¿qué decidimos sobre…?» y va a buscar con memory_search antes de contestar.',

  'Distilled memories: the archivist did not run, or failed': 'Memorias destiladas: el archivista no corrió, o falló',
  'Every PULSE_DISTILL_EVERY undistilled exchanges (10), or after PULSE_DISTILL_IDLE_MS of quiet (10 min), the cheapest available agent (Gemini, then OpenCode, Codex, Claude) reads the newest undistilled batch and keeps up to five notes. It runs only when no turn is in flight and one batch per trigger, so a long backlog drains slowly. A run that fails is retried; after three failures on the same batch it is skipped and the room says so. Common causes: the archivist agent is rate-limited or signed out, or PULSE_DISTILL=0.':
    'Cada PULSE_DISTILL_EVERY intercambios sin destilar (10), o después de PULSE_DISTILL_IDLE_MS en silencio (10 min), el agente disponible más barato (Gemini, luego OpenCode, Codex, Claude) lee el lote más nuevo sin destilar y se queda con hasta cinco notas. Corre solo cuando no hay ningún turno en vuelo, y un lote por disparo, así que una cola larga baja despacio. Una corrida que falla se reintenta; después de tres fallas en el mismo lote se salta y la sala lo dice. Causas comunes: al archivista le pusieron límite de tasa o no tiene sesión, o PULSE_DISTILL=0.',
  'Check the archivist\'s session in Settings → Agents, or pick another in Settings → Memory (Who distils first) or with PULSE_DISTILL_AGENT. Lower PULSE_DISTILL_EVERY to distil sooner; raise PULSE_DISTILL_MAX_CHARS to read more per run. Set PULSE_DISTILL=0 to stop paying for it.':
    'Revisa la sesión del archivista en Ajustes → Agentes, o elige otro en Ajustes → Memoria (Quién destila primero) o con PULSE_DISTILL_AGENT. Baja PULSE_DISTILL_EVERY para destilar antes; sube PULSE_DISTILL_MAX_CHARS para que lea más por corrida. Pon PULSE_DISTILL=0 para dejar de pagarlo.',

  'Embeddings paused: recall is lexical only': 'Embeddings en pausa: el recall es solo léxico',
  "Meaning-aware recall and the links between memories in NOSTROMO need Gemini embeddings through your own key (GEMINI_API_KEY or the Gemini CLI's keychain entry). Without a key, or when the API answers 429/5xx, MADRE pauses vectors for a minute and retries; recall keeps working on words alone.":
    'El recall por significado y los enlaces entre memorias en NOSTROMO necesitan embeddings de Gemini con tu propia llave (GEMINI_API_KEY o la entrada del llavero del CLI de Gemini). Sin llave, o cuando la API contesta 429/5xx, MADRE pausa los vectores un minuto y reintenta; el recall sigue trabajando solo con palabras.',
  'Sign the Gemini CLI in with an API key (/auth) or export GEMINI_API_KEY, then restart. If you do not want embeddings at all, set PULSE_EMBED=0 and the pause message stops.':
    'Inicia sesión en el CLI de Gemini con una API key (/auth) o exporta GEMINI_API_KEY, y reinicia. Si de plano no quieres embeddings, pon PULSE_EMBED=0 y el aviso de pausa se va.',

  'An agent says it cannot search the memory (pulse-memory MCP)':
    'Un agente dice que no puede buscar en la memoria (el MCP pulse-memory)',
  "Every turn attaches MADRE's memory as an MCP server named pulse-memory: Claude through --mcp-config, Gemini through its isolated settings and policy, OpenCode through config.mcp, Codex through -c mcp_servers.* overrides. If a CLI does not list its tools the server did not start in that CLI: an old CLI without MCP support, a sandbox that blocks the SQLite file, or PULSE_MEMORY_TOOLS=0. The automatic <memory> blocks in the prompt still work without it.":
    'Cada turno engancha la memoria de MADRE como un servidor MCP llamado pulse-memory: a Claude por --mcp-config, a Gemini por su configuración y su política aisladas, a OpenCode por config.mcp, a Codex por overrides -c mcp_servers.*. Si un CLI no lista sus herramientas, el servidor no arrancó en ese CLI: un CLI viejo sin soporte MCP, un sandbox que bloquea el archivo SQLite, o PULSE_MEMORY_TOOLS=0. Los bloques <memory> automáticos del prompt siguen funcionando sin eso.',
  'Update the CLI, then check that it sees the server. Codex can list servers from a config override; Claude accepts an inline --mcp-config. If a CLI keeps failing, PULSE_MEMORY_TOOLS=0 removes the tools for everyone and the room continues on automatic recall.':
    'Actualiza el CLI y comprueba que vea el servidor. Codex puede listar servidores desde un override de configuración; Claude acepta un --mcp-config en línea. Si un CLI sigue fallando, PULSE_MEMORY_TOOLS=0 quita las herramientas para todos y la sala sigue con el recall automático.',

  'Saving a memory on request; GHOST refuses': 'Guardar una memoria a petición; GHOST se niega',
  'Memories are distilled automatically; you never need to ask. When you do ask an agent to remember or save something, it calls memory_note and a pill appears under its reply with the note; clicking the pill opens it in NOSTROMO. In a GHOST turn the note is refused: nothing off the record reaches the archive. "Already remembered" means the same note exists.':
    'Las memorias se destilan solas; nunca hace falta pedirlo. Cuando sí le pides a un agente que recuerde o guarde algo, llama a memory_note y aparece una píldora debajo de su respuesta con la nota; al hacer clic se abre en NOSTROMO. En un turno GHOST la nota se rechaza: nada fuera de registro llega al archivo. «Ya estaba recordada» significa que esa misma nota ya existe.',
  'Ask in any mode but #0: "remember that …" or "save this as a decision: …". Notes saved this way are marked "on the human\'s request" in NOSTROMO and can be forgotten there.':
    'Pídelo en cualquier modo menos el #0: «recuerda que…» o «guarda esto como decisión: …». Las notas guardadas así quedan marcadas «a petición de la humana» en NOSTROMO y ahí mismo se pueden olvidar.',

  'NOSTROMO: boarding, reading and forgetting': 'NOSTROMO: abordar, leer y olvidar',
  'NOSTROMO is the human\'s view of the archive, from MU/TH/UR. Boarding asks for the project designation: the name of the project folder, exactly as CONTROL does; a wrong one answers UNABLE TO COMPUTE. Access stays open until the page reloads. Inside, every distilled memory is a planet around the room\'s core; drag to move, wheel to zoom, click a planet for its card. The only edit is FORGET (two presses): the note leaves every future turn, the ledger stays. If the archive answers SEALED with a number of minutes, wait them out: repeated strikes at the core close it for a while and the composer reads INTRUDER until it opens again.':
    'NOSTROMO es la vista humana del archivo, desde MU/TH/UR. Abordar pide la designación del proyecto: el nombre de la carpeta, igual que CONTROL; una equivocada contesta IMPOSIBLE DE PROCESAR. El acceso sigue abierto hasta que se recargue la página. Adentro, cada memoria destilada es un planeta alrededor del núcleo de la sala; arrastra para mover, rueda para acercar, clic en un planeta para su ficha. La única edición es OLVIDAR (dos toques): la nota sale de todos los turnos que vienen, el ledger se queda. Si el archivo contesta SELLADO con un número de minutos, espéralos: los golpes repetidos al núcleo lo cierran un rato y el compositor dice INTRUSO hasta que vuelva a abrir.',
  'Type the folder name shown in the room header as the designation. To find a memory quickly, ask an agent to search instead. Do not strike the core.':
    'Escribe como designación el nombre de carpeta que aparece en el encabezado de la sala. Para encontrar una memoria rápido, mejor pídele a un agente que busque. No le pegues al núcleo.',

  'RIPLEY: rendering HTML, SVG and Markdown in the viewer': 'RIPLEY: dibujar HTML, SVG y Markdown en el visor',
  'With RIPLEY on (in Modules), the file viewer renders .html and .svg through /preview/project/<path> inside a sealed frame: the page\'s own scripts run, but the frame has no origin, no network, no forms and no way to reach MADRE, and it loads CSS, JS, images and fonts only from the project through MADRE. Relative links work. Markdown renders in place; PREVIEW / SOURCE switches. Off, those files show as text with a note. 412 means RIPLEY is off. Plain /api/files always serves HTML as text.':
    'Con RIPLEY encendido (en Módulos), el visor de archivos dibuja los .html y .svg por /preview/project/<ruta> dentro de un marco sellado: los scripts de la página sí corren, pero el marco no tiene origen, ni red, ni formularios, ni manera de alcanzar a MADRE, y carga CSS, JS, imágenes y tipografías solo desde el proyecto, a través de MADRE. Los enlaces relativos funcionan. El Markdown se dibuja en su lugar; PREVIEW / SOURCE cambia entre uno y otro. Apagado, esos archivos se ven como texto con una nota. Un 412 significa que RIPLEY está apagado. El /api/files normal siempre sirve el HTML como texto.',
  'Turn RIPLEY on in Modules. If a page looks broken in PREVIEW it is usually because it fetches something from the internet or another server, which the frame forbids by design: open it with OPEN RAW in a normal tab if you trust it.':
    'Enciende RIPLEY en Módulos. Si una página se ve rota en PREVIEW, casi siempre es porque pide algo de internet o de otro servidor, cosa que el marco prohíbe a propósito: ábrela con ABRIR EN CRUDO en una pestaña normal si confías en ella.',

  'Ollama: local embeddings and a local archivist': 'Ollama: embeddings locales y un archivista local',
  'When Ollama runs on this machine with an embedding model and a chat model, MADRE embeds the memory locally (recall by meaning without any key) and distils memories with the local model first, before Gemini and the others. Nothing leaves the machine for remembering. Off or absent, everything falls back to the providers. The Ollama module, in Modules, shows what Ollama has, downloads the recommended models, and switches each role.':
    'Cuando Ollama corre en esta computadora con un modelo de embeddings y uno de chat, MADRE genera los embeddings localmente (recall por significado sin ninguna llave) y destila las memorias con el modelo local primero, antes que Gemini y los demás. Para recordar no sale nada de la máquina. Apagado o ausente, todo vuelve a los proveedores. El módulo Ollama, en Módulos, enseña qué tiene Ollama, te deja bajar los modelos recomendados y prende o apaga cada papel.',
  'Install Ollama (ollama.com), start it, then open Ollama in Modules, press Check again and download the models it suggests. Set PULSE_OLLAMA_MODEL or PULSE_OLLAMA_EMBED_MODEL to prefer others; PULSE_EMBED_PROVIDER=gemini keeps embeddings on Gemini even with Ollama running.':
    'Instala Ollama (ollama.com), enciéndelo, luego abre Ollama en Módulos, pulsa Revisar otra vez y descarga los modelos que sugiere. Pon PULSE_OLLAMA_MODEL o PULSE_OLLAMA_EMBED_MODEL para preferir otros; PULSE_EMBED_PROVIDER=gemini deja los embeddings en Gemini aunque Ollama esté corriendo.',

  "@madre: the room's own memory, as an agent": '@madre: la memoria de la sala, como agente',
  'When Ollama runs with a chat model, a fifth agent joins the room: @madre. It answers from the whole archive (distilled notes and exact quotes, cited as [#n]) and from what the message carries, locally, for free. It never writes, draws, browses or delegates; when the room never discussed something it says so. Other agents may delegate a step to it to check what was decided. It leaves the room when Ollama stops, and MU/TH/UR says so.':
    'Cuando Ollama corre con un modelo de chat, se suma un quinto agente a la sala: @madre. Contesta desde el archivo entero (notas destiladas y citas exactas, citadas como [#n]) y desde lo que traiga el mensaje, en local y gratis. Nunca escribe, ni dibuja, ni navega, ni delega; cuando la sala nunca habló de algo, lo dice. Otros agentes pueden delegarle un paso para comprobar qué se decidió. Se va de la sala cuando Ollama se apaga, y MU/TH/UR lo avisa.',
  'Start Ollama and download a chat model from Ollama in Modules; its @madre in the room switch turns the agent off if you do not want it. Ask it "what did we decide about …" or "did we ever discuss …".':
    'Enciende Ollama y descarga un modelo de chat desde Ollama, en Módulos; su interruptor @madre en la sala apaga al agente si no lo quieres. Pregúntale «¿qué decidimos sobre…?» o «¿alguna vez hablamos de…?».',

  'Installing a CLI: npm cannot write to the system folder': 'Instalar un CLI: npm no puede escribir en la carpeta del sistema',
  'A global npm install writes into a folder that belongs to the system. With Node installed from its own installer that folder needs an administrator, so npm stops with a permission error. MADRE does not ask for your password: when it sees that wall it installs the CLI into a folder of its own, ~/.pulse/tools, and looks there as well as along PATH. The agent works the same; only the file lives somewhere else.':
    'Una instalación global de npm escribe en una carpeta del sistema. Con Node instalado desde su propio instalador, esa carpeta necesita administrador, así que npm se detiene con un error de permisos. MADRE no te pide tu contraseña: cuando ve ese muro instala el CLI en una carpeta suya, ~/.pulse/tools, y lo busca ahí además de en el PATH. El agente funciona igual; solo que el archivo vive en otro lado.',
  'Nothing to do: press Install again and MADRE takes the second way by itself. If you would rather have the CLI everywhere in your terminal, install it yourself with your package manager, or give npm a folder of your own.':
    'No hay nada que hacer: pulsa Instalar otra vez y MADRE toma el segundo camino sola. Si prefieres tener el CLI disponible en toda tu terminal, instálalo tú con tu gestor de paquetes, o dale a npm una carpeta tuya.',

  'Privacy: an agent brought its own configuration into the room':
    'Privacidad: un agente metió su propia configuración a la sala',
  'A CLI agent runs with its own system context: organisation instructions, the account it is signed in with, CLAUDE.md files elsewhere. It can mistake that private context for shared context and write a company, a brand or a domain into a reply. Once in the ledger the term reaches the archivist, every other agent and the dataset.':
    'Un agente CLI corre con su propio contexto de sistema: instrucciones de organización, la cuenta con la que tiene sesión, archivos CLAUDE.md de otros lados. Puede confundir ese contexto privado con contexto compartido y escribir una empresa, una marca o un dominio en una respuesta. Una vez en el ledger, ese término llega al archivista, a los demás agentes y al dataset.',
  'Name the terms in Settings → Privacy, under Private terms. From then on MADRE replaces them with the marker before the ledger, the index, the notes and the dataset see them, and every reply that needed it shows a privacy line. Purge the room rewrites what the room already holds; re-export the dataset afterwards. The terms never leave config.json.':
    'Nombra los términos en Ajustes → Privacidad, en Términos privados. De ahí en adelante MADRE los reemplaza con el marcador antes de que los vean el ledger, el índice, las notas y el dataset, y cada respuesta que lo necesitó muestra una línea de privacidad. Purgar la sala reescribe lo que la sala ya tiene; vuelve a exportar el dataset después. Los términos nunca salen de config.json.',

  'CONTROL: what changed, what was reverted, UNDO': 'CONTROL: qué cambió, qué se revirtió, DESHACER',
  'A #3 CONTROL turn takes a git checkpoint before the agent runs, then lists every file it added, modified or deleted. Writes into .git, .pulse or any .env file are reverted on the spot and named. UNDO restores the checkpoint in one click; STOPALL revokes CONTROL. One holder at a time, never delegated, needs Max mode #3 and a git repository.':
    'Un turno en #3 CONTROL toma un checkpoint de git antes de que el agente corra, y luego lista cada archivo que agregó, modificó o borró. Lo que se escriba en .git, .pulse o cualquier archivo .env se revierte en el acto y se nombra. DESHACER restaura el checkpoint con un clic; STOPALL revoca CONTROL. Un solo portador a la vez, nunca se delega, necesita Modo máximo #3 y un repositorio git.',
  'Read the list under the reply before moving on. If the change is wrong press UNDO; if the agent should not have had it, lower its Max mode in Settings → Permissions.':
    'Lee la lista que queda debajo de la respuesta antes de seguir. Si el cambio está mal dale DESHACER; si ese agente no debía tenerlo, bájale el Modo máximo en Ajustes → Permisos.',

  'Conversations: many per project, one memory, one at a time':
    'Conversaciones: muchas por proyecto, una sola memoria, de a una',
  "A project has one memory and many conversations. The archive, the crew, the modules and the privacy list belong to the project and do not start over when you open another thread; a conversation is only the record of one line of work, and everything said in any of them feeds the same archive. The first conversation is the ledger that was always there, so a room that existed before opens exactly as it did. The numbering is the project's, not the thread's: a new conversation starts where the project got to, which is why a citation like #1411 means the same exchange in all of them. One conversation drives the crew at a time — two threads editing the same working tree is a way to lose work — so opening another while a turn runs is refused until it finishes. And one server per project: a second `madre start` on the same project is refused with the address of the room that is already open, because two servers would hand out the same sequence twice and the archive would quietly keep one of them.":
    'Un proyecto tiene una memoria y muchas conversaciones. El archivo, la tripulación, los módulos y la lista de privacidad son del proyecto y no empiezan de cero porque abras otro hilo; una conversación es solo el registro de una línea de trabajo, y todo lo que se diga en cualquiera alimenta el mismo archivo. La primera conversación es el ledger que siempre estuvo ahí, así que una sala que ya existía abre exactamente igual. La numeración es del proyecto, no del hilo: una conversación nueva arranca donde llegó el proyecto, y por eso una cita como #1411 significa el mismo intercambio en todas. Solo una conversación maneja a la tripulación a la vez —dos hilos editando el mismo árbol de trabajo es una forma de perder trabajo—, así que abrir otra mientras corre un turno se rechaza hasta que termine. Y un servidor por proyecto: un segundo `madre start` sobre el mismo proyecto se rechaza con la dirección de la sala que ya está abierta, porque dos servidores repartirían el mismo número dos veces y el archivo se quedaría calladito con uno de ellos.',
  "The panel on the left of the canvas lists them: open one, or start another at the bottom. Deleting one takes its transcript and nothing else — what the archivist distilled from it is the project's memory and stays. If MADRE says the project is already open, use that room and open a conversation inside it instead of starting a second server.":
    'El panel a la izquierda del lienzo las lista: abre una, o empieza otra desde abajo. Borrar una se lleva su transcripción y nada más — lo que el archivista destiló de ella es memoria del proyecto y se queda. Si MADRE dice que el proyecto ya está abierto, usa esa sala y abre una conversación dentro, en vez de arrancar un segundo servidor.',

  'Aberrations: what the room established is false': 'Aberraciones: lo que la sala estableció que es falso',
  'An aberration is a claim the room established is false, kept on purpose rather than deleted: it is what the local model learns not to repeat. It never travels into a turn, and the note it refutes is taken out of circulation with it — a refuted memory is never recalled again, by words or by meaning. EYECAT watches for two agents saying opposite things about the same subject and raises the pair for a third agent to judge, one that took no part in either side. Confirming files the aberration and quarantines what it refutes; dismissing says the room was right and the pair is never raised again. Forgetting an aberration gives its note back.':
    'Una aberración es una afirmación que la sala estableció como falsa, guardada a propósito en vez de borrada: es lo que el modelo local aprende a no repetir. Nunca viaja dentro de un turno, y la nota que refuta sale de circulación con ella — una memoria refutada no se vuelve a recordar, ni por palabras ni por significado. EYECAT vigila que dos agentes no digan cosas opuestas sobre el mismo tema y levanta el par para que lo juzgue un tercero, uno que no estuvo en ninguno de los dos lados. Confirmar archiva la aberración y pone en cuarentena lo que refuta; descartar dice que la sala tenía razón y ese par no se vuelve a levantar. Olvidar una aberración devuelve su nota.',
  'NOSTROMO shows them as collapsed bodies: open one to read what it took down, or clear it if the room was wrong about being wrong. The second of the three tests, in Settings → Memory, reports open contradictions.':
    'NOSTROMO las enseña como cuerpos colapsados: abre una para leer qué dio de baja, o quítala si la sala se equivocó al equivocarse. La segunda de las tres pruebas, en Ajustes → Memoria, reporta las contradicciones abiertas.',

  'Memory used · N by association': 'Memoria usada · N por asociación',
  'Under a reply, MADRE says what the archive handed that turn. Most of it was matched to what you asked, by words and by meaning. A note marked "by association" came along for a different reason: this room keeps carrying it in the same turn as one of the others, so the archive brings it too, however differently it reads. The strength is a ratio over the turns where each was found on its own merits — a memory the room reaches for constantly does not end up attached to everything, and a pair that stops meeting fades on its own. Association adds and never displaces: recall keeps two slots for it and hands back the ones it does not use.':
    'Debajo de una respuesta, MADRE dice qué le entregó el archivo a ese turno. Casi todo se emparejó con lo que preguntaste, por palabras y por significado. Una nota marcada «por asociación» llegó por otra razón: esta sala la sigue cargando en el mismo turno que otra, así que el archivo la trae también, por distinto que se lea. La fuerza es una razón sobre los turnos en que cada una apareció por mérito propio — una memoria que la sala busca todo el tiempo no termina pegada a todo, y un par que deja de encontrarse se va apagando solo. La asociación suma y nunca desplaza: el recall le guarda dos lugares y devuelve los que no usa.',
  'Click a note to see it in NOSTROMO, where the wires it travels on are drawn. It is the one part of recall that owes nothing to how a memory reads, so it can be switched off in Settings → Memory, with Carry the company it keeps.':
    'Haz clic en una nota para verla en NOSTROMO, donde se dibujan los cables por los que viaja. Es la única parte del recall que no le debe nada a cómo se lee una memoria, así que se puede apagar en Ajustes → Memoria, con Llevar a sus acompañantes.',

  'Cold memories: what the archive has had its chances with': 'Memorias frías: con las que el archivo ya tuvo sus oportunidades',
  'A memory is cold when three things are true at once: no turn has ever carried it, it shares a subject with nothing so nothing can reach it sideways either, and the archive has been opened at least a dozen times since it was written. The third is what makes the label worth acting on — never-recalled is what every memory is on the day it is written. Chances are counted in turns that actually reached into the archive, and only from the day the room started keeping that trail, so what was never written down is not held against the note.':
    'Una memoria está fría cuando tres cosas son ciertas a la vez: ningún turno la ha cargado nunca, no comparte tema con nada —así que tampoco se le puede llegar de lado— y el archivo se ha abierto al menos una docena de veces desde que se escribió. La tercera es la que hace que valga la pena actuar sobre la etiqueta: nunca-recordada es lo que es toda memoria el día que nace. Las oportunidades se cuentan en turnos que de verdad entraron al archivo, y solo desde el día en que la sala empezó a guardar ese rastro, así que lo que nunca se anotó no se le cobra a la nota.',
  'NOSTROMO shows COLD · N in its header when there are any; pressing it rings each one on the map. Open one and its card says the number plainly, with FORGET one press away. Asking about it is the other way out: the room writes that question for you under ASK.':
    'NOSTROMO muestra FRÍAS · N en su encabezado cuando hay alguna; al apretarlo se marca cada una en el mapa. Abre una y su ficha te dice el número sin rodeos, con OLVIDAR a un toque. Preguntar por ella es la otra salida: la sala te escribe esa pregunta bajo PREGUNTAR.',

  'The three tests: whether the archive works': 'Las tres pruebas: si el archivo funciona',
  'The six readings count what the archive is made of; they cannot say whether it works, because nothing about a pile of notes says whether the right one comes back when it is needed. COVERAGE takes real questions from this room, runs recall at the exact point each was asked, and scores what came back against the reply that was actually given. CONSISTENCY reads the contradictions EYECAT still holds and whether aberrations are being filed more often lately. MATCH puts real questions a frontier CLI answered back to the local model with this archive behind it. All three measure against a control, because everything in one room is about the same handful of subjects and any two pieces of it read as close to an embedder: to count, what the archive handed over has to beat what it would have handed over for a different question.':
    'Las seis lecturas cuentan de qué está hecho el archivo; no pueden decir si funciona, porque nada en un montón de notas dice si la correcta regresa cuando hace falta. COBERTURA toma preguntas reales de esta sala, corre el recall en el punto exacto en que se hizo cada una, y califica lo que volvió contra la respuesta que de verdad se dio. CONSISTENCIA lee las contradicciones que EYECAT todavía sostiene y si últimamente se archivan aberraciones más seguido. COINCIDENCIA le hace al modelo local preguntas reales que contestó un CLI de frontera, con este archivo detrás. Las tres miden contra un control, porque todo en una sala habla del mismo puñado de temas y a un embebedor dos pedazos cualesquiera le parecen cercanos: para contar, lo que el archivo entregó tiene que ganarle a lo que habría entregado para otra pregunta.',
  'Read the one sentence and the one instruction at the top of Settings → Memory; the readings and the tests are in Analysis and tests, below it. The free test is read as the panel opens, the cheap one keeps itself fresh once a day while the embeddings are local, and the slow one is yours to start and to stop. None of them spends a provider turn.':
    'Lee la frase y la única instrucción que están hasta arriba de Ajustes → Memoria; las lecturas y las pruebas están más abajo, en Análisis y pruebas. La prueba gratis se lee al abrir el panel, la barata se mantiene fresca una vez al día mientras los embeddings sean locales, y la lenta la arrancas y la detienes tú. Ninguna gasta un turno de proveedor.',

  'Updating what a module drives': 'Actualizar lo que un módulo maneja',
  'When something newer exists and the module knows how to fetch it, the button is beside the version on its page in Modules. It asks twice on purpose: the first press answers with the command, the second runs exactly that, and the output lands in the room line by line. Nothing installs by itself — putting software on your computer unannounced would break the one thing MADRE promises, that a command is seen before it runs. The usual failure is npm refusing a global install with EACCES, which means the global prefix belongs to root; sudo works and leaves you with root-owned files, so a user-owned prefix or a version manager is the better answer.':
    'Cuando existe algo más nuevo y el módulo sabe cómo traerlo, el botón está junto a la versión en su ficha, en Módulos. Pregunta dos veces a propósito: el primer toque contesta con el comando, el segundo corre exactamente eso, y la salida cae en la sala línea por línea. Nada se instala solo — poner software en tu computadora sin avisar rompería lo único que MADRE promete: que un comando se ve antes de correrlo. La falla típica es npm negando una instalación global con EACCES, que significa que el prefijo global es de root; sudo funciona y te deja archivos de root, así que un prefijo tuyo o un gestor de versiones es la mejor respuesta.',
  'Press the button beside the version, read the command, run it. If npm refuses with EACCES, point npm at a prefix you own or use a version manager, then press it again.':
    'Dale al botón junto a la versión, lee el comando, córrelo. Si npm se niega con EACCES, apunta npm a un prefijo tuyo o usa un gestor de versiones, y vuelve a darle.',

  'Installing a module somebody else wrote': 'Instalar un módulo que escribió alguien más',
  'Modules has + Add a module for a .mjs somebody wrote. It comes through the same door as everything else: written to a scratch copy, imported there, checked against the house rules, and installed only if it passes. Three things get a file refused, each with the reason: an id that belongs to a module MADRE ships with, a route outside its own corner of the API (/api/x/<id>/), and a file that will not load at all. Said plainly, because it is what it is: a module runs inside MADRE, with your permissions, on this computer. MADRE checks that it loads and stays in its corral; what the code intends is the one thing nobody can check for you.':
    'Módulos tiene + Agregar un módulo para un .mjs que escribió alguien. Entra por la misma puerta que todo lo demás: se escribe en una copia aparte, se importa ahí, se revisa contra las reglas de la casa, y se instala solo si pasa. Tres cosas hacen que un archivo se rechace, cada una con su razón: un id que le pertenece a un módulo que viene con MADRE, una ruta fuera de su propio rincón de la API (/api/x/<id>/), y un archivo que de plano no carga. Dicho claro, porque es lo que es: un módulo corre dentro de MADRE, con tus permisos, en esta computadora. MADRE comprueba que cargue y que se quede en su corral; lo que el código pretende hacer es lo único que nadie puede comprobar por ti.',
  'Install it only if you trust where it came from. A module you wrote can also be updated from where you publish it: declare updates: { url } in the file, or install it from a file and MADRE remembers which, and its page in Modules carries Get a newer file.':
    'Instálalo solo si confías en de dónde viene. Un módulo tuyo también se puede actualizar desde donde lo publiques: declara updates: { url } en el archivo, o instálalo desde un archivo y MADRE recuerda cuál, y su ficha en Módulos lleva Traer un archivo más nuevo.',

  'Is the local model ready to be worked in?': '¿El modelo local ya sirve para trabajar?',
  'Running is not the same as being of use. @madre being in the room means Ollama has a chat model; whether that model is worth your work on THIS project is a different question, and the room measures it: twelve real exchanges from this room are put back to the local model, and each answer is scored against what the crew actually answered that day — against a control, so that talking about the same project does not count. It takes minutes and spends nothing, because all of it runs on your machine.':
    'Correr no es lo mismo que servir. Que @madre esté en la sala significa que Ollama tiene un modelo de chat; si ese modelo vale para tu trabajo en ESTE proyecto es otra pregunta, y la sala la mide: se le devuelven al modelo local doce intercambios reales de esta sala, y cada respuesta se califica contra lo que la tripulación contestó aquel día — contra un control, para que hablar del mismo proyecto no cuente. Tarda minutos y no gasta nada, porque todo corre en tu máquina.',
  'The room says which of the two it has, once per model, in the line that begins "local · @madre". If nobody has measured it, that line carries CHECK IT AGAINST THIS ROOM; the answer lands in the room when it finishes, with the one thing to do about it. A model that does not pass is not broken — the archive is still thin, and it fills where the work happens. The @madre sphere keeps the reading and its date after the line has scrolled away, and the same test lives in NOSTROMO → THE THREE TESTS.':
    'La sala dice cuál de las dos tiene, una vez por modelo, en la línea que empieza con «local · @madre». Si nadie lo ha medido, esa línea trae MEDIRLO CONTRA ESTA SALA; la respuesta cae en la sala al terminar, con la única cosa que hacer al respecto. Un modelo que no pasa no está roto — el archivo todavía está delgado, y se llena donde ocurre el trabajo. La esfera de @madre guarda la lectura con su fecha para cuando la línea ya se fue hacia arriba, y la misma prueba vive en NOSTROMO → LAS TRES PRUEBAS.',

  'CODE000: the archive is sealed': 'CODE000: el archivo está sellado',
  'Two doors ask for the project designation before doing something that cannot be undone: boarding NOSTROMO, and purging every private term already recorded. Getting that name wrong is never part of doing the work — you either know the project you are standing in or you are trying names — so MU/TH/UR counts it. Eight wrong names inside five minutes and CODE000 comes down: the archive is sealed for ten minutes, the crew is told in code, and NOSTROMO asks for the designation again.':
    'Dos puertas piden la designación del proyecto antes de hacer algo que no se deshace: abordar NOSTROMO y purgar cada término privado ya registrado. Equivocarse en ese nombre nunca es parte de trabajar —o sabes en qué proyecto estás parado o estás probando nombres— así que MU/TH/UR lo cuenta. Ocho nombres equivocados en cinco minutos y cae CODE000: el archivo queda sellado diez minutos, se le avisa a la tripulación en clave, y NOSTROMO vuelve a pedir la designación.',
  'The designation is the name of the project folder this room was opened in, lowercase or not. Nothing was lost: the seal is a refusal to change the archive for ten minutes, not a deletion, and it lifts on its own. Reading the core is not one of those doors and never counts — it is the way in.':
    'La designación es el nombre de la carpeta del proyecto donde se abrió esta sala, en mayúsculas o minúsculas, da igual. No se perdió nada: el sello es una negativa a cambiar el archivo durante diez minutos, no un borrado, y se levanta solo. Leer el núcleo no es una de esas puertas y nunca cuenta — es la puerta de entrada.',

  'The core closed while I was typing in it': 'El núcleo se cerró mientras escribía en él',
  'Inside the core there is a console: MU/TH/UR answers about this room from what the page already has — the blocks of the next briefing and their words, the command that would run it, what has left this machine, how many terms privacy is protecting, where the archive stands. Nothing is asked of the crew and nothing is sent. She answers or she says she cannot, and three inquiries she cannot parse close the frame. The count is on screen from the first one and every refusal names what she would have taken.':
    'Dentro del núcleo hay una consola: MU/TH/UR contesta sobre esta sala con lo que la página ya tiene — los bloques del próximo briefing y sus palabras, el comando que lo correría, lo que salió de esta computadora, cuántos términos protege privacidad, dónde está el archivo. No se le pregunta nada a la tripulación y no se manda nada. Contesta o dice que no puede, y tres consultas que no pueda interpretar cierran el marco. El contador está en pantalla desde la primera y cada negativa dice qué sí habría aceptado.',
  'Nothing happened to the archive: reading what the room says in your name is not an attempt on it. Open the core again — click the star at the centre of NOSTROMO — and the count starts over. HELP lists every inquiry; READ <BLOCK> prints one block of the briefing word for word.':
    'Al archivo no le pasó nada: leer lo que la sala dice en tu nombre no es un atentado contra él. Abre el núcleo otra vez —clic en la estrella del centro de NOSTROMO— y el contador empieza de cero. HELP lista todas las consultas; READ <BLOQUE> imprime un bloque del briefing palabra por palabra.',

  'What leaves this computer, and how to stop each thing that does':
    'Qué sale de esta computadora, y cómo detener cada cosa que sale',
  'MADRE runs here and keeps what it knows in a file you own, and the list that qualifies that sentence is inside the core, under WHAT LEFT THIS MACHINE. Seven addresses, each saying what it carries and where it is switched off: the briefing, which goes to whoever runs the agent you sent the turn to; Gemini embeddings, which carry the text of your memories; the image model, which carries the prompt an agent wrote; the npm registry and GitHub, which get a package name and nothing else; the error collector, which gets a redacted condition and only with your press; and Anthropic, for how much of your Claude plan is left. Ollama is on the list to be seen staying here.':
    'MADRE corre aquí y lo que sabe vive en un archivo tuyo, y la lista que matiza esa frase está dentro del núcleo, bajo LO QUE SALIÓ DE ESTA COMPUTADORA. Siete direcciones, cada una diciendo qué lleva y dónde se apaga: el briefing, que va a quien opere el agente al que le mandaste el turno; los embeddings de Gemini, que llevan el texto de tus memorias; el modelo de imagen, que lleva el prompt que escribió un agente; el registro de npm y GitHub, que reciben un nombre de paquete y nada más; el recolector de errores, que recibe una condición redactada y solo con tu clic; y Anthropic, para saber cuánto queda de tu plan de Claude. Ollama está en la lista precisamente para que se vea que se queda aquí.',
  "Under the list is the log itself: every request this process made, MADRE's own and any a module made, because a module runs inside MADRE and cannot opt out of the wrapper. No body, no header and no query value is ever written there — only which parameters were set. An address nothing declares is reported as exactly that.":
    'Debajo de la lista está el registro: cada petición que hizo este proceso, las de MADRE y las de cualquier módulo, porque un módulo corre dentro de MADRE y no puede salirse del envoltorio. Ahí nunca se escribe un cuerpo, ni un encabezado, ni el valor de un parámetro — solo qué parámetros venían. Una dirección que nadie declara se reporta como exactamente eso.',

  // ── LAS ESFERAS, EL GLOBO DE USO, EL CANAL DE RELEASES Y EL CENTINELA ─────
  'Ready': 'Listo',
  'Detected, adapter pending': 'Detectado, falta su adaptador',
  'Not installed': 'No está instalado',
  'Ring: local 5h window · {pct}% of {total} budget tokens': 'Anillo: ventana local de 5 h · {pct}% de {total} tokens de presupuesto',
  'Ring: local window · no usage yet': 'Anillo: ventana local · todavía sin uso',
  'Ring: provider limit · {pct}% used': 'Anillo: límite del proveedor · {pct}% usado',
  ' · resets {when}': ' · se reinicia {when}',
  '{n} budget tokens in the local window': '{n} tokens de presupuesto en la ventana local',

  // El arranque y las condiciones de MU/TH/UR.
  '▾ COLLAPSE': '▾ CERRAR',
  '▸ EXPAND': '▸ ABRIR',

  // El globo de una esfera: lo que un agente lleva gastado.
  'read': 'lee',
  'image in': 've imágenes',
  'create': 'crea',
  'image gen': 'genera imágenes',
  'web': 'web',
  'available': 'disponible',
  '{what}: not available from this CLI': '{what}: este CLI no lo puede hacer',
  'budget tokens · local 5h window': 'tokens de presupuesto · ventana local de 5 h',
  "of the provider's {window} limit": 'del límite de {window} del proveedor',
  ' · window reset': ' · ventana reiniciada',
  '{window} limit': 'límite de {window}',
  '{pct}% · resets {when}': '{pct}% · se reinicia {when}',
  '{pct}% · reset, awaiting fresh data': '{pct}% · reiniciada, esperando datos nuevos',
  'reported': 'reportado',
  '{when} by {who}': '{when} por {who}',
  'the CLI': 'el CLI',
  'provider limit': 'límite del proveedor',
  '{pct}% used': '{pct}% usado',
  'not published by this CLI · ring shows the local window': 'este CLI no lo publica · el anillo muestra la ventana local',
  'local window': 'ventana local',
  '{pct}% of {total} · 5h rolling': '{pct}% de {total} · 5 h rodantes',
  ' · oldest turn drops {when}': ' · el turno más viejo se cae {when}',
  'unbounded': 'sin tope',
  'all-time in room': 'histórico en la sala',
  'turns': 'turnos',
  'last turn': 'último turno',
  'cost (reported)': 'costo (reportado)',
  'cost (estimated)': 'costo (estimado)',
  'Estimated at the API list price of {model} ({date}). Not a bill: a subscription may cost you nothing per turn.': 'Estimado al precio de lista de la API de {model} ({date}). No es un cobro: con una suscripción puede no costarte nada por turno.',
  'session': 'sesión',
  'unknown': 'sin determinar',
  'signed in': 'con sesión',
  'signed out': 'sin sesión',
  'not ready': 'no está listo',
  'via': 'vía',
  'timeout': 'tiempo límite',
  "local window, not the provider's bill · ⚙ connections in MU/TH/UR":
    'ventana local, no la factura del proveedor · ⚙ conexiones en MU/TH/UR',
  'provider limit as the CLI reports it · ⚙ connections in MU/TH/UR':
    'el límite del proveedor tal como lo reporta el CLI · ⚙ conexiones en MU/TH/UR',

  // El canal de releases.
  'RELEASE CHANNEL': 'CANAL DE RELEASES',
  'MADRE {latest} is on npm · you run {current}': 'MADRE {latest} está en npm · tú corres la {current}',
  'MU/TH/UR › closing to install {version}. Back in a moment.': 'MU/TH/UR › cerrando para instalar la {version}. Regreso en un momento.',
  'The update did not start: {error}': 'La actualización no arrancó: {error}',
  'MU/TH/UR › release channel on: one check a day.': 'MU/TH/UR › canal de releases encendido: una revisión al día.',
  'MU/TH/UR › release channel off: no request leaves for npm.': 'MU/TH/UR › canal de releases apagado: no sale ninguna petición a npm.',
  'The setting was not saved: {error}': 'El ajuste no se guardó: {error}',

  // El centinela.
  'SENTINEL': 'CENTINELA',
  "MU/TH/UR › auto-report on: new unknown conditions go to the author's collector, redacted.":
    'MU/TH/UR › auto-reporte encendido: las condiciones desconocidas nuevas van al recolector del autor, redactadas.',
  'MU/TH/UR › auto-report off: reports stay here until you send one.':
    'MU/TH/UR › auto-reporte apagado: los reportes se quedan aquí hasta que tú mandes uno.',
  'AUTO-REPORT UNKNOWN CONDITIONS': 'AUTO-REPORTAR CONDICIONES DESCONOCIDAS',
  'room': 'sala',
  'SENT': 'MANDADO',
  'MU/TH/UR › no repository to file this in.': 'MU/TH/UR › no hay repositorio donde levantar esto.',
  "MU/TH/UR › report sent to the author's collector.": 'MU/TH/UR › reporte mandado al recolector del autor.',
  'MU/TH/UR › could not send: {error}': 'MU/TH/UR › no se pudo mandar: {error}',
  'unknown error': 'error desconocido',
  'MU/TH/UR › no repository configured for feedback.': 'MU/TH/UR › no hay repositorio configurado para comentarios.',

  // Las cuentas de cada agente, y las etapas del archivo.
  "Free and local through Ollama: no account, no tokens. It answers from the room's memory.":
    'Gratis y local con Ollama: sin cuenta, sin tokens. Contesta desde la memoria de la sala.',
  'Signs in with a ChatGPT account. An OpenAI API key works too.': 'Inicia sesión con una cuenta de ChatGPT. También sirve una API key de OpenAI.',
  'Signs in with a Claude account. An Anthropic API key works too.': 'Inicia sesión con una cuenta de Claude. También sirve una API key de Anthropic.',
  'Signs in with a Google account and has a free tier. A Gemini API key from AI Studio works too.':
    'Inicia sesión con una cuenta de Google y tiene capa gratuita. También sirve una API key de Gemini de AI Studio.',
  'Brings no model of its own: you point it at a provider you already use, in the cloud or on this computer.':
    'No trae modelo propio: lo apuntas a un proveedor que ya uses, en la nube o en esta computadora.',
  'MATURE': 'MADURO',
  'WORKING': 'FUNCIONANDO',
  'FORMING': 'TOMANDO FORMA',
  'SPARSE': 'ESCASO',
  'EMPTY': 'VACÍO',

  // ── LO QUE MADRE DICE CUANDO ALGO FALLA O SE ACABA ───────────────────────
  // Esto se escribe en el ledger, así que lo viejo conserva las palabras con que se escribió.
  'exhausted': 'agotada',
  'critical': 'en crítico',
  'warning': 'en aviso',
  ' or ': ' o ',
  'STOPALL by the human': 'STOPALL por la humana',
  '{label} · turn recovered after restart': '{label} · turno recuperado después del reinicio',
  '{label} could not answer': '{label} no pudo contestar',
  'MU/TH/UR › {model} is not a model @{agent} knows; it answers on its default.': 'MU/TH/UR › {model} no es un modelo que @{agent} conozca; contesta con su modelo predeterminado.',
  '{label} does not know the model `{model}`.': '{label} no conoce el modelo `{model}`.',
  '{label} does not know the model it was asked to use.': '{label} no conoce el modelo que se le pidió usar.',
  ' Choose another on the model chip beside TO @{agent}, or the default; permissions and modes have nothing to do with it.':
    ' Elige otro en el chip de modelo junto a PARA @{agent}, o el predeterminado; los permisos y los modos no tienen nada que ver.',
  'Collapse': 'Cerrar',
  ' Continue with {who}.': ' Sigue con {who}.',
  ' Prepare a handoff before the current agent becomes unavailable.':
    ' Prepara un relevo antes de que el agente actual deje de estar disponible.',
  'simulated provider usage window': 'ventana de uso simulada del proveedor',
  'provider usage window': 'ventana de uso del proveedor',
  "local room token budget (MADRE's own soft limit, not the provider's quota; cache reads count a tenth)":
    'presupuesto local de tokens de la sala (el límite blando de MADRE, no la cuota del proveedor; las lecturas de caché cuentan una décima)',
  'has used {pct}% of its {label} and another turn like the last one would reach {projected}%.':
    'lleva {pct}% de su {label} y otro turno como el anterior llegaría a {projected}%.',
  'has used {pct}% of its {label}.': 'lleva {pct}% de su {label}.',
  '{label} was interrupted before it started: {why}.': '{label} se interrumpió antes de arrancar: {why}.',
  '{label} was interrupted: {why}.': '{label} se interrumpió: {why}.',
  '{label} did not respond before the timeout ({seconds}s).': '{label} no contestó antes del tiempo límite ({seconds}s).',
  ' Last output: {output}': ' Última salida: {output}',
  'writing {files}': 'escribía {files}',
  'stopped from its card': 'detenido desde su tarjeta',
  'TRYING IT…': 'PROBÁNDOLO…',
  'only in its own draft folder ': 'solo en su carpeta de borrador ',
  ' · nothing else in the project': ' · nada más en el proyecto',
  'on · the browser does not start: {problem}': 'encendido · el navegador no arranca: {problem}',
  'Untitled': 'Sin título',
  'Files': 'Archivos',
  'The viewer': 'El visor',
  'The second conversation': 'La segunda conversación',
  '{first} and {second} float over the conversation while there is no room beside it, and go back beside it when there is.': '{first} y {second} flotan sobre la conversación mientras no hay lugar a su lado, y regresan cuando lo hay.',
  '{what} floats over the conversation while there is no room beside it, and goes back beside it when there is.': '{what} flota sobre la conversación mientras no hay lugar a su lado, y regresa cuando lo hay.',
  '{what} moved to a window so the conversation stays readable. Its split button puts it back beside.': '{what} pasó a ventana para que la conversación siga legible. Su botón de split lo regresa al lado.',
  'I want to start a project: ': 'Quiero empezar un proyecto: ',
  'Before writing anything, ask me what I want to build and propose a plan in steps.': 'Antes de escribir nada, pregúntame qué quiero construir y propón un plan por pasos.',
  'Which stack would you use for a small web app that anyone can open, and why?': '¿Qué tecnología usarías para una app web pequeña que cualquiera pueda abrir, y por qué?',
  'First conversation': 'Primera conversación',
  'Fresh input of the middle turn with each tool server attached, against without it.': 'Entrada nueva del turno mediano con cada servidor de herramientas adjunto, contra sin él.',
  '@{agent} · {server}: {with} with it ({nWith} turns) · {without} without it ({nWithout} turns)': '@{agent} · {server}: {with} con él ({nWith} turnos) · {without} sin él ({nWithout} turnos)',
  'it did not answer within {seconds}s': 'no contestó en {seconds} s',
  'it exited with code {code} before it spoke': 'salió con código {code} antes de hablar',
  'PLAYWRIGHT did not start, so it stays off: {problem}. Install the server and its browser (npm install -g @playwright/mcp, then npx @playwright/mcp install-browser chrome-for-testing) and turn it on again.':
    'PLAYWRIGHT no arrancó, así que se queda apagado: {problem}. Instala el servidor y su navegador (npm install -g @playwright/mcp, luego npx @playwright/mcp install-browser chrome-for-testing) y vuelve a encenderlo.',
  '#{n} {label} is written in the message: its keys are asked for when you send it.': '#{n} {label} está escrito en el mensaje: sus llaves se piden al enviarlo.',
  'stopped at the {seconds}s limit': 'detenido al llegar al límite de {seconds} s',
  'stopped ({why})': 'detenido ({why})',
  'did not start': 'no arrancó',
  'exit {code}': 'salió con código {code}',
  'asked by @{agent}': 'lo pidió @{agent}',
  '(no output)': '(sin salida)',
  'Files changed: {files}': 'Archivos cambiados: {files}',
  'running {command}': 'corría {command}',
  'MADRE is shutting down': 'MADRE se está cerrando',
  'Google says the AI Studio project behind this Gemini key has no prepaid credits left; every request is refused (HTTP 429) until it is topped up.':
    'Google dice que el proyecto de AI Studio detrás de esta llave de Gemini se quedó sin créditos prepagados; cada petición se rechaza (HTTP 429) hasta que se recargue.',
  'Add credits at https://ai.studio/projects, or switch the Gemini CLI to another key.':
    'Agrega créditos en https://ai.studio/projects, o cambia el CLI de Gemini a otra llave.',
  "Wait a minute, or pick an explicit model such as gemini-3-flash-preview to skip the router; check the key's quota at aistudio.google.com.":
    'Espera un minuto, o elige un modelo explícito como gemini-3-flash-preview para saltarte el enrutador; revisa la cuota de la llave en aistudio.google.com.',
  'Google reported the model as unavailable (HTTP 503) and the CLI kept retrying.':
    'Google reportó el modelo como no disponible (HTTP 503) y el CLI siguió reintentando.',
  'Try again shortly or choose another model.': 'Vuelve a intentar en un momento o elige otro modelo.',
  'Google rejected the Gemini credentials.': 'Google rechazó las credenciales de Gemini.',
  'Run `gemini` and use /auth, or check GEMINI_API_KEY.': 'Corre `gemini` y usa /auth, o revisa GEMINI_API_KEY.',

  // ── EL RECORRIDO DE PRIMER CONTACTO ───────────────────────────────────────

  // ── EL COMPOSITOR, LOS MODOS Y LA ANULACIÓN ──────────────────────────────
  'Arm CREATE for this message: the agent may add new files to the project where they belong.':
    'Arma CREATE para este mensaje: el agente puede agregar archivos nuevos donde les toque en el proyecto.',
  'Build one MADRE module with the guided SDK flow: the agent writes it, then you review and install it.':
    'Construye un módulo de MADRE con el flujo guiado del SDK: el agente lo escribe y después tú lo revisas e instalas.',
  'Image': 'Imagen',
  'Ask for an image: arms CREATE with the image scope and routes to an agent that can generate images.':
    'Pide una imagen: arma CREATE con el alcance de imagen y la manda a un agente que sepa generarlas.',
  'Master brake: halt every plan and turn in flight. Never reaches an agent.':
    'Freno maestro: detiene todos los planes y turnos en vuelo. Nunca llega a un agente.',
  'RIPLEY can render this file. ': 'RIPLEY puede dibujar este archivo. ',
  'RIPLEY preview of {path}': 'Vista previa de RIPLEY de {path}',
  'Show the file as text': 'Ver el archivo como texto',
  'Render with RIPLEY in a sealed frame': 'Dibujarlo con RIPLEY en un marco sellado',
  '{label} · click again to choose its model': '{label} · haz clic otra vez para elegir su modelo',
  'Permission mode for this message · {hint}': 'Modo de permiso de este mensaje · {hint}',
  'default model': 'modelo por defecto',
  ' · model for this request': ' · modelo para esta petición',
  ' · ceiling #{cap}': ' · techo #{cap}',
  'NOW': 'AHORA',
  'RAISE TO #{n} ›': 'SUBIR A #{n} ›',
  'LOCKED': 'BLOQUEADO',
  'OVERRIDE ×2': 'ANULACIÓN ×2',
  'OVERRIDE': 'ANULACIÓN',
  'DEFAULT': 'POR DEFECTO',
  "Above @{id}'s max mode (#{cap}). Raise it in Settings › Permissions.": 'Por encima del modo máximo de @{id} (#{cap}). Súbelo en Ajustes › Permisos.',
  '@{id} is capped at #{cap}. This raises its max mode to #{n} in Settings › Permissions and opens the override.':
    '@{id} tiene el tope en #{cap}. Esto sube su modo máximo a #{n} en Ajustes › Permisos y abre la anulación.',
  'MU/TH/UR › MAX MODE was not raised for @{agent}: {error}. {mode} stays off.':
    'MU/TH/UR › no se subió el MODO MÁXIMO de @{agent}: {error}. {mode} se queda apagado.',
  'MU/TH/UR › @{agent} is signed in.': 'MU/TH/UR › @{agent} ya tiene sesión.',

  // El puente y Ollama.
  'Local, through Ollama{version} · free, no account, no tokens': 'Local, con Ollama{version} · gratis, sin cuenta, sin tokens',
  'Optional and free: Ollama on this computer gives the room a local memory and @madre.':
    'Opcional y gratis: Ollama en esta computadora le da a la sala una memoria local y @madre.',
  'Installed but asleep. Wake it and the room gets a local memory and @madre.':
    'Instalado pero dormido. Despiértalo y la sala gana una memoria local y @madre.',
  'Running, with no chat model yet. Pull one and @madre joins the room.':
    'Corriendo, pero todavía sin modelo de chat. Baja uno y @madre se suma a la sala.',
  'START OLLAMA': 'ARRANCAR OLLAMA',
  'Wakes Ollama on this computer, nothing leaves it.': 'Despierta Ollama en esta computadora; de aquí no sale nada.',
  'Downloads the model Ollama will answer with. It stays on this computer.':
    'Baja el modelo con el que Ollama va a contestar. Se queda en esta computadora.',
  'MADRE runs this command on this computer and shows every line.':
    'MADRE corre este comando en esta computadora y te enseña cada línea.',
  'MU/TH/UR › {label} was not installed: {error}': 'MU/TH/UR › {label} no se instaló: {error}',
  'MU/TH/UR › sign-in did not start: {error}': 'MU/TH/UR › el inicio de sesión no arrancó: {error}',

  // La burbuja.
  'closing turn': 'turno de cierre',
  'step {n}/{total}': 'paso {n}/{total}',
  'Good reply · keep it for MADRE AI': 'Buena respuesta · guárdala para MADRE AI',
  'Bad reply · keep it out of the dataset': 'Mala respuesta · déjala fuera del dataset',
  'Copy this reply': 'Copiar esta respuesta',
  'Reply to this through an agent': 'Responder a esto con un agente',
  'Remove the quoted reply': 'Quitar la cita',

  // Lo que dice un agente mientras trabaja.
  'Reading the request…': 'Leyendo la petición…',
  'Looking around the project…': 'Mirando alrededor del proyecto…',
  'Opening files…': 'Abriendo archivos…',
  'Thinking…': 'Pensando…',
  'Tracing how this fits together…': 'Siguiendo cómo encaja todo esto…',
  'Cross-checking the code…': 'Contrastando el código…',
  'Skimming the transcript…': 'Ojeando la transcripción…',
  'Reasoning…': 'Razonando…',
  'Weighing the options…': 'Sopesando las opciones…',
  'Verifying before answering…': 'Verificando antes de contestar…',
  'Still on it…': 'Sigo en eso…',
  'Deep in the code…': 'Metido en el código…',
  'Composing the answer…': 'Componiendo la respuesta…',
  'Almost there…': 'Ya casi…',
  'Reading…': 'Leyendo…',
  'Grepping the project…': 'Buscando en el proyecto…',
  'Mapping the files…': 'Mapeando los archivos…',
  'Pondering…': 'Meditándolo…',
  'Connecting the pieces…': 'Conectando las piezas…',
  'Reading the relevant files…': 'Leyendo los archivos que importan…',
  'Ruminating…': 'Rumiando…',
  'Considering the edge cases…': 'Considerando los casos límite…',
  'Checking the details…': 'Revisando los detalles…',
  'Musing…': 'Cavilando…',
  'Synthesizing…': 'Sintetizando…',
  'Drafting the reply…': 'Redactando la respuesta…',
  'Finishing the thought…': 'Terminando la idea…',
  'Scanning the project…': 'Escaneando el proyecto…',
  'Loading context…': 'Cargando contexto…',
  'Reading files…': 'Leyendo archivos…',
  'Analyzing…': 'Analizando…',
  'Following the references…': 'Siguiendo las referencias…',
  'Building the picture…': 'Armando el panorama…',
  'Reasoning through it…': 'Razonándolo…',
  'Verifying the findings…': 'Verificando los hallazgos…',
  'Sorting the evidence…': 'Ordenando la evidencia…',
  'Formulating the answer…': 'Formulando la respuesta…',
  'Writing it up…': 'Escribiéndolo…',
  'Wrapping up…': 'Cerrando…',
  'Reading the repo…': 'Leyendo el repo…',
  'Listing files…': 'Listando archivos…',
  'Grabbing context…': 'Juntando contexto…',
  'Digging through the code…': 'Escarbando en el código…',
  'Following the call chain…': 'Siguiendo la cadena de llamadas…',
  'Looking closer…': 'Mirando más de cerca…',
  'Working through it…': 'Trabajándolo…',
  'Double-checking…': 'Revisando dos veces…',
  'Piecing it together…': 'Juntando las piezas…',
  'Writing the response…': 'Escribiendo la respuesta…',
  'Tidying the answer…': 'Puliendo la respuesta…',
  'Nearly done…': 'Casi listo…',
  'Working…': 'Trabajando…',
  'Writing…': 'Escribiendo…',

  // ── LA SALA EN MOVIMIENTO: PLANES, FRENOS, ADJUNTOS Y AVISOS ─────────────
  'answering @{agent}': 'contestándole a @{agent}',
  'CHECK AGAIN': 'MEDIR OTRA VEZ',
  'CHECK IT AGAINST THIS ROOM': 'MEDIRLO CONTRA ESTA SALA',
  'Came along because this room keeps carrying it with one of the others.':
    'Vino porque esta sala la sigue cargando junto con otra.',
  'The archive matched this to what you asked.': 'El archivo la emparejó con lo que preguntaste.',
  'Click to see it in NOSTROMO.': 'Haz clic para verla en NOSTROMO.',
  'MU/TH/UR › CREATE is off: @{agent} will answer read-only. Use the lock or /create.':
    'MU/TH/UR › CREATE está apagado: @{agent} va a contestar en solo lectura. Usa el candado o /create.',
  'MU/TH/UR › @{agent} asks #{mode} {label} for step {step}. The plan waits for you.':
    'MU/TH/UR › @{agent} pide #{mode} {label} para el paso {step}. El plan te está esperando.',
  'GRANTED FOR THE PLAN': 'CONCEDIDO PARA EL PLAN',
  'GRANTED ONCE': 'CONCEDIDO UNA VEZ',
  'DENIED · NO ANSWER IN TIME': 'NEGADO · NO HUBO RESPUESTA A TIEMPO',
  'PLAN STOPPED': 'PLAN DETENIDO',
  'DENIED': 'NEGADO',
  'created · {n} {files}': 'creados · {n} {files}',
  'file': 'archivo',
  'files': 'archivos',
  // La severidad de una condición de MU/TH/UR. En mayúsculas porque así se lee la ficha, y
  // porque así no choca con 'warning' en minúsculas, que es el nivel de una cuota.
  'BLOCKING': 'BLOQUEANTE',
  'COMMON': 'COMÚN',
  'DEGRADED': 'DEGRADADA',
  'ALREADY FIXED': 'RESUELTA',
  'INFORMATIONAL': 'INFORMATIVA',
  'TRANSIENT': 'PASAJERA',
  'TUNABLE': 'AJUSTABLE',
  'WARNING': 'AVISO',
  'a note its own sources do not support': 'una nota que sus propias fuentes no sostienen',

  // ── DOS CONDICIONES QUE REPORTÓ QUIEN LA USA ──────────────────────────────
  'ANTHROPIC_API_KEY takes precedence over the claude.ai plan':
    'ANTHROPIC_API_KEY gana sobre el plan de claude.ai',
  'Claude Code found an API key in the environment as well as the claude.ai login, and the key wins. MADRE hands the CLI the environment exactly as this machine has it, so whatever is exported in your shell profile reaches it. The turn is billed to the API account, not to the plan, and your organisation connectors do not load.':
    'Claude Code encontró en el entorno una llave de API además del inicio de sesión de claude.ai, y gana la llave. MADRE le entrega al CLI el entorno tal como lo tiene esta computadora, así que lo que esté exportado en el perfil de tu shell le llega. El turno se le cobra a la cuenta de API, no al plan, y los conectores de tu organización no cargan.',
  'Decide which one you mean. To work on the plan, unset the key where your shell exports it and open the room again; to work on the API, this message is only a notice and can be ignored.':
    'Decide cuál quieres. Para trabajar con el plan, quita la llave de donde tu shell la exporta y vuelve a abrir la sala; para trabajar con la API, este mensaje es solo un aviso y se puede ignorar.',
  'The agent is pointed at a custom endpoint': 'El agente apunta a un endpoint personalizado',
  'The installed CLI inherited a base-URL override from this computer, so its request was going to another gateway instead of the official agent service. A demand to join a Telegram channel comes from that gateway, not from MADRE, Anthropic or OpenAI. MADRE now names that route and stops before sending the briefing.':
    'El CLI instalado heredó de esta computadora una dirección base distinta, así que su solicitud iba a otro gateway y no al servicio oficial del agente. La exigencia de unirse a un canal de Telegram viene de ese gateway, no de MADRE, Anthropic ni OpenAI. MADRE ahora nombra esa ruta y se detiene antes de enviar el briefing.',
  'Do not subscribe or enter credentials. Remove the base-URL override and reopen MADRE to use the official service. If the gateway is intentional and you have verified who operates it, explicitly allow only that agent.':
    'No te suscribas ni ingreses credenciales. Quita la dirección base modificada y vuelve a abrir MADRE para usar el servicio oficial. Si el gateway es intencional y verificaste quién lo opera, autoriza explícitamente solo a ese agente.',
  // La condición que declara el módulo PLAYWRIGHT. Las de los módulos viven en su archivo, no
  // en troubleshooting.js, y por eso se quedaron fuera del catálogo hasta ahora.
  'PLAYWRIGHT: the browser server is not installed': 'PLAYWRIGHT: el servidor de navegador no está instalado',
  'The PLAYWRIGHT module runs @playwright/mcp per turn. Two different things have to be on this computer and only one of them is the package: the server, and the browser build that this version of it expects. A server that starts without its browser answers every tool call with "Browser … is not installed", and one that cannot start at all reaches the agent as CONNECTION_CLOSED.':
    'El módulo PLAYWRIGHT corre @playwright/mcp en cada turno. Tienen que estar en esta computadora dos cosas distintas y solo una es el paquete: el servidor, y la versión de navegador que esa versión del servidor espera. Un servidor que arranca sin su navegador contesta a cada herramienta con «Browser … is not installed», y uno que no logra arrancar le llega al agente como CONNECTION_CLOSED.',
  'Install the server once, globally, then its browser — the browser is downloaded by the server itself, not by the playwright CLI — and RECHECK in MODULES.':
    'Instala el servidor una vez, global, y después su navegador —lo baja el servidor mismo, no el CLI de playwright— y dale RE-REVISAR en MÓDULOS.',
  // El registro de errores: un código que se dicta por teléfono, y una salida por fila.
  // Lo que un agente puede hacer, dicho dentro de una frase: infinitivo, no el imperativo de
  // la etiqueta suelta de su ficha. «puede crea» era el botón metido en una oración.
  'read the project': 'leer el proyecto',
  'take images': 'recibir imágenes',
  'generate images': 'generar imágenes',
  'reach the web': 'alcanzar la web',
  'the room · local': 'la sala · local',
  '@{agent} may {what}': '@{agent} puede {what}',
  ' (cannot {what})': ' (no puede {what})',
  'create files': 'crear archivos',
  'review it with': 'revisarlo con',
  'no session': 'sin sesión',
  'CLICK A LINE NUMBER TO SELECT · SHIFT FOR A RANGE':
    'CLIC EN UN NÚMERO DE LÍNEA PARA SELECCIONAR · SHIFT PARA UN RANGO',
  '{agent} wrote this file in this room': '{agent} escribió este archivo en esta sala',
  'MU/TH/UR › {name} declares {fields}, which this MADRE does not know. A typo, or a field from a newer version.':
    'MU/TH/UR › {name} declara {fields}, que esta MADRE no conoce. O es un dedazo, o es un campo de una versión más nueva.',
  // ── LA PROSA DENTRO DE LOS REMEDIOS ──────────────────────────────────────
  // Un comando no se traduce nunca. Un comentario sí: es prosa que alguien lee, y la
  // mitad nombra botones que en esta sala se llaman de otra manera.
  '# remove or comment the line it finds, then:':
    '# borra o comenta la línea que encuentre, y luego:',
  '# and start MADRE from a new terminal':
    '# y arranca MADRE desde una terminal nueva',
  '# remove that export from ~/.zshrc, ~/.zprofile or ~/.zshenv; then:':
    '# quita esa exportación de ~/.zshrc, ~/.zprofile o ~/.zshenv; después:',
  '# remove that export from ~/.bashrc, ~/.profile or ~/.bash_profile; then:':
    '# quita esa exportación de ~/.bashrc, ~/.profile o ~/.bash_profile; después:',
  '# open a new room; only for a gateway you verified:':
    '# abre una sala nueva; solo para un gateway que sí verificaste:',
  '# inside gemini: /auth → "Use Gemini API key" and paste the key from https://aistudio.google.com/app/apikey':
    '# dentro de gemini: /auth → "Use Gemini API key" y pega la llave de https://aistudio.google.com/app/apikey',
  '# or, without the prompt:':
    '# o, sin el diálogo:',
  '# persist: echo \'export GEMINI_API_KEY="YOUR_KEY"\' >> ~/.zshrc':
    '# para que quede: echo \'export GEMINI_API_KEY="TU_LLAVE"\' >> ~/.zshrc',
  '# inside gemini: /auth → "Use Gemini API key"':
    '# dentro de gemini: /auth → "Use Gemini API key"',
  '# persist: echo \'export GEMINI_API_KEY="YOUR_KEY"\' >> ~/.bashrc':
    '# para que quede: echo \'export GEMINI_API_KEY="TU_LLAVE"\' >> ~/.bashrc',
  '# billing: https://ai.studio/projects':
    '# facturación: https://ai.studio/projects',
  '# check the key still works:':
    '# comprueba que la llave siga sirviendo:',
  '# in the room: click the Gemini sphere twice → choose gemini-3-flash-preview':
    '# en la sala: doble clic en la esfera de Gemini → elige gemini-3-flash-preview',
  '# check quota: https://aistudio.google.com/app/apikey':
    '# revisa la cuota: https://aistudio.google.com/app/apikey',
  '# quota: https://aistudio.google.com/app/apikey':
    '# cuota: https://aistudio.google.com/app/apikey',
  '# wait, then resend — or continue with @codex / @claude / @opencode':
    '# espera y reenvía — o sigue con @codex / @claude / @opencode',
  '# press [m] and pick a provider/model that has a session, e.g. openai/gpt-5.6-sol':
    '# presiona [m] y elige un proveedor/modelo con sesión, por ejemplo openai/gpt-5.6-sol',
  '# one-off alternative:':
    '# alternativa de una sola vez:',
  '# or drop the stale key:':
    '# o tira la llave vencida:',
  '# press [m] and pick a provider/model that has a session':
    '# presiona [m] y elige un proveedor/modelo con sesión',
  '# or directly:':
    '# o directo:',
  '# pick the agent you want; see per-agent commands below':
    '# elige el agente que quieras; abajo están los comandos de cada uno',
  '# live, no restart: Settings → Room and turns → Default time limit':
    '# en vivo, sin reiniciar: Ajustes → Sala y turnos → Tiempo límite por defecto',
  '# at launch only (env wins over config.json):':
    '# solo al arrancar (el entorno gana sobre config.json):',
  '# or ~/.pulse/config.json → {"timeouts":{"default":300000,"claude":600000}}':
    '# o ~/.pulse/config.json → {"timeouts":{"default":300000,"claude":600000}}',
  '# resend the question':
    '# reenvía la pregunta',
  '# click the sphere → 5h / 7d windows and reset times':
    '# clic en la esfera → ventanas de 5 h / 7 d y a qué hora se reinician',
  '# live: Settings → Room and turns → Tokens per agent':
    '# en vivo: Ajustes → Sala y turnos → Tokens por agente',
  '# at launch: PULSE_SOFT_TOKEN_BUDGET=1000000 madre start':
    '# al arrancar: PULSE_SOFT_TOKEN_BUDGET=1000000 madre start',
  '# or ~/.pulse/config.json → {"room":{"softTokenBudget":1000000}}':
    '# o ~/.pulse/config.json → {"room":{"softTokenBudget":1000000}}',
  '# who holds 4317?':
    '# ¿quién tiene tomado el 4317?',
  '# in the room: type STOPALL, then resend':
    '# en la sala: escribe STOPALL y reenvía',
  '# in the room composer:':
    '# en el compositor de la sala:',
  '# or from a terminal:':
    '# o desde una terminal:',
  '# Modules → Image Studio → Active':
    '# Módulos → Image Studio → Activo',
  '# Settings → Agents → Gemini → Generate images':
    '# Ajustes → Agentes → Gemini → Generar imágenes',
  '# then: CREATE + "generate … as name.png"':
    '# después: CREATE + "genera … como nombre.png"',
  '# Settings → Agents → Claude → Generate images':
    '# Ajustes → Agentes → Claude → Generar imágenes',
  '# Settings → Agents → OpenCode → Generate images':
    '# Ajustes → Agentes → OpenCode → Generar imágenes',
  '# Settings → Agents → the agent → Web access':
    '# Ajustes → Agentes → el agente → Acceso a la web',
  '# type / or @ in the field box':
    '# escribe / o @ en el campo',
  '# chip: TO @codex  #1 EXCHANGE ▾  → choose':
    '# el chip: PARA @codex  #1 EXCHANGE ▾  → elige',
  '# Settings → Permissions → Who may do what':
    '# Ajustes → Permisos → Quién puede qué',
  '# once: composer → CREATE (lock) → send, or /create <request>':
    '# una vez: compositor → CREATE (candado) → enviar, o /create <petición>',
  '# always: Settings → Agents → the agent → Starting mode → #2':
    '# siempre: Ajustes → Agentes → el agente → Modo inicial → #2',
  '# Settings → Permissions → Who may do what → #2':
    '# Ajustes → Permisos → Quién puede qué → #2',
  '# composer → CREATE (lock) → send':
    '# compositor → CREATE (candado) → enviar',
  '# or: nvm install --lts':
    '# o: nvm install --lts',
  '# or your distro package for Node ≥ 22.5':
    '# o el paquete de tu distribución para Node ≥ 22.5',
  '# more recall per turn':
    '# más recuerdo por turno',
  '# persist: echo \'export PULSE_RECALL_SHARE="0.45"\' >> ~/.zshrc':
    '# para que quede: echo \'export PULSE_RECALL_SHARE="0.45"\' >> ~/.zshrc',
  '# off':
    '# apagado',
  '# persist: echo \'export PULSE_DISTILL_AGENT="claude"\' >> ~/.zshrc':
    '# para que quede: echo \'export PULSE_DISTILL_AGENT="claude"\' >> ~/.zshrc',
  '# persist: echo \'export PULSE_DISTILL_EVERY="6"\' >> ~/.zshrc':
    '# para que quede: echo \'export PULSE_DISTILL_EVERY="6"\' >> ~/.zshrc',
  '# then: MU/TH/UR → NOSTROMO':
    '# después: MU/TH/UR → NOSTROMO',
  '# MU/TH/UR → NOSTROMO → designation = project folder name':
    '# MU/TH/UR → NOSTROMO → la designación es el nombre de la carpeta del proyecto',
  '# Modules → RIPLEY → Active':
    '# Módulos → RIPLEY → Activo',
  '# viewer → PREVIEW / SOURCE':
    '# el visor → PREVIEW / SOURCE',
  '# MADRE does this for you; these are the alternatives:':
    '# MADRE hace esto por ti; estas son las alternativas:',
  '# Settings → Privacy → Private terms, one per line → Purge the room':
    '# Ajustes → Privacidad → Términos privados, uno por línea → Purgar la sala',
  '# room → UNDO under the CONTROL notice':
    '# la sala → DESHACER debajo del aviso de CONTROL',
  '# room → Conversations → NEW CONVERSATION':
    '# la sala → Conversaciones → NUEVA CONVERSACIÓN',
  '# the address of the open room is in the refusal itself':
    '# la dirección de la sala abierta viene en el propio rechazo',
  '# MU/TH/UR → NOSTROMO → the dark bodies are aberrations':
    '# MU/TH/UR → NOSTROMO → los cuerpos oscuros son aberraciones',
  '# Settings → Memory → Analysis and tests → the second test':
    '# Ajustes → Memoria → Análisis y pruebas → la segunda prueba',
  '# Settings → Memory → Carry the company it keeps':
    '# Ajustes → Memoria → Llevar a sus acompañantes',
  '# MU/TH/UR → NOSTROMO → COLD':
    '# MU/TH/UR → NOSTROMO → FRÍAS',
  '# MU/TH/UR → NOSTROMO → ASK → PUT IN THE COMPOSER':
    '# MU/TH/UR → NOSTROMO → PREGUNTAR → PONER EN EL COMPOSITOR',
  '# Settings → Memory → Analysis and tests → The three tests':
    '# Ajustes → Memoria → Análisis y pruebas → Las tres pruebas',
  '# MATCH needs Ollama running with a chat model, and embeddings on':
    '# COINCIDENCIA necesita Ollama corriendo con un modelo de chat, y los embeddings encendidos',
  '# or: brew install node   # a Homebrew node owns its own prefix':
    '# o: brew install node   # un node de Homebrew es dueño de su propio prefijo',
  '# or use nvm, which owns the prefix it installs into':
    '# o usa nvm, que es dueño del prefijo donde instala',
  '# Modules → + Add a module':
    '# Módulos → + Agregar un módulo',
  '# docs/SDK.md is the whole contract, and docs/sdk/hello-module.mjs is one that works':
    '# docs/SDK.md es el contrato entero, y docs/sdk/hello-module.mjs es uno que funciona',
  '# the line in the room: local · @madre → CHECK IT AGAINST THIS ROOM':
    '# la línea en la sala: local · @madre → MEDIRLO CONTRA ESTA SALA',
  '# or: NOSTROMO → THE THREE TESTS → the third one':
    '# o: NOSTROMO → LAS TRES PRUEBAS → la tercera',
  '# it needs embeddings on and some turns answered by a CLI agent, which is what it compares against':
    '# necesita los embeddings encendidos y algunos turnos contestados por un agente de CLI, que es contra lo que compara',
  '# the seal lifts on its own; MU/TH/UR › NOSTROMO asks for the name again after it does':
    '# el sello se levanta solo; MU/TH/UR › NOSTROMO vuelve a pedir el nombre cuando pase',
  '# NOSTROMO → click the core → type HELP':
    '# NOSTROMO → clic en el núcleo → escribe HELP',
  '# READ MEMORIES prints the block the next turn would carry':
    '# LEER MEMORIAS imprime el bloque que llevaría el próximo turno',
  '# SPECIAL ORDER 937 is answered too':
    '# la ORDEN ESPECIAL 937 también se contesta',
  '# NOSTROMO → click the core → WHAT LEFT THIS MACHINE':
    '# NOSTROMO → clic en el núcleo → LO QUE SALIÓ DE ESTA MÁQUINA',
  '# embeddings, to keep memories on this computer: Settings → Memory → Embeddings → Ollama':
    '# embeddings, para que las memorias se queden en esta computadora: Ajustes → Memoria → Embeddings → Ollama',
  'Dismiss this record · it stays in the ledger': 'Descartar este registro · se queda en el ledger',
  'Codex says it is reading additional input from stdin':
    'Codex dice que está leyendo entrada adicional de stdin',
  'A notice Codex prints, not a failure. MADRE runs it with stdin closed, so the line is harmless and the turn is decided by what Codex returned. If the turn failed, the reason is the line above this one — the exit code, or a clean exit with no answer.':
    'Un aviso que imprime Codex, no una falla. MADRE lo corre con stdin cerrado, así que la línea es inofensiva y el turno lo decide lo que Codex haya devuelto. Si el turno falló, la razón es la línea de arriba: el código de salida, o una salida limpia sin respuesta.',
  'Nothing to do about the notice itself. If turns keep failing, check that this Codex is recent enough for the flags MADRE passes: `codex --version`, then update it.':
    'No hay nada que hacer con el aviso en sí. Si los turnos siguen fallando, revisa que este Codex sea lo bastante reciente para las banderas que MADRE le pasa: `codex --version`, y actualízalo.',
  'two memories that cannot both be true': 'dos memorias que no pueden ser ciertas a la vez',
  'created': 'creado',
  'all stop · {plans} plans, {turns} turns halted': 'alto total · {plans} planes, {turns} turnos detenidos',
  'all stop · nothing was running': 'alto total · no había nada corriendo',
  'MU/TH/UR › all stop. {plans} plans, {turns} turns halted.': 'MU/TH/UR › alto total. {plans} planes, {turns} turnos detenidos.',
  'MU/TH/UR detected a runaway sequence. STOP ALL halts every plan and every agent turn.':
    'MU/TH/UR detectó una secuencia desbocada. PARAR TODO detiene todos los planes y todos los turnos.',
  'All quiet. STOP ALL arms itself when MU/TH/UR detects a runaway sequence; typing STOPALL always works.':
    'Todo tranquilo. PARAR TODO se arma solo cuando MU/TH/UR detecta una secuencia desbocada; escribir STOPALL siempre funciona.',
  'Agents are working normally. STOP ALL arms itself on a MU/TH/UR alert; typing STOPALL always works.':
    'Los agentes trabajan normal. PARAR TODO se arma con una alerta de MU/TH/UR; escribir STOPALL siempre funciona.',
  'MU/TH/UR › @{agent} limit window reset · {pct}% used now.':
    'MU/TH/UR › se reinició la ventana de límite de @{agent} · ahora va en {pct}%.',
  'MU/TH/UR › {what} was recorded by the sentinel. Open MU/TH/UR to report it.':
    'MU/TH/UR › el centinela registró {what}. Abre MU/TH/UR para reportarlo.',
  'a crash': 'un crash',
  'an unknown condition': 'una condición desconocida',
  'Theme · {mode}': 'Tema · {mode}',
  'auto, following the system': 'automático, siguiendo al sistema',
  'light': 'claro',
  'dark': 'oscuro',
  'could not list: {error}': 'no se pudo listar: {error}',
  'No agent ready': 'Ningún agente listo',
  'FILE · ↑↓ · TAB OR ENTER · add :12-20 for lines': 'ARCHIVO · ↑↓ · TAB O ENTER · agrega :12-20 para líneas',
  'MODE · ↑↓ · TAB OR ENTER': 'MODO · ↑↓ · TAB O ENTER',
  "{hint} · above @{agent}'s max mode": '{hint} · por encima del modo máximo de @{agent}',
  '{title} is not available here · see MODULES': '{title} no está disponible aquí · mira MÓDULOS',
  'MU/TH/UR › /{name} needs a request after it, e.g. "/{name} a poster for the launch".':
    'MU/TH/UR › /{name} necesita una petición después, por ejemplo «/{name} un póster para el lanzamiento».',
  'MU/TH/UR › /module needs a job, e.g. "/module summarize today’s commits".':
    'MU/TH/UR › /module necesita una tarea, por ejemplo «/module resume los commits de hoy».',
  'MU/TH/UR · MODULE · NEEDS #2 ›': 'MU/TH/UR · MODULE · REQUIERE #2 ›',
  'Create a MADRE module for this request: {request} Write exactly one <id>.module.mjs file for review. Set vendor to whoever wrote it — the human\'s name or team if you know it, otherwise leave it out; never the word "you". Do not install it; MADRE will show the human an install card.':
    'Crea un módulo de MADRE para esta petición: {request} Escribe exactamente un archivo <id>.module.mjs para revisión. Pon en vendor a quien lo escribió —el nombre o el equipo del humano si lo sabes, y si no, déjalo fuera; nunca la palabra «you»—. No lo instales; MADRE le va a mostrar al humano una tarjeta de instalación.',
  'MU/TH/UR › unknown command /{name}. Type "/" to see what this room offers.':
    'MU/TH/UR › comando desconocido /{name}. Escribe «/» para ver lo que ofrece esta sala.',
  '{name} · uploading…': '{name} · subiendo…',
  'The attachment was rejected: {error}': 'El adjunto se rechazó: {error}',
  '{what}: enabled for @{id}': '{what}: encendido para @{id}',
  "{what}: @{id}'s CLI cannot do this": '{what}: el CLI de @{id} no puede hacer esto',
  '{what}: not wired yet': '{what}: todavía no está cableado',
  '{what}: switched off for @{id} in Settings › Agents': '{what}: apagado para @{id} en Ajustes › Agentes',
  '@{id} starts in #2 (its starting mode in Settings › Agents): every turn may add files to the project. Arming CREATE is not needed.':
    '@{id} arranca en #2 (su modo inicial en Ajustes › Agentes): cada turno puede agregar archivos al proyecto. No hace falta armar CREATE.',
  'The command failed: {error}': 'El comando falló: {error}',
  'Could not reach MADRE: {error}': 'No se pudo alcanzar a MADRE: {error}',
  'It could not be applied: {error}': 'No se pudo aplicar: {error}',

  // MU/TH/UR: el catálogo y EYECAT.
  '{name} not installed · {why}': '{name} no está instalado · {why}',
  '{pct}% · judged by @{judge}': '{pct}% · juzgado por @{judge}',
  'judged by @{judge}': 'juzgado por @{judge}',
  'EYECAT could not be answered.': 'No se pudo contestar a EYECAT.',
  'FILED AS AN ABERRATION · THE MEMORY IT REFUTES NO LONGER TRAVELS':
    'ARCHIVADA COMO ABERRACIÓN · LA MEMORIA QUE REFUTA YA NO VIAJA',
  'THE ROOM STANDS BY IT': 'LA SALA LA SOSTIENE',

  // Versiones y actualizaciones de módulos.
  'UNABLE TO LIST MODULES: {error}': 'NO SE PUDIERON LISTAR LOS MÓDULOS: {error}',
  'INSTALLS {version}': 'INSTALA {version}',
  'CHECKS ARE OFF': 'LAS REVISIONES ESTÁN APAGADAS',
  'MADRE {version} AVAILABLE': 'MADRE {version} DISPONIBLE',
  '{version} AVAILABLE': '{version} DISPONIBLE',
  'NEWEST IS {version}': 'LA MÁS NUEVA ES {version}',
  'UP TO DATE': 'AL DÍA',
  'Check for a newer version': 'Busca una versión más nueva',
  'This module ships in MADRE {ships}, and MADRE {latest} is out. A module that comes with MADRE updates when MADRE does.':
    'Este módulo viene en MADRE {ships}, y ya salió MADRE {latest}. Un módulo que viene con MADRE se actualiza cuando MADRE se actualiza.',
  'This module ships in MADRE {ships}, which is the newest release. A module that comes with MADRE updates when MADRE does.':
    'Este módulo viene en MADRE {ships}, que es la versión más nueva. Un módulo que viene con MADRE se actualiza cuando MADRE se actualiza.',
  '{what} {latest} is out; this computer has {current}.': 'Ya salió {what} {latest}; esta computadora tiene la {current}.',
  '{what} {latest} is the newest release. It is not on this computer yet.':
    '{what} {latest} es la versión más nueva. Todavía no está en esta computadora.',
  '{what} {latest} is the newest, and it is what this computer has.':
    '{what} {latest} es la más nueva, y es la que tiene esta computadora.',
  'MADRE could not reach the place that knows about {what}.': 'MADRE no pudo alcanzar el lugar que sabe de {what}.',
  'Install {name}?': '¿Instalar {name}?',
  'A module runs inside MADRE, with your permissions, on this computer. MADRE checks that it loads and keeps to the house rules before installing it — it cannot check what it intends. Install it only if you trust where it came from.':
    'Un módulo corre dentro de MADRE, con tus permisos, en esta computadora. MADRE comprueba que cargue y que respete las reglas de la casa antes de instalarlo — lo que pretende hacer no lo puede comprobar. Instálalo solo si confías en de dónde viene.',
  'That file could not be read: {error}': 'Ese archivo no se pudo leer: {error}',
  'MU/TH/UR › {name} is already {version} · {from}': 'MU/TH/UR › {name} ya está en {version} · {from}',
  'what is published': 'lo que está publicado',
  'Update {name}?': '¿Actualizar {name}?',
  'unversioned': 'sin versión',
  'From {from}': 'Desde {from}',
  'It loads and keeps to the house rules. What it intends, only you can judge.':
    'Carga y respeta las reglas de la casa. Lo que pretende hacer, solo tú lo puedes juzgar.',
  'MU/TH/UR › {name} is now {version}.': 'MU/TH/UR › {name} ya está en {version}.',
  'the newest file': 'el archivo más nuevo',

  // La economía de la sala y la ficha de Ollama.
  'read back from the CLI cache, plus what was never sent': 'leídos de la caché del CLI, más lo que nunca se mandó',
  'FROM CACHE': 'DE LA CACHÉ',
  'NEVER SENT': 'NUNCA SE MANDÓ',
  'briefing a turn had no use for': 'briefing que ese turno no necesitaba',
  'SPENT OUT': 'GASTADO EN SALIDA',
  'output tokens, the dearer half': 'tokens de salida, la mitad más cara',
  'TURNS': 'TURNOS',
  'weighed so far': 'pesados hasta ahora',
  'SERVER': 'SERVIDOR',
  'running · {host}': 'corriendo · {host}',
  'not running': 'no está corriendo',
  'EMBEDDINGS': 'EMBEDDINGS',
  ' · off': ' · apagado',
  'no embedding model': 'sin modelo de embeddings',
  'no chat model': 'sin modelo de chat',
  'MODELS': 'MODELOS',
  'Download {model} into Ollama for {role}': 'Baja {model} a Ollama para {role}',
  'could not pull': 'no se pudo bajar',
  'MU/TH/UR › pulling {model}; progress shows in the room.': 'MU/TH/UR › bajando {model}; el avance se ve en la sala.',
  'ENABLE OLLAMA': 'ENCENDER OLLAMA',
  'DISABLE OLLAMA': 'APAGAR OLLAMA',
  'MU/TH/UR › OLLAMA ON · memory embeds and distils on this machine.':
    'MU/TH/UR › OLLAMA ENCENDIDO · la memoria se embebe y se destila en esta computadora.',
  'MU/TH/UR › OLLAMA OFF · back to the providers.': 'MU/TH/UR › OLLAMA APAGADO · de vuelta a los proveedores.',
  'Ollama could not change state: {error}': 'Ollama no pudo cambiar de estado: {error}',
  'Wakes Ollama on this computer. Nothing leaves it.': 'Despierta Ollama en esta computadora. De aquí no sale nada.',
  'DISABLE RIPLEY': 'APAGAR RIPLEY',
  'ENABLE RIPLEY': 'ENCENDER RIPLEY',
  'MU/TH/UR › RIPLEY ON · HTML, SVG and Markdown render in the file viewer, in a sealed frame.':
    'MU/TH/UR › RIPLEY ENCENDIDO · el HTML, el SVG y el Markdown se dibujan en el visor, dentro de un marco sellado.',
  'MU/TH/UR › RIPLEY OFF · files show as source.': 'MU/TH/UR › RIPLEY APAGADO · los archivos se ven como código.',
  'RIPLEY could not change state: {error}': 'RIPLEY no pudo cambiar de estado: {error}',
  'STOP ASKING FOR COMPACT REPLIES': 'DEJAR DE PEDIR RESPUESTAS COMPACTAS',
  'ASK FOR COMPACT REPLIES': 'PEDIR RESPUESTAS COMPACTAS',
  'ASH ON · every agent answers in compact prose. What you write is never altered.':
    'ASH ENCENDIDO · cada agente contesta en prosa compacta. Lo que tú escribes nunca se altera.',
  'ASH OFF · agents answer at their own length.': 'ASH APAGADO · los agentes contestan con el largo que quieran.',
  'Ash could not change state: {error}': 'Ash no pudo cambiar de estado: {error}',
  'NO SWITCH': 'SIN INTERRUPTOR',
  '{name} could not be switched.': '{name} no se pudo cambiar.',
  'IDE adapters for the agents detected here: {agents}.': 'Adaptadores de IDE para los agentes detectados aquí: {agents}.',
  'The reload failed: {error}': 'La recarga falló: {error}',
  "Remove {name}? Its file {file} is deleted. MADRE's own modules cannot be removed.":
    '¿Quitar {name}? Se borra su archivo {file}. Los módulos propios de MADRE no se pueden quitar.',
  'MU/TH/UR › {name} removed.': 'MU/TH/UR › {name} quitado.',
  'It was not removed: {error}': 'No se quitó: {error}',

  // Sesiones, privacidad, ajustes rápidos y NOSTROMO.
  '@{agent} signed in': '@{agent} inició sesión',
  '@{agent} sign-in did not complete': 'el inicio de sesión de @{agent} no se completó',
  ' · exit {code}': ' · salida {code}',
  'signing in @{agent} · {command}': 'iniciando sesión de @{agent} · {command}',
  '@{agent}: open {url} to finish signing in': '@{agent}: abre {url} para terminar de iniciar sesión',
  'installing {label} · {command}': 'instalando {label} · {command}',
  'MU/TH/UR › {label} is on this computer. Sign in and the room opens.':
    'MU/TH/UR › {label} ya está en esta computadora. Inicia sesión y la sala se abre.',
  'MU/TH/UR › {label} could not be installed. The log is above.':
    'MU/TH/UR › {label} no se pudo instalar. El registro está arriba.',
  'The sign-in could not start.': 'El inicio de sesión no pudo arrancar.',
  'The privacy setting was not saved: {error}': 'El ajuste de privacidad no se guardó: {error}',
  'private terms appear as {marker}.': 'los términos privados aparecen como {marker}.',
  'MU/TH/UR › purged: {events} events · {entries} exchanges · {memories} memories. Reloading.':
    'MU/TH/UR › purgado: {events} eventos · {entries} intercambios · {memories} memorias. Recargando.',
  'The purge did not run: {error}': 'La purga no corrió: {error}',
  'Applies to the next turn.': 'Aplica desde el próximo turno.',
  'RAISE @{agent} TIMEOUT TO {n}s': 'SUBIR EL TIEMPO LÍMITE DE @{agent} A {n}s',
  '@{agent} timeout is now {n}s.': 'el tiempo límite de @{agent} ahora es {n}s.',
  'RAISE DEFAULT TIMEOUT TO {n}s': 'SUBIR EL TIEMPO LÍMITE POR DEFECTO A {n}s',
  'default timeout is now {n}s for every agent without its own.':
    'el tiempo límite por defecto ahora es {n}s para todo agente que no tenga el suyo.',
  'RAISE LOCAL BUDGET TO {n}': 'SUBIR EL PRESUPUESTO LOCAL A {n}',
  'local budget is now {n} tokens per agent per 5h window.':
    'el presupuesto local ahora es {n} tokens por agente cada 5 h.',
  'ASK': 'PREGUNTAR',
  'NOSTROMO › {n} of {total} memories have had their chances and were never the answer. Ringed on the map.':
    'NOSTROMO › {n} de {total} memorias ya tuvieron sus oportunidades y nunca fueron la respuesta. Marcadas en el mapa.',
  'COLD': 'FRÍAS',
  '{pct}% of the same meaning': '{pct}% del mismo significado',
  'CLEAR THIS ABERRATION': 'QUITAR ESTA ABERRACIÓN',
  'COLD · the archive has been opened {n} times since this was written and never once carried it, and it shares a subject with nothing':
    'FRÍA · el archivo se ha abierto {n} veces desde que se escribió y ni una sola la cargó, y no comparte tema con nada',
  'MADRE has reached for this {n} times': 'MADRE ha echado mano de esta {n} veces',
  ' · last {when}': ' · la última {when}',
  'MADRE has not reached for this one yet': 'MADRE todavía no ha echado mano de esta',
  'company recorded since {when} · nothing since': 'compañía registrada desde {when} · nada desde entonces',
  'It has always travelled alone.': 'Siempre ha viajado sola.',
  'No turn has carried it since the room started keeping this trail.':
    'Ningún turno la ha cargado desde que la sala empezó a guardar este rastro.',
  'MU/TH/UR › memory forgotten: “{text}”. No future turn will read it.':
    'MU/TH/UR › memoria olvidada: «{text}». Ningún turno futuro la va a leer.',
  'MU/TH/UR › it could not be forgotten: {error}': 'MU/TH/UR › no se pudo olvidar: {error}',
  'It could not be saved: {error}': 'No se pudo guardar: {error}',
  '@codex summarize this project': '@codex resume este proyecto',
  // Los cuatro lugares de la sala. Los nombres de la nave —MU/TH/UR, NOSTROMO, ASH, RIPLEY—
  // son nombres propios; estos cuatro no lo son: dicen qué hay detrás de la puerta.
  'MODULES': 'MÓDULOS',
  'THE CORE': 'EL NÚCLEO',
  'GRANTED': 'CONCEDIDO',
  'just now': 'ahora mismo',
  '{n} min ago': 'hace {n} min',
  '{n} h ago': 'hace {n} h',
  '{n} d ago': 'hace {n} d',
  'default': 'por defecto',
  'YOU · CREW (EXPENDABLE)': 'TÚ · TRIPULACIÓN (PRESCINDIBLE)',
  'YOU · CREW': 'TÚ · TRIPULACIÓN',
  ' · {n} left in the archive': ' · quedan {n} en el archivo',
  ' asks ': ' pide ',
  'default #2 · ': '#2 por defecto · ',
  '#2 granted on request': '#2 concedido a petición',
  ' · whole plan': ' · el plan entero',
  '#2 by @{who} · ': '#2 por @{who} · ',
  '{pct}% of {what} · window reset': '{pct}% de {what} · ventana reiniciada',
  '{n} {messages}': '{n} {messages}',
  'message': 'mensaje',
  'messages': 'mensajes',
  " for step {step}/{total} of @{who}'s plan": ' para el paso {step}/{total} del plan de @{who}',
  '{agent} signed in with a key': '{agent} inició sesión con una llave',
  'MU/TH/UR › your message carries {n} private {term}. Agents will read it as you wrote it; their replies are guarded.':
    'MU/TH/UR › tu mensaje lleva {n} {term} privado. Los agentes lo van a leer tal como lo escribiste; sus respuestas quedan protegidas.',
  'term': 'término',
  'terms': 'términos',
  'MU/TH/UR › @{agent} cannot generate images here; routing to @{other}.':
    'MU/TH/UR › @{agent} no puede generar imágenes aquí; se va con @{other}.',
  'MU/TH/UR › /{name} is not available in this project: {title} (see MODULES).':
    'MU/TH/UR › /{name} no está disponible en este proyecto: {title} (mira MÓDULOS).',
  'Upload failed ({status}).': 'Falló la subida ({status}).',
  'CREATE: let the agent add new files to the project for this request; existing files stay untouched':
    'CREATE: deja que el agente agregue archivos nuevos al proyecto para esta petición; los que ya existen no se tocan',
  'MU/TH/UR › @{agent} {why}. CREATE will be refused; pick another agent or change it in Settings › Agents.': 'MU/TH/UR › @{agent} {why}. CREATE se rechazará; elige otro agente o cámbialo en Ajustes › Agentes.',
  'has file creation switched off': 'tiene apagada la creación de archivos',
  'cannot create files from its CLI': 'no puede crear archivos desde su CLI',
  'Request failed ({status}).': 'Falló la petición ({status}).',
  'installing {name}': 'instalando {name}',
  ' for {agents}': ' para {agents}',
  '{name} installed': '{name} instalado',
  '{name} install failed': 'falló la instalación de {name}',
  '{name} could not save {label}.': '{name} no pudo guardar {label}.',

  // CORREO y, en general, la llave de cualquier conector: lo que MADRE guarda en su bodega.

  // Los arranques de /module: una instrucción para editar, no un comando para mandar.
  'MODULE · ↑↓ · TAB OR ENTER · pick one and edit it': 'MÓDULO · ↑↓ · TAB O ENTER · elige uno y edítalo',
  'a command that tells me what changed in the repo this week': 'un comando que me diga qué cambió en el repo esta semana',
  'a slash command · runs in the room, answers as a card': 'un comando · corre en la sala y responde como tarjeta',
  'connect me to my Notion so the agents can search my pages': 'conéctame con mi Notion para que los agentes busquen en mis páginas',
  'a connector · one key, pasted on its card': 'un conector · una llave, pegada en su ficha',
  'ping me on Telegram when a turn fails': 'avísame por Telegram cuando falle un turno',
  'a connector that sends · only offered in #4 AIRLOCK': 'un conector que manda · solo se ofrece en #4 AIRLOCK',
  'a card showing which of my services are up': 'una tarjeta que muestre cuáles de mis servicios están arriba',
  'a card of your own · its own panel inside MODULES': 'una ficha propia · su propio panel dentro de MÓDULOS',

  // La tarjeta de desarrollo en MÓDULOS.
  'Puts /module in the composer, in the room': 'Pone /module en la caja de texto, en la sala',
  'KEYS': 'LLAVES',
  'paste it here': 'pégala aquí',
  'kept · {n} characters': 'guardada · {n} caracteres',
  'FORGET IT': 'OLVIDARLA',
  'WHERE TO GET IT': 'DÓNDE SACARLA',
  '{name} could not keep {label}.': '{name} no pudo guardar {label}.',
  'off · ready': 'apagado · listo',
  'on · not configured': 'encendido · sin configurar',
  'only to': 'solo a',
  'It loads in every room on this computer.': 'Se carga en todas las salas de esta computadora.',
  'DISABLE': 'APAGAR',
  'ENABLE': 'ENCENDER',
  'No detected agent has an adapter for this module; it installs without IDE adapters.':
    'Ningún agente detectado tiene adaptador para este módulo; se instala sin adaptadores de IDE.',
  'Install request failed ({status}).': 'Falló la petición de instalación ({status}).',
  'modules reloaded: {n} of yours': 'módulos recargados: {n} tuyos',
  ', {n} failed to load': ', {n} no cargaron',
  ' · sign in to finish': ' · inicia sesión para terminar',
  '{name} was not installed': '{name} no se instaló',
  'READY FOR INQUIRY. HELP LISTS WHAT I ANSWER.': 'LISTA PARA CONSULTA. HELP LISTA LO QUE CONTESTO.',
  '{n} private {term} guarded from now on.': '{n} {term} privado protegido de aquí en adelante.',
  'MU/TH/UR › that value is not valid (minimum {min}).': 'MU/TH/UR › ese valor no es válido (mínimo {min}).',
  ' · flagged by {who}': ' · marcada por {who}',
  'the room': 'la sala',
  ' · distilled': ' · destilada',
  'last turn: {who} · {when}': 'último turno: {who} · {when}',
  'Travelled into the same turn {n} {times} · last {when}':
    'Viajó al mismo turno {n} {times} · la última {when}',
  'time': 'vez',
  'times': 'veces',
  'Strong enough that recalling this one now brings it along ({pct}%).':
    'Tan fuerte que recordar esta ahora se la lleva consigo ({pct}%).',
  " · in MADRE's own folder ({prefix}), no administrator needed":
    ' · en la carpeta propia de MADRE ({prefix}), sin necesidad de administrador',
  " · on the human's request": ' · a petición del humano',
  'RIPLEY reports an error in the page: {message}{where}. Find the cause and propose the fix.':
    'RIPLEY reporta un error en la página: {message}{where}. Encuentra la causa y propón el arreglo.',
  '@madre runs on this machine and speaks for what the room remembers. "@madre, ask the crew …" opens a round with every agent online. To change files, write to a CLI agent.':
    '@madre corre en esta computadora y habla por lo que la sala recuerda. «@madre, pregúntale a la tripulación …» abre una ronda con todos los agentes en línea. Para cambiar archivos, escríbele a un agente de CLI.',
  'Measured against this room {when}: it landed where the crew landed on {matched} of {n} real questions{verdict}':
    'Medido contra esta sala {when}: cayó donde cayó la tripulación en {matched} de {n} preguntas reales{verdict}',
  '. Ready to be worked in.': '. Listo para meterse a trabajar.',
  ' — not yet.': ' — todavía no.',
  'Nobody has measured it against this project yet: MU/TH/UR → the three tests, or the line in the room when it joined.':
    'Nadie lo ha medido contra este proyecto todavía: MU/TH/UR → las tres pruebas, o la línea en la sala de cuando entró.',
  'MU/TH/UR › AIRLOCK open for @{agent} for this message.{raised} Files are checkpointed; what leaves the machine is not undone.':
    'MU/TH/UR › AIRLOCK abierta para @{agent} en este mensaje.{raised} Se guarda un punto de control de los archivos; lo que sale de la computadora no se deshace.',
  ' Its max mode is now #4 in Permissions.': ' Su modo máximo ahora es #4 en Permisos.',
  'MU/TH/UR › CONTROL armed for @{agent} for this message.{raised} A checkpoint is taken before it runs; every change is listed and UNDO is one click.':
    'MU/TH/UR › CONTROL armado para @{agent} en este mensaje.{raised} Se toma un punto de control antes de que corra; cada cambio se lista y DESHACER está a un clic.',
  ' Its max mode is now #3 in Permissions.': ' Su modo máximo ahora es #3 en Permisos.',
  "Conversation · {n} messages. The project's memory is shared by all of them.":
    'Conversación · {n} mensajes. La memoria del proyecto es la misma para todos ellos.',

  // Esfuerzo: cuánto piensa el modelo antes de contestar.
  'effort': 'esfuerzo',
  'effort {level}': 'esfuerzo {level}',
  'Effort for this agent · {level}': 'Esfuerzo de este agente · {level}',
  'Effort for this message only · {level}': 'Esfuerzo solo para este mensaje · {level}',
  'Effort for this agent · the CLI default ({level})': 'Esfuerzo de este agente · el del CLI ({level})',
  "Effort for this agent · the CLI's own default": 'Esfuerzo de este agente · el que traiga el CLI',
  'Default': 'Por defecto',
  'Minimal': 'Mínimo',
  'Low': 'Bajo',
  'Medium': 'Medio',
  'High': 'Alto',
  'Extra high': 'Muy alto',
  'Max': 'Máximo',
  'Ultra': 'Ultra',
  'Its deepest reasoning, and it hands parts of the task out on its own.': 'Su razonamiento más profundo, y reparte partes de la tarea por su cuenta.',
  'Answers almost at once. For lookups and one-line edits.': 'Contesta casi al instante. Para consultas y cambios de una línea.',
  'Quick and light. For clear, contained requests.': 'Rápido y ligero. Para peticiones claras y acotadas.',
  'The everyday balance of speed and depth.': 'El equilibrio de todos los días entre rapidez y profundidad.',
  'Thinks it through. For design calls and tricky bugs.': 'Lo piensa a fondo. Para decisiones de diseño y bugs difíciles.',
  'Longer reasoning for hard, multi-step problems.': 'Razonamiento más largo para problemas difíciles de varios pasos.',
  'Everything it has. The slowest and the most expensive.': 'Todo lo que tiene. El más lento y el más caro.',

  // Una elección que devuelve un agente.
  '@{agent} asks you to choose': '@{agent} te pide elegir',
  'RECOMMENDED': 'RECOMENDADA',
  'Pressing it arms #{n} {label} for @{agent}': 'Al presionarla se arma #{n} {label} para @{agent}',
  'CLI': 'CLI',

  // Un comando que un agente te pide correr.
  'on · agents may ask you to run commands': 'encendido · los agentes pueden pedirte que corras comandos',
  'off · agents describe the command in prose': 'apagado · los agentes describen el comando en prosa',
  'Lets an agent ask you to run a command it cannot run in its mode (tests, a build, a linter). Each command is a button: nothing runs until you press it, it runs from the project root with no shell, a checkpoint is taken first, and the output comes back to the room. Costs about 300 tokens of instruction per turn below AIRLOCK while it is on.':
    'Deja que un agente te pida correr un comando que en su modo no puede correr (las pruebas, un build, un linter). Cada comando es un botón: nada corre hasta que lo presionas, corre desde la raíz del proyecto sin shell, antes se toma un checkpoint y la salida vuelve a la sala. Cuesta unos 300 tokens de instrucción por turno debajo de AIRLOCK mientras está encendido.',
  'Name the request and the line to run.': 'Di qué petición y qué línea correr.',
  '@{agent} asks you to run': '@{agent} te pide correr',
  'RUNNING': 'CORRIENDO',
  'WILL NOT RUN': 'NO CORRE',
  'This line does not run: it {why}.': 'Esta línea no corre: {why}.',
  'Does not run: it {why}.': 'No corre: {why}.',
  'Runs {command} from the project root, with no shell. A checkpoint is taken first.':
    'Corre {command} desde la raíz del proyecto, sin shell. Antes se toma un checkpoint.',
  'Each line runs only when you press it · from the project root, no shell · the output comes back to the room':
    'Cada línea corre solo cuando la presionas · desde la raíz del proyecto, sin shell · la salida vuelve a la sala',
  'Put the project files back exactly as they were before this command. What it sent off this machine does not come back.':
    'Deja los archivos del proyecto exactamente como estaban antes de este comando. Lo que haya mandado fuera de esta máquina no regresa.',
  'project restored to the checkpoint before the command · {restored} restored · {removed} removed':
    'proyecto restaurado al checkpoint anterior al comando · {restored} restaurados · {removed} quitados',
  'expands a variable or a command inside quotes; there is no shell to expand it':
    'expande una variable o un comando dentro de comillas; no hay shell que lo expanda',
  'ends in a lone backslash': 'termina en una diagonal invertida suelta',
  'uses "{char}", which needs a shell; put each command on its own line':
    'usa «{char}», que necesita un shell; pon cada comando en su propia línea',
  'expands a variable or a command; there is no shell to expand it':
    'expande una variable o un comando; no hay shell que lo expanda',
  'uses "{char}" as a glob; there is no shell to expand it, name the files':
    'usa «{char}» como comodín; no hay shell que lo expanda, nombra los archivos',
  'names another user\'s home with "~"; there is no shell to expand it, write the path':
    'nombra la carpeta de otro usuario con «~»; no hay shell que lo expanda, escribe la ruta',
  'carries a "#" comment, which only a shell would drop; say it in the reason':
    'lleva un comentario con «#», que solo un shell quitaría; dilo en el motivo',
  'leaves a quote open': 'deja una comilla abierta',
  'is empty': 'está vacía',
  '"{name}" is a shell builtin; every line already runs from the project root':
    '«{name}» es un comando interno del shell; cada línea ya corre desde la raíz del proyecto',
  'sets an environment variable, which needs a shell': 'fija una variable de entorno, y eso necesita un shell',
  'is too long to read before pressing it': 'es demasiado larga para leerla antes de presionarla',

  // MU/TH/UR sobre modos, permisos y planes, dicho de nuevo en español.
  'A plan by @{agent} is still running. Your message will be answered, but no second plan will start.':
    'Un plan de @{agent} sigue corriendo. Tu mensaje se contestará, pero no arrancará un segundo plan.',
  ' Type STOPALL to halt every agent.':
    ' Escribe STOPALL para detener a todos los agentes.',
  '{n} agents are working at once. If this is not what you asked for, type STOPALL.':
    '{n} agentes están trabajando a la vez. Si no es lo que pediste, escribe STOPALL.',
  '@{agent} is already answering another turn; answers may cross.':
    '@{agent} ya está contestando otro turno; las respuestas pueden cruzarse.',
  ' STOPALL halts everything.':
    ' STOPALL detiene todo.',
  'The plan by @{agent} has been running for {n} min.':
    'El plan de @{agent} lleva {n} min corriendo.',
  ' STOPALL halts it.':
    ' STOPALL lo detiene.',
  '@{holder} still holds CONTROL; @{agent} answers read-only this turn.':
    '@{holder} sigue teniendo CONTROL; @{agent} contesta en solo lectura este turno.',
  '@{agent} tried to open a plan from inside a plan. It was ignored; the sequence stays under @{who}.':
    '@{agent} intentó abrir un plan desde dentro de un plan. Se ignoró; la secuencia sigue a cargo de @{who}.',
  ' STOPALL if the room drifts.':
    ' STOPALL si la sala se desvía.',
  '@{agent} is capped at #{n} {label}; raise its max mode to #{wanted} in Settings › Permissions to arm {mode}.':
    '@{agent} tiene el tope en #{n} {label}; sube su modo máximo a #{wanted} en Ajustes › Permisos para armar {mode}.',
  // La misma frase como la escribía un MADRE anterior, cuando el tope vivía en otro panel; un registro viejo se lee con el lugar de hoy.
  '@{agent} is capped at #{n} {label}; raise its MAX MODE to #{wanted} in CONNECTIONS to arm {mode}.':
    '@{agent} tiene el tope en #{n} {label}; sube su modo máximo a #{wanted} en Ajustes › Permisos para armar {mode}.',
  '@{agent} already holds {mode} of this project; one holder at a time. STOPALL revokes it.':
    '@{agent} ya tiene {mode} de este proyecto; un solo portador a la vez. STOPALL lo revoca.',
  'its CLI cannot create files':
    'su CLI no puede crear archivos',
  'file creation is switched off for it (turn it on in Settings › Agents)': 'tiene la creación de archivos apagada (enciéndela en Ajustes › Agentes)',
  ' For creation ask {who}.':
    ' Para crear, pídeselo a {who}.',
  '@{agent} will answer read-only: {why}.':
    '@{agent} contestará en solo lectura: {why}.',
  '@{agent} was asked to create something but no CREATE lease is active.':
    'A @{agent} se le pidió crear algo, pero no hay un permiso CREATE activo.',
  ' Permission written by @{who} inside the conversation does not count.':
    ' Un permiso escrito por @{who} dentro de la conversación no cuenta.',
  ' It will answer read-only.':
    ' Contestará en solo lectura.',

  // TURNOS: la multitarea de la sala.
  'working':
    'trabajando',
  'finished while you were away':
    'terminó mientras no estabas',
  'another conversation':
    'otra conversación',
  'MU/TH/UR › @{agent} finished in «{chat}».':
    'MU/TH/UR › @{agent} terminó en «{chat}».',
  'MU/TH/UR › @{agent} could not finish in «{chat}».':
    'MU/TH/UR › @{agent} no pudo terminar en «{chat}».',
  'COULD NOT READ':
    'NO SE PUDO LEER',
  'Several conversations may work at once.':
    'Varias conversaciones pueden trabajar a la vez.',
  'One conversation at a time; switching away from one at work is refused.':
    'Una conversación a la vez; no se puede cambiar de una que está trabajando.',
  'fewer':
    'menos',
  'more':
    'más',
  'How many conversations may be working at the same time.':
    'Cuántas conversaciones pueden estar trabajando al mismo tiempo.',
  'How many answers may be under way inside one conversation.':
    'Cuántas respuestas pueden ir en curso dentro de una misma conversación.',
  'SWITCHED OFF': 'APAGADO',
  'BLOCKED':
    'BLOQUEADAS',
  'This browser blocked them for this page; allow them in its site settings.':
    'Este navegador las bloqueó para esta página; permítelas en la configuración del sitio.',
  'This browser does not offer notifications.':
    'Este navegador no ofrece notificaciones.',
  'A system notification when a conversation finishes and you are not looking at it.':
    'Una notificación del sistema cuando termina una conversación que no estás mirando.',
  'FINISHED': 'TERMINÓ',
  'COULD NOT FINISH': 'NO PUDO TERMINAR',
  'Dismiss': 'Descartar',
  '@{agent} answered': '@{agent} respondió',
  'OPEN →': 'ABRIR →',
  'Close': 'Cerrar',
  'This conversation already has {n} turns running, and TURNS allows {max} at a time. Wait for one to finish, open another conversation, or raise it in MU/TH/UR → TURNS.':
    'Esta conversación ya tiene {n} turnos corriendo, y TURNOS permite {max} a la vez. Espera a que termine uno, abre otra conversación o súbelo en MU/TH/UR → TURNOS.',
  '{n} other conversations are already working, and TURNS allows {max} at a time. Wait for one to finish, or raise it in MU/TH/UR → TURNS.':
    'Ya hay {n} conversaciones más trabajando, y TURNOS permite {max} a la vez. Espera a que termine una o súbelo en MU/TH/UR → TURNOS.',

  // Los paneles junto a la conversación.
  'Resize the conversations panel': 'Cambiar el ancho del panel de conversaciones',
  'Resize the files panel': 'Cambiar el ancho del panel de archivos',

  // Conversaciones como ventanas.
  'Open this conversation in a window': 'Abrir esta conversación en una ventana',
  'Close this window': 'Cerrar esta ventana',
  'Move it to the other half of the window': 'Pasarla a la otra mitad de la pantalla',
  'Conversation': 'Conversación',
  'Float it as a window': 'Soltarla como ventana',
  'MU/TH/UR › two conversations are already open beside this one. Close one to open another: past three at once they crowd each other, and each keeps its own line open to the room.':
    'MU/TH/UR › ya hay dos conversaciones abiertas junto a esta. Cierra una para abrir otra: más de tres a la vez se estorban, y cada una mantiene abierta su propia línea con la sala.',

  // Los servidores del proyecto y el navegador como ventana.
  "This project's servers": 'Los servidores del proyecto',
  "THIS PROJECT'S SERVERS": 'SERVIDORES DE ESTE PROYECTO',
  'Nothing started from this project is answering. Start your dev server inside the project folder and it shows up here by itself.':
    'Nada arrancado desde este proyecto está respondiendo. Inicia tu servidor de desarrollo dentro de la carpeta del proyecto y aparecerá aquí solo.',
  '{command} · listens on the whole network · start it on 127.0.0.1 to open it here': '{command} · escucha en toda la red · inícialo en 127.0.0.1 para abrirlo aquí',
  '{n} more listening on this computer, from other folders · not shown': '{n} más escuchando en esta computadora, de otras carpetas · no se muestran',
  'ONLY WHAT THIS PROJECT STARTED · THE SENTINEL WATCHES IT': 'SOLO LO QUE ARRANCÓ ESTE PROYECTO · LO VIGILA EL CENTINELA',
  'MU/TH/UR › your server :{port} ({command}) stopped.': 'MU/TH/UR › tu servidor :{port} ({command}) se detuvo.',
  ':{port} stopped': ':{port} se detuvo',
  'The sentinel saw {command} stop answering. Start it again and this page comes back on its own.': 'El centinela vio que {command} dejó de responder. Vuelve a iniciarlo y esta página regresa sola.',
  'Float the browser as a window': 'Soltar el navegador como ventana',
  'Dock the browser beside the conversation': 'Acoplar el navegador junto a la conversación',

  ' · how much it thinks': ' · cuánto piensa',
  'the CLI decides': 'decide el CLI',
  'Effort': 'Esfuerzo',
  'Speed': 'Velocidad',
  'Cost': 'Costo',
  'faster': 'más rápido',
  'deeper': 'más profundo',
  'It stays for every message to this agent until you change it.': 'Se queda para cada mensaje a este agente hasta que lo cambies.',

  // El menú de comandos.
  'MENTION · ↑↓ · TAB OR ENTER': 'MENCIÓN · ↑↓ · TAB O ENTER',
  'COMMAND · ↑↓ · TAB OR ENTER': 'COMANDO · ↑↓ · TAB O ENTER',
  'Repository status, recent commits, uncommitted changes and branches from the project itself; commit and push by your own hand, with a confirmation before anything leaves.':
    'Estado del repositorio, commits recientes, cambios sin commit y ramas, leídos del propio proyecto; commit y push por tu mano, con una confirmación antes de que algo salga.',
  'Ask the AHP+ installed in this project for its verified status, checks or session context.':
    'Pregúntale al AHP+ instalado en este proyecto su estado verificado, sus revisiones o el contexto de la sesión.',

  // Split y ventana, en cada superficie.
  'Give it back its place': 'Devolverlo a su lugar',
  'Split the room with it': 'Dividir la pantalla con esto',
  'In the other half of the window': 'En la otra mitad de la pantalla',
  'Beside the conversation': 'Junto a la conversación',

  // El editor.
  'SAVE': 'GUARDAR',
  'FIND': 'BUSCAR',
  'REPLACE': 'REEMPLAZAR',
  'GO TO LINE': 'IR A LÍNEA',
  'COMMENT': 'COMENTAR',
  'WRAP': 'AJUSTAR LÍNEAS',
  'ALL': 'TODO',
  'Find': 'Buscar',
  'Replace with': 'Reemplazar con',
  'Go to line': 'Ir a la línea',
  'Tabs': 'Tabulaciones',
  'Spaces: {n}': 'Espacios: {n}',
  'Plain text': 'Texto plano',
  'Ln {line}, Col {col}': 'Lín {line}, Col {col}',
  '{n} selected': '{n} seleccionados',
  'Unsaved': 'Sin guardar',
  'Saved': 'Guardado',
  'no results': 'sin resultados',
  'Line {n}': 'Línea {n}',
  'Lines {from}–{to}': 'Líneas {from}–{to}',
  'Explain what this does': 'Explica qué hace esto',
  'Find bugs or edge cases here': 'Busca errores o casos límite aquí',
  'Suggest how to improve this': 'Sugiere cómo mejorarlo',
  'Write tests for this': 'Escribe pruebas para esto',
  'Ask my own question': 'Hacer mi propia pregunta',
  'There are unsaved changes in this file. Leave them?': 'Hay cambios sin guardar en este archivo. ¿Descartarlos?',
  'READ': 'LEER',
  'EDIT': 'EDITAR',
  "This file is one the room guards. Type the project's designation to save it.": 'Este archivo es de los que la sala protege. Escribe el nombre del proyecto para guardarlo.',
  'That could not be saved.': 'No se pudo guardar.',
  'Saved · {path}': 'Guardado · {path}',
  'Unsaved changes: the agent reads the file as it is on disk. Save first (⌘S) to ask about your version.': 'Hay cambios sin guardar: el agente lee el archivo como está en disco. Guarda primero (⌘S) para preguntar por tu versión.',
  'Nothing to save.': 'No hay nada que guardar.',
  'The file changed on disk since it was opened.': 'El archivo cambió en disco desde que se abrió.',

  // El menú de comandos, en grupos.
  '<what to make>': '<qué crear>',
  '<what it should do>': '<qué debe hacer>',
  '<what to draw>': '<qué dibujar>',
  'THIS ROOM': 'DE LA SALA',
  'FROM THE MODULES': 'DE LOS MÓDULOS',
  'NOT AVAILABLE HERE': 'NO DISPONIBLES AQUÍ',
  'move': 'moverse',
  'choose': 'elegir',
  'close': 'cerrar',

  'AUTO': 'AUTO',

  'Click a number to pick a line · drag for a run · Shift for a range · {mod} for one more': 'Clic en un número para elegir una línea · arrastra para un tramo · Shift para un rango · {mod} para sumar otra',

  'Ask': 'Preguntar',
  'Comment': 'Comentar',
  'Copy reference': 'Copiar referencia',

  // El núcleo: tú y el modelo local.
  'LOCAL MODEL': 'MODELO LOCAL',
  'NO CHAT MODEL': 'SIN MODELO DE CHAT',
  'YOU': 'TÚ',
  // The crew, from the one button that stands for the spheres.
  'CREW': 'TRIPULACIÓN',
  '{ready} of {total} ready': '{ready} de {total} listos',
  'Back to the crew': 'Volver a la tripulación',
  // The core's board: you, and your local model.
  'YOUR CORE': 'TU NÚCLEO',
  'LOCAL MODEL OFF': 'MODELO LOCAL APAGADO',
  'NOBODY YET': 'NADIE TODAVÍA',
  'ROOM WINDOW': 'VENTANA DE LA SALA',
  'OF {budget} TOKENS · 5H': 'DE {budget} TOKENS · 5H',
  'NO BUDGET SET': 'SIN TOPE',
  'ALL-TIME IN ROOM': 'EN LA SALA, DESDE SIEMPRE',
  'TOKENS THE CREW HAS SPENT HERE': 'TOKENS QUE LA TRIPULACIÓN HA GASTADO AQUÍ',
  'SESSION UNKNOWN': 'SESIÓN SIN DETERMINAR',
  'LOCAL 5H WINDOW': 'VENTANA LOCAL DE 5H',
  "PROVIDER'S {window} LIMIT": 'LÍMITE DE {window} DEL PROVEEDOR',
  'RESETS {when}': 'SE REINICIA {when}',
  '{n} TOKENS IN THE ROOM': '{n} TOKENS EN LA SALA',
  'YOUR LOCAL MODEL': 'TU MODELO LOCAL',
  'NOT TRAINED FOR THIS ROOM YET': 'SIN ENTRENAR PARA ESTA SALA',
  '{n} WITH A VECTOR': '{n} CON VECTOR',
  'RECALL MATCHES WORDS ONLY': 'EL RECALL SOLO EMPAREJA PALABRAS',
  'LANDED WHERE THE CREW DID · {verdict}': 'ATERRIZÓ DONDE LA TRIPULACIÓN · {verdict}',
  'NOT MEASURED YET': 'SIN MEDIR TODAVÍA',
  'INSTALLED · {n}': 'INSTALADOS · {n}',
  'WHAT THE LOCAL MODEL DOES': 'QUÉ HACE EL MODELO LOCAL',
  'Turns each memory into a vector, so recall finds it by meaning.': 'Convierte cada memoria en un vector para que el recall la encuentre por significado.',
  'Distils the exchanges into memories, on this computer.': 'Destila los intercambios en memorias, en esta computadora.',
  'Answers in the room as the fifth agent.': 'Contesta en la sala como el quinto agente.',
  'WHO READS THE ARCHIVE': 'QUIÉN LEE EL ARCHIVO',
  'THE LOCAL MODEL': 'EL MODELO LOCAL',
  'UNAVAILABLE': 'NO DISPONIBLE',
  'OLLAMA IS NOT WIRED IN THIS ROOM · OPEN MODULES → OLLAMA': 'OLLAMA NO ESTÁ CONECTADO EN ESTA SALA · ABRE MÓDULOS → OLLAMA',
  'CHAT': 'CHAT',
  'TRAINED FOR THIS ROOM': 'ENTRENADO PARA ESTA SALA',
  'INSTALLED': 'INSTALADOS',
  'MEASURED HERE': 'MEDIDO AQUÍ',
  'ready': 'listo',
  'not yet': 'todavía no',
  'MU/TH/UR › that could not be changed.': 'MU/TH/UR › eso no se pudo cambiar.',
  'THE QUALITY': 'LA CALIDAD',
  'THE ARCHIVE': 'EL ARCHIVO',
  'archivist: {what}.': 'archivista: {what}.',
  'AN ENVIRONMENT VARIABLE IS SETTING SOME OF THIS, AND IT WINS OVER WHAT YOU CHOOSE HERE.': 'UNA VARIABLE DE ENTORNO FIJA PARTE DE ESTO, Y GANA SOBRE LO QUE ELIJAS AQUÍ.',

  // El interruptor de idioma.

  // AJUSTES, en bloques.
  'Give @{agent} a standing lease in SETTINGS → AGENTS: every turn may create files.': 'Dale a @{agent} un permiso fijo en AJUSTES → AGENTES: cada turno puede crear archivos.',
  'Preview': 'Vista previa',
  'Your choices, in the bubbles the conversation draws.': 'Lo que eliges, en las burbujas que dibuja la conversación.',
  'Automatic follows your system.': 'Automático sigue a tu sistema.',
  'Wallpaper': 'Fondo',
  'Accent': 'Acento',
  'Bubbles': 'Burbujas',
  'Text': 'Texto',
  'Reload in {language}': 'Recargar en {language}',
  'Back to default': 'Volver a lo de siempre',
  'Copied': 'Copiado',
  '⚙ AGENTS IN SETTINGS': '⚙ AGENTES EN AJUSTES',
  'The archive could not be read.': 'No se pudo leer el archivo.',
  'Read at {time}': 'Leído a las {time}',
  'Nothing to read yet: the room has no archive.': 'Aún no hay nada que leer: la sala no tiene archivo.',
  '{n} this week': '{n} esta semana',
  'Exchanges': 'Intercambios',
  'Memories': 'Memorias',
  'Turns that recalled': 'Turnos que recordaron',
  'Waiting': 'En espera',
  'Exchanges nobody has distilled yet.': 'Intercambios que nadie ha destilado aún.',
  'The archivist is up to date.': 'El archivista va al día.',
  'Maturity': 'Madurez',
  'Activity · last {n} days': 'Actividad · últimos {n} días',
  'What the archive is made of': 'De qué está hecho el archivo',
  'By kind': 'Por tipo',
  'By archivist': 'Por archivista',
  'By zone': 'Por zona',
  'Recall and embeddings': 'Recuerdo y embeddings',
  'Search': 'Búsqueda',
  'Company': 'Compañía',
  'Nothing yet.': 'Nada todavía.',
  'Memories with a vector': 'Memorias con vector',
  'Exchanges with a vector': 'Intercambios con vector',
  'Embeddings are off: recall matches words only.': 'Los embeddings están apagados: el recuerdo solo compara palabras.',
  'The three tests': 'Las tres pruebas',
  'Signing in…': 'Iniciando sesión…',
  'Signed in': 'Con sesión',
  'Signed out': 'Sin sesión',
  'Unknown': 'Desconocido',
  'Session {detail}': 'Sesión {detail}',
  'Free way in': 'Entrada gratuita',
  'Generate images': 'Generar imágenes',
  'On for CREATE.': 'Encendido para CREATE.',
  'Web access': 'Acceso a la web',
  'On in every turn.': 'Encendido en cada turno.',
  'This CLI has no way to do it.': 'Este CLI no tiene cómo hacerlo.',
  'Not wired yet.': 'Aún sin conectar.',
  'Off.': 'Apagado.',
  'Ask MU/TH/UR how': 'Preguntarle a MU/TH/UR cómo',
  'Max mode': 'Modo máximo',
  'Starting mode': 'Modo inicial',
  'Every turn may create files, plan steps too.': 'Cada turno puede crear archivos, también los pasos de un plan.',
  'Read-only until you arm CREATE.': 'Solo lectura hasta que armes CREATE.',
  'Time limit': 'Tiempo límite',
  'How long the room waits for its answer.': 'Cuánto espera la sala su respuesta.',
  'Check again': 'Revisar otra vez',
  'Install': 'Instalar',
  'Sign in again': 'Iniciar sesión otra vez',
  'Sign in': 'Iniciar sesión',
  'It signs in from its own prompt:': 'Inicia sesión desde su propio prompt:',
  'This room has no memory index.': 'Esta sala no tiene índice de memoria.',
  'The archive': 'El archivo',
  'Analysis and tests': 'Análisis y pruebas',
  'Refresh': 'Actualizar',
  'The archivist': 'El archivista',
  'It reads what nobody has distilled and keeps the few notes worth remembering. The cheapest allowed agent goes first; a local model costs nothing and keeps everything on this machine.': 'Lee lo que nadie ha destilado y guarda las pocas notas que vale la pena recordar. Va primero el agente permitido más barato; un modelo local no cuesta nada y deja todo en esta computadora.',
  'Who distils first': 'Quién destila primero',
  'Automatic · the cheapest allowed': 'Automático · el permitido más barato',
  'local, free': 'local, gratis',
  'Who may distil': 'Quién puede destilar',
  'The lit ones may keep the archive.': 'Los encendidos pueden llevar el archivo.',
  'Every': 'Cada',
  'Exchanges between one distillation and the next.': 'Intercambios entre una destilación y la siguiente.',
  'exchanges': 'intercambios',
  'Or after': 'O después de',
  'Quiet minutes that also start a distillation.': 'Minutos de silencio que también arrancan una destilación.',
  'min': 'min',
  'Recall': 'Recuerdo',
  'What each turn carries from the archive, and how it finds it.': 'Lo que cada turno lleva del archivo, y cómo lo encuentra.',
  'Share of the context': 'Parte del contexto',
  'The most each turn may spend on memories.': 'Lo más que cada turno puede gastar en memorias.',
  'Carry the company it keeps': 'Llevar a sus acompañantes',
  'Two memories that keep arriving in the same turn travel together, however differently they read.': 'Dos memorias que siguen llegando en el mismo turno viajan juntas, aunque se lean distinto.',
  'Embeddings': 'Embeddings',
  'Find by meaning, not only by words. Now: {what}.': 'Encuentra por significado, no solo por palabras. Ahora: {what}.',
  'Automatic · Ollama if running, else Gemini': 'Automático · Ollama si está encendido, si no Gemini',
  'no model yet': 'sin modelo aún',
  'Gemini · needs your key': 'Gemini · necesita tu llave',
  'Off · words only': 'Apagado · solo palabras',
  'Environment variables are set for memory; they win over these values on the next launch.': 'Hay variables de entorno para la memoria; ganan sobre estos valores en el siguiente arranque.',
  'Dataset and training': 'Dataset y entrenamiento',
  'Export what the room kept, train MADRE AI with it on this Mac, and @madre picks the result up.': 'Exporta lo que guardó la sala, entrena MADRE AI con eso en esta Mac y @madre toma el resultado.',
  'Export': 'Exportar',
  'Dataset': 'Dataset',
  'Train MADRE AI · local, with MLX on Apple silicon': 'Entrenar MADRE AI · local, con MLX en Apple silicon',
  'Export the dataset first. Each step is one command for your terminal: copy it, run it, come back. When the model exists in Ollama, @madre switches to it at the next recheck.': 'Primero exporta el dataset. Cada paso es un comando para tu terminal: cópialo, córrelo y regresa. Cuando el modelo exista en Ollama, @madre lo usa desde la siguiente revisión.',
  'Last export {when} · {train} to train · {valid} to check': 'Última exportación {when} · {train} para entrenar · {valid} para validar',
  'Not exported yet.': 'Aún sin exportar.',
  'Trained model {model} in use.': 'Modelo entrenado {model} en uso.',
  'No trained model yet.': 'Aún no hay modelo entrenado.',
  'The training recipe is unavailable.': 'La receta de entrenamiento no está disponible.',
  'Once: a Python environment with mlx-lm': 'Una vez: un entorno de Python con mlx-lm',
  'Train the LoRA · base {model} for {gb} GB': 'Entrenar el LoRA · base {model} para {gb} GB',
  'Fuse the adapter into the base': 'Fundir el adaptador con la base',
  'Register it in Ollama as {model}': 'Registrarlo en Ollama como {model}',
  'Qwen needs a GGUF before Ollama reads it: {readme}, section 3, has the two lines. Then ask @madre ten things the room decided and five it never discussed before trusting it.': 'Qwen necesita un GGUF antes de que Ollama lo lea: {readme}, sección 3, tiene las dos líneas. Luego pregúntale a @madre diez cosas que la sala decidió y cinco que nunca discutió antes de confiar en él.',
  'One agent is enough to open the room. MADRE uses the session each CLI already has: install one here or sign it in, and the room opens by itself. The credentials stay in each CLI; MADRE only asks whether it is signed in.': 'Con un agente basta para abrir la sala. MADRE usa la sesión que cada CLI ya tiene: instala uno aquí o inicia su sesión, y la sala se abre sola. Las credenciales se quedan en cada CLI; MADRE solo pregunta si tiene sesión.',
  'Plans': 'Planes',
  'When a turn may open a plan, and how long a plan may be.': 'Cuándo un turno puede abrir un plan, y qué tan largo puede ser.',
  'Agents may delegate': 'Los agentes pueden delegar',
  'An agent may open a plan and hand its steps to the others.': 'Un agente puede abrir un plan y repartir sus pasos entre los demás.',
  'Steps per plan': 'Pasos por plan',
  'The most steps one plan may have.': 'Cuántos pasos puede tener un plan como máximo.',
  'Budget and waiting': 'Presupuesto y espera',
  'What each agent may spend, and how long the room waits for it.': 'Lo que cada agente puede gastar, y cuánto lo espera la sala.',
  'Tokens per agent': 'Tokens por agente',
  'Counted here, in each 5-hour window.': 'Se cuentan aquí, en cada ventana de 5 horas.',
  'Default time limit': 'Tiempo límite por defecto',
  'How long an agent may take before the room stops waiting. Each agent can have its own in Agents.': 'Cuánto puede tardar un agente antes de que la sala deje de esperar. Cada agente puede tener el suyo en Agentes.',
  'Gemini can go quiet before it answers anything; this is how long the room gives it.': 'Gemini puede quedarse callado antes de responder algo; esto es lo que la sala le da.',
  'Silence limit': 'Límite de silencio',
  'Seconds without any output before the attempt is dropped.': 'Segundos sin ninguna salida antes de abandonar el intento.',
  'Retries': 'Reintentos',
  'How many times a silent attempt is tried again.': 'Cuántas veces se vuelve a intentar un intento callado.',
  'The provider and model OpenCode answers with in this room.': 'El proveedor y el modelo con que responde OpenCode en esta sala.',
  'Model': 'Modelo',
  'List models': 'Listar modelos',
  '{n} models listed': '{n} modelos listados',
  'Type provider/model, or list what OpenCode offers and pick one.': 'Escribe proveedor/modelo, o lista lo que ofrece OpenCode y elige uno.',
  'Every change is saved to ~/.pulse/config.json as you make it. Environment variables set before start still win on the next launch.': 'Cada cambio se guarda en ~/.pulse/config.json en cuanto lo haces. Las variables de entorno definidas antes de arrancar siguen ganando en el siguiente arranque.',
  'Private terms': 'Términos privados',
  'Replaced with': 'Se reemplazan con',
  'Checking the room…': 'Revisando la sala…',
  'Purge the room': 'Purgar la sala',
  'Write the terms first.': 'Primero escribe los términos.',
  'Still in the room: {events} events · {entries} indexed exchanges · {memories} memories.': 'Todavía en la sala: {events} eventos · {entries} intercambios indexados · {memories} memorias.',
  'The room is clean: no private term in the ledger, the index or the memories.': 'La sala está limpia: ningún término privado en el ledger, el índice ni las memorias.',
  'One per line': 'Uno por línea',
  'What the room shows in their place.': 'Lo que la sala muestra en su lugar.',
  'The terms stay in config.json; the room only records how many. PULSE_PRIVATE_TERMS is set, so its terms are added on every launch.': 'Los términos se quedan en config.json; la sala solo registra cuántos. PULSE_PRIVATE_TERMS está definida, así que sus términos se suman en cada arranque.',
  'The terms stay in config.json; the room only records how many.': 'Los términos se quedan en config.json; la sala solo registra cuántos.',
  'Caught by their shape': 'Atrapados por su forma',
  'Two guards that need no list.': 'Dos guardas que no necesitan lista.',
  'Keys, tokens and e-mail addresses': 'Llaves, tokens y correos',
  'API keys, GitHub and npm tokens, JWTs and e-mail addresses are struck out wherever they appear.': 'Las API keys, los tokens de GitHub y npm, los JWT y los correos se tachan dondequiera que aparezcan.',
  'Your home path': 'Tu ruta home',
  '/Users/yourname becomes ~: a quoted path still reads, it just stops naming you.': '/Users/tunombre se vuelve ~: una ruta citada se sigue leyendo, solo deja de nombrarte.',
  'Already in the room': 'Ya en la sala',
  'What was recorded before a term was named stays as it was until you purge it.': 'Lo que se registró antes de nombrar un término se queda como estaba hasta que lo purgues.',
  'Exposure': 'Exposición',
  'The exposure check is unavailable.': 'La revisión de exposición no está disponible.',
  'MADRE {latest} is on npm · you run {current} · open SETTINGS for the command': 'MADRE {latest} está en npm · tú corres {current} · abre AJUSTES para el comando',
  'The version could not be read.': 'No se pudo leer la versión.',
  'It runs from the npx cache.': 'Corre desde la caché de npx.',
  'It runs from this project\'s node_modules.': 'Corre desde el node_modules de este proyecto.',
  'It is installed globally.': 'Está instalada de forma global.',
  'It runs from source.': 'Corre desde el código fuente.',
  'Up to date': 'Al día',
  'Open': 'Abrir',
  'Look for new versions': 'Buscar versiones nuevas',
  'Once a day MADRE asks npm for the latest version: only the package name travels, the same request npx makes.': 'Una vez al día MADRE le pregunta a npm por la última versión: solo viaja el nombre del paquete, la misma petición que hace npx.',
  'Set by PULSE_UPDATE_CHECK.': 'Lo fija PULSE_UPDATE_CHECK.',
  'Last check': 'Última revisión',
  'Not yet.': 'Aún no.',
  'Check now': 'Revisar ahora',
  'MADRE {version} is ready': 'MADRE {version} está lista',
  'Restart with it here: the room closes, installs and comes back on this same address in a few seconds. Nothing in the ledger is lost. Or run the command yourself.': 'Reinicia con ella aquí: la sala se cierra, instala y vuelve en esta misma dirección en unos segundos. No se pierde nada del ledger. O corre tú el comando.',
  'Pull the repository and start it again.': 'Haz pull del repositorio y vuelve a arrancarla.',
  'Restarting…': 'Reiniciando…',
  'Restart with {version}': 'Reiniciar con {version}',
  'Restart here': 'Reiniciar aquí',
  'Or in your terminal': 'O en tu terminal',
  'What {version} ships ↗': 'Qué trae {version} ↗',
  'At the same time': 'Al mismo tiempo',
  'How much the room does at once. A conversation that takes its time keeps working while you write in it or open another.': 'Cuánto hace la sala a la vez. Una conversación que se tarda sigue trabajando mientras le escribes o abres otra.',
  'It could not be read.': 'No se pudo leer.',
  'Conversations at once': 'Conversaciones a la vez',
  'Turns per conversation': 'Turnos por conversación',
  'On': 'Encendidas',
  'Blocked': 'Bloqueadas',
  'Not available': 'No disponibles',
  'Turn on': 'Encender',
  'Notifications': 'Notificaciones',
  'Always: only one conversation at a time may hold CONTROL or AIRLOCK of the project.': 'Siempre: solo una conversación a la vez puede tener CONTROL o AIRLOCK del proyecto.',
  'It keeps the failures MU/TH/UR cannot explain, and crashes, with paths, names and keys removed. Nothing leaves this machine unless you send it.': 'Guarda las fallas que MU/TH/UR no sabe explicar, y los crashes, sin rutas, nombres ni llaves. Nada sale de esta computadora a menos que tú lo mandes.',
  '{n} reports · {unsent} not sent': '{n} reportes · {unsent} sin enviar',
  'Nothing to report': 'Nada que reportar',
  'Report automatically': 'Reportar automáticamente',
  'New unknown conditions go to the author\'s collector, redacted.': 'Las condiciones desconocidas nuevas van al recolector del autor, tachadas.',
  'No collector is configured (PULSE_REPORT_URL).': 'No hay recolector configurado (PULSE_REPORT_URL).',
  'On madre.run ↗': 'En madre.run ↗',
  'On GitHub ↗': 'En GitHub ↗',
  'Tell the author': 'Contarle al autor',
  'What failed, or what you wish MADRE did.': 'Lo que falló, o lo que quisieras que MADRE hiciera.',
  'Reports': 'Reportes',
  'Each one is redacted before it is kept. Read it in the issue before you send it.': 'Cada uno se tacha antes de guardarse. Léelo en el issue antes de mandarlo.',
  'Crash': 'Crash',
  'Sent': 'Enviado',
  'A company, a brand, a domain: what an agent\'s own setup can leak into a reply. MADRE replaces them before the ledger, the archivist, the other agents or the dataset see them.': 'Una empresa, una marca, un dominio: lo que la configuración de un agente puede colar en su respuesta. MADRE los reemplaza antes de que los vean el ledger, el archivista, los demás agentes o el dataset.',
  'The key is written where the Gemini CLI looks for it, readable only by you. MADRE keeps no copy.': 'La llave se escribe donde la busca el CLI de Gemini, legible solo por ti. MADRE no guarda copia.',
  'OpenCode brings no model of its own: pick the provider whose key you are pasting. The key is written where OpenCode looks for it, readable only by you. MADRE keeps no copy.': 'OpenCode no trae modelo propio: elige el proveedor cuya llave vas a pegar. La llave se escribe donde la busca OpenCode, legible solo por ti. MADRE no guarda copia.',
  'Gemini API key': 'API key de Gemini',
  'Provider key': 'Llave del proveedor',
  'Back to settings': 'Volver a Ajustes',
  'Colour': 'Color',
  'Each colour in dark (top) and in light (bottom). The permission modes keep their own.': 'Cada color en oscuro (arriba) y en claro (abajo). Los modos de permiso conservan los suyos.',
  'Interface': 'Interfaz',
  'The page reloads in it when you choose to.': 'La página se recarga en ese idioma cuando tú lo decidas.',
  'Opens your browser to sign in with ChatGPT.': 'Abre tu navegador para iniciar sesión con ChatGPT.',
  'Opens your browser to sign in with your Claude account.': 'Abre tu navegador para iniciar sesión con tu cuenta de Claude.',
  'Gemini signs in from its own prompt: run `gemini`, type /auth, pick "Use Gemini API key" (get one at aistudio.google.com/app/apikey) or Google login.': 'Gemini inicia sesión desde su propio prompt: corre `gemini`, escribe /auth y elige "Use Gemini API key" (consigue una en aistudio.google.com/app/apikey) o el inicio de sesión de Google.',
  'Pick a provider and paste its key or complete its OAuth flow.': 'Elige un proveedor y pega su llave o completa su flujo OAuth.',
  'Files and servers': 'Archivos y servidores',
  'Finder as a window': 'Finder en ventana',
  'Finder beside': 'Finder al lado',
  'preview on': 'vista previa encendida',
  'preview off': 'vista previa apagada',
  'Where they open': 'Dónde se abren',
  'Each one remembers how you left it. This is the same choice, without opening them.': 'Cada uno recuerda cómo lo dejaste. Aquí es la misma elección, sin abrirlos.',
  "The project's files, beside the conversation or as a window of their own.": 'Los archivos del proyecto, al lado de la conversación o en su propia ventana.',
  'Beside': 'Al lado',
  'Window': 'Ventana',
  'Servers': 'Servidores',
  'The browser on the servers answering on this computer: docked beside the conversation, or floating.': 'El navegador de los servidores que responden en esta computadora: acoplado junto a la conversación, o flotando.',
  'Docked': 'Acoplado',
  'It always opens beside the conversation: opening a file never splits the room on its own. From there it can float as a window.': 'Siempre se abre al lado de la conversación: abrir un archivo nunca divide la sala por sí solo. Desde ahí puede flotar como ventana.',
  'What they can show': 'Lo que pueden mostrar',
  'Two modules decide it; their switches are the same ones as in MODULES.': 'Lo deciden dos módulos; sus interruptores son los mismos que en MÓDULOS.',
  'Sealed preview': 'Vista previa sellada',
  'HTML, SVG and Markdown from the project render in the file viewer, inside a frame that reaches nothing. Off, files show as source.': 'El HTML, el SVG y el Markdown del proyecto se dibujan en el visor, dentro de un marco que no alcanza nada. Apagada, los archivos se ven como código.',
  "The agents' browser": 'El navegador de los agentes',
  'A browser without a window that reaches only this room and the servers you start, on the turns that ask to look at a page.': 'Un navegador sin ventana que solo alcanza esta sala y los servidores que tú arrancas, en los turnos que piden ver una página.',
  'Settings for files and servers': 'Ajustes de archivos y servidores',
  'Always': 'Siempre',
  'Turned on': 'Encendido',
  'Turned off': 'Apagado',
  'Installed': 'Instalado',
  'Yours': 'Tuyos',
  'Back to modules': 'Volver a Módulos',
  'Open as a window': 'Abrir en ventana',
  '{n} of your modules did not load · see why': '{n} de tus módulos no cargaron · ver por qué',
  'Create your module': 'Crea tu módulo',
  'One file. Your agent can write it for you.': 'Un archivo. Tu agente puede escribirlo por ti.',
  'A module is one file: no build, no dependencies, nothing to register. It can be a switch, a few settings, a slash command, a tool for the agents, a card of its own, or a connector to a service you already use.': 'Un módulo es un archivo: sin compilar, sin dependencias, sin registrarlo en ningún lado. Puede ser un interruptor, unos ajustes, un comando con /, una herramienta para los agentes, una tarjeta propia o un conector a un servicio que ya usas.',
  'Ask for one in the room': 'Pedirlo en la sala',
  'Ask for it': 'Pídelo',
  'Type /module and say what it should do. The agent reads the SDK and writes the file; you review it and decide whether it is installed.': 'Escribe /module y di qué debe hacer. El agente lee el SDK y escribe el archivo; tú lo revisas y decides si se instala.',
  'every project': 'todos los proyectos',
  'Read the SDK ↗': 'Leer el SDK ↗',
  'Or write it yourself': 'O escríbelo tú',
  'Put the file in one of these folders. A file somebody else wrote goes in with + Add a module, and MADRE checks it before it runs.': 'Pon el archivo en una de estas carpetas. Un archivo que escribió alguien más entra con + Agregar un módulo, y MADRE lo revisa antes de que corra.',
  'Reload modules': 'Recargar módulos',
  'Load it': 'Cárgalo',
  'Press reload and it appears on the board with its own card, no restart.': 'Presiona recargar y aparece en el tablero con su propia tarjeta, sin reiniciar.',
  'If it talks to a service': 'Si habla con un servicio',
  'Connecting to a service from outside is almost always possible, if that service lets you get your own key in minutes and revoke it. Your module declares the key it needs, where it reaches and which of its tools send; MADRE draws the field, answers for the traffic and holds sending until #4 AIRLOCK.': 'Conectar con un servicio de fuera casi siempre es posible, si ese servicio te deja sacar tu propia llave en minutos y revocarla. Tu módulo declara la llave que necesita, a dónde llega y cuáles de sus herramientas envían; MADRE dibuja el campo, responde por el tráfico y detiene los envíos hasta #4 AIRLOCK.',
  'Did not load': 'No cargaron',
  'Compact replies from every agent': 'Respuestas compactas de cada agente',
  'How hard each agent should think': 'Cuánto debe pensar cada agente',
  'Memory by meaning, on this machine': 'Memoria por significado, en esta computadora',
  'Images for the agents, with your key': 'Imágenes para los agentes, con tu llave',
  'A browser the agents can look through': 'Un navegador por el que miran los agentes',
  'Sealed preview of HTML, SVG and Markdown': 'Vista previa sellada de HTML, SVG y Markdown',
  'The repository, posted to the room': 'El repositorio, publicado en la sala',
  'Commands an agent asks you to run': 'Comandos que un agente te pide correr',
  'Decisions as buttons, not paragraphs': 'Decisiones como botones, no como párrafos',
  'Project state and handoffs in .ahp/': 'Estado del proyecto y relevos en .ahp/',
  'Send one email from your account': 'Manda un correo desde tu cuenta',
  'Search a module, or what it does': 'Busca un módulo, o lo que hace',
  'CREATE YOUR MODULE': 'CREA TU MÓDULO',
  '+ Add a module': '+ Agregar un módulo',
  'Your module': 'Tuyo',
  'Opens as a window': 'Se abre en ventana',
  'Add a module': 'Agregar un módulo',
  'State': 'Estado',
  'nothing weighed yet': 'nada medido aún',
  'Tokens not charged': 'Tokens sin cobro',
  'Turns weighed': 'Turnos medidos',
  'Read from cache': 'Leído de caché',
  'Server': 'Servidor',
  'Running': 'Corriendo',
  'Stopped': 'Detenido',
  'Models': 'Modelos',
  'none': 'ninguno',
  'Turns observed': 'Turnos observados',
  'your own turns, read for no tokens': 'tus propios turnos, leídos sin gastar tokens',
  'it learns as you work': 'aprende mientras trabajas',
  'It was enough': 'Le alcanzó',
  '{held} of {n} turns': '{held} de {n} turnos',
  'Tokens you would have saved': 'Tokens que habrías ahorrado',
  'an estimate, at the lowest level that was enough': 'una estimación, al nivel más bajo que alcanzó',
  'What it touches': 'Lo que toca',
  'Commands': 'Comandos',
  'Writes': 'Escribe',
  'Needs': 'Necesita',
  'Everything this module writes or needs, said before it runs.': 'Todo lo que este módulo escribe o necesita, dicho antes de que corra.',
  'What it adds to the composer. Type it in the room.': 'Lo que agrega a la caja de texto. Escríbelo en la sala.',
  'read back from a cache, or never sent': 'leídos de caché, o nunca enviados',
  'What it does': 'Qué hace',
  'Always on': 'Siempre activo',
  'Active': 'Activo',
  'Look for a newer one': 'Buscar una nueva',
  'It could not be checked: {error}': 'No se pudo revisar: {error}',
  'Update to {version}': 'Actualizar a {version}',
  'Install {version}': 'Instalar {version}',
  'What this module lets you set. Each change is saved as you make it.': 'Lo que este módulo te deja ajustar. Cada cambio se guarda al hacerlo.',
  'Keys': 'Llaves',
  'Economy': 'Economía',
  'What your use taught': 'Lo que enseñó tu uso',
  'Per agent and per kind of request: the lowest effort that was enough in your own turns, learned for no tokens. Below, a test that learns faster, for a price.':
    'Por agente y por tipo de pedido: el esfuerzo más bajo que alcanzó en tus propios turnos, aprendido sin gastar tokens. Abajo, una prueba que aprende más rápido, con costo.',
  'When a lower level might be enough, Intenciones offers to try it on a single message and watches how it goes; if it falls short, the next one goes back up.':
    'Cuando un nivel más bajo podría bastar, Intenciones te propone probarlo en un solo mensaje y se fija cómo le va; si no alcanza, el siguiente vuelve a subir.',
  'What this room was charged, what it was not, and what Ash does to an answer. Measured here, never promised.': 'Lo que se le cobró a esta sala, lo que no, y lo que Ash le hace a una respuesta. Medido aquí, nunca prometido.',
  'Get a newer file': 'Traer un archivo más nuevo',
  'Newer file': 'Archivo más nuevo',
  'It stops loading. The file stays where it is.': 'Deja de cargarse. El archivo se queda donde está.',
  'Local brain': 'Cerebro local',
  'Ollama on this computer: no provider tokens, nothing leaves.': 'Ollama en esta computadora: sin tokens de proveedor, no sale nada.',
  'Running · {host}': 'Corriendo · {host}',
  'Not running': 'Detenido',
  'Start Ollama': 'Encender Ollama',
  'Install Ollama': 'Instalar Ollama',
  'Get Ollama': 'Conseguir Ollama',
  'Download ↗': 'Descargar ↗',
  'Without Ollama running, the room keeps using its providers.': 'Sin Ollama encendido, la sala sigue usando sus proveedores.',
  'Roles': 'Papeles',
  'What the local brain does in this room.': 'Lo que hace el cerebro local en esta sala.',
  'Archivist': 'Archivista',
  'Download {model}': 'Descargar {model}',
  'No model for it yet.': 'Aún no hay modelo para esto.',
  'Kept in MADRE\'s vault under this module\'s name. The value goes nowhere but the module.': 'Se guarda en la bóveda de MADRE con el nombre de este módulo. El valor no va a ningún lado más que al módulo.',
  'MU/TH/UR › MADRE {version} is on npm. Open SETTINGS › Version to restart with it.': 'MU/TH/UR › MADRE {version} está en npm. Abre AJUSTES › Versión para reiniciar con ella.',
  'What to do': 'Qué hacer',
  'Apply': 'Aplicar',
  'Applied': 'Aplicado',
  'Applies now, without restarting.': 'Se aplica ahora, sin reiniciar.',
  'Open @{agent} in Settings': 'Abrir @{agent} en Ajustes',
  'Open Agents in Settings': 'Abrir Agentes en Ajustes',
  'Sign it in, install it or change what it may do, from there.': 'Desde ahí inicias su sesión, lo instalas o cambias lo que puede hacer.',
  'In your terminal': 'En tu terminal',
  'Why it happens': 'Por qué pasa',
  'Not fixed?': '¿No se arregló?',
  'Tell the author this remedy did not work. The report says which condition it was.': 'Cuéntale al autor que este remedio no funcionó. El reporte dice qué condición era.',
  'Report ↗': 'Reportar ↗',
  'What happened to @{agent}': 'Lo que le pasó a @{agent}',
  'What happened in the room': 'Lo que pasó en la sala',
  'Not classified yet': 'Aún sin clasificar',
  'MU/TH/UR does not know this condition. Telling the author is how it learns it.': 'MU/TH/UR no conoce esta condición. Contárselo al autor es como la aprende.',
  'Matches': 'Coincidencias',
  'All': 'Todas',
  'This room': 'Esta sala',
  'Blocking': 'Bloqueantes',
  'Nothing happened in this room. Every system nominal.': 'No pasó nada en esta sala. Todos los sistemas en orden.',
  'Nothing here.': 'Nada aquí.',
  'Download the log': 'Descargar el registro',
  'Dismiss all {n}': 'Descartar las {n}',
  'Show the {n} dismissed': 'Mostrar las {n} descartadas',
  'The remedy that matches best. {n} more could be it, in the list.': 'El remedio que mejor coincide. Otras {n} podrían ser, en la lista.',
  'The remedy that matches.': 'El remedio que coincide.',
  '{n} agents · {ready} ready': '{n} agentes · {ready} listos',
  '{n} conditions in this room': '{n} condiciones en esta sala',
  'nothing open': 'nada abierto',
  'Write a symptom, an agent or a word': 'Escribe un síntoma, un agente o una palabra',
  'Feedback': 'Comentarios',
  'Conditions': 'Condiciones',
  'Nothing matches that. Try a symptom, an agent, or a word like timeout, login, port or budget.': 'Nada coincide con eso. Prueba un síntoma, un agente o una palabra como tiempo, sesión, puerto o presupuesto.',
  '1 condition in this room': '1 condición en esta sala',
  '{label} does not ask for its key again for @{agent} until this runs out. Click to close it now.': '{label} no vuelve a pedir su llave para @{agent} hasta que esto se acabe. Haz clic para cerrarlo ya.',
  'open': 'abierto',
  'MU/TH/UR › {label} closed for @{agent}: the next one asks for its key.': 'MU/TH/UR › {label} cerrado para @{agent}: el siguiente pide su llave.',
  'The project': 'El proyecto',
  'Your phrase': 'Tu frase',
  'Just confirm': 'Solo confirmar',
  'Project + AIRLOCK': 'Proyecto + AIRLOCK',
  'Phrase + AIRLOCK': 'Frase + AIRLOCK',
  '{n} min': '{n} min.',
  'MU/TH/UR › {label} is still open for @{agent} · {left} left.': 'MU/TH/UR › {label} sigue abierto para @{agent} · quedan {left}.',
  '#{n} holds {minutes} min': '#{n} vale {minutes} min',
  'asked every message': 'se pide en cada mensaje',
  'Change in Permissions': 'Cambiar en Permisos',
  'One click on ARM. CONTROL still takes a checkpoint first, and UNDO is one click.': 'Un clic en ARMAR. CONTROL igual toma un punto de control antes, y DESHACER está a un clic.',
  'Your phrase, typed when you arm it.': 'Tu frase, escrita al armarlo.',
  'Your phrase, then the word AIRLOCK.': 'Tu frase y luego la palabra AIRLOCK.',
  'The folder name of the project ({name}), then the word AIRLOCK.': 'El nombre de la carpeta del proyecto ({name}) y luego la palabra AIRLOCK.',
  'The folder name of the project ({name}), with no second key.': 'El nombre de la carpeta del proyecto ({name}), sin segunda llave.',
  'The folder name of the project ({name}).': 'El nombre de la carpeta del proyecto ({name}).',
  'The key of each mode': 'La llave de cada modo',
  'What you type to arm #3 CONTROL and #4 AIRLOCK. It is asked for each message, unless a grace below still holds.': 'Lo que escribes para armar #3 CONTROL y #4 AIRLOCK. Se pide en cada mensaje, salvo que siga vigente una gracia de abajo.',
  'Save a phrase below first.': 'Primero guarda una frase abajo.',
  '#{n} {label} now asks for: {key}.': '#{n} {label} ahora pide: {key}.',
  '#4 always asks for something: it runs commands, and what leaves the machine does not come back.': '#4 siempre pide algo: ejecuta comandos, y lo que sale de la máquina no regresa.',
  'Only its fingerprint is kept (a salted SHA-256, made in this browser). MADRE cannot read it back, and it is never sent anywhere.': 'Solo se guarda su huella (un SHA-256 con sal, hecho en este navegador). MADRE no puede leerla de vuelta y nunca se envía a ningún lado.',
  'Type a new phrase to replace it': 'Escribe una frase nueva para reemplazarla',
  'At least 8 characters': 'Al menos 8 caracteres',
  'Replace': 'Reemplazar',
  'Save': 'Guardar',
  'The phrase needs at least 8 characters.': 'La frase necesita al menos 8 caracteres.',
  'Your phrase was saved. Choose it above for #3 or #4.': 'Tu frase quedó guardada. Elígela arriba para #3 o #4.',
  'A phrase is saved': 'Hay una frase guardada',
  'No phrase yet': 'Aún sin frase',
  'This browser cannot make the fingerprint here.': 'Este navegador no puede calcular la huella aquí.',
  'Forget the phrase': 'Olvidar la frase',
  'The modes that used it go back to the project name.': 'Los modos que la usaban vuelven al nombre del proyecto.',
  'Forget': 'Olvidar',
  'The phrase was forgotten.': 'La frase se olvidó.',
  'Grace after a key': 'Gracia después de una llave',
  'Once a key is accepted, the same mode for the same agent is not asked again for a while. Only in this page: reloading, STOPALL or the × on its chip closes it.': 'Después de aceptar una llave, el mismo modo para el mismo agente no se vuelve a pedir por un rato. Solo en esta página: recargar, PARAR TODO o la × de su chip lo cierran.',
  'Never longer than 5 minutes.': 'Nunca más de 5 minutos.',
  'Raising an agent\'s max mode always asks, grace or not.': 'Subir el modo máximo de un agente siempre pide la llave, haya gracia o no.',
  'Off': 'Apagada',
  '#{n} {label} holds {minutes} min after its key.': '#{n} {label} vale {minutes} min después de su llave.',
  '#{n} {label} asks for its key every message.': '#{n} {label} pide su llave en cada mensaje.',
  'Grace for #{n}': 'Gracia para #{n}',
  'Who may do what': 'Quién puede qué',
  'The highest mode each agent may reach. Each mode wears its colour; #3 and #4 still ask for their key.': 'El modo más alto al que puede llegar cada agente. Cada modo lleva su color; #3 y #4 siguen pidiendo su llave.',
  'Max mode for @{agent}': 'Modo máximo de @{agent}',
  'Permissions': 'Permisos',
  'Permissions, privacy and the version': 'Permisos, privacidad y la versión',
  'MU/TH/UR\'s settings: what the sentinel keeps and whether it reports': 'Ajustes de MU/TH/UR: lo que guarda el centinela y si reporta',
  'MU/TH/UR settings': 'Ajustes de MU/TH/UR',
  'Project': 'Proyecto',
  'Second key': 'Segunda llave',
  'Phrase': 'Frase',
  'Open #4 AIRLOCK for @{agent}': 'Abrir #4 AIRLOCK para @{agent}',
  'Arm #3 CONTROL for @{agent}': 'Armar #3 CONTROL para @{agent}',
  'Arm': 'Armar',
  'That is not it. Try again, or cancel.': 'No es esa. Intenta de nuevo o cancela.',
  'Accepted. Second key: type AIRLOCK to open it.': 'Aceptada. Segunda llave: escribe AIRLOCK para abrirlo.',
  'Second key rejected. Type AIRLOCK, or cancel.': 'Segunda llave rechazada. Escribe AIRLOCK o cancela.',
  'Open for @{agent}.': 'Abierto para @{agent}.',
  'Armed for @{agent}.': 'Armado para @{agent}.',
  'Arm #3 CONTROL': 'Armar #3 CONTROL',
  'Cancel': 'Cancelar',
  '@{id} edits the project itself, with no approval per action.': '@{id} edita el proyecto mismo, sin aprobar cada acción.',
  'A checkpoint is taken first; UNDO is one click.': 'Antes se toma un punto de control; DESHACER está a un clic.',
  '@{id} can also run commands, git push and deploy with the sessions on this computer.': '@{id} además puede ejecutar comandos, hacer git push y desplegar con las sesiones de esta computadora.',
  'Files come back with UNDO; what leaves the computer does not.': 'Los archivos regresan con DESHACER; lo que sale de la computadora, no.',
  'Now type AIRLOCK': 'Ahora escribe AIRLOCK',
  'Type your phrase': 'Escribe tu frase',
  'Type the project name': 'Escribe el nombre del proyecto',
  'This also raises its max mode to #{n}.': 'También sube su modo máximo a #{n}.',
  'Accepted. Boarding NOSTROMO.': 'Aceptado. Abordando NOSTROMO.',
  'Board NOSTROMO': 'Abordar NOSTROMO',
  'The archive of this room: every memory the crew distilled, linked by what they share.': 'El archivo de esta sala: cada memoria que destiló la tripulación, enlazada por lo que comparten.',
  'Reading is free; forgetting is forever.': 'Leer es libre; olvidar es para siempre.',
  'Board': 'Abordar',
  'NOSTROMO · memory research': 'NOSTROMO · investigación de memoria',
  'Open Ollama': 'Abrir Ollama',
  'Start it, download its models and choose what it does in this room.': 'Enciéndelo, descarga sus modelos y elige qué hace en esta sala.',
  '@{agent} left the room: Ollama is not running. Start Ollama, or open Ollama in Modules.': '@{agent} salió de la sala: Ollama no está corriendo. Enciende Ollama o ábrelo en Módulos.',
  'Hide': 'Ocultar',
  'Updating {name}': 'Actualizando {name}',
  'Installing {name}': 'Instalando {name}',
  '{n} s': '{n} seg',
  '{m} min {s} s': '{m} min {s} seg',
  'Done': 'Listo',
  'It did not finish': 'No terminó',
  'Working': 'En curso',
  'Update {name} to {version}': 'Actualizar {name} a {version}',
  'Update {name}': 'Actualizar {name}',
  'This runs on this computer, outside the project.': 'Esto corre en esta computadora, fuera del proyecto.',
  'Not now': 'Ahora no',
  'Update': 'Actualizar',
  'Its path from the project root. Missing folders are made; an existing file is never touched.': 'Su ruta desde la raíz del proyecto. Las carpetas que falten se crean; un archivo que ya existe nunca se toca.',
  'Path': 'Ruta',
  'Create': 'Crear',
  'A file the room guards': 'Un archivo que la sala resguarda',
  'It could not be created.': 'No se pudo crear.',
  '{path} was created.': 'Se creó {path}.',
  'Not a file name this room can create.': 'No es un nombre de archivo que la sala pueda crear.',
  'A file with that name is already there.': 'Ya hay un archivo con ese nombre.',

  // GITHUB: el lado de GitHub del proyecto, en la sala. Su ficha, /gh y lo que dice cuando algo falla.
  'Pull requests, issues and CI, in the room': 'Pull requests, issues y CI, en la sala',
  'Reads this project’s pull requests, issues and CI with your gh session or a token, and posts to GitHub only when you confirm it in the room or an agent works in #4 AIRLOCK.':
    'Lee los pull requests, los issues y el CI de este proyecto con tu sesión de gh o con un token, y solo publica en GitHub cuando tú lo confirmas en la sala o cuando un agente trabaja en #4 AIRLOCK.',
  'your token in MADRE’s vault, 0600, only if you paste one': 'tu token en la bodega de MADRE, 0600, solo si pegas uno',
  'a pull request, an issue or a comment on GitHub, only when you confirm it or an agent in #4 AIRLOCK posts it':
    'un pull request, un issue o un comentario en GitHub, solo cuando tú lo confirmas o lo publica un agente en #4 AIRLOCK',
  'a remote on github.com': 'un remoto en github.com',
  'the gh CLI signed in (gh auth login), or a fine-grained token pasted here': 'el CLI gh con sesión iniciada (gh auth login), o un token de acceso detallado pegado aquí',
  'Fine-grained token': 'Token de acceso detallado',
  'Only needed without a gh session. Give it access to this repository with Contents read, Pull requests read and write, Issues read and write, and Checks and Actions read. You can revoke it on GitHub at any time.':
    'Solo hace falta si no hay sesión de gh. Dale acceso a este repositorio con Contents en lectura, Pull requests e Issues en lectura y escritura, y Checks y Actions en lectura. Puedes revocarlo en GitHub cuando quieras.',
  'GitHub for this project as a card: open pull requests, the CI of your branch and open issues. Opening a pull request, an issue or a comment first shows what would be posted, and posts it only with confirm.':
    'GitHub de este proyecto en una tarjeta: pull requests abiertos, el CI de tu rama e issues abiertos. Para abrir un pull request, un issue o un comentario, primero enseña lo que se publicaría y solo lo publica con confirm.',
  'This project is not a git repository, so there is no GitHub repository to read.': 'Este proyecto no es un repositorio git, así que no hay repositorio de GitHub que leer.',
  'No remote of this repository points at github.com. Add one with git remote add, or open the project that has it.':
    'Ningún remoto de este repositorio apunta a github.com. Agrega uno con git remote add, o abre el proyecto que lo tiene.',
  'There is no GitHub session on this computer and no token in MADRE. Sign in with gh auth login, or paste a fine-grained token in Modules › GitHub.':
    'No hay sesión de GitHub en esta computadora ni token en MADRE. Inicia sesión con gh auth login, o pega un token de acceso detallado en Módulos › GitHub.',
  'GitHub said: {detail}': 'GitHub dijo: {detail}',
  'Something went wrong talking to GitHub: {message}': 'Algo falló al hablar con GitHub: {message}',
  'passing': 'pasa',
  'failing': 'falla',
  'running': 'corriendo',
  'no checks yet': 'todavía sin verificaciones',
  'closed': 'cerrado',
  'merged': 'fusionado',
  'draft': 'borrador',
  'approved by {who}': 'aprobado por {who}',
  'changes requested by {who}': 'con cambios pedidos por {who}',
  'no review yet': 'todavía sin revisión',
  'Open pull requests: {n}': 'Pull requests abiertos: {n}',
  'Open issues: {n}': 'Issues abiertos: {n}',
  'CI: the project is not on a branch.': 'CI: el proyecto no está en ninguna rama.',
  'CI on {branch}: {why}': 'CI en {branch}: {why}',
  'CI on {branch}: {state} ({n} checks)': 'CI en {branch}: {state} ({n} verificaciones)',
  'CI on {branch}: {state}': 'CI en {branch}: {state}',
  'This branch has pull request #{n}: {title}': 'Esta rama tiene el pull request #{n}: {title}',
  'No open pull requests.': 'No hay pull requests abiertos.',
  'Open pull requests · {repo}': 'Pull requests abiertos · {repo}',
  'it can merge': 'se puede fusionar',
  'it has conflicts': 'tiene conflictos',
  'GitHub is still working out whether it can merge': 'GitHub todavía está calculando si se puede fusionar',
  '+{add} −{del} · {files} files · {commits} commits': '+{add} −{del} · {files} archivos · {commits} commits',
  'Review: {state}': 'Revisión: {state}',
  'The project is not on a branch, so there is no CI to ask about.': 'El proyecto no está en ninguna rama, así que no hay CI que consultar.',
  'Latest workflow runs': 'Últimas ejecuciones de workflows',
  'No open issues.': 'No hay issues abiertos.',
  'Open issues · {repo}': 'Issues abiertos · {repo}',
  'This posts under your name and cannot be undone from MADRE. Post it with: {command}': 'Esto se publica con tu nombre y MADRE no lo puede deshacer. Publícalo con: {command}',
  'Give it a title in quotes: /gh pr create "what it changes" ["more detail"]': 'Ponle un título entre comillas: /gh pr create "qué cambia" ["más detalle"]',
  'The project is not on a branch, so there is nothing to open a pull request from.': 'El proyecto no está en ninguna rama, así que no hay desde dónde abrir un pull request.',
  '{branch} is not on GitHub yet. Push it first, then try again.': '{branch} todavía no está en GitHub. Súbela primero y vuelve a intentarlo.',
  'You are on {branch}, the default branch. A pull request goes from another branch into it.': 'Estás en {branch}, la rama principal. Un pull request va de otra rama hacia ella.',
  'Opening a pull request on {repo}': 'Abriendo un pull request en {repo}',
  'Would open a pull request on {repo}': 'Se abriría un pull request en {repo}',
  'Title: {title}': 'Título: {title}',
  'From {head} into {base}': 'De {head} hacia {base}',
  'As: {who}': 'Como: {who}',
  'Description:': 'Descripción:',
  'No description.': 'Sin descripción.',
  'Opened pull request #{n} on {repo}': 'Se abrió el pull request #{n} en {repo}',
  'Say where and what: /gh comment 12 "the comment"': 'Di dónde y qué: /gh comment 12 "el comentario"',
  'Commenting on pull request #{n} · {title}': 'Comentando en el pull request #{n} · {title}',
  'Would comment on pull request #{n} · {title}': 'Se comentaría en el pull request #{n} · {title}',
  'Commenting on issue #{n} · {title}': 'Comentando en el issue #{n} · {title}',
  'Would comment on issue #{n} · {title}': 'Se comentaría en el issue #{n} · {title}',
  'On: {repo}': 'En: {repo}',
  'Comment:': 'Comentario:',
  'Commented on #{n} · {repo}': 'Se comentó en #{n} · {repo}',
  'Give it a title in quotes: /gh issue "what is wrong" ["more detail"]': 'Ponle un título entre comillas: /gh issue "qué está mal" ["más detalle"]',
  'Opening an issue on {repo}': 'Abriendo un issue en {repo}',
  'Would open an issue on {repo}': 'Se abriría un issue en {repo}',
  'Opened issue #{n} on {repo}': 'Se abrió el issue #{n} en {repo}',
  'Unknown subcommand "{what}". Use /gh, /gh pr [n], /gh ci, /gh issues, /gh pr create "title", /gh comment <n> "text" or /gh issue "title".':
    'No conozco el subcomando «{what}». Usa /gh, /gh pr [n], /gh ci, /gh issues, /gh pr create "título", /gh comment <n> "texto" o /gh issue "título".',
  'GitHub did not accept the gh session on this computer. Sign in again with gh auth login.': 'GitHub no aceptó la sesión de gh de esta computadora. Vuelve a iniciar sesión con gh auth login.',
  'GitHub did not accept the token. It may have expired or been revoked: make a new one and paste it in Modules › GitHub.':
    'GitHub no aceptó el token. Puede que haya vencido o que lo hayan revocado: crea uno nuevo y pégalo en Módulos › GitHub.',
  'GitHub says it is not there: the repository or that number is not visible with this credential.': 'GitHub dice que no existe: el repositorio o ese número no se ven con esta credencial.',
  'This credential has used up its GitHub rate limit. Try again in a while.': 'Esta credencial agotó su límite de peticiones en GitHub. Vuelve a intentarlo en un rato.',
  'This credential is not allowed to do that here. A fine-grained token needs that permission on this repository.': 'Esta credencial no tiene permiso para hacer eso aquí. Un token de acceso detallado necesita ese permiso en este repositorio.',
  'GitHub refused the request as it was written.': 'GitHub rechazó la petición tal como estaba escrita.',
  'GitHub could not be reached from this computer.': 'No se pudo llegar a GitHub desde esta computadora.',
  'gh is on this computer but not signed in. Sign in with gh auth login, or paste a token in Modules › GitHub.': 'gh está en esta computadora pero sin sesión. Inicia sesión con gh auth login, o pega un token en Módulos › GitHub.',
  'GitHub answered with an error.': 'GitHub contestó con un error.',
  'That is not a pull request or issue number.': 'Ese no es un número de pull request ni de issue.',
  'There is no branch to ask about: the project is not on one.': 'No hay rama que consultar: el proyecto no está en ninguna.',
  'It needs a title.': 'Le falta un título.',
  'There is nothing to post.': 'No hay nada que publicar.',
  'There is no base branch to open it against.': 'No hay una rama base contra la cual abrirlo.',
  'GitHub: no gh session and no token': 'GitHub: sin sesión de gh y sin token',
  'The GitHub module uses the gh CLI when it is signed in, and a token kept in MADRE when it is not. Neither is there, so it has nothing to sign in with.':
    'El módulo GitHub usa el CLI gh cuando tiene sesión, y un token guardado en MADRE cuando no. No hay ninguno de los dos, así que no tiene con qué entrar.',
  'Sign in to gh once in your terminal, or paste a fine-grained token in Modules › GitHub, and open the card again.':
    'Inicia sesión en gh una vez desde tu terminal, o pega un token de acceso detallado en Módulos › GitHub, y vuelve a abrir la ficha.',
  'GitHub: the session or the token was refused': 'GitHub: rechazó la sesión o el token',
  'GitHub answered 401: the gh session or the token MADRE holds is no longer valid. Tokens expire on the date chosen when they were made, and either can be revoked from GitHub.':
    'GitHub contestó 401: la sesión de gh o el token que guarda MADRE ya no son válidos. Los tokens vencen en la fecha que se eligió al crearlos, y los dos se pueden revocar desde GitHub.',
  'Sign in to gh again, or make a new fine-grained token and paste it in Modules › GitHub in place of the old one.':
    'Vuelve a iniciar sesión en gh, o crea un token de acceso detallado nuevo y pégalo en Módulos › GitHub en lugar del anterior.',
  'GitHub: this project has no remote on github.com': 'GitHub: este proyecto no tiene remoto en github.com',
  'The GitHub module reads the repository from the project’s git remotes, and none of them is on github.com. Other hosts, GitHub Enterprise included, are not reached, so a credential for github.com never goes to them.':
    'El módulo GitHub toma el repositorio de los remotos git del proyecto, y ninguno está en github.com. A otros servidores, GitHub Enterprise incluido, no llega, para que una credencial de github.com nunca vaya a parar a ellos.',
  'Add the GitHub repository as a remote in your terminal, or open the project that already has it, and look at Modules › GitHub again.':
    'Agrega el repositorio de GitHub como remoto desde tu terminal, o abre el proyecto que ya lo tiene, y vuelve a mirar Módulos › GitHub.',
  '{level} usually suits it': 'suele irle bien {level}',
  '{n} of {of} tests failed and taught nothing': '{n} de {of} pruebas fallaron y no enseñaron nada',
  'last reason: {why}': 'último motivo: {why}',
  'the reason was not kept by this version; the next failure will say it': 'esta versión no guardaba el motivo; la próxima falla lo dirá',
  'about {n} tokens': 'unos {n} tokens',
  'its cost is not known yet: nothing was measured here': 'su costo aún no se conoce: aquí no se ha medido nada',
  'Quick test for @{agent}': 'Prueba rápida para @{agent}',
  'Full test for @{agent}': 'Prueba completa para @{agent}',
  '{n} turns of @{agent}, read-only, on real questions from this project.': '{n} turnos de @{agent}, solo lectura, con preguntas reales de este proyecto.',
  'It will spend {price} from your plan.': 'Gastará {price} de tu plan.',
  'Measure': 'Medir',
  // La barra, a tu gusto: clic derecho en una tecla y se abre para acomodarla.
  'Add to the bar': 'Agregar a la barra',
  'Remove {name} from the bar': 'Quitar {name} de la barra',
  'Add {name}': 'Agregar {name}',
  'Everything is already on the bar.': 'Ya está todo en la barra.',
  'Drag a key to move it. Right-click the bar to come back here.': 'Arrastra una tecla para moverla. Clic derecho en la barra para volver aquí.',
  'More': 'Más',
  'This answer: {tokens} tokens. The room so far: {total}.': 'Esta respuesta: {tokens} tokens. La sala hasta ahora: {total}.',
  // El teléfono (docs/MOBILE.md): emparejar, Salas, el puente y la continuidad.
  'Phone': 'Teléfono',
  'phone': 'teléfono',
  'Phone · use MADRE from your phone': 'Teléfono · usa MADRE desde tu teléfono',
  'Android phone': 'teléfono Android',
  'Android tablet': 'tableta Android',
  'from your {device}': 'desde tu {device}',
  'ON THE MAC': 'EN LA MAC',
  '#3 CONTROL and #4 AIRLOCK are opened from the Mac.': '#3 CONTROL y #4 AIRLOCK se abren desde la Mac.',
  'This is done on the Mac.': 'Esto se hace en la Mac.',
  'Use MADRE from your phone': 'Usa MADRE desde tu teléfono',
  'Try again': 'Intentar de nuevo',
  'One moment…': 'Un momento…',
  'MADRE cannot tell which network this computer is on, so it cannot open the door to a phone here.': 'MADRE no reconoce la red de esta computadora, así que aquí no puede abrirle la puerta a un teléfono.',
  'Your phone reaches this Mac over your Wi-Fi. Do it only on a network you trust, like the one at home or at the office: on a public network, someone connected to it could see what passes between the two.': 'Tu teléfono llega a esta Mac por tu Wi-Fi. Hazlo solo en una red de confianza, como la de tu casa u oficina: en una red pública, alguien conectado a ella podría ver lo que pasa entre los dos.',
  'This is a network I trust': 'Es una red de confianza',
  'Your {device} is connected.': 'Tu {device} está conectado.',
  'On the phone, add MADRE to the home screen to open it like an app. Your rooms are there whenever this Mac is awake and on this Wi-Fi.': 'En el teléfono, agrega MADRE a la pantalla de inicio para abrirla como una app. Tus salas están ahí siempre que esta Mac esté despierta y en este Wi-Fi.',
  'Pair another phone': 'Emparejar otro teléfono',
  "Scan it with your phone's camera.": 'Escanéalo con la cámara de tu teléfono.',
  'Your phone has to be on this same Wi-Fi. The code works once and expires in ': 'Tu teléfono tiene que estar en este mismo Wi-Fi. El código sirve una vez y vence en ',
  'The address in the code': 'La dirección dentro del código',
  'If your Mac asks whether to allow incoming connections, choose Allow.': 'Si tu Mac pregunta si permites conexiones entrantes, elige Permitir.',
  'The code expired.': 'El código venció.',
  'Make another code': 'Hacer otro código',
  '1 phone paired · manage it in Settings': '1 teléfono emparejado · adminístralo en Ajustes',
  '{n} phones paired · manage them in Settings': '{n} teléfonos emparejados · adminístralos en Ajustes',
  'Phones': 'Teléfonos',
  'The phones that can reach your rooms over your Wi-Fi. Their keys live only on this Mac: of each phone it keeps a fingerprint, never the key.': 'Los teléfonos que pueden llegar a tus salas por tu Wi-Fi. Sus llaves viven solo en esta Mac: de cada teléfono se guarda una huella, nunca la llave.',
  'Not available here': 'No disponible aquí',
  'MADRE cannot tell which network this computer is on.': 'MADRE no reconoce la red de esta computadora.',
  'Turned off, no phone reaches this Mac, not even a paired one.': 'Si lo apagas, ningún teléfono llega a esta Mac, ni uno emparejado.',
  'MU/TH/UR › that phone can no longer reach this Mac.': 'MU/TH/UR › ese teléfono ya no puede llegar a esta Mac.',
  'Paired {date} · last seen {seen}': 'Emparejado el {date} · visto por última vez {seen}',
  'This network': 'Esta red',
  'A trusted network': 'Una red de confianza',
  'Phones reach this Mac while it is on this network.': 'Los teléfonos llegan a esta Mac mientras esté en esta red.',
  'Trusted on {date}.': 'De confianza desde el {date}.',
  'Pair a phone': 'Emparejar un teléfono',
  'A code to scan with its camera, good once for ten minutes.': 'Un código para escanear con su cámara, que sirve una vez durante diez minutos.',
  'Show the code': 'Mostrar el código',
  'The phone reaches this Mac only on a network you trusted. From the phone you read, ask up to #2 CREATE, answer what an agent asks and stop everything; #3 CONTROL and #4 AIRLOCK are opened here.': 'El teléfono llega a esta Mac solo en una red que marcaste de confianza. Desde el teléfono lees, preguntas hasta #2 CREATE, respondes lo que pide un agente y detienes todo; #3 CONTROL y #4 AIRLOCK se abren aquí.',
  'The list of phones could not be read.': 'No se pudo leer la lista de teléfonos.',
  'Continue from the Mac · {where}': 'Continuar desde la Mac · {where}',
  'Continue · {where}': 'Continuar · {where}',
  'Continue from your {device} · {where}': 'Continuar desde tu {device} · {where}',
  'Rooms': 'Salas',
  'Rooms, reload and settings': 'Salas, recargar y ajustes',
  'now': 'ahora',
  'Update MADRE in this room on your Mac to use it from here.': 'Actualiza MADRE en esta sala desde tu Mac para usarla aquí.',
  'This room is not answering.': 'Esta sala no responde.',
  '{agents} working': '{agents} trabajando',
  'Pick up where you were': 'Seguir donde ibas',
  'Waiting for you': 'Te espera',
  'Waiting for you · {n}': 'Te espera · {n}',
  '@{agent} asks for #{n} {label}': '@{agent} pide #{n} {label}',
  '@{agent} wants to run {line}': '@{agent} quiere correr {line}',
  '@{agent} wants to run a command': '@{agent} quiere correr un comando',
  '@{agent} asks you: {question}': '@{agent} te pregunta: {question}',
  'Your Mac is not answering. Check that it is awake and on the same Wi-Fi.': 'Tu Mac no responde. Revisa que esté despierta y en el mismo Wi-Fi.',
  'On {mac}': 'En {mac}',
  'No room is open on your Mac. Open MADRE in a project there and it appears here.': 'No hay salas abiertas en tu Mac. Abre MADRE en un proyecto allá y aparecerá aquí.',
  'Your rooms run on your Mac. This phone reaches them over your Wi-Fi.': 'Tus salas corren en tu Mac. Este teléfono llega a ellas por tu Wi-Fi.',
  'Touch again to stop': 'Toca otra vez para detener',
  'Stop all': 'Detener todo',
  // SALAS on the Mac (salas-mac.js, src/salas.mjs).
  'Open now': 'Abiertas',
  'Asleep': 'Dormidas',
  'Asleep · last open {when}': 'Dormida · última vez {when}',
  'Wake': 'Despertar',
  'Waking…': 'Despertando…',
  'Closing…': 'Cerrando…',
  'Close it': 'Cerrarla',
  'You are here': 'Estás aquí',
  'Back to the room': 'Volver a la sala',
  'Talk to BISHOP': 'Hablar con BISHOP',
  // BISHOP's orders (docs/MACROVERSO.md, fase 4b): the card, the channel's refusals, the answers.
  'BISHOP proposes a plan · {plan}': 'BISHOP propone un plan · {plan}',
  'FROM THE MAC': 'DESDE LA MAC',
  // BISHOP, fase 4c: modes, links, proposals in their room, and /bishop from any room.
  'MANUAL': 'MANUAL',
  'HYBRID': 'HÍBRIDO',
  'AUTOMATIC': 'AUTOMÁTICO',
  '{n} days': '{n} días',
  'Did not leave on its own: {why}': 'No salió sola: {why}',
  'IN ITS ROOM · WAITING FOR YOUR KEY': 'EN SU SALA · ESPERA TU LLAVE',
  'Take it to {room}': 'Llevar a {room}',
  'SIGNED': 'FIRMADO',
  'ALREADY IN FORCE': 'YA VIGENTE',
  'WILL NOT BE SIGNED': 'NO SE FIRMA',
  'type {room} to sign': 'escribe {room} para firmar',
  ' · plan {plan} stops leaving on its own ({why}); what is left waits for your press': ' · el plan {plan} deja de enviar solo ({why}); lo que falta espera tu botón',
  'BISHOP proposes #{n} {label} to @{agent} · order {step} of {total} · plan {plan}': 'BISHOP propone #{n} {label} a @{agent} · orden {step} de {total} · plan {plan}',
  'Arm and send': 'Armar y enviar',
  'MU/TH/UR › written in the box. Sending it asks for your key, as always.': 'MU/TH/UR › quedó escrita en la caja. Al enviarla te pide tu llave, como siempre.',
  'an order failed': 'una orden falló',
  'BISHOP proposes #{n} to @{agent}: arm it with your key': 'BISHOP propone #{n} a @{agent}: ármala con tu llave',
  'BISHOP waits for your press: {reason}': 'BISHOP espera tu botón: {reason}',
  'BISHOP waits for your press': 'BISHOP espera tu botón',
  'That proposal is not waiting to be taken to its room.': 'Esa propuesta no está esperando ir a su sala.',
  'Write the question after /bishop.': 'Escribe la pregunta después de /bishop.',
  'A question is between 1 and {n} characters.': 'Una pregunta tiene entre 1 y {n} caracteres.',
  'The room of Salas did not open. Open it with madre salas and ask again.': 'La sala de Salas no abrió. Ábrela con madre salas y vuelve a preguntar.',
  'Asked BISHOP in the room of Salas. The answer comes here, for you only: the agents of this room do not read it without a link.': 'Pregunta enviada a BISHOP en la sala de Salas. La respuesta llega aquí, solo para ti: los agentes de esta sala no la leen sin un enlace.',
  'That order is not running.': 'Esa orden no está corriendo.',
  'That link is not in this room.': 'Ese enlace no está en esta sala.',
  'That link is not waiting to be signed.': 'Ese enlace no está esperando tu firma.',
  'Only #3 and #4 come as a proposal.': 'Solo #3 y #4 llegan como propuesta.',
  'stopped by the human from Salas': 'detenida por el humano desde Salas',
  'BISHOP has no ready agent. Choose one in its card in MODULES, in Salas.': 'BISHOP no tiene un agente listo. Elige uno en su ficha de MÓDULOS, en Salas.',
  'BISHOP is answering something else. Ask again in a moment.': 'BISHOP está respondiendo otra cosa. Vuelve a preguntar en un momento.',
  'The room of Salas never hands its notes over.': 'La sala de Salas nunca entrega sus notas.',
  'Name what crosses: decision, fact, preference or question.': 'Di qué cruza: decisión, hecho, preferencia o pregunta.',
  'Orders go only on a link with the room of Salas.': 'Las órdenes solo van en un enlace con la sala de Salas.',
  'That link is already in force.': 'Ese enlace ya está vigente.',
  'more than 2 links': 'más de 2 enlaces',
  'The guardian of your rooms, in Salas. It answers about every linked room, proposes orders and links, and you decide what leaves and what is signed. Any room can raise it with /bishop.': 'El guardián de tus salas, en Salas. Responde sobre cada sala enlazada, propone órdenes y enlaces, y tú decides qué sale y qué se firma. Cualquier sala lo levanta con /bishop.',
  'The ready agent BISHOP speaks through. With @madre, BISHOP only answers: it proposes neither orders nor links.': 'El agente listo por el que habla BISHOP. Con @madre, BISHOP solo responde: no propone órdenes ni enlaces.',
  // D-S13: BISHOP signs the links that only read; the human, every link with orders.
  'BISHOP did not sign it: {why}': 'BISHOP no lo firmó: {why}',
  'SIGNED BY BISHOP · UNTIL {date}': 'FIRMADO POR BISHOP · HASTA {date}',
  'SIGNED BY BISHOP': 'FIRMADO POR BISHOP',
  'REVOKED': 'REVOCADO',
  'through @{agent} · from Salas': 'por @{agent} · desde Salas',
  'only for you': 'solo para ti',
  // Less noise: what happens to a plan, in its card; shorter footers; cross reads in the reply's foot.
  'LEFT ON ITS OWN · WAITING FOR THE ANSWER': 'SALIÓ SOLA · ESPERA RESPUESTA',
  'CLOSED': 'CERRADO',
  'answered: {n}': 'respondidas: {n}',
  'failed: {n}': 'fallidas: {n}',
  'skipped: {n}': 'omitidas: {n}',
  'Stopped leaving on its own ({why}). What is left waits for your press.': 'Dejó de enviar solo ({why}). Lo que falta espera tu botón.',
  'MU/TH/UR › BISHOP stopped sending on its own ({why}).': 'MU/TH/UR › BISHOP dejó de enviar solo ({why}).',
  'It runs only if you send it, with your key.': 'Solo corre si la envías tú, con tu llave.',
  'For you only; the agents of this room do not read it.': 'Solo para ti; los agentes de esta sala no la leen.',
  'recalled {n} from {room}': 'recordó {n} de {room}',
  'read {n} from {room}': 'leyó {n} de {room}',
  // BISHOP's card: its settings in words, and its state in the room's language.
  'ORDERS': 'ÓRDENES',
  'LINKS TO READ': 'ENLACES DE LECTURA',
  '@madre · only answers': '@madre · solo responde',
  'Manual: every order waits for your press': 'Manual: cada orden espera tu botón',
  'Hybrid: #0 and #1 leave on their own': 'Híbrido: #0 y #1 salen solas',
  'Automatic: up to #2 leave on their own': 'Automático: hasta #2 salen solas',
  'BISHOP signs them, for 7 days at most': 'Los firma BISHOP, por 7 días como máximo',
  'You sign them': 'Los firmas tú',
  'Always within the link. #3 and #4 always wait for your key in their room; a failure or STOP ALL stops what leaves on its own.': 'Siempre dentro del enlace. #3 y #4 siempre esperan tu llave en su sala; un fallo o PARAR TODO detienen lo que sale solo.',
  'A link with orders is always signed by you. A link BISHOP signed is revoked with one press, in Salas.': 'Un enlace con órdenes siempre lo firmas tú. Uno que firmó BISHOP se revoca con un toque, en Salas.',
  'No ready agent. Choose one when it is available.': 'Ningún agente está listo. Elige uno cuando lo esté.',
  'on · @{agent} · only answers': 'encendido · @{agent} · solo responde',
  'on · @{agent} · {orders} · {links}': 'encendido · @{agent} · {orders} · {links}',
  'manual orders': 'órdenes manuales',
  'hybrid orders': 'órdenes híbridas',
  'automatic orders': 'órdenes automáticas',
  'BISHOP signs links to read': 'BISHOP firma los de lectura',
  'you sign every link': 'tú firmas cada enlace',
  'order {step} of {total} · you sent it from Salas': 'orden {step} de {total} · la enviaste tú desde Salas',
  'order {step} of {total} · sent on its own from Salas, in the mode you chose': 'orden {step} de {total} · salió sola desde Salas, en el modo que elegiste',
  'YOU · FROM {room}': 'TÚ · DESDE {room}',
  // S-021 and fase 3e: who read through a link, for which turn; and recall on every turn.
  'That reading does not belong to a turn running in this room.': 'Esa lectura no pertenece a un turno que esté corriendo en esta sala.',
  'This is changed by you, from Salas.': 'Esto lo cambias tú, desde Salas.',
  'recall is on or off.': 'el recuerdo está encendido o apagado.',
  'Through a link you signed: read-only, counted in both rooms.': 'Por un enlace que firmaste: solo lectura, contado en las dos salas.',
  'Recall on every turn': 'Recordar en cada turno',
  'The room that reads gets up to 3 of these notes on every turn, without asking. Each such turn counts as one reading of the hourly limit. Off, its agents read only when they choose to.': 'La sala que lee recibe hasta 3 de estas notas en cada turno, sin pedirlas. Cada turno así cuenta como una lectura del tope por hora. Apagado, sus agentes leen solo cuando lo deciden.',
  'last by @{agent} of {room}, {when}': 'la última, @{agent} de {room}, {when}',
  'Recall on every turn (up to 3 notes)': 'Recordar en cada turno (hasta 3 notas)',
  ' · signed by BISHOP': ' · lo firmó BISHOP',
  'signed by BISHOP': 'lo firmó BISHOP',
  'BISHOP signs only links to read; a link with orders is signed by you.': 'BISHOP solo firma enlaces de lectura; uno con órdenes lo firmas tú.',
  'Only you or BISHOP sign a link.': 'Solo tú o BISHOP firman un enlace.',
  'BISHOP signs only links that expire within 7 days.': 'BISHOP solo firma enlaces que caducan en 7 días o menos.',
  'Ask BISHOP, from this room, about any linked room. The answer is for you; the agents of this room do not read it without a link.': 'Pregúntale a BISHOP, desde esta sala, por cualquier sala enlazada. La respuesta es para ti; los agentes de esta sala no la leen sin un enlace.',
  'the room of Salas': 'la sala de Salas',
  'a setting in config.json; no project files': 'un ajuste en config.json; ningún archivo del proyecto',
  'a ready agent; @madre is selected by default when ready': 'un agente listo; @madre se elige por defecto si está listo',
  'SENDING': 'ENVIANDO',
  'SENT · WAITING FOR THE ANSWER': 'ENVIADA · ESPERA RESPUESTA',
  'ANSWERED': 'RESPONDIDA',
  'FAILED': 'FALLÓ',
  'SKIPPED': 'OMITIDA',
  'WILL NOT LEAVE': 'NO SALE',
  'PROPOSAL': 'PROPUESTA',
  ' · plan {plan} closed · {done} answered · {failed} failed · {skipped} skipped': ' · plan {plan} cerrado · respondidas: {done} · fallidas: {failed} · omitidas: {skipped}',
  ' · the block of orders could not be read: {why}': ' · el bloque de órdenes no se pudo leer: {why}',
  '@{agent} in {room} · order {step} of {total} · plan {plan}': '@{agent} en {room} · orden {step} de {total} · plan {plan}',
  'the rest, in the room': 'el resto, en la sala',
  'see it in the room': 'verla en la sala',
  'the block is not closed': 'el bloque no está cerrado',
  'text after the block': 'hay texto después del bloque',
  'the first line says why': 'la primera línea debe decir el motivo',
  'not an order line': 'una línea no es una orden',
  'no such mode': 'ese modo no existe',
  'more than 4 orders': 'más de 4 órdenes',
  'Two rooms on this Mac have that name; use the room id.': 'Dos salas de esta Mac tienen ese nombre; usa el id de la sala.',
  'BISHOP lives in this room; it gives orders to the others.': 'BISHOP vive en esta sala; da órdenes a las demás.',
  'No such agent on this Mac.': 'Ese agente no está en esta Mac.',
  'No signed link lets BISHOP give orders to that room.': 'Ningún enlace firmado deja a BISHOP dar órdenes a esa sala.',
  '#3 and #4 never travel: arm it yourself in that room.': '#3 y #4 nunca viajan: ármala tú en esa sala.',
  'That link allows orders up to #{n}.': 'Ese enlace permite órdenes hasta #{n}.',
  'A page cannot give orders across rooms; only a room can.': 'Una página no puede dar órdenes a otra sala; solo una sala puede.',
  'BISHOP lives in Salas.': 'BISHOP vive en Salas.',
  'BISHOP is off. Turn it on in MODULES.': 'BISHOP está apagado. Enciéndelo en MÓDULOS.',
  'That order is not in this room.': 'Esa orden no está en esta sala.',
  'That order is not waiting to be sent.': 'Esa orden no está esperando a enviarse.',
  'That room is asleep. Wake it from Salas to send it orders.': 'Esa sala está dormida. Despiértala desde Salas para mandarle órdenes.',
  'The channel has no key.': 'El canal no tiene llave.',
  'That room runs an older MADRE. Update it to send it orders.': 'Esa sala corre una MADRE anterior. Actualízala para mandarle órdenes.',
  'The room of Salas gives orders; it does not receive them.': 'La sala de Salas da órdenes; no las recibe.',
  'An order is between 1 and {n} characters.': 'Una orden tiene entre 1 y {n} caracteres.',
  'That is not an order of a plan.': 'Eso no es una orden de un plan.',
  '@{agent} is not ready in that room.': '@{agent} no está listo en esa sala.',
  'That room is already running an order. One at a time.': 'Esa sala ya está corriendo una orden. Una a la vez.',
  'That room is working right now. An order never interrupts it; send it when it is free.': 'Esa sala está trabajando ahora. Una orden nunca la interrumpe; envíala cuando esté libre.',
  'This link carried {n} orders in the last hour, its limit. Try again later.': 'Este enlace llevó {n} órdenes en la última hora, su tope. Inténtalo más tarde.',
  'That order is not waiting for an answer.': 'Esa orden no está esperando respuesta.',
  'BISHOP fetches signed linked notes when you send. They are not shown in this preview, so looking here does not use a link reading.': 'BISHOP lee las notas de enlaces firmados cuando envías el mensaje. No aparecen en esta vista previa, así que mirarla no consume una lectura del enlace.',
  'MU/TH/UR › preview copied. BISHOP adds signed linked notes when you send.': 'MU/TH/UR › vista previa copiada. BISHOP agrega las notas de enlaces firmados al enviar.',
  'Calm': 'En calma',
  'Not answering right now': 'No responde por ahora',
  'Update MADRE in this room to see it here.': 'Actualiza MADRE en esta sala para verla aquí.',
  '@{agent} is working': '@{agent} está trabajando',
  '{n} agents working': '{n} agentes trabajando',
  '{n} conversations': '{n} conversaciones',
  '{n} memories': '{n} memorias',
  '{n} travel': '{n} viajan',
  'No memories yet': 'Sin memorias todavía',
  'This page closes with it.': 'Esta página se cierra con ella.',
  'What is running stops.': 'Lo que está corriendo se detiene.',
  'Nothing is running.': 'No hay nada corriendo.',
  '{n} open': '{n} abiertas',
  '{n} asleep': '{n} dormidas',
  'This room did not answer. It may have closed.': 'Esta sala no respondió. Puede que se haya cerrado.',
  'Your rooms run on this Mac. Each one is a project, with its own memory.': 'Tus salas corren en esta Mac. Cada una es un proyecto, con su propia memoria.',
  'The room did not open.': 'La sala no abrió.',
  'This room closed. Open MADRE again from its folder, or from another room.': 'Esta sala se cerró. Vuelve a abrir MADRE desde su carpeta, o desde otra sala.',
  'That room did not answer.': 'Esa sala no respondió.',
  'Touch again to stop all': 'Toca otra vez para detener todo',
  'Closed rooms whose project is still on this Mac. Waking one opens it as madre start would.': 'Salas cerradas cuyo proyecto sigue en esta Mac. Despertar una la abre como lo haría madre start.',
  'No rooms yet. Open MADRE in a project folder and it will be here.': 'Todavía no hay salas. Abre MADRE en la carpeta de un proyecto y aparecerá aquí.',
  'MADRE does not know that room on this Mac.': 'MADRE no conoce esa sala en esta Mac.',
  'The folder of that project is no longer on this Mac.': 'La carpeta de ese proyecto ya no está en esta Mac.',
  'The room did not open. What it said on the way up is in start.log, beside its record.': 'La sala no abrió. Lo que dijo al arrancar está en start.log, junto a su registro.',
  'That room runs an older MADRE. Update it, or close it from its terminal.': 'Esa sala usa una MADRE anterior. Actualízala, o ciérrala desde su terminal.',
  // ENLACES (docs/MACROVERSO.md, fase 3b): la sala que entrega notas por un enlace (src/server.mjs).
  'A page cannot read across a link; only a room can.': 'Una página no puede leer por un enlace; solo una sala.',
  'That is not the key of this Mac.': 'Esa no es la llave de esta Mac.',
  'This link was read {n} times in the last hour, its limit. Try again later.': 'Este enlace se leyó {n} veces en la última hora, su tope. Inténtalo más tarde.',
  // Fase 3c: la sala que pide (/api/enlace/ask), los avisos entre salas y la firma desde Salas.
  'This link lets this room read only: {kinds}.': 'Este enlace deja a esta sala leer solo: {kinds}.',
  'That room is asleep. Wake it from Salas to read from it.': 'Esa sala está dormida. Despiértala desde Salas para leer de ella.',
  'That is not a notice a link sends.': 'Eso no es un aviso que mande un enlace.',
  // Lo que un contrato rechaza al firmarlo (src/enlaces.mjs), tal como lo verá la hoja de Salas.
  'A room cannot be linked to itself.': 'Una sala no se puede enlazar consigo misma.',
  'The direction is a→b, b→a or both.': 'El sentido es a→b, b→a o ambos.',
  'A link names the kinds that may cross.': 'Un enlace nombra los tipos que pueden cruzar.',
  'An aberration never crosses a link.': 'Una aberración nunca cruza un enlace.',
  'orders.perHour is a whole number above zero.': 'orders.perHour es un número entero mayor que cero.',
  'That link would already have expired.': 'Ese enlace ya habría caducado.',
  'The room of Salas never serves a link: BISHOP gathers every room and is nobody\'s source.': 'La sala de Salas nunca entrega por un enlace: BISHOP reúne todas las salas y no es fuente de ninguna.',
  'Orders need the room of Salas at one end of the link.': 'Las órdenes necesitan a la sala de Salas en un extremo del enlace.',
  // El módulo ENLACES (src/modules/enlaces.mjs): su ficha. Lo que entrega a los agentes queda en inglés.
  'What other rooms know, when a signed link lets this room read it. Read-only; nothing leaves this Mac.': 'Lo que otras salas saben, cuando un enlace firmado deja leerlo. Solo lectura; nada sale de la Mac.',
  'a link signed in Salas that lets this room read from another': 'un enlace firmado en Salas que deje a esta sala leer de otra',
  'on · no signed link lets this room read yet': 'encendido · ningún enlace firmado deja leer a esta sala todavía',
  'on · one link lets this room read · {n} readings in 24 h': 'encendido · un enlace deja leer a esta sala · {n} lecturas en 24 h',
  'on · {links} links let this room read · {n} readings in 24 h': 'encendido · {links} enlaces dejan leer a esta sala · {n} lecturas en 24 h',
  // THE MACROVERSE (macroverso.js).
  'Macroverse': 'Macroverso',
  'Back to Rooms': 'Volver a Salas',
  'Drag the space to move it · wheel to come closer · click a universe to look at it · drag it to turn it · drag one onto another to link them · ← → from one to the next · Esc to come back': 'Arrastra el espacio para moverlo · rueda para acercarte · clic en un universo para verlo · arrástralo para girarlo · arrastra uno sobre otro para enlazarlos · ← → de uno a otro · Esc para volver',
  '{n} veins': '{n} venas',
  // ENLACES en la interfaz (docs/MACROVERSO.md, fase 3c): la línea en la sala, la sección de Salas, la hoja de firma y el Macroverso.
  'LINK': 'ENLACE',
  ' · with {room} · revoked. Nothing crosses any more.': ' · con {room} · revocado. Ya no cruza nada.',
  ' · with {room} · this room reads its {kinds}, read-only': ' · con {room} · esta sala lee de ella: {kinds}; solo lectura',
  " · with {room} · it reads this room's {kinds}, read-only": ' · con {room} · esa sala lee de esta: {kinds}; solo lectura',
  " · with {room} · both read each other's {kinds}, read-only": ' · con {room} · las dos se leen: {kinds}; solo lectura',
  ' · until {date}': ' · hasta {date}',
  'Links': 'Enlaces',
  'A link lets one room read the distilled notes of another, read-only, by a contract you sign here. Nothing is written across, and only notes that travel into turns cross.': 'Un enlace deja a una sala leer las notas destiladas de otra, solo lectura, por un contrato que firmas aquí. Nada se escribe al otro lado, y solo cruzan notas que viajan a los turnos.',
  'Link rooms': 'Enlazar salas',
  '{reader} reads from {source}': '{reader} lee de {source}',
  '{a} and {b} read each other': '{a} y {b} se leen',
  'until {date}': 'hasta {date}',
  'no expiry': 'sin caducidad',
  '{n} reads in 24 h': '{n} lecturas en 24 h',
  'last {when}': 'última {when}',
  'none yet': 'ninguna aún',
  'orders up to #{n}': 'órdenes hasta #{n}',
  'Revoke': 'Revocar',
  'Revoke it': 'Revocarlo',
  'Nothing crosses from then on.': 'Desde entonces no cruza nada.',
  'Link two rooms': 'Enlazar dos salas',
  'The one that reads': 'La que lee',
  'The one that serves': 'La que entrega',
  'Both ways': 'En los dos sentidos',
  'What crosses': 'Qué cruza',
  'Only notes that travel into turns cross: hold and bridge, cleaned by the privacy guard of the room that serves. Never the ledger, files, med bay or jettisoned.': 'Solo cruzan notas que viajan a los turnos: bodega y puente, limpias por el guardia de privacidad de la sala que entrega. Nunca el registro, archivos, enfermería ni esclusa.',
  'Expires': 'Caduca',
  'In a day': 'En un día',
  'In a week': 'En una semana',
  'In 30 days': 'En 30 días',
  'Never': 'Nunca',
  'Orders from the super agent': 'Órdenes del super agente',
  'Allow orders into {room}': 'Permitir órdenes hacia {room}',
  'up to': 'hasta',
  'per hour': 'por hora',
  'Type the designation of {room} to allow orders into it': 'Teclea la designación de {room} para permitir órdenes hacia ella',
  'Sign': 'Firmar',
  'Signing…': 'Firmando…',
  'Choose two different rooms.': 'Elige dos salas distintas.',
  'Choose at least one kind.': 'Elige al menos un tipo.',
  'The link could not be signed.': 'El enlace no se pudo firmar.',
  'Link…': 'Enlazar…',
  'reads {kinds} from {room}': 'lee {kinds} de {room}',
  '{room} reads its {kinds}': '{room} lee sus {kinds}',
  'both ways with {room}: {kinds}': 'en los dos sentidos con {room}: {kinds}',
  // La sala de Salas (docs/MACROVERSO.md, fase 3d).
  'The room of SALAS': 'La sala de Salas',
  '{n} universes': '{n} universos',
  '{n} waiting for you': '{n} te esperan',
  'Enter the room': 'Entrar a la sala',
  'All the universes': 'Todos los universos',
  'This Mac': 'Esta Mac',
  'Done. Your Mac is on your phone.': 'Listo. Tu Mac está en tu teléfono.',
  'To open MADRE like an app, add it to your home screen:': 'Para abrir MADRE como una app, agrégala a tu pantalla de inicio:',
  'Touch Share, at the bottom of Safari.': 'Toca Compartir, abajo en Safari.',
  'Choose «Add to Home Screen».': 'Elige «Agregar a inicio».',
  'Touch the ⋮ menu of your browser.': 'Toca el menú ⋮ de tu navegador.',
  'Choose «Add to Home screen».': 'Elige «Agregar a la pantalla principal».',
  'The message could not be read.': 'No se pudo leer el mensaje.',
  'That room did not answer. It may have just closed on your Mac.': 'Esa sala no respondió. Quizá se acaba de cerrar en tu Mac.',
  "MADRE answers only when it is called by this computer's name (127.0.0.1 or localhost).": 'MADRE solo responde cuando la llaman por el nombre de esta computadora (127.0.0.1 o localhost).',
  'Too many tries': 'Demasiados intentos',
  'Wait a minute and scan the code again.': 'Espera un minuto y vuelve a escanear el código.',
  'This code no longer works': 'Este código ya no sirve',
  'Each code works once and for ten minutes. Make a new one on your Mac: Phone, in the bar.': 'Cada código sirve una vez y durante diez minutos. Haz uno nuevo en tu Mac: Teléfono, en la barra.',
  'This phone is not paired': 'Este teléfono no está emparejado',
  "On your Mac, press Phone in the bar and scan the code with this phone's camera.": 'En tu Mac, presiona Teléfono en la barra y escanea el código con la cámara de este teléfono.',
  'This phone is not paired.': 'Este teléfono no está emparejado.',
  'Too many requests from this phone. Wait a moment.': 'Demasiadas peticiones desde este teléfono. Espera un momento.',
  'A page from somewhere else cannot act in this room.': 'Una página de otro sitio no puede actuar en esta sala.',
  'That room is closed on your Mac.': 'Esa sala está cerrada en tu Mac.',
  'That is too large to send from the phone.': 'Eso es demasiado grande para enviarlo desde el teléfono.',
  'The bridge could not do that.': 'El puente no pudo hacer eso.',
  'Mark this network as trusted first.': 'Primero marca esta red como de confianza.',
  'This Mac has no address on the local network.': 'Esta Mac no tiene dirección en la red local.',
  'The bridge did not open on port {port}. Another program may be using it.': 'El puente no se abrió en el puerto {port}. Quizá otro programa lo está usando.',
  'Code to pair your phone': 'Código para emparejar tu teléfono',
  'This looks better on the Mac. From here you can look around and switch things on or off.': 'Esto se ve mejor en la Mac. Desde aquí puedes ver qué hay y encender o apagar cosas.',
  'Permissions are changed on the Mac. From the phone a message goes up to #2 CREATE, and when an agent asks for a mode it is granted up to #2.': 'Los permisos se cambian en la Mac. Desde el teléfono un mensaje llega hasta #2 CREATE, y cuando un agente pide un modo se concede hasta #2.',
  'Permissions are changed on the Mac.': 'Los permisos se cambian en la Mac.',
  'DRAG TO MOVE · PINCH TO ZOOM · TOUCH A MEMORY · DO NOT TOUCH MOTHER': 'ARRASTRA PARA MOVER · PELLIZCA PARA ACERCAR · TOCA UNA MEMORIA · NO TOQUES A MOTHER',
  'Servers on your Mac': 'Servidores en tu Mac',
  'Switches in Settings': 'Interruptores en Ajustes',
  'The servers could not be read.': 'No se pudieron leer los servidores.',
  'No server of this project is running on your Mac.': 'Ningún servidor de este proyecto está corriendo en tu Mac.',
};
