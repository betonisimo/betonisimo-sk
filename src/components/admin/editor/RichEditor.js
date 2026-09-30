"use client";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("./BlockEditor"), {
  ssr: false,
  loading: () => <p role="status" className="border border-slate-200 bg-white p-8 text-sm text-slate-500">Načítavam editor…</p>,
});

export default function RichEditor(props) {
  return <Editor {...props} />;
}
