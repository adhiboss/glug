/**
 * JAIN GLUG — Main JavaScript
 * Handles navigation drawer, active scroll-spy,
 * contact form validation, dynamic year, and Lenis + GSAP scroll animations.
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     1. DYNAMIC COPYRIGHT YEAR
     ========================================================================== */
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  /* ==========================================================================
     2. MOBILE NAVIGATION DRAWER
     ========================================================================== */
  const menuButton = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  const closeMenu = () => {
    if (!menuButton || !navLinks || !navLinks.classList.contains('open')) return;
    navLinks.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation menu');
  };

  if (menuButton && navLinks) {
    const toggleMenu = (open) => {
      const isOpen = open !== undefined ? open : !navLinks.classList.contains('open');
      navLinks.classList.toggle('open', isOpen);
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    };

    menuButton.addEventListener('click', () => toggleMenu());

    // Close menu when clicking any nav link
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => closeMenu());
    });

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        closeMenu();
        menuButton.focus();
      }
    });

    // Close when clicking outside header
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('open') && !e.target.closest('.site-header')) {
        closeMenu();
      }
    });
  }

  /* ==========================================================================
     3. SCROLL-SPY ACTIVE NAVIGATION LINK HIGHLIGHTING
     ========================================================================== */
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a:not(.nav-cta)');

  if (sections.length > 0 && navItems.length > 0 && 'IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const activeId = entry.target.getAttribute('id');
          navItems.forEach((link) => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === `#${activeId}`);
          });
        }
      });
    }, observerOptions);

    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ==========================================================================
     4. CONTACT FORM VALIDATION & CLIENT-SIDE FEEDBACK
     ========================================================================== */
  const contactForm = document.getElementById('contact-form');
  const formFeedback = document.getElementById('form-feedback');

  if (contactForm && formFeedback) {
    const nameInput = document.getElementById('form-name');
    const emailInput = document.getElementById('form-email');
    const purposeSelect = document.getElementById('form-purpose');
    const messageInput = document.getElementById('form-message');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validateField = (input, condition) => {
      const parent = input.closest('.form-group');
      if (!condition) {
        parent.classList.add('has-error');
        return false;
      }
      parent.classList.remove('has-error');
      return true;
    };

    nameInput?.addEventListener('blur', () => {
      validateField(nameInput, nameInput.value.trim().length > 0);
    });

    emailInput?.addEventListener('blur', () => {
      validateField(emailInput, emailRegex.test(emailInput.value.trim()));
    });

    purposeSelect?.addEventListener('change', () => {
      validateField(purposeSelect, purposeSelect.value !== '');
    });

    messageInput?.addEventListener('blur', () => {
      validateField(messageInput, messageInput.value.trim().length > 3);
    });

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const isNameValid = validateField(nameInput, nameInput.value.trim().length > 0);
      const isEmailValid = validateField(emailInput, emailRegex.test(emailInput.value.trim()));
      const isPurposeValid = validateField(purposeSelect, purposeSelect.value !== '');
      const isMessageValid = validateField(messageInput, messageInput.value.trim().length > 3);

      if (!isNameValid || !isEmailValid || !isPurposeValid || !isMessageValid) {
        formFeedback.className = 'form-feedback';
        formFeedback.style.display = 'none';

        const firstInvalid = contactForm.querySelector(
          '.form-group.has-error input, .form-group.has-error select, .form-group.has-error textarea'
        );
        firstInvalid?.focus();
        return;
      }

      const submitBtn = contactForm.querySelector('.button-submit');
      const submitBtnLabel = submitBtn?.querySelector('span');
      const originalBtnText = submitBtnLabel ? submitBtnLabel.textContent : 'Send Message';
      const userName = nameInput.value.trim();
      const userEmail = emailInput.value.trim();
      const deptInput = document.getElementById('form-dept');
      const userDept = deptInput ? deptInput.value.trim() : '';
      const purposeText = purposeSelect.options[purposeSelect.selectedIndex]?.text || purposeSelect.value;
      const userMessage = messageInput.value.trim();
      const recipientEmail = 'adithyagowdaadhi9@gmail.com';

      if (submitBtn) submitBtn.disabled = true;
      if (submitBtnLabel) submitBtnLabel.textContent = 'Sending...';

      formFeedback.className = 'form-feedback';
      formFeedback.style.display = 'none';

      try {
        const response = await fetch(`https://formsubmit.co/ajax/${recipientEmail}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: userName,
            email: userEmail,
            department: userDept || 'Not specified',
            purpose: purposeText,
            message: userMessage,
            _replyto: userEmail,
            _subject: `JAIN GLUG Inquiry: ${purposeText}`,
            _template: 'table'
          })
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.success === false || data.success === 'false') {
          throw new Error(data.message || 'Unable to submit via FormSubmit right now.');
        }

        formFeedback.className = 'form-feedback success';
        formFeedback.style.display = '';
        formFeedback.innerHTML = `Thank you, <strong>${escapeHtml(userName)}</strong>! Your inquiry has been sent to <strong>${recipientEmail}</strong>.`;

        contactForm.reset();
        contactForm.querySelectorAll('.form-group').forEach((grp) => grp.classList.remove('has-error'));
      } catch (err) {
        const subject = encodeURIComponent(`JAIN GLUG Inquiry: ${purposeText}`);
        const body = encodeURIComponent(
          `Name: ${userName}\nEmail: ${userEmail}\nDepartment: ${userDept || 'N/A'}\nTopic: ${purposeText}\n\n${userMessage}`
        );
        formFeedback.className = 'form-feedback error';
        formFeedback.style.display = '';
        formFeedback.innerHTML = `Could not send automatically (${escapeHtml(err.message)}). You can <a href="mailto:${recipientEmail}?subject=${subject}&body=${body}">send directly via email</a>.`;
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (submitBtnLabel) submitBtnLabel.textContent = originalBtnText;
        formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  /* ==========================================================================
     5. ACCORDION (SINGLE OPEN HELPER)
     ========================================================================== */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        faqItems.forEach((other) => {
          if (other !== item && other.open) {
            other.removeAttribute('open');
          }
        });
      }
    });
  });

  /* ==========================================================================
     6. LENIS SMOOTH SCROLL + GSAP SCROLLTRIGGER REVEALS
     ========================================================================== */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion && typeof Lenis !== 'undefined' && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1
    });

    gsap.registerPlugin(ScrollTrigger);

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Subtle upward fade-in reveals for marked sections/blocks
    gsap.utils.toArray('.reveal').forEach((element) => {
      gsap.from(element, {
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: 'power3.out',
        clearProps: 'transform',
        scrollTrigger: {
          trigger: element,
          start: 'top 86%',
          toggleActions: 'play none none reverse'
        }
      });
    });

    // Soft Lenis scroll for in-page anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#') return;

        if (targetId === '#top') {
          e.preventDefault();
          closeMenu();
          lenis.scrollTo(0);
          return;
        }

        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          closeMenu();
          lenis.scrollTo(targetEl, { offset: -78 });
        }
      });
    });

    ScrollTrigger.refresh();
    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });
  }

  /* Helper to escape HTML characters */
  function escapeHtml(string) {
    const div = document.createElement('div');
    div.textContent = string;
    return div.innerHTML;
  }
});
