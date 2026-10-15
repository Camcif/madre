# MADRE under the hood

What the README does not need to tell you to use the room, but anyone who wants to understand it, run it under unusual conditions or write a module does. Every claim here corresponds to code in `src/` and has a test in `test/`.

## The ledger

Each project has a stable room under `PULSE_HOME` (by default `~/.pulse/rooms/<sala>/`). Its source of truth is `events.jsonl`: one event per line, increasing sequence, append-only for the room. MADRE rebuilds the conversation window from there even if it restarts or is opened from another IDE.

Writes are serialized across local processes with an on-disk lock, so two IDEs on the same room never produce repeated sequences. The only operation that rewrites the ledger is the privacy purge, under the same lock, atomic (temporary file and rename), preserving sequences.

When the replying agent changes, the room records `handoff.created` with origin, destination and the range of sequences handed over. The transcript remains the durable source; the project is not touched.

An agent's errors are stored, bounded, in `message.failed`: one line of up to 500 characters, without stack traces, and with private terms replaced.

## The stream

`/api/events` is fed from the ledger, not from the process's memory: events that another MADRE process adds to the same room reach the open pages. Polling reads only the new bytes every 500 ms (`PULSE_BROADCAST_INTERVAL_MS`); a file that shrinks, after a purge, resets the offset. Each frame carries `id: <secuencia>`, so a client that reconnects asks from where it left off. A client that stops consuming is disconnected once it accumulates 1 MiB undrained (`PULSE_SSE_MAX_BUFFERED_BYTES`). GHOST events have no sequence: they reach the open pages and never the ledger.

The context window an agent receives is 16,000 characters (`PULSE_CONTEXT_MAX_CHARS`); older messages are omitted before recent ones. A message of more than 20,000 characters (`PULSE_MAX_MESSAGE_CHARS`) is recorded and rejected without invoking the agent.

## The memory

`memory.sqlite` lives next to the ledger and is derived from it: if it is missing or its schema changed, it is rebuilt from `events.jsonl`. It contains:

- `entries` with trigram FTS5: every message, failure and command card outside GHOST, with its sequence. MADRE's canned replies (`synthetic`) are not included.
- `memories` with FTS5: the distilled notes, typed (`decision`, `fact`, `preference`, `question`), with the sequences that support them, who wrote them and their origin (`distilled` or `noted`).
- `entry_vectors` and `memory_vectors`: 768-dimension embeddings, computed in the background and never on a turn's critical path.

**Conversations.** A project has one memory and many conversations. The archive, the crew, the modules and the privacy list belong to the project; a conversation is only the record of one line of work. The first one is the `events.jsonl` that was always there —no file is moved to add this—, the others live in `<sala>/chats/<id>/events.jsonl`, and `<sala>/chats.json` keeps their names and which one is open. Numbering belongs to the project, not to the conversation: opening one starts from the highest sequence any other one reached, so `#1411` means an exchange of this project and the memory index, the citations and NOSTROMO still hold. There are gaps in a ledger and that is fine: sequences are an order, not a count.

Only one conversation at a time drives the crew —two threads editing the same working tree is not a feature, it is a way to lose work—, so opening another one is refused while a turn is running. And one room per project: `<sala>/open.json` holds the pid and port of the server that has it, and another start on the same project is refused with the address of the open room. Without that, two servers writing different conversations of the same project would hand out the same sequence twice and the archive would silently keep only one of them.

**Recall.** When the transcript exceeds the window, each turn also receives, within the same budget (`PULSE_RECALL_SHARE`, 30% by default), the earlier notes and exchanges that match the request. The lexical search weights each term by its rarity in the room: a path or a name weighs more than a common word. With vectors, it is fused with cosine similarity.

**Cascade activation.** Each memory that enters a turn leaves a row with the batch it shared, so the room knows which notes arrive together. From that comes an association —Jaccard over the turns where each one was found by the search itself— and recall keeps two slots for it: when it brings a note, it also brings the one that accompanies it, even if they do not share a single word. Only the turns where the search found them on their own merit vote, never the ones the cascade created, or the network would close in on itself within a few days. The strength is a ratio: a pair that stops co-occurring fades on its own. Threshold 0.34, at least two co-occurrences, and the search never loses a slot to the association. `PULSE_RECALL_CASCADE=0` or the switch in MU/TH/UR turn it off.

