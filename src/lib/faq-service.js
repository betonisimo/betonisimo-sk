import { parseVzoryFaq, VZORY_FAQ_SECTION } from "./vzory-faq.js";

export function createFaqService({ db, getSession, revalidate }) {
  return {
    async save(input) {
      if (!(await getSession())?.user) {
        return { success: false, error: "Prihláste sa do administrácie." };
      }
      let obsah;
      try {
        obsah = parseVzoryFaq(input);
      } catch (error) {
        return { success: false, error: error.message };
      }
      try {
        await db.strankaObsah.upsert({
          where: { sekcia: VZORY_FAQ_SECTION },
          update: { obsah },
          create: { stranka: "global", sekcia: VZORY_FAQ_SECTION, obsah },
        });
      } catch {
        return { success: false, error: "FAQ sa nepodarilo uložiť. Skúste to znova." };
      }
      revalidate("/katalog/[slug]", "page");
      revalidate("/admin/faq");
      return { success: true };
    },
  };
}
