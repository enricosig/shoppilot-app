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
      messages: [
        { role: 'system', content: 'Restituisci SOLO JSON valido.' },
        { role: 'user', content: prompt },
      ],
    }),
  });
  if (!r.ok) throw new Error(`OpenAI error ${r.status}`);
  const json = await r.json();
  const content = json.choices?.[0]?.message?.content?.trim() || '{}';
  return JSON.parse(content);
}
