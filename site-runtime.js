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
            const pad = +(el.dataset.pad || 0);
            const start = performance.now();
            const animate = (time) => {
              const progress = Math.min(1, (time - start) / 1200);
              const val = Math.round(target * (1 - Math.pow(1 - progress, 3)));
              const numStr = pad ? String(val).padStart(pad, '0') : String(val);
              el.textContent = numStr + suffix;
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

  // 7. Portfolio & Branding index filtering & panel stack parallax
  function initPortfolioIndex() {
    const workIndex = document.getElementById('work-index') || document.getElementById('brand-index');
    if (!workIndex) return;

    const isBrandIndex = workIndex.id === 'brand-index';
    const pills = Array.from(workIndex.querySelectorAll('.pf-filters .t-pill'));
    const stack = workIndex.querySelector('.stack');
    const panels = stack ? Array.from(stack.querySelectorAll('.panel')) : [];
    const countLabel = workIndex.querySelector('.wh .lab');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let emptyBox = workIndex.querySelector('.pf-empty');
    if (stack && !emptyBox) {
      emptyBox = document.createElement('div');
      emptyBox.className = 'pad pf-empty';
      emptyBox.style.display = 'none';
      emptyBox.innerHTML = isBrandIndex
        ? '<p class="ser">No case studies in this category yet — <a href="/portfolio/" style="text-decoration:underline">view all product &amp; UX work</a>.</p>'
        : '<p class="ser">No case studies in this discipline yet — <a href="#expertise" style="text-decoration:underline">explore capabilities below</a> or <a href="/branding/" style="text-decoration:underline">view brand identity cases</a>.</p>';
      stack.parentNode.insertBefore(emptyBox, stack.nextSibling);
    }

    const getVisiblePanels = () => panels.filter((p) => p.style.display !== 'none');

    let panelTops = [];
    const measureTops = () => {
      panelTops = getVisiblePanels().map((el) => {
        const top = parseFloat(getComputedStyle(el).top);
        return !isNaN(top) && top > 0 ? top : 0.11 * window.innerHeight;
      });
    };

    let rafId = 0;
    const tickParallax = () => {
      rafId = requestAnimationFrame(tickParallax);
      const visible = getVisiblePanels();
      visible.forEach((el, idx) => {
        const baseTop = panelTops[idx] || 0;
        const delta = Math.max(-600, Math.min(600, el.getBoundingClientRect().top - baseTop));
        el.style.setProperty('--py', (-0.08 * delta).toFixed(1));
        el.style.setProperty('--pr', (0.015 * delta).toFixed(2));
        const nextEl = visible[idx + 1];
        if (!nextEl) {
          el.style.transform = '';
          return;
        }
        const overlap = Math.min(1, Math.max(0, 1 - (nextEl.getBoundingClientRect().top - baseTop) / el.offsetHeight));
        el.style.transform = 'scale(' + (1 - 0.05 * overlap).toFixed(3) + ')';
      });
    };

    if (!reducedMotion && panels.length > 0) {
      measureTops();
      window.addEventListener('resize', measureTops, { passive: true });
      rafId = requestAnimationFrame(tickParallax);
    }

    if (pills.length > 0 && panels.length > 0) {
      pills.forEach((pill) => {
        pill.addEventListener('click', () => {
          const category = pill.textContent.trim();
          const filterKey = (pill.dataset.filter || category).toLowerCase();
          const isAll = filterKey === 'all' || filterKey === 'all projects' || category === 'All' || category === 'All Projects';

          pills.forEach((p) => {
            const active = p === pill;
            p.classList.toggle('on', active);
            p.setAttribute('aria-selected', active ? 'true' : 'false');
          });

          let visibleCount = 0;
          panels.forEach((panel) => {
            const tags = (panel.dataset.tags || '').toLowerCase().split(/\s+/).filter(Boolean);
            const labText = (panel.querySelector('.lab')?.textContent || '').toLowerCase();
            const show = isAll || (tags.length > 0 ? tags.includes(filterKey) : labText.includes(filterKey));
            panel.style.display = show ? '' : 'none';
            if (show) {
              panel.classList.toggle('is-ind', visibleCount % 2 === 0);
              panel.classList.toggle('is-ink', visibleCount % 2 === 1);
              visibleCount++;
            }
          });

          if (stack) stack.style.display = visibleCount > 0 ? '' : 'none';
          if (emptyBox) emptyBox.style.display = visibleCount === 0 ? '' : 'none';
          if (countLabel) {
            const padded = String(visibleCount).padStart(2, '0');
            const unit = isBrandIndex
              ? (visibleCount === 1 ? 'project' : 'projects')
              : (visibleCount === 1 ? 'Project' : 'Projects');
            const defaultSuffix = isBrandIndex ? 'filter by category' : 'Explore by Discipline';
            countLabel.textContent = isAll
              ? `${padded} ${unit} · ${defaultSuffix}`
              : `${padded} ${unit} · ${category}`;
          }
          if (!reducedMotion) measureTops();
        });
      });
    }
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
    initPortfolioIndex();
  }
})();

