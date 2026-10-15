export const WHATSAPP_NUMBER = '5544997249334';
export const WHATSAPP_DISPLAY = '+55 (44) 99724-9334';
export const QUOTE_GOALS = Object.freeze({ contacts: 'Contatos', quotes: 'Pedidos de orçamento', bookings: 'Agendamentos', sales: 'Vendas' });
export const QUOTE_INTERESTS = Object.freeze({ guidance: 'Quero uma orientação', economic: 'Modelo econômico — R$ 600,00', custom: 'Projeto personalizado — sob orçamento' });

const asText = (value) => typeof value === 'string' ? value : '';
const cleanLine = (value) => asText(value).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();

export function normalizeQuote(raw = {}) {
  const values = {
    name: cleanLine(raw.name),
    segment: cleanLine(raw.segment),
    goal: asText(raw.goal),
    interest: asText(raw.interest),
    website: cleanLine(raw.website),
    notes: asText(raw.notes).replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim(),
  };
  const errors = {};
  if (!values.name || values.name.length > 80) errors.name = 'Informe seu nome, com até 80 caracteres.';
  if (!values.segment || values.segment.length > 120) errors.segment = 'Informe o segmento do negócio, com até 120 caracteres.';
  if (!Object.hasOwn(QUOTE_GOALS, values.goal)) errors.goal = 'Selecione o objetivo da página.';
  if (!Object.hasOwn(QUOTE_INTERESTS, values.interest)) errors.interest = 'Selecione o tipo de projeto.';
  if (values.notes.length > 800) errors.notes = 'Use até 800 caracteres nos detalhes.';
  if (values.website) {
    try {
      if (values.website.length > 2048) throw new Error('URL longa');
      const hostWithPort = /^(?:[^/?#:@]+\.[^/?#:@]+|localhost|\[[\da-f:]+\]):\d+(?:[/?#]|$)/i.test(values.website);
      const withProtocol = values.website.startsWith('//') ? `https:${values.website}`
        : /^[a-z][a-z\d+.-]*:/i.test(values.website) && !hostWithPort ? values.website : `https://${values.website}`;
      const url = new URL(withProtocol);
      if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) throw new Error('URL inválida');
      values.website = url.href;
    } catch {
      errors.website = 'Informe um site HTTP ou HTTPS válido, sem usuário ou senha, ou deixe em branco.';
    }
  }
  return { valid: Object.keys(errors).length === 0, errors, values };
}

export function buildQuoteMessage(raw) {
  const result = normalizeQuote(raw);
  if (!result.valid) throw new TypeError('Revise os dados do projeto antes de gerar a mensagem.');
  const v = result.values;
  const lines = [
    'Olá! Quero um orçamento para uma landing page.', '',
    `Nome: ${v.name}`,
    `Segmento: ${v.segment}`,
    `Objetivo: ${QUOTE_GOALS[v.goal]}`,
    `Interesse: ${QUOTE_INTERESTS[v.interest]}`,
  ];
  if (v.website) lines.push(`Site atual: ${v.website}`);
  if (v.notes) lines.push(`Detalhes: ${v.notes}`);
  return lines.join('\n');
}

export function buildWhatsAppLink(message, phone = WHATSAPP_NUMBER) {
  if (typeof phone !== 'string' || !/^[1-9]\d{7,14}$/.test(phone)) throw new TypeError('Destino do WhatsApp inválido.');
  if (typeof message !== 'string' || !message.trim()) throw new TypeError('Mensagem vazia.');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
