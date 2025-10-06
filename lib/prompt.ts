export function productPrompt(input: {
  title: string;
  body?: string | null;
  vendor?: string;
  product_type?: string;
  bullets?: string[];
  tone?: 'neutro' | 'premium' | 'tech' | 'friendly';
  lang?: 'it' | 'en';
}) {
  const tone = input.tone ?? 'neutro';
  const lang = input.lang ?? 'it';
  return `
Sei un copywriter e-commerce. Scrivi in ${lang} con tono ${tone}.
Rendi il testo conciso, orientato alla conversione, SEO-friendly.
Restituisci JSON con chiavi: title, subtitle, bullets[], description_html, tags[].

Contesto:
- Titolo attuale: ${input.title}
- Brand: ${input.vendor ?? '-'}
- Categoria: ${input.product_type ?? '-'}
- Descrizione attuale (HTML ammesso): ${input.body ?? '-'}

Regole:
- bullets: 3–6 righe, incisive.
- description_html: 120–250 parole, HTML pulito (<p>, <ul>, <li>, <strong>).
- title: max 70 caratteri; subtitle: max 90.
- tags: 5–10 parole chiave semplici (lowercase).

Output: SOLO JSON valido, niente testo extra.
`.trim();
}
