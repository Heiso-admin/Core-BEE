"use client";

import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
} from "@platejs/basic-nodes/react";
import type { Value } from "platejs";
import { createSlateEditor, serializeHtml } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";
import * as React from "react";
import { useDebounceCallback } from "usehooks-ts";

import { BaseEditorKit } from "@/components/editor/editor-base-kit";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { EditorStatic } from "@/components/ui/editor-static";
import { FixedToolbar } from "@/components/ui/fixed-toolbar";
import { MarkToolbarButton } from "@/components/ui/mark-toolbar-button";
import { cn } from "@/lib/utils";
// import { Bold, Italic, Underline } from 'lucide-react'; // Example icons

export function MiniEditor({
  className,
  value,
  onChange,
}: {
  className?: string;
  value?: Value;
  onChange?: ({ value, html }: { value: Value; html: string }) => void;
}) {
  const editor = usePlateEditor({
    plugins: [BoldPlugin, ItalicPlugin, UnderlinePlugin],
    value,
  });

  const debouncedChange = useDebounceCallback(async (value: Value) => {
    const editorStatic = createSlateEditor({
      plugins: BaseEditorKit,
      value: editor.children,
    });

    const html = await serializeHtml(editorStatic, {
      editorComponent: EditorStatic,
      // props: {
      //   style: { padding: '0 calc(50% - 350px)', paddingBottom: '' },
      // },
    });

    console.log("html: ", html);
    onChange?.({ value, html });
  }, 500);

  return (
    <Plate editor={editor} onChange={({ value }) => debouncedChange(value)}>
      <FixedToolbar className="justify-start rounded-t-lg">
        <MarkToolbarButton nodeType="bold" tooltip="Bold (⌘+B)">
          B
        </MarkToolbarButton>
        <MarkToolbarButton nodeType="italic" tooltip="Italic (⌘+I)">
          I
        </MarkToolbarButton>
        <MarkToolbarButton nodeType="underline" tooltip="Underline (⌘+U)">
          U
        </MarkToolbarButton>
      </FixedToolbar>

      <EditorContainer>
        <Editor
          className={cn("max-h-[650px]", className)}
          variant="fullWidth"
          placeholder="Type your amazing content here..."
        />
      </EditorContainer>
    </Plate>
  );
}
