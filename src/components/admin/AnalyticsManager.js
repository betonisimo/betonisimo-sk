"use client";
import { useState } from "react";
import { saveAnalyticsScripts } from "@/actions/scriptActions";

export default function AnalyticsManager({ initialValue }) {
  const [content, setContent] = useState(initialValue || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const result = await saveAnalyticsScripts(content);
    setIsSaving(false);
    if (result.success) alert("Skripty boli úspešne uložené!");
    else alert("Chyba pri ukladaní: " + result.error);
  };

  return (
    <div className="bg-white p-8 md:p-10 border-t border-slate-100">
      <div className="mb-6 border-l-4 border-[#dc2626] pl-6">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Analytics Tracking</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-3">// Global_Scripts / Pixel_Management</p>
      </div>
      <textarea
        className="w-full h-64 p-4 font-mono text-xs border border-slate-200 focus:border-[#dc2626] outline-none transition-colors"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="<script>...</script>"
      />
      <button 
        onClick={handleSave}
        disabled={isSaving}
        className="mt-6 px-10 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#dc2626] transition-all rounded-[2px]"
      >
        {isSaving ? "Ukladám..." : "Uložiť skripty"}
      </button>
    </div>
  );
}