import test from "node:test";
import assert from "node:assert/strict";
import { collectionSpecificationsSection, parseCollectionSpecifications, resolveCollectionSpecifications } from "../src/lib/collection-specifications.js";

function formFields(value) {
  return Object.fromEntries([
    ["specificationsTitle", value.title],
    ...value.items.flatMap((item, index) => [
      [`specification${index + 1}Label`, item.label],
      [`specification${index + 1}Value`, item.value],
    ]),
  ]);
}

test("old vzory inherit global benefits; saved specifications stay independent", () => {
  const benefits = { b1_title: "Montáž", b1_val: "V cene", b4_title: "Konzultácia", b4_val: "ZDARMA" };
  const inherited = resolveCollectionSpecifications(null, benefits);
  assert.deepEqual(inherited.items[0], { label: "Montáž", value: "V cene" });
  assert.deepEqual(inherited.items[3], { label: "Konzultácia", value: "ZDARMA" });
  const saved = parseCollectionSpecifications(formFields({ ...inherited, title: "Technické údaje Q1" }));
  const changedGlobal = { ...benefits, b1_val: "Na vyžiadanie" };
  assert.deepEqual(resolveCollectionSpecifications(saved, changedGlobal), saved);
  assert.equal(resolveCollectionSpecifications(null, changedGlobal).items[0].value, "Na vyžiadanie");
  assert.notEqual(collectionSpecificationsSection(1), collectionSpecificationsSection(2));
});

test("specifications validate all four label/value pairs without erasing omitted legacy data", () => {
  const fields = formFields(resolveCollectionSpecifications());
  assert.equal(parseCollectionSpecifications({ title: "Starý formulár" }), undefined);
  assert.throws(() => parseCollectionSpecifications({ specificationsTitle: "Nadpis" }), /Názov údaja 1/);
  assert.throws(() => parseCollectionSpecifications({ ...fields, specification2Value: " " }), /Hodnota údaja 2/);
  assert.throws(() => parseCollectionSpecifications({ ...fields, specificationsTitle: "a".repeat(121) }), /120/);
  assert.throws(() => parseCollectionSpecifications({ ...fields, specification4Value: "a".repeat(301) }), /300/);
  assert.throws(() => collectionSpecificationsSection(-1), /ID/);
  const saved = parseCollectionSpecifications({ ...fields, specification1Value: "  200 × 50 cm  " });
  assert.equal(saved.items[0].value, "200 × 50 cm");
});
