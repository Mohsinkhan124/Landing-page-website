/* ==========================================================================
   Aurelia Estates — script.js
   Vanilla JS + GSAP / ScrollTrigger. Organized into small, reusable
   functions and initialised once the DOM is ready.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  initPreloader();
  initScrollProgress();
  initNavbar();
  initMobileMenu();
  initHeroAnimations();
  initParallax();
  initScrollReveals();
  initCounters();
  initPropertyCardHovers();
  initFavoriteButtons();
  initTestimonialSlider();
  initFaqAccordion();
  initBackToTop();
  initSmoothAnchors();
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------ *
   * Preloader — plays once on first load, then reveals the page with
   * a short staged fade so the hero doesn't just "pop" in.
   * ------------------------------------------------------------------ */
  function initPreloader() {
    const preloader = document.getElementById('preloader');
    const fill = document.querySelector('.preloader-bar-fill');

    const tl = gsap.timeline({
      onComplete: () => {
        preloader.style.pointerEvents = 'none';
      }
    });

    tl.to(fill, { width: '100%', duration: 1.1, ease: 'power2.inOut' })
      .to('.preloader-mark', { y: -14, opacity: 0, duration: 0.5, ease: 'power2.in' })
      .to(preloader, { yPercent: -100, duration: 0.7, ease: 'power3.inOut' }, '-=0.15')
      .from('#navbar', { y: -30, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.5')
      .add(playHeroReveal, '-=0.4');
  }

  /* ------------------------------------------------------------------ *
   * Hero text reveal — headline lines slide up from behind a mask,
   * followed by the description, CTAs, floating card and search bar.
   * ------------------------------------------------------------------ */
  function playHeroReveal() {
    const tl = gsap.timeline();

    tl.from('.hero-reveal-line', { yPercent: 120, duration: 0.7, ease: 'power3.out' })
      .from('.hero-line-inner', {
        yPercent: 120,
        duration: 0.9,
        ease: 'power4.out',
        stagger: 0.12
      }, '-=0.4')
      .to('.hero-fade', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.15
      }, '-=0.5')
      .from('.float-card', {
        opacity: 0,
        y: 40,
        scale: 0.92,
        duration: 0.8,
        ease: 'back.out(1.6)'
      }, '-=0.6')
      .from('#scroll-indicator', { opacity: 0, y: -10, duration: 0.6 }, '-=0.3');
  }

  function initHeroAnimations() {
    gsap.set('.hero-fade', { y: 20 });
    // Gentle continuous float for the stats card
    if (!prefersReducedMotion) {
      gsap.to('.float-card', {
        y: -14,
        duration: 2.6,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 2
      });
    }
  }

  /* ------------------------------------------------------------------ *
   * Parallax hero image — moves slower than scroll for depth.
   * ------------------------------------------------------------------ */
  function initParallax() {
    if (prefersReducedMotion) return;
    const heroImg = document.getElementById('hero-img');
    if (!heroImg) return;

    gsap.to(heroImg, {
      yPercent: 15,
      ease: 'none',
      scrollTrigger: {
        trigger: '#home',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * Navbar — becomes solid/blurred once the user scrolls past the hero.
   * ------------------------------------------------------------------ */
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    ScrollTrigger.create({
      start: 'top -80',
      end: 99999,
      onUpdate: (self) => {
        navbar.classList.toggle('nav-scrolled', self.scroll() > 80);
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * Mobile hamburger menu
   * ------------------------------------------------------------------ */
  function initMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');
    const links = menu.querySelectorAll('.mobile-link, .btn-primary');

    function closeMenu() {
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      menu.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    links.forEach((link) => link.addEventListener('click', closeMenu));
  }

  /* ------------------------------------------------------------------ *
   * Scroll-triggered reveals — fade/slide/scale/stagger for every
   * section. Uses shared utility classes so new sections opt in for
   * free by adding a class name.
   * ------------------------------------------------------------------ */
  function initScrollReveals() {
    const revealConfigs = [
      { selector: '.reveal-up', vars: { y: 50, opacity: 0 } },
      { selector: '.reveal-left', vars: { x: -60, opacity: 0 } },
      { selector: '.reveal-right', vars: { x: 60, opacity: 0 } }
    ];

    revealConfigs.forEach(({ selector, vars }) => {
      document.querySelectorAll(selector).forEach((el) => {
        gsap.fromTo(el, vars, {
          y: 0,
          x: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none reverse'
          }
        });
      });
    });

    // Staggered grids: property cards, feature cards, service cards
    staggerGroup('#property-grid .property-card');
    staggerGroup('.feature-card', '.grid');
    staggerGroup('.service-card', '.grid');

    function staggerGroup(itemSelector, containerSelector) {
      const items = document.querySelectorAll(itemSelector);
      if (!items.length) return;
      gsap.fromTo(items,
        { y: 60, opacity: 0, scale: 0.96 },
        {
          y: 0, opacity: 1, scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: items[0].closest(containerSelector || 'section'),
            start: 'top 82%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }
  }

  /* ------------------------------------------------------------------ *
   * Animated counters — count up when scrolled into view.
   * ------------------------------------------------------------------ */
  function initCounters() {
    document.querySelectorAll('.counter').forEach((counter) => {
      const target = parseInt(counter.dataset.target, 10) || 0;
      const obj = { val: 0 };

      ScrollTrigger.create({
        trigger: counter,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: target,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: () => { counter.textContent = Math.round(obj.val).toLocaleString(); }
          });
        }
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Property card image zoom is handled purely via CSS (:hover), but we
   * add a subtle tilt-lift using GSAP for a more premium feel.
   * ------------------------------------------------------------------ */
  function initPropertyCardHovers() {
    if (prefersReducedMotion) return;
    document.querySelectorAll('.property-card').forEach((card) => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { duration: 0.4, ease: 'power2.out' });
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Favorite (heart) buttons on property cards
   * ------------------------------------------------------------------ */
  function initFavoriteButtons() {
    document.querySelectorAll('.fav-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const isActive = btn.classList.toggle('active');
        btn.setAttribute('aria-pressed', String(isActive));
        gsap.fromTo(btn, { scale: 0.7 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' });
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Testimonial auto-slider with dots + smooth transitions
   * ------------------------------------------------------------------ */
  function initTestimonialSlider() {
    const track = document.getElementById('testimonial-slides');
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('#testimonial-dots .dot');
    if (!track || !slides.length) return;

    let index = 0;
    let autoplay;

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((dot, d) => dot.classList.toggle('active', d === index));
    }

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        goTo(parseInt(dot.dataset.index, 10));
        restartAutoplay();
      });
    });

    function startAutoplay() {
      autoplay = setInterval(() => goTo(index + 1), 5000);
    }
    function restartAutoplay() {
      clearInterval(autoplay);
      startAutoplay();
    }

    goTo(0);
    startAutoplay();
  }

  /* ------------------------------------------------------------------ *
   * FAQ accordion — single-open pattern with animated max-height
   * ------------------------------------------------------------------ */
  function initFaqAccordion() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach((item) => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');

      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        items.forEach((other) => {
          other.classList.remove('open');
          other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-answer').style.maxHeight = null;
        });

        if (!isOpen) {
          item.classList.add('open');
          question.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = answer.scrollHeight + 24 + 'px';
        }
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Scroll progress bar across the top of the viewport
   * ------------------------------------------------------------------ */
  function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = progress + '%';
    }, { passive: true });
  }

  /* ------------------------------------------------------------------ *
   * Back-to-top button
   * ------------------------------------------------------------------ */
  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });

    btn.addEventListener('click', () => {
      // Animate a proxy value and drive window.scrollTo — avoids needing
      // the paid ScrollToPlugin while still giving an eased scroll.
      const start = window.scrollY;
      gsap.to({ y: start }, {
        y: 0,
        duration: 1,
        ease: 'power3.inOut',
        onUpdate: function () {
          window.scrollTo(0, this.targets()[0].y);
        }
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Smooth-scroll for in-page anchor links (native smooth-scroll is set
   * via CSS, this just ensures the fixed navbar offset is respected)
   * ------------------------------------------------------------------ */
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const id = anchor.getAttribute('href');
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const offset = 90;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }
});
