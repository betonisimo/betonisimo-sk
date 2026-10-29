import { getVzoryFaq } from "@/lib/faq-data";
import { AdminFormShell } from "@/components/admin/AdminFormUI";
import FaqEditor from "@/components/admin/FaqEditor";

export const dynamic = "force-dynamic";

export default async function AdminFaqPage() {
  const faq = await getVzoryFaq();
  return (
    <AdminFormShell title="FAQ pre vzory" section="FAQ" backHref="/admin" backLabel="Späť do administrácie">
      <FaqEditor initialFaq={faq} />
    </AdminFormShell>
  );
}
