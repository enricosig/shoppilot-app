'use client';
import { useState } from 'react';

export default function AdminLogin() {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const next = typeof window !== 'undefined'
    ? (new URLSearchParams(window.location.search).get('next') || '/admin')
    : '/admin';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const r = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ key }),
    });
    setLoading(false);
    if (r.ok) window.location.href = next;
    else alert('Invalid key');
  };

  return (
    <main style={{maxWidth:420, margin:'80px auto', border:'1px solid #eee', borderRadius:12, padding:24}}>
      <h1>Admin Login</h1>
      <p style={{color:'#666'}}>Inserisci la tua ADMIN_KEY per accedere.</p>
      <form onSubmit={submit} style={{marginTop:16}}>
        <input
          type="password"
          value={key}
          onChange={e=>setKey(e.target.value)}
          placeholder="ADMIN_KEY"
          style={{width:'100%', padding:10, borderRadius:8, border:'1px solid #ccc'}}
        />
        <button disabled={loading || !key} style={{marginTop:12}}>
          {loading ? 'Verifica…' : 'Entra'}
        </button>
      </form>
    </main>
  );
}
