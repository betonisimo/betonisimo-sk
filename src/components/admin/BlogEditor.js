"use client";
/* eslint-disable @next/next/no-img-element -- Preview of the current cover before saving. */
import { useState } from "react";
import { deleteBlogPost, saveBlogPost } from "@/actions/blogActions";
import { normalizeContent } from "@/lib/rich-content";
import BlogBody from "@/components/blog/BlogBody";
import GalleryPicker from "./GalleryPicker";
import RichEditor from "./editor/RichEditor";
import SeoFields from "./SeoFields";
import { AdminFormShell, FormActions, FormField, FormSection, buttonClass, useAdminForm } from "./AdminFormUI";

export default function BlogEditor({ post }) {
  const state = useAdminForm("/admin/blog");
  const [content, setContent] = useState(() => normalizeContent(post?.blocks));
  const [title, setTitle] = useState(post?.title || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [cover, setCover] = useState({ url: post?.coverImage || "", alt: post?.coverAlt || "" });
  const [preview, setPreview] = useState(false);
  function save(event) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    // Pressing Enter in a field must not unpublish an existing article.
    const status = event.nativeEvent.submitter?.value || post?.status || "DRAFT";
    state.run(() => saveBlogPost({ ...fields, id: post?.id, blocks: content, status }));
  }
  function remove() {
    if (window.confirm("Naozaj chcete tento článok natrvalo vymazať?")) state.run(() => deleteBlogPost(post.id));
  }
  return <AdminFormShell title={post ? "Upraviť článok" : "Nový článok"} section="Blog" backHref="/admin/blog" slug={post ? `/blog/${post.slug}` : undefined}>
    <form onSubmit={save} className="space-y-6" aria-busy={state.busy}>
      <fieldset disabled={state.busy} className="min-w-0 space-y-6">
        <FormSection title="Základné informácie">
          <FormField name="title" label="Názov článku" required maxLength={160} value={title} onChange={(e) => setTitle(e.target.value)} />
          <FormField name="excerpt" label="Krátky úvod pre kartu článku" multiline rows={3} maxLength={320} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
          <p className="text-sm text-slate-500">Koncept stačí pomenovať. Na publikovanie vyplňte aj úvod, hlavnú fotografiu a jej alt.</p>
        </FormSection>
        <FormSection title="Hlavná fotografia článku">
          <GalleryPicker defaultImages={post?.coverImage ? [post.coverImage] : []} defaultAlts={post?.coverImage ? { [post.coverImage]: post.coverAlt } : {}} name="coverImage" altsName="coverAlt" encoding="single" maxImages={1} featured={false} disabled={state.busy} onUpload={state.onUpload} onChange={(images, alts) => setCover({ url: images[0] || "", alt: alts[images[0]] || "" })} />
        </FormSection>
        <FormSection title="Obsah článku">
          <RichEditor initialContent={content} onChange={setContent} onUpload={state.onUpload} onError={state.setError} disabled={state.busy} />
          <button type="button" className={buttonClass} onClick={() => setPreview(!preview)}>{preview ? "Zavrieť náhľad" : "Náhľad obsahu"}</button>
          {preview && <div className="border-t border-slate-200 pt-6"><h2 className="mb-4 text-3xl font-black">{title}</h2><p className="mb-8 text-lg text-slate-600">{excerpt}</p>{cover.url && <img src={cover.url} alt={cover.alt} className="mb-8 aspect-[16/9] w-full object-cover" />}<BlogBody blocks={content} /></div>}
        </FormSection>
        <FormSection title="Vyhľadávanie a zdieľanie"><SeoFields seo={{ title: post?.seoTitle, description: post?.seoDescription }} /></FormSection>
      </fieldset>
      <FormActions state={state} onDelete={post ? remove : undefined}>
        <div className="flex flex-wrap gap-3">
          <button type="submit" value="DRAFT" disabled={state.disabled} className={buttonClass}>{post?.status === "PUBLISHED" ? "Presunúť medzi koncepty" : "Uložiť koncept"}</button>
          <button type="submit" value="PUBLISHED" disabled={state.disabled} className={buttonClass + " !border-red-600 !bg-red-600 !text-white"}>{state.busy ? "Ukladám…" : post?.status === "PUBLISHED" ? "Uložiť zmeny" : "Publikovať článok"}</button>
        </div>
      </FormActions>
    </form>
  </AdminFormShell>;
}
