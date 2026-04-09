/* =============================================
   ECOWISE MARKET — script.js
   Fetches data from the Node.js Express API
   ============================================= */

/* ──────────────────────────────────────────────
   1. CUSTOM CURSOR
   ────────────────────────────────────────────── */
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';
});

(function animateCursor() {
  cursorX += (mouseX - cursorX) * 0.18;
  cursorY += (mouseY - cursorY) * 0.18;
  cursor.style.left = cursorX + 'px';
  cursor.style.top  = cursorY + 'px';
  requestAnimationFrame(animateCursor);
})();

document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => { cursor.style.transform = 'scale(1.6)'; cursor.style.borderColor = 'var(--amber)'; });
  el.addEventListener('mouseleave', () => { cursor.style.transform = 'scale(1)';   cursor.style.borderColor = 'var(--forest)'; });
});

/* ──────────────────────────────────────────────
   2. NAVBAR — scroll shadow
   ────────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 40));

/* ──────────────────────────────────────────────
   3. MOBILE MENU
   ────────────────────────────────────────────── */
const navToggle  = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

navToggle.addEventListener('click', () => {
  const open  = mobileMenu.classList.toggle('open');
  mobileMenu.style.display = open ? 'flex' : 'none';
  const [s0, s1, s2] = navToggle.querySelectorAll('span');
  if (open) {
    s0.style.transform = 'translateY(7px) rotate(45deg)';
    s1.style.opacity   = '0';
    s2.style.transform = 'translateY(-7px) rotate(-45deg)';
  } else {
    s0.style.transform = s2.style.transform = '';
    s1.style.opacity = '1';
  }
});
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
  mobileMenu.style.display = 'none';
  navToggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = '1'; });
}));

/* ──────────────────────────────────────────────
   4. SCROLL REVEAL
   ────────────────────────────────────────────── */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ──────────────────────────────────────────────
   5. ANIMATED COUNTER UTILITY
   ────────────────────────────────────────────── */
function animateCounter(el, target, duration, suffix = '') {
  const start = performance.now();
  (function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(ease * target).toLocaleString() + suffix;
    if (t < 1) requestAnimationFrame(step);
  })(performance.now());
}

/* ──────────────────────────────────────────────
   6. FETCH STATS FROM /api/stats  (Node.js API)
   ────────────────────────────────────────────── */
async function loadStats() {
  try {
    const res  = await fetch('/api/stats');
    const data = await res.json();
    animateCounter(document.getElementById('countTrees'),   data.treesPlanted, 2000, '+');
    animateCounter(document.getElementById('countPlastic'), data.plasticSaved,  2200, ' kg');
    animateCounter(document.getElementById('countCO2'),     data.co2Offset,     1800, 't');
  } catch (err) {
    console.error('Could not load stats:', err);
  }
}

/* ──────────────────────────────────────────────
   7. FETCH CATEGORIES FROM /api/categories  (Node.js API)
      Renders cards dynamically into #categoryGrid
   ────────────────────────────────────────────── */
async function loadCategories() {
  const grid = document.getElementById('categoryGrid');
  try {
    const res   = await fetch('/api/categories');
    const cats  = await res.json();

    grid.innerHTML = ''; // clear loading msg

    cats.forEach((cat, i) => {
      const card = document.createElement('div');
      card.className = `cat-card reveal${i > 0 ? ' delay-' + Math.min(i, 4) : ''}`;
      card.innerHTML = `
        <span class="cat-emoji">${cat.emoji}</span>
        <h3>${cat.name}</h3>
        <p>${cat.desc}</p>
        <span class="cat-count">${cat.count} products</span>
        <div class="cat-hover-bar"></div>
      `;
      // ripple on click
      card.addEventListener('click', (e) => {
        const ripple = document.createElement('span');
        const rect   = card.getBoundingClientRect();
        const size   = Math.max(rect.width, rect.height);
        Object.assign(ripple.style, {
          position: 'absolute', borderRadius: '50%',
          background: 'rgba(122,171,138,.3)',
          width: size + 'px', height: size + 'px',
          left: (e.clientX - rect.left - size / 2) + 'px',
          top:  (e.clientY - rect.top  - size / 2) + 'px',
          transform: 'scale(0)',
          animation: 'rippleAnim .5s ease-out forwards',
          pointerEvents: 'none',
        });
        card.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);
      });
      // cursor scale on hover
      card.addEventListener('mouseenter', () => { cursor.style.transform = 'scale(1.6)'; cursor.style.borderColor = 'var(--amber)'; });
      card.addEventListener('mouseleave', () => { cursor.style.transform = 'scale(1)'; cursor.style.borderColor = 'var(--forest)'; });

      grid.appendChild(card);
      revealObs.observe(card);
    });
  } catch (err) {
    grid.innerHTML = '<p class="loading-msg">Could not load categories.</p>';
    console.error('Could not load categories:', err);
  }
}

