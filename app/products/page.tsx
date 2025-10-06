// app/products/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Item = {
  id: string;
  title: string;
  handle: string;
  status: string;
  createdAt: string;
  image: string | null;
};

export default function ProductsPage() {
  // ricerca
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // open by id
  const [id, setId] = useState("");

  const disabledOpen = !/^\d+$/.test(id);

  async function search(cursorParam: string | null = null) {
    if (!q.trim()) {
      setItems([]);
      setCursor(null);
      setNextCursor(null);
      return;
    }
    setLoading(true);
    try {
      const url = new URL(`/api/products/search`, location.origin);
      url.searchParams.set("q", q.trim());
      url.searchParams.set("limit", "10");
      if (cursorParam) url.searchParams.set("cursor", cursorParam);
      const r = await fetch(url.toString(), { cache: "no-store" });
      const j = await r.json();
      if (!cursorParam) setItems(j.items || []);
      else setItems((prev) => [...prev, ...(j.items || [])]);
      setCursor(cursorParam);
      setNextCursor(j.nextCursor || null);
    } finally {
      setLoading(false);
    }
  }

  // avvia ricerca quando si preme Enter
  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") search(null);
  }

  const total = useMemo(() => items.length, [items]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Products</h1>

      {/* Open by ID */}
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className="block text-sm text-gray-600">Apri per ID</label>
          <input
            className="border px-3 py-2 rounded w-56"
            placeholder="Product ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
        </div>
        <Link
          href={disabledOpen ? "#" : `/products/${id}`}
          className={`px-4 py-2 rounded text-white ${disabledOpen ? "bg-gray-400 pointer-events-none" : "bg-black"}`}
        >
          Open
        </Link>
      </div>

      {/* Search */}
      <div className="space-y-3">
        <div className="flex items-end gap-2">
          <div className="grow">
            <label className="block text-sm text-gray-600">Cerca (titolo, vendor, handle…)</label>
            <input
              className="border px-3 py-2 rounded w-full"
              placeholder="es: title:*polo* OR vendor:'lacoste'"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKey}
            />
          </div>
          <button
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
            disabled={loading}
            onClick={() => search(null)}
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </div>

        <div className="text-sm text-gray-500">
          Risultati: <b>{total}</b>
        </div>

        <ul className="divide-y border rounded">
          {items.map((it) => (
            <li key={`${it.id}`} className="p-3 flex items-center gap-3">
              {it.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.image} alt="" className="h-10 w-10 rounded object-cover" />
              ) : (
                <div className="h-10 w-10 rounded bg-gray-100" />
              )}
              <div className="min-w-0 grow">
                <div className="truncate font-medium">{it.title}</div>
                <div className="text-xs text-gray-500">
                  ID {it.id} • {it.status} • {new Date(it.createdAt).toLocaleDateString()}
                </div>
              </div>
              <Link
                href={`/products/${it.id}`}
                className="ml-auto px-3 py-1 rounded bg-gray-900 text-white text-sm"
              >
                Apri
              </Link>
            </li>
          ))}
          {items.length === 0 && !loading && (
            <li className="p-3 text-sm text-gray-500">Nessun risultato</li>
          )}
        </ul>

        {nextCursor && (
          <button
            className="px-4 py-2 rounded bg-gray-200"
            disabled={loading}
            onClick={() => search(nextCursor)}
          >
            {loading ? "Loading…" : "Carica altri"}
          </button>
        )}
      </div>
    </div>
  );
}
