/* ЭксТехСервис — Concept 02 «Cinema». Анимации: Motion (motion.dev), с запасным вариантом без библиотеки. */

/* Контакты клиента: впишите, когда будут известны — кнопки и ссылки заработают автоматически. */
const CONTACTS = { phone: '', email: '', max: '' };

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Toast + контакты ---------- */
const toastEl = $('.toast');
let tt;
const toast = m => { toastEl.textContent = m; toastEl.hidden = false; clearTimeout(tt); tt = setTimeout(() => (toastEl.hidden = true), 3800); };
$$('[data-contact]').forEach(el => {
  const k = el.dataset.contact, v = CONTACTS[k];
  if (!v) return;
  el.innerHTML = k === 'phone' ? `<a href="tel:${v.replace(/[^\d+]/g, '')}">${v}</a>` : k === 'email' ? `<a href="mailto:${v}">${v}</a>` : `<a href="${v}" target="_blank" rel="noopener">Открыть чат</a>`;
});
document.addEventListener('click', e => {
  if (e.target.closest('[data-call]')) {
    CONTACTS.phone ? (location.href = 'tel:' + CONTACTS.phone.replace(/[^\d+]/g, ''))
      : toast('Номер телефона добавим после согласования с клиентом. Оставить заявку можно уже сейчас.');
  }
  if (e.target.closest('[data-max]')) {
    CONTACTS.max ? window.open(CONTACTS.max, '_blank', 'noopener') : toast('Ссылку на MAX добавим после согласования с клиентом.');
  }
  const unit = e.target.closest('[data-unit]');
  if (unit) { const f = $('#f-unit'); f.value = unit.dataset.unit; validate(f); }
});

