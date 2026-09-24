import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function BlogBody({ blocks }) {
  return (
    <div className="space-y-7 text-slate-700">
      {(Array.isArray(blocks) ? blocks : []).map((block, index) => {
        if (block.type === "heading2") {
          return <h2 id={`sekcia-${index}`} key={index} className="scroll-mt-28 pt-7 text-2xl font-black leading-tight tracking-tight text-slate-950 md:text-4xl">{block.text}</h2>;
        }
        if (block.type === "heading3") {
          return <h3 id={`sekcia-${index}`} key={index} className="scroll-mt-28 pt-3 text-xl font-bold leading-snug text-slate-950 md:text-2xl">{block.text}</h3>;
        }
        if (block.type === "image") {
          if (!block.url) return null;
          return (
            <figure key={index} className="py-5">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                <Image src={block.url} alt={block.alt || ""} fill sizes="(max-width: 768px) 100vw, 800px" className="object-cover" />
              </div>
              {block.caption && <figcaption className="mt-3 border-l-2 border-red-600 pl-3 text-sm text-slate-500">{block.caption}</figcaption>}
            </figure>
          );
        }
        if (block.type === "list") {
          return <ul key={index} className="list-disc space-y-2 pl-6 text-base leading-8 md:text-lg">{block.text.split("\n").map((item, itemIndex) => item.trim() && <li key={itemIndex}>{item.trim()}</li>)}</ul>;
        }
        if (block.type === "link") {
          if (!block.url || !block.label) return null;
          return <p key={index}><Link href={block.url} className="inline-flex items-center gap-2 border-b-2 border-red-600 pb-1 font-bold text-red-600 hover:text-slate-950">{block.label}<ArrowUpRight size={18} aria-hidden="true" /></Link></p>;
        }
        return <p key={index} className="whitespace-pre-line text-base leading-8 md:text-lg md:leading-9">{block.text}</p>;
      })}
    </div>
  );
}
