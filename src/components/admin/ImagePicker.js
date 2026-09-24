"use client";
import { useState } from "react";
import { uploadImage } from "@/actions/uploadActions"; // Импортируем наш новый экшен
import { Upload, X, ImageIcon } from "lucide-react";

export default function ImagePicker({ defaultValue, defaultAlt = "", name = "mainImage" }) {
  const [image, setImage] = useState(defaultValue || "");
  const [alt, setAlt] = useState(defaultAlt);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadImage(formData);

    if (result.success) {
      setImage(result.url); // Сохраняем URL из облака (https://...)
      setAlt("");
    } else {
      alert("Chyba: " + result.error);
    }
    setLoading(false);
  };

  return (
    <div className="relative group">
      {/* Скрытое поле, которое реально отправляет URL в форму Prisma */}
      <input type="hidden" name={name} value={image} />
      <input type="hidden" name="mainImageAlt" value={alt} />
      
      <div className="relative aspect-video bg-slate-100 overflow-hidden flex items-center justify-center">
        {image ? (
          <>
            <img src={image} className="w-full h-full object-cover" alt="Preview" />
            <button 
              type="button"
              onClick={() => { setImage(""); setAlt(""); }}
              className="absolute top-4 right-4 p-2 bg-white/90 rounded-full text-red-500 shadow-lg hover:bg-white"
            >
              <X size={20} />
            </button>
          </>
        ) : (
          <label className="cursor-pointer flex flex-col items-center gap-3 text-slate-400 hover:text-slate-600 transition-colors">
            <div className="p-4 bg-white rounded-full shadow-sm">
              <Upload size={32} />
            </div>
            <span className="font-bold text-sm uppercase tracking-widest">
              {loading ? "Nahrávam..." : "Nahrať hlavnú fotku"}
            </span>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
              disabled={loading}
            />
          </label>
        )}
      </div>
      {image && (
        <label className="block p-4 text-sm font-bold text-slate-700">
          Popis hlavnej fotografie (alt)
          <input type="text" maxLength={180} value={alt} onChange={(event) => setAlt(event.target.value)} placeholder="Čo je na fotografii?" className="mt-2 w-full rounded border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-red-600" />
        </label>
      )}
    </div>
  );
}