/* ---------- Навигация ---------- */
const nav = $('[data-nav]');
const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true }); onScroll();
const burger = $('[data-burger]'), sheet = $('#sheet');
const setSheet = open => {
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  sheet.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : '';
  if (open && window.__m && !reduce) window.__m.animate($$('#sheet nav a'), { opacity: [0, 1], y: [30, 0] }, { delay: window.__m.stagger(0.05), duration: .6, ease: [0.22, 1, 0.36, 1] });
};
burger.addEventListener('click', () => setSheet(sheet.hidden));
sheet.addEventListener('click', e => { if (e.target.closest('a')) setSheet(false); });
addEventListener('keydown', e => { if (e.key === 'Escape' && !sheet.hidden) { setSheet(false); burger.focus(); } });
addEventListener('resize', () => { if (innerWidth > 1060 && !sheet.hidden) setSheet(false); });
const navLinks = $$('.nav__links a');
const secObs = new IntersectionObserver(es => es.forEach(en => {
  if (en.isIntersecting) navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
['stories', 'scheme', 'why', 'contacts'].forEach(id => secObs.observe(document.getElementById(id)));

/* ---------- Слайдшоу в герое ---------- */
const hero = $('.hero');
const slides = $$('.slide');
const bars = $$('.hero__bars span');
const toggle = $('[data-slides-toggle]');
const DUR = 7000;
let cur = 0, timer = null, paused = reduce, startedAt = 0, left = DUR;
document.documentElement.style.setProperty('--dur', DUR / 1000 + 's');
function show(i) {
  slides[cur].classList.remove('is-active');
  cur = (i + slides.length) % slides.length;
  const img = $('img', slides[cur]);
  img.loading = 'eager';
  slides[cur].classList.add('is-active');
  bars.forEach((b, k) => { b.classList.toggle('done', k < cur); b.classList.remove('run'); });
  void bars[cur].offsetWidth;
  bars[cur].classList.add('run');
  left = DUR;
  schedule();
}
function schedule() {
  clearTimeout(timer);
  if (paused) return;
  startedAt = Date.now();
  timer = setTimeout(() => show(cur + 1), left);
}
function setPaused(p) {
  paused = p;
  hero.classList.toggle('is-paused', p);
  toggle.innerHTML = `<svg><use href="#i-${p ? 'play' : 'pause'}"/></svg>`;
  toggle.setAttribute('aria-label', p ? 'Запустить смену фото' : 'Остановить смену фото');
  if (p) { clearTimeout(timer); left = Math.max(400, left - (Date.now() - startedAt)); } else schedule();
}
toggle.addEventListener('click', () => setPaused(!paused));
document.addEventListener('visibilitychange', () => { if (document.hidden && !paused) { setPaused(true); hero.dataset.auto = '1'; } else if (!document.hidden && hero.dataset.auto) { delete hero.dataset.auto; setPaused(false); } });
bars[0].classList.add('run');
if (reduce) setPaused(true); else schedule();

/* ---------- Главы услуг: фото слева меняется по мере прокрутки ---------- */
const chapters = $$('.chapter');
const storyImgs = $$('[data-story-img]');
const storyNum = $('[data-story-num]');
const chObs = new IntersectionObserver(es => es.forEach(en => {
  if (!en.isIntersecting) return;
  const i = +en.target.dataset.story;
  chapters.forEach(c => c.classList.toggle('is-active', c === en.target));
  storyImgs.forEach(img => img.classList.toggle('is-active', +img.dataset.storyImg === i));
  storyNum.textContent = String(i + 1).padStart(2, '0');
}), { rootMargin: '-45% 0px -45% 0px' });
chapters.forEach(c => chObs.observe(c));
chapters[0].classList.add('is-active');

/* ---------- Интерактивная схема ---------- */
const NODES = [
  { t: 'Двигатель', unit: 'ДВС / редуктор хода', d: 'Диагностика и ремонт двигателей внутреннего сгорания спецтехники: находим причину и восстанавливаем работу.', l: ['Не заводится или глохнет', 'Потеря мощности, дым', 'Посторонние шумы и стуки'] },
  { t: 'Гидравлический насос', unit: 'Гидравлика', d: 'Сердце гидросистемы. Ремонтируем насосы, когда техника «слабеет», медленно работает или греется.', l: ['Падение давления', 'Медленная работа стрелы и ковша', 'Шум, перегрев масла'] },
  { t: 'Гидрораспределитель', unit: 'Гидравлика', d: 'Отвечает за то, куда и сколько масла пойдёт. Устраняем утечки, заедания и самопроизвольные движения.', l: ['Подтёки и утечки', 'Заедание золотников', 'Потеря давления в контуре'] },
  { t: 'Гидроцилиндры', unit: 'Экскаватор', d: 'Ремонт гидроцилиндров стрелы, рукояти и ковша в составе ремонта техники.', l: ['Течь по штоку', 'Стрела «проседает»', 'Задиры и износ'] },
  { t: 'Редуктор хода', unit: 'ДВС / редуктор хода', d: 'Разбираем, проводим дефектовку и меняем изношенные детали, чтобы техника снова уверенно ехала.', l: ['Хруст и шум при движении', 'Течь масла', 'Слабое тяговое усилие'] },
  { t: 'Ходовая часть', unit: 'Экскаватор', d: 'Диагностика и ремонт ходовой в рамках обслуживания экскаваторов и погрузчиков.', l: ['Износ и люфты', 'Посторонние звуки', 'Осмотр перед сезоном'] }
];
const pIdx = $('[data-panel-idx]'), pTitle = $('[data-panel-title]'), pText = $('[data-panel-text]'), pList = $('[data-panel-list]'), pCta = $('[data-panel-cta]');
const panel = $('.scheme__panel');
function showNode(i, scroll) {
  const n = NODES[i];
  pIdx.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(NODES.length).padStart(2, '0');
  pTitle.textContent = n.t; pText.textContent = n.d;
  pList.innerHTML = n.l.map(x => `<li>${x}</li>`).join('');
  pCta.dataset.unit = n.unit;
  $$('.hs').forEach(h => h.classList.toggle('is-active', +h.dataset.node === i));
  $$('[data-node-btn]').forEach(b => b.setAttribute('aria-selected', String(+b.dataset.nodeBtn === i)));
  [pTitle, pText, pList].forEach(el => { el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap'); });
  if (scroll && innerWidth <= 1060) panel.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
}
$$('.hs').forEach(h => {
  h.addEventListener('click', () => showNode(+h.dataset.node, true));
  h.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showNode(+h.dataset.node, true); } });
});
$$('[data-node-btn]').forEach(b => b.addEventListener('click', () => showNode(+b.dataset.nodeBtn)));
showNode(0);

/* ---------- Форма ---------- */
const form = $('[data-form]');
const phone = $('[data-phone]');
phone.addEventListener('input', () => {
  let d = phone.value.replace(/\D/g, '');
  if (!d) { phone.value = ''; return; }
  if (d[0] === '8') d = '7' + d.slice(1);
  if (d[0] !== '7') d = '7' + d;
  d = d.slice(0, 11);
  let o = '+7';
  if (d.length > 1) o += ' (' + d.slice(1, 4);
  if (d.length >= 4) o += ')';
  if (d.length > 4) o += ' ' + d.slice(4, 7);
  if (d.length > 7) o += '-' + d.slice(7, 9);
  if (d.length > 9) o += '-' + d.slice(9, 11);
  phone.value = o;
});
const rules = {
  name: el => el.value.trim().length >= 2 || 'Как к вам обращаться?',
  phone: el => el.value.replace(/\D/g, '').length === 11 || 'Номер целиком: +7 и 10 цифр',
  unit: el => el.value.trim().length >= 2 || 'Укажите технику или узел',
  message: el => el.value.trim().length >= 10 || 'Опишите поломку подробнее — хотя бы 10 символов',
  agree: el => el.checked || 'Нужно согласие на обработку данных'
};
function validate(el) {
  const rule = rules[el.name];
  if (!rule) return true;
  const res = rule(el);
  const f = el.closest('.fl');
  f.classList.toggle('is-invalid', res !== true);
  el.setAttribute('aria-invalid', String(res !== true));
  $('.fl__err', f).textContent = res === true ? '' : res;
  return res === true;
}
form.addEventListener('focusout', e => { if (rules[e.target.name] && e.target.value) validate(e.target); });
form.addEventListener('input', e => { if (rules[e.target.name] && e.target.closest('.is-invalid')) validate(e.target); });
form.addEventListener('change', e => { if (e.target.name === 'agree') validate(e.target); });
form.addEventListener('submit', e => {
  e.preventDefault();
  const els = Object.keys(rules).map(n => form.elements[n]);
  const res = els.map(validate);
  if (res.includes(false)) { els[res.indexOf(false)].focus(); return; }
  const btn = $('button[type=submit]', form), html = btn.innerHTML;
  btn.disabled = true; btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Отправляем…';
  setTimeout(() => {
    btn.disabled = false; btn.innerHTML = html;
    const ok = $('.form__success', form); ok.hidden = false; ok.focus();
    window.__m?.animate(ok, { opacity: [0, 1], scale: [0.97, 1] }, { duration: .5 });
  }, 900);
});
$('[data-reset]').addEventListener('click', () => {
  form.reset(); $$('.is-invalid', form).forEach(f => f.classList.remove('is-invalid'));
  $('.form__success', form).hidden = true; form.elements.name.focus();
});
$('[data-year]').textContent = new Date().getFullYear();

/* ---------- Анимации ---------- */
const reveals = $$('[data-reveal]');
const lines = $$('[data-line]');
const drawEls = $$('.excavator .draw > *');
drawEls.forEach(p => { const len = Math.ceil(p.getTotalLength ? p.getTotalLength() : 1000); p.style.strokeDasharray = len; p.style.strokeDashoffset = len; });

function fallback() {
  lines.forEach((l, i) => setTimeout(() => l.classList.add('revealed'), 150 * i));
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('revealed'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
  reveals.forEach(el => io.observe(el));
  drawEls.forEach(p => (p.style.transition = 'stroke-dashoffset 2s ease'));
  const so = new IntersectionObserver(es => { if (es[0].isIntersecting) { drawEls.forEach(p => (p.style.strokeDashoffset = 0)); so.disconnect(); } }, { threshold: .3 });
  so.observe($('.excavator'));
}
function withMotion({ animate, inView, scroll, stagger }) {
  const ease = [0.22, 1, 0.36, 1];
  animate(lines, { y: ['110%', '0%'] }, { delay: stagger(0.14, { startDelay: 0.25 }), duration: 1.2, ease });
  reveals.forEach(el => inView(el, () => {
    const sibs = [...el.parentElement.children].filter(c => c.hasAttribute('data-reveal'));
    const i = Math.max(0, sibs.indexOf(el));
    animate(el, { opacity: [0, 1], y: [28, 0] }, { duration: 1, delay: (i % 6) * 0.07 + (el.closest('.hero') ? 0.7 : 0), ease });
  }, { margin: '0px 0px -8% 0px' }));
  // герой уходит вглубь при прокрутке
  scroll(animate('.hero__content', { y: [0, -80], opacity: [1, 0.2] }, { ease: 'linear' }), { target: hero, offset: ['start start', 'end start'] });
  // схема рисуется линиями, точки загораются
  inView('.excavator', () => {
    animate(drawEls, { strokeDashoffset: 0 }, { duration: 2, delay: stagger(0.07), ease: 'easeInOut' });
    animate('.hs', { opacity: [0, 1], scale: [0.3, 1] }, { delay: stagger(0.12, { startDelay: 1.3 }), duration: 0.6 });
  }, { amount: 0.3 });
  // параллакс фоновых фото
  [['.why', '.why__bg img'], ['.cta', '.cta__bg img']].forEach(([sec, img]) =>
    scroll(animate(img, { y: ['-8%', '8%'], scale: [1.18, 1.18] }, { ease: 'linear' }), { target: $(sec), offset: ['start end', 'end start'] }));
}
if (reduce) {
  [...lines, ...reveals].forEach(el => el.classList.add('revealed'));
  drawEls.forEach(p => (p.style.strokeDashoffset = 0));
} else {
  Promise.race([import('https://cdn.jsdelivr.net/npm/motion@12/+esm'), new Promise((_, r) => setTimeout(r, 4000))])
    .then(m => { window.__m = m; withMotion(m); })
    .catch(fallback);
}
