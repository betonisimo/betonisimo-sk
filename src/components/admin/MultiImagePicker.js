"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, X, Plus } from "lucide-react";
import { uploadImage } from "@/actions/uploadActions";

export default function MultiImagePicker({ defaultValue = [], defaultAlts = {} }) {
  const [images, setImages] = useState(defaultValue);
  const [alts, setAlts] = useState(defaultAlts);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  async function handleFileChange(event) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadedUrls = [...images];

      // Загружаем каждый файл по очереди (используем твой готовый uploadImage)
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        
        const result = await uploadImage(formData);
        if (result.success) {
          uploadedUrls.push(result.url);
        }
      }

      setImages(uploadedUrls);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Chyba pri nahrávaní obrázkov.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(indexToRemove) {
    setImages(images.filter((_, index) => index !== indexToRemove));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-bold text-slate-700">Galéria projektu (viac fotiek)</label>
        <span className="text-xs text-slate-400">{images.length} obrázkov</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {/* Список уже загруженных фото */}
        {images.map((url, index) => (
          <div key={index} className="rounded-xl overflow-hidden bg-slate-100 group border border-slate-200">
            <div className="relative aspect-square">
            <img src={url} className="w-full h-full object-cover" alt={alts[url] || `Fotografia projektu ${index + 1}`} />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-lg active:opacity-100"
            >
              <X size={14} />
            </button>
            </div>
            <label className="block p-2 text-xs font-bold text-slate-600">
              Popis fotografie (alt)
              <input type="text" maxLength={180} value={alts[url] || ""} onChange={(event) => setAlts((current) => ({ ...current, [url]: event.target.value }))} placeholder="Čo je na fotografii?" className="mt-1 w-full rounded border border-slate-200 bg-white px-2 py-2 text-slate-900 outline-none focus:border-red-600" />
            </label>
          </div>
        ))}

        {/* Кнопка добавления */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-amber-500 hover:text-amber-500 hover:bg-amber-50 transition-all"
        >
          {isUploading ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <>
              <Plus size={24} />
              <span className="text-xs font-bold uppercase tracking-wider">Pridať</span>
            </>
          )}
        </button>
      </div>

      <input
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Скрытое поле для передачи массива в Server Action (JSON строкой) */}
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="imageAlts" value={JSON.stringify(Object.fromEntries(images.map((url) => [url, alts[url] || ""])))} />
    </div>
  );
}
