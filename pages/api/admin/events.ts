import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '../../../lib/db';

function toCSV(rows: any[]) {
  if (!rows.length) return 'id,kind,created_at\n';
  const esc = (s: any) => {
    const v = s == null ? '' : String(s);
    return /[",\n]/.test(v) ? `"${v.replace(/"/g,'""')}"` : v;
  };
  const headers = Object.keys(rows[0]);
  const head = headers.join(',');
  const body = rows.map(r => headers.map(h => esc(r[h])).join(',')).join('\n');
  return head + '\n' + body + '\n';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const days = Math.max(1, Math.min(Number(req.query.days ?? 30), 365));
    const { rows } = await sql/*sql*/`
      select id, kind, created_at
      from events
      where created_at >= now() - interval '${days} days'
      order by created_at desc
      limit 5000
    `;
    const format = (req.query.format || 'json').toString();
    if (format === 'csv') {
      const csv = toCSV(rows);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="events_'+days+'d.csv"');
      return res.status(200).send(csv);
    }
    return res.status(200).json({ ok: true, days, count: rows.length, events: rows });
  } catch (e:any) {
    return res.status(500).json({ ok:false, error: e?.message || 'events error' });
  }
}
