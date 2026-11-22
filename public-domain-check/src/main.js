import { Actor, log } from 'apify';
import { call, charge, each, nonEmpty } from './lib.js';

await Actor.init();
const input = (await Actor.getInput()) || {};
const works = nonEmpty(input.works).map((w) => (typeof w === 'string' ? { title: w } : w)).filter((w) => w.title);
if (!works.length) await Actor.fail('Add at least one work with a title.');
const format = input.format === 'full' ? 'full' : 'brief';
const event = format === 'full' ? 'work-checked-full' : 'work-checked';
let checked = 0, failed = 0;

await each(works, 4, async (w) => {
    const r = await call('/v1/pd-status', { title: w.title, author: w.author, year: w.year, type: w.type, origin: w.origin,
        author_death_year: w.author_death_year, countries: input.countries, format });
    if (!r.ok) { failed++; await Actor.pushData({ input: w, error: r.error, charged: false }); return; }
    await Actor.pushData({ input: w, ...r.data });
    checked++;
    if (await charge(event)) { log.info('Spending limit reached; stopping.'); return 'stop'; }
});
log.info(`Checked ${checked} works; ${failed} could not be answered (not charged).`);
await Actor.exit();
