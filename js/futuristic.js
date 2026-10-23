
(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const header = $('#site-header');
  const progress = $('#reading-progress');
  const menu = $('#menu-toggle');
  const nav = $('#site-nav');

  // Scroll progress and compact header. No third-party JS needed.
  let ticking = false;
  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    header.classList.toggle('is-scrolled', window.scrollY > 24);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateScroll);
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  updateScroll();

  menu.addEventListener('click', () => {
    const isOpen = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!isOpen));
    menu.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
    nav.classList.toggle('is-open', !isOpen);
  });
  $$('#site-nav a').forEach(a => a.addEventListener('click', () => {
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open menu');
    nav.classList.remove('is-open');
  }));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      menu.click(); menu.focus();
    }
  });

  // Reveal content with IntersectionObserver; supports reduced-motion users.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reducedMotion) {
    const reveals = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -30px 0px', threshold: 0.035 });
    $$('.reveal').forEach(el => reveals.observe(el));
    // Expose for cards made visible later.
    window.portfolioReveal = el => { if (!el.classList.contains('in-view')) reveals.observe(el); };
  } else {
    $$('.reveal').forEach(el => el.classList.add('in-view'));
    window.portfolioReveal = el => el.classList.add('in-view');
  }

  // Highlight navigation sections based on actual visible section.
  const sections = $$('main section[id]');
  const navLinks = $$('#site-nav a');
  if ('IntersectionObserver' in window) {
    const activeObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting);
      if (!visible.length) return;
      visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      const sectionId = visible[0].target.id;
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + sectionId));
    }, { rootMargin: '-20% 0px -55% 0px', threshold: [0, .1, .25, .5, .75] });
    sections.forEach(section => activeObserver.observe(section));
  }

  // Filtering preserves the initial six-card preview and expands on request.
  const projectCards = $$('#projects-grid .project-card');
  const filterButtons = $$('.filter-btn');
  const showProjects = $('#show-projects');
  const noProjects = $('#no-projects');
  let selectedCategory = 'all';
  let expandedProjects = false;
  const updateProjects = () => {
    let count = 0;
    const matches = projectCards.filter(card => selectedCategory === 'all' || card.dataset.category === selectedCategory);
    projectCards.forEach(card => {
      const matching = matches.includes(card);
      const shown = matching && (expandedProjects || count < 6);
      if (matching) count++;
      card.hidden = !shown;
      if (shown) window.portfolioReveal(card);
    });
    noProjects.hidden = matches.length > 0;
    showProjects.hidden = matches.length <= 6;
    showProjects.innerHTML = expandedProjects ? 'Show fewer projects <span>↑</span>' : `Show all ${matches.length} projects <span>↓</span>`;
    showProjects.setAttribute('aria-expanded', String(expandedProjects));
  };
  filterButtons.forEach(button => button.addEventListener('click', () => {
    selectedCategory = button.dataset.filter;
    expandedProjects = false;
    filterButtons.forEach(btn => {
      const active = btn === button;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    updateProjects();
  }));
  showProjects.addEventListener('click', () => {
    expandedProjects = !expandedProjects;
    updateProjects();
  });
  updateProjects();

  const showCerts = $('#show-certificates');
  const certificateRows = $$('#cert-list .cert-row');
  let expandedCerts = false;
  const updateCerts = () => {
    certificateRows.forEach((row, index) => {
      row.hidden = !expandedCerts && index >= 5;
    });
    showCerts.innerHTML = expandedCerts ? 'Show fewer certificates <span>↑</span>' : 'Show all certificates <span>↓</span>';
    showCerts.setAttribute('aria-expanded', String(expandedCerts));
  };
  showCerts.addEventListener('click', () => { expandedCerts = !expandedCerts; updateCerts(); });
  updateCerts();
  // Graceful fallback if a published image cannot be fetched (e.g. offline preview).
  $$('.hero-portrait, .about-image-wrap img, .project-media img').forEach(img => {
    let handled = false;
    const fallback = () => {
      if (handled) return;
      handled = true;
      img.style.display = 'none';
      const holder = img.parentElement;
      const label = document.createElement('span');
      label.className = 'image-fallback';
      label.textContent = img.classList.contains('hero-portrait') || holder.classList.contains('about-image-wrap')
        ? 'JA.'
        : img.alt.replace(' project preview', '');
      label.setAttribute('aria-hidden', 'true');
      holder.appendChild(label);
    };
    img.addEventListener('error', fallback, { once: true });
    if (img.complete && img.naturalWidth === 0) fallback();
  });

  $('#year').textContent = String(new Date().getFullYear());
})();

