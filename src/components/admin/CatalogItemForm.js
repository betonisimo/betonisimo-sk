"use client";
import { createCollection, updateCollection, deleteCollection, createAccessory, updateAccessory, deleteAccessory } from "@/actions/adminActions";
import GalleryPicker from "./GalleryPicker";
import SeoFields from "./SeoFields";
import { AdminFormShell, FormActions, FormField, FormSection, useAdminForm } from "./AdminFormUI";

const kinds = {
  collection: { section: "Vzory", newTitle: "Nový vzor", editTitle: "Upraviť vzor", anchor: "kolekcie", path: "/katalog", create: createCollection, update: updateCollection, remove: deleteCollection },
  accessory: { section: "Doplnky", newTitle: "Nový doplnok", editTitle: "Upraviť doplnok", anchor: "doplnky", path: "/doplnky", create: createAccessory, update: updateAccessory, remove: deleteAccessory },
};

export default function CatalogItemForm({ kind, item, seo = {} }) {
  const config = kinds[kind];
  const backHref = `/admin/editor#${config.anchor}`;
  const state = useAdminForm(backHref);
  function save(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    state.run(() => item ? config.update(item.id, data) : config.create(data));
  }
  function remove() {
    if (window.confirm("Naozaj chcete tento záznam natrvalo vymazať?")) state.run(() => config.remove(item.id));
  }
  const images = item?.gallery?.length ? item.gallery : item?.mainImage ? [item.mainImage] : [];
  return <AdminFormShell title={item ? config.editTitle : config.newTitle} section={config.section} backHref={backHref} slug={item ? `${config.path}/${item.slug}` : undefined}>
    <form onSubmit={save} className="space-y-6" aria-busy={state.busy}>
      <fieldset disabled={state.busy} className="min-w-0 space-y-6">
        <FormSection title="Základné informácie">
          <FormField name="title" label="Názov" required maxLength={160} defaultValue={item?.title || ""} />
          <FormField name="subtitle" label="Podnadpis" required maxLength={300} defaultValue={item?.subtitle || ""} />
          {kind === "accessory" && <FormField name="price" label="Cena (€)" type="number" required min="0" max="99999999.99" step="0.01" defaultValue={item?.price || ""} />}
          <FormField name="description" label="Popis" multiline required rows={7} maxLength={50000} defaultValue={item?.description || ""} />
        </FormSection>
        <FormSection title="Fotografie" description="Vyberte hlavnú fotografiu pre kartu. Ku každej pridajte výstižný popis toho, čo zobrazuje.">
          <GalleryPicker defaultImages={images} defaultAlts={seo.imageAlts || {}} disabled={state.busy} onUpload={state.onUpload} />
        </FormSection>
        <FormSection title="Vyhľadávanie a zdieľanie"><SeoFields seo={seo} /></FormSection>
      </fieldset>
      <FormActions state={state} onDelete={item ? remove : undefined} />
    </form>
  </AdminFormShell>;
}
