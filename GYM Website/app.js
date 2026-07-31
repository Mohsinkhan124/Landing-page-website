 // ---------- Sticky navbar background on scroll ----------
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('bg-bg/90', 'backdrop-blur', 'border-border');
      navbar.classList.remove('border-border/0');
    } else {
      navbar.classList.remove('bg-bg/90', 'backdrop-blur', 'border-border');
      navbar.classList.add('border-border/0');
    }

    // Back to top visibility
    if (window.scrollY > 500) {
      backToTop.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
    } else {
      backToTop.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
    }
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---------- Mobile hamburger menu ----------
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  let menuOpen = false;

  function toggleMenu(forceClose = false) {
    menuOpen = forceClose ? false : !menuOpen;
    menuBtn.setAttribute('aria-expanded', String(menuOpen));
    menuBtn.innerHTML = menuOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    mobileMenu.classList.toggle('translate-x-full', !menuOpen);
  }

  menuBtn.addEventListener('click', () => toggleMenu());
  mobileLinks.forEach(link => link.addEventListener('click', () => toggleMenu(true)));

  // ---------- Scroll reveal animations ----------
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  // ---------- FAQ accordion ----------
  document.querySelectorAll('.faq-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const content = item.querySelector('.faq-content');
      const icon = btn.querySelector('i');
      const isOpen = content.style.maxHeight && content.style.maxHeight !== '0px';

      // Close all other items
      document.querySelectorAll('.faq-content').forEach(c => { if (c !== content) c.style.maxHeight = '0px'; });
      document.querySelectorAll('.faq-toggle i').forEach(i => { if (i !== icon) i.style.transform = 'rotate(0deg)'; });

      if (isOpen) {
        content.style.maxHeight = '0px';
        icon.style.transform = 'rotate(0deg)';
      } else {
        content.style.maxHeight = content.scrollHeight + 'px';
        icon.style.transform = 'rotate(45deg)';
      }
    });
  });

  // ---------- BMI Calculator ----------
  const bmiForm = document.getElementById('bmiForm');
  const bmiResult = document.getElementById('bmiResult');
  const bmiCategory = document.getElementById('bmiCategory');
  const bmiError = document.getElementById('bmiError');

  bmiForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const heightCm = parseFloat(document.getElementById('heightInput').value);
    const weightKg = parseFloat(document.getElementById('weightInput').value);

    if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
      bmiError.classList.remove('hidden');
      return;
    }
    bmiError.classList.add('hidden');

    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    const rounded = bmi.toFixed(1);

    let category, colorClass;
    if (bmi < 18.5) { category = 'Underweight'; colorClass = 'text-blue-400'; }
    else if (bmi < 25) { category = 'Normal weight'; colorClass = 'text-green-400'; }
    else if (bmi < 30) { category = 'Overweight'; colorClass = 'text-yellow-400'; }
    else { category = 'Obese'; colorClass = 'text-red-400'; }

    bmiResult.textContent = rounded;
    bmiCategory.textContent = category;
    bmiCategory.className = 'font-semibold ' + colorClass;
  });

  // ---------- Contact form (front-end only demo) ----------
  const contactForm = document.getElementById('contactForm');
  const contactSuccess = document.getElementById('contactSuccess');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    contactSuccess.classList.remove('hidden');
    contactForm.reset();
    setTimeout(() => contactSuccess.classList.add('hidden'), 5000);
  });

  // ---------- Footer year ----------
  document.getElementById('year').textContent = new Date().getFullYear();