export const COLLECTION_SPECIFICATIONS_PREFIX = "collection-specifications-";

const defaultItems = [
  { label: "Zameranie plotu", value: "ZDARMA" },
  { label: "Odborné poradenstvo", value: "ZDARMA" },
  { label: "Cenová kalkulácia", value: "ZDARMA" },
  { label: "Akciová zľava", value: "-15%" },
];

export function collectionSpecificationsSection(id) {
  const value = Number(id);
  if (!Number.isInteger(value) || value <= 0) throw new Error("Neplatné ID vzoru.");
  return `${COLLECTION_SPECIFICATIONS_PREFIX}${value}`;
}

const textOr = (value, fallback) => typeof value === "string" && value.trim() ? value.trim() : fallback;

// Existing vzory keep their global benefits until their own specifications are saved.
export function resolveCollectionSpecifications(stored, benefits) {
  return {
    title: textOr(stored?.title, "Technical_Specifications"),
    items: defaultItems.map((item, index) => ({
      label: textOr(stored?.items?.[index]?.label, textOr(benefits?.[`b${index + 1}_title`], item.label)),
      value: textOr(stored?.items?.[index]?.value, textOr(benefits?.[`b${index + 1}_val`], item.value)),
    })),
  };
}

export function parseCollectionSpecifications(input) {
  const keys = ["specificationsTitle", ...defaultItems.flatMap((_, index) => [
    `specification${index + 1}Label`, `specification${index + 1}Value`,
  ])];
  // Older forms may omit these fields; never erase their saved specifications.
  if (!keys.some((key) => Object.hasOwn(input, key))) return undefined;

  function requiredText(key, limit, label) {
    const value = typeof input[key] === "string" ? input[key].trim() : "";
    if (!value || value.length > limit) throw new Error(`${label}: zadajte text do ${limit} znakov.`);
    return value;
  }

  return {
    title: requiredText("specificationsTitle", 120, "Nadpis technických údajov"),
    items: defaultItems.map((_, index) => ({
      label: requiredText(`specification${index + 1}Label`, 120, `Názov údaja ${index + 1}`),
      value: requiredText(`specification${index + 1}Value`, 300, `Hodnota údaja ${index + 1}`),
    })),
  };
}
