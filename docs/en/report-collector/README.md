# MADRE report collector

A Cloudflare Worker that receives the reports from MADRE's sentinel and turns them into GitHub issues. No database: one issue per fingerprint, and a comment when the same fingerprint comes back. The `docs/report-collector/` folder already includes `wrangler.toml`, so you deploy from there.

## Deployment

1. GitHub token: at https://github.com/settings/personal-access-tokens/new create a *fine-grained* token with access only to the `jossuealcacao-exe/madre` repository and the **Issues: Read and write** permission. Copy it.

2. From that folder:

```
cd docs/report-collector
npx wrangler login                 # opens the browser; create a Cloudflare account if you don't have one (free plan)
npx wrangler secret put GITHUB_TOKEN   # paste the token
npx wrangler secret put GITHUB_REPO    # jossuealcacao-exe/madre
npx wrangler deploy
```

`deploy` prints the worker URL, for example `https://madre-reports.<cuenta>.workers.dev`. The endpoint is that URL plus `/v1/reports`.

3. Test from the terminal:

```
curl -X POST https://madre-reports.<cuenta>.workers.dev/v1/reports \
  -H 'content-type: application/json' \
  -d '{"kind":"unknown","fingerprint":"abcdef123456","agent":"codex","error":"prueba del colector","madre":"0.2.0","node":"v22","platform":"test","agents":[],"at":"2026-09-18T00:00:00Z","count":1}'
```

It should answer `{"ok":true,"issue":N,"action":"created"}` and an issue with the `sentinel` label should appear in the repo. Delete it afterwards.

## Connect MADRE

On the machine that reports, either of the two:

```
PULSE_REPORT_URL=https://madre-reports.<cuenta>.workers.dev/v1/reports madre start
```

or in `~/.pulse/config.json`:

```
{ "telemetry": { "reportUrl": "https://madre-reports.<cuenta>.workers.dev/v1/reports", "autoReport": true } }
```

With the URL set, MU/TH/UR shows `SEND` on each report and the `AUTO-REPORT` switch. For MADRE users to report without configuring anything, set the URL as the default value of `reportUrl` in `src/server.mjs` before publishing 0.2.1; the switch will stay off until each user turns it on.

## Free plan limits

100,000 requests per day, more than enough. The worker rejects bodies over 32 KB and anything that doesn't have the shape of a sentinel report.
