/* nav.js — Sticky nav + dropdowns + hamburger
   Community Church of Glen Rock */

(function () {
  'use strict';

  var header = document.getElementById('site-header');
  var toggle = document.querySelector('.nav-toggle');
  var menu   = document.querySelector('.nav-menu');
  var dropdowns = document.querySelectorAll('.has-dropdown');

  /* ---- Sticky shadow on scroll ---- */
  function onScroll() {
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Hamburger toggle ---- */
  if (toggle) {
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      toggle.classList.toggle('active');
      menu.classList.toggle('open');
    });
  }

  /* ---- Mobile dropdown tap-to-expand + aria-expanded ---- */
  dropdowns.forEach(function (item) {
    var link = item.querySelector('.nav-link');
    /* Mark dropdown parent links for screen readers */
    link.setAttribute('aria-expanded', 'false');
    link.setAttribute('aria-haspopup', 'true');

    link.addEventListener('click', function (e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        var isOpen = item.classList.toggle('open');
        link.setAttribute('aria-expanded', String(isOpen));
        /* close sibling dropdowns */
        dropdowns.forEach(function (other) {
          if (other !== item) {
            other.classList.remove('open');
            other.querySelector('.nav-link').setAttribute('aria-expanded', 'false');
          }
        });
      }
    });
  });

  /* ---- Close mobile menu on outside click ---- */
  document.addEventListener('click', function (e) {
    if (menu && menu.classList.contains('open')) {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.classList.remove('open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      }
    }
  });

  /* ---- Close mobile menu on resize past breakpoint ---- */
  window.addEventListener('resize', function () {
    if (window.innerWidth > 768 && menu.classList.contains('open')) {
      menu.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      dropdowns.forEach(function (d) { d.classList.remove('open'); });
    }
  });

  /* ---- Scroll reveal animations ---- */
  var reveals = document.querySelectorAll('.reveal, .reveal-stagger');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion) {
    reveals.forEach(function (el) {
      el.classList.add('visible');
    });
  } else if (reveals.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });

    reveals.forEach(function (el) { observer.observe(el); });
  } else if (reveals.length) {
    /* No IntersectionObserver (very old browsers): show content */
    reveals.forEach(function (el) {
      el.classList.add('visible');
    });
  }

})();
