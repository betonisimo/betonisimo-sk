"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2 } from "lucide-react";
import { duplicateCityPage } from "@/actions/cityPageActions";

export default function DuplicateCityPageButton({ id, title }) {
  const router = useRouter();
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function duplicate() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await duplicateCityPage(id);
      if (!result.success) throw new Error(result.error);
      router.push(`/admin/city-pages/${result.id}`);
      router.refresh();
    } catch (error) {
      setError(error.message || "Stránku sa nepodarilo duplikovať.");
      pending.current = false;
      setBusy(false);
    }
  }
  return <div>
    <button type="button" disabled={busy} onClick={duplicate} aria-label={`Duplikovať ${title}`} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 hover:text-red-600 disabled:opacity-50">
      {busy ? <Loader2 size={15} className="animate-spin" /> : <Copy size={15} />}{busy ? "Duplikujem…" : "Duplikovať"}
    </button>
    {error && <p role="alert" className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
  </div>;
}
