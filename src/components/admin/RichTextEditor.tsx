import React, { useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

// ── Toolbar button helper ────────────────────────────────────────────────────
function ToolBtn({
  onClick,
  active = false,
  title,
  children,
  disabled = false,
}: {
  onClick: () => void;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // keep editor focus
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold transition-all duration-150 select-none ${
        active
          ? "bg-blue-600/30 text-blue-300 border border-blue-500/40"
          : "text-slate-400 hover:text-white hover:bg-white/8 border border-transparent"
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

// ── Separator ────────────────────────────────────────────────────────────────
function Sep() {
  return <div className="w-px h-5 bg-white/10 mx-0.5 shrink-0" />;
}

// ── Main component ───────────────────────────────────────────────────────────
interface RichTextEditorProps {
  value: string;           // HTML string
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Mulai menulis konten di sini...",
  minHeight = 180,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: {},
        orderedList: {},
        blockquote: {},
        bold: {},
        italic: {},
        strike: {},
        code: false,
        codeBlock: false,
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-400 underline underline-offset-2 cursor-pointer",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
  });

  // Sync external value changes (e.g. block switch)
  React.useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== value) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  // Link insertion handler
  const handleSetLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Masukkan URL tautan:", prev || "https://");
    if (url === null) return; // cancelled
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  // ── Heading shortcut ─────────────────────────────────────────────────────
  const isHeading = (level: 1 | 2 | 3) =>
    editor.isActive("heading", { level });

  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden bg-slate-950 focus-within:border-blue-500/40 focus-within:ring-4 focus-within:ring-blue-500/8 transition-all duration-200">

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-white/8 bg-slate-900/60">

        {/* Text format */}
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold (Ctrl+B)"
        >
          <span className="font-black text-[11px]">B</span>
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic (Ctrl+I)"
        >
          <span className="italic font-semibold text-[11px]">I</span>
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline (Ctrl+U)"
        >
          <span className="underline font-semibold text-[11px]">U</span>
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <span className="line-through font-semibold text-[11px]">S</span>
        </ToolBtn>

        <Sep />

        {/* Headings */}
        {([1, 2, 3] as const).map((lvl) => (
          <ToolBtn
            key={lvl}
            onClick={() => editor.chain().focus().toggleHeading({ level: lvl }).run()}
            active={isHeading(lvl)}
            title={`Heading ${lvl}`}
          >
            <span className="text-[10px] font-black">H{lvl}</span>
          </ToolBtn>
        ))}

        <Sep />

        {/* Alignment */}
        <ToolBtn
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeftIcon />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenterIcon />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <AlignRightIcon />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          active={editor.isActive({ textAlign: "justify" })}
          title="Justify"
        >
          <AlignJustifyIcon />
        </ToolBtn>

        <Sep />

        {/* Lists */}
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <BulletListIcon />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <NumberedListIcon />
        </ToolBtn>

        <Sep />

        {/* Blockquote */}
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <BlockquoteIcon />
        </ToolBtn>

        {/* Link */}
        <ToolBtn
          onClick={handleSetLink}
          active={editor.isActive("link")}
          title="Insert / Edit Link"
        >
          <LinkIcon />
        </ToolBtn>
      </div>

      {/* ── Content area ── */}
      <EditorContent
        editor={editor}
        className="prose-editor px-5 py-4 text-sm text-slate-200 leading-relaxed"
        style={{ minHeight }}
      />

      {/* ── Injected prose styles ── */}
      <style>{`
        .prose-editor .tiptap {
          outline: none;
          min-height: ${minHeight}px;
          color: #cbd5e1;
          font-size: 0.8rem;
          line-height: 1.75;
        }
        .prose-editor .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #475569;
          pointer-events: none;
          height: 0;
        }
        .prose-editor .tiptap h1 { font-size: 1.4rem; font-weight: 900; color: #f1f5f9; margin: 0.75em 0 0.35em; line-height: 1.2; }
        .prose-editor .tiptap h2 { font-size: 1.15rem; font-weight: 800; color: #e2e8f0; margin: 0.7em 0 0.3em; }
        .prose-editor .tiptap h3 { font-size: 0.95rem; font-weight: 700; color: #cbd5e1; margin: 0.65em 0 0.25em; }
        .prose-editor .tiptap p  { margin: 0.4em 0; }
        .prose-editor .tiptap strong { color: #f1f5f9; font-weight: 700; }
        .prose-editor .tiptap em { color: #94a3b8; }
        .prose-editor .tiptap s  { color: #64748b; }
        .prose-editor .tiptap u  { text-decoration-color: #3b82f6; }
        .prose-editor .tiptap a  { color: #60a5fa; text-decoration: underline; text-underline-offset: 2px; }
        .prose-editor .tiptap ul { list-style-type: disc; padding-left: 1.4em; margin: 0.4em 0; }
        .prose-editor .tiptap ol { list-style-type: decimal; padding-left: 1.4em; margin: 0.4em 0; }
        .prose-editor .tiptap li { margin: 0.15em 0; }
        .prose-editor .tiptap blockquote {
          border-left: 3px solid #3b82f6;
          padding-left: 1em;
          margin: 0.6em 0;
          color: #94a3b8;
          font-style: italic;
          background: rgba(59,130,246,0.06);
          border-radius: 0 0.5rem 0.5rem 0;
        }
        /* Text alignment */
        .prose-editor .tiptap [style*="text-align: left"]    { text-align: left; }
        .prose-editor .tiptap [style*="text-align: center"]  { text-align: center; }
        .prose-editor .tiptap [style*="text-align: right"]   { text-align: right; }
        .prose-editor .tiptap [style*="text-align: justify"] { text-align: justify; }
      `}</style>
    </div>
  );
}

// ── SVG Icon helpers (inline, no extra dependency) ───────────────────────────
const AlignLeftIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/>
  </svg>
);
const AlignCenterIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
  </svg>
);
const AlignRightIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/>
  </svg>
);
const AlignJustifyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const BulletListIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/>
    <line x1="8" y1="6" x2="21" y2="6"/>
    <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
  </svg>
);
const NumberedListIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/>
    <path d="M4 6h1V9" strokeLinecap="round"/><path d="M4 11h2l-2 3h2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 17h1.5a.5.5 0 010 1H4" strokeLinecap="round"/>
  </svg>
);
const BlockquoteIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
  </svg>
);
const LinkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
  </svg>
);
