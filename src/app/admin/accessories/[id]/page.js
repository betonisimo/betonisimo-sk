import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSeo } from "@/lib/seo";
import CatalogItemForm from "@/components/admin/CatalogItemForm";

export default async function EditPage({ params }) {
  const { id: value } = await params;
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const item = await prisma.accessory.findUnique({ where: { id } });
  if (!item) notFound();
  const seo = await getSeo("accessory", id);
  return <CatalogItemForm kind="accessory" item={{ ...item, price: item.price.toString() }} seo={seo} />;
}
