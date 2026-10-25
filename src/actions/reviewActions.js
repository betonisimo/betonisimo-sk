"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createReviewService } from "@/lib/review-service";

const reviews = createReviewService({ db: prisma, getSession: getServerSession, revalidate: revalidatePath });

export async function submitReview(formData) { return reviews.submit(formData); }
export async function approveReview(id) { return reviews.approve(id); }
export async function deleteReview(id) { return reviews.remove(id); }
export async function getReviewsAction() { return reviews.list(); }
