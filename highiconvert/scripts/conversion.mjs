export function simulateConversions({ visits, currentRate, scenarioRate }) {
  const errors = {};
  if (!Number.isFinite(visits) || !Number.isInteger(visits) || visits < 0 || visits > 1_000_000) {
    errors.visits = 'Informe um número inteiro de visitas entre 0 e 1.000.000.';
  }
  for (const [name, rate] of [['currentRate', currentRate], ['scenarioRate', scenarioRate]]) {
    if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
      errors[name] = 'Informe uma taxa entre 0 e 100%.';
    } else if (Math.abs(rate * 100 - Math.round(rate * 100)) > 1e-8) {
      errors[name] = 'Use até duas casas decimais na taxa.';
    }
  }
  if (Object.keys(errors).length) return { valid: false, errors };
  const current = visits * currentRate / 100;
  const scenario = visits * scenarioRate / 100;
  const rawDifference = scenario - current;
  const difference = Math.abs(rawDifference) < 1e-9 ? 0 : rawDifference;
  return { valid: true, current, scenario, difference };
}
