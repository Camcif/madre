# MADRE · INTEGRATIONS · bringing a service into the project

The single document for this work. Everything decided, built, or discarded about
integrations —what brings data in from outside and what sends something out— is written down here and
nowhere else.

| | |
|---|---|
| Status | **Phase 2 complete** · the door, the vault, the ladder, and the first integration: CORREO sends. No open decisions |
| Target version | `0.7.0` |
| Origin | Code reading on 2026-10-02 over `main` @ `b021e35` |
| Measured | CORREO weighs 418 lines of code (122 SMTP + 189 server + 107 module) and 278 of tests. Zero dependencies |
| Before writing one | **§6**: what a module can reach and whose wall it is. Answers "can it connect to X?" without writing a line |
| Rule in force | An integration **declares where it reaches** or its traffic shows up in the log as an undeclared address |

---

## 1 · What an integration is and what it isn't

An integration is a **module** that hands each turn an MCP tool that talks to
an outside service. It isn't a new category: it's what IMAGES (Gemini's
image models) and the memory server (the project's archive) already do.

**In scope:** that a module can declare where it reaches; where the key it
needs lives; and what ceremony is required when an integration **sends** something instead of just
reading.

**Out of scope:** any MADRE cloud. An integration talks from *this* machine to
a service of the *user's*, with the user's credentials. There is no intermediary.

---

## 2 · What is already ready

- **The SDK's entire scaffolding.** A module is a file that imports nothing: module page,
  switch, declared settings, `/` commands, routes under `/api/x/<id>/`, conditions
  for Diagnostics. It is installed by dragging it into MODULES.
- **`toolsForTurn(ctx, turn)`**, which is the hook: it returns MCP server descriptors
  and all four agents have that tool in their turn.
- **Two integrations working as a template**, with their real measured size:
  `src/mcp/memory-server.mjs` (221 lines) and `src/mcp/image-server.mjs` (202).
- **The SDK's fences:** a module cannot use routes outside `/api/x/<id>/`, nor record
  `message.*` or `agent.*` events, nor receive anyone's credentials. A failure of its own doesn't
  stop the project.
- **CN-001 · Destination declaration** (this batch). See §3.

---

## 3 · Traceability

### CN-001 · A module declares where it reaches — **done**

`src/outbound.mjs` isn't a log, it's a contract: every address the process can
reach is written in the code with four answers —what travels, when, where to, and
where it's turned off— and it patches global `fetch` so that no module can get around the log.

An integration broke that without meaning to: its traffic showed up as "went to an address nothing
here declares", which is true and useless — the human couldn't tell an integration they
installed apart from something going wrong.

Now a module declares `reaches: [{ id, host, to, what, when, where }]`, in the same
shape and answering the same questions. And:

- **It is stored separately from the core's and marked with `module`.** Who promised what is
  part of the promise: MADRE answers for its own list and only *reports* a module's.
- **It is rebuilt on every module load**, never accumulated: uninstalling an integration
  takes its destination with it.

### CN-002 · Where the key lives — **done**

There is a real tension here with a written promise. Today `src/credentials.mjs` writes a
key **only where that CLI looks for it** (`~/.gemini/.env`, OpenCode's `auth.json`), with
`0600`, and the module page says "MADRE keeps no copy". For an integration **there is no CLI**: the
MADRE module needs the token itself.

In other words: an integration forces a decision on whether **MADRE starts storing secrets**. That's D-001 and it isn't
taken lightly.

### CN-003 · Sending is not reading — **done**

An integration that reads is reversible: in the worst case it brought in something that wasn't useful. An integration
that **sends** —an email, a message, a record in a system— is not. And what goes out
carries the user's name.

MADRE already had the ladder: in `#4` FULL ACCESS the rule is *"before anything goes out, say it in
one line: exactly what goes out and where, and then do it"*. An integration that sends lives there.

The core enforces it in `toolsForTurn`, not each module: a tool declared in `sends`
is withdrawn from the list below `#4`, and the `brief` says why it comes short. A module
cannot widen its own permission by forgetting to declare.

### CN-005 · The first integration: CORREO sends email — **done**

A module (`src/modules/correo.mjs`), an MCP server (`src/mcp/smtp-server.mjs`), and a 122-line SMTP
client over `node:tls` (`src/smtp.mjs`). No dependencies. Gmail with an app
password, port 465, TLS from the first byte — never STARTTLS over a cleartext port,
because then the session starts uncovered.

What makes this an integration and not a script that sends emails:

- **The key lives in the vault.** `ctx.vault` is this module's corner in `src/vault.mjs`, with
  the id sealed by construction in the SDK: asking for another module's secret is not something a
  module can *express*. The password only leaves there for the environment of the process started
  for a turn; never for the prompt, the result, the ledger, or the outgoing-traffic log.
- **The destination is declared.** `reaches` puts `smtp.gmail.com` in the log as something
  this module signed for. And if the human points CORREO at another provider, it is declared again under the
  same id, so the log stops answering for a server that is no longer used.
- **Sending belongs to the `#4` rung.** `sends: ['send_email']` and the core withdraws it below
  FULL ACCESS. Not "it doesn't work": the model isn't even told it exists.
- **An allowlist**, optional, in the server and not in the prompt — a prompt is a
  suggestion. Empty means anyone, on purpose: narrowing it is something the human
  turns on, not a silence by omission.

What is rejected before opening the socket: an address with a line break (that's how a
message acquires recipients nobody wrote), an empty subject, an empty body. And a line
of the body that starts with a period is doubled, which is the protocol's own escape: forgetting it is
how a message cuts itself off halfway.

**A hole that showed up while doing it:** `defineModule` never carried `reaches` to the
module object, so `declareDestinations` in `modules/index.mjs` —written in CN-001— never received
anything. CN-001 had been half-done ever since it was marked as done. Fixed, and now the
`outbound` test demands from each module the same four answers it demands from MADRE.

**What it does NOT do, said here so it isn't discovered by using it:** attachments, HTML, CC/BCC, queues,
retries. A plain-text message, or nothing.

### CN-004 · What the integration brings in, travels

An email integration puts emails into the prompt, and that prompt goes to OpenAI, Anthropic, or
Google depending on the agent. It isn't a design flaw: it's its consequence, and it has to be said
on the integration's module page, not in the fine print.

`PRIVACY` (terms that never appear) and `#0 INCOGNITO` (what isn't remembered) are still
the ways out. `@madre`, with Ollama, doesn't leave the machine.

---

## 4 · Open decisions

**D-001 · Does MADRE store secrets?** (CN-002) — **CLOSED 2026-10-02: (a), its own vault.**
Done in `src/vault.mjs`. The reasoning: the user is still local, so a
vault on their machine doesn't move the secret anywhere new — it just puts it where it's
needed, because an integration has no CLI to hand it to. The terms are written in
the file's header and tested: `0600` inside `0700`, only from `127.0.0.1`, the
ledger notes that one was saved and with what name but never the value, and `summary()` —the
only thing that leaves there for the rest of MADRE— carries name and length, never the secret.

**D-002 · What ceremony does an integration that sends require?** (CN-003) — **CLOSED 2026-10-02: `#4`.**
Sending lives in FULL ACCESS and on no rung below it. The core enforces it, not the module's good
will: an integration declares which of its tools send (`sends`) and
`toolsForTurn` withdraws them from the list below `#4`, so the model isn't even
told that a tool it can't use exists. A server whose tools
*all* send doesn't travel at all. And a module that doesn't declare widens nothing by omission:
what isn't declared isn't withdrawn — but it can't be used to send without the
human being in `#4` either, because that's where the FULL ACCESS rule already requires saying in one
line what goes out and where.

**D-003 · What is the first integration, and by which path?** — **CLOSED 2026-10-02: email, SMTP,
sending first.** Done in `src/smtp.mjs`, `src/mcp/smtp-server.mjs`, and `src/modules/correo.mjs`.
The *reading* half is still open and is now **D-004**.

**D-004 · How does CORREO read email?** — **CLOSED 2026-10-02: it isn't done, and the reason matters
more than the decision.** `gmail.readonly` is a **restricted** scope: annual CASA security
assessment (~540–1.000 USD via the self-service route, a 6-to-12-week cycle) and, unverified, the app
stays at ~100 test users behind a screen saying Google hasn't reviewed it.
For something installed from npm that runs on each person's machine, that means each
user would have to register their own project in Google Cloud: the entire sign-up, repeated per
person. The other path —IMAP with the password that's already in the vault— doesn't have that wall but
pays for MIME, and above all opens a surface that didn't exist when sending: **the body of an email is
text the human didn't write, and it would go into an agent's prompt.** Sending already solves the case
that was asked for. Reading waits until there is a reason, not a possibility.

What it did leave: the map in §6, which is what was really needed to know.

---

## 5 · The first integration: email

Request: receive and send email, by the easiest path. Three paths, and "easy" doesn't
mean the same thing in all three.

| path | sign-up | read | send | dependencies |
|---|---|---|---|---|
| **IMAP/SMTP with an app password** | minutes, in the Google account | IMAP by hand: stateful protocol, literals, MIME. **A lot** | SMTP over TLS: `EHLO`, `AUTH LOGIN`, `DATA`. **~150 lines** | none |
| **Gmail API (OAuth 2.0)** | Google Cloud project, consent screen, scopes | HTTPS and JSON. Easy | HTTPS and JSON. Easy | none, but OAuth has to be implemented |
| **Third-party MCP server via `npx`** | depends on the package | done | done | a package we didn't write, with access to your email |

**The honest take on each one:**

- **Outlook / Microsoft 365 is not easier.** Exchange Online basic authentication
  has been being retired for years, and app passwords are disabled in most
  organization accounts. The real path there is Azure AD + Graph, which is as much
  OAuth as Gmail and with more paperwork. **Gmail is the easy one.**
- **The app password is the cheapest sign-up** and avoids OAuth entirely, but it leaves
  *reading* as the expensive half: IMAP and MIME are a swamp, and doing it badly shows.
- **The third-party package** is the least work and the most risk: you give access to your email
  to code nobody here has read. If it is chosen, it is chosen knowingly and with the package
  pinned to a version.

**The recommendation was, in phases, and that's how it was done:**

1. ~~**Send first, over SMTP with an app password.**~~ **Done** (CN-005). The
   estimate was "~150 lines without dependencies"; it came out as 122 of SMTP client plus 189 of
   MCP server plus 107 of module, without dependencies. The immediate value ("MADRE, send this
   to X") and the case that really matters: what goes out doesn't come back.
2. **Read later.** Still pending and now **D-004**. D-001 is already resolved, so
   the "by then the vault will be there" came true: what remains is choosing between the
   IMAP swamp and the OAuth paperwork, with a clean slate.

---

## 6 · What a module can reach, and whose wall it is

Running into Gmail was useful for something: it showed where the real limit is. **It isn't MADRE's.**

### The SDK is not the limit

All of CORREO is 418 lines and nothing had to be invented: the scaffolding was already there. A module
can start a process, speak any protocol over TCP or TLS, store its own key,
declare where it reaches, serve its own routes, bring `/` commands, and draw its own floor on the module page.
**Whatever a Node process can do on this computer, a module can do.**

### The limit is how each service lets a human hand over their own key

That's the only question that decides whether an integration is possible, and it is answered in three tiers.

#### Tier A · You paste a key and it works

The service gives the human a static credential in minutes —personal token, API key,
app password—, revocable on its own, without registering any app and without anyone reviewing
anything. **An integration here works the day it's written, for anyone who installs MADRE.**
It's CORREO's tier and it's where almost everything useful lives:

| | with which key |
|---|---|
| GitHub, GitLab | personal token (GitHub has a fine-grained one, per repository) |
| Linear, Todoist, Airtable, Trello | the account's API key or personal token |
| Notion | *internal integration*: static token, a single workspace, no security review; pages are shared with it one by one |
| Jira, Confluence | Atlassian API token, with the account's email |
| Slack, Discord, Telegram | your own app or bot in your own space (Telegram's BotFather gives you one in a minute) |
| Cloudflare, Stripe, Shopify | scoped API token; Stripe allows a read-only one, Shopify a *custom app* in your own store |
| Odoo | the user's API key, in the JSON-2 API. **XML-RPC is discontinued in 19.1**: a new integration shouldn't be born there |
| Email | app password, SMTP and IMAP — already done for sending |
| Any database | Postgres, MySQL, Redis, SQLite: the connection string *is* the credential |
| Any API with `Authorization: Bearer` | if the human can copy the token, the integration is possible |

#### Tier B · The user registers their own app

OAuth 2.0 where the permissions are **not** restricted and the service doesn't require review for personal
use. It's possible, but signing up stops being "paste this key" and becomes "create an
app, copy two values, authorize in the browser". And there's a cost on this side:
**MADRE has never written an OAuth flow.** `auth-probe.mjs` and `quota-sources.mjs` *read* tokens
that other CLIs already obtained; starting a local redirect, exchanging a code, and refreshing it are
pieces that would have to be written from scratch and maintained.

Here fall: Google Calendar, Drive, and Sheets (*sensitive* permissions, with a verification exception
for personal use); Microsoft Graph (registration in Azure AD); Mercado Libre (app in its DevCenter,
with validation of the account holder's data in Mexico, Argentina, Brazil, and Chile); Zoom; Spotify.

#### Tier C · Wall

Where the service requires review, a security assessment, or a verified publisher for its access
to work outside of testing — or where the terms don't allow a third-party local client.

Gmail for reading (`gmail.readonly`, restricted, annual CASA, ~100 test users when
unverified). Meta: WhatsApp Business, Instagram, Facebook, all behind app review. Banking,
which goes through aggregators. Anything that asks for a "verified publisher".

**What the wall means in practice, said without drama:** it isn't "impossible". It's "impossible
as something that works on install". Each user would have to be their own developer, and a
product that asks for that doesn't have an integration: it has homework.

### What a module can't do, even if the service lets it

These fences are MADRE's and no provider moves them:

- Routes only under `/api/x/<id>/`. Never on top of a MADRE route, never with another's id.
- It doesn't write `message.*` or `agent.*` events: the account of what happened in the project isn't edited
  from outside.
- It doesn't read another module's secret. The id is sealed inside the SDK: it isn't that it's forbidden, it's
  that it can't be written.
- It doesn't widen its own permission. What it sends is withdrawn below `#4` by the core.
- If it falls, it falls alone. A failure of its own doesn't stop a turn or the project.
- It runs with the permissions of whoever opened MADRE. That isn't a fence: it's the reason installing
  someone else's module is a decision and not a click.

### The rule for deciding whether it's worth it

An integration is worth it when all three are true:

1. **The human gets the credential in less than five minutes and without being a developer.**
2. **The credential can be revoked on its own**, without touching the account password or anything else.
3. **What it brings in or sends out fits in one line** on the module page — because if it doesn't fit, it doesn't fit
   in the head of whoever turns it on either.

And a warning that applies to all of tier A just as much as to C: **what an integration brings in
travels** (CN-004). A reader of anything puts someone else's text into the prompt, and that prompt goes to the agent's
model. It's a consequence of the design, not a flaw, and it is said on the integration's module page — not in the
fine print.

---

## 7 · Who knows about it

`AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` will point to this document when phase 2 starts.
They don't copy it.

---

## 8 · Log

| date | what |
|---|---|
| 2026-10-14 | **Connect MCP** (`src/modules/mcp-connect.mjs`, `src/mcp/connect.mjs`, `src/mcp/proxy.mjs`): MCP servers the person adds to a project from their Settings, by command or by address (token or OAuth with dynamic registration and PKCE). It inherits the three pieces from 2026-10-02: secrets in the vault (`mcp` module), tools that act under the `sends` rule when they're chosen for `#4`, and the sign-in destination declaration, which the module makes on the spot because the person chooses the host. What's new is the intermediary: the four CLIs start the same process, which reads the secrets, filters `tools/list`, and rejects calls outside the list, so no secret is left in an argv. A server is checked (handshake + `tools/list`) before it enters a turn. |
| 2026-10-02 | **SDK closed and communicated.** The contract is 36 fields, all documented, with a test that compares the guide against the code in both directions. An integration example that works as is, and the question "can it be done with X?" answered inside the guide. In the project: the development card says what a module is and leaves a button to the text box; `/modules` finds `/module` and offers four instructions for editing. In the README, the statement in plain language — and the promise "doesn't store your credentials" corrected, since it stopped being accurate the day the vault came into being. |
| 2026-10-02 | **D-004 closed: reading isn't done yet**, and the wall got mapped in §6. Gmail for reading is a restricted scope with an annual CASA assessment and a cap of ~100 unverified users, so there's no integration that works on install: each user would have to be asked for their own Google Cloud project. Out of that came what was really needed: a module's limit isn't the SDK, it's how each service lets a human hand over their own key. Three tiers, with the catalog of what falls into each. |
| 2026-10-02 | **D-003 closed and phase 2 complete: CORREO sends.** SMTP+TLS without dependencies (418 lines, 278 of tests). With it, three new core pieces that any future integration inherits: `ctx.vault` scoped to the module by construction, declared `secrets` that MADRE draws on its own, and `reaches` validated in `defineModule`. Found and fixed along the way: `reaches` never reached the module object, so CN-001 had gone without declaring anything since its commit. 386/386 tests. |
| 2026-10-02 | **D-001 closed: its own vault** (`src/vault.mjs`) and **D-002 closed: sending only in `#4`**, enforced by the core. With this, phase 1 is complete: declaring the destination, storing the key, and the sending ladder. |
| 2026-10-02 | Document opened. **CN-001 done**: a module declares its destinations (`reaches`), they are stored separately from the core's and marked, and they are rebuilt on every load. D-001 (where the key lives), D-002 (ceremony for sending), and D-003 (the first integration) open. Measured: the two integrations that already exist weigh 202 and 221 lines. |
