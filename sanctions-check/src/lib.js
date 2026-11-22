// Shared helpers for the Agent Data Store Actors: call the API through the partner channel and charge
// the user only for results that came back. Copied into each Actor folder (Actors build independently).
import { Actor, log } from 'apify';

export const API_BASE = (process.env.API_BASE || 'https://public-domain-check-production.up.railway.app').replace(/\/$/, '');

const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== ''));

/** GET an API path. Returns { ok:true, data } or { ok:false, status, error } for input problems (never charged). */
export async function call(path, params = {}) {
    const key = process.env.PARTNER_KEY;
    if (!key) throw new Error('This Actor is not configured: the PARTNER_KEY environment variable is missing.');
    const url = `${API_BASE}${path}?${new URLSearchParams(clean(params))}`;
    let last;
    for (let attempt = 1; attempt <= 4; attempt++) {
        try {
            const res = await fetch(url, { headers: { 'x-partner-key': key, 'user-agent': 'agent-data-store-apify/1.0' }, signal: AbortSignal.timeout(60_000) });
            const body = await res.json().catch(() => ({}));
            if (res.ok) return { ok: true, data: body };
            if (res.status === 402) throw new Error('The partner key was rejected by the API (got a payment request). Check PARTNER_KEY.');
            if (res.status >= 400 && res.status < 500) return { ok: false, status: res.status, error: body.message || body.error || `HTTP ${res.status}`, details: body };
            last = new Error(`HTTP ${res.status}`);
        } catch (e) {
            if (/partner key/.test(e.message)) throw e;
            last = e;
        }
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
    }
    return { ok: false, status: 503, error: `The data service is temporarily unavailable (${last?.message || 'unknown error'}). Not charged.` };
}

/** Charge one event; returns true when the user's spending limit is reached (stop processing). */
export async function charge(eventName) {
    try {
        const r = await Actor.charge({ eventName });
        return !!r?.eventChargeLimitReached;
    } catch (e) {
        log.warning(`Charge for ${eventName} failed: ${e.message}`);
        return false;
    }
}

/** Run fn over items with limited concurrency, stopping early when fn returns 'stop'. */
export async function each(items, concurrency, fn) {
    let i = 0, stopped = false;
    const worker = async () => {
        while (!stopped && i < items.length) {
            const idx = i++;
            if ((await fn(items[idx], idx)) === 'stop') stopped = true;
        }
    };
    await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
    return stopped;
}

export const nonEmpty = (arr) => (Array.isArray(arr) ? arr : []).map((x) => (typeof x === 'string' ? x.trim() : x)).filter((x) => x && (typeof x !== 'string' || x.length));
