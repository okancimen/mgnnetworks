#!/usr/bin/env node
'use strict';

// Submit URLs to IndexNow (Bing, Yandex, Naver, …)
//
// Setup (one-time):
//   Key file 5811eb729a90265634a41406aaf8721f.txt must be served at site root.
//
// Usage:
//   node indexnow.js              # submit all URLs from sitemap
//   node indexnow.js --locale=ru  # submit only Russian pages
//   node indexnow.js --dry-run    # list URLs without submitting

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const KEY      = '5811eb729a90265634a41406aaf8721f';
const HOST     = 'mgnnetworks.com';
const SITEMAP  = path.resolve(__dirname, '../sitemap.xml');

async function main() {
  const dryRun   = process.argv.includes('--dry-run');
  const localeArg = process.argv.find(a => a.startsWith('--locale='));
  const locale   = localeArg ? localeArg.split('=')[1] : null;

  const xml  = fs.readFileSync(SITEMAP, 'utf8');
  const all  = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
  const urls = locale ? all.filter(u => u.includes(`/${locale}/`)) : all;

  console.log(`${urls.length} URL(s) to submit${locale ? ` [locale: ${locale}]` : ''}`);

  if (dryRun) {
    urls.forEach(u => console.log(' ', u));
    return;
  }

  const body = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList: urls,
  });

  await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.indexnow.org',
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 202) {
          console.log(`\nDone — ${urls.length} URL(s) submitted (HTTP ${res.statusCode})`);
          resolve();
        } else {
          console.error(`Failed — HTTP ${res.statusCode}: ${data}`);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

main().catch(e => { console.error(e.message); process.exit(1); });
