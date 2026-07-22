const header = document.querySelector('#site-header');
const menuToggle = document.querySelector('#menu-toggle');
const mainNav = document.querySelector('#main-nav');
const navLinks = [...document.querySelectorAll('.main-nav a')];
const sections = [...document.querySelectorAll('main section[id]')];

function closeMenu() {
  mainNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  menuToggle.querySelector('i').className = 'bx bx-menu';
  document.body.classList.remove('menu-open');
}

menuToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  menuToggle.querySelector('i').className = isOpen ? 'bx bx-x' : 'bx bx-menu';
  document.body.classList.toggle('menu-open', isOpen);
});

navLinks.forEach((link) => link.addEventListener('click', closeMenu));

document.addEventListener('click', (event) => {
  if (!mainNav.classList.contains('open')) return;
  if (!mainNav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

function updateHeader() {
  header.classList.toggle('scrolled', window.scrollY > 24);
}

function updateActiveLink() {
  const marker = window.scrollY + window.innerHeight * 0.32;
  let activeId = 'home';

  sections.forEach((section) => {
    if (marker >= section.offsetTop) activeId = section.id;
  });

  navLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
  });
}

window.addEventListener('scroll', () => {
  updateHeader();
  updateActiveLink();
}, { passive: true });

updateHeader();
updateActiveLink();

const revealItems = document.querySelectorAll('.reveal');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });

  revealItems.forEach((item) => revealObserver.observe(item));
}

function setupRevealToggle(buttonId, selector, openText, closeText) {
  const button = document.querySelector(buttonId);
  const items = [...document.querySelectorAll(selector)];
  if (!button || items.length === 0) return;

  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    items.forEach((item) => {
      item.hidden = expanded;
      if (!expanded) item.classList.add('is-visible');
    });

    button.setAttribute('aria-expanded', String(!expanded));
    button.innerHTML = `${expanded ? openText : closeText} <i class="bx ${expanded ? 'bx-chevron-down' : 'bx-chevron-up'}" aria-hidden="true"></i>`;
  });
}

setupRevealToggle('#certificate-toggle', '.certificate-extra', 'Show all certificates', 'Show fewer certificates');
setupRevealToggle('#project-toggle', '.project-extra', 'Show all projects', 'Show fewer projects');

document.querySelector('#current-year').textContent = new Date().getFullYear();
