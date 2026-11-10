/**
 * PCW CONTRACTING SERVICES - MAIN SCRIPT
 * Handles navigation, mobile drawer accordions, FAQ toggles,
 * capabilities filtering, and preserved webhook estimate submission.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 2. Sticky Header Scroll Effect
  const header = document.querySelector('.site-header');
  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // 3. Mobile Navigation Drawer & Accordions
  const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileCloseBtn = document.querySelector('.mobile-close-btn');

  function openMobileNav() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('is-open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    if (mobileNavToggle) mobileNavToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // The drawer's visibility transition must finish before it accepts focus.
    window.setTimeout(() => {
      if (mobileDrawer.classList.contains('is-open')) mobileCloseBtn?.focus();
    }, 300);
  }

  function closeMobileNav() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('is-open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    if (mobileNavToggle) mobileNavToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    mobileNavToggle?.focus();
  }

  if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', openMobileNav);
  }
  if (mobileCloseBtn) {
    mobileCloseBtn.addEventListener('click', closeMobileNav);
  }
  if (mobileDrawer) {
    mobileDrawer.addEventListener('click', (e) => {
      if (e.target === mobileDrawer) closeMobileNav();
    });
  }

  // Reference homepage cards open existing complete service dialogs.
  let modalOpener = null;
  document.querySelectorAll('[data-modal]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      modalOpener = trigger;
      window.location.hash = trigger.dataset.modal;
    });
  });
  const syncModalFocus = () => {
    const modal = document.querySelector('.modal:target');
    document.body.classList.toggle('modal-open', !!modal);
    if (modal) {
      const directory = document.getElementById(modal.id.startsWith('proj-') ? 'proj-grid' : 'prop-grid');
      if (directory && directory.tagName === 'DETAILS') directory.open = true;
      modal.querySelector('.modal-close')?.focus({ preventScroll: true });
    } else if (modalOpener) {
      modalOpener.focus({ preventScroll: true });
      modalOpener = null;
    }
  };
  window.addEventListener('hashchange', syncModalFocus);
  syncModalFocus();
  document.querySelectorAll('[data-project-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-project-filter]').forEach((other) => {
        const active = other === button;
        other.classList.toggle('active', active);
        other.setAttribute('aria-pressed', String(active));
      });
      document.querySelectorAll('[data-project-category]').forEach((card) => {
        card.hidden = button.dataset.projectFilter !== 'all' && card.dataset.projectCategory !== button.dataset.projectFilter;
      });
    });
  });
  // Service detail modals: explicit close only — never dismiss on pointer movement.
  const closeActiveModal = () => {
    const activeModal = document.querySelector('.modal:target');
    if (!activeModal) return false;
    const closeLink = activeModal.querySelector('.modal-close');
    window.location.hash = closeLink ? closeLink.getAttribute('href') : '#main-content';
    return true;
  };
  document.querySelectorAll('.modal').forEach((modal) => {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeActiveModal();
    });
  });

  // Keyboard trap & Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      const surface = document.querySelector('.modal:target') || (mobileDrawer?.classList.contains('is-open') ? mobileDrawer : null);
      if (surface) {
        const controls = [...surface.querySelectorAll('a[href],button,input,select,textarea,[tabindex="0"]')].filter(el => el.getClientRects().length);
        const first = controls[0], last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }
    if (e.key === 'Escape') {
      if (closeActiveModal()) return;
      if (mobileDrawer && mobileDrawer.classList.contains('is-open')) {
        closeMobileNav();
      } else {
        const activeDropdown = document.activeElement ? document.activeElement.closest('.nav-item') : null;
        if (activeDropdown) {
          const trigger = activeDropdown.querySelector('.nav-link[aria-haspopup="true"]');
          if (trigger) {
            trigger.setAttribute('aria-expanded', 'false');
            trigger.focus();
          }
        }
      }
    }
  });

  // Desktop Dropdown Keyboard Accessibility & ARIA sync
  const navItems = document.querySelectorAll('.desktop-nav .nav-item');
  navItems.forEach((item) => {
    const trigger = item.querySelector('.nav-link[aria-haspopup="true"]');
    if (trigger) {
      item.addEventListener('focusin', () => {
        trigger.setAttribute('aria-expanded', 'true');
      });
      item.addEventListener('focusout', (e) => {
        if (!item.contains(e.relatedTarget)) {
          trigger.setAttribute('aria-expanded', 'false');
        }
      });
      item.addEventListener('mouseenter', () => {
        trigger.setAttribute('aria-expanded', 'true');
      });
      item.addEventListener('mouseleave', () => {
        if (!item.contains(document.activeElement)) {
          trigger.setAttribute('aria-expanded', 'false');
        }
      });
    }
  });

  // Mobile Accordion toggles
  const accordionToggles = document.querySelectorAll('.mobile-accordion-toggle');
  accordionToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      const targetId = toggle.getAttribute('aria-controls');
      const targetContent = document.getElementById(targetId);

      toggle.setAttribute('aria-expanded', !isExpanded);
      if (targetContent) {
        targetContent.classList.toggle('is-open', !isExpanded);
      }
      const icon = toggle.querySelector('i');
      if (icon) {
        icon.style.transform = !isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    });
  });

  // 4. Safe FAQ Accordions
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach((btn) => {
    btn.addEventListener('click', () => {
      const parentItem = btn.closest('.faq-item');
      if (!parentItem) return;
      const isActive = parentItem.classList.contains('is-active');

      // Close sibling items in the same FAQ block
      const siblingItems = parentItem.parentElement.querySelectorAll('.faq-item');
      siblingItems.forEach((item) => item.classList.remove('is-active'));

      if (!isActive) {
        parentItem.classList.add('is-active');
      }
    });
  });

  // 5. Work Gallery Filtering Tabs
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const workCards = document.querySelectorAll('.work-card');

  if (filterBtns.length > 0 && workCards.length > 0) {
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filterVal = btn.getAttribute('data-filter');
        workCards.forEach((card) => {
          const category = card.getAttribute('data-category');
          if (filterVal === 'all' || category === filterVal) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // 6. Pre-select service from URL query parameter on Contact Form
  const urlParams = new URLSearchParams(window.location.search);
  const serviceParam = urlParams.get('service');
  if (serviceParam) {
    const serviceSelect = document.getElementById('contact-service');
    if (serviceSelect) {
      for (let i = 0; i < serviceSelect.options.length; i++) {
        if (serviceSelect.options[i].value.toLowerCase() === serviceParam.toLowerCase() ||
            serviceSelect.options[i].text.toLowerCase() === serviceParam.toLowerCase()) {
          serviceSelect.selectedIndex = i;
          break;
        }
      }
    }
  }
});

/**
 * Backward-compatible estimate webhook submission.
 * Target: https://161-97-173-78.sslip.io/webhook/pcw-estimate-request
 * Legacy keys remain unchanged; additional keys cover every displayed field.
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  const form = document.getElementById('pcw-contact-form');
  if (!form) return;

  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonHtml = submitButton ? submitButton.innerHTML : 'Submit Estimate Request';

  const payload = {
    name: document.getElementById('contact-name').value.trim(),
    email: document.getElementById('contact-email').value.trim(),
    phone: document.getElementById('contact-phone').value.trim(),
    service: document.getElementById('contact-service').value,
    message: document.getElementById('contact-message').value.trim(),
    source_url: window.location.href,
    property_address: document.getElementById('contact-address').value.trim(),
    resident_name: document.getElementById('contact-resident').value.trim(),
    resident_address: document.getElementById('contact-resident-address').value.trim(),
    management_company: document.getElementById('contact-mgmt').value.trim(),
    contact_name: document.getElementById('contact-contact-name').value.trim(),
    contact_email: document.getElementById('contact-contact-email').value.trim(),
    contact_phone: document.getElementById('contact-contact-phone').value.trim(),
    gate_code: document.getElementById('contact-gate').value.trim(),
    access_notes: document.getElementById('contact-access').value.trim(),
    due_date: document.getElementById('contact-due').value.trim(),
    photo_maps_link: document.getElementById('contact-photo').value.trim()
  };

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    submitButton.innerHTML = 'Submitting Request...';
  }

  try {
    const response = await fetch('https://161-97-173-78.sslip.io/webhook/pcw-estimate-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Estimate request failed with status ${response.status}`);
    }

    form.reset();
    const toast = document.getElementById('success-toast');
    if (toast) {
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 6000);
    } else {
      window.alert('Thank you! Your estimate request has been received. A PCW technical estimator will follow up with you within 24 business hours.');
    }
  } catch (error) {
    console.error('PCW estimate request error:', error);
    window.alert('We could not submit your request right now. Please call PCW Contracting Services directly at (949) 548-9969.');
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
      submitButton.innerHTML = originalButtonHtml;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  }
}

/* Homepage uses explicit modal controls; content remains visible without scripting. */
