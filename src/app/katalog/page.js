export const dynamic = 'force-dynamic';
import { getCollections } from "@/actions/adminActions";
import StyleGrid from "@/components/home/StyleGrid";
import { getSeo, pageMetadata } from "@/lib/seo";

// SEO Метаданные
export async function generateMetadata() {
  const seo = await getSeo("page", "katalog");
  return pageMetadata(seo, {
    title: "Kompletný katalóg línií | BETONISSIMO.SK",
    description: "Prezrite si všetky naše línie a štýly betónových plotov. Od moderných hladkých línií až po textúry štiepaného kameňa.",
    path: "/katalog",
  });
}

export default async function KatalogPage() {
  const collections = await getCollections();

  return (
    <div> 
      {/* Передаем все коллекции без лимита */}
      <StyleGrid collections={collections} />
    </div>
  );
}
