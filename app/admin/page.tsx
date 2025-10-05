'use client';
import { useState } from 'react';

type Metrics = {
  openai_generations_30d: number;
  shopify_publishes_30d: number;
  stripe_active_subscriptions: number;
  shopify_recent_products: { id: number; title: string; updated_at: string; handle: string }[];
}

export default function AdminHome() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true); setErr('');
    const r = await fetch('/api/admin/metrics');
    const j = await r.json();
    setLoading(false);
    if (!j.ok) { setErr(j.error || 'error'); return; }
    setMetrics(j.metrics);
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  return (
    <main>
      <h1>Shoppilot — Admin</h1>
      <p style={{color:'#666'}}>Metriche rapide (ultimi 30 giorni).</p>

      <div style={{display:'flex', gap:12, margin:'16px 0'}}>
        <button onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Load metrics'}</button>
        <button onClick={logout} style={{background:'#eee'}}>Logout</button>
      </div>

      {err && <p style={{color:'crimson'}}>{err}</p>}

      {metrics && (
        <>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12}}>
            <div style={{border:'1px solid #eee', borderRadius:12, padding:16}}>
              <h3>OpenAI Generations</h3>
              <p style={{fontSize:28}}>{metrics.openai_generations_30d}</p>
            </div>
            <div style={{border:'1px solid #eee', borderRadius:12, padding:16}}>
              <h3>Active Subscriptions</h3>
              <p style={{fontSize:28}}>{metrics.stripe_active_subscriptions}</p>
            </div>
            <div style={{border:'1px solid #eee', borderRadius:12, padding:16}}>
              <h3>Publishes to Shopify</h3>
              <p style={{fontSize:28}}>{metrics.shopify_publishes_30d}</p>
            </div>
          </div>

          <div style={{marginTop:24, border:'1px solid #eee', borderRadius:12, padding:16}}>
            <h3>Recent Shopify Products</h3>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead><tr><th align="left">ID</th><th align="left">Title</th><th align="left">Updated</th><th align="left">Admin</th></tr></thead>
              <tbody>
                {metrics.shopify_recent_products.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.title}</td>
                    <td>{new Date(p.updated_at).toLocaleString()}</td>
                    <td><a href={`https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP ?? ''}.myshopify.com/admin/products/${p.id}`} target="_blank">Open</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
