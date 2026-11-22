import { Actor, log } from 'apify';
import { call, charge, each, nonEmpty } from './lib.js';

await Actor.init();
const input = (await Actor.getInput()) || {};
const wallets = nonEmpty(input.wallets), names = nonEmpty(input.names);
if (!wallets.length && !names.length) await Actor.fail('Add at least one wallet address or name.');
const type = input.nameType && input.nameType !== 'any' ? input.nameType : undefined;
let stop = false, n = 0;

stop = await each(wallets, 4, async (address) => {
    const r = await call('/v1/sanctions/wallet', { address });
    if (!r.ok) { await Actor.pushData({ kind: 'wallet', input: address, error: r.error, charged: false }); return; }
    await Actor.pushData({ kind: 'wallet', input: address, ...r.data });
    n++;
    if (await charge('wallet-checked')) return 'stop';
});
if (!stop) await each(names, 4, async (name) => {
    const r = await call('/v1/sanctions/screen', { name, type, format: input.fullDetail ? 'full' : 'brief' });
    if (!r.ok) { await Actor.pushData({ kind: 'name', input: name, error: r.error, charged: false }); return; }
    await Actor.pushData({ kind: 'name', input: name, ...r.data });
    n++;
    if (await charge(input.fullDetail ? 'name-screened-full' : 'name-screened')) return 'stop';
});
log.info(`Screened ${n} items.`);
await Actor.exit();
