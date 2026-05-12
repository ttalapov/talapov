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
     Округлюється донизу до найближчого кратного 5:
     20–24 → 20+, 25–29 → 25+ і т.д.
     ============================================ */
  const yearsCounter = document.querySelector('[data-years-since]');
  if (yearsCounter) {
    const startYear = parseInt(yearsCounter.dataset.yearsSince, 10);
    const currentYear = new Date().getFullYear();
    const rawYears = currentYear - startYear;
    const roundedYears = Math.floor(rawYears / 5) * 5;
    yearsCounter.textContent = `${roundedYears}+`;
  }

  /* ============================================
     8. Округлення довільних статистичних чисел
     донизу до кратного 5. Помічаємо елементи
     атрибутом data-round-floor5.
     14 → 10+, 15+ → 15+, 27 → 25+ і т.д.
     ============================================ */
  document.querySelectorAll('[data-round-floor5]').forEach((el) => {
    const match = el.textContent.match(/(\d+)/);
    if (!match) return;
    const num = parseInt(match[1], 10);
    const rounded = Math.floor(num / 5) * 5;
    el.textContent = `${rounded}+`;
  });

  /* ============================================
     9. Count-up анімація для Hero-статистики
     Запускається коли блок з'являється в полі зору.
     Поважає prefers-reduced-motion.
     ============================================ */
  const statValues = document.querySelectorAll('.hero__stat-value');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (statValues.length > 0 && 'IntersectionObserver' in window && !prefersReducedMotion) {
    // Зберігаємо цільове значення і чи має суфікс "+"
    const targets = Array.from(statValues).map((el) => {
      const text = el.textContent.trim();
      const match = text.match(/(\d+)/);
      const target = match ? parseInt(match[1], 10) : 0;
      const hasPlus = text.includes('+');
      return { el, target, hasPlus, animated: false };
    });

    // Стартові значення — показуємо "0" одразу, щоб уникнути миготіння
    targets.forEach((t) => {
      t.el.textContent = t.hasPlus ? '0+' : '0';
    });

    // easeOutQuart — швидкий старт, плавне завершення
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const animateCount = (item) => {
      if (item.animated) return;
      item.animated = true;

      const duration = 1600; // 1.6 секунди
      const start = performance.now();

      const tick = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutQuart(progress);
        const current = Math.round(item.target * eased);
        item.el.textContent = item.hasPlus ? `${current}+` : `${current}`;

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          // Фінальне значення — гарантовано точне
          item.el.textContent = item.hasPlus ? `${item.target}+` : `${item.target}`;
        }
      };

      requestAnimationFrame(tick);
    };

    // Спостерігаємо за контейнером hero__stats — анімуємо всі цифри разом
    const statsContainer = document.querySelector('.hero__stats');
    if (statsContainer) {
      const statsObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              targets.forEach((item, idx) => {
                // Невелика затримка між цифрами для каскадного ефекту
                setTimeout(() => animateCount(item), idx * 120);
              });
              statsObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );

      statsObserver.observe(statsContainer);
    }
  }
})();
