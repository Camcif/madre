// What a version brings, said to the person who just got it.
//
// After an update the room opens once on a sheet of what is new: a few things, each said plainly,
// each with where to find it, and a way to read every change. Once per version, for everyone who
// came from an older one; never on a first install, where the tour does that job.
//
// Whether it has been seen lives in ~/.pulse/whats-new.json and not in the browser: the page's
// storage belongs to one port, and the same person opening the room on another port has still
// seen it. Nothing here touches the network; the link to every change is the release page the
// room already knows (updates.mjs).
//
// The notes are written by hand, version by version, in both languages the room speaks. A minor
// version cannot be closed without them (scripts/release.mjs); a patch may ship without, and then
// nothing opens.

import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { compareVersions } from './updates.mjs';

const FILE = 'whats-new.json';

// `icon` names one of the room's 8-bit icons. `where` says where it lives, in the words the
// screens use. `more` is the one thing nobody is told how to find.
export const NOTES = {
  '0.8.0': {
    intro: {
      es: 'Esta versión acomoda la sala como tú quieras: todo se abre al lado o en ventana, varias conversaciones trabajan a la vez y los servidores de tu proyecto viven dentro de MADRE.',
      en: 'This version lets you arrange the room your way: everything opens beside you or in a window, several conversations work at once, and your project’s servers live inside MADRE.',
    },
    items: [
      {
        icon: 'grid',
        title: { es: 'Todo se abre al lado o en ventana', en: 'Everything opens beside you or in a window' },
        body: {
          es: 'Conversaciones, Archivos, el navegador, el visor, MÓDULOS y MU/TH/UR se ponen a un lado de la conversación o flotan en una ventana que mueves y cambias de tamaño. Nada te tapa la caja de texto.',
          en: 'Conversations, Files, the browser, the viewer, MODULES and MU/TH/UR sit beside the conversation or float in a window you move and resize. Nothing covers the message box.',
        },
        where: { es: 'En el encabezado de cada panel · split y ventana, junto a la ×', en: 'In the header of every panel · split and window, next to the ×' },
      },
      {
        icon: 'bell',
        title: { es: 'Varias conversaciones trabajando a la vez', en: 'Several conversations working at once' },
        body: {
          es: 'Mientras un agente responde, escribe en otra conversación: la primera sigue trabajando. Cuando termina una que no estás mirando, la sala te avisa, y si lo permites llega una notificación.',
          en: 'While an agent answers, write in another conversation: the first keeps working. When one you are not watching finishes, the room tells you, and a notification arrives if you allow it.',
        },
        where: { es: 'MU/TH/UR › TURNOS · ahí también se activan las NOTIFICACIONES', en: 'MU/TH/UR › TURNS · NOTIFICATIONS are switched on there too' },
      },
      {
        icon: 'branch',
        title: { es: 'Dos conversaciones, una en cada mitad', en: 'Two conversations, one in each half' },
        body: {
          es: 'Abre una segunda conversación en la mitad derecha, en vivo, con su propia caja de texto. Arrastra el borde para repartir el ancho o intercambia las mitades.',
          en: 'Open a second conversation in the right half, live, with its own message box. Drag the edge to share the width or swap the halves.',
        },
        where: { es: 'CONVERSACIONES · el botón junto a la × de cada conversación', en: 'CONVERSATIONS · the button next to the × of each conversation' },
      },
      {
        icon: 'link',
        title: { es: 'Los servidores de tu proyecto, dentro de la sala', en: 'Your project’s servers, inside the room' },
        body: {
          es: 'Un comando que abre un puerto sigue vivo en RUNS y se abre en SERVIDORES, que muestra solo los de este proyecto. Con SEÑALAR marcas un punto o un área de la página y se lo preguntas a un agente.',
          en: 'A command that opens a port stays alive in RUNS and opens in SERVERS, which shows only this project’s. With POINT you mark a spot or an area of the page and ask an agent about it.',
        },
        where: { es: 'RUNS › ABRIR EN SERVIDORES · en SERVIDORES, SEÑALAR', en: 'RUNS › OPEN IN SERVERS · in SERVERS, POINT' },
      },
      {
        icon: 'list',
        title: { es: 'Un editor de código en el visor', en: 'A code editor in the viewer' },
        body: {
          es: 'Edita los archivos de texto del proyecto con números de línea, coloreado, indentación automática y los atajos de siempre, sin salir de MADRE.',
          en: 'Edit the project’s text files with line numbers, highlighting, automatic indentation and the usual shortcuts, without leaving MADRE.',
        },
        where: { es: 'Abre un archivo en el visor › EDITAR', en: 'Open a file in the viewer › EDIT' },
      },
      {
        icon: 'check',
        title: { es: 'Escribir un proyecto de principio a fin', en: 'Writing a project from start to finish' },
        body: {
          es: 'Un turno que escribe tiene 10 minutos, y si se acaba ves lo que alcanzó a hacer y puedes reintentar con más tiempo. Si dos agentes quieren escribir, el segundo espera su turno.',
          en: 'A writing turn has 10 minutes, and if it runs out you see what it managed to do and can retry with more time. If two agents want to write, the second waits its turn.',
        },
        where: { es: 'Al subir el modo a #2 o más', en: 'When you raise the mode to #2 or above' },
      },
    ],
  },
  '0.7.0': {
    intro: {
      es: 'Esta versión le da forma a la memoria de la sala: ahora la ves en tres dimensiones, la lees en un tablero y cada memoria te dice cómo está.',
      en: 'This version gives the room’s memory a shape: you see it in three dimensions, read it on a dashboard, and every memory tells you how it is doing.',
    },
    items: [
      {
        icon: 'orbit',
        title: { es: 'NOSTROMO en tres dimensiones', en: 'NOSTROMO in three dimensions' },
        body: {
          es: 'El archivo de memorias tiene forma de cerebro y lo giras con el ratón. Al elegir una memoria, la sala la pone de frente, la fija con una mira y atenúa todo lo demás.',
          en: 'The memory archive is shaped like a brain and you turn it with the mouse. Choose a memory and the room brings it to face you, locks a sight on it and dims everything else.',
        },
        where: { es: 'MU/TH/UR › NOSTROMO · arrastra para girar, Shift + arrastra para moverte', en: 'MU/TH/UR › NOSTROMO · drag to turn, Shift + drag to move' },
      },
      {
        icon: 'star',
        title: { es: 'Cada memoria es una estrella', en: 'Every memory is a star' },
        body: {
          es: 'Su brillo dice cuánto la usa la sala; su superficie, si la confirmaste, si nadie la ha juzgado, si resultó falsa o si se está enfriando. En el centro, MOTHER: magma vivo.',
          en: 'Its brightness says how much the room relies on it; its surface, whether you confirmed it, nobody has judged it yet, it turned out false, or it is cooling. At the centre, MOTHER: living magma.',
        },
        where: { es: 'MU/TH/UR › NOSTROMO', en: 'MU/TH/UR › NOSTROMO' },
      },
      {
        icon: 'bars',
        title: { es: 'Un tablero para la memoria', en: 'A dashboard for memory' },
        body: {
          es: 'Lo que el archivo hizo día a día, de qué está hecho, qué tan bien contesta y cuál es el siguiente paso, en una sola pantalla.',
          en: 'What the archive did day by day, what it is made of, how well it answers and what to do next, on a single screen.',
        },
        where: { es: 'MU/TH/UR › MEMORIA', en: 'MU/TH/UR › MEMORY' },
      },
      {
        icon: 'chip',
        title: { es: 'Ideas para tu propio módulo', en: 'Ideas for a module of your own' },
        body: {
          es: 'Escribe /module y elige entre ocho ideas listas para editar: comandos, conectores con tus servicios y fichas propias. Un agente lo escribe y tú lo revisas antes de instalarlo.',
          en: 'Type /module and pick one of eight ideas ready to edit: commands, connectors to your services and cards of your own. An agent writes it and you review it before it is installed.',
        },
        where: { es: 'En la caja de texto · escribe /module', en: 'In the message box · type /module' },
      },
      {
        icon: 'stop',
        title: { es: 'Detén una respuesta, no la sala', en: 'Stop one reply, not the room' },
        body: {
          es: 'Un botón DETENER detiene a un solo agente a mitad de su respuesta; los demás siguen trabajando.',
          en: 'A STOP button halts one agent in the middle of its reply; the others keep working.',
        },
        where: { es: 'En la fila del turno en curso, junto a los segundos', en: 'On the row of the turn in progress, next to the seconds' },
      },
      {
        icon: 'lock',
        title: { es: 'Más protección desde el navegador', en: 'More protection from the browser' },
        body: {
          es: 'Ninguna página web que tengas abierta puede ya instalar un módulo en tu sala ni leer de ella.',
          en: 'No web page you have open can install a module in your room or read from it anymore.',
        },
        where: { es: 'Siempre activo; no tienes que hacer nada', en: 'Always on; there is nothing to set up' },
      },
    ],
    more: {
      icon: 'ufo',
      title: { es: 'Una cosa más…', en: 'One more thing…' },
      body: {
        es: 'Alguien más viaja a bordo. No está en ningún menú ni en ningún manual. Dicen que solo baja cuando llamas a la nave por su nombre, y por nada más.',
        en: 'Someone else travels on board. Not in any menu, not in any manual. They say it only comes down when you call the ship by its name, and nothing else.',
      },
    },
  },
};

