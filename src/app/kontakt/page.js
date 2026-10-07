export const dynamic = "force-dynamic";
import { getSeo, pageMetadata } from "@/lib/seo";
export async function generateMetadata() {
  const seo = await getSeo("page", "kontakt");
  return pageMetadata(seo, {
    title: "Kontakt | BETONISSIMO.SK",
    description: "Kontaktujte BETONISSIMO.SK pre návrh, cenu a montáž betónového plotu na Slovensku.",
    path: "/kontakt",
  });
}
import { getContent } from "@/actions/adminActions";
import KontaktClient from "@/components/contact/KontaktClient";
export default async function KontaktPage() {
  const dbData = await getContent("kontakt", "informacie");
  // ПОЛУЧАЕМ НАСТРОЙКИ ФОРМЫ ИЗ БАЗЫ
  const formOptions = await getContent("kontakt", "form_options") || {};

  const defaultData = {
    firma: "BETONISSIMO.SK",
    show_firma: true,
    adresa: "",
    show_adresa: false,
    ico: "",
    show_ico: false,
    dic: "",
    show_dic: false,
    icdph: "",
    show_icdph: false,
    tel: "0911 640 097",
    show_tel: true,
    email: "info@beton-plotysk.sk",
    show_email: true,
  };

  return (
    <KontaktClient 
      editMode={false} 
      initialData={dbData || defaultData} 
      formOptions={formOptions} // ПЕРЕДАЕМ ИХ В КОМПОНЕНТ
    />
  );
}
