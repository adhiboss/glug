/**
 * JAIN GLUG — Main JavaScript
 * Handles navigation drawer, active scroll-spy, event filter tabs,
 * interactive contact form validation, and dynamic year.
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

  if (menuButton && navLinks) {
    const toggleMenu = (open) => {
      const isOpen = open !== undefined ? open : !navLinks.classList.contains('open');
      navLinks.classList.toggle('open', isOpen);
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Toggle navigation menu');
    };

    menuButton.addEventListener('click', () => toggleMenu());

    // Close menu when clicking any nav anchor link
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (navLinks.classList.contains('open')) {
          toggleMenu(false);
        }
      });
    });

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        toggleMenu(false);
        menuButton.focus();
      }
    });

    // Close when clicking outside header
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('open') && !e.target.closest('.site-header')) {
        toggleMenu(false);
      }
    });
  }

  /* ==========================================================================
     3. SCROLL-SPY ACTIVE NAVIGATION LINK HIGHLIGHTING
     ========================================================================== */
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a:not(.nav-cta)');

  if (sections.length > 0 && navItems.length > 0) {
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
            if (href === `#${activeId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ==========================================================================
     4. EVENTS FILTER TABS
     ========================================================================== */
  const eventTabs = document.querySelectorAll('.event-tab');
  const eventCards = document.querySelectorAll('.event-card');

  if (eventTabs.length > 0 && eventCards.length > 0) {
    eventTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const filter = tab.getAttribute('data-filter');

        // Update active tab button
        eventTabs.forEach((t) => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        // Filter event cards
        eventCards.forEach((card) => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /* ==========================================================================
     5. CONTACT FORM VALIDATION & CLIENT-SIDE FEEDBACK
     ========================================================================== */
  const contactForm = document.getElementById('contact-form');
  const formFeedback = document.getElementById('form-feedback');

  if (contactForm) {
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
      } else {
        parent.classList.remove('has-error');
        return true;
      }
    };

    // Live validation on blur
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
      validateField(messageInput, messageInput.value.trim().length > 5);
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const isNameValid = validateField(nameInput, nameInput.value.trim().length > 0);
      const isEmailValid = validateField(emailInput, emailRegex.test(emailInput.value.trim()));
      const isPurposeValid = validateField(purposeSelect, purposeSelect.value !== '');
      const isMessageValid = validateField(messageInput, messageInput.value.trim().length > 5);

      if (isNameValid && isEmailValid && isPurposeValid && isMessageValid) {
        // Display polite success confirmation
        const userName = nameInput.value.trim();
        formFeedback.className = 'form-feedback success';
        formFeedback.innerHTML = `✓ Thank you, <strong>${escapeHtml(userName)}</strong>! Your inquiry has been noted. A JAIN GLUG coordinator will respond to your email shortly.`;

        // Reset form inputs
        contactForm.reset();

        // Remove any remnant error classes
        document.querySelectorAll('.form-group').forEach((grp) => grp.classList.remove('has-error'));

        // Scroll smoothly to feedback message
        formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        formFeedback.className = 'form-feedback';
        formFeedback.style.display = 'none';

        // Focus first invalid element
        const firstInvalid = contactForm.querySelector('.form-group.has-error input, .form-group.has-error select, .form-group.has-error textarea');
        firstInvalid?.focus();
      }
    });
  }

  /* ==========================================================================
     6. ACCESSIBLE ACCORDION HELPER (OPTIONAL SINGLE OPEN BEHAVIOR)
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
     HELPER: ESCAPE HTML TO PREVENT XSS IN DOM INJECTION
     ========================================================================== */
  function escapeHtml(string) {
    const div = document.createElement('div');
    div.textContent = string;
    return div.innerHTML;
  }
});