/* ──────────────────────────────────────────────
   8. DASHBOARD MOCK — count-ups on scroll
   ────────────────────────────────────────────── */
const dashObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.count-up').forEach(el => {
      animateCounter(el, parseInt(el.dataset.target, 10), 1600);
    });
    entry.target.querySelectorAll('.dash-fill, .lead-fill').forEach(bar => {
      const w = bar.style.width; bar.style.width = '0';
      setTimeout(() => { bar.style.width = w; }, 100);
    });
    dashObs.unobserve(entry.target);
  });
}, { threshold: 0.3 });
const dashMock = document.querySelector('.dashboard-mock');
if (dashMock) dashObs.observe(dashMock);

/* ──────────────────────────────────────────────
   9. FLOATING LEAF PARTICLES
   ────────────────────────────────────────────── */
const leafScatter = document.getElementById('leafScatter');
if (leafScatter) {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes leafDrift {
      0%  { transform: translateY(0) rotate(0deg); }
      33% { transform: translateY(-18px) rotate(12deg); }
      66% { transform: translateY(8px) rotate(-8deg); }
      100%{ transform: translateY(0) rotate(0deg); }
    }
    @keyframes rippleAnim { to { transform: scale(2.5); opacity: 0; } }
  `;
  document.head.appendChild(style);

  ['🍃','🌿','🍀','🌱'].forEach(() => {
    for (let i = 0; i < 5; i++) {
      const leaf = document.createElement('span');
      const emoji = ['🍃','🌿','🍀','🌱'][Math.floor(Math.random()*4)];
      leaf.textContent = emoji;
      Object.assign(leaf.style, {
        position: 'absolute',
        fontSize:  (Math.random() * 1.2 + 0.5) + 'rem',
        left:  (Math.random() * 100) + '%',
        top:   (Math.random() * 100) + '%',
        opacity:   (Math.random() * 0.18 + 0.04),
        animation: `leafDrift ${Math.random()*8+6}s ease-in-out infinite`,
        animationDelay: (Math.random() * 5) + 's',
        pointerEvents: 'none', userSelect: 'none',
      });
      leafScatter.appendChild(leaf);
    }
  });
}

/* ──────────────────────────────────────────────
   10. CTA — email validation + submission feedback
   ────────────────────────────────────────────── */
const ctaEmail = document.getElementById('ctaEmail');
const ctaBtn   = document.getElementById('ctaBtn');
const ctaNote  = document.getElementById('ctaNote');

if (ctaEmail) {
  ctaEmail.addEventListener('input', () => {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ctaEmail.value);
    ctaEmail.style.borderColor = ctaEmail.value.length > 0
      ? (valid ? 'var(--sage)' : 'rgba(212,100,70,.6)')
      : 'rgba(255,255,255,.15)';
  });
}

if (ctaBtn) {
  ctaBtn.addEventListener('click', () => {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ctaEmail.value);
    if (!valid) {
      ctaNote.textContent = '⚠️ Please enter a valid email address.';
      ctaNote.style.color = 'rgba(255,180,100,.9)';
      return;
    }
    ctaBtn.textContent   = '✓ Joined!';
    ctaBtn.style.background = 'var(--sage)';
    ctaNote.textContent  = '🌿 Welcome to EcoWise Market! Check your inbox.';
    ctaNote.style.color  = 'var(--sage-light)';
    ctaEmail.value       = '';
    ctaEmail.style.borderColor = 'rgba(255,255,255,.15)';
  });
}

/* ──────────────────────────────────────────────
   11. ACTIVE NAV HIGHLIGHT ON SCROLL
   ────────────────────────────────────────────── */
const navLinks = document.querySelectorAll('.nav-links a');
const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.getAttribute('id');
      navLinks.forEach(l => {
        l.style.color = l.getAttribute('href') === `#${id}` ? 'var(--forest)' : '';
      });
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('section[id]').forEach(s => sectionObs.observe(s));

/* ──────────────────────────────────────────────
   12. INITIALISE — fetch API data then reveal
   ────────────────────────────────────────────── */
window.addEventListener('load', () => {
  document.body.style.opacity = '1';
  setTimeout(loadStats,      600);
  setTimeout(loadCategories, 400);
});

document.body.style.opacity = '0';
document.body.style.transition = 'opacity .5s ease';