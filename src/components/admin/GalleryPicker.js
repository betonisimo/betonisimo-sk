"use client";
/* eslint-disable @next/next/no-img-element -- Admin image previews. */
import { useRef, useState } from "react";
import { ImagePlus, Loader2, Star, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { uploadEditorImage } from "@/lib/upload-image-client";
import { buttonClass, inputClass } from "./AdminFormUI";

export default function GalleryPicker({
  defaultImages = [], defaultAlts = {}, name = "gallery", altsName = "imageAlts",
  encoding = "csv", featured = true, maxImages = 24, disabled = false, onUpload, onChange,
}) {
  const [images, setImages] = useState(defaultImages.filter(Boolean));
  const [alts, setAlts] = useState(defaultAlts);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const input = useRef(null);
  function change(nextImages, nextAlts = alts) {
    setImages(nextImages);
    setAlts(nextAlts);
    onChange?.(nextImages, nextAlts);
  }
  async function upload(files) {
    if (!files.length || lock.current) return;
    if (maxImages > 1 && images.length + files.length > maxImages) { setError(`Môžete pridať najviac ${maxImages} fotografií.`); return; }
    lock.current = true;
    setUploading(true);
    setError("");
    onUpload?.(1);
    let next = [...images];
    try {
      for (const file of files) {
        const url = await uploadEditorImage(file);
        next = maxImages === 1 ? [url] : [...next, url];
        change(next);
      }
    } catch (error) { setError(error.message || "Nahrávanie zlyhalo."); }
    finally { lock.current = false; setUploading(false); onUpload?.(-1); if (input.current) input.current.value = ""; }
  }
  const isDisabled = disabled || uploading;
  function move(index, target) {
    const next = [...images];
    next.splice(target, 0, next.splice(index, 1)[0]);
    change(next);
  }
  return <div>
    <input type="hidden" name={name} value={encoding === "json" ? JSON.stringify(images) : encoding === "single" ? images[0] || "" : images.join(",")} />
    <input type="hidden" name={altsName} value={encoding === "single" ? alts[images[0]] || "" : JSON.stringify(Object.fromEntries(images.map((url) => [url, alts[url] || ""])))} />
    <div className={maxImages === 1 ? "max-w-xl" : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"}>
      {images.map((url, index) => <div key={url} className="mb-3 min-w-0 border border-slate-200 bg-slate-50 p-3">
        <div className="relative mb-3 aspect-[4/3] bg-slate-100"><img src={url} alt={alts[url] || ""} className="h-full w-full object-contain" />{featured && index === 0 && <span className="absolute bottom-2 left-2 flex items-center gap-1 bg-slate-950 px-2 py-1 text-xs font-bold text-white"><Star size={12} /> Hlavná</span>}</div>
        <label className="block text-sm font-bold">Popis fotografie (alt)<input className={inputClass + " mt-2 !px-2 !text-sm"} disabled={isDisabled} value={alts[url] || ""} maxLength={180} placeholder="Čo je na fotografii?" onChange={(e) => change(images, { ...alts, [url]: e.target.value })} /></label>
        <div className="mt-3 flex flex-wrap gap-2">
          {featured && index > 0 && <button type="button" disabled={isDisabled} onClick={() => move(index, 0)} className={buttonClass + " !p-2 !text-xs"}>Dať ako hlavnú</button>}
          {!featured && maxImages > 1 && <>
            <button type="button" aria-label={`Posunúť fotografiu ${index + 1} vyššie`} disabled={isDisabled || index === 0} className={buttonClass + " !p-2"} onClick={() => move(index, index - 1)}><ArrowLeft size={16} /></button>
            <button type="button" aria-label={`Posunúť fotografiu ${index + 1} nižšie`} disabled={isDisabled || index === images.length - 1} className={buttonClass + " !p-2"} onClick={() => move(index, index + 1)}><ArrowRight size={16} /></button>
          </>}
          <button type="button" disabled={isDisabled} onClick={() => change(images.filter((_, i) => i !== index))} className={buttonClass + " !p-2 text-red-600"} aria-label={`Odstrániť fotografiu ${index + 1}`}><Trash2 size={16} /></button>
        </div>
      </div>)}
    </div>
    <button type="button" disabled={isDisabled || (maxImages !== 1 && images.length >= maxImages)} onClick={() => input.current?.click()} className={buttonClass}>{uploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}{uploading ? "Nahrávam…" : maxImages === 1 && images.length ? "Vymeniť fotografiu" : "Pridať fotografiu"}</button>
    <input ref={input} aria-label={`Nahrať fotografie: ${name}`} type="file" multiple={maxImages > 1} accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={isDisabled} onChange={(e) => upload(Array.from(e.target.files || []))} />
    <p className="mt-3 text-xs leading-5 text-slate-500">JPG, PNG, WebP, do 20 MB. Automatická kompresia na šírku najviac 1920 px.{featured && ' Prvá fotografia je hlavná.'}</p>
    {error && <p role="alert" className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
  </div>;
}
