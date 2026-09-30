import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSeo } from "@/lib/seo";
import ProjectForm from "@/components/admin/ProjectForm";

export default async function EditPage({ params }) {
  const { id: value } = await params;
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const item = await prisma.project.findUnique({ where: { id } });
  if (!item) notFound();
  const seo = await getSeo("project", id);
  return <ProjectForm project={item} seo={seo} />;
}
