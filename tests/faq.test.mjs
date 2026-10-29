import test from "node:test";
import assert from "node:assert/strict";
import { FAQ_ANSWER_MAX_LENGTH, FAQ_MAX_ITEMS, FAQ_QUESTION_MAX_LENGTH, parseVzoryFaq, resolveVzoryFaq, VZORY_FAQ_SECTION } from "../src/lib/vzory-faq.js";
import { createFaqService } from "../src/lib/faq-service.js";

const item = { question: "Ako objednať plot?", answer: "Kontaktujte nás.\nDohodneme si podrobnosti." };

test("FAQ preserves Slovak text, paragraphs and order; an absent or explicitly empty FAQ stays empty", () => {
  assert.deepEqual(resolveVzoryFaq(null), { items: [] });
  assert.deepEqual(resolveVzoryFaq(undefined), { items: [] });
  assert.deepEqual(parseVzoryFaq({ items: [] }), { items: [] });
  assert.deepEqual(parseVzoryFaq({ items: [
    { question: "  Aká  je\n dodacia lehota?  ", answer: "  Závisí od dohody.\r\n\r\nNapíšte nám.  ", id: "client-id" },
    item,
  ] }), { items: [
    { question: "Aká je dodacia lehota?", answer: "Závisí od dohody.\n\nNapíšte nám." },
    item,
  ] });
});

test("FAQ rejects malformed, incomplete and oversized input without silently dropping questions", () => {
  for (const input of [
    null, {}, { items: "[]" }, { items: null },
    { items: [null] }, { items: Array(1) }, { items: [{ question: "Q" }] },
    { items: [{ question: 4, answer: "A" }] }, { items: [{ question: "Q", answer: {} }] },
    { items: [{ question: "  ", answer: "A" }] }, { items: [{ question: "Q", answer: " \n " }] },
    { items: [{ ...item, question: "x".repeat(FAQ_QUESTION_MAX_LENGTH + 1) }] },
    { items: [{ ...item, answer: "x".repeat(FAQ_ANSWER_MAX_LENGTH + 1) }] },
    { items: Array.from({ length: FAQ_MAX_ITEMS + 1 }, () => item) },
  ]) assert.throws(() => parseVzoryFaq(input));
  assert.equal(parseVzoryFaq({ items: Array.from({ length: FAQ_MAX_ITEMS }, () => item) }).items.length, FAQ_MAX_ITEMS);
});

function fixture(session = { user: { name: "Admin" } }, fail = false) {
  const calls = [], paths = [];
  const db = { strankaObsah: { upsert: async (data) => {
    calls.push(data);
    if (fail) throw new Error("private database connection details");
  } } };
  return { calls, paths, service: createFaqService({ db, getSession: async () => session, revalidate: (...args) => paths.push(args) }) };
}

test("anonymous and invalid requests cannot write or invalidate the shared FAQ", async () => {
  for (const session of [null, {}]) {
    const { service, calls, paths } = fixture(session);
    assert.equal((await service.save({ items: [item] })).success, false);
    assert.deepEqual(calls, []);
    assert.deepEqual(paths, []);
  }
  const { service, calls, paths } = fixture();
  assert.equal((await service.save({})).success, false);
  assert.deepEqual(calls, []);
  assert.deepEqual(paths, []);
});

test("all vzory share one fixed content record; saving refreshes every vzor, not doplnky", async () => {
  const { service, calls, paths } = fixture();
  const obsah = { items: [item] };
  assert.deepEqual(await service.save({ ...obsah, sekcia: "footer", stranka: "domov" }), { success: true });
  assert.deepEqual(calls, [{
    where: { sekcia: VZORY_FAQ_SECTION },
    update: { obsah },
    create: { stranka: "global", sekcia: VZORY_FAQ_SECTION, obsah },
  }]);
  assert.deepEqual(paths, [["/katalog/[slug]", "page"], ["/admin/faq"]]);
  assert.deepEqual(await service.save({ items: [] }), { success: true });
  assert.deepEqual(calls[1].update.obsah, { items: [] });
});

test("storage failures keep their details private and do not invalidate pages", async () => {
  const { service, paths } = fixture(undefined, true);
  const result = await service.save({ items: [item] });
  assert.equal(result.success, false);
  assert.doesNotMatch(result.error, /private database/);
  assert.deepEqual(paths, []);
});
