"use client";
/* eslint-disable @next/next/no-img-element -- Preview of an unsaved editorial cover. */
import { useState } from "react";
import { deleteCityPage, saveCityPage } from "@/actions/cityPageActions";
import { normalizeContent } from "@/lib/rich-content";
import { suggestedCatalogSlug } from "@/lib/catalog-urls";
import { parseCitySlug } from "@/lib/city-pages";
import { SITE_URL } from "@/lib/site-url";
import RichContent from "@/components/content/RichContent";
import StyleGrid from "@/components/home/StyleGrid";
import CityCatalogPicker from "./CityCatalogPicker";
import GalleryPicker from "./GalleryPicker";
import RichEditor from "./editor/RichEditor";
import SeoFields from "./SeoFields";
import { AdminFormShell, FormActions, FormField, FormSection, buttonClass, useAdminForm } from "./AdminFormUI";

export default function CityPageEditor({ page, collections = [] }) {
  const state = useAdminForm("/admin/city-pages");
  const [content, setContent] = useState(() => normalizeContent(page?.blocks));
  const [title, setTitle] = useState(page?.title || "");
  const [excerpt, setExcerpt] = useState(page?.excerpt || "");
  const [manualSlug, setManualSlug] = useState(page?.urlMode === "manual" ? page.slug : null);
  const [cover, setCover] = useState({ url: page?.coverImage || "", alt: page?.coverAlt || "" });
  const [preview, setPreview] = useState(false);
  const [collectionIds, setCollectionIds] = useState(() => (page?.collectionIds || []).filter((id) => collections.some((collection) => collection.id === id)));
  const selectedCollections = collectionIds.map((id) => collections.find((collection) => collection.id === id)).filter(Boolean);
  const slug = manualSlug ?? (title.trim() ? suggestedCatalogSlug(title, page, "stranka") : "");
  const published = page?.status === "PUBLISHED";
  function save(event) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    const status = event.nativeEvent.submitter?.value || page?.status || "DRAFT";
    state.run(() => saveCityPage({ ...fields, id: page?.id, blocks: content, status }));
  }
  function remove() {
    if (window.confirm("Naozaj chcete túto stránku natrvalo vymazať?")) state.run(() => deleteCityPage(page.id));
  }
  return <AdminFormShell title={page ? "Upraviť SEO stránku mesta" : "Nová SEO stránka mesta"} section="SEO stránky miest" backHref="/admin/city-pages" slug={page ? `/${page.slug}` : undefined}>
    <form onSubmit={save} className="space-y-6" aria-busy={state.busy}>
      <fieldset disabled={state.busy} className="min-w-0 space-y-6">
        <FormSection title="Základné informácie">
          <FormField name="title" label="Názov stránky" required maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} />
          <FormField name="excerpt" label="Krátky úvod" multiline rows={3} maxLength={320} value={excerpt} onChange={(event) => setExcerpt(event.target.value)} />
          <p className="text-sm text-slate-500">Koncept stačí pomenovať. Pred publikovaním doplňte obsah a popisy pridaných fotografií.</p>
        </FormSection>
        <FormSection title="URL stránky">
          <FormField name="slug" label="URL adresa" required maxLength={160} value={slug} pattern="[a-z0-9]+(-[a-z0-9]+)*" spellCheck={false} autoCapitalize="none"
            aria-describedby="city-url-preview city-url-help" placeholder="betonove-ploty-trnava" onChange={(event) => setManualSlug(event.target.value)}
            onBlur={() => { if (manualSlug !== null) { try { setManualSlug(parseCitySlug(manualSlug)); } catch { /* Preserve invalid input for correction. */ } } }} />
          <input type="hidden" name="urlMode" value={manualSlug === null ? "auto" : "manual"} />
          <p id="city-url-preview" className="break-all text-sm font-semibold text-slate-700">{SITE_URL}/{slug || "…"}</p>
          {manualSlug !== null && <button type="button" className={buttonClass} onClick={() => setManualSlug(null)}>Vytvoriť URL z názvu</button>}
          <p id="city-url-help" className="text-sm leading-6 text-slate-500">Adresa sa dopĺňa podľa názvu a môžete ju upraviť. Zadávajte iba časť za lomkou. Pri zmene URL sa pôvodná adresa presmeruje na novú.</p>
        </FormSection>
        <FormSection title="Hlavná fotografia" description="Voliteľná fotografia nad obsahom stránky.">
          <GalleryPicker defaultImages={page?.coverImage ? [page.coverImage] : []} defaultAlts={page?.coverImage ? { [page.coverImage]: page.coverAlt } : {}} name="coverImage" altsName="coverAlt" encoding="single" maxImages={1} featured={false} disabled={state.busy} onUpload={state.onUpload} onChange={(images, alts) => setCover({ url: images[0] || "", alt: alts[images[0]] || "" })} />
        </FormSection>
        <FormSection title="Obsah stránky">
          <RichEditor initialContent={content} onChange={setContent} onUpload={state.onUpload} onError={state.setError} disabled={state.busy} />
          <button type="button" className={buttonClass} onClick={() => setPreview(!preview)}>{preview ? "Zavrieť náhľad" : "Náhľad obsahu"}</button>
          {preview && <div className="border-t border-slate-200 pt-6"><h2 className="mb-4 text-3xl font-black">{title}</h2>{excerpt && <p className="mb-8 text-lg text-slate-600">{excerpt}</p>}{cover.url && <img src={cover.url} alt={cover.alt} className="mb-8 aspect-[16/9] w-full object-cover" />}<RichContent content={content} /><StyleGrid collections={selectedCollections} /></div>}
        </FormSection>
        <FormSection title="Vzory z katalógu" description="Označte vzory, ktoré chcete zobraziť pod obsahom tejto stránky. Bez výberu sa blok nezobrazí.">
          <CityCatalogPicker collections={collections} selectedIds={collectionIds} onChange={setCollectionIds} />
        </FormSection>
        <FormSection title="Vyhľadávanie a zdieľanie"><SeoFields seo={{ title: page?.seoTitle, description: page?.seoDescription }} /></FormSection>
      </fieldset>
      <FormActions state={state} onDelete={page ? remove : undefined}>
        <div className="flex flex-wrap gap-3">
          <button type="submit" value={published ? "PUBLISHED" : "DRAFT"} disabled={state.disabled} className={buttonClass + (published ? " !border-red-600 !bg-red-600 !text-white" : "")}>{state.busy ? "Ukladám…" : published ? "Uložiť zmeny" : "Uložiť koncept"}</button>
          <button type="submit" value={published ? "DRAFT" : "PUBLISHED"} disabled={state.disabled} className={buttonClass + (published ? "" : " !border-red-600 !bg-red-600 !text-white")}>{published ? "Presunúť medzi koncepty" : "Publikovať stránku"}</button>
        </div>
      </FormActions>
    </form>
  </AdminFormShell>;
}