**Cold zones.** A memory is cold when three things hold at once: no turn has ever carried it, it shares no topic with any other —so it cannot be reached sideways either— and the archive has been opened at least twelve times since it was written. The third is the one that matters: never-recalled is what every note is on the day it is born; cold is the opportunity that passed it by. Opportunities are counted in turns that actually went into the archive, and only from the day the room started keeping track. NOSTROMO counts them in its header and surrounds them with a faint ring when asked to.

**What to ask.** The room writes the questions whose answer it is missing, always with the words it already has and never inventing a topic nobody raised. Three wells: the questions the archivist recorded as open and nobody answered, the cold memories —asking is the honest alternative to throwing away something that never had its chance— and the kind of note the archive is short on (decisions, preferences, facts; not questions, because an archive short on questions is not fixed by asking for more). They are taken in turns so that a full well is not the whole list, and two ways of asking the same thing count as one. Nothing is sent: the question goes to the composer and the human decides who answers.

**The verdict.** `GET /api/maturity` gathers the six readings, the three tests, the cold zones and the pending questions, and returns a sentence and an instruction. The order is not decided by the score: first what is false (open contradictions), then what the archive cannot answer —and there it points to the questions the room already wrote—, then the weakest reading quoting its own advice, and finally the test nobody has run. Consistency is computed on read; coverage refreshes itself once a day, in the background and only with local embeddings.

**The three tests.** The maturity reading tells what the archive is made of; it does not say whether it works. A test says that, and a test is only worth something if it can fail. `COVERAGE` takes real questions from the history, runs recall at the exact point where each one was asked and compares it with the answer that was actually given. `CONSISTENCY` looks at the contradictions EYECAT still holds, what was taken out of circulation and whether aberrations are being archived more often lately or less. `MATCH` asks the local model again questions that a frontier CLI answered and compares. None of them spends a provider turn; the third runs in the background and can be stopped.

All three are measured **against a control**: inside a room everything talks about the same topics, so to an embedder any pair of texts seems close —the first COVERAGE run scored thirty out of thirty—. To count, what the archive delivered has to beat what it would have delivered for another question, by a margin. Each result says how many cases it had, what it measured with (meaning or words), the bar and the mean against the control.

**Distillation.** Every `PULSE_DISTILL_EVERY` undistilled exchanges, or after `PULSE_DISTILL_IDLE_MS` idle, the archivist reads a batch bounded by `PULSE_DISTILL_MAX_CHARS`, from most recent backward, and writes up to five notes. The archivist is the cheapest allowed one in the order Ollama, Gemini, OpenCode, Codex, Claude; the one that fails sits on the bench for thirty minutes and the next one steps in. A single call per batch, never during a turn. For local models, strict JSON is requested.

**Embeddings.** `PULSE_EMBED_PROVIDER=auto` uses Ollama if it is running with an embeddings model (`nomic-embed-text`), otherwise the Gemini key (`gemini-embedding-001`, the same key the Gemini CLI uses, including the one in the macOS keychain). Batches of up to 100 texts per call. `PULSE_EMBED=0` leaves recall lexical.

**MCP tools.** Each turn attaches to the CLI the `pulse-memory` server with per-run isolated configuration: `memory_search`, `memory_recall`, `memory_notes`, `memory_timeline`, `project_state` and `memory_note`. `memory_note` is signed with the agent and the turn's message, is rejected in GHOST and its notes are marked `noted`.

**NOSTROMO and CODE000.** The server requires the project's designation on `GET /api/memory` and `DELETE /api/memory/:id`. Eight taps on the heart within thirty seconds seal the archive for ten minutes (both routes return 423), eject the console and fire a message encrypted with AES-256-GCM under the room's seal (`<proyecto>/.pulse/mother.env`) that all online agents receive decoded as requester `mother`. If the seal changes or disappears, the room detects it and warns.

