const CONFIG = {
  whatsapp: '351900000000',   // número do restaurante, com indicativo, sem '+'
  deliveryFee: 2.50,
  minOrderDelivery: 15,
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const fmt = (n) => n.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

const state = {
  mode: localStorage.getItem('sudokan-mode') || 'delivery',
  category: 'Todos',
  cart: JSON.parse(localStorage.getItem('sudokan-cart') || '[]'),
  current: null,
  qty: 1,
  trackerTimers: [],
};

const saveCart = () => localStorage.setItem('sudokan-cart', JSON.stringify(state.cart));
const cartCount = () => state.cart.reduce((s, i) => s + i.qty, 0);
const subtotal = () => state.cart.reduce((s, i) => s + i.unit * i.qty, 0);
const fee = () => (state.mode === 'delivery' ? CONFIG.deliveryFee : 0);
const itemImg = (p) => (p.img
  ? `<img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy">`
  : '🍣');

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('show'), 1800);
}

function showView(name) {
  ['menu', 'checkout', 'confirm'].forEach((v) =>
    $('#view-' + v).classList.toggle('hidden', v !== name));
  $('#categories').classList.toggle('hidden', name !== 'menu');
  window.scrollTo(0, 0);
  renderCart();
}

/* Tipo de pedido */
function setMode(mode) {
  state.mode = mode;
  localStorage.setItem('sudokan-mode', mode);
  $$('#mode-toggle button').forEach((b) => {
    const on = b.dataset.mode === mode;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', on);
  });
  $('#address-block').classList.toggle('hidden', mode !== 'delivery');
  if (!$('#view-checkout').classList.contains('hidden')) renderCheckout();
}
$('#mode-toggle').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (b) setMode(b.dataset.mode);
});

/* Categorias */
function renderCategories() {
  $('#categories').innerHTML = ['Todos', ...MENU.categories].map((c) =>
    `<button type="button" class="chip ${c === state.category ? 'active' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`
  ).join('');
}
$('#categories').addEventListener('click', (e) => {
  const b = e.target.closest('[data-cat]');
  if (!b) return;
  state.category = b.dataset.cat;
  renderCategories();
  renderMenu();
  b.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
});

/* Menu */
function renderMenu() {
  const items = MENU.products.filter((p) =>
    state.category === 'Todos' || p.cat === state.category);
  $('#menu').innerHTML = items.map((p) => `
    <article class="card" data-id="${esc(p.id)}" tabindex="0">
      <div class="card-img">
        ${itemImg(p)}
        ${p.tags && p.tags[0] ? `<span class="badge">${esc(p.tags[0])}</span>` : ''}
      </div>
      <div class="card-body">
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.desc || '')}</p>
        <div class="card-foot">
          <strong>${fmt(p.price)}</strong>
          <span class="add-btn" aria-hidden="true">+</span>
        </div>
      </div>
    </article>`).join('');
}
$('#menu').addEventListener('click', (e) => {
  const c = e.target.closest('.card');
  if (c) openProduct(c.dataset.id);
});
$('#menu').addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const c = e.target.closest('.card');
  if (c) openProduct(c.dataset.id);
});

/* Modal do produto */
function openProduct(id) {
  const p = MENU.products.find((x) => x.id === id);
  if (!p) return;
  state.current = p;
  state.qty = 1;
  const removable = p.removable || [];
  const extras = p.extras || [];

  $('#modal-body').innerHTML = `
    <div class="modal-img">${itemImg(p)}</div>
    <h2 id="modal-title">${esc(p.name)}</h2>
    <p class="muted">${esc(p.desc || '')}</p>
    ${removable.length ? `
      <fieldset>
        <legend>Retirar ingredientes</legend>
        ${removable.map((r) => `
          <label class="opt">
            <input type="checkbox" name="remove" value="${esc(r)}">
            <span>${esc(r)}</span>
          </label>`).join('')}
      </fieldset>` : ''}
    ${extras.length ? `
      <fieldset>
        <legend>Extras</legend>
        ${extras.map((x) => `
          <label class="opt">
            <input type="checkbox" name="extra" value="${esc(x.name)}" data-price="${x.price}">
            <span>${esc(x.name)}</span>
            <em>+${fmt(x.price)}</em>
          </label>`).join('')}
      </fieldset>` : ''}
    <label class="field">Observações
      <textarea id="note" rows="2" maxlength="140" placeholder="Ex.: sem wasabi, bem frio"></textarea>
    </label>`;

  $('#qty').textContent = 1;
  updateModalPrice();
  $('#product-modal').classList.remove('hidden');
  document.body.classList.add('lock');
}

function unitPrice() {
  const extras = [...$$('#modal-body input[name=extra]:checked')]
    .reduce((s, i) => s + Number(i.dataset.price), 0);
  return state.current.price + extras;
}

function updateModalPrice() {
  $('#qty').textContent = state.qty;
  $('#add-btn').textContent = `Adicionar · ${fmt(unitPrice() * state.qty)}`;
}

function closeModal() {
  $('#product-modal').classList.add('hidden');
  document.body.classList.remove('lock');
}

