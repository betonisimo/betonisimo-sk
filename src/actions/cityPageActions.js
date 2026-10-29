"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createCityPageService } from "@/lib/city-page-service";

const service = createCityPageService({ db: prisma, getSession: getServerSession, revalidate: revalidatePath });

export async function saveCityPage(input) { return service.save(input); }
export async function duplicateCityPage(id) { return service.duplicate(id); }
export async function deleteCityPage(id) { return service.remove(id); }
