import crypto from 'node:crypto';
import { Actor, log } from 'apify';
import { call, charge, each, nonEmpty } from './lib.js';

await Actor.init();
const input = (await Actor.getInput()) || {};
const wallets = nonEmpty(input.wallets), names = nonEmpty(input.names);
if (!wallets.length && !names.length) await Actor.fail('Add at least one wallet or name to watch.');
const slug = String(input.watchlistName || 'default').toLowerCase().replace(/[^a-z0-9-]+/g, '-').slice(0, 40) || 'default';
const store = await Actor.openKeyValueStore(`sanctions-watchlist-${slug}`);
const previous = (await store.getValue('STATE')) || {};
const state = {}, changes = [], current = [];
const id = (kind, v) => crypto.createHash('sha1').update(`${kind}:${String(v).toLowerCase()}`).digest('hex').slice(0, 16);
const RANK = { clear: 0, no_match: 0, potential_match: 1, strong_potential_match: 2, sanctioned: 2 };
let listAsOf = null, stop = false;

const record = async (kind, value, status, detail) => {
    const key = id(kind, value), before = previous[key]?.status;
    state[key] = { kind, value, status, checked_at: new Date().toISOString() };
    const item = { kind, value, status, previous_status: before ?? null, changed: before !== undefined && before !== status,
        new_on_watchlist: before === undefined, detail, list_as_of: listAsOf };
    if (item.changed) { item.direction = (RANK[status] ?? 0) > (RANK[before] ?? 0) ? 'escalated' : 'cleared'; changes.push(item); }
    if ((RANK[status] ?? 0) > 0) current.push(item);
    await Actor.pushData(item);
};

stop = await each(wallets, 4, async (address) => {
    const r = await call('/v1/sanctions/wallet', { address });
    if (!r.ok) { await Actor.pushData({ kind: 'wallet', value: address, error: r.error, charged: false }); return; }
    listAsOf = r.data.list_loaded_at || listAsOf;
    const m = r.data.matches?.[0];
    await record('wallet', address, r.data.sanctioned ? 'sanctioned' : 'clear', m ? { name: m.name, list: m.list, programs: m.programs } : null);
    if (await charge('item-checked')) return 'stop';
});
if (!stop) await each(names, 4, async (name) => {
    const r = await call('/v1/sanctions/screen', { name });
    if (!r.ok) { await Actor.pushData({ kind: 'name', value: name, error: r.error, charged: false }); return; }
    listAsOf = r.data.list_loaded_at || listAsOf;
    await record('name', name, r.data.result, r.data.best_match ? { name: r.data.best_match.name, list: r.data.best_match.list, programs: r.data.best_match.programs, why: r.data.why } : null);
    if (await charge('item-checked')) return 'stop';
});

await store.setValue('STATE', { ...previous, ...state });
const summary = { watchlist: slug, checked: Object.keys(state).length, change_count: changes.length, current_matches: current.length,
    escalated: changes.filter((c) => c.direction === 'escalated').length, list_as_of: listAsOf, run_at: new Date().toISOString() };
await Actor.setValue('OUTPUT', { ...summary, changes, current_matches_detail: current });
log.info(`Watchlist ${slug}: ${summary.checked} checked, ${summary.change_count} changed, ${summary.current_matches} currently matching.`);

const mode = input.alertOn || 'changes';
const shouldAlert = mode === 'every_run' || (mode === 'changes' && changes.length) || (mode === 'matches' && current.length);
if (input.webhookUrl && shouldAlert) {
    const text = changes.length
        ? `Sanctions watchlist "${slug}": ${changes.length} change(s). ${changes.map((c) => `${c.kind} ${c.value}: ${c.previous_status} -> ${c.status}`).join('; ')}`
        : `Sanctions watchlist "${slug}": ${summary.checked} checked, ${current.length} currently matching, no changes.`;
    try {
        const res = await fetch(input.webhookUrl, { method: 'POST', headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ text, ...summary, changes, current_matches_detail: current }), signal: AbortSignal.timeout(20_000) });
        log.info(`Alert sent (HTTP ${res.status}).`);
    } catch (e) { log.warning(`Alert webhook failed: ${e.message}`); }
}
await Actor.exit();
