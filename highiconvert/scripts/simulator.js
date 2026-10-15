import { simulateConversions } from './conversion.mjs';

const form = document.getElementById('simulation-form');
const fields = {
  visits: document.getElementById('simulation-visits'),
  currentRate: document.getElementById('simulation-current'),
  scenarioRate: document.getElementById('simulation-scenario'),
  goal: document.getElementById('simulation-goal'),
};
const errorNodes = {
  visits: document.getElementById('visits-error'),
  currentRate: document.getElementById('current-error'),
  scenarioRate: document.getElementById('scenario-error'),
  goal: document.getElementById('goal-error'),
};
const units = {
  contacts: { singular: 'contato', plural: 'contatos' },
  quotes: { singular: 'pedido de orçamento', plural: 'pedidos de orçamento' },
  bookings: { singular: 'agendamento', plural: 'agendamentos' },
  sales: { singular: 'venda', plural: 'vendas' },
};
const countFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 4 });
const rateFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
const currentOutput = document.getElementById('current-result');
const scenarioOutput = document.getElementById('scenario-result');
const differenceOutput = document.getElementById('simulation-difference');
const results = document.getElementById('simulation-results');
const errorSummary = document.getElementById('simulation-error');

function renderValue(output, value) {
  const text = countFormat.format(value);
  output.value = text;
  output.dataset.compact = String(text.length > 3);
}

function updateSimulation() {
  const input = {
    visits: fields.visits.valueAsNumber,
    currentRate: fields.currentRate.valueAsNumber,
    scenarioRate: fields.scenarioRate.valueAsNumber,
  };
  const simulation = simulateConversions(input);
  const errors = { ...(simulation.errors || {}) };
  if (!Object.hasOwn(units, fields.goal.value)) errors.goal = 'Selecione um objetivo da página.';
  for (const [name, field] of Object.entries(fields)) {
    const error = errors[name];
    field.setAttribute('aria-invalid', String(Boolean(error)));
    errorNodes[name].textContent = error || '';
    errorNodes[name].hidden = !error;
  }
  const invalid = Object.keys(errors).length > 0;
  results.hidden = invalid;
  errorSummary.hidden = !invalid;
  if (invalid) return false;

  const unit = units[fields.goal.value];
  const unitFor = (count) => Math.abs(count) === 1 ? unit.singular : unit.plural;
  renderValue(currentOutput, simulation.current);
  renderValue(scenarioOutput, simulation.scenario);
  const unitLabels = document.querySelectorAll('[data-result-unit]');
  unitLabels[0].textContent = `${unitFor(simulation.current)} / mês`;
  unitLabels[1].textContent = `${unitFor(simulation.scenario)} / mês`;
  const delta = simulation.difference;
  differenceOutput.dataset.direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'same';
  differenceOutput.textContent = delta === 0
    ? `Sem alteração no número de ${unit.plural}.`
    : `${delta > 0 ? '+' : '−'}${countFormat.format(Math.abs(delta))} ${unitFor(delta)} por mês`;
  document.getElementById('simulation-context').textContent = `${countFormat.format(input.visits)} ${input.visits === 1 ? 'visita' : 'visitas'} por mês · de ${rateFormat.format(input.currentRate)}% para ${rateFormat.format(input.scenarioRate)}%`;
  return true;
}

form.addEventListener('input', updateSimulation);
form.addEventListener('change', updateSimulation);
form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!updateSimulation()) form.querySelector('[aria-invalid="true"]')?.focus();
});
form.addEventListener('reset', (event) => {
  event.preventDefault();
  fields.visits.value = '3000';
  fields.currentRate.value = '1';
  fields.scenarioRate.value = '2';
  fields.goal.value = 'contacts';
  updateSimulation();
});
updateSimulation();
document.getElementById('simulation-reset').disabled = false;
