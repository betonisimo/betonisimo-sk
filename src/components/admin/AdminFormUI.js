"use client";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export const inputClass = "w-full min-w-0 rounded-[2px] border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-950 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 disabled:opacity-60";
export const buttonClass = "inline-flex items-center justify-center gap-2 rounded-[2px] border border-slate-300 bg-white px-4 py-3 text-sm font-bold hover:border-red-600 focus-visible:outline-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-50";

export function AdminFormShell({ title, section, backHref, children, slug }) {
  return <main className="min-h-screen bg-slate-50 px-4 pb-24 pt-32 text-slate-950 md:px-6 md:pt-40"><div className="mx-auto max-w-5xl min-w-0">
    <Link href={backHref} className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-600"><ArrowLeft size={18} /> Späť na {section.toLowerCase()}</Link>
    <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Administrácia / {section}</p>
    <h1 className="mb-3 mt-2 text-3xl font-black uppercase tracking-tight md:text-5xl">{title}</h1>
    {slug && <p className="break-all text-sm text-slate-500">Adresa: {slug}</p>}
    <div className="mt-8 space-y-6">{children}</div>
  </div></main>;
}

export function FormSection({ title, description, children }) {
  return <section className="min-w-0 border border-slate-200 bg-white p-5 shadow-sm md:p-8"><h2 className="mb-5 border-l-4 border-red-600 pl-4 text-xl font-black">{title}</h2>{description && <p className="mb-5 text-sm leading-6 text-slate-500">{description}</p>}<div className="space-y-5">{children}</div></section>;
}

export function FormField({ name, label, multiline, ...props }) {
  const Tag = multiline ? "textarea" : "input";
  return <div><label htmlFor={name} className="mb-2 block text-sm font-bold text-slate-700">{label}{props.required ? " *" : ""}</label><Tag id={name} name={name} className={inputClass} {...props} /></div>;
}

// A ref closes the same-tick double-submit/upload race, not only the visual state.
export function useAdminForm(backHref) {
  const router = useRouter();
  const busyRef = useRef(false);
  const uploadRef = useRef(0);
  const [busy, setBusy] = useState(false);
  const [uploads, setUploads] = useState(0);
  const [error, setError] = useState("");
  const onUpload = useCallback((delta) => {
    uploadRef.current = Math.max(0, uploadRef.current + delta);
    setUploads(uploadRef.current);
  }, []);
  async function run(action) {
    if (busyRef.current || uploadRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await action();
      if (!result?.success) throw new Error(result?.error || "Zmeny sa nepodarilo uložiť.");
      router.push(backHref);
      router.refresh();
    } catch (error) {
      setError(error.message || "Nastala chyba. Skúste to znova.");
      busyRef.current = false;
      setBusy(false);
    }
  }
  return { busy, uploads, disabled: busy || uploads > 0, error, setError, onUpload, run };
}

export function FormActions({ state, onDelete, children }) {
  return <div className="space-y-4">
    {state.error && <p role="alert" className="border-l-4 border-red-600 bg-red-50 p-4 font-semibold text-red-700">{state.error}</p>}
    {state.uploads > 0 && <p role="status" className="text-sm text-slate-600">Nahrávajú sa fotografie. Pred uložením počkajte.</p>}
    <div className="flex flex-wrap items-center justify-between gap-4">{onDelete ? <button type="button" disabled={state.disabled} onClick={onDelete} className={buttonClass + " text-red-600"}><Trash2 size={17} /> Vymazať</button> : <span />}
      {children || <button type="submit" disabled={state.disabled} className={buttonClass + " !border-red-600 !bg-red-600 !text-white hover:!bg-red-700"}>{state.busy ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />} {state.busy ? "Ukladám…" : "Uložiť zmeny"}</button>}
    </div>
  </div>;
}
