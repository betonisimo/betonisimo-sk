import { notFound } from "next/navigation";
import CityPageEditor from "@/components/admin/CityPageEditor";
import { getAdminCityPage, getCityCatalogOptions } from "@/lib/city-page-data";

export default async function EditCityPage({ params }) {
  const { id: value } = await params;
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) notFound();
  const [page, collections] = await Promise.all([getAdminCityPage(id), getCityCatalogOptions()]);
  if (!page) notFound();
  return <CityPageEditor page={page} collections={collections} />;
}
