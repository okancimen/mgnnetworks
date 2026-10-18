#!/usr/bin/env python3
"""
Update sitemap.xml:
1. Add xmlns:image namespace
2. Add <image:image> tags to EN article URLs
3. Fix interview article to full 7-locale hreflang
4. Add remote-internships-for-students (7 locales)
5. Add faq.html (7 locales)
6. Update lastmod on modified URLs
"""

import re

SITEMAP = '/Users/okancimen/ClaudeProjects/mgnnetworks.com/sitemap.xml'

TODAY = '2026-10-18'

# OG images for each article slug
IMAGES = {
    'how-to-get-work-experience-as-a-student': ('How to Get Work Experience as a Student', 'how-to-get-work-experience-as-a-student.png'),
    '10-benefits-of-part-time-work-for-students': ('10 Benefits of Part-Time Work for Students', '10-benefits-of-part-time-work-for-students.png'),
    'how-to-write-a-cv-with-no-experience': ('How to Write a CV With No Experience', 'how-to-write-a-cv-with-no-experience.png'),
    'what-is-an-internship-and-how-to-get-one': ('What Is an Internship and How to Get One', 'what-is-an-internship-and-how-to-get-one.png'),
    'best-part-time-jobs-for-students': ('Best Part-Time Jobs for Students', 'best-part-time-jobs-for-students.png'),
    'why-fresh-graduates-struggle-finding-jobs': ('Why Fresh Graduates Struggle Finding Jobs', 'why-fresh-graduates-struggle-finding-jobs.png'),
    'does-work-experience-matter-for-teenagers': ('Does Work Experience Matter for Teenagers?', 'does-work-experience-matter-for-teenagers.png'),
    'how-to-prepare-for-your-first-job-interview': ('How to Prepare for Your First Job Interview', 'how-to-prepare-for-your-first-job-interview.png'),
    'remote-internships-for-students': ('Remote Internships for Students', 'remote-internships-for-students.png'),
}

HREFLANG_TEMPLATE = '''  <xhtml:link rel="alternate" hreflang="en"        href="https://mgnnetworks.com/en/insights/{slug}.html"/>
  <xhtml:link rel="alternate" hreflang="es"        href="https://mgnnetworks.com/es/insights/{slug}.html"/>
  <xhtml:link rel="alternate" hreflang="fr"        href="https://mgnnetworks.com/fr/insights/{slug}.html"/>
  <xhtml:link rel="alternate" hreflang="tr"        href="https://mgnnetworks.com/tr/insights/{slug}.html"/>
  <xhtml:link rel="alternate" hreflang="zh"        href="https://mgnnetworks.com/cn/insights/{slug}.html"/>
  <xhtml:link rel="alternate" hreflang="ar"        href="https://mgnnetworks.com/ar/insights/{slug}.html"/>
  <xhtml:link rel="alternate" hreflang="x-default" href="https://mgnnetworks.com/en/insights/{slug}.html"/>
  <xhtml:link rel="alternate" hreflang="ru"        href="https://mgnnetworks.com/ru/insights/{slug}.html"/>'''

def image_block(slug):
    title, filename = IMAGES[slug]
    return f'''  <image:image>
    <image:loc>https://mgnnetworks.com/og-images/{filename}</image:loc>
    <image:title>{title}</image:title>
  </image:image>'''

def url_block_article(locale, slug, lastmod, priority='0.8'):
    hreflang = HREFLANG_TEMPLATE.format(slug=slug)
    img = image_block(slug) if locale == 'en' else ''
    img_section = f'\n{img}' if img else ''
    return f'''  <url>
    <loc>https://mgnnetworks.com/{locale}/insights/{slug}.html</loc>
    <lastmod>{lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>{priority}</priority>{img_section}
{hreflang}
  </url>'''

