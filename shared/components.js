/**
 * Magenta Networks — Shared Nav & Footer
 * Include this script at the bottom of every page body.
 * Place <div id="mgn-nav"></div> where the nav goes (top of body).
 * Place <div id="mgn-footer"></div> where the footer goes (bottom of body).
 */
(function () {
  'use strict';

  // ── Language config ───────────────────────────────────────────────────────
  const LANGS      = ['en', 'es', 'ar', 'tr', 'cn', 'fr', 'ru'];
  const RTL        = ['ar'];
  const OTHER_SUBS = ['verify', 'letters'];

  const FLAGS = { en: '🇬🇧', es: '🇪🇸', ar: '🇸🇦', tr: '🇹🇷', cn: '🇨🇳', fr: '🇫🇷', ru: '🇷🇺' };
  const NAMES = { en: 'English', es: 'Español', ar: 'العربية', tr: 'Türkçe', cn: '中文', fr: 'Français', ru: 'Русский' };

  const T = {
    whatWeDo:    { en: 'What We Do',   es: 'Qué Hacemos',    fr: 'Ce Que Nous Faisons', tr: 'Ne Yapıyoruz',    cn: '我们的业务',   ar: 'ما نفعله',        ru: 'Чем мы занимаемся' },
    howItWorks:  { en: 'How It Works', es: 'Cómo Funciona',  fr: 'Comment ça Marche',   tr: 'Nasıl Çalışır',   cn: '如何运作',     ar: 'كيف يعمل',        ru: 'Как это работает'  },
    compare:     { en: 'Compare',      es: 'Comparar',       fr: 'Comparer',             tr: 'Karşılaştır',     cn: '比较',         ar: 'مقارنة',          ru: 'Сравнить'          },
    leadership:  { en: 'Leadership',   es: 'Liderazgo',      fr: 'Direction',            tr: 'Liderlik',        cn: '领导团队',     ar: 'القيادة',         ru: 'Руководство'       },
    insights:    { en: 'Insights',     es: 'Perspectivas',   fr: 'Analyses',             tr: 'Görüşler',        cn: '洞察',         ar: 'رؤى',             ru: 'Аналитика'         },
    getInTouch:  { en: 'Get in touch', es: 'Contáctanos',    fr: 'Nous contacter',       tr: 'İletişim',        cn: '联系我们',     ar: 'تواصل معنا',      ru: 'Связаться'         },
    apply:       { en: 'Apply for Fellowship →', es: 'Solicitar Fellowship →', fr: 'Candidater au Fellowship →', tr: "Fellowship'e Başvur →", cn: '申请奖学金 →', ar: 'التقدم للزمالة →', ru: 'Подать заявку →' },
  };
  function t(key) { return (T[key] && T[key][lang]) || T[key]['en']; }

  // ── Detect context from URL ───────────────────────────────────────────────
  const CONTENT_SUBS = ['insights', 'blog'];

  const parts        = location.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  const lang         = LANGS.find(l => parts.includes(l)) || 'en';
  const inLangSub    = LANGS.some(l => parts.includes(l));
  const inOtherSub   = OTHER_SUBS.some(s => parts.includes(s));
  const inContentSub = CONTENT_SUBS.some(s => parts.includes(s));
  const contentSub   = CONTENT_SUBS.find(s => parts.includes(s)) || '';
  const inSub        = inLangSub || inOtherSub || inContentSub;
  const depth        = (inLangSub && (inOtherSub || inContentSub)) ? 2 : (inSub ? 1 : 0);
  const base         = depth === 2 ? '../../' : (depth === 1 ? '../' : './');
  const lastSeg      = parts[parts.length - 1] || '';
  const isIndex      = !inOtherSub && !inContentSub && (lastSeg === '' || lastSeg === 'index.html' || LANGS.includes(lastSeg));
  const isContentIdx = inContentSub && (lastSeg === contentSub || lastSeg === 'index.html');
  const pageFile     = (isIndex || isContentIdx) ? '' : lastSeg;
  const otherSub     = OTHER_SUBS.find(s => parts.includes(s)) || '';
  const langTarget   = inOtherSub   ? `${otherSub}/`
                     : inContentSub ? `${contentSub}/${pageFile}`
                     : pageFile;
  // prefix for locale-level links when inside a content subfolder (e.g. insights/)
  const lp           = (depth === 2 && inContentSub) ? '../' : '';

  const homeHref    = isIndex ? '#hero' : (depth === 2 ? '../' : (inOtherSub ? `${base}en/index.html` : 'index.html'));
  const privacyHref = inOtherSub    ? `${base}en/privacy.html`
                    : depth === 2   ? '../privacy.html'
                    : 'privacy.html';

  // ── Language dropdown ─────────────────────────────────────────────────────
  function langDropdownHTML() {
    const items = LANGS.map(l => {
      const href     = `${base}${l}/${langTarget}`;
      const active   = l === lang ? ' lang-dd-active' : '';
      return `<a href="${href}" class="lang-dd-item${active}" role="menuitem">${FLAGS[l]} ${NAMES[l]}</a>`;
    }).join('');
    return `
<div class="lang-dd" id="lang-dd">
  <button class="lang-dd-btn" id="lang-dd-btn" aria-haspopup="menu" aria-expanded="false">
    <span class="lang-dd-flag">${FLAGS[lang]}</span>
    <span class="lang-dd-code">${lang.toUpperCase()}</span>
    <svg class="lang-dd-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </button>
  <div class="lang-dd-panel" id="lang-dd-panel" role="menu">${items}</div>
</div>`;
  }

  // ── Mobile lang row ───────────────────────────────────────────────────────
  function mobileLangHTML() {
    return LANGS.map(l => {
      const href   = `${base}${l}/${langTarget}`;
      const active = l === lang ? ' ml-active' : '';
      return `<a href="${href}" class="ml-item${active}">${FLAGS[l]} ${l.toUpperCase()}</a>`;
    }).join('');
  }

  // ── Full nav (index pages) ────────────────────────────────────────────────
  function fullNav() {
    return `
<nav id="nav">
  <a href="#hero" class="nav-logo-mark">
    <div class="nav-logo-icon">
      <img src="${base}logo.svg" alt="Magenta Networks" />
    </div>
  </a>
  <ul class="nav-links">
    <li><a href="#what">${t('whatWeDo')}</a></li>
    <li><a href="#portfolio-edu">Portfolio</a></li>
    <li><a href="fellowship.html">Fellowship</a></li>
    <li><a href="fellowship.html#how">${t('howItWorks')}</a></li>
    <li><a href="fellowship.html#faq">FAQ</a></li>
    <li><a href="fellowship.html#compare">${t('compare')}</a></li>
    <li><a href="#leadership">${t('leadership')}</a></li>
    <li><a href="insights/index.html">${t('insights')}</a></li>
    <li><a href="#contact" class="nav-apply">${t('getInTouch')}</a></li>
  </ul>
  ${langDropdownHTML()}
  <button class="hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
</nav>

<div id="mobile-menu" role="dialog" aria-label="Navigation">
  <a href="#what"           class="mobile-link">${t('whatWeDo')}</a>
  <a href="#portfolio-edu"  class="mobile-link">Portfolio</a>
  <a href="fellowship.html" class="mobile-link">Fellowship</a>
  <a href="fellowship.html#how" class="mobile-link">${t('howItWorks')}</a>
  <a href="fellowship.html#faq" class="mobile-link">FAQ</a>
  <a href="fellowship.html#compare" class="mobile-link">${t('compare')}</a>
  <a href="#leadership"     class="mobile-link">${t('leadership')}</a>
  <a href="insights/index.html" class="mobile-link">${t('insights')}</a>
  <a href="apply.html"      class="mobile-link apply">${t('apply')}</a>
  <div class="mobile-lang">${mobileLangHTML()}</div>
  <span class="mobile-menu-footer">Magenta Networks Pte Ltd · Singapore</span>
</div>`;
  }

  // ── Sub nav (lang subpages) ───────────────────────────────────────────────
  function subNav() {
    const h = homeHref;
    return `
<nav id="nav">
  <a href="${h}" class="nav-logo-mark">
    <div class="nav-logo-icon">
      <img src="${base}logo.svg" alt="Magenta Networks" />
    </div>
  </a>
  <ul class="nav-links">
    <li><a href="${h}#what">${t('whatWeDo')}</a></li>
    <li><a href="${h}#portfolio-edu">Portfolio</a></li>
    <li><a href="${lp}fellowship.html">Fellowship</a></li>
    <li><a href="${lp}fellowship.html#how">${t('howItWorks')}</a></li>
    <li><a href="${lp}fellowship.html#faq">FAQ</a></li>
    <li><a href="${lp}fellowship.html#compare">${t('compare')}</a></li>
    <li><a href="${h}#leadership">${t('leadership')}</a></li>
    <li><a href="${lp}insights/index.html">${t('insights')}</a></li>
    <li><a href="${h}#contact" class="nav-apply">${t('getInTouch')}</a></li>
  </ul>
  ${langDropdownHTML()}
  <button class="hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
</nav>

<div id="mobile-menu" role="dialog" aria-label="Navigation">
  <a href="${h}#what"          class="mobile-link">${t('whatWeDo')}</a>
  <a href="${h}#portfolio-edu" class="mobile-link">Portfolio</a>
  <a href="${lp}fellowship.html"    class="mobile-link">Fellowship</a>
  <a href="${lp}fellowship.html#how" class="mobile-link">${t('howItWorks')}</a>
  <a href="${lp}fellowship.html#faq" class="mobile-link">FAQ</a>
  <a href="${lp}fellowship.html#compare" class="mobile-link">${t('compare')}</a>
  <a href="${h}#leadership"    class="mobile-link">${t('leadership')}</a>
  <a href="${lp}insights/index.html" class="mobile-link">${t('insights')}</a>
  <a href="${lp}apply.html"         class="mobile-link apply">${t('apply')}</a>
  <div class="mobile-lang">${mobileLangHTML()}</div>
  <span class="mobile-menu-footer">Magenta Networks Pte Ltd · Singapore</span>
</div>`;
  }

  // ── Simple nav (utility pages) ────────────────────────────────────────────
  function simpleNav() {
    return `
<nav id="nav">
  <a href="${homeHref}" class="nav-logo">
    <img src="${base}logo.svg" alt="Magenta Networks" />
  </a>
  <a href="${homeHref}" class="nav-back">← Back to mgnnetworks.com</a>
  ${langDropdownHTML()}
</nav>`;
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  function footer() {
    const year = new Date().getFullYear();
    return `
<footer>
  <a href="${homeHref}" class="footer-logo">
    <div class="footer-logo-icon">
      <img src="${base}logo.svg" alt="Magenta Networks" />
    </div>
    <span class="footer-name">Magenta Networks Pte Ltd &nbsp;·&nbsp; <a href="https://companieshouse.sg/magenta-networks-201540366Z?ref=search" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline;opacity:.6">UEN 201540366Z</a> &nbsp;·&nbsp; Singapore &nbsp;·&nbsp; Incorporated 2015</span>
  </a>
  <span class="footer-right">
    © ${year} Magenta Networks Pte Ltd. All rights reserved.
    &nbsp;·&nbsp;
    <a href="${privacyHref}" style="color:inherit;text-decoration:underline;opacity:.5">Privacy &amp; Terms</a>
  </span>
</footer>`;
  }

  // ── Inject styles ─────────────────────────────────────────────────────────
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .lang-switch { display: none; }
      .lang-dd {
        position: relative;
        margin-left: 12px;
        padding-left: 12px;
        border-left: 1px solid rgba(0,0,0,0.1);
        flex-shrink: 0;
      }
      .lang-dd-btn {
        display: flex; align-items: center; gap: 6px;
        background: none; border: none; cursor: pointer;
        font-size: 12px; font-weight: 600;
        color: var(--ink, #1d1d1f);
        padding: 5px 8px; border-radius: 8px;
        transition: background .15s;
        font-family: inherit;
      }
      .lang-dd-btn:hover { background: var(--light-bg, #f5f5f7); }
      .lang-dd-flag { font-size: 16px; line-height: 1; }
      .lang-dd-code { font-size: 11px; font-weight: 700; letter-spacing: 0.5px; }
      .lang-dd-chevron { opacity: 0.4; transition: transform .2s; flex-shrink: 0; }
      .lang-dd.open .lang-dd-chevron { transform: rotate(180deg); }
      .lang-dd-panel {
        position: absolute; top: calc(100% + 10px); right: 0;
        background: #fff;
        border: 1px solid rgba(0,0,0,0.08);
        border-radius: 14px;
        padding: 6px;
        box-shadow: 0 8px 40px rgba(0,0,0,0.13);
        min-width: 168px;
        opacity: 0; pointer-events: none;
        transform: translateY(-6px);
        transition: opacity .15s, transform .15s;
        z-index: 400;
      }
      .lang-dd.open .lang-dd-panel { opacity: 1; pointer-events: all; transform: none; }
      .lang-dd-item {
        display: flex; align-items: center; gap: 10px;
        padding: 9px 12px; border-radius: 8px;
        font-size: 13px; font-weight: 500;
        color: var(--ink, #1d1d1f);
        text-decoration: none;
        transition: background .1s;
        white-space: nowrap;
      }
      .lang-dd-item:hover { background: var(--light-bg, #f5f5f7); }
      .lang-dd-active { font-weight: 700; }
      .lang-dd-active::after {
        content: '✓';
        margin-left: auto;
        font-size: 11px;
        color: var(--mag, #E60CD2);
        padding-left: 8px;
      }

      /* dark nav overrides */
      #nav.dark .lang-dd { border-left-color: rgba(255,255,255,0.15); }
      #nav.dark .lang-dd-btn { color: #fff; }
      #nav.dark .lang-dd-btn:hover { background: rgba(255,255,255,0.08); }
      #nav.dark .lang-dd-panel { background: #2c2c2e; border-color: rgba(255,255,255,0.1); }
      #nav.dark .lang-dd-item { color: #f5f5f7; }
      #nav.dark .lang-dd-item:hover { background: rgba(255,255,255,0.08); }

      /* mobile lang */
      .mobile-lang { display: flex; gap: 8px; padding: 16px 24px 0; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.08); flex-wrap: wrap; justify-content: center; }
      .ml-item { font-size: 13px; font-weight: 600; letter-spacing: 0.3px; color: rgba(255,255,255,0.45); text-decoration: none; padding: 6px 12px; border-radius: 8px; display: flex; align-items: center; gap: 6px; }
      .ml-item:hover, .ml-item.ml-active { color: #fff; background: rgba(255,255,255,0.1); }
    `;
    document.head.appendChild(style);
  }

  // ── Inject ────────────────────────────────────────────────────────────────
  injectStyles();

  const navEl    = document.getElementById('mgn-nav');
  const footerEl = document.getElementById('mgn-footer');
  if (navEl)    navEl.outerHTML    = isIndex ? fullNav() : (inOtherSub ? simpleNav() : subNav());
  if (footerEl) footerEl.outerHTML = footer();

  // ── Hamburger & mobile menu ───────────────────────────────────────────────
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    let open = false;
    function openMenu() {
      open = true;
      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      open = false;
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }
    window.openMenu  = openMenu;
    window.closeMenu = closeMenu;
    hamburger.addEventListener('click', () => open ? closeMenu() : openMenu());
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
    mobileMenu.querySelectorAll('.mobile-link').forEach(a => a.addEventListener('click', closeMenu));
  }

  // ── CTA click tracking ───────────────────────────────────────────────────
  (function trackCTAs() {
    if (typeof gtag !== 'function') return;
    const page = location.pathname;

    // Determine the section context of a clicked link
    function sectionOf(el) {
      const p = el.closest('[id]');
      return p ? p.id : 'unknown';
    }

    // Track every link that goes to apply.html
    document.querySelectorAll('a[href*="apply.html"]').forEach(function(a) {
      a.addEventListener('click', function() {
        gtag('event', 'cta_click', {
          destination: 'apply',
          button_label: a.textContent.trim().substring(0, 60),
          source_page: page,
          source_section: sectionOf(a),
        });
      });
    });

    // Track links to fellowship.html (only from non-fellowship pages)
    if (!page.includes('/fellowship')) {
      document.querySelectorAll('a[href*="fellowship.html"]:not([href*="#"])').forEach(function(a) {
        a.addEventListener('click', function() {
          gtag('event', 'cta_click', {
            destination: 'fellowship',
            button_label: a.textContent.trim().substring(0, 60),
            source_page: page,
            source_section: sectionOf(a),
          });
        });
      });
    }
  })();

  // ── Language dropdown toggle ──────────────────────────────────────────────
  const langDd  = document.getElementById('lang-dd');
  const langBtn = document.getElementById('lang-dd-btn');

  if (langDd && langBtn) {
    langBtn.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = langDd.classList.toggle('open');
      langBtn.setAttribute('aria-expanded', isOpen);
    });
    document.addEventListener('click', () => {
      langDd.classList.remove('open');
      langBtn.setAttribute('aria-expanded', 'false');
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        langDd.classList.remove('open');
        langBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

})();
