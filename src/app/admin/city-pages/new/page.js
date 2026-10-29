import CityPageEditor from "@/components/admin/CityPageEditor";
import { getCityCatalogOptions } from "@/lib/city-page-data";

export default async function NewCityPage() {
  return <CityPageEditor collections={await getCityCatalogOptions()} />;
}
