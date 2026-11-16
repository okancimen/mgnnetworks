#!/usr/bin/env node
'use strict';

// Submit URLs to Google Indexing API
//
// Setup (one-time):
//   1. Google Cloud Console → enable "Web Search Indexing API"
//   2. Create a service account, download JSON key → save as scripts/gsc-service-account.json
//   3. Google Search Console → Settings → Users & permissions →
//      Add the service account email as an OWNER (not just user)
//   4. cd scripts && npm install
//
// Usage:
//   node gsc-index.js              # submit all URLs not yet in submitted.txt
//   node gsc-index.js --locale=ru  # submit only Russian pages
//   node gsc-index.js --dry-run    # list URLs without submitting
//   node gsc-index.js --all        # ignore submitted.txt, submit everything
//
// Quota: default 200 req/day. Increase at console.cloud.google.com if needed.
// submitted.txt tracks successfully submitted URLs — they are skipped on next run.

const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');
const path = require('path');

const SITEMAP       = path.resolve(__dirname, '../sitemap.xml');
const SUBMITTED_TXT = path.resolve(__dirname, 'submitted.txt');
const API           = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
const DELAY_MS      = 1000; // 1 req/s — stay well inside quota

async function main() {
  const dryRun    = process.argv.includes('--dry-run');
  const submitAll = process.argv.includes('--all');
  const localeArg = process.argv.find(a => a.startsWith('--locale='));
  const locale    = localeArg ? localeArg.split('=')[1] : null;

  const submitted = new Set(
    !submitAll && fs.existsSync(SUBMITTED_TXT)
      ? fs.readFileSync(SUBMITTED_TXT, 'utf8').split('\n').map(l => l.trim()).filter(Boolean)
      : []
  );

  const xml = fs.readFileSync(SITEMAP, 'utf8');
  const all = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
  const filtered = locale ? all.filter(u => u.includes(`/${locale}/`)) : all;
  const urls = filtered.filter(u => !submitted.has(u));

  const skipped = filtered.length - urls.length;
  console.log(`${urls.length} URL(s) to submit${locale ? ` [locale: ${locale}]` : ''}${skipped ? ` (${skipped} skipped — already in submitted.txt)` : ''}`);

  if (dryRun) {
    urls.forEach(u => console.log(' ', u));
    return;
  }

  const keyFile = process.env.GSC_KEY_FILE
    || path.resolve(__dirname, 'gsc-service-account.json');

  if (!fs.existsSync(keyFile)) {
    console.error(`Service account key not found: ${keyFile}`);
    console.error('Set GSC_KEY_FILE env var or place the JSON key at scripts/gsc-service-account.json');
    process.exit(1);
  }

  const credentials = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
  const auth = new GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });
  const client = await auth.getClient();

  let ok = 0, fail = 0;

  for (const url of urls) {
    try {
      await client.request({
        url: API,
        method: 'POST',
        data: { url, type: 'URL_UPDATED' },
      });
      console.log(`✓  ${url}`);
      fs.appendFileSync(SUBMITTED_TXT, url + '\n');
      ok++;
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message;
      console.error(`✗  ${url}  —  ${msg}`);
      fail++;
    }
    if (ok + fail < urls.length) {
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  console.log(`\nDone — ${ok} submitted, ${fail} failed`);
  if (fail) process.exit(1);
}

main().catch(e => { console.error(e.message); process.exit(1); });
