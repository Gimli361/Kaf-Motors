"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Undo,
  Redo,
  Minus,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

function AracButon({
  aktif,
  onClick,
  children,
  etiket,
}: {
  aktif?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  etiket: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={etiket}
      aria-pressed={aktif}
      className={`rounded p-1.5 hover:bg-accent ${aktif ? "bg-accent text-accent-foreground" : ""}`}
    >
      {children}
    </button>
  );
}

function AracCubugu({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b p-1.5">
      <AracButon
        etiket="Kalın"
        aktif={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="size-4" />
      </AracButon>
      <AracButon
        etiket="İtalik"
        aktif={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-4" />
      </AracButon>
      <AracButon
        etiket="Başlık"
        aktif={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="size-4" />
      </AracButon>
      <AracButon
        etiket="Madde listesi"
        aktif={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="size-4" />
      </AracButon>
      <AracButon
        etiket="Numaralı liste"
        aktif={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" />
      </AracButon>
      <AracButon
        etiket="Yatay Çizgi"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className="size-4" />
      </AracButon>
      <span className="mx-1 h-5 w-px bg-border" />
      <AracButon etiket="Geri al" onClick={() => editor.chain().focus().undo().run()}>
        <Undo className="size-4" />
      </AracButon>
      <AracButon etiket="Yinele" onClick={() => editor.chain().focus().redo().run()}>
        <Redo className="size-4" />
      </AracButon>
    </div>
  );
}

export function TiptapEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-40 px-3 py-2 outline-none [&_h2]:text-lg [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_hr]:my-4 [&_hr]:border-t [&_hr]:border-border/60",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  return (
    <div className="rounded-lg border">
      {editor && <AracCubugu editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
