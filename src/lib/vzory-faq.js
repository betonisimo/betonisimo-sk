export const VZORY_FAQ_SECTION = "vzory-faq";
export const FAQ_MAX_ITEMS = 30;
export const FAQ_QUESTION_MAX_LENGTH = 300;
export const FAQ_ANSWER_MAX_LENGTH = 5000;

export function parseVzoryFaq(input) {
  if (!input || !Array.isArray(input.items)) {
    throw new Error("Neplatný zoznam otázok a odpovedí.");
  }
  if (input.items.length > FAQ_MAX_ITEMS) {
    throw new Error(`FAQ môže obsahovať najviac ${FAQ_MAX_ITEMS} otázok.`);
  }
  const items = Array.from(input.items, (item, index) => {
    if (typeof item?.question !== "string" || typeof item?.answer !== "string") {
      throw new Error(`Vyplňte otázku aj odpoveď v položke ${index + 1}.`);
    }
    const question = item.question.trim().replace(/\s+/gu, " ");
    const answer = item.answer.replace(/\r\n?/g, "\n").trim();
    if (!question || !answer) {
      throw new Error(`Vyplňte otázku aj odpoveď v položke ${index + 1}.`);
    }
    if (question.length > FAQ_QUESTION_MAX_LENGTH || answer.length > FAQ_ANSWER_MAX_LENGTH) {
      throw new Error(`Položka ${index + 1} je príliš dlhá. Otázka môže mať ${FAQ_QUESTION_MAX_LENGTH} a odpoveď ${FAQ_ANSWER_MAX_LENGTH} znakov.`);
    }
    // Store plain text only; React escapes it when rendering the public FAQ.
    return { question, answer };
  });
  return { items };
}

export function resolveVzoryFaq(stored) {
  if (stored == null) return { items: [] };
  return parseVzoryFaq(stored);
}
