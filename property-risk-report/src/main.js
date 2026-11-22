import { Actor, log } from 'apify';
import { call, charge, each, nonEmpty } from './lib.js';

await Actor.init();
const input = (await Actor.getInput()) || {};
const addresses = nonEmpty(input.addresses);
if (!addresses.length) await Actor.fail('Add at least one US address.');
const format = input.format === 'full' ? 'full' : 'brief';
let n = 0;

await each(addresses, 3, async (address) => {
    const r = await call('/v1/property/risk', { address, format });
    if (!r.ok) { await Actor.pushData({ input: address, error: r.error, charged: false }); return; }
    await Actor.pushData({ input: address, ...r.data });
    n++;
    if (await charge(format === 'full' ? 'report-full' : 'report')) return 'stop';
});
log.info(`Built ${n} reports.`);
await Actor.exit();
