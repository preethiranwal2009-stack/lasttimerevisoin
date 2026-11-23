// Calls the Anthropic API. The API key stays here on the server (never in the web page).
const hits = {}; // simple per-visitor limit (resets when the function restarts)
exports.handler = async (event) => {
  const H = { 'Content-Type': 'application/json' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: H, body: JSON.stringify({ error: 'POST only' }) };
  const ip = (event.headers['x-nf-client-connection-ip'] || event.headers['x-forwarded-for'] || 'x').split(',')[0];
  const now = Date.now();
  hits[ip] = (hits[ip] || []).filter(t => now - t < 3600e3);
  const LIMIT = parseInt(process.env.HOURLY_LIMIT || '10', 10);
  if (hits[ip].length >= LIMIT) return { statusCode: 429, headers: H, body: JSON.stringify({ error: 'Limit reached. Please try again in an hour.' }) };
  let prompt;
  try { prompt = JSON.parse(event.body).prompt; } catch (e) {}
  if (!prompt || prompt.length > 80000) return { statusCode: 400, headers: H, body: JSON.stringify({ error: 'Chapter is too long or empty.' }) };
  hits[ip].push(now);
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: process.env.MODEL || 'claude-haiku-5-5', max_tokens: 4000, messages: [{ role: 'user', content: prompt }] })
    });
    const d = await r.json();
    if (!r.ok) return { statusCode: 502, headers: H, body: JSON.stringify({ error: 'AI service error. Please try again later.' }) };
    const text = (d.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
    return { statusCode: 200, headers: H, body: JSON.stringify({ text }) };
  } catch (e) {
    return { statusCode: 500, headers: H, body: JSON.stringify({ error: 'Server error. Please try again.' }) };
  }
};
