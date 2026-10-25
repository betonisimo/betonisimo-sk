function reviewInput(formData) {
  const author = formData.get("author");
  const text = formData.get("text");
  const rating = Number(formData.get("rating"));
  if (typeof author !== "string" || !author.trim() || author.length > 100 ||
      typeof text !== "string" || !text.trim() || text.length > 5000 ||
      !Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Vyplňte meno, recenziu a hodnotenie od 1 do 5.");
  }
  return { author: author.trim(), text: text.trim(), rating, status: "PENDING" };
}

export function createReviewService({ db, getSession, revalidate }) {
  const unauthorized = { success: false, error: "Prihláste sa do administrácie." };
  async function moderate(id, remove) {
    if (!await getSession()) return unauthorized;
    const reviewId = Number(id);
    if (!Number.isSafeInteger(reviewId) || reviewId <= 0) return { success: false, error: "Neplatné ID recenzie." };
    try {
      if (remove) await db.review.delete({ where: { id: reviewId } });
      else await db.review.update({ where: { id: reviewId }, data: { status: "APPROVED" } });
      revalidate("/");
      revalidate("/admin/reviews");
      revalidate("/admin/editor");
      return { success: true };
    } catch {
      return { success: false, error: "Recenziu sa nepodarilo aktualizovať." };
    }
  }
  return {
    async submit(formData) {
      let data;
      try { data = reviewInput(formData); }
      catch (error) { return { success: false, error: error.message }; }
      try {
        await db.review.create({ data });
        return { success: true };
      } catch {
        return { success: false, error: "Recenziu sa nepodarilo odoslať." };
      }
    },
    approve: (id) => moderate(id, false),
    remove: (id) => moderate(id, true),
    async list() {
      if (!await getSession()) return [];
      try { return await db.review.findMany({ orderBy: { createdAt: "desc" } }); }
      catch { return []; }
    },
  };
}
