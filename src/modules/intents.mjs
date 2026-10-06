// Intenciones: how hard each agent should think for the message being written.
//
// It reads the request, the conversation it belongs to and what this project has measured, and
// when there is something worth saying it says it under the composer: this looks like a lookup and
// a lower rung was enough here, or this looks like a hunt and the rung chosen is too light. The
// human presses the button or does not. Nothing changes on its own.
//
// What it knows, it learned from two tests the human starts from this card (intents-calibration):
// the quick one, where the human compares two answers without knowing which is which, and the full
// one, where an impartial agent does, after proving it can see a difference at all.
//
// Only Claude Code and Codex take an effort per run, so only they are in it.

import { join } from 'node:path';
import { defineModule } from './sdk.mjs';
import { t } from '../i18n.mjs';
import { IntentsDesk } from './intents-desk.mjs';

const desks = new Map();
// One desk per project room, made the first time anything asks for it.
export function deskFor(ctx) {
  const where = ctx.services?.intents;
  if (!where?.roomDir) return null;
  if (!desks.has(where.roomDir)) {
    desks.set(where.roomDir, new IntentsDesk({
      file: join(where.roomDir, 'intents.jsonl'),
      offersFile: join(where.roomDir, 'intents-offers.json'),
      events: where.events,
      projectEvents: where.projectEvents,
      bench: where.bench,
      projectRoot: ctx.projectRoot,
    }));
  }
  return desks.get(where.roomDir);
}

const enabled = (ctx) => ctx.config?.modules?.intents?.enabled !== false;
const count = (value) => Math.max(0, Math.min(50, Number.parseInt(value, 10) || 0));
const nameOrNull = (value) => (typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,120}$/.test(value) ? value : null);

export default defineModule({
  id: 'intents',
  configKey: 'intents',
  name: 'Intenciones',
  vendor: 'MADRE',
  version: '1.0.0',
  summary: 'Suggests how hard Claude Code and Codex should think for the message you are writing, from what was measured on this project. It suggests; you choose.',
  creates: ['nothing in the project', 'its measurements next to the room, in intents.jsonl'],
  settings: { enabled: true },
  card: 'intents',
  async status(ctx) {
    return {
      status: { installed: Boolean(ctx.settings.enabled), detail: ctx.settings.enabled ? t('on · suggests an effort when there is a reason to') : t('off · no suggestions under the composer') },
      install: { display: ctx.settings.enabled ? 'stop suggesting an effort' : 'suggest an effort when there is a reason to', platforms: [] },
    };
  },
  routes: [
    {
      method: 'GET', path: '/api/intents',
      handler: async (ctx, { url }) => {
        const desk = deskFor(ctx);
        if (!desk) return { status: 503, body: { error: t('Intenciones is not available in this room.') } };
        let models = {};
        try { models = JSON.parse(url.searchParams.get('models') ?? '{}') ?? {}; } catch { models = {}; }
        const chosen = Object.fromEntries(Object.entries(models).map(([agent, model]) => [agent, nameOrNull(model)]));
        return { status: 200, body: { enabled: enabled(ctx), ...(await desk.view({ models: chosen })) } };
      },
    },
    {
      method: 'POST', path: '/api/intents/suggest',
      handler: async (ctx, { payload }) => {
        const desk = deskFor(ctx);
        if (!desk || !enabled(ctx)) return { status: 200, body: { suggestion: null } };
        const text = String(payload?.text ?? '').slice(0, 20000);
        const suggestion = await desk.suggest({
          text,
          agent: String(payload?.agent ?? ''),
          model: nameOrNull(payload?.model),
          effort: nameOrNull(payload?.effort),
          defaultEffort: nameOrNull(payload?.defaultEffort),
          references: count(payload?.references),
          attachments: count(payload?.attachments),
        });
        return { status: 200, body: { suggestion } };
      },
    },
    {
      method: 'POST', path: '/api/intents/calibrate',
      handler: async (ctx, { payload }) => {
        const desk = deskFor(ctx);
        if (!desk) return { status: 503, body: { error: t('Intenciones is not available in this room.') } };
        if (!enabled(ctx)) return { status: 409, body: { error: t('Turn Intenciones on first.') } };
        const result = await desk.start({
          kind: payload?.kind === 'full' ? 'full' : 'quick',
          agent: String(payload?.agent ?? ''),
          model: nameOrNull(payload?.model),
          reference: nameOrNull(payload?.reference),
          effort: nameOrNull(payload?.effort),
          intent: nameOrNull(payload?.intent),
        });
        return { status: result.error ? 409 : 202, body: result };
      },
    },
    {
      method: 'POST', path: '/api/intents/answer',
      handler: async (ctx, { payload }) => {
        const result = deskFor(ctx)?.answer(String(payload?.choice ?? '')) ?? { error: t('Intenciones is not available in this room.') };
        return { status: result.error ? 409 : 200, body: result };
      },
    },
    { method: 'POST', path: '/api/intents/stop', handler: async (ctx) => ({ status: 200, body: (await deskFor(ctx)?.stop()) ?? { stopping: false } }) },
    {
      method: 'POST', path: '/api/intents/offer',
      handler: async (ctx, { payload }) => {
        const desk = deskFor(ctx);
        if (!desk || !enabled(ctx)) return { status: 200, body: {} };
        return { status: 200, body: { offers: await desk.offered({ accepted: payload?.accepted === true }) } };
      },
    },
  ],
});