$('#modal-body').addEventListener('change', updateModalPrice);
$('#plus').onclick = () => { state.qty = Math.min(state.qty + 1, 20); updateModalPrice(); };
$('#minus').onclick = () => { state.qty = Math.max(1, state.qty - 1); updateModalPrice(); };
$('#close-modal').onclick = closeModal;
$('#product-modal').addEventListener('click', (e) => {
  if (e.target.id === 'product-modal') closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

$('#add-btn').onclick = () => {
  const p = state.current;
  const removed = [...$$('#modal-body input[name=remove]:checked')].map((i) => i.value).sort();
  const extras = [...$$('#modal-body input[name=extra]:checked')].map((i) => i.value).sort();
  const note = $('#note').value.trim();
  const unit = unitPrice();
  const key = [p.id, removed.join('|'), extras.join('|'), note].join('::');

  const existing = state.cart.find((i) => i.key === key);
  if (existing) existing.qty += state.qty;
  else state.cart.push({ key, id: p.id, name: p.name, unit, qty: state.qty, removed, extras, note });

  saveCart();
  closeModal();
  renderCart();
  toast('Adicionado ao carrinho');
};

/* Carrinho (FAB) */
function renderCart() {
  const n = cartCount();
  const onMenu = !$('#view-menu').classList.contains('hidden');
  $('#cart-fab').classList.toggle('hidden', !(n > 0 && onMenu));
  $('#cart-count').textContent = `${n} ${n === 1 ? 'item' : 'itens'}`;
  $('#cart-total').textContent = fmt(subtotal());
}
$('#cart-fab').onclick = () => { showView('checkout'); renderCheckout(); };
document.querySelector('[data-back]').onclick = () => showView('menu');

/* Checkout */
function renderCheckout() {
  const form = $('#checkout-form');
  if (!state.cart.length) {
    $('#cart-list').innerHTML = '<p class="muted">O carrinho está vazio.</p>';
    $('#summary').innerHTML = '';
    form.classList.add('hidden');
    $('#form-warning').classList.add('hidden');
    return;
  }
  form.classList.remove('hidden');

  $('#cart-list').innerHTML = `<div class="summary">${state.cart.map((i) => `
    <div class="cart-item">
      <div class="info">
        <strong>${esc(i.name)}</strong>
        ${i.removed.length ? `<small>Sem: ${esc(i.removed.join(', '))}</small>` : ''}
        ${i.extras.length ? `<small>Extras: ${esc(i.extras.join(', '))}</small>` : ''}
        ${i.note ? `<small>Obs.: ${esc(i.note)}</small>` : ''}
        <strong>${fmt(i.unit * i.qty)}</strong>
      </div>
      <div class="qty">
        <button type="button" data-act="dec" data-key="${esc(i.key)}" aria-label="Diminuir">−</button>
        <span>${i.qty}</span>
        <button type="button" data-act="inc" data-key="${esc(i.key)}" aria-label="Aumentar">+</button>
      </div>
      <button type="button" class="del" data-act="del" data-key="${esc(i.key)}">Remover</button>
    </div>`).join('')}</div>`;

  const sub = subtotal();
  const f = fee();
  $('#summary').innerHTML = `
    <div class="row"><span>Subtotal</span><span>${fmt(sub)}</span></div>
    <div class="row"><span>Taxa de entrega</span><span>${state.mode === 'delivery' ? fmt(f) : 'Grátis'}</span></div>
    <div class="row total"><span>Total</span><span>${fmt(sub + f)}</span></div>`;

  const belowMin = state.mode === 'delivery' && sub < CONFIG.minOrderDelivery;
  const warn = $('#form-warning');
  warn.classList.toggle('hidden', !belowMin);
  warn.textContent = belowMin
    ? `Pedido mínimo para entrega: ${fmt(CONFIG.minOrderDelivery)}. Faltam ${fmt(CONFIG.minOrderDelivery - sub)}.`
    : '';
}

$('#cart-list').addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const item = state.cart.find((i) => i.key === b.dataset.key);
  if (!item) return;
  if (b.dataset.act === 'inc') item.qty = Math.min(item.qty + 1, 20);
  if (b.dataset.act === 'dec') item.qty = Math.max(1, item.qty - 1);
  if (b.dataset.act === 'del') state.cart = state.cart.filter((i) => i !== item);
  saveCart();
  renderCheckout();
  renderCart();
});

/* Validação */
const PT_MOBILE = /^9\d{8}$/;
const POSTAL = /^\d{4}-\d{3}$/;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function validate(f) {
  const errs = {};
  const phone = f.phone.replace(/[\s+]/g, '').replace(/^351/, '');
  if (f.name.trim().length < 2) errs.name = 'Indique o seu nome.';
  if (!PT_MOBILE.test(phone)) errs.phone = 'Número inválido. Use 9 dígitos (ex.: 912 345 678).';
  if (f.email && !EMAIL.test(f.email.trim())) errs.email = 'Email inválido.';
  if (!f.payment) errs.payment = 'Escolha um método de pagamento.';
  if (state.mode === 'delivery') {
    if (!f.street.trim()) errs.street = 'Indique a rua.';
    if (!f.number.trim()) errs.number = 'Indique o número.';
    if (!POSTAL.test(f.postal.trim())) errs.postal = 'Formato: 1000-001.';
    if (!f.city.trim()) errs.city = 'Indique a localidade.';
  }
  return errs;
}

