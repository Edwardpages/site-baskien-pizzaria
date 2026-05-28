/* script.js – vanilla implementation of all requested interactive features */

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- 1. Smooth scrolling for internal anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href').slice(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ---------- 2. Reveal on scroll (IntersectionObserver) ---------- */
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          // staggered delay based on element's index in the NodeList
          const index = Array.from(revealElements).indexOf(el);
          setTimeout(() => el.classList.add('visible'), index * 100);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.1 });
    revealElements.forEach(el => revealObserver.observe(el));
  }

  /* ---------- 3. Navbar shrink, blur, hide on scroll down / show on scroll up ---------- */
  const nav = document.querySelector('.glass-nav');
  let lastScrollY = window.scrollY;
  const SCROLL_THRESHOLD = 80;

  const handleNavScroll = () => {
    const currentY = window.scrollY;

    // shrink & blur after threshold
    if (currentY > SCROLL_THRESHOLD) {
      nav.classList.add('shrink', 'blur');
    } else {
      nav.classList.remove('shrink', 'blur');
    }

    // hide on scroll down, show on scroll up
    if (currentY > lastScrollY && currentY > SCROLL_THRESHOLD) {
      nav.classList.add('hidden');
    } else {
      nav.classList.remove('hidden');
    }

    lastScrollY = currentY;
  };
  window.addEventListener('scroll', handleNavScroll);

  /* ---------- 4. Hamburger menu toggle (adds .open) ---------- */
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
  }

  /* ---------- 5. Stat counters – count up when in view ---------- */
  const statNumbers = document.querySelectorAll('.stat-number');
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = +el.dataset.target || +el.textContent;
        const duration = 2000;
        const start = performance.now();

        const step = now => {
          const progress = Math.min((now - start) / duration, 1);
          el.textContent = Math.floor(progress * target);
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target;
        };
        requestAnimationFrame(step);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.6 });
  statNumbers.forEach(el => counterObserver.observe(el));

  /* ---------- 6. Gallery lightbox ---------- */
  const galleryGrid = document.querySelector('.gallery-grid');
  if (galleryGrid) {
    const images = Array.from(galleryGrid.querySelectorAll('img'));
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `
      <button class="lightbox-close" aria-label="Close">&times;</button>
      <button class="lightbox-prev" aria-label="Previous">&#10094;</button>
      <img class="lightbox-image" src="" alt="">
      <button class="lightbox-next" aria-label="Next">&#10095;</button>
    `;
    document.body.appendChild(overlay);

    const lightboxImg = overlay.querySelector('.lightbox-image');
    const closeBtn = overlay.querySelector('.lightbox-close');
    const prevBtn = overlay.querySelector('.lightbox-prev');
    const nextBtn = overlay.querySelector('.lightbox-next');

    let currentIndex = 0;

    const openLightbox = idx => {
      currentIndex = idx;
      lightboxImg.src = images[currentIndex].src;
      overlay.classList.add('active');
    };

    const closeLightbox = () => overlay.classList.remove('active');

    const showPrev = () => {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      lightboxImg.src = images[currentIndex].src;
    };
    const showNext = () => {
      currentIndex = (currentIndex + 1) % images.length;
      lightboxImg.src = images[currentIndex].src;
    };

    images.forEach((img, i) => {
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => openLightbox(i));
    });

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', e => {
      if (!overlay.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') showPrev();
      else if (e.key === 'ArrowRight') showNext();
    });
  }

  /* ---------- 7. Booking form validation + success message ---------- */
  const bookingForm = document.querySelector('.booking-form');
  if (bookingForm) {
    const successMsg = document.createElement('div');
    successMsg.className = 'form-success';
    successMsg.textContent = 'Your reservation has been submitted! We look forward to serving you.';
    successMsg.style.opacity = '0';
    successMsg.style.transition = 'opacity 0.5s ease';
    bookingForm.parentNode.insertBefore(successMsg, bookingForm.nextSibling);

    bookingForm.addEventListener('submit', e => {
      e.preventDefault();

      // Use built‑in HTML validation first
      if (!bookingForm.checkValidity()) {
        bookingForm.reportValidity();
        return;
      }

      // Simulate async submission (e.g., fetch) – here just a timeout
      setTimeout(() => {
        bookingForm.reset();
        successMsg.style.opacity = '1';
        // Fade out after 3 seconds
        setTimeout(() => (successMsg.style.opacity = '0'), 3000);
      }, 500);
    });
  }
});