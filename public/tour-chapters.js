// What the welcome of MADRE 1.0 says (2026-10-11): twelve chapters and the sheet of gestures, in
// both languages side by side, as the cards of What's new are (src/whats-new.mjs). Each chapter
// fits on one view: a short scene, a line, three sentences, its gestures and «Take me there».
// Everything here is what the product does today; what could not be checked in the code is not
// said. `where` is where the thing lives: in Home, inside a project, or both; «Take me there» is
// offered wherever the page can take the person to it (public/tour.js).

export const CHAPTERS = [
  {
    id: 'moved',
    title: { es: 'Qué se movió', en: 'What moved' },
    lead: { es: 'Lo que buscabas sigue ahí, con otro nombre o en otro lugar.', en: 'What you looked for is still there, under another name or in another place.' },
    moved: [
      ['PERSONALIZAR', { es: 'Ajustes · ⌘ ,', en: 'Settings · ⌘ ,' }],
      ['MU/TH/UR', { es: 'Diagnóstico', en: 'Diagnostics' }],
      ['NOSTROMO', { es: 'Mapa de memoria, en la barra', en: 'Memory map, on the bar' }],
      ['BISHOP', { es: 'Coordinador', en: 'Coordinator' }],
      ['#4 AIRLOCK', { es: '#4 Acceso total: la llave dos veces', en: '#4 Full access: the key, twice' }],
      [{ es: 'CONEXIONES (sesión)', en: 'CONNECTIONS (sign-in)' }, { es: 'Ajustes › Agentes', en: 'Settings › Agents' }],
      ['ASH', { es: 'Ahorro de tokens, en Módulos', en: 'Token saver, in Modules' }],
      [{ es: 'EN · tema', en: 'EN · theme' }, { es: 'Ajustes › Apariencia', en: 'Settings › Appearance' }],
    ],
    points: {
      es: [
        '<code>madre</code> sin nada más abre Inicio; <code>madre start</code> sigue abriendo el proyecto de la carpeta.',
        '«Conexiones» ya no es iniciar sesión de los agentes: eso vive en Ajustes › Agentes. Ahora una conexión deja que un proyecto consulte lo que otro aprendió.',
        'Ajustes reúne PERSONALIZAR y las pestañas de MU/TH/UR; Diagnóstico es lo que era MU/TH/UR.',
      ],
      en: [
        '<code>madre</code> on its own opens Home; <code>madre start</code> still opens the project in the folder.',
        '«Connections» is no longer signing your agents in: that lives in Settings › Agents. A connection now lets one project look up what another learned.',
        'Settings gathers PERSONALIZE and the tabs of MU/TH/UR; Diagnostics is what MU/TH/UR was.',
      ],
    },
    keys: [],
    where: [],
  },
  {
    id: 'home',
    title: { es: 'Inicio', en: 'Home' },
    lead: { es: 'Todos tus proyectos en un lugar, abiertos o dormidos.', en: 'All your projects in one place, open or asleep.' },
    points: {
      es: [
        'Agrega carpetas: no se abren hasta que tú quieras.',
        'Clic derecho o ⋯ en una tarjeta: anclarla a la barra, ordenarla o quitarla de MADRE. Su carpeta no se toca.',
        'Te esperan, Decisiones recientes y el Resumen reciente te dicen qué pasó mientras no estabas.',
      ],
      en: [
        'Add folders: they do not open until you want them to.',
        'Right-click or ⋯ on a card: pin it to the bar, order it, or remove it from MADRE. Its folder is not touched.',
        'Waiting for you, Recent decisions and the Recent summary tell you what happened while you were away.',
      ],
    },
    keys: [
      [{ es: 'Menú de un proyecto', en: 'A project\'s menu' }, { es: 'clic derecho · ⋯', en: 'right-click · ⋯' }],
      [{ es: 'Anclarlo a la barra', en: 'Pin it to the bar' }, { es: 'arrastrar la tarjeta', en: 'drag the card' }],
      [{ es: 'Los que no caben', en: 'Those that do not fit' }, '+n'],
    ],
    where: ['home'],
  },
  {
    id: 'project',
    title: { es: 'Tu proyecto', en: 'Your project' },
    lead: { es: 'Cada proyecto tiene su conversación, sus archivos y su memoria.', en: 'Each project has its own conversation, files and memory.' },
    points: {
      es: [
        'La segunda barra lleva a Inicio, a otro proyecto abierto, a recargar y a Ajustes.',
        'Cambiar de proyecto muestra los que tienes abiertos; su luz avisa si alguien te espera, si un agente trabaja o si algo terminó.',
        'Abre otra conversación al lado o en una ventana, y acomoda los paneles como quieras.',
      ],
      en: [
        'The second bar takes you to Home, to another open project, to reload and to Settings.',
        'Switch project shows the ones you have open; its light says if someone waits for you, if an agent is working or if something finished.',
        'Open another conversation beside this one or in a window, and arrange the panels as you like.',
      ],
    },
    keys: [
      [{ es: 'Recorrer Cambiar de proyecto', en: 'Move through Switch project' }, '← → ↑ ↓'],
      [{ es: 'Ir al elegido', en: 'Go to the one chosen' }, { es: 'clic o ↵', en: 'click or ↵' }],
      [{ es: 'Mover una ventana', en: 'Move a window' }, { es: 'arrastrar la cabecera', en: 'drag its header' }],
    ],
    where: ['room'],
  },
  {
    id: 'talk',
    title: { es: 'Hablar con los agentes', en: 'Talking to your agents' },
    lead: { es: 'Una conversación, todos tus agentes.', en: 'One conversation, every agent.' },
    points: {
      es: [
        'Elige el agente en el orbe; el modo, el modelo y el esfuerzo van en una fila bajo la caja.',
        'Escribe @ para un agente, # para un modo, ! para un archivo y / para un comando.',
        'Cada respuesta se puede calificar, copiar o responder.',
      ],
      en: [
        'Choose the agent in the orb; mode, model and effort sit in one row under the box.',
        'Type @ for an agent, # for a mode, ! for a file and / for a command.',
        'Every answer can be rated, copied or replied to.',
      ],
    },
    keys: [
      [{ es: 'Enviar', en: 'Send' }, '↵'],
      [{ es: 'Salto de línea', en: 'New line' }, '⌥ ↵'],
      [{ es: 'Agente, modo, archivo, comando', en: 'Agent, mode, file, command' }, '@ # ! /'],
      [{ es: 'Pegar o soltar imágenes', en: 'Paste or drop images' }, '⌘ V'],
    ],
    where: ['room'],
  },
  {
    id: 'modes',
    title: { es: 'Modos y permisos', en: 'Modes and permissions' },
    lead: { es: 'Cada mensaje dice hasta dónde puede llegar el agente.', en: 'Every message says how far the agent may go.' },
    points: {
      es: [
        '#0 Incógnito, #1 Solo conversar, #2 Crear, #3 Editar y #4 Acceso total.',
        '#3 y #4 piden tu llave, y #4 la pide dos veces. Qué llave usar lo eliges en Ajustes › Permisos.',
        'Una llave aceptada puede valer unos minutos; mientras dura, lo ves junto a la caja.',
      ],
      en: [
        '#0 Incognito, #1 Chat only, #2 Create, #3 Edit and #4 Full access.',
        '#3 and #4 ask for your key, and #4 asks for it twice. Which key, you choose in Settings › Permissions.',
        'An accepted key can last a few minutes; while it does, you see it beside the box.',
      ],
    },
    keys: [[{ es: 'Elegir el modo al escribir', en: 'Choose the mode as you type' }, '#']],
    where: ['room'],
  },
  {
    id: 'coordinator',
    title: { es: 'El Coordinador', en: 'The Coordinator' },
    lead: { es: 'Un agente que ve todos tus proyectos desde arriba.', en: 'An agent that sees all your projects from above.' },
    points: {
      es: [
        'Lee entre tus proyectos, firma conexiones y lleva órdenes de uno a otro. Le hablas en su propio proyecto, desde Inicio.',
        'Desde cualquier proyecto le preguntas con /bishop, y la respuesta es solo para ti.',
        'Sus órdenes llegan hasta #2; #3 y #4 llegan como una propuesta que tú desbloqueas en ese proyecto.',
      ],
      en: [
        'It reads across your projects, signs connections and carries orders from one to another. You talk to it in its own project, from Home.',
        'From any project you ask it with /bishop, and the answer is for you only.',
        'Its orders go up to #2; #3 and #4 arrive as a proposal you unlock in that project.',
      ],
    },
    keys: [[{ es: 'Preguntarle desde un proyecto', en: 'Ask it from a project' }, '/bishop']],
    where: ['home'],
  },
  {
    id: 'links',
    title: { es: 'Conexiones', en: 'Connections' },
    lead: { es: 'Un proyecto puede consultar lo que otro ya aprendió.', en: 'One project can look up what another has already learned.' },
    points: {
      es: [
        'Tú firmas cada conexión: qué consulta, por cuánto tiempo y si el Coordinador puede dar órdenes.',
        'Solo cruzan notas que ya están en uso, limpias de datos privados; nunca tus archivos ni tus conversaciones.',
        'Dos proyectos se conectan una vez; la revocas cuando quieras desde Conexiones, en Inicio.',
      ],
      en: [
        'You sign every connection: what it looks up, for how long, and whether the Coordinator may give orders.',
        'Only notes already in use cross, cleaned of private data; never your files nor your conversations.',
        'Two projects are connected once; you revoke it whenever you want from Connections, in Home.',
      ],
    },
    keys: [[{ es: 'Conectar en el Mapa de proyectos', en: 'Connect in the Project map' }, { es: 'llevar uno sobre otro', en: 'carry one onto another' }]],
    where: ['home'],
  },
  {
    id: 'maps',
    title: { es: 'Los mapas', en: 'The maps' },
    lead: { es: 'Tu memoria y tus proyectos, de un vistazo.', en: 'Your memory and your projects, at a glance.' },
    points: {
      es: [
        'El Mapa de memoria tiene su tecla en la barra del proyecto: cada estrella es algo que MADRE recuerda de él.',
        'El Mapa de proyectos, en Inicio, muestra tus proyectos y sus conexiones; pide una pantalla de 900 px o más.',
        'En el Mapa de proyectos, lleva un proyecto sobre otro para conectarlos.',
      ],
      en: [
        'The Memory map has its key on the project\'s bar: every star is something MADRE remembers about it.',
        'The Project map, in Home, shows your projects and their connections; it needs a screen of 900 px or more.',
        'In the Project map, carry one project onto another to connect them.',
      ],
    },
    keys: [
      [{ es: 'Girar', en: 'Turn' }, { es: 'arrastrar', en: 'drag' }],
      [{ es: 'Mover', en: 'Move' }, { es: '⇧ arrastrar', en: '⇧ drag' }],
      [{ es: 'Acercar', en: 'Zoom' }, { es: 'rueda', en: 'wheel' }],
      [{ es: 'Volver', en: 'Back' }, { es: 'Esc, por capas', en: 'Esc, layer by layer' }],
    ],
    where: ['home', 'room'],
  },
  {
    id: 'settings',
    title: { es: 'Diagnóstico y Ajustes', en: 'Diagnostics and Settings' },
    lead: { es: 'Todo lo que configuras, en un lugar; y el remedio cuando algo falla.', en: 'Everything you set, in one place; and the remedy when something fails.' },
    points: {
      es: [
        'Ajustes se abre con ⌘ , y se busca con /. Los cambios se aplican al instante.',
        'Apariencia tiene los acentos y los fondos para tema claro y oscuro, y también el idioma.',
        'En Diagnóstico escribes lo que pasa con tus palabras y te dice qué hacer, con la tecla que lo resuelve.',
      ],
      en: [
        'Settings opens with ⌘ , and is searched with /. Changes apply at once.',
        'Appearance has the accents and wallpapers for light and dark, and the language too.',
        'In Diagnostics you say what happens in your own words and it tells you what to do, with the key that fixes it.',
      ],
    },
    keys: [
      [{ es: 'Ajustes', en: 'Settings' }, '⌘ ,'],
      [{ es: 'Buscar en Ajustes', en: 'Search Settings' }, '/'],
      [{ es: 'Atrás, por capas', en: 'Back, layer by layer' }, 'Esc'],
    ],
    where: ['home', 'room'],
  },
  {
    id: 'modules',
    title: { es: 'Módulos', en: 'Modules' },
    lead: { es: 'Lo que le agregas a MADRE, como apps.', en: 'What you add to MADRE, like apps.' },
    points: {
      es: [
        'Un tablero de mosaicos, cada uno con su interruptor y su ficha.',
        'Ahorro de tokens, Intenciones e IA local se abren en su propia ventana.',
        'Continuidad (AHP+), GitHub y los demás dicen qué escriben y qué necesitan antes de instalarse.',
      ],
      en: [
        'A board of tiles, each with its switch and its sheet.',
        'Token saver, Intents and Local AI open in their own window.',
        'Continuity (AHP+), GitHub and the rest say what they write and what they need before they are installed.',
      ],
    },
    keys: [],
    where: ['room'],
  },
  {
    id: 'phone',
    title: { es: 'Tu teléfono', en: 'Your phone' },
    lead: { es: 'Sigue donde ibas, desde el teléfono.', en: 'Carry on where you were, from your phone.' },
    points: {
      es: [
        'Empareja tu teléfono con un código QR, en la misma red Wi‑Fi que tu Mac.',
        'Desde el teléfono llegas hasta #2; #3 y #4 se quedan en la Mac.',
        'Lo que empiezas en uno lo sigues en el otro: la Mac te ofrece continuar donde ibas.',
      ],
      en: [
        'Pair your phone with a QR code, on the same Wi‑Fi as your Mac.',
        'From the phone you reach up to #2; #3 and #4 stay on the Mac.',
        'What you start on one you carry on on the other: the Mac offers to continue where you were.',
      ],
    },
    keys: [[{ es: 'Ordenar la barra en el teléfono', en: 'Order the bar on the phone' }, { es: 'mantener 0,5 s', en: 'hold 0.5 s' }]],
    where: ['room'],
    // MADRE 1.0 keeps the phone a preview (src/server.mjs, phonePreview): on a Mac without it, this.
    soon: {
      lead: { es: 'Próximamente: MADRE en tu teléfono.', en: 'Coming soon: MADRE on your phone.' },
      points: {
        es: [
          'Vas a seguir tus proyectos y hablar con tus agentes desde el teléfono.',
          'Lo que empieces en uno lo vas a seguir en el otro.',
          'Cuando llegue, te lo contamos en Novedades.',
        ],
        en: [
          'You will follow your projects and talk to your agents from your phone.',
          'What you start on one you will carry on on the other.',
          'When it arrives, What\'s new will tell you.',
        ],
      },
    },
  },
  {
    id: 'gestures',
    title: { es: 'Gestos y atajos', en: 'Gestures and shortcuts' },
    lead: { es: 'Lo que se hace con las manos. Esta hoja se abre con ? en cualquier momento.', en: 'What is done with your hands. This sheet opens with ? at any moment.' },
    points: { es: [], en: [] },
    keys: [],
    where: ['home', 'room'],
  },
];

