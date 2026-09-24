import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BlogEditor from "@/components/admin/BlogEditor";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({ params }) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId) || postId <= 0) notFound();
  const post = await prisma.blogPost.findUnique({ where: { id: postId } });
  if (!post) notFound();
  return <BlogEditor post={post} />;
}
