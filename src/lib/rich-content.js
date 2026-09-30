// Stored format is independent of the editor UI; legacy blog blocks stay readable.
export const CONTENT_VERSION = 2;
const types = new Set(["paragraph", "heading", "bulletListItem", "numberedListItem", "photo"]);
const text = (value) => typeof value === "string" ? value : "";

export function safeLink(value) {
  const url = text(value).trim();
  if (!url || url.length > 2000 || /[\\\u0000-\u0020\u007f]/.test(url)) return "";
  if (/^\/(?!\/)/.test(url) || /^#[^#]/.test(url)) return url;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && !parsed.username && !parsed.password ? url : "";
  } catch { return ""; }
}

export function safeImage(value) {
  const url = safeLink(value);
  if (url.startsWith("/")) return url;
  if (!url || url.startsWith("#")) return "";
  const host = new URL(url).hostname;
  return host.endsWith(".public.blob.vercel-storage.com") || host === "images.unsplash.com" ? url : "";
}

function legacyBlocks(input) {
  return input.flatMap((block) => {
    if (block?.type === "image") return [{ type: "photo", props: { url: block.url, alt: block.alt, caption: block.caption } }];
    if (block?.type === "link") return [{ type: "paragraph", content: [{ type: "link", href: block.url, content: block.label || "" }] }];
    if (block?.type === "list") return text(block.text).split("\n").filter((line) => line.trim()).map((line) => ({ type: "bulletListItem", content: line }));
    if (block?.type === "heading2" || block?.type === "heading3") return [{ type: "heading", props: { level: block.type === "heading2" ? 2 : 3 }, content: block.text }];
    return [{ type: "paragraph", content: block?.text || "" }];
  });
}

export function normalizeContent(input, { strict = false, fallback = "" } = {}) {
  const fail = (message) => { if (strict) throw new Error(message); };
  if (strict && JSON.stringify(input ?? null).length > 500000) throw new Error("Obsah je príliš veľký (max. 500 kB textových dát).");
  let source;
  if (Array.isArray(input)) {
    if (strict && input.some((block) => !["paragraph", "heading2", "heading3", "list", "link", "image"].includes(block?.type))) throw new Error("Neznámy typ starého bloku.");
    source = legacyBlocks(input);
  }
  else if (input?.version === CONTENT_VERSION && Array.isArray(input.blocks)) source = input.blocks;
  else if (input != null) { fail("Nepodporovaný formát obsahu."); source = []; }
  else source = fallback ? [{ type: "paragraph", content: fallback }] : [];
  let count = 0;
  const ids = new Set();
  function inline(value, inLink = false) {
    if (typeof value === "string") value = [{ type: "text", text: value }];
    if (!Array.isArray(value)) return [];
    return value.flatMap((part) => {
      if (part?.type === "link" && !inLink) {
        const content = inline(part.content, true);
        const href = safeLink(part.href);
        if (!href) { fail("Odkaz musí začínať https://, / alebo # a nesmie obsahovať medzery."); return content; }
        return [{ type: "link", href, content }];
      }
      if (part?.type !== "text") { fail("Nepodporované formátovanie textu."); return []; }
      const value = text(part.text);
      if (value.length > 50000) fail("Jeden textový blok je príliš dlhý.");
      const styles = {};
      for (const name of ["bold", "italic", "underline", "strike"]) if (part.styles?.[name] === true) styles[name] = true;
      return [{ type: "text", text: value.slice(0, 50000), styles }];
    });
  }
  function blocks(list, depth = 0) {
    if (!Array.isArray(list)) return [];
    if (depth > 8) { fail("Obsah môže mať najviac 8 úrovní vnorenia."); return []; }
    return list.flatMap((block) => {
      if (++count > 500) { fail("Obsah môže mať najviac 500 blokov."); return []; }
      if (!types.has(block?.type)) { fail("Neznámy typ bloku."); return []; }
      const result = { type: block.type, props: {} };
      if (typeof block.id === "string" && /^[\w-]{1,100}$/.test(block.id) && !ids.has(block.id)) { result.id = block.id; ids.add(block.id); }
      if (block.type === "photo") {
        const url = safeImage(block.props?.url);
        if (block.props?.url && !url) fail("Neplatná adresa fotografie.");
        result.props = { url, alt: text(block.props?.alt).slice(0, 180), caption: text(block.props?.caption).slice(0, 300) };
      } else {
        if (block.type === "heading") result.props.level = block.props?.level === 3 ? 3 : 2;
        if (["left", "center", "right", "justify"].includes(block.props?.textAlignment)) result.props.textAlignment = block.props.textAlignment;
        if (block.type === "numberedListItem" && Number.isInteger(block.props?.start) && block.props.start > 0 && block.props.start < 10000) result.props.start = block.props.start;
        result.content = inline(block.content);
      }
      result.children = blocks(block.children, depth + 1);
      return [result];
    });
  }
  return { version: CONTENT_VERSION, blocks: blocks(source) };
}

export function flattenBlocks(content) {
  return normalizeContent(content).blocks.flatMap(function walk(block) { return [block, ...block.children.flatMap(walk)]; });
}

export function inlineText(content) {
  return (content || []).map((part) => part.type === "link" ? inlineText(part.content) : part.text || "").join("");
}

export function contentText(content) {
  return flattenBlocks(content).filter((block) => block.type !== "photo").map((block) => inlineText(block.content)).join("\n").trim();
}

export function validatePublishedContent(content) {
  const blocks = flattenBlocks(content);
  if (!blocks.some((block) => block.type === "paragraph" && inlineText(block.content).trim())) throw new Error("Obsah musí obsahovať aspoň jeden odsek textu.");
  if (blocks.some((block) => block.type === "photo" && (!block.props.url || !block.props.alt.trim()))) throw new Error("Každá fotografia v obsahu potrebuje obrázok a alternatívny popis (alt).");
}
