import CatalogItemForm from "@/components/admin/CatalogItemForm";
import { getContent } from "@/actions/adminActions";
import { resolveCollectionSpecifications } from "@/lib/collection-specifications";

export const dynamic = "force-dynamic";

export default async function NewPage() {
  const benefits = await getContent("global", "vyhody");
  return <CatalogItemForm kind="collection" specifications={resolveCollectionSpecifications(null, benefits)} />;
}
