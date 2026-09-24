import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { deleteAccessory, updateAccessory } from "@/actions/adminActions";
import GalleryPicker from "@/components/admin/GalleryPicker";
import SeoFields from "@/components/admin/SeoFields";
import { prisma } from "@/lib/prisma";
import { getSeo } from "@/lib/seo";

export default async function EditAccessoryPage({ params }) {
  const { id } = await params;
  const accessory = await prisma.accessory.findUnique({
    where: { id: Number(id) },
  });

  if (!accessory) return <div>Doplnok nebol nájdený.</div>;
  const seo = await getSeo("accessory", accessory.id);

  async function handleSave(formData) {
    "use server";
    const result = await updateAccessory(id, {
      title: formData.get("title"),
      subtitle: formData.get("subtitle"),
      price: formData.get("price"),
      gallery: formData.get("gallery"),
      description: formData.get("description"),
      seoTitle: formData.get("seoTitle"),
      seoDescription: formData.get("seoDescription"),
      imageAlts: formData.get("imageAlts"),
    });

    if (!result.success) throw new Error(result.error);

    revalidatePath("/admin/editor");
    revalidatePath(`/doplnky/${accessory.slug}`);
    redirect("/admin/editor#doplnky");
  }

  async function handleDelete() {
    "use server";
    const result = await deleteAccessory(id);
    if (!result.success) throw new Error(result.error);
    revalidatePath("/admin/editor");
    redirect("/admin/editor#doplnky");
  }

  const defaultGallery = accessory.gallery?.length > 0
    ? accessory.gallery
    : (accessory.mainImage ? [accessory.mainImage] : []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 font-sans text-black">
      <div className="mx-auto max-w-3xl">
        <Link href="/admin/editor#doplnky" className="mb-8 inline-flex items-center gap-2 font-medium text-slate-500 transition-colors hover:text-slate-900">
          <ArrowLeft size={20} /> Späť do editora
        </Link>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <form action={handleSave}>
            <div className="border-b border-slate-200 bg-slate-50 p-6">
              <label className="mb-4 block text-[10px] font-black uppercase tracking-widest text-slate-500">Galéria obrázkov</label>
              <GalleryPicker defaultImages={defaultGallery} defaultAlts={seo.imageAlts || {}} />
            </div>

            <div className="space-y-6 p-8 md:p-12">
              <div className="mb-4 border-b border-slate-100 pb-4">
                <h1 className="text-3xl font-black text-slate-900">Upraviť doplnok</h1>
                <p className="text-slate-500">Zmeňte údaje, cenu a fotografie doplnku</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Názov doplnku</label>
                  <input name="title" defaultValue={accessory.title} required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none" />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Podnadpis</label>
                  <input name="subtitle" defaultValue={accessory.subtitle} required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none" />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Cena (€)</label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    defaultValue={accessory.price.toString()}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xl font-black text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Popis doplnku</label>
                  <textarea name="description" defaultValue={accessory.description} required rows={8} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none" />
                </div>
              </div>

              <SeoFields seo={seo} />

              <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-8">
                <button formAction={handleDelete} className="flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-red-500 transition-colors hover:bg-red-50">
                  <Trash2 size={20} /> Vymazať
                </button>
                <button type="submit" className="flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-3 font-bold text-white shadow-lg transition-colors hover:bg-[#dc2626]">
                  <Save size={20} /> Uložiť zmeny
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
