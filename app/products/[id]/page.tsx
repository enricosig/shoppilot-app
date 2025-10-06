"use client";

import { useEffect, useMemo, useState } from "react";

/* ---------------- UI helpers (no deps) ---------------- */
function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg className={`animate-spin h-5 w-5 ${className}`} viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

function Toast({ msg, type }: { msg: string; type: "ok" | "err" }) {
  const base =
    "fixed left-1/2 -translate-x-1/2 bottom-6 z-50 rounded-md px-4 py-2 shadow-md text-sm font-medium";
  const color = type === "ok" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white";
  return <div className={`${base} ${color}`}>{msg}</div>;
}

/* ---------------- Page ---------------- */
export default function ProductEditor({ params }: { params: { id: string } }) {
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [p, setP] = useState<any>(null); // prodotto originale
  const [gen, setGen] = useState<any>(null); // generazione AI

  const [tone, setTone] = useState<"neutro" | "premium" | "tech" | "friendly">("neutro");
  const [lang, setLang] = useState<"it" | "en">("it");

  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  function show(msg: string, type: "ok" | "err" = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2200);
  }

  async function safeJson(r: Response) {
    const t = await r.text();
    try {
      return JSON.parse(t || "{}");
    } catch {
      throw new Error(`Invalid JSON: ${t?.slice(0, 200)}`);
    }
  }

  /* ----- 1) carica prodotto ----- */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const r = await fetch(`/api/products/${id}`, { cache: "no-store" });
        if (!r.ok) throw new Error(`GET /api/products/${id} -> ${r.status}`);
        const j = await safeJson(r);
        if (alive) setP(j);
      } catch (e: any) {
        console.error(e);
        show(e?.message || "Errore nel caricamento prodotto", "err");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  /* ----- 2) genera copy ----- */
  async function onGenerate() {
    try {
      setGenerating(true);
      setGen(null);
      const r = await fetch(`/api/products/${id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tone, lang }),
      });
      if (!r.ok) throw new Error(`POST /generate -> ${r.status}`);
      const j = await safeJson(r);
      if (!j?.ok) throw new Error(j?.error || "Errore generazione");
      setGen(j.result);
      show("Copy generato");
    } catch (e: any) {
      console.error(e);
      show(e?.message || "Errore generazione", "err");
    } finally {
      setGenerating(false);
    }
  }

  /* ----- 3) push to Shopify ----- */
  async function onPush() {
    if (!gen) return;
    try {
      setSaving(true);
      const r = await fetch(`/api/products/${id}/push`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: gen.title,
          description_html: gen.description_html,
          tags: gen.tags,
        }),
      });
      const j = await safeJson(r);
      if (!r.ok || !j?.ok) throw new Error(j?.error || `PUT /push -> ${r.status}`);
      show("Aggiornato su Shopify");
      // opzionale: aggiorna l’originale a schermo
      setP((old: any) => ({
        ...(old || {}),
        title: gen.title ?? old?.title,
        body_html: gen.description_html ?? old?.body_html,
        tags: Array.isArray(gen.tags) ? gen.tags.join(", ") : old?.tags,
      }));
    } catch (e: any) {
      console.error(e);
      show(e?.message || "Errore aggiornamento", "err");
    } finally {
      setSaving(false);
    }
  }

  const bulletsCount = useMemo(() => (Array.isArray(gen?.bullets) ? gen.bullets.length : 0), [gen]);

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-3 text-gray-600">
        <Spinner />
        <span>Loading…</span>
      </div>
    );
  }

  if (!p?.id) {
    return (
      <div className="p-6 text-rose-700">
        Prodotto non trovato o errore di connessione. Verifica l’ID e le variabili d’ambiente Shopify.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <h1 className="text-2xl font-bold">Product #{id}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Colonna originale */}
        <div className="space-y-2">
          <h2 className="font-semibold">Originale</h2>

          <label className="text-sm text-gray-500">Titolo</label>
          <div className="border rounded p-2">{p?.title || <span className="text-gray-400">—</span>}</div>

          <label className="text-sm text-gray-500 mt-2">Descrizione</label>
          <div
            className="border rounded p-3 prose max-w-none"
            dangerouslySetInnerHTML={{ __html: p?.body_html || "<p class='text-gray-400'>—</p>" }}
          />
        </div>

        {/* Colonna generazione */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-sm text-gray-600">Tono</label>
              <select
                className="border rounded px-2 py-1"
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
              >
                <option value="neutro">Neutro</option>
                <option value="premium">Premium</option>
                <option value="tech">Tech</option>
                <option value="friendly">Friendly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Lingua</label>
              <select
                className="border rounded px-2 py-1"
                value={lang}
                onChange={(e) => setLang(e.target.value as any)}
              >
                <option value="it">Italiano</option>
                <option value="en">English</option>
              </select>
            </div>

            <button
              onClick={onGenerate}
              disabled={generating}
              className={`ml-auto px-4 py-2 rounded text-white ${
                generating ? "bg-gray-500" : "bg-black hover:opacity-90"
              } flex items-center gap-2`}
            >
              {generating && <Spinner className="h-4 w-4" />} Generate
            </button>
          </div>

          {gen ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-500">Titolo</div>
              <div className="border rounded p-2">{gen.title || <span className="text-gray-400">—</span>}</div>

              <div className="text-sm text-gray-500 flex items-center gap-2">
                Bullets <span className="text-gray-400">({bulletsCount})</span>
                {Array.isArray(gen.bullets) && gen.bullets.length > 0 && (
                  <button
                    className="ml-auto text-xs underline"
                    onClick={() => {
                      navigator.clipboard.writeText(gen.bullets.join("\n"));
                      show("Bullets copiati");
                    }}
                  >
                    Copia
                  </button>
                )}
              </div>
              <ul className="list-disc ml-6">
                {gen.bullets?.map((b: string, i: number) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>

              <div className="text-sm text-gray-500 flex items-center">
                Descrizione
                {gen.description_html && (
                  <button
                    className="ml-auto text-xs underline"
                    onClick={() => {
                      navigator.clipboard.writeText(gen.description_html);
                      show("Descrizione copiata");
                    }}
                  >
                    Copia HTML
                  </button>
                )}
              </div>
              <div
                className="border rounded p-3 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: gen.description_html || "<p class='text-gray-400'>—</p>" }}
              />

              <div className="text-sm text-gray-500">Tags</div>
              <div className="border rounded p-2">
                {Array.isArray(gen.tags) && gen.tags.length > 0 ? gen.tags.join(", ") : <span className="text-gray-400">—</span>}
              </div>

              <button
                onClick={onPush}
                disabled={saving}
                className={`px-4 py-2 rounded text-white ${
                  saving ? "bg-gray-500" : "bg-emerald-600 hover:opacity-90"
                } flex items-center gap-2`}
              >
                {saving && <Spinner className="h-4 w-4" />} Push to Shopify
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-500 border rounded p-3">
              Premi <b>Generate</b> per creare titolo, bullets, descrizione e tag.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