/* Submissão do pedido */
$('#checkout-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  const raw = Object.fromEntries(new FormData(form));
  const f = {
    name: '', phone: '', email: '', street: '', number: '', floor: '',
    postal: '', city: '', deliveryNotes: '', payment: '', ...raw,
  };

  form.querySelectorAll('.error').forEach((el) => (el.textContent = ''));
  const errs = validate(f);
  Object.entries(errs).forEach(([key, msg]) => {
    const el = form.querySelector(`[data-for="${key}"]`);
    if (el) el.textContent = msg;
  });

  if (Object.keys(errs).length) {
    const first = form.querySelector('.error:not(:empty)');
    first?.closest('label, .form-block')?.querySelector('input')?.focus();
    return;
  }

  if (state.mode === 'delivery' && subtotal() < CONFIG.minOrderDelivery) {
    renderCheckout();
    return;
  }

  const sub = subtotal();
  const deliveryFee = fee();
  const order = {
    number: String(Math.floor(1000 + Math.random() * 9000)),
    mode: state.mode,
    createdAt: new Date().toISOString(),
    customer: { name: f.name.trim(), phone: f.phone.trim(), email: f.email.trim() },
    address: state.mode === 'delivery' ? {
      street: f.street.trim(),
      number: f.number.trim(),
      floor: f.floor.trim(),
      postal: f.postal.trim(),
      city: f.city.trim(),
      notes: f.deliveryNotes.trim(),
    } : null,
    payment: f.payment,
    items: state.cart,
    subtotal: sub,
    fee: deliveryFee,
    total: sub + deliveryFee,
  };

  localStorage.setItem('sudokan-last-order', JSON.stringify(order));
  state.cart = [];
  saveCart();
  renderConfirm(order);
});

/* Confirmação e estado do pedido */
function renderConfirm(o) {
  showView('confirm');
  const isDelivery = o.mode === 'delivery';

  $('#confirm-title').textContent = `Pedido #${o.number} recebido`;
  $('#confirm-sub').textContent = isDelivery
    ? 'Obrigado! Vamos preparar o seu pedido para entrega.'
    : 'Obrigado! Avisamos quando o seu pedido estiver pronto para levantar.';
  $('#last-step').textContent = isDelivery ? 'A caminho' : 'Pronto para levantar';

  $('#confirm-summary').innerHTML = `
    ${o.items.map((i) => `
      <div class="row"><span>${i.qty}× ${esc(i.name)}</span><span>${fmt(i.unit * i.qty)}</span></div>`).join('')}
    <div class="row"><span>Taxa de entrega</span><span>${isDelivery ? fmt(o.fee) : 'Grátis'}</span></div>
    <div class="row total"><span>Total</span><span>${fmt(o.total)}</span></div>
    <div class="row"><span>Pagamento</span><span>${esc(o.payment)}</span></div>`;

  $('#wa-btn').href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(buildWhatsAppText(o))}`;

  state.trackerTimers.forEach(clearTimeout);
  setTracker(0);
  state.trackerTimers = [
    setTimeout(() => setTracker(1), 8000),
    setTimeout(() => setTracker(2), 20000),
  ];
}

function setTracker(step) {
  $$('#tracker li').forEach((li) => {
    const s = Number(li.dataset.step);
    li.classList.toggle('done', s < step);
    li.classList.toggle('current', s === step);
  });
}

function buildWhatsAppText(o) {
  const lines = [
    `*Novo pedido #${o.number}* (${o.mode === 'delivery' ? 'Entrega' : 'Takeaway'})`,
    `Cliente: ${o.customer.name} · ${o.customer.phone}`,
  ];
  if (o.address) {
    const a = o.address;
    lines.push(`Morada: ${a.street} ${a.number}${a.floor ? ', ' + a.floor : ''}, ${a.postal} ${a.city}`);
    if (a.notes) lines.push(`Indicações: ${a.notes}`);
  }
  lines.push(`Pagamento: ${o.payment}`, '', '*Itens:*');
  o.items.forEach((i) => {
    lines.push(`${i.qty}x ${i.name} (${fmt(i.unit * i.qty)})`);
    if (i.removed.length) lines.push(`   Sem: ${i.removed.join(', ')}`);
    if (i.extras.length) lines.push(`   Extras: ${i.extras.join(', ')}`);
    if (i.note) lines.push(`   Obs.: ${i.note}`);
  });
  lines.push('', `Subtotal: ${fmt(o.subtotal)}`, `Taxa: ${o.fee ? fmt(o.fee) : 'Grátis'}`, `*Total: ${fmt(o.total)}*`);
  return lines.join('\n');
}

$('#new-order').onclick = () => {
  state.trackerTimers.forEach(clearTimeout);
  showView('menu');
};

/* Inicialização */
renderCategories();
renderMenu();
setMode(state.mode);
showView('menu');
