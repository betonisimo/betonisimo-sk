/* eslint-disable @next/next/no-img-element -- Keep the intrinsic ratio of editorial photographs. */
import { normalizeContent } from "@/lib/rich-content";

function Inline({ content }) {
  return content?.map((part, index) => {
    if (part.type === "link") return <a key={index} href={part.href} className="font-semibold text-red-600 underline decoration-red-300 underline-offset-4 hover:decoration-red-600"><Inline content={part.content} /></a>;
    let node = part.text;
    if (part.styles?.bold) node = <strong>{node}</strong>;
    if (part.styles?.italic) node = <em>{node}</em>;
    if (part.styles?.underline) node = <u>{node}</u>;
    if (part.styles?.strike) node = <s>{node}</s>;
    return <span key={index}>{node}</span>;
  });
}

function Blocks({ blocks }) {
  const nodes = [];
  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index];
    const key = block.id || index;
    if (block.type === "bulletListItem" || block.type === "numberedListItem") {
      const list = [block];
      while (blocks[index + 1]?.type === block.type && !blocks[index + 1].props.start) list.push(blocks[++index]);
      const Tag = block.type === "numberedListItem" ? "ol" : "ul";
      nodes.push(<Tag key={key} start={Tag === "ol" ? block.props.start : undefined} className={`${Tag === "ol" ? "list-decimal" : "list-disc"} space-y-2 pl-6`}>
        {list.map((item, i) => <li key={item.id || i} className="whitespace-pre-wrap"><Inline content={item.content} />{item.children.length > 0 && <div className="mt-3"><Blocks blocks={item.children} /></div>}</li>)}
      </Tag>);
      continue;
    }
    let node;
    if (block.type === "photo") {
      if (!block.props.url) continue;
      node = <figure className="py-4"><img src={block.props.url} alt={block.props.alt} loading="lazy" decoding="async" className="mx-auto h-auto max-h-[800px] w-full object-contain" />{block.props.caption && <figcaption className="mt-3 border-l-2 border-red-600 pl-3 text-sm leading-6 text-slate-500">{block.props.caption}</figcaption>}</figure>;
    } else if (block.type === "heading") {
      const Tag = block.props.level === 3 ? "h3" : "h2";
      node = <Tag style={{ textAlign: block.props.textAlignment }} className={`${Tag === "h2" ? "pt-7 text-2xl md:text-4xl" : "pt-3 text-xl md:text-2xl"} font-black leading-tight tracking-tight text-slate-950`}><Inline content={block.content} /></Tag>;
    } else node = <p style={{ textAlign: block.props.textAlignment }} className="whitespace-pre-wrap"><Inline content={block.content} /></p>;
    nodes.push(<div key={key}>{node}{block.children.length > 0 && <div className="mt-4 pl-4"><Blocks blocks={block.children} /></div>}</div>);
  }
  return <div className="space-y-6">{nodes}</div>;
}

export default function RichContent({ content, fallback = "" }) {
  return <div className="min-w-0 break-words text-base leading-8 text-slate-700 [overflow-wrap:anywhere] md:text-lg md:leading-9"><Blocks blocks={normalizeContent(content, { fallback }).blocks} /></div>;
}
