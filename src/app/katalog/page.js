import { getCollections } from "@/actions/adminActions";
import StyleGrid from "@/components/home/StyleGrid";

// SEO Метаданные
export const metadata = {
  title: "Kompletný katalóg línií | BETONISSIMO.SK",
  description: "Prezrite si všetky naše línie a štýly betónových plotov. Od moderných hladkých línií až po textúry štiepaného kameňa.",
};

export default async function KatalogPage() {
  const collections = await getCollections();

  return (
    <div> 
      {/* Передаем все коллекции без лимита */}
      <StyleGrid collections={collections} />
    </div>
  );
}