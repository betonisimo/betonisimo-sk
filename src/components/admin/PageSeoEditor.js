"use client";

import { useState } from "react";
import { savePageSeo } from "@/actions/seoActions";

const pages = [
  ["home", "Hlavná stránka", "/"],
  ["katalog", "Katalóg", "/katalog"],
  ["doplnky", "Doplnky", "/doplnky"],
  ["realizacie", "Realizácie", "/realizacie"],
  ["kontakt", "Kontakt", "/kontakt"],
  ["blog", "Blog", "/blog"],
];

function PageForm({ pageKey, label, path, initialSeo }) {
  const [title, setTitle] = useState(initialSeo?.title || "");
  const [description, setDescription] = useState(initialSeo?.description || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const result = await savePageSeo(pageKey, { title, description });
      setMessage(result.success ? "Uložené." : result.error);
    } catch {
      setMessage("SEO nastavenia sa nepodarilo uložiť.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <details className="border-b border-slate-200 p-5 last:border-0">
      <summary className="cursor-pointer font-bold text-slate-900">{label} <span className="ml-2 font-mono text-xs font-normal text-slate-400">{path}</span></summary>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <p className="text-xs text-slate-500">Prázdne pole použije pôvodný automatický text.</p>
        <label className="block text-sm font-bold text-slate-700">Nadpis vo vyhľadávaní (meta title)
          <input maxLength={100} value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-[2px] border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-red-600" />
        </label>
        <label className="block text-sm font-bold text-slate-700">Popis vo vyhľadávaní (meta description)
          <textarea maxLength={320} rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 w-full rounded-[2px] border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-red-600" />
        </label>
        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} className="bg-slate-900 px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-red-600 disabled:opacity-50">{saving ? "Ukladám..." : "Uložiť SEO"}</button>
          {message && <span role="status" className="text-sm text-slate-600">{message}</span>}
        </div>
      </form>
    </details>
  );
}

export default function PageSeoEditor({ settings = {} }) {
  return (
    <section id="seo-stranok" className="overflow-hidden bg-white shadow-xl">
      <div className="border-b border-slate-200 p-8 md:p-10">
        <h2 className="border-l-4 border-red-600 pl-6 text-3xl font-black uppercase tracking-tighter text-slate-900">SEO stránok</h2>
        <p className="mt-3 text-sm text-slate-500">Meta title a description patria celej stránke. Popis každej fotografie (alt) sa upravuje pri konkrétnej fotografii.</p>
      </div>
      {pages.map(([key, label, path]) => <PageForm key={key} pageKey={key} label={label} path={path} initialSeo={settings[key]} />)}
    </section>
  );
}
