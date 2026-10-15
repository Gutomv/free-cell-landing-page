import { WHATSAPP_DISPLAY, normalizeQuote, buildQuoteMessage, buildWhatsAppLink } from './quote-model.mjs';

const form = document.getElementById('quote-form');
const fields = Object.fromEntries(['name', 'segment', 'goal', 'interest', 'website', 'notes'].map(key => [key, document.getElementById(`quote-${key}`)]));
const panelTitle = document.getElementById('quote-panel-title');
const guide = document.getElementById('quote-guide');
const review = document.getElementById('quote-review');
const draft = document.getElementById('quote-draft');
const continueLink = document.getElementById('quote-continue');
const errorSummary = document.getElementById('quote-error-summary');
const status = document.getElementById('quote-status');
const readFields = () => Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.value]));

function setError(key, message) {
  const node = document.getElementById(`quote-${key}-error`);
  fields[key].setAttribute('aria-invalid', String(Boolean(message)));
  node.textContent = message || '';
  node.hidden = !message;
}

function showGuide(message = '') {
  panelTitle.textContent = 'Da sua ideia à conversa.';
  guide.hidden = false;
  review.hidden = true;
  draft.value = '';
  continueLink.removeAttribute('href');
  status.textContent = message;
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const result = normalizeQuote(readFields());
  for (const key of Object.keys(fields)) setError(key, result.errors[key]);
  errorSummary.hidden = result.valid;
  if (!result.valid) {
    showGuide();
    fields[Object.keys(result.errors)[0]].focus();
    return;
  }
  const message = buildQuoteMessage(result.values);
  draft.value = message;
  continueLink.href = buildWhatsAppLink(message);
  panelTitle.textContent = 'Revise sua mensagem.';
  guide.hidden = true;
  review.hidden = false;
  status.textContent = 'Mensagem pronta para revisão.';
  review.focus();
});

function handleEdit(event) {
  if (!review.hidden) showGuide('Dados alterados. Revise novamente para atualizar a mensagem.');
  const key = Object.keys(fields).find(name => fields[name] === event.target);
  if (key && fields[key].getAttribute('aria-invalid') === 'true') {
    setError(key, normalizeQuote(readFields()).errors[key]);
    errorSummary.hidden = !Object.values(fields).some(field => field.getAttribute('aria-invalid') === 'true');
  }
}
form.addEventListener('input', handleEdit);
form.addEventListener('change', handleEdit);
form.addEventListener('reset', event => {
  event.preventDefault();
  for (const [key, field] of Object.entries(fields)) {
    field.value = key === 'interest' ? 'guidance' : '';
    setError(key);
  }
  errorSummary.hidden = true;
  showGuide('Formulário limpo.');
  fields.name.focus();
});

for (const link of document.querySelectorAll('[data-budget-choice]')) {
  link.addEventListener('click', () => {
    const choice = link.dataset.budgetChoice;
    if (!['economic', 'custom'].includes(choice) || fields.interest.value === choice) return;
    fields.interest.value = choice;
    setError('interest');
    if (!review.hidden) showGuide('Opção alterada. Revise novamente para atualizar a mensagem.');
  });
}
for (const node of document.querySelectorAll('[data-contact-number]')) node.textContent = WHATSAPP_DISPLAY;
document.getElementById('quote-submit').disabled = false;
