/* script.js – vanilla implementation of all required interactive features */

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- 1. Smooth scrolling for internal links ---------- */
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

  /* ---------- 2. Reveal on scroll with staggered delay ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const index = parseInt(el.dataset.revealIndex, 10) || 0;
        setTimeout(() => el.classList.add('visible'), index * 100);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach((el, i) => {
    el.dataset.revealIndex = i;
    revealObserver.observe(el);
  });

  /* ---------- 3. Navbar shrink, blur & hide/show on scroll ---------- */
  const header = document.querySelector('.glass-nav');
  let lastScrollY = window.scrollY;
  const navScrollHandler = () => {
    const curY = window.scrollY;

    // shrink & blur after 80px
    if (curY > 80) {
      header.classList.add('shrink', 'blur');
    } else {
      header.classList.remove('shrink', 'blur');
    }

    // hide on scroll down, show on scroll up
    if (curY > lastScrollY && curY > 120) {
      header.classList.add('hidden');
    } else {
      header.classList.remove('hidden');
    }
    lastScrollY = curY;
  };
  window.addEventListener('scroll', navScrollHandler);

  /* ---------- 4. Hamburger menu toggle ---------- */
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
  }

  /* ---------- 5. Stat counters (count‑up on view) ---------- */
  const statNumbers = document.querySelectorAll('.stat-number');
  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10) || 0;
        const duration = 2000;
        const startTime = performance.now();

        const step = now => {
          const progress = Math.min((now - startTime) / duration, 1);
          el.textContent = Math.floor(progress * target);
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target;
        };
        requestAnimationFrame(step);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.6 });

  statNumbers.forEach(el => {
    // ensure a numeric target is present
    if (!el.dataset.target) el.dataset.target = el.textContent.trim().replace(/\D/g, '');
    counterObserver.observe(el);
  });

  /* ---------- 6. Gallery lightbox ---------- */
  const gallery = document.getElementById('gallery');
  if (gallery) {
    // create lightbox elements once
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.style.cssText = `
      position:fixed; inset:0; background:rgba(0,0,0,0.85);
      display:flex; align-items:center; justify-content:center;
      opacity:0; visibility:hidden; transition:opacity .3s;
      z-index:1000;
    `;
    const img = document.createElement('img');
    img.style.maxWidth = '90%';
    img.style.maxHeight = '90%';
    const btnPrev = document.createElement('button');
    const btnNext = document.createElement('button');
    const btnClose = document.createElement('button');
    btnPrev.textContent = '‹';
    btnNext.textContent = '›';
    btnClose.textContent = '✕';
    [btnPrev, btnNext, btnClose].forEach(b => {
      b.style.cssText = `
        position:absolute; background:none; border:none;
        color:#fff; font-size:2rem; cursor:pointer;
        padding:.5rem;
      `;
    });
    btnPrev.style.left = '2%';
    btnNext.style.right = '2%';
    btnClose.style.top = '2%';
    btnClose.style.right = '2%';
    lightbox.append(img, btnPrev, btnNext, btnClose);
    document.body.appendChild(lightbox);

    const images = Array.from(gallery.querySelectorAll('img'));
    let currentIdx = 0;

    const openLightbox = idx => {
      currentIdx = idx;
      img.src = images[currentIdx].src;
      lightbox.style.visibility = 'visible';
      lightbox.style.opacity = '1';
    };
    const closeLightbox = () => {
      lightbox.style.opacity = '0';
      lightbox.addEventListener('transitionend', () => {
        lightbox.style.visibility = 'hidden';
      }, { once: true });
    };
    const showPrev = () => {
      currentIdx = (currentIdx - 1 + images.length) % images.length;
      img.src = images[currentIdx].src;
    };
    const showNext = () => {
      currentIdx = (currentIdx + 1) % images.length;
      img.src = images[currentIdx].src;
    };

    images.forEach((image, i) => {
      image.style.cursor = 'pointer';
      image.addEventListener('click', () => openLightbox(i));
    });
    btnPrev.addEventListener('click', e => { e.stopPropagation(); showPrev(); });
    btnNext.addEventListener('click', e => { e.stopPropagation(); showNext(); });
    btnClose.addEventListener('click', e => { e.stopPropagation(); closeLightbox(); });
    lightbox.addEventListener('click', closeLightbox);
  }

  /* ---------- 7. Booking form validation & success message ---------- */
  const bookingForm = document.querySelector('.booking-form');
  if (bookingForm) {
    const successMsg = document.createElement('div');
    successMsg.className = 'form-success';
    successMsg.textContent = 'Your reservation has been received! 🎉';
    successMsg.style.cssText = `
      opacity:0; transition:opacity .5s; color:var(--primary);
      margin-top:1rem; text-align:center;
    `;
    bookingForm.appendChild(successMsg);

    bookingForm.addEventListener('submit', e => {
      e.preventDefault();
      // native HTML5 validation
      if (!bookingForm.checkValidity()) {
        bookingForm.reportValidity();
        return;
      }
      // simulate async submission (e.g., fetch) – here just a timeout
      setTimeout(() => {
        successMsg.style.opacity = '1';
        bookingForm.reset();
      }, 300);
    });
  }
});