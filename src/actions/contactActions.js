"use server";
import { prisma } from "@/lib/prisma";

export async function sendLead(formData) {
  try {
    const data = {
      meno: formData.get("meno_sprava"),
      email: formData.get("email_spravas"),
      telefon: formData.get("tel_sprava"),
      sprava: `Predmet: ${formData.get("predmet")}\n\n${formData.get("text_sprava")}`,
    };

    const newLead = await prisma.objednavka.create({ data });
        
    return { success: true };
  } catch (error) {
    console.error("Chyba pri odosielaní:", error);
    return { success: false };
  }
}