def url_block_faq(locale, lastmod):
    locales_map = {
        'en': 'en', 'es': 'es', 'fr': 'fr', 'tr': 'tr', 'cn': 'zh', 'ar': 'ar', 'ru': 'ru'
    }
    items = '\n'.join([
        f'  <xhtml:link rel="alternate" hreflang="{locales_map.get(l, l)}"        href="https://mgnnetworks.com/{l}/faq.html"/>'
        for l in ['en', 'es', 'fr', 'tr', 'cn', 'ar', 'ru']
    ] + ['  <xhtml:link rel="alternate" hreflang="x-default" href="https://mgnnetworks.com/en/faq.html"/>'])
    img = ''
    if locale == 'en':
        img = '\n  <image:image>\n    <image:loc>https://mgnnetworks.com/og-images/fellowship.png</image:loc>\n    <image:title>Magenta Networks Global Career Fellowship FAQ</image:title>\n  </image:image>'
    return f'''  <url>
    <loc>https://mgnnetworks.com/{locale}/faq.html</loc>
    <lastmod>{lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>{img}
{items}
  </url>'''

with open(SITEMAP, 'r') as f:
    content = f.read()

# 1. Add image namespace to urlset
content = content.replace(
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'
)

# 2. Fix interview article (currently EN-only, missing locales + image tag)
old_interview = '''  <!-- ===== ARTICLE: how-to-prepare-for-your-first-job-interview (EN only) ===== -->
  <url>
    <loc>https://mgnnetworks.com/en/insights/how-to-prepare-for-your-first-job-interview.html</loc>
    <lastmod>2026-10-17</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="en"        href="https://mgnnetworks.com/en/insights/how-to-prepare-for-your-first-job-interview.html"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://mgnnetworks.com/en/insights/how-to-prepare-for-your-first-job-interview.html"/>
  </url>'''

slug = 'how-to-prepare-for-your-first-job-interview'
new_interview_urls = f'\n  <!-- ===== ARTICLE: how-to-prepare-for-your-first-job-interview ===== -->\n'
for locale in ['en', 'es', 'fr', 'tr', 'cn', 'ar', 'ru']:
    new_interview_urls += '\n' + url_block_article(locale, slug, TODAY) + '\n'

content = content.replace(old_interview, new_interview_urls)

# 3. Add remote-internships and FAQ sections before </urlset>
slug_ri = 'remote-internships-for-students'
new_sections = '\n  <!-- ===== ARTICLE: remote-internships-for-students ===== -->\n'
for locale in ['en', 'es', 'fr', 'tr', 'cn', 'ar', 'ru']:
    new_sections += '\n' + url_block_article(locale, slug_ri, TODAY) + '\n'

new_sections += '\n  <!-- ===== FAQ PAGES ===== -->\n'
for locale in ['en', 'es', 'fr', 'tr', 'cn', 'ar', 'ru']:
    new_sections += '\n' + url_block_faq(locale, TODAY) + '\n'

content = content.replace('</urlset>', new_sections + '\n</urlset>')

# 4. Add image tags to existing EN article URLs (insert after <priority> line)
for slug, (title, filename) in IMAGES.items():
    if slug in ('how-to-prepare-for-your-first-job-interview', 'remote-internships-for-students'):
        continue  # already handled above
    old_en_loc = f'    <loc>https://mgnnetworks.com/en/insights/{slug}.html</loc>'
    if old_en_loc not in content:
        continue
    img_tag = f'    <image:image>\n      <image:loc>https://mgnnetworks.com/og-images/{filename}</image:loc>\n      <image:title>{title}</image:title>\n    </image:image>'
    # Find the priority line in the EN block for this slug and insert image after it
    pattern = rf'(<loc>https://mgnnetworks\.com/en/insights/{re.escape(slug)}\.html</loc>\n    <lastmod>[^<]+</lastmod>\n    <changefreq>[^<]+</changefreq>\n    <priority>[^<]+</priority>)'
    replacement = rf'\1\n    {img_tag.strip()}'
    content = re.sub(pattern, replacement, content)

with open(SITEMAP, 'w') as f:
    f.write(content)

print('Sitemap updated successfully.')
