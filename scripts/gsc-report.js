#!/usr/bin/env node
'use strict';

const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');
const path = require('path');

const SITE      = 'sc-domain:mgnnetworks.com';
const KEY_FILE  = path.resolve(__dirname, 'gsc-service-account.json');
const API_BASE  = 'https://searchconsole.googleapis.com/webmasters/v3';

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

async function getClient() {
  const credentials = JSON.parse(fs.readFileSync(KEY_FILE, 'utf8'));
  const auth = new GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  return auth.getClient();
}

async function query(client, body) {
  const res = await client.request({
    url: `${API_BASE}/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`,
    method: 'POST',
    data: body,
  });
  return res.data;
}

async function main() {
  const client = await getClient();

  const ranges = {
    last7:  { startDate: daysAgo(7),  endDate: daysAgo(0) },
    last28: { startDate: daysAgo(28), endDate: daysAgo(0) },
    prev28: { startDate: daysAgo(56), endDate: daysAgo(29) },
  };

  // 1. Overall performance: last 28 vs prev 28
  const [curr, prev] = await Promise.all([
    query(client, { ...ranges.last28, dimensions: [] }),
    query(client, { ...ranges.prev28, dimensions: [] }),
  ]);

  const c = curr.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  const p = prev.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };

  const pct = (a, b) => b === 0 ? 'n/a' : `${((a - b) / b * 100).toFixed(1)}%`;
  const arrow = (a, b, lowerBetter = false) => {
    if (b === 0) return '';
    const up = a > b;
    return (up !== lowerBetter) ? ' ↑' : ' ↓';
  };

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  OVERALL  (last 28 days vs prior 28 days)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Clicks      ${c.clicks}  vs ${p.clicks}  ${pct(c.clicks, p.clicks)}${arrow(c.clicks, p.clicks)}`);
  console.log(`  Impressions ${c.impressions}  vs ${p.impressions}  ${pct(c.impressions, p.impressions)}${arrow(c.impressions, p.impressions)}`);
  console.log(`  CTR         ${(c.ctr*100).toFixed(2)}%  vs ${(p.ctr*100).toFixed(2)}%  ${pct(c.ctr, p.ctr)}${arrow(c.ctr, p.ctr)}`);
  console.log(`  Avg pos     ${c.position.toFixed(1)}  vs ${p.position.toFixed(1)}  ${pct(c.position, p.position)}${arrow(c.position, p.position, true)}`);

  // 2. Top pages by clicks (last 28)
  const pages = await query(client, {
    ...ranges.last28,
    dimensions: ['page'],
    rowLimit: 20,
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  TOP PAGES (last 28 days)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  (pages.rows || []).forEach(r => {
    const url = r.keys[0].replace('https://mgnnetworks.com', '');
    console.log(`  ${String(r.clicks).padStart(4)} clicks  pos ${r.position.toFixed(1).padStart(5)}  ${url}`);
  });

  // 3. Top queries by clicks (last 28)
  const queries = await query(client, {
    ...ranges.last28,
    dimensions: ['query'],
    rowLimit: 20,
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  TOP QUERIES (last 28 days)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  (queries.rows || []).forEach(r => {
    console.log(`  ${String(r.clicks).padStart(4)} clicks  pos ${r.position.toFixed(1).padStart(5)}  ${r.keys[0]}`);
  });

  // 4. Performance by locale (last 28)
  const byPage = await query(client, {
    ...ranges.last28,
    dimensions: ['page'],
    rowLimit: 1000,
  });

  const locales = {};
  (byPage.rows || []).forEach(r => {
    const m = r.keys[0].match(/mgnnetworks\.com\/([a-z]{2})\//);
    const locale = m ? m[1] : 'other';
    if (!locales[locale]) locales[locale] = { clicks: 0, impressions: 0 };
    locales[locale].clicks += r.clicks;
    locales[locale].impressions += r.impressions;
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  BY LOCALE (last 28 days)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  Object.entries(locales)
    .sort((a, b) => b[1].clicks - a[1].clicks)
    .forEach(([locale, d]) => {
      console.log(`  ${locale.padEnd(4)}  ${String(d.clicks).padStart(5)} clicks  ${String(d.impressions).padStart(7)} impr`);
    });

  // 5. Newly ranking pages (last 7, pos ≤ 20, sorted by impressions)
  const fresh = await query(client, {
    ...ranges.last7,
    dimensions: ['page'],
    rowLimit: 1000,
  });

  const newPages = (fresh.rows || [])
    .filter(r => r.position <= 20)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 15);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  PAGES IN TOP-20 (last 7 days, by impressions)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  newPages.forEach(r => {
    const url = r.keys[0].replace('https://mgnnetworks.com', '');
    console.log(`  pos ${r.position.toFixed(1).padStart(5)}  ${String(r.impressions).padStart(5)} impr  ${url}`);
  });

  console.log('');
}

main().catch(e => { console.error(e.response?.data || e.message); process.exit(1); });
