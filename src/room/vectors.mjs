// Vectors are filled shortly after indexing, one batch at a time, never on a
// turn's critical path. A backlog drains batch by batch; a failing embedder
// pauses and tries again later. The room does not depend on vectors.

export class VectorWorker {
  #memory;
  #timer = null;
  #running = null;
  #warned = false;
  #stopped = () => false;

  constructor({ memory, stopped = () => false } = {}) {
    this.#memory = memory;
    this.#stopped = stopped;
  }
  get inflight() { return this.#running; }

  schedule(delayMs = 800) {
    if (this.#stopped() || !this.#memory?.embedder || this.#timer || this.#running) return;
    this.#timer = setTimeout(() => { this.#timer = null; void this.runNow(); }, delayMs);
    this.#timer.unref?.();
  }

  async runNow() {
    if (!this.#memory?.embedder) return 0;
    if (this.#running) return this.#running;
    // The next batch is asked for once this one is done (2026-10-12, LOG-07): asked from inside it,
    // `schedule` found the batch still running and did nothing, so a backlog stopped at 100 and a
    // failing embedder was never tried again.
    let next = null;
    this.#running = (async () => {
      try {
        const stored = await this.#memory.embedPending({ limit: 100 });
        const left = this.#memory.pendingVectors({ limit: 1 });
        if (stored > 0 && (left.entries.length || left.memories.length)) next = 1500;
        this.#warned = false;
        return stored;
      } catch (error) {
        if (!this.#warned) { console.error(`MADRE memory embeddings paused: ${error.message}`); this.#warned = true; }
        next = 60_000;
        return 0;
      } finally {
        this.#running = null;
        if (next !== null) this.schedule(next);
      }
    })();
    return this.#running;
  }

  stop() {
    clearTimeout(this.#timer);
    this.#timer = null;
  }
}
