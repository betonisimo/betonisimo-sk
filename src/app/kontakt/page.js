export const dynamic = "force-dynamic";
import { getContent } from "@/actions/adminActions";
import KontaktClient from "@/components/contact/KontaktClient";
export default async function KontaktPage() {
  const dbData = await getContent("kontakt", "informacie");
  // ПОЛУЧАЕМ НАСТРОЙКИ ФОРМЫ ИЗ БАЗЫ
  const formOptions = await getContent("kontakt", "form_options") || {};

  const defaultData = {
    firma: "BART Complex s.r.o.",
    show_firma: true,
    adresa: "Novojelčanská 845/63 925 23 Jelka",
    show_adresa: true,
    ico: "51921979",
    show_ico: true,
    dic: "2120839974",
    show_dic: true,
    icdph: "SK2120839974",
    show_icdph: true,
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