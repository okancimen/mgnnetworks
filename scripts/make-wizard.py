#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Transform all locale apply.html files into a 2-step wizard.
Run from project root:  python3 scripts/make-wizard.py
Idempotent — skips files that already contain step-1.
"""

LOCALES = {
    'en': {
        'fellowship_label': 'The fellowship',
        'step1': 'Step 1 of 2',
        'step2': 'Step 2 of 2',
        'next':  'Next →',
        'back':  '← Back',
    },
    'es': {
        'fellowship_label': 'La Fellowship',
        'step1': 'Paso 1 de 2',
        'step2': 'Paso 2 de 2',
        'next':  'Siguiente →',
        'back':  '← Atrás',
    },
    'fr': {
        'fellowship_label': 'La Fellowship',
        'step1': 'Étape 1 sur 2',
        'step2': 'Étape 2 sur 2',
        'next':  'Suivant →',
        'back':  '← Retour',
    },
    'tr': {
        'fellowship_label': 'Fellowship',
        'step1': 'Adım 1 / 2',
        'step2': 'Adım 2 / 2',
        'next':  'Devam →',
        'back':  '← Geri',
    },
    'ar': {
        'fellowship_label': 'الزمالة',
        'step1': 'الخطوة 1 من 2',
        'step2': 'الخطوة 2 من 2',
        'next':  'التالي',
        'back':  'رجوع',
    },
    'cn': {
        'fellowship_label': '奖学金项目',
        'step1': '第 1 步，共 2 步',
        'step2': '第 2 步，共 2 步',
        'next':  '下一步 →',
        'back':  '← 返回',
    },
    'ru': {
        'fellowship_label': 'Fellowship',
        'step1': 'Шаг 1 из 2',
        'step2': 'Шаг 2 из 2',
        'next':  'Далее →',
        'back':  '← Назад',
    },
}

STEP_CSS = """
    /* ── 2-step wizard ── */
    .step-indicator {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: var(--mag);
      margin-bottom: 32px;
    }
    .step-nav {
      margin-top: 32px;
      text-align: end;
    }
    .btn-next {
      background: var(--mag);
      color: #fff;
      border: none;
      border-radius: 980px;
      padding: 14px 32px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: opacity .15s;
    }
    .btn-next:hover { opacity: .85; }
    .btn-back {
      display: block;
      background: transparent;
      border: 1px solid rgba(255,255,255,.15);
      color: rgba(255,255,255,.55);
      border-radius: 980px;
      padding: 10px 22px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 20px;
      transition: opacity .15s;
    }
    .btn-back:hover { opacity: .7; }
"""


def build_js(step1_text, step2_text):
    return f"""  <script>
    function nextStep() {{
      var s1 = document.getElementById('step-1');
      var ok = true;
      s1.querySelectorAll('[required]').forEach(function(el) {{
        var empty = !el.value || !el.value.trim();
        el.style.borderColor = empty ? 'var(--mag)' : '';
        el.style.boxShadow   = empty ? '0 0 0 3px rgba(230,12,210,.18)' : '';
        if (empty) ok = false;
      }});
      if (!ok) return;
      s1.style.display = 'none';
      document.getElementById('step-2').style.display = 'block';
      document.getElementById('step-text').textContent = {repr(step2_text)};
      window.scrollTo({{top: document.querySelector('.form-wrap').offsetTop - 20, behavior: 'smooth'}});
    }}
    function prevStep() {{
      document.getElementById('step-2').style.display = 'none';
      document.getElementById('step-1').style.display = 'block';
      document.getElementById('step-text').textContent = {repr(step1_text)};
      window.scrollTo({{top: document.querySelector('.form-wrap').offsetTop - 20, behavior: 'smooth'}});
    }}
  </script>"""


def transform(locale, cfg):
    filepath = f'{locale}/apply.html'
    with open(filepath, encoding='utf-8') as f:
        html = f.read()

    if 'id="step-1"' in html:
        print(f'  skip {filepath}')
        return

    # 1. Inject CSS before first </style>
    html = html.replace('</style>', STEP_CSS + '    </style>', 1)

    # 2. Step indicator + open step-1 div after <form> opening tag
    form_open = '  <form name="fellowship-application" onsubmit="handleSubmit(event)">'
    html = html.replace(
        form_open,
        form_open
        + f'\n\n    <div class="step-indicator"><span id="step-text">{cfg["step1"]}</span></div>'
        + '\n\n    <div id="step-1" class="form-step">',
        1,
    )

    # 3. Close step-1 (+ Next button) then open step-2 before fellowship section label
    fellowship_div = f'    <div class="form-section-label">{cfg["fellowship_label"]}</div>'
    html = html.replace(
        fellowship_div,
        f'\n    <div class="step-nav"><button type="button" class="btn-next" onclick="nextStep()">{cfg["next"]}</button></div>\n\n    </div>\n\n    <div id="step-2" class="form-step" style="display:none">\n    {fellowship_div.strip()}',
        1,
    )

    # 4. Add Back button as first element inside form-submit
    submit_btn = '      <button type="submit" class="btn-submit">'
    html = html.replace(
        submit_btn,
        f'      <button type="button" class="btn-back" onclick="prevStep()">{cfg["back"]}</button>\n' + submit_btn,
        1,
    )

    # 5. Close step-2 div just before </form>
    html = html.replace('\n  </form>', '\n    </div>\n\n  </form>', 1)

    # 6. Inject step JS before </body>
    html = html.replace('</body>', build_js(cfg['step1'], cfg['step2']) + '\n</body>', 1)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'  ✓  {filepath}')


print('Transforming apply.html files...')
for locale, cfg in LOCALES.items():
    transform(locale, cfg)
print('Done.')