// The sheet of gestures: what `?` opens anywhere, and the last chapter.
export const GESTURES = [
  [{ es: 'En todo MADRE', en: 'Everywhere in MADRE' }, [
    [{ es: 'Ajustes', en: 'Settings' }, '⌘ ,'],
    [{ es: 'Cerrar lo de arriba, por capas', en: 'Close what is on top, layer by layer' }, 'Esc'],
    [{ es: 'Detener todo', en: 'Stop everything' }, '/stopall'],
    [{ es: 'Otra pestaña al ir a un proyecto', en: 'Another tab when going to a project' }, { es: '⌘ clic', en: '⌘ click' }],
    [{ es: 'Esta hoja', en: 'This sheet' }, '?'],
  ]],
  [{ es: 'La barra', en: 'The bar' }, [
    [{ es: 'Ordenarla', en: 'Order it' }, { es: 'clic derecho', en: 'right-click' }],
    [{ es: 'Quitar una tecla', en: 'Remove a key' }, '−'],
    [{ es: 'Mover una tecla', en: 'Move a key' }, { es: 'arrastrar', en: 'drag' }],
    [{ es: 'Lo que no cabe', en: 'What does not fit' }, '•••'],
  ]],
  [{ es: 'Cambiar de proyecto', en: 'Switch project' }, [
    [{ es: 'Abrir el panel', en: 'Open the panel' }, { es: 'clic', en: 'click' }],
    [{ es: 'Recorrerlo', en: 'Move through it' }, '← → ↑ ↓'],
    [{ es: 'Ir', en: 'Go' }, { es: 'clic o ↵', en: 'click or ↵' }],
    [{ es: 'Cerrarlo', en: 'Close it' }, 'Esc'],
  ]],
  [{ es: 'Ventanas y paneles', en: 'Windows and panels' }, [
    [{ es: 'Mover', en: 'Move' }, { es: 'arrastrar la cabecera', en: 'drag the header' }],
    [{ es: 'ACOMODAR', en: 'ARRANGE' }, { es: 'mantener el puntero 0,4 s', en: 'hold the pointer 0.4 s' }],
    [{ es: 'Apartar las ventanas', en: 'Set the windows aside' }, { es: 'clic en el escritorio', en: 'click the desktop' }],
    [{ es: 'Ancho del panel', en: 'Panel width' }, { es: '← → · ⇧ para 64 px', en: '← → · ⇧ for 64 px' }],
  ]],
  [{ es: 'La caja', en: 'The box' }, [
    [{ es: 'Enviar', en: 'Send' }, '↵'],
    [{ es: 'Salto de línea', en: 'New line' }, '⌥ ↵'],
    [{ es: 'Agente, modo, archivo, comando', en: 'Agent, mode, file, command' }, '@ # ! /'],
    [{ es: 'Pegar o soltar imágenes', en: 'Paste or drop images' }, '⌘ V'],
  ]],
  [{ es: 'Ajustes', en: 'Settings' }, [
    [{ es: 'Buscar', en: 'Search' }, '/'],
    [{ es: 'Abrir el primero', en: 'Open the first' }, '↵'],
    [{ es: 'Atrás, por capas', en: 'Back, layer by layer' }, 'Esc'],
  ]],
  [{ es: 'Mapa de memoria', en: 'Memory map' }, [
    [{ es: 'Girar', en: 'Turn' }, { es: 'arrastrar', en: 'drag' }],
    [{ es: 'Mover', en: 'Move' }, { es: '⇧ arrastrar', en: '⇧ drag' }],
    [{ es: 'Acercar', en: 'Zoom' }, { es: 'rueda', en: 'wheel' }],
    [{ es: 'Leer una memoria', en: 'Read a memory' }, { es: 'clic', en: 'click' }],
  ]],
  [{ es: 'Mapa de proyectos', en: 'Project map' }, [
    [{ es: 'Mover el espacio', en: 'Move the space' }, { es: 'arrastrar', en: 'drag' }],
    [{ es: 'Ir a uno', en: 'Go to one' }, { es: 'clic · ← →', en: 'click · ← →' }],
    [{ es: 'Conectar dos', en: 'Connect two' }, { es: 'llevar uno sobre otro', en: 'carry one onto another' }],
    [{ es: 'Volver', en: 'Back' }, { es: 'Esc, por capas', en: 'Esc, layer by layer' }],
  ]],
  [{ es: 'Inicio', en: 'Home' }, [
    [{ es: 'Menú de un proyecto', en: 'A project\'s menu' }, { es: 'clic derecho · ⋯', en: 'right-click · ⋯' }],
    [{ es: 'Anclarlo', en: 'Pin it' }, { es: 'arrastrar a la barra', en: 'drag to the bar' }],
    [{ es: 'Los que no caben', en: 'Those that do not fit' }, '+n'],
  ]],
  [{ es: 'Visor y editor', en: 'Viewer and editor' }, [
    [{ es: 'Guardar', en: 'Save' }, '⌘ S'],
    [{ es: 'Buscar · reemplazar', en: 'Find · replace' }, '⌘ F · ⌥ ⌘ F'],
    [{ es: 'Ir a una línea', en: 'Go to a line' }, '⌃ G'],
  ]],
];
