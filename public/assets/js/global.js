/**
 * Claymore & Colt Holdings - Global JavaScript
 * Version 1.0
 * © 2026 Claymore & Colt Holdings LLC
 */

/* ================================
   INITIALIZATION
   ================================ */

(function() {
  'use strict';

  // Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initSmoothScroll();
    initActiveNavigation();
    initHeaderScroll();
    initFormValidation();
  });

  /* ================================
     MOBILE MENU FUNCTIONALITY
     ================================ */

  function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navDrawer = document.getElementById('navDrawer');
    const navDrawerOverlay = document.getElementById('navDrawerOverlay');
    const navDrawerClose = document.getElementById('navDrawerClose');

    if (!mobileMenuBtn || !navDrawer) return;

    // Open drawer
    mobileMenuBtn.addEventListener('click', function() {
      navDrawer.classList.add('active');
      if (navDrawerOverlay) {
        navDrawerOverlay.classList.add('active');
      }
      document.body.style.overflow = 'hidden';
    });

    // Close drawer
    function closeDrawer() {
      navDrawer.classList.remove('active');
      if (navDrawerOverlay) {
        navDrawerOverlay.classList.remove('active');
      }
      document.body.style.overflow = '';
    }

    if (navDrawerClose) {
      navDrawerClose.addEventListener('click', closeDrawer);
    }

    if (navDrawerOverlay) {
      navDrawerOverlay.addEventListener('click', closeDrawer);
    }

    // Close on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && navDrawer.classList.contains('active')) {
        closeDrawer();
      }
    });
  }

  /* ================================
     SMOOTH SCROLL
     ================================ */

  function initSmoothScroll() {
    // Find all anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');

        // Ignore empty hash or just "#"
        if (!href || href === '#') return;

        const target = document.querySelector(href);

        if (target) {
          e.preventDefault();

          // Calculate offset (for sticky headers)
          const header = document.querySelector('.cc-header');
          const offset = header ? header.offsetHeight : 0;

          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset - 20;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          // Update URL without jumping
          history.pushState(null, null, href);
        }
      });
    });
  }

  /* ================================
     ACTIVE NAVIGATION HIGHLIGHTING
     ================================ */

  function initActiveNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.cc-nav-link, .cc-nav-drawer-link, .sidebar-link');

    navLinks.forEach(function(link) {
      const linkPath = new URL(link.href, window.location.origin).pathname;

      // Exact match for root
      if (currentPath === '/' && linkPath === '/') {
        link.classList.add('active');
      }
      // Starts with match for other pages
      else if (currentPath !== '/' && linkPath !== '/' && currentPath.startsWith(linkPath)) {
        link.classList.add('active');
      }
    });
  }

  /* ================================
     HEADER SCROLL EFFECT
     ================================ */

  function initHeaderScroll() {
    const header = document.querySelector('.cc-header');

    if (!header) return;

    let lastScrollY = window.pageYOffset;
    let ticking = false;

    function updateHeader() {
      const scrollY = window.pageYOffset;

      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      lastScrollY = scrollY;
      ticking = false;
    }

    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    });
  }

  /* ================================
     FORM VALIDATION
     ================================ */

  function initFormValidation() {
    const forms = document.querySelectorAll('.cc-form');

    forms.forEach(function(form) {
      form.addEventListener('submit', function(e) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');

        // Clear previous errors
        form.querySelectorAll('.cc-form-error').forEach(function(error) {
          error.remove();
        });
        form.querySelectorAll('.error').forEach(function(field) {
          field.classList.remove('error');
        });

        // Validate required fields
        requiredFields.forEach(function(field) {
          const value = field.value.trim();

          if (!value) {
            isValid = false;
            showFieldError(field, 'This field is required');
          } else if (field.type === 'email' && !isValidEmail(value)) {
            isValid = false;
            showFieldError(field, 'Please enter a valid email address');
          } else if (field.type === 'tel' && !isValidPhone(value)) {
            isValid = false;
            showFieldError(field, 'Please enter a valid phone number');
          }
        });

        if (!isValid) {
          e.preventDefault();

          // Focus first error field
          const firstError = form.querySelector('.error');
          if (firstError) {
            firstError.focus();
          }
        }
      });

      // Real-time validation on blur
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(function(input) {
        input.addEventListener('blur', function() {
          if (this.hasAttribute('required') && !this.value.trim()) {
            showFieldError(this, 'This field is required');
          } else if (this.type === 'email' && this.value && !isValidEmail(this.value)) {
            showFieldError(this, 'Please enter a valid email address');
          } else if (this.type === 'tel' && this.value && !isValidPhone(this.value)) {
            showFieldError(this, 'Please enter a valid phone number');
          } else {
            clearFieldError(this);
          }
        });

        // Clear error on input
        input.addEventListener('input', function() {
          if (this.classList.contains('error')) {
            clearFieldError(this);
          }
        });
      });
    });
  }

  function showFieldError(field, message) {
    field.classList.add('error');

    // Remove existing error for this field
    const existingError = field.parentElement.querySelector('.cc-form-error');
    if (existingError) {
      existingError.remove();
    }

    // Add new error message
    const error = document.createElement('span');
    error.className = 'cc-form-error';
    error.textContent = message;
    field.parentElement.appendChild(error);
  }

  function clearFieldError(field) {
    field.classList.remove('error');
    const error = field.parentElement.querySelector('.cc-form-error');
    if (error) {
      error.remove();
    }
  }

  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function isValidPhone(phone) {
    // Allow various phone formats
    const re = /^[\d\s\-\+\(\)]+$/;
    const digitsOnly = phone.replace(/\D/g, '');
    return re.test(phone) && digitsOnly.length >= 10;
  }

  /* ================================
     UTILITY FUNCTIONS
     ================================ */

  // Debounce function for performance
  window.debounce = function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = function() {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Throttle function for performance
  window.throttle = function(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(function() {
          inThrottle = false;
        }, limit);
      }
    };
  };

  /* ================================
     PUBLIC API
     ================================ */

  window.ClaymoreColt = {
    version: '1.0',
    openMobileMenu: function() {
      const btn = document.getElementById('mobileMenuBtn');
      if (btn) btn.click();
    },
    closeMobileMenu: function() {
      const drawer = document.getElementById('navDrawer');
      if (drawer) drawer.classList.remove('active');
      const overlay = document.getElementById('navDrawerOverlay');
      if (overlay) overlay.classList.remove('active');
      document.body.style.overflow = '';
    },
    validateForm: function(formElement) {
      const event = new Event('submit', { cancelable: true });
      return formElement.dispatchEvent(event);
    }
  };

})();
