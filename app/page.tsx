
'use client';
import { useState } from 'react';

export default function Home() {
  const [csv, setCsv] = useState<string>('');
  const [generated, setGenerated] = useState<string>('');
  const [shopifyId, setShopifyId] = useState<string>('');

  const handleGenerate = async () => {
    const res = await fetch('/api/generate', { method: 'POST', body: csv });
    if (!res.ok) { alert('Generate error'); return; }
    const text = await res.text();
    setGenerated(text);
  };

  const handlePublish = async () => {
    const res = await fetch('/api/shopify/publish', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ productId: shopifyId, description: generated })
    });
    const j = await res.json();
    alert(j.ok ? 'Published ✅' : `Publish failed: ${j.error || 'unknown'}`);
  };

  return (
    <main>
      <section>
        <h1 style={{ fontSize: 36, marginBottom: 8 }}>Dashboard</h1>
        <p>Upload CSV of products, generate AI descriptions, and publish to Shopify.</p>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }}>
        <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
          <h3>1) Upload CSV or paste sample</h3>
          <textarea value={csv} onChange={e=>setCsv(e.target.value)} rows={10} style={{ width:'100%' }} placeholder="sku,title,features..."></textarea>
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <button onClick={()=>setCsv('SKU123, Running Shoes, breathable mesh; cushioned sole; lightweight')}>Sample</button>
            <button onClick={()=>setCsv('')}>Clear</button>
          </div>
        </div>
        <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
          <h3>2) Generate with AI</h3>
          <button onClick={handleGenerate}>Generate</button>
          <textarea value={generated} onChange={e=>setGenerated(e.target.value)} rows={10} style={{ width:'100%', marginTop: 8 }} placeholder="Generated description..."></textarea>
        </div>
      </section>

      <section style={{ marginTop: 24, border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
        <h3>3) Publish to Shopify</h3>
        <input value={shopifyId} onChange={e=>setShopifyId(e.target.value)} placeholder="Shopify Product ID" style={{ width: '100%', marginBottom: 8 }} />
        <button onClick={handlePublish}>Publish</button>
        <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>Requires env SHOPIFY_SHOP / SHOPIFY_ADMIN_TOKEN / SHOPIFY_API_VERSION</p>
      </section>
    </main>
  );
}
