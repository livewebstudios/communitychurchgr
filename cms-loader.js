/**
 * CMS CONTENT LOADER — Community Church of Glen Rock
 * 
 * Reads JSON content files and injects them into the page.
 * Works at /newsite/ during build AND at / after go-live.
 * No path changes needed — uses relative URLs.
 * 
 * Usage: add <script src="cms-loader.js"></script> to every page.
 * Each page declares which content file it needs via a data attribute:
 *   <body data-content="home">     → loads _content/home.json
 *   <body data-content="about">    → loads _content/about.json
 *   etc.
 */

(async function() {
  const body = document.body;
  const contentKey = body.dataset.content;
  const settingsKey = 'settings';

  // Always load site settings (nav, footer, contact info)
  async function loadJSON(name) {
    try {
      const res = await fetch(`_content/${name}.json`);
      return await res.json();
    } catch(e) {
      console.warn(`Could not load _content/${name}.json`, e);
      return null;
    }
  }

  const [settings, content] = await Promise.all([
    loadJSON(settingsKey),
    contentKey ? loadJSON(contentKey) : Promise.resolve(null)
  ]);

  // Inject nav
  if (settings) {
    injectNav(settings);
    injectFooter(settings);
  }

  // Inject page content
  if (content && contentKey) {
    window[`PAGE_CONTENT`] = content;
    document.dispatchEvent(new CustomEvent('cms:ready', { detail: content }));
  }

  function injectNav(s) {
    const navEl = document.querySelector('[data-cms="nav-links"]');
    if (!navEl || !s.nav) return;
    navEl.innerHTML = s.nav.map(item =>
      `<a href="${item.url}">${item.label}</a>`
    ).join('');
  }

  function injectFooter(s) {
    const addr   = document.querySelector('[data-cms="footer-address"]');
    const phone  = document.querySelector('[data-cms="footer-phone"]');
    const email  = document.querySelector('[data-cms="footer-email"]');
    if (addr)  addr.textContent  = s.address;
    if (phone) phone.textContent = s.phone;
    if (email) email.textContent = s.email;
  }
})();
