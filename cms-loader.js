/**
 * CMS CONTENT LOADER — Community Church of Glen Rock
 *
 * Fetches JSON content files from _content/ and injects them into the page.
 * Supports all pages: home, about, worship, programs, contact, blog.
 * Minister data (minister.json) is shared between index and about pages.
 * Popup data (popup.json) is injected on every page.
 *
 * Each HTML page declares which content file it uses:
 *   <body data-content="home">   → _content/home.json
 *   <body data-content="about">  → _content/about.json
 *   etc.
 *
 * For pages in subdirectories (e.g. blog/):
 *   <body data-content="blog" data-content-base="../">
 */

(async function () {
  const body       = document.body;
  const contentKey = body.dataset.content;
  const base       = body.dataset.contentBase || '';  // e.g. '../' for blog/

  async function loadJSON(path) {
    try {
      const res = await fetch(base + path);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('cms-loader: could not load ' + path, e);
      return null;
    }
  }

  const needsMinister = contentKey === 'home' || contentKey === 'about';

  const [settings, content, minister, popup] = await Promise.all([
    loadJSON('_content/settings.json'),
    contentKey ? loadJSON('_content/' + contentKey + '.json') : Promise.resolve(null),
    needsMinister ? loadJSON('_content/minister.json') : Promise.resolve(null),
    loadJSON('_content/popup.json'),
  ]);

  if (settings) injectFooter(settings);
  if (minister) injectMinister(minister);
  if (popup)    injectPopup(popup);

  if (content) {
    if (contentKey === 'home')     injectHome(content);
    if (contentKey === 'about')    injectAbout(content);
    if (contentKey === 'worship')  injectWorship(content);
    if (contentKey === 'programs') injectPrograms(content);
    if (contentKey === 'contact')  injectContact(content);
    if (contentKey === 'blog')     injectBlog(content);
    document.dispatchEvent(new CustomEvent('cms:ready', { detail: content }));
  }

  /* ── SHARED HELPERS ─────────────────────────────────── */

  function set(selector, value, html) {
    const el = document.querySelector(selector);
    if (!el || value == null) return;
    if (html) el.innerHTML = value;
    else      el.textContent = value;
  }

  function setAll(selector, values) {
    const els = document.querySelectorAll(selector);
    els.forEach((el, i) => {
      if (values[i] != null) el.textContent = values[i];
    });
  }

  /* ── FOOTER ─────────────────────────────────────────── */
  function injectFooter(s) {
    set('[data-cms="footer-address"]', s.address);
    set('[data-cms="footer-phone"]',   s.phone);
    set('[data-cms="footer-email"]',   s.email);
  }

  /* ── MINISTER (index + about share this) ────────────── */
  function injectMinister(m) {
    set('[data-cms="minister-name"]', m.name);
    set('[data-cms="minister-bio"]',  m.bio);
    document.querySelectorAll('[data-cms="minister-cta"]').forEach(a => {
      if (m.livestream_cta) a.textContent = m.livestream_cta;
      if (m.livestream_url) a.href        = m.livestream_url;
    });
  }

  /* ── POPUP (every page) ─────────────────────────────── */
  function injectPopup(p) {
    set('#ccgrPopupHeading', p.heading, true);
    const list = document.getElementById('cms-popup-links');
    if (!list || !p.links) return;
    list.innerHTML = p.links.map(lk => {
      const target = lk.new_tab ? ' target="_blank" rel="noopener"' : '';
      return `<li>
        <a href="${lk.url}" class="ccgr-popup__link"${target}>
          <span>
            <span class="ccgr-popup__link-when">${lk.when}</span>
            <span class="ccgr-popup__link-title">${lk.title}</span>
          </span>
          <span class="ccgr-popup__link-arrow" aria-hidden="true">&rarr;</span>
        </a>
      </li>`;
    }).join('');
  }

  /* ── HOME ───────────────────────────────────────────── */
  function injectHome(c) {
    if (c.ministry_cards) {
      c.ministry_cards.forEach((card, i) => {
        set(`[data-cms="card-${i}-title"]`, card.title);
        set(`[data-cms="card-${i}-desc"]`,  card.description);
      });
    }
    if (c.mission) {
      set('[data-cms="mission-subheadline"]', c.mission.subheadline);
      set('[data-cms="mission-body"]',        c.mission.body);
    }
    if (c.membership_support) {
      const ms = c.membership_support;
      set('[data-cms="membership-headline"]',    ms.membership_headline);
      set('[data-cms="membership-description"]', ms.membership_description);
      set('[data-cms="membership-cta"]',         ms.membership_cta);
      set('[data-cms="support-headline"]',       ms.support_headline);
      set('[data-cms="support-description"]',    ms.support_description);
      set('[data-cms="support-cta"]',            ms.support_cta);
      const donateBtn = document.querySelector('[data-cms="support-cta"]');
      if (donateBtn && ms.donation_url) donateBtn.href = ms.donation_url;
    }
  }

  /* ── ABOUT ──────────────────────────────────────────── */
  function injectAbout(c) {
    if (c.consistory) {
      const intro = document.getElementById('cms-consistory-intro');
      if (intro && c.consistory.intro) {
        intro.innerHTML = c.consistory.intro
          .map(p => `<p>${p}</p>`).join('');
      }
      const grid = document.getElementById('cms-consistory-members');
      if (grid && c.consistory.members) {
        grid.innerHTML = c.consistory.members.map(m => {
          const initials = m.name.split(' ').map(w => w[0]).filter((_, i, a) => i === 0 || i === a.length - 1).join('');
          return `<div class="staff-card">
            <div class="initials-placeholder">${initials}</div>
            <h4>${m.name}</h4>
            <p>${m.role}</p>
          </div>`;
        }).join('');
      }
    }
    if (c.history && c.history.paragraphs) {
      c.history.paragraphs.forEach((text, i) => {
        set(`[data-cms="history-${i}"]`, text);
      });
    }
    if (c.membership && c.membership.paragraphs) {
      c.membership.paragraphs.forEach((text, i) => {
        set(`[data-cms="about-membership-${i}"]`, text);
      });
    }
  }

  /* ── WORSHIP ────────────────────────────────────────── */
  function injectWorship(c) {
    if (c.services && c.services.items) {
      const list = document.getElementById('cms-services-list');
      if (list) {
        list.innerHTML = c.services.items
          .map(it => `<li><strong>${it.label}:</strong> ${it.detail}</li>`)
          .join('');
      }
    }
    if (c.worship_style) {
      const ws = c.worship_style;
      set('[data-cms="worship-style-headline"]',    ws.headline);
      set('[data-cms="worship-style-subheadline"]', ws.subheadline);
      if (ws.paragraphs) {
        ws.paragraphs.forEach((text, i) => {
          set(`[data-cms="worship-style-${i}"]`, text);
        });
      }
    }
    if (c.special_occasions) {
      set('[data-cms="occasions-intro"]', c.special_occasions.intro);
      if (c.special_occasions.venues) {
        c.special_occasions.venues.forEach((v, i) => {
          set(`[data-cms="venue-${i}-title"]`, v.title);
          set(`[data-cms="venue-${i}-desc"]`,  v.description);
        });
      }
    }
  }

  /* ── PROGRAMS ───────────────────────────────────────── */
  function injectPrograms(c) {
    if (c.cards) {
      c.cards.forEach((card, i) => {
        set(`[data-cms="prog-${i}-title"]`, card.title);
        set(`[data-cms="prog-${i}-desc"]`,  card.description);
      });
    }
    if (c.outreach) {
      set('[data-cms="outreach-text"]', c.outreach.text);
    }
    if (c.thrift_shop) {
      const ts = c.thrift_shop;
      set('[data-cms="thrift-intro"]',          ts.intro);
      set('[data-cms="thrift-location"]',        ts.location);
      set('[data-cms="thrift-location-phone"]',  ts.location_phone);
      set('[data-cms="thrift-items-accepted"]',  ts.items_accepted);
      set('[data-cms="thrift-donation-hours"]',  ts.donation_hours);
      set('[data-cms="thrift-shopping-hours"]',  ts.shopping_hours);
      set('[data-cms="thrift-contact-note"]',    ts.contact_note);
    }
  }

  /* ── CONTACT ────────────────────────────────────────── */
  function injectContact(c) {
    if (c.membership && c.membership.paragraphs) {
      c.membership.paragraphs.forEach((text, i) => {
        set(`[data-cms="contact-membership-${i}"]`, text);
      });
    }
  }

  /* ── BLOG ───────────────────────────────────────────── */
  function injectBlog(c) {
    const grid = document.getElementById('cms-blog-grid');
    if (!grid || !c.articles) return;
    grid.innerHTML = c.articles.map(a => {
      const imgSrc = a.image ? (base + a.image) : (base + 'images/26_05_18photos/congregation-seated-in-sanctuary.jpg');
      return `<div class="blog-card-visual">
        <div class="blog-card-img">
          <img src="${imgSrc}" alt="${a.title}" loading="lazy">
        </div>
        <div class="blog-card-content">
          <span class="date">${a.date}</span>
          <h3>${a.title}</h3>
          <p>${a.excerpt}</p>
          <a href="${a.url || '#'}" class="read-more">Read More &rarr;</a>
        </div>
      </div>`;
    }).join('');
  }

})();