**Privacy.** The terms in `config.json` are replaced at four points: the agent's reply before recording it, the index on insert, the notes when saving them and the dataset when exporting it. The purge rewrites ledger, index and notes preserving sequences and the distilled mark. The server rereads the terms before each human message, because `config.json` is shared by all the rooms on the machine.

## The limits sentinel

Each sphere in the bar carries a ring. It shows the provider's real limit when the CLI publishes it, otherwise the local window.

- **Codex** writes in each session rollout (`~/.codex/sessions`) its account windows, 5-hour and weekly, with percentage used and reset time. MADRE reads the most recent one; there is no network involved.
- **Claude Code** publishes `/usage` on Anthropic's OAuth endpoint. With `PULSE_CLAUDE_USAGE=1`, MADRE queries it with the token Claude Code stores in the keychain or in `~/.claude/.credentials.json`; the token only travels to `api.anthropic.com`, as the CLI itself does. It is optional because it involves reading a credential. `PULSE_OFFICIAL_QUOTA=0` disables all provider reads.
- **Gemini and OpenCode** do not publish anything locally: their ring is the local window.

The local window is a soft budget per agent (500,000 tokens) over a rolling 5-hour window; turns drop out of the count as they age, cache reads weigh one tenth and `@madre`'s tokens weigh zero. It warns at 80, 90 and 100% and suggests other agents. A window whose reset time has already passed counts as empty; the monitor rereads the sources every minute and announces `limit.cleared` when a full window goes back to normal.

A quota reader implements `{ id, agent, read() }` and `read()` returns `null` or `{ usedPercent, resetAt, windows?, stale? }`. MADRE never infers the provider's quota from local tokens.

## The adapters

Each agent runs as a process in its own group, with an isolated home that receives only its existing credentials. If it does not respond before the timeout (180 s by default), MADRE terminates the whole tree: SIGTERM and, after a grace period, SIGKILL.

- **Codex**: read-only query; `-C <carpeta> --sandbox workspace-write` in CREATE; in CONTROL, a write sandbox over the project. It generates images with `image_generation` using its ChatGPT account.
- **Claude Code**: local read tools, non-persistent sessions, MCP limited to MADRE's servers. In CREATE, `--allowedTools Write(//<carpeta>/**),Edit(//<carpeta>/**)` under `dontAsk`: the double slash is the absolute form; with a single one, Claude reads the path as relative to the project and denies every write. In CONTROL, writing allowed in the project and denied in the forbidden zones.
- **Gemini CLI**: Plan Mode and an ephemeral read-only policy, extended in CREATE with `allow` rules for `write_file` and `edit` whose `file_path` starts with the folder. It runs with a temporary `GEMINI_CLI_HOME`: OAuth tokens and `~/.gemini/.env` yes; hooks, extensions, MCP servers and memory from the real `~/.gemini` no. Gemini reads `@algo` as a file to include, so MADRE escapes each mention as `\@nombre` and unescapes it in the reply. Under 503 or 429, the CLI retries with backoff for minutes and only writes to stderr: MADRE reads it live, cuts off after `PULSE_GEMINI_IDLE_MS`, retries once with `PULSE_GEMINI_FALLBACK_MODEL` and, if that fails too, says so with the name and the model tried.
- **OpenCode**: ephemeral permissions injected per run, without touching the global configuration; per-pattern `permission.edit` in CREATE and CONTROL. If your configuration does not set a model, `run` picks the default provider, which may not be the one with a session: `PULSE_OPENCODE_MODEL=proveedor/modelo` sets it.
- **@madre**: it is not a CLI. It is a local adapter on top of Ollama that receives the recent transcript, what the memory recalls about the question and the question; never the CLIs' briefing. With an 8,192-token window, because the default 4,096 one truncates the system prompt. What it can resolve without a model, it resolves: identity, orders that are not its to take, requests to save memory and the round table, which is a plan written by the room with one step per online CLI and its wrap-up turn.

The image scopes of Claude, Gemini and OpenCode are fulfilled with **Image Studio**: the MCP server `src/mcp/image-server.mjs`, attached only inside a lease with the scope turned on, which generates with the Gemini images API and saves the file in the turn's folder.

## CREATE under the hood

