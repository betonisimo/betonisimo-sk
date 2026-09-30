"use client";
import { useState } from "react";
import { createProject, updateProject, deleteProject } from "@/actions/adminActions";
import { normalizeContent } from "@/lib/rich-content";
import RichContent from "@/components/content/RichContent";
import RichEditor from "./editor/RichEditor";
import GalleryPicker from "./GalleryPicker";
import SeoFields from "./SeoFields";
import { AdminFormShell, FormActions, FormField, FormSection, buttonClass, useAdminForm } from "./AdminFormUI";

export default function ProjectForm({ project, seo = {} }) {
  const backHref = "/admin/editor#realizacie";
  const state = useAdminForm(backHref);
  const [content, setContent] = useState(() => normalizeContent(project?.content, { fallback: project?.description || "" }));
  const [preview, setPreview] = useState(false);
  function save(event) {
    event.preventDefault();
    const data = { ...Object.fromEntries(new FormData(event.currentTarget)), content };
    state.run(() => project ? updateProject(project.id, data) : createProject(data));
  }
  function remove() {
    if (window.confirm("Naozaj chcete túto realizáciu natrvalo vymazať?")) state.run(() => deleteProject(project.id));
  }
  return <AdminFormShell title={project ? "Upraviť realizáciu" : "Nová realizácia"} section="Realizácie" backHref={backHref} slug={project ? `/projekt/${project.slug}` : undefined}>
    <form onSubmit={save} className="space-y-6" aria-busy={state.busy}>
      <fieldset disabled={state.busy} className="min-w-0 space-y-6">
        <FormSection title="Základné informácie">
          <FormField name="title" label="Názov realizácie" required maxLength={160} defaultValue={project?.title || ""} />
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField name="category" label="Kategória / štýl" required maxLength={160} defaultValue={project?.category || ""} />
            <FormField name="location" label="Lokalita" maxLength={160} defaultValue={project?.location || ""} />
          </div>
        </FormSection>
        <FormSection title="Hlavná fotografia">
          <GalleryPicker defaultImages={project?.mainImage ? [project.mainImage] : []} defaultAlts={seo.imageAlts || {}} name="mainImage" altsName="mainImageAlt" encoding="single" maxImages={1} featured={false} disabled={state.busy} onUpload={state.onUpload} />
        </FormSection>
        <FormSection title="Popis realizácie" description="Text, nadpisy, zoznamy a fotografie môžete usporiadať v ľubovoľnom poradí.">
          <RichEditor initialContent={content} onChange={setContent} onUpload={state.onUpload} onError={state.setError} disabled={state.busy} />
          <button type="button" className={buttonClass} onClick={() => setPreview(!preview)}>{preview ? "Zavrieť náhľad" : "Náhľad obsahu"}</button>
          {preview && <div className="border-t border-slate-200 pt-6"><RichContent content={content} /></div>}
        </FormSection>
        <FormSection title="Galéria realizácie" description="Samostatná fotogaléria na stránke realizácie zostáva zachovaná.">
          <GalleryPicker defaultImages={project?.images || []} defaultAlts={seo.imageAlts || {}} name="images" encoding="json" maxImages={Math.max(12, project?.images?.length || 0)} featured={false} disabled={state.busy} onUpload={state.onUpload} />
        </FormSection>
        <FormSection title="Vyhľadávanie a zdieľanie"><SeoFields seo={seo} /></FormSection>
      </fieldset>
      <FormActions state={state} onDelete={project ? remove : undefined} />
    </form>
  </AdminFormShell>;
}
