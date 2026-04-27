"use client";
import { useState, useRef } from "react";
import { Loader2, ImagePlus, X, Star } from "lucide-react"; // ДОБАВИЛИ ИКОНКУ STAR
import { uploadImageAction } from "@/actions/adminActions";
import imageCompression from "browser-image-compression";

export default function GalleryPicker({ defaultImages = [] }) {
  const [images, setImages] = useState(defaultImages);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    
    const compressionOptions = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: "image/webp"
    };
    
    try {
      const uploadedUrls = [];
      
      for (const file of files) {
        const compressedFile = await imageCompression(file, compressionOptions);
        const formData = new FormData();
        formData.append("file", compressedFile, file.name.replace(/\.[^/.]+$/, ".webp")); 
        
        const res = await uploadImageAction(formData);
        if (res.success && res.url) {
          uploadedUrls.push(res.url);
        }
      }
      
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error("Chyba pri nahrávaní:", error);
      alert("Nepodarilo sa nahrať obrázky.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // НОВАЯ ФУНКЦИЯ: СДЕЛАТЬ ФОТО ГЛАВНЫМ (ПЕРЕМЕСТИТЬ В НАЧАЛО)
  const makeMain = (index) => {
    if (index === 0) return; // Оно уже главное
    setImages((prev) => {
      const newArray = [...prev];
      const selectedImage = newArray.splice(index, 1)[0]; // Вырезаем фотку
      newArray.unshift(selectedImage); // Вставляем в самое начало
      return newArray;
    });
  };

  return (
    <div className="w-full">
      <input type="hidden" name="gallery" value={images.join(",")} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {images.map((img, idx) => (
          <div key={idx} className="relative aspect-square rounded-[2px] overflow-hidden group bg-slate-100 border border-slate-200">
            <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
            
            {/* КНОПКА УДАЛЕНИЯ */}
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-[2px] opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
            >
              <X size={14} />
            </button>

            {/* МЕТКА ИЛИ КНОПКА "СДЕЛАТЬ ГЛАВНОЙ" */}
            {idx === 0 ? (
              <span className="absolute bottom-2 left-2 bg-black text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-[2px] z-10 flex items-center gap-1">
                <Star size={10} className="fill-white" /> Hlavná
              </span>
            ) : (
              <button
                type="button"
                onClick={() => makeMain(idx)}
                className="absolute bottom-2 left-2 bg-slate-900/90 hover:bg-[#dc2626] text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-[2px] opacity-0 group-hover:opacity-100 transition-all z-10"
              >
                Dať ako hlavnú
              </button>
            )}
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="aspect-square flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-[2px] bg-slate-50 hover:bg-slate-100 transition-colors text-slate-500 disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 size={24} className="animate-spin text-red-600" />
          ) : (
            <ImagePlus size={24} />
          )}
          <span className="text-[10px] font-bold uppercase tracking-widest">
             {isUploading ? "Nahrávam..." : "Pridať foto"}
          </span>
        </button>
      </div>

      <input
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
      
      <p className="text-[10px] text-slate-400 font-mono mt-2">
        // Fotografie sa automaticky komprimujú (max 1920px). Prvý obrázok so štítkom "HLAVNÁ" bude použitý ako náhľad.
      </p>
    </div>
  );
}