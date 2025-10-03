
'use client';
import { useEffect, useState } from 'react';

export default function Billing() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('success')) {
      document.cookie = 'sub_ok=1; path=/; max-age=2592000';
      setOk(true);
    }
  }, []);

  const checkout = async () => {
    setLoading(true);
    const res = await fetch('/api/stripe/checkout', { method: 'POST' });
    const j = await res.json();
    setLoading(false);
    if (j.url) window.location.href = j.url;
    else alert('Checkout error');
  };

  return (
    <main>
      <h1>Billing</h1>
      <p>{ok ? 'Subscription active ✅' : 'Subscribe to activate full features.'}</p>
      <button onClick={checkout} disabled={loading}>{loading ? 'Redirecting…' : 'Subscribe'}</button>
      <p style={{ fontSize: 12, color:'#666' }}>You will be redirected to Stripe Checkout.</p>
    </main>
  );
}
