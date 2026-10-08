#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Performance fixes across all HTML files:
  1. Defer GA4 + Clarity loading to after window.load (removes long main-thread tasks)
  2. Fix LCP on index.html files:
     - Correct preload (SVG → PNG with fetchpriority)
     - Hero image: <picture> with AVIF source, fetchpriority=high, no reveal delay
Run from project root: python3 scripts/perf-fix.py
Idempotent — skips already-patched files.
"""

import glob, os, re

# ── GA4 + Clarity deferred block ─────────────────────────────────────────────

GA4_OLD = (
    '  <!-- Google tag (gtag.js) -->\n'
    '  <script async src="https://www.googletagmanager.com/gtag/js?id=G-SQ2XEMXLS1"></script>\n'
    '  <script>\n'
    '    window.dataLayer = window.dataLayer || [];\n'
    '    function gtag(){dataLayer.push(arguments);}\n'
    "    gtag('js', new Date());\n"
    "    gtag('config', 'G-SQ2XEMXLS1');\n"
    '  </script>\n'
    '  <script type="text/javascript">\n'
    '    (function(c,l,a,r,i,t,y){\n'
    '        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};\n'
    '        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;\n'
    '        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);\n'
    '    })(window, document, "clarity", "script", "yu4tbvws23");\n'
    '  </script>'
)

GA4_NEW = (
    '  <script>\n'
    '    window.dataLayer = window.dataLayer || [];\n'
    '    function gtag(){dataLayer.push(arguments);}\n'
    "    gtag('js', new Date());\n"
    "    gtag('config', 'G-SQ2XEMXLS1');\n"
    "    window.addEventListener('load', function() {\n"
    "      var s = document.createElement('script');\n"
    '      s.async = true;\n'
    "      s.src = 'https://www.googletagmanager.com/gtag/js?id=G-SQ2XEMXLS1';\n"
    '      document.head.appendChild(s);\n'
    '      (function(c,l,a,r,i,t,y){\n'
    "        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};\n"
    "        t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;\n"
    "        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);\n"
    "      })(window,document,'clarity','script','yu4tbvws23');\n"
    '    });\n'
    '  </script>'
)

# ── LCP fixes (index.html only) ──────────────────────────────────────────────

PRELOAD_OLD = '  <link rel="preload" as="image" href="/logo.svg" type="image/svg+xml" />'
PRELOAD_NEW = '  <link rel="preload" as="image" href="/logo.png" fetchpriority="high" />'

HERO_OLD = (
    '  <div class="hero-logo-card reveal">\n'
    '    <img src="../logo.png" alt="Magenta Networks" />\n'
    '  </div>'
)

HERO_NEW = (
    '  <div class="hero-logo-card">\n'
    '    <picture>\n'
    '      <source srcset="/logo.avif" type="image/avif">\n'
    '      <img src="/logo.png" alt="Magenta Networks" fetchpriority="high" />\n'
    '    </picture>\n'
    '  </div>'
)


def fix_file(path, is_index=False):
    with open(path, encoding='utf-8') as f:
        html = f.read()

    changed = False

    # 1. Defer GA4 + Clarity
    if GA4_OLD in html:
        html = html.replace(GA4_OLD, GA4_NEW, 1)
        changed = True

    # 2. LCP fixes (index pages only)
    if is_index:
        if PRELOAD_OLD in html:
            html = html.replace(PRELOAD_OLD, PRELOAD_NEW, 1)
            changed = True
        if HERO_OLD in html:
            html = html.replace(HERO_OLD, HERO_NEW, 1)
            changed = True

    if changed:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        return True
    return False


# ── Run ───────────────────────────────────────────────────────────────────────

html_files = sorted(glob.glob('**/*.html', recursive=True))
# exclude node_modules, letters, verify
html_files = [p for p in html_files if 'node_modules' not in p and 'letters' not in p]

ok = skip = 0
for path in html_files:
    is_index = os.path.basename(path) == 'index.html' and any(
        path.startswith(loc + '/') for loc in ['en','es','fr','tr','ar','cn','ru']
    )
    if fix_file(path, is_index=is_index):
        print(f'  ✓  {path}')
        ok += 1
    else:
        skip += 1

print(f'\nDone — {ok} updated, {skip} skipped')
