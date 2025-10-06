// lib/ai.ts
/**
 * Chiama OpenAI in JSON mode e fa fallback robusto se arrivano fence ```json
 * o testo accessorio. Restituisce sempre un oggetto JS.
 */
export async function generateProductCopy(prompt: string) {
  const key = process.env.OPENAI_API_KEY!;
  if (!key) throw new Error('Missing OPENAI_API_KEY');

  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      // Forza JSON mode per evitare code-fences
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Restituisci SOLO JSON valido. Nessun testo fuori dal JSON.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!r.ok) throw new Error(`OpenAI error ${r.status}`);
  const json = await r.json();
  let content: string = json?.choices?.[0]?.message?.content ?? '';

  // Fallback robusto nel caso qualche modello ignori JSON mode e metta fence
  content = content.trim();

  // Rimuove eventuali ```json ... ``` oppure ``` ... ```
  if (content.startsWith('```')) {
    content = content.replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim();
  }

  // Se c’è rumore, prova ad estrarre il primo oggetto { ... } bilanciato
  if (!(content.startsWith('{') && content.endsWith('}'))) {
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      content = content.slice(start, end + 1);
    }
  }

  try {
    return JSON.parse(content);
  } catch (e) {
    console.error('[OpenAI parse error] content=', content);
    throw new Error('OpenAI returned non-JSON content');
  }
}
