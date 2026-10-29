"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createFaqService } from "@/lib/faq-service";

const service = createFaqService({ db: prisma, getSession: getServerSession, revalidate: revalidatePath });

export async function saveVzoryFaq(input) {
  return service.save(input);
}