A turn in `#2` takes the same snapshot as CONTROL, without a seat: several `#2` turns can run at once. When it ends, `diff` against the snapshot: added files are kept and recorded as `artifacts.created` with their path in the project; modified, renamed or deleted ones are restored from the snapshot and announced in `create.reverted`. Forbidden zones are restored the same way as in CONTROL. Each CLI receives its write tools over the project: Claude Code denies `Write` if `Edit` is not allowed on the same path and OpenCode leaves no write tool if `edit` is denied (both verified with the real CLI), so in `#2` they go together and the "add only" guarantee is the restore afterward, not the rule beforehand. Gemini receives only `write_file`. The `scratchDir` under `.pulse/out/` still exists for what has no place and for Image Studio.

In a plan, each step's mode is the minimum of what the orchestrator asked for (`@agente #n:`; without a number, `#1`, or `#2` if there is a lease), the plan's ceiling (the mode of the human message) and the agent's `MAX MODE`. `#4` never reaches a delegate through the ceiling: only with that agent's key. Under a `#3` ceiling, a `#2` step receives a project lease issued in the orchestrator's name and a `#3` step takes CONTROL with its own checkpoint, one at a time. Under a `#1` ceiling, a `#2` step goes through escalation to the human. A `#3` or `#4` step that exceeds the ceiling asks the human for the key for that agent; granting it for the plan does not raise the others' ceiling.

## CONTROL under the hood

Before the turn, MADRE snapshots the project as a real commit under `refs/madre/checkpoints/` with a temporary index (in a project without git, in a shadow repository under the system's temporary directory, with the project as the working tree): it includes untracked files, respects `.gitignore`, does not touch your branch, your index or your stash, and works in repositories with no commits. While the turn lasts, `.env*`, `.pulse/`, `.madre/` and `.claude/settings.local.json` are read-only at the file-system level and get their permissions back when it ends. Afterwards, `git diff` against the checkpoint gives the list of changes; any write into a forbidden zone that got through is reverted from the checkpoint and named. `UNDO` restores the full checkpoint.

## Commands that come back and the copilot

A ```pulse-run stores the mode of the turn that asked for it. When every line that can run has an answer —it finished, or it opened a port and is serving—, `src/room/returns.mjs` builds what the agent reads: why it asked, what it was answering, the end of what it had said and each line's output (head and tail, about 10,000 characters across all of them), and the room opens a human turn marked `auto: 'runs'` with that block, at the mode of the original turn and never above `#3` (`#2` if a line was pressed from the phone). If the agent is still answering or a plan is running, it waits until the room is free; `STOP ALL` holds it until the human hands it back from its card. A request is handed back once. In the shared window, a command's output weighs at most ~1,200 characters: five long outputs no longer push the human's request out.

The copilot is a server window (`/api/copilot`), in memory like the passes: the `#3` key opens it for a time and `STOP ALL` or a restart close it. Each conversation checks it when accepting a message: one in `#3` marked `copilot` does not spend a pass and reaches any agent whose CLI writes. Its turn carries the `copilot` block (`src/room/copilot.mjs`); when it settles, what it deleted is restored from the restore point (`deletesReverted`). Its command requests run on their own when the turn releases the project, only the lines on the safe list, and the hand-back still belongs to the copilot while the window lasts. Eight solo rounds in a row and it stops with an alert.

## Operational recovery

If MADRE stops in the middle of a turn, on startup it detects the `agent.started` events with no close and records a recovered `message.failed` for each one. When closing with Ctrl+C or `SIGTERM`, it interrupts the agent processes in progress, records those turns as failed, delivers the pending events to the open pages and exits. Plans run in sequence and delegates do not delegate. The orchestrator reviews the replies and can open another stretch, up to three per request; `STOPALL` cuts off anything in progress.

## Packaging and tests

`npm test` runs the suite with `PULSE_OLLAMA=0` so as not to touch a real Ollama; no test calls a model. `npm run pack:check` packs, installs into an empty directory and runs the installed CLI: `--help`, `doctor` and a server start that serves the room and closes cleanly with `SIGTERM`. `PULSE_TEST_MODE=1` enables `/api/test/limits` to simulate quota windows.
