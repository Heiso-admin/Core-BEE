"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import { createSlateEditor, serializeHtml, type Value } from "platejs";
import { Plate, createPlatePlugin, usePlateEditor, useEditorRef } from "platejs/react";
import * as React from "react";
import { useDebounceCallback } from "usehooks-ts";
import { BaseEditorKit } from "@/components/editor/editor-base-kit";
import { EditorKit } from "@/components/editor/editor-kit";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { FixedToolbar } from "@/components/ui/fixed-toolbar";
import { FixedToolbarButtons } from "@/components/ui/fixed-toolbar-buttons";
import { EditorStatic } from "@/components/ui/editor-static";
import { ToolbarGroup, ToolbarButton } from "@/components/ui/toolbar";
import { FileCode2, LoaderCircle, Save, Trash2 } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { SaveTemplateDialog } from "./save-template-dialog";
import { getTemplateById, getTemplatesList, deleteTemplate } from "@/app/dashboard/(dashboard)/(features)/article/_server/templates.service";
import { getPost } from "@/app/dashboard/(dashboard)/(features)/article/_server/post.service";
import { toast } from "sonner";
import { TemplateItem } from "@/app/dashboard/(dashboard)/(features)/article/_server/templates.service";
import { motion } from "framer-motion";


export interface BlockEditorRef {
  editor: ReturnType<typeof usePlateEditor>;
  getValue: () => Value;
  setValue: (value: Value) => void;
  getHtml: () => Promise<string>;
}

interface BlockEditorProps {
  editorClassName?: string;
  containerClassName?: string;
  disable?: boolean;
  variant?: React.ComponentProps<typeof Editor>["variant"];
  value?: Value;
  onChange?: ({ value, html }: { value: Value; html: string }) => void;
  toolVisibility?: {
    showTemplateListButton?: boolean;
    showSaveTemplateButton?: boolean;
  };
  webEditor?: Value | undefined;
  mobileEditor?: Value | undefined;
  onTemplateSelect?: (templateId: string) => void;
  currentSavedTemplateId?: string;
}

export const BlockEditor = React.forwardRef<BlockEditorRef, BlockEditorProps>(
  function BlockEditor({ editorClassName, containerClassName, disable = false, variant = "fullWidth", value, onChange, toolVisibility, webEditor, mobileEditor, onTemplateSelect, currentSavedTemplateId }, ref) {
    const t = useTranslations("dashboard.article.template");
    // 從 URL 中獲取 postId
    const currentUrl = window.location.pathname;
    const regex = /post\/(.*?)\/edit/;
    const match = currentUrl.match(regex);
    const fetchPostId = match?.[1] || null;

    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
    const [existingTemplate, setExistingTemplate] = useState<{ id: string; name: string; description?: string } | null>(null);
    const internalRef = useRef<BlockEditorRef>(null);

    const clickSaveTemplateHandler = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      toast.info(t("loading"));
      if (!fetchPostId) {
        toast.error(t("error.noPostId"));
        return;
      }

      const existingPost = await getPost(fetchPostId);
      if (!existingPost) {
        toast.error(t("error.postNotFound"));
        return;
      }

      // 如果文章有關聯的模板，預先讀取模板資料
      if (existingPost?.savedTemplateId) {
        try {
          const templateData = await getTemplateById(existingPost?.savedTemplateId);
          if (templateData) {
            setExistingTemplate({
              id: templateData.id,
              name: templateData.name,
              description: templateData.description || "",
            });
          }
          toast.dismiss()
        } catch (error) {
          console.error("獲取模板資訊失敗:", error);
          setExistingTemplate(null);
        }
      } else {
        setExistingTemplate(null);
      }
        
      setIsTemplateDialogOpen(true);
    }, [fetchPostId, t]);
    
    const plugins = useMemo(() => {
      let list = [...EditorKit];
      list = list.filter((p: any) => p?.key !== "fixed-toolbar");
      list.push(
        createPlatePlugin({
          key: "fixed-toolbar",
          render: {
            beforeEditable: () => (
              <FixedToolbar>
                <FixedToolbarButtons>
                {(toolVisibility?.showTemplateListButton || toolVisibility?.showSaveTemplateButton) && (
                  <ToolbarGroup>
                    {toolVisibility?.showTemplateListButton && <TemplateList openMobileEditor={webEditor !== undefined} />}
                    {toolVisibility?.showSaveTemplateButton && (
                      <ToolbarButton
                        tooltip={t("saveTemplate")}
                        onClick={clickSaveTemplateHandler}
                      >
                        <Save className="size-4" />
                      </ToolbarButton>
                    )}
                  </ToolbarGroup>
                )}
                </FixedToolbarButtons>
              </FixedToolbar>
            ),
          },
        }),
      );

      return list;
    }, [toolVisibility, t, clickSaveTemplateHandler, webEditor]);

    const editor = usePlateEditor({
      plugins,
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

    // Expose ref methods
    React.useImperativeHandle(
      ref,
      () => {
        const editorRef = {
          editor,
          getValue: () => editor.children,
          setValue: (value: Value) => {
            editor.tf.setValue(value);
          },
          getHtml: async () => {
            const editorStatic = createSlateEditor({
              plugins: BaseEditorKit,
              value: editor.children,
            });
            return await serializeHtml(editorStatic, {
              editorComponent: EditorStatic,
            });
          },
        };
        internalRef.current = editorRef;
        return editorRef;
      },
      [editor],
    );

    return (
      <>
        <Plate editor={editor} onChange={({ value }) => debouncedChange(value)} >
          <EditorContainer className={cn(containerClassName, disable && "pointer-events-none select-none cursor-default opacity-30")}>
            <Editor
              className={cn(editorClassName)}
              variant={variant}
            />
          </EditorContainer>
        </Plate>
        {disable && (
          <motion.div
            className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", disable && "visible")}
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 1,
            }}
          >
            <LoaderCircle className="size-8" />
          </motion.div>
        )}
        <SaveTemplateDialog 
          open={isTemplateDialogOpen} 
          onOpenChange={setIsTemplateDialogOpen} 
          currentEditor={internalRef.current}
          webEditor={webEditor}
          mobileEditor={mobileEditor}
          existingTemplate={existingTemplate}
          postId={fetchPostId}
          onTemplateSaved={(templateId) => {
            // 通知父組件更新 savedTemplateId
            onTemplateSelect?.(templateId);
            
            // 更新當前模板資訊
            if (templateId) {
              getTemplateById(templateId).then((templateData) => {
                if (templateData) {
                  setExistingTemplate({
                    id: templateData.id,
                    name: templateData.name,
                  });
                }
              }).catch((error) => {
                console.error("Failed to fetch updated template:", error);
              });
            }
          }}
        />
      </>
    );
  },
);

