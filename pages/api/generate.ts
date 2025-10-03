
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).send('Missing OPENAI_API_KEY');

    const csv = (req.body || '').toString().slice(0, 4000);
    const prompt = `Write a concise, SEO-friendly product description in English from the following CSV row: ${csv}`;

    // Minimal call using OpenAI Responses API (compatible with fetch)
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You write high-converting e-commerce copy.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });
    if (!r.ok) {
      const txt = await r.text();
      return res.status(500).send(`OpenAI error: ${txt}`);
    }
    const data = await r.json();
    const text = data.choices?.[0]?.message?.content || 'No output';
    res.status(200).send(text);
  } catch (e:any) {
    res.status(500).send(e?.message || 'error');
  }
}
