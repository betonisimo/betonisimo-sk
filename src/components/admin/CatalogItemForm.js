"use client";
import { createCollection, updateCollection, deleteCollection, createAccessory, updateAccessory, deleteAccessory } from "@/actions/adminActions";
import GalleryPicker from "./GalleryPicker";
import SeoFields from "./SeoFields";
import { AdminFormShell, FormActions, FormField, FormSection, useAdminForm } from "./AdminFormUI";
import { resolveCollectionSpecifications } from "@/lib/collection-specifications";
import { useState } from "react";
import CatalogUrlField from "./CatalogUrlField";

const kinds = {
  collection: { section: "Vzory", newTitle: "Nový vzor", editTitle: "Upraviť vzor", anchor: "kolekcie", path: "/katalog", create: createCollection, update: updateCollection, remove: deleteCollection },
  accessory: { section: "Doplnky", newTitle: "Nový doplnok", editTitle: "Upraviť doplnok", anchor: "doplnky", path: "/doplnky", create: createAccessory, update: updateAccessory, remove: deleteAccessory },
};

export default function CatalogItemForm({ kind, item, seo = {}, specifications }) {
  const config = kinds[kind];
  const backHref = `/admin/editor#${config.anchor}`;
  const state = useAdminForm(backHref);
  const [title, setTitle] = useState(item?.title || "");
  function save(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    state.run(() => item ? config.update(item.id, data) : config.create(data));
  }
  function remove() {
    if (window.confirm("Naozaj chcete tento záznam natrvalo vymazať?")) state.run(() => config.remove(item.id));
  }
  const images = item?.gallery?.length ? item.gallery : item?.mainImage ? [item.mainImage] : [];
  const details = resolveCollectionSpecifications(specifications);
  return <AdminFormShell title={item ? config.editTitle : config.newTitle} section={config.section} backHref={backHref} slug={item ? `${config.path}/${item.slug}` : undefined}>
    <form onSubmit={save} className="space-y-6" aria-busy={state.busy}>
      <fieldset disabled={state.busy} className="min-w-0 space-y-6">
        <FormSection title="Základné informácie">
          <FormField name="title" label="Názov" required maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} />
          <FormField name="subtitle" label="Podnadpis" required maxLength={300} defaultValue={item?.subtitle || ""} />
          {kind === "accessory" && <FormField name="price" label="Cena (€)" type="number" required min="0" max="99999999.99" step="0.01" defaultValue={item?.price || ""} />}
          <FormField name="description" label="Popis" multiline required rows={7} maxLength={50000} defaultValue={item?.description || ""} />
        </FormSection>
        {kind === "collection" && <FormSection title="Technické údaje vzoru" description="Nadpis a štyri údaje sa zobrazia na stránke tohto vzoru. Úpravy neovplyvnia ostatné vzory ani globálne výhody.">
          <FormField name="specificationsTitle" label="Nadpis bloku" required maxLength={120} defaultValue={details.title} />
          <div className="grid gap-5 sm:grid-cols-2">
            {details.items.map((detail, index) => <fieldset key={index} className="min-w-0 space-y-4 border border-slate-200 p-4">
              <legend className="px-2 text-sm font-black text-slate-700">Údaj {index + 1}</legend>
              <FormField name={`specification${index + 1}Label`} label={`Názov údaja ${index + 1}`} required maxLength={120} defaultValue={detail.label} />
              <FormField name={`specification${index + 1}Value`} label={`Hodnota údaja ${index + 1}`} required maxLength={300} defaultValue={detail.value} />
            </fieldset>)}
          </div>
        </FormSection>}
        <FormSection title="Fotografie" description="Vyberte hlavnú fotografiu pre kartu. Ku každej pridajte výstižný popis toho, čo zobrazuje.">
          <GalleryPicker defaultImages={images} defaultAlts={seo.imageAlts || {}} disabled={state.busy} onUpload={state.onUpload} />
        </FormSection>
        <FormSection title="Vyhľadávanie a zdieľanie">
          <CatalogUrlField title={title} kind={kind} initialSlug={item?.slug} initialTitle={item?.title} />
          <SeoFields seo={seo} />
        </FormSection>
      </fieldset>
      <FormActions state={state} onDelete={item ? remove : undefined} />
    </form>
  </AdminFormShell>;
}