BlockEditor.displayName = "BlockEditor";

interface TemplateListProps {
  openMobileEditor?: boolean;
}

const TemplateList: React.FC<TemplateListProps> = ({ openMobileEditor }) => {
    const t = useTranslations("dashboard.article.template");
  const editor = useEditorRef();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      const templatesList = await getTemplatesList();
      setTemplates(templatesList);
    } catch (error) {
      console.error("獲取模板清單失敗:", error);
      toast.error(t("error.fetchTemplateFailed"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    try {
      await deleteTemplate(templateId);
      toast.success(t("error.deleteTemplateSuccess", { templateName }));
      // 重新獲取模板清單
      const templatesList = await getTemplatesList();
      setTemplates(templatesList);
    } catch (error) {
      console.error("刪除模板失敗:", error);
      toast.error(t("error.deleteTemplateFailed"));
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const applyTemplate = async (tpl: TemplateItem) => {
    try {
      const templateData = await getTemplateById(tpl.id);
      // 修正邏輯：web 模式載入 htmlContent，mobile 模式載入 mobileContent
      const rewriteEditor = openMobileEditor ? tpl.mobileContent : tpl.htmlContent;
      
      if (templateData && rewriteEditor) {
        editor.tf.focus();
        editor.tf.insertNodes(rewriteEditor, { select: true });
        toast.success(t("error.applyTemplateSuccess", { templateName: tpl.name }));
      } 
    } catch (error) {
      console.error("套用模板失敗:", error);
      toast.error(t("error.applyTemplateFailed"));
    }
  };

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (open) {
      fetchTemplates();
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger asChild>
        <ToolbarButton tooltip={t("openList")}>
          <FileCode2 className="size-4" />
        </ToolbarButton>
      </SheetTrigger>
      <SheetContent side="right" className="border-0 flex h-full flex-col min-h-0">
        <SheetHeader className="py-4 mb-2 border">
          <SheetTitle>{t("template")}</SheetTitle>
        </SheetHeader>
        <div className="px-5 min-h-0">
          <Input
            type="text"
            placeholder={t("searchTemplate")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="px-5 mt-4 space-y-4 overflow-y-auto flex-1 min-h-0">
            {isLoading ? (
              <div className="text-center text-muted-foreground">{t("loading")}</div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center text-muted-foreground">
                {t("noResultsFound")}
              </div>
            ) : (
              <ul className="space-y-2">
                {filteredTemplates.map((template) => (
                    <li key={template.id} className="p-3 rounded flex items-center justify-between cursor-pointer hover:bg-muted/30 border mr-2">
                      <SheetClose asChild className="flex-1 text-left ">
                      <button
                        type="button"
                        aria-label={template.name}
                        onClick={() => {
                          applyTemplate(template);
                        }}
                      >
                        <div className="font-medium">{template.name}</div>
                        {template.description && (
                          <div className="text-sm text-muted-foreground mt-1">{template.description}</div>
                        )}
                      </button>
                    </SheetClose>
                    <button
                      type="button"
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                      aria-label={`delete: ${template.name}`}
                      onClick={() => handleDeleteTemplate(template.id, template.name)}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
        </div>
      </SheetContent>
    </Sheet>
  );
};