"use client";
/* eslint-disable @next/next/no-img-element -- Local editor previews use the original uploaded image. */
import { createContext, useContext, useRef, useState } from "react";
import { BlockNoteSchema, createHeadingBlockSpec, defaultBlockSpecs, defaultStyleSpecs } from "@blocknote/core";
import { filterSuggestionItems, insertOrUpdateBlockForSlashMenu, SideMenuExtension } from "@blocknote/core/extensions";
import { sk } from "@blocknote/core/locales";
import {
  BasicTextStyleButton, BlockTypeSelect, FormattingToolbar, FormattingToolbarController,
  SuggestionMenuController, createReactBlockSpec, getDefaultReactSlashMenuItems, useCreateBlockNote,
  SideMenu, SideMenuController, DragHandleMenu, RemoveBlockItem, useBlockNoteEditor, useComponentsContext, useExtensionState,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/ariakit";
import { ImagePlus, Link2, Redo2, Undo2 } from "lucide-react";
import { normalizeContent, safeLink } from "@/lib/rich-content";
import { uploadEditorImage } from "@/lib/upload-image-client";
import { buttonClass, inputClass } from "../AdminFormUI";
import "@blocknote/ariakit/style.css";
import "./editor.css";

const UploadContext = createContext(null);

function PhotoBlock({ block, editor }) {
  const { onUpload, onError, disabled } = useContext(UploadContext);
  const [uploading, setUploading] = useState(false);
  const uploadLock = useRef(false);
  async function upload(file) {
    if (!file || uploadLock.current) return;
    uploadLock.current = true;
    setUploading(true);
    onError?.("");
    onUpload?.(1);
    try {
      const url = await uploadEditorImage(file);
      // The block may have been removed/undone while the network request was running.
      if (editor.getBlock(block.id)) editor.updateBlock(block.id, { props: { url } });
    } catch (error) { onError?.(error.message); }
    finally { onUpload?.(-1); setUploading(false); uploadLock.current = false; }
  }
  return <div contentEditable={false} className="editor-photo" onKeyDown={(event) => {
    if (event.key === "Enter" && event.target.tagName === "INPUT" && event.target.type !== "file") event.preventDefault();
  }}>
    {block.props.url && <img src={block.props.url} alt={block.props.alt} className="mb-4 max-h-96 w-full object-contain" />}
    <label className={buttonClass + " cursor-pointer"}>
      <ImagePlus size={17} />{uploading ? "Nahrávam…" : block.props.url ? "Vymeniť fotografiu" : "Nahrať fotografiu"}
      <input aria-label="Fotografia v obsahu" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={disabled || uploading} onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
    </label>
    <label className="mt-4 block text-sm font-bold">Alternatívny popis (alt) *
      <input disabled={disabled} className={inputClass + " mt-2"} maxLength={180} value={block.props.alt} onChange={(e) => editor.updateBlock(block.id, { props: { alt: e.target.value } })} placeholder="Čo je na fotografii?" />
    </label>
    <label className="mt-3 block text-sm font-bold">Podpis pod fotografiou
      <input disabled={disabled} className={inputClass + " mt-2"} maxLength={300} value={block.props.caption} onChange={(e) => editor.updateBlock(block.id, { props: { caption: e.target.value } })} placeholder="Voliteľný viditeľný popis" />
    </label>
  </div>;
}

const photo = createReactBlockSpec({
  type: "photo",
  propSchema: { url: { default: "" }, alt: { default: "" }, caption: { default: "" } },
  content: "none",
}, {
  render: PhotoBlock,
  toExternalHTML: ({ block }) => <figure><img src={block.props.url} alt={block.props.alt} /><figcaption>{block.props.caption}</figcaption></figure>,
})();

const schema = BlockNoteSchema.create({
  blockSpecs: {
    paragraph: defaultBlockSpecs.paragraph,
    heading: createHeadingBlockSpec({ levels: [2, 3], defaultLevel: 2, allowToggleHeadings: false }),
    bulletListItem: defaultBlockSpecs.bulletListItem,
    numberedListItem: defaultBlockSpecs.numberedListItem,
    photo,
  },
  styleSpecs: Object.fromEntries(["bold", "italic", "underline", "strike"].map((key) => [key, defaultStyleSpecs[key]])),
});

function BlockMenu(props) {
  const editor = useBlockNoteEditor();
  const components = useComponentsContext();
  const block = useExtensionState(SideMenuExtension, { editor, selector: (state) => state?.block });
  const MenuItem = components.Generic.Menu.Item;
  return <DragHandleMenu {...props}>
    <MenuItem onClick={() => block && editor.moveBlocksUp(block.id)}>Posunúť vyššie</MenuItem>
    <MenuItem onClick={() => block && editor.moveBlocksDown(block.id)}>Posunúť nižšie</MenuItem>
    <RemoveBlockItem>Vymazať blok</RemoveBlockItem>
  </DragHandleMenu>;
}

function EditorSideMenu(props) {
  return <SideMenu {...props} dragHandleMenu={BlockMenu} />;
}

function EditorToolbar() {
  const { openLink } = useContext(UploadContext);
  return <FormattingToolbar>
    <BlockTypeSelect />
    <BasicTextStyleButton basicTextStyle="bold" />
    <BasicTextStyleButton basicTextStyle="italic" />
    <BasicTextStyleButton basicTextStyle="underline" />
    <BasicTextStyleButton basicTextStyle="strike" />
    <button type="button" className="bn-button editor-link-button" aria-label="Vytvoriť alebo upraviť odkaz" onMouseDown={(e) => e.preventDefault()} onClick={openLink}><Link2 size={18} /></button>
  </FormattingToolbar>;
}

export default function BlockEditor({ initialContent, fallback = "", onChange, onUpload, onError, disabled = false }) {
  const [initial] = useState(() => normalizeContent(initialContent, { fallback }).blocks);
  const dialog = useRef(null);
  const selection = useRef(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkError, setLinkError] = useState("");
  const editor = useCreateBlockNote({
    schema,
    dictionary: sk,
    initialContent: initial.length ? initial : undefined,
    domAttributes: { editor: { "aria-label": "Obsah – blokový editor" } },
  });
  function openLink() {
    if (disabled) return;
    const current = editor.prosemirrorState.selection;
    if (current.empty) { onError?.("Najprv označte slovo alebo časť textu, ktorú chcete prepojiť."); return; }
    onError?.("");
    selection.current = current;
    setLinkUrl(editor.getSelectedLinkUrl() || "");
    setLinkError("");
    dialog.current.showModal();
  }
  function applyLink(remove = false) {
    const url = remove ? "" : safeLink(linkUrl);
    if (!remove && !url) { setLinkError("Zadajte https://adresu.sk, /katalog alebo #sekcia."); return; }
    const { from, to } = selection.current;
    const mark = editor.prosemirrorState.schema.marks.link;
    editor.transact((tr) => {
      tr.setSelection(selection.current);
      tr.removeMark(from, to, mark);
      if (url) tr.addMark(from, to, mark.create({ href: url }));
    });
    dialog.current.close();
    editor.focus();
  }
  function addPhoto() {
    editor.focus();
    insertOrUpdateBlockForSlashMenu(editor, { type: "photo" });
  }
  return <UploadContext.Provider value={{ onUpload, onError, disabled, openLink }}>
    <div className="rich-editor" onKeyDownCapture={(event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k" && event.target.closest(".bn-editor")) { event.preventDefault(); event.stopPropagation(); openLink(); }
    }}>
      <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 p-3" role="toolbar" aria-label="Nástroje obsahu">
        <button type="button" disabled={disabled} className={buttonClass} onMouseDown={(e) => e.preventDefault()} onClick={() => editor.undo()} aria-label="Späť (Ctrl+Z)"><Undo2 size={17} /></button>
        <button type="button" disabled={disabled} className={buttonClass} onMouseDown={(e) => e.preventDefault()} onClick={() => editor.redo()} aria-label="Znova (Ctrl+Shift+Z)"><Redo2 size={17} /></button>
        <button type="button" disabled={disabled} className={buttonClass} onMouseDown={(e) => e.preventDefault()} onClick={openLink}><Link2 size={17} /> Odkaz na označený text</button>
        <button type="button" disabled={disabled} className={buttonClass} onMouseDown={(e) => e.preventDefault()} onClick={addPhoto}><ImagePlus size={17} /> Fotografia</button>
      </div>
      <BlockNoteView editor={editor} theme="light" editable={!disabled} formattingToolbar={false} slashMenu={false} linkToolbar={false} sideMenu={false}
        onChange={() => onChange({ version: 2, blocks: editor.document })}>
        <FormattingToolbarController formattingToolbar={EditorToolbar} />
        <SideMenuController sideMenu={EditorSideMenu} />
        <SuggestionMenuController triggerCharacter="/" getItems={async (query) => filterSuggestionItems([
          ...getDefaultReactSlashMenuItems(editor),
          { title: "Fotografia", subtext: "Obrázok, alternatívny popis a podpis", aliases: ["foto", "image", "obrazok"], group: "Médiá", icon: <ImagePlus size={18} />, onItemClick: addPhoto },
        ], query)} />
      </BlockNoteView>
      <p className="border-t border-slate-100 px-4 py-3 text-xs leading-5 text-slate-500">Napíšte / pre nadpisy a zoznamy. Označením textu otvoríte formátovanie. Bloky presuniete potiahnutím za bodky vľavo. Pre odkaz označte text a stlačte Ctrl+K.</p>
      <dialog ref={dialog} aria-labelledby="editor-link-title" className="editor-link-dialog" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyLink(); } }}>
        <h3 id="editor-link-title" className="mb-4 text-xl font-black">Odkaz na označený text</h3>
        <label className="block text-sm font-bold">Adresa odkazu<input autoFocus className={inputClass + " mt-2"} value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://… alebo /katalog" /></label>
        {linkError && <p role="alert" className="mt-2 text-sm text-red-600">{linkError}</p>}
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" className={buttonClass + " !bg-red-600 !text-white"} onClick={() => applyLink()}>Uložiť odkaz</button>
          <button type="button" className={buttonClass} onClick={() => applyLink(true)}>Odstrániť odkaz</button>
          <button type="button" className={buttonClass} onClick={() => { dialog.current.close(); editor.focus(); }}>Zrušiť</button>
        </div>
      </dialog>
    </div>
  </UploadContext.Provider>;
}
