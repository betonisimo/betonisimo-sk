import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSeo } from "@/lib/seo";
import CatalogItemForm from "@/components/admin/CatalogItemForm";
import { getContent } from "@/actions/adminActions";
import { collectionSpecificationsSection, resolveCollectionSpecifications } from "@/lib/collection-specifications";

export default async function EditPage({ params }) {
  const { id: value } = await params;
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const item = await prisma.collection.findUnique({ where: { id } });
  if (!item) notFound();
  const [seo, storedSpecifications, benefits] = await Promise.all([
    getSeo("collection", id),
    getContent("collection", collectionSpecificationsSection(id)),
    getContent("global", "vyhody"),
  ]);
  return <CatalogItemForm kind="collection" item={item} seo={seo} specifications={resolveCollectionSpecifications(storedSpecifications, benefits)} />;
}
