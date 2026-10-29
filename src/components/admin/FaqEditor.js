"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { saveVzoryFaq } from "@/actions/faqActions";
import { FAQ_ANSWER_MAX_LENGTH, FAQ_MAX_ITEMS, FAQ_QUESTION_MAX_LENGTH, parseVzoryFaq } from "@/lib/vzory-faq";
import { buttonClass, FormActions, FormField, FormSection } from "./AdminFormUI";

export default function FaqEditor({ initialFaq }) {
  const [items, setItems] = useState(() => initialFaq.items.map((item, index) => ({ ...item, id: `saved-${index}` })));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const busyRef = useRef(false);
  const nextId = useRef(0);
  const router = useRouter();

  function change(update) {
    setSaved(false);
    setError("");
    setItems(update);
  }

  function move(index, direction) {
    change((current) => {
      const reordered = [...current];
      [reordered[index], reordered[index + direction]] = [reordered[index + direction], reordered[index]];
      return reordered;
    });
  }

  function updateItem(id, field, value) {
    change((current) => current.map((row) => row.id === id ? { ...row, [field]: value } : row));
  }

  function addItem() {
    // UI-only IDs also work when the admin opens a local HTTP address on a phone.
    const id = `new-${nextId.current++}`;
    change((current) => [...current, { id, question: "", answer: "" }]);
  }

  async function save(event) {
    event.preventDefault();
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setSaved(false);
    setError("");
    try {
      const result = await saveVzoryFaq(parseVzoryFaq({ items }));
      if (!result?.success) throw new Error(result?.error || "FAQ sa nepodarilo uložiť.");
      setSaved(true);
      router.refresh();
    } catch (error) {
      setError(error.message || "FAQ sa nepodarilo uložiť. Skúste to znova.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6" aria-busy={busy}>
      <FormSection title="Spoločné otázky a odpovede" description="Tento zoznam sa zobrazí na stránke každého vzoru. Na doplnky sa nevzťahuje. Zmeny sa zverejnia až po uložení. Ak odstránite všetky otázky a uložíte zmeny, blok sa skryje.">
        <fieldset disabled={busy} className="min-w-0 space-y-5">
          <legend className="sr-only">Otázky a odpovede pre všetky vzory</legend>
          {items.length === 0 && <p className="border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">Zatiaľ tu nie sú žiadne otázky. Pridajte prvú otázku a odpoveď.</p>}
          {items.map((item, index) => (
            <fieldset key={item.id} className="min-w-0 space-y-4 rounded-[2px] border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
              <legend className="px-2 text-sm font-black text-slate-800">Položka {index + 1}</legend>
              <div className="flex flex-wrap justify-end gap-2">
                <button type="button" className={buttonClass} aria-label={`Presunúť otázku ${index + 1} vyššie`} title="Presunúť vyššie" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={17} /></button>
                <button type="button" className={buttonClass} aria-label={`Presunúť otázku ${index + 1} nižšie`} title="Presunúť nižšie" disabled={index === items.length - 1} onClick={() => move(index, 1)}><ArrowDown size={17} /></button>
                <button type="button" className={buttonClass + " text-red-600"} aria-label={`Odstrániť otázku ${index + 1}`} onClick={() => change((current) => current.filter((row) => row.id !== item.id))}><Trash2 size={17} /> Odstrániť</button>
              </div>
              <FormField name={`question-${item.id}`} label={`Otázka ${index + 1}`} required maxLength={FAQ_QUESTION_MAX_LENGTH} value={item.question} onChange={(event) => updateItem(item.id, "question", event.target.value)} />
              <FormField name={`answer-${item.id}`} label={`Odpoveď ${index + 1}`} multiline rows={5} required maxLength={FAQ_ANSWER_MAX_LENGTH} value={item.answer} onChange={(event) => updateItem(item.id, "answer", event.target.value)} />
            </fieldset>
          ))}
          <button type="button" className={buttonClass} disabled={items.length >= FAQ_MAX_ITEMS} onClick={addItem}><Plus size={18} /> Pridať otázku</button>
          <p className="text-xs leading-5 text-slate-500">Najviac {FAQ_MAX_ITEMS} otázok. Odpovede môžu obsahovať viac odsekov. Používajte všeobecné informácie platné pre všetky vzory.</p>
        </fieldset>
      </FormSection>
      {saved && <p role="status" className="border-l-4 border-green-600 bg-green-50 p-4 font-semibold text-green-800">FAQ bolo uložené. Zmeny sa zobrazia pri všetkých vzoroch.</p>}
      <FormActions state={{ busy, disabled: busy, error, uploads: 0 }} />
    </form>
  );
}
