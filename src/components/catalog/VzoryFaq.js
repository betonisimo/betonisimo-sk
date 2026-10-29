import { ChevronDown } from "lucide-react";

export default function VzoryFaq({ faq }) {
  if (!faq.items.length) return null;

  return (
    <section aria-labelledby="vzory-faq-title" className="mt-12 border-t border-slate-200 pb-8 pt-10 md:mt-16 md:pt-14">
      <div className="mb-8 border-l-4 border-[#dc2626] pl-5 md:pl-7">
        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#dc2626]">FAQ</p>
        <h2 id="vzory-faq-title" className="text-3xl font-black uppercase tracking-tighter text-slate-900 md:text-5xl">Často kladené otázky</h2>
      </div>
      <div className="divide-y divide-slate-200 overflow-hidden rounded-[2px] border border-slate-200 bg-white shadow-sm">
        {faq.items.map((item, index) => (
          <details key={index} className="group/faq">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-base font-bold text-slate-900 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-red-600 md:px-8 md:py-6 md:text-lg [&::-webkit-details-marker]:hidden">
              <span className="min-w-0 [overflow-wrap:anywhere]">{item.question}</span>
              <ChevronDown size={20} aria-hidden="true" className="shrink-0 text-[#dc2626] transition-transform group-open/faq:rotate-180 motion-reduce:transition-none" />
            </summary>
            <div className="max-w-4xl whitespace-pre-line px-5 pb-6 text-base leading-7 text-slate-600 [overflow-wrap:anywhere] md:px-8 md:pb-8">{item.answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