export const notesFor = (version) => NOTES[version] ?? null;

// Whether this person should see the sheet for this version. Someone who has seen an older one,
// or who used the room before the sheet existed, sees it once; a first install never does.
export function shouldShow({ version, seen = null, returning = false }) {
  if (!notesFor(version)) return false;
  if (seen) return compareVersions(version, seen) > 0;
  return Boolean(returning);
}

export async function readSeen(root) {
  try {
    const value = JSON.parse(await readFile(join(root, FILE), 'utf8'))?.seen;
    return typeof value === 'string' ? value : null;
  } catch {
    return null;
  }
}

export async function markSeen(root, version) {
  await mkdir(root, { recursive: true });
  await writeFile(join(root, FILE), `${JSON.stringify({ seen: version }, null, 2)}\n`);
}

// Read at start-up, before this run creates anything: a room that already had rooms used MADRE
// before. A first install has nothing to catch up on, so it is marked as seen and never shown.
export async function bootWhatsNew({ root, version }) {
  const seen = await readSeen(root);
  if (seen) return { seen, returning: true };
  let returning = false;
  if (existsSync(join(root, 'rooms'))) {
    try { returning = (await readdir(join(root, 'rooms'))).length > 0; } catch { returning = false; }
  }
  if (!returning) await markSeen(root, version);
  return { seen: returning ? null : version, returning };
}

// `any`: the sheet for this version whether or not it was seen, for when it is asked for.
export async function whatsNew({ root, version, returning, any = false }) {
  const seen = await readSeen(root);
  const show = shouldShow({ version, seen, returning });
  return { version, show, notes: show || any ? notesFor(version) : null };
}
