import test from 'node:test';
import assert from 'node:assert/strict';
import { listPrice, priceTokens, withListPrice, PRICES_CHECKED } from '../src/prices.mjs';

// src/prices.mjs: a turn the CLI did not price is priced at the list price of its model, as an
// estimate that says so; a model the table does not know gets nothing, never a lookalike's price.
test('prices · only what the table knows, counted the way each CLI counts', () => {
  assert.deepEqual(listPrice('openai/gpt-5.6-sol'), listPrice('gpt-5.6-sol'));
  assert.equal(listPrice('gpt-5.6-sol-fast'), null, 'a lookalike got a price');
  assert.equal(listPrice('gemini-3-pro-preview'), null);
  assert.equal(listPrice(null), null);

  // Codex (OpenAI usage): cached inside input, reasoning inside output.
  const codex = { inputTokens: 1_000_000, cachedInputTokens: 400_000, outputTokens: 100_000, reasoningTokens: 60_000, source: 'codex-json' };
  assert.equal(priceTokens('gpt-6-sol', codex, 'codex-json'), (600_000 * 2 + 400_000 * 0.2 + 100_000 * 10) / 1e6);
  // Gemini: cached inside the prompt, thinking apart and billed as output.
  const gemini = { inputTokens: 200_000, cachedInputTokens: 100_000, outputTokens: 10_000, reasoningTokens: 5_000 };
  assert.equal(priceTokens('gemini-2.5-flash', gemini, 'gemini-json'), (100_000 * 0.3 + 100_000 * 0.03 + 15_000 * 2.5) / 1e6);
  // OpenCode: cached apart from input, reasoning apart from output.
  const opencode = { inputTokens: 100_000, cachedInputTokens: 50_000, outputTokens: 1_000, reasoningTokens: 1_000 };
  assert.equal(priceTokens('openai/gpt-5.6-luna', opencode, 'opencode-json'), (100_000 * 0.2 + 50_000 * 0.02 + 2_000 * 1.2) / 1e6);
  assert.equal(priceTokens('gpt-6-sol', codex, 'claude-json'), null, 'a counting it does not know was priced');

  // A figure the CLI gave stays; zero (a subscription) is priced; an unknown model stays as it was.
  const reported = { ...codex, costUsd: 0.5 };
  assert.equal(withListPrice(reported, 'gpt-6-sol'), reported);
  const priced = withListPrice({ ...codex, costUsd: 0 }, 'gpt-6-sol');
  assert.equal(priced.costEstimated, true);
  assert.equal(priced.pricedModel, 'gpt-6-sol');
  assert.equal(priced.pricedAt, PRICES_CHECKED);
  assert.ok(priced.costUsd > 0);
  const unknown = { ...codex };
  assert.equal(withListPrice(unknown, 'gpt-9'), unknown);
  assert.equal(withListPrice({ ...codex, local: true }, 'gpt-6-sol').costEstimated, undefined, 'a local model was priced');
});
