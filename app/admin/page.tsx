'use client';
import { useState } from 'react';

type Status = {
  ok: boolean;
  openai?: string;
  stripe?: string;
  shopify?: string;
  error?: string;
}

export default function AdminHome() {
  const [st, setSt] = useState<Status | null>(null);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    setLoading(true);
    const r = await fetch('/api/admin/status');
    const j = await r.json();
    setSt(j);
    setLoading(false);
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  return (
    <main>
      <h1>Shoppilot — Admin</h1>
      <p style={{color:'#666'}}>Health checks e utilità.</p>

      <div style={{display:'grid', gap:12, margin:'16px 0'}}>
        <button onClick={check} disabled={loading}>
          {loading ? 'Checking…' : 'Run Health Checks'}
        </button>
        <button onClick={logout} style={{background:'#eee', color:'#333'}}>Logout</button>
      </div>

      {st && (
        <div style={{border:'1px solid #eee', borderRadius:12, padding:16}}>
          <h3>Results</h3>
          <ul>
            <li>OpenAI: {st.openai || '—'}</li>
            <li>Stripe: {st.stripe || '—'}</li>
            <li>Shopify: {st.shopify || '—'}</li>
          </ul>
          <p style={{color: st.ok ? 'green':'crimson'}}>OK: {String(st.ok)}</p>
          {st.error && <pre style={{whiteSpace:'pre-wrap'}}>{st.error}</pre>}
        </div>
      )}
    </main>
  );
}
