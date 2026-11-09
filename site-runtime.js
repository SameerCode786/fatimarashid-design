// site-runtime.js - Lightweight zero-crash interactive runtime for Fatima Rashid portfolio
(function () {
  'use strict';

  // 1. Preloader dismissal
  function initPreloader() {
    const pre = document.getElementById('uz-pre');
    const html = document.documentElement;
    if (!pre) {
      html.classList.remove('is-preloading');
      return;
    }

    const dismiss = () => {
      pre.classList.add('is-done');
      pre.setAttribute('aria-busy', 'false');
      html.classList.remove('is-preloading');
      try { sessionStorage.setItem('uz_pre_done', '1'); } catch (e) {}
      setTimeout(() => { if (pre.parentNode) pre.remove(); }, 500);
    };

    const seen = (() => {
      try { return sessionStorage.getItem('uz_pre_done') === '1'; } catch (e) { return false; }
    })();

    if (seen || html.classList.contains('pre-skip')) {
      dismiss();
    } else {
      setTimeout(dismiss, 500);
    }
  }

  // 2. Theme Toggle
  function initTheme() {
    const btn = document.getElementById('tg');
    const html = document.documentElement;

    const applyTheme = (theme) => {
      html.dataset.theme = theme;
      html.style.backgroundColor = theme === 'dark' ? '#111A15' : '#F8F6F0';
      try { localStorage.setItem('uz_theme', theme); } catch (e) {}
    };

    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const current = html.dataset.theme === 'dark' ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });
    }

    // Also support mobile menu theme toggle
    const moTheme = document.querySelector('.mo-theme');
    if (moTheme) {
      moTheme.addEventListener('click', (e) => {
        e.preventDefault();
        const current = html.dataset.theme === 'dark' ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });
    }
  }

  // 3. Dropdowns (Work & Services)
  function initDropdowns() {
    const items = document.querySelectorAll('.nav-item-dd');
    items.forEach((item) => {
      const trigger = item.querySelector('.nav-dd-trigger');
      const menu = item.querySelector('.nav-dropdown-menu');
      if (!trigger || !menu) return;

      const open = () => {
        trigger.setAttribute('aria-expanded', 'true');
        menu.classList.remove('is-closed');
      };
      const close = () => {
        trigger.setAttribute('aria-expanded', 'false');
        menu.classList.add('is-closed');
      };

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExp = trigger.getAttribute('aria-expanded') === 'true';
        if (isExp) close(); else open();
      });

      item.addEventListener('mouseenter', open);
      item.addEventListener('mouseleave', close);
    });

    document.addEventListener('click', () => {
      document.querySelectorAll('.nav-dropdown-menu').forEach((m) => m.classList.add('is-closed'));
      document.querySelectorAll('.nav-dd-trigger').forEach((t) => t.setAttribute('aria-expanded', 'false'));
    });
  }

  // 4. Mobile Menu
  function initMobileMenu() {
    const mn = document.getElementById('mn');
    const mo = document.getElementById('mo');
    if (!mn || !mo) return;

    mn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mo.classList.contains('open');
      if (isOpen) {
        mo.classList.remove('open');
        mn.classList.remove('is-open');
        mn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      } else {
        mo.classList.add('open');
        mn.classList.add('is-open');
        mn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      }
    });

    // Close when clicking a link inside mobile menu
    mo.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        mo.classList.remove('open');
        mn.classList.remove('is-open');
        mn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // 5. Scroll Reveals & Number Counter
  function initScrollAnimations() {
    const reveals = document.querySelectorAll('.rv');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('vis');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      reveals.forEach((el, idx) => {
        el.style.setProperty('--d', `${(idx % 4) * 0.08}s`);
        observer.observe(el);
      });

      // Number counters
      const numbers = document.querySelectorAll('[data-n]');
      const numObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            numObserver.unobserve(entry.target);
            const el = entry.target;
            const target = +(el.dataset.n || 0);
            const suffix = el.dataset.s || '';
            const start = performance.now();
            const animate = (time) => {
              const progress = Math.min(1, (time - start) / 1200);
              const val = Math.round(target * (1 - Math.pow(1 - progress, 3)));
              el.textContent = val + suffix;
              if (progress < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
          }
        });
      }, { threshold: 0.3 });

      numbers.forEach((n) => numObserver.observe(n));
    } else {
      reveals.forEach((el) => el.classList.add('vis'));
    }
  }

  // 6. Header scroll class
  function initHeaderScroll() {
    const header = document.querySelector('header.site-header');
    if (!header) return;
    const check = () => {
      if (window.scrollY > 12) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    };
    window.addEventListener('scroll', check, { passive: true });
    check();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    initPreloader();
    initTheme();
    initDropdowns();
    initMobileMenu();
    initScrollAnimations();
    initHeaderScroll();
  }
})();

