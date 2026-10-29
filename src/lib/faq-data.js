import { prisma } from "@/lib/prisma";
import { resolveVzoryFaq, VZORY_FAQ_SECTION } from "./vzory-faq.js";

export async function getVzoryFaq() {
  const record = await prisma.strankaObsah.findUnique({
    where: { sekcia: VZORY_FAQ_SECTION },
    select: { obsah: true },
  });
  return resolveVzoryFaq(record?.obsah);
}
