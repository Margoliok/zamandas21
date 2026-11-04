(() => {
  const CFG = window.ZAMANDAS || {};
  const L = CFG.i18n || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* Burger menu */
  const burger = $('.burger');
  const nav = $('#nav');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      const open = burger.getAttribute('aria-expanded') !== 'true';
      burger.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    });
    addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { burger.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); burger.focus(); } });
    nav.addEventListener('click', e => { if (e.target.closest('a')) { burger.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); } });
  }

  /* Reveal on scroll */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .08 }) : null;
  $$('.reveal').forEach(el => io ? io.observe(el) : el.classList.add('is-in'));

  /* Count-up numbers */
  const LOC = document.documentElement.lang === 'en' ? 'en-US' : 'ru-RU';
  const fmt = n => n.toLocaleString(LOC).replace(/[\u00a0\u202f]/g, '\u2009');
  const countIO = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target; countIO.unobserve(el);
      const to = +el.dataset.count, pre = el.dataset.pre || '';
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const t0 = performance.now(), dur = 1300;
      const step = t => { const p = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - p, 3); el.textContent = pre + fmt(Math.round(to * e)); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }, { threshold: .4 }) : null;
  $$('[data-count]').forEach(el => countIO && countIO.observe(el));

  /* Mobile sticky CTA */
  const mcta = $('.mcta');
  if (mcta) {
    const onScroll = () => mcta.classList.toggle('is-visible', window.scrollY > 380);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  /* Enroll modal */
  const modal = $('#enroll');
  let lastFocus = null;
  const openModal = (club) => {
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (club) { const sel = $('#f-club', modal); if (sel) sel.value = club; }
    setTimeout(() => $('#f-name', modal)?.focus(), 60);
  };
  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lastFocus?.focus?.();
  };
  $$('[data-enroll]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); openModal(b.dataset.enroll); }));
  $$('[data-close]').forEach(b => b.addEventListener('click', closeModal));
  addEventListener('keydown', e => {
    if (!modal?.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Tab') {
      const f = $$('button, input, select, a[href]', modal).filter(x => !x.disabled && x.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  if (location.hash === '#enroll') openModal();

  /* Form → Telegram bot endpoint (if configured) → WhatsApp → Instagram Direct */
  const form = $('#enroll-form');
  if (form) {
    const msg = $('.form__msg', form);
    const show = (type, text) => { msg.className = 'form__msg ' + type; msg.textContent = text; };
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(form));
      if (!d.name?.trim() || !d.phone?.trim() || !d.age) { show('err', L.required); return; }
      if (!form.consent.checked) { show('err', L.consent); return; }
      const text = `${L.msgHead}\n${L.fName}: ${d.name}\n${L.fPhone}: ${d.phone}\n${L.fAge}: ${d.age}\n${L.fClub}: ${d.club || '—'}\n${L.fCircle}: ${d.circle || '—'}`;
      const btn = $('button[type=submit]', form); btn.disabled = true;
      try {
        if (CFG.formEndpoint) {
          const r = await fetch(CFG.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...d, lang: document.documentElement.lang, page: location.href }) });
          if (!r.ok) throw new Error('http ' + r.status);
          show('ok', L.ok); form.reset();
        } else if (CFG.whatsapp) {
          // открываем синхронно, в рамках клика — иначе Safari блокирует всплывающее окно
          const url = `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(text)}`;
          if (!window.open(url, '_blank')) location.href = url;
          show('ok', L.okWa);
        } else {
          const url = `https://ig.me/m/${CFG.instagram}`;
          const w = window.open(url, '_blank');
          navigator.clipboard?.writeText(text).catch(() => {});
          if (!w) location.href = url;
          show('ok', L.okIg);
        }
        window.gtag?.('event', 'enroll_submit');
      } catch (err) {
        show('err', L.err);
      } finally { btn.disabled = false; }
    });
  }

  /* Copy buttons */
  $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); const t = b.textContent; b.textContent = L.copied || '✓'; setTimeout(() => b.textContent = t, 1600); } catch (_) {}
  }));
})();
