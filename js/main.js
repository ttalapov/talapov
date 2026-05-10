/**
 * Резюме-лендінг — Талапов Т. К.
 * Vanilla JavaScript, без залежностей
 */

(() => {
  'use strict';

  /* ============================================
     1. Sticky header — додаємо тінь при скролі
     ============================================ */
  const header = document.querySelector('.header');
  const handleHeaderScroll = () => {
    if (window.scrollY > 8) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  /* ============================================
     2. Mobile nav toggle
     ============================================ */
  const navToggle = document.querySelector('.nav__toggle');
  const navList = document.querySelector('.nav__list');

  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.classList.toggle('is-open');
      navList.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Закриваємо меню при кліку на посилання (на мобільних)
    navList.querySelectorAll('.nav__link').forEach((link) => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('is-open');
        navList.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Закриваємо при кліку поза меню
    document.addEventListener('click', (e) => {
      if (
        navList.classList.contains('is-open') &&
        !navList.contains(e.target) &&
        !navToggle.contains(e.target)
      ) {
        navToggle.classList.remove('is-open');
        navList.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ============================================
     3. Smooth scroll для всіх anchor-посилань
     (з компенсацією висоти sticky-хедера)
     ============================================ */
  const headerHeight = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--header-height'),
    10
  ) || 68;

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#' || targetId.length < 2) return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ============================================
     4. Reveal-анімація при скролі (IntersectionObserver)
     ============================================ */
  const reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && reveals.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    reveals.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback — показуємо все
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ============================================
     5. Фільтр публікацій
     ============================================ */
  const filterButtons = document.querySelectorAll('.pubs__filter');
  const pubCards = document.querySelectorAll('.pub-card');

  if (filterButtons.length > 0 && pubCards.length > 0) {
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        // Активна кнопка
        filterButtons.forEach((b) => {
          b.classList.remove('is-active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');

        // Фільтрування карток
        pubCards.forEach((card) => {
          const type = card.dataset.type;
          const matches = filter === 'all' || type === filter;

          if (matches) {
            card.style.display = '';
            // Невелика fade-in для UX
            requestAnimationFrame(() => {
              card.style.opacity = '1';
            });
          } else {
            card.style.opacity = '0';
            setTimeout(() => {
              if (btn.classList.contains('is-active') && btn.dataset.filter === filter) {
                card.style.display = 'none';
              }
            }, 200);
          }
        });
      });
    });
  }

  /* ============================================
     6. Підсвічування активної секції в навігації
     ============================================ */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  if (sections.length > 0 && navLinks.length > 0 && 'IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((link) => {
              const isActive = link.getAttribute('href') === `#${id}`;
              link.classList.toggle('nav__link--active', isActive);
            });
          }
        });
      },
      {
        rootMargin: `-${headerHeight + 40}px 0px -55% 0px`,
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ============================================
     7. Лічильник років досвіду (динамічно)
     ============================================ */
  const yearsCounter = document.querySelector('[data-years-since]');
  if (yearsCounter) {
    const startYear = parseInt(yearsCounter.dataset.yearsSince, 10);
    const currentYear = new Date().getFullYear();
    const years = currentYear - startYear;
    yearsCounter.textContent = `${years}+`;
  }
})();
