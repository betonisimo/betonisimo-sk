"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { ArrowDown, ArrowLeft, ArrowUp, Eye, ImagePlus, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { uploadImageAction } from "@/actions/adminActions";
import { deleteBlogPost, saveBlogPost } from "@/actions/blogActions";
import BlogBody from "@/components/blog/BlogBody";

const inputClass = "w-full border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-red-600";
const labelClass = "mb-2 block text-xs font-black uppercase tracking-wider text-slate-600";

function initialBlock(block, index) {
  return { ...block, key: `existing-${index}` };
}

export default function BlogEditor({ post }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: post?.title || "",
    excerpt: post?.excerpt || "",
    coverImage: post?.coverImage || "",
    coverAlt: post?.coverAlt || "",
    seoTitle: post?.seoTitle || "",
    seoDescription: post?.seoDescription || "",
  });
  const [blocks, setBlocks] = useState((post?.blocks || []).map(initialBlock));
  const [uploading, setUploading] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const updateBlock = (key, changes) => setBlocks((current) => current.map((block) => block.key === key ? { ...block, ...changes } : block));
  const addBlock = (type) => setBlocks((current) => [...current, { key: crypto.randomUUID(), type, text: "", url: "", alt: "", caption: "", label: "" }]);
  const removeBlock = (key) => setBlocks((current) => current.filter((block) => block.key !== key));
  const moveBlock = (index, direction) => setBlocks((current) => {
    const target = index + direction;
    if (target < 0 || target >= current.length) return current;
    const next = [...current];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  });

  async function upload(file, onSuccess) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Vyberte obrázok vo formáte JPG, PNG alebo WebP.");
      return;
    }
    setError("");
    setUploading((count) => count + 1);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.9,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/webp",
      });
      const payload = new FormData();
      payload.append("file", compressed, file.name.replace(/\.[^/.]+$/, "") + ".webp");
      const result = await uploadImageAction(payload);
      if (!result.success || !result.url) throw new Error(result.error || "Nahrávanie zlyhalo.");
      onSuccess(result.url);
    } catch (uploadError) {
      setError(uploadError.message || "Obrázok sa nepodarilo nahrať.");
    } finally {
      setUploading((count) => count - 1);
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    if (saving || uploading) return;
    setSaving(true);
    setError("");
    const status = event.nativeEvent.submitter?.value || "DRAFT";
    try {
      const result = await saveBlogPost({
        id: post?.id,
        ...form,
        blocks: blocks.map(({ key, ...block }) => block),
        status,
      });
      if (!result.success) throw new Error(result.error || "Článok sa nepodarilo uložiť.");
      router.push("/admin/blog");
      router.refresh();
    } catch (saveError) {
      setError(saveError.message || "Článok sa nepodarilo uložiť.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!post || saving || !window.confirm("Naozaj chcete tento článok natrvalo vymazať?")) return;
    setSaving(true);
    setError("");
    try {
      const result = await deleteBlogPost(post.id);
      if (!result.success) throw new Error(result.error || "Článok sa nepodarilo vymazať.");
      router.push("/admin/blog");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError.message || "Článok sa nepodarilo vymazať.");
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-24 pt-28 text-slate-950 md:px-6 md:pt-40">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin/blog" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-600"><ArrowLeft size={18} /> Späť na články</Link>
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-red-600">Administrácia / Blog</p>
            <h1 className="mt-2 text-3xl font-black uppercase tracking-tight md:text-5xl">{post ? "Upraviť článok" : "Nový článok"}</h1>
            {post && <p className="mt-3 break-all text-sm text-slate-500">Adresa: /blog/{post.slug}</p>}
          </div>
          <button type="button" onClick={() => setPreview((value) => !value)} className="inline-flex items-center gap-2 border border-slate-300 bg-white px-5 py-3 text-xs font-black uppercase tracking-wider hover:border-red-600"><Eye size={17} /> {preview ? "Zavrieť náhľad" : "Náhľad obsahu"}</button>
        </div>

        {preview && (
          <div className="mb-8 border border-slate-200 bg-white p-6 shadow-sm md:p-10">
            <p className="mb-2 text-xs font-black uppercase tracking-wider text-red-600">Náhľad článku</p>
            <h2 className="text-3xl font-black tracking-tight md:text-5xl">{form.title || "Názov článku"}</h2>
            <p className="mt-4 text-lg text-slate-600">{form.excerpt}</p>
            {form.coverImage && <div className="relative my-8 aspect-[16/9] w-full"><Image src={form.coverImage} alt={form.coverAlt || "Hlavná fotografia"} fill sizes="(max-width: 768px) 100vw, 900px" className="object-cover" /></div>}
            <BlogBody blocks={blocks} />
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <section className="border border-slate-200 bg-white p-6 shadow-sm md:p-10">
            <h2 className="mb-7 border-l-4 border-red-600 pl-4 text-xl font-black uppercase">Základné informácie</h2>
            <div className="space-y-6">
              <div><label htmlFor="blog-title" className={labelClass}>Názov článku *</label><input id="blog-title" required maxLength={160} value={form.title} onChange={(e) => setField("title", e.target.value)} placeholder="Napríklad: Ako si vybrať betónový plot" className={inputClass} /></div>
              <div><label htmlFor="blog-excerpt" className={labelClass}>Krátky úvod pre kartu článku *</label><textarea id="blog-excerpt" maxLength={320} rows={3} value={form.excerpt} onChange={(e) => setField("excerpt", e.target.value)} placeholder="V dvoch vetách vysvetlite, čo sa čitateľ dozvie." className={inputClass} /></div>
              <div>
                <span className={labelClass}>Hlavná fotografia *</span>
                {form.coverImage && <div className="relative mb-3 aspect-[16/8] w-full"><Image src={form.coverImage} alt={form.coverAlt || "Náhľad hlavnej fotografie"} fill sizes="(max-width: 768px) 100vw, 900px" className="object-cover" /></div>}
                <label className="inline-flex cursor-pointer items-center gap-2 border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold hover:border-red-600"><ImagePlus size={18} /> {form.coverImage ? "Vymeniť fotografiu" : "Nahrať fotografiu"}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { upload(e.target.files?.[0], (url) => setField("coverImage", url)); e.target.value = ""; }} /></label>
                {form.coverImage && <button type="button" onClick={() => setField("coverImage", "")} className="ml-3 text-sm font-bold text-red-600 hover:underline">Odstrániť</button>}
              </div>
              <div><label htmlFor="blog-cover-alt" className={labelClass}>Popis hlavnej fotografie pre vyhľadávače a čítačky *</label><input id="blog-cover-alt" maxLength={180} value={form.coverAlt} onChange={(e) => setField("coverAlt", e.target.value)} placeholder="Čo je na fotografii?" className={inputClass} /></div>
            </div>
          </section>

          <section className="border border-slate-200 bg-white p-6 shadow-sm md:p-10">
            <h2 className="border-l-4 border-red-600 pl-4 text-xl font-black uppercase">Obsah článku</h2>
            <p className="mb-7 mt-3 text-sm text-slate-500">Pridávajte odseky, nadpisy a fotografie v ľubovoľnom poradí. Šípkami zmeníte ich pozíciu.</p>
            <div className="space-y-5">
              {blocks.map((block, index) => (
                <div key={block.key} className="border border-slate-200 bg-slate-50 p-4 md:p-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500">{index + 1}. {({ paragraph: "Odsek", heading2: "Hlavný nadpis H2", heading3: "Podnadpis H3", image: "Fotografia", list: "Zoznam", link: "Odkaz" })[block.type]}</span>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => moveBlock(index, -1)} disabled={index === 0} aria-label="Posunúť blok vyššie" className="p-2 hover:bg-white disabled:opacity-30"><ArrowUp size={18} /></button>
                      <button type="button" onClick={() => moveBlock(index, 1)} disabled={index === blocks.length - 1} aria-label="Posunúť blok nižšie" className="p-2 hover:bg-white disabled:opacity-30"><ArrowDown size={18} /></button>
                      <button type="button" onClick={() => removeBlock(block.key)} aria-label="Odstrániť blok" className="p-2 text-red-600 hover:bg-white"><Trash2 size={18} /></button>
                    </div>
                  </div>
                  {block.type === "paragraph" && <textarea aria-label={`Text odseku ${index + 1}`} rows={6} value={block.text} onChange={(e) => updateBlock(block.key, { text: e.target.value })} placeholder="Napíšte text odseku..." className={inputClass} />}
                  {(block.type === "heading2" || block.type === "heading3") && <input aria-label={`Text nadpisu ${index + 1}`} value={block.text} onChange={(e) => updateBlock(block.key, { text: e.target.value })} placeholder="Napíšte nadpis..." className={inputClass} />}
                  {block.type === "list" && <textarea aria-label={`Položky zoznamu ${index + 1}`} rows={5} value={block.text} onChange={(e) => updateBlock(block.key, { text: e.target.value })} placeholder="Každú položku napíšte do nového riadku" className={inputClass} />}
                  {block.type === "link" && <div className="space-y-3"><input aria-label={`Text odkazu ${index + 1}`} value={block.label || ""} onChange={(e) => updateBlock(block.key, { label: e.target.value })} placeholder="Text odkazu, napríklad Pozrite si naše vzory" className={inputClass} /><input aria-label={`Adresa odkazu ${index + 1}`} value={block.url || ""} onChange={(e) => updateBlock(block.key, { url: e.target.value })} placeholder="/katalog alebo https://..." className={inputClass} /></div>}
                  {block.type === "image" && (
                    <div className="space-y-3">
                      {block.url && <div className="relative aspect-[16/9] w-full"><Image src={block.url} alt={block.alt || "Náhľad fotografie"} fill sizes="(max-width: 768px) 100vw, 900px" className="object-cover" /></div>}
                      <label className="inline-flex cursor-pointer items-center gap-2 border border-slate-300 bg-white px-4 py-3 text-sm font-bold hover:border-red-600"><ImagePlus size={18} /> {block.url ? "Vymeniť fotografiu" : "Nahrať fotografiu"}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { upload(e.target.files?.[0], (url) => updateBlock(block.key, { url })); e.target.value = ""; }} /></label>
                      <input aria-label={`Alternatívny popis fotografie ${index + 1}`} maxLength={180} value={block.alt} onChange={(e) => updateBlock(block.key, { alt: e.target.value })} placeholder="Popis fotografie pre čítačky a Google *" className={inputClass} />
                      <input aria-label={`Popis pod fotografiou ${index + 1}`} maxLength={300} value={block.caption} onChange={(e) => updateBlock(block.key, { caption: e.target.value })} placeholder="Voliteľný popis pod fotografiou" className={inputClass} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {[["paragraph", "Odsek"], ["heading2", "Nadpis H2"], ["heading3", "Podnadpis H3"], ["image", "Fotografia"], ["list", "Zoznam"], ["link", "Odkaz"]].map(([type, name]) => (
                <button type="button" key={type} onClick={() => addBlock(type)} className="inline-flex items-center gap-2 border border-slate-300 px-4 py-3 text-xs font-black uppercase tracking-wider hover:border-red-600 hover:text-red-600"><Plus size={16} /> {name}</button>
              ))}
            </div>
          </section>

          <section className="border border-slate-200 bg-white p-6 shadow-sm md:p-10">
            <h2 className="mb-3 border-l-4 border-red-600 pl-4 text-xl font-black uppercase">Google a zdieľanie</h2>
            <p className="mb-7 text-sm text-slate-500">Voliteľné polia. Ak ich necháte prázdne, použije sa názov a úvod článku.</p>
            <div className="space-y-5">
              <div><label htmlFor="blog-seo-title" className={labelClass}>Názov vo výsledkoch vyhľadávania</label><input id="blog-seo-title" maxLength={100} value={form.seoTitle} onChange={(e) => setField("seoTitle", e.target.value)} className={inputClass} /></div>
              <div><label htmlFor="blog-seo-description" className={labelClass}>Popis vo výsledkoch vyhľadávania</label><textarea id="blog-seo-description" maxLength={320} rows={3} value={form.seoDescription} onChange={(e) => setField("seoDescription", e.target.value)} className={inputClass} /></div>
            </div>
          </section>

          {error && <p role="alert" className="border-l-4 border-red-600 bg-red-50 p-4 font-bold text-red-700">{error}</p>}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {post ? <button type="button" onClick={handleDelete} disabled={saving || uploading > 0} className="inline-flex items-center gap-2 px-3 py-3 text-sm font-bold text-red-600 hover:underline disabled:opacity-50"><Trash2 size={18} /> Vymazať článok</button> : <span />}
            <div className="flex flex-wrap gap-3">
              <button type="submit" value="DRAFT" disabled={saving || uploading > 0} className="inline-flex items-center gap-2 border border-slate-900 bg-white px-5 py-4 text-xs font-black uppercase tracking-wider hover:bg-slate-100 disabled:opacity-50"><Save size={17} /> {post?.status === "PUBLISHED" ? "Presunúť medzi koncepty" : "Uložiť koncept"}</button>
              <button type="submit" value="PUBLISHED" disabled={saving || uploading > 0} className="inline-flex items-center gap-2 bg-red-600 px-6 py-4 text-xs font-black uppercase tracking-wider text-white hover:bg-slate-950 disabled:opacity-50">{saving || uploading > 0 ? <Loader2 size={17} className="animate-spin" /> : <ArrowUp size={17} />} {post?.status === "PUBLISHED" ? "Uložiť zmeny" : "Publikovať článok"}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
