"use client";

import Image from "next/image";
import { useState } from "react";
import { inputClass, buttonClass } from "./AdminFormUI";
import { slugFromTitle } from "@/lib/catalog-urls";

export default function CityCatalogPicker({ collections, selectedIds, onChange }) {
  const [search, setSearch] = useState("");
  const query = slugFromTitle(search);
  const visible = collections.filter((collection) => slugFromTitle(`${collection.title} ${collection.slug}`).includes(query));
  function toggle(id) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((value) => value !== id) : [...selectedIds, id]);
  }
  return <div className="space-y-4">
    <input type="hidden" name="collectionIds" value={JSON.stringify(selectedIds)} />
    {collections.length > 0 ? <>
      <div><label htmlFor="city-catalog-search" className="mb-2 block text-sm font-bold text-slate-700">Hľadať vzor</label><input id="city-catalog-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Názov alebo model" className={inputClass} /></div>
      <div className="flex flex-wrap items-center justify-between gap-3"><p role="status" className="text-sm font-semibold text-slate-600">Vybrané vzory: {selectedIds.length}</p>{selectedIds.length > 0 && <button type="button" className={buttonClass} onClick={() => onChange([])}>Zrušiť výber</button>}</div>
      <div className="grid max-h-[32rem] gap-3 overflow-y-auto p-1 sm:grid-cols-2">
        {visible.map((collection) => <label key={collection.id} className={`flex min-w-0 cursor-pointer items-center gap-3 border p-3 ${selectedIds.includes(collection.id) ? "border-red-600 bg-red-50" : "border-slate-200 bg-slate-50"}`}>
          <input type="checkbox" checked={selectedIds.includes(collection.id)} onChange={() => toggle(collection.id)} disabled={!selectedIds.includes(collection.id) && selectedIds.length >= 100} aria-label={`Zobraziť vzor ${collection.title}`} className="h-5 w-5 shrink-0 accent-red-600" />
          <span className="relative h-16 w-16 shrink-0 bg-white"><Image src={collection.mainImage || "/og-image.jpg"} alt="" fill sizes="64px" className="object-cover" /></span>
          <span className="min-w-0"><span className="block break-words text-sm font-bold text-slate-900">{collection.title}</span><span className="mt-1 block break-all text-xs text-slate-500">/katalog/{collection.slug}</span></span>
        </label>)}
      </div>
      {!visible.length && <p className="text-sm text-slate-500">Žiadne vzory nezodpovedajú vyhľadávaniu.</p>}
    </> : <p className="text-sm text-slate-500">V katalógu zatiaľ nie sú žiadne vzory.</p>}
  </div>;
}
