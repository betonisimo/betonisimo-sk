"use client";

import { FormField } from "./AdminFormUI";
import { CATALOG_PATHS, suggestedCatalogSlug } from "@/lib/catalog-urls";
import { SITE_URL } from "@/lib/site-url";

export default function CatalogUrlField({ title, kind, initialSlug, initialTitle }) {
  const slug = suggestedCatalogSlug(title, { slug: initialSlug, title: initialTitle }, title.trim() ? kind : "");
  return <div className="space-y-3">
    <FormField name="slug" label="URL adresa" readOnly value={slug} spellCheck={false}
      aria-describedby="catalog-url-help catalog-url-preview" placeholder="Vytvorí sa automaticky z názvu" />
    <p id="catalog-url-preview" className="break-all text-sm font-semibold text-slate-700">{SITE_URL}{CATALOG_PATHS[kind]}/{slug || "…"}</p>
    <p id="catalog-url-help" className="text-sm leading-6 text-slate-500">
      URL sa vytvára automaticky z názvu. Ak je adresa obsadená, pri uložení sa pridá číslo.
      {initialSlug && " Po zmene názvu a uložení sa stará adresa automaticky presmeruje na novú."}
    </p>
  </div>;
}
