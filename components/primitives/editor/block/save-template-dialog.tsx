'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  saveTemplate,
  savePostTemplate,
  updateTemplate,
} from '@/app/dashboard/(dashboard)/(features)/article/_server/templates.service';
import {
  savePost,
  getPost,
} from '@/app/dashboard/(dashboard)/(features)/article/_server/post.service';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ActionButton } from '@/components/primitives';
import type { BlockEditorRef } from './index';
import { useTranslations } from 'next-intl';
import type { Value } from 'platejs';
import { createSlateEditor, serializeHtml } from 'platejs';
import { BaseEditorKit } from '@/components/editor/editor-base-kit';
import { EditorStatic } from '@/components/ui/editor-static';

const templateFormSchema = z.object({
  name: z.string().min(1, '標題為必填項'),
  // description: z.string().optional(),
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;

interface SaveTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEditor?: BlockEditorRef | null;
  webEditor?: Value | undefined;
  mobileEditor?: Value | undefined;
  onTemplateSaved?: (templateId: string) => void;
  existingTemplate?: { id: string; name: string } | null;
  postId: string | null;
}

export function SaveTemplateDialog({
  open,
  onOpenChange,
  currentEditor,
  webEditor,
  mobileEditor,
  onTemplateSaved,
  existingTemplate,
  postId,
}: SaveTemplateDialogProps) {
  const t = useTranslations('dashboard.article.template.error');
  const tn = useTranslations('dashboard.article.template');

  const [isTemplateSaving, setIsTemplateSaving] = useState(false);
  const [enableSaveAs, setEnableSaveAs] = useState<boolean>(false);
  const [existingTemplateId, setExistingTemplateId] = useState<string | null>(
    null
  );

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: '',
      // description: "",
    },
  });

  useEffect(() => {
    // 如果有傳入的 existingTemplate，則設定為覆蓋模式
    if (existingTemplate) {
      setEnableSaveAs(true);
      setExistingTemplateId(existingTemplate.id);
      form.setValue('name', existingTemplate.name);
      // form.setValue("description", "");
    } else {
      setEnableSaveAs(false);
      setExistingTemplateId(null);
      form.reset();
    }
  }, [existingTemplate, form]);

  const savePostWithTemplate = async (
    webContent: Value,
    mobileContent?: Value | null,
    webHtml?: string | null,
    mobileHtml?: string | null
  ) => {
    if (!postId) return;

    try {
      // 先獲取現有文章資料
      const existingPost = await getPost(postId);
      if (existingPost) {
        // mobile 為空時，使用 web 的內容
        const postData = {
          title: existingPost.title || '',
          slug: existingPost.slug,
          content: webContent,
          html: webHtml || '',
          htmlMobile: mobileHtml || '',
          contentMobile: mobileContent,
          excerpt: existingPost.excerpt || '',
          published: existingPost.status === 'published',
        };

        await savePost(postData, postId);
        toast.success(t('templateUpdatedSuccess'));
      }
    } catch (postError) {
      console.error('模板儲存成功，但文章儲存失敗', postError);
    }
  };

  const handleOverwriteTemplate = async (values: TemplateFormValues) => {
    if (!postId || !existingTemplateId) {
      console.error('缺少必要的參數');
      return;
    }

    try {
      setIsTemplateSaving(true);

      // 獲取當前編輯器內容
      if (!currentEditor) {
        toast.error(t('fetchEditorContentFailed'));
        return;
      }

      const currentContent = currentEditor.getValue();
      const currentHtml = await currentEditor.getHtml();

      if (!currentContent || !currentHtml) {
        toast.error(t('editorContentEmpty'));
        return;
      }

      // 獲取網頁版和手機版內容，確保異步操作完成
      const webContent = webEditor ? webEditor : currentContent;
      const mobileContent = mobileEditor ? mobileEditor : currentContent;

      // 將 Value 轉換為 HTML
      const webHtml = webContent
        ? await serializeHtml(
            createSlateEditor({
              plugins: BaseEditorKit,
              value: webContent,
            }),
            {
              editorComponent: EditorStatic,
            }
          )
        : '';

      const mobileHtml = mobileContent
        ? await serializeHtml(
            createSlateEditor({
              plugins: BaseEditorKit,
              value: mobileContent,
            }),
            {
              editorComponent: EditorStatic,
            }
          )
        : '';

      // 更新現有模板
      const result = await updateTemplate(existingTemplateId, {
        name: values.name,
        htmlContent: webContent,
        mobileContent: mobileContent,
      });

      console.log('更新模板結果:', result);

      if (result.success) {
        toast.success(t('templateUpdatedSuccess'));
        // 通知父組件更新資料
        onTemplateSaved?.(existingTemplateId);

        // 同時儲存文章
        if (postId) {
          await savePostWithTemplate(
            webContent,
            mobileContent,
            webHtml,
            mobileHtml
          );
        }
      }

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('更新模板失敗:', error);
      toast.error(t('templateUpdatedFailed'));
    } finally {
      setIsTemplateSaving(false);
    }
  };

  const handleTemplateSave = async (values: TemplateFormValues) => {
    if (!postId) {
      toast.error(t('error.noPostId'));
      return;
    }

    try {
      setIsTemplateSaving(true);

      // 獲取當前編輯器內容
      if (!currentEditor) {
        toast.error(t('fetchEditorContentFailed'));
        setIsTemplateSaving(false);
        return;
      }

      const currentContent = currentEditor.getValue();
      const currentHtml = await currentEditor.getHtml();

      if (!currentContent || !currentHtml) {
        toast.error(t('editorContentEmpty'));
        setIsTemplateSaving(false);
        return;
      }

      // 獲取網頁版和手機版編輯器內容
      let webContent = null;
      let webHtml = null;
      let mobileContent = null;
      let mobileHtml = null;

      // 如果有網頁版編輯器，獲取其內容，否則使用當前編輯器內容
      if (webEditor) {
        webContent = webEditor;
        webHtml = await webEditor;
      } else {
        webContent = currentContent;
        webHtml = currentHtml;
      }

      // 如果有手機版編輯器，獲取其內容
      if (mobileEditor) {
        mobileContent = mobileEditor;
        mobileHtml = await mobileEditor;
      } else {
        // 如果沒有手機版編輯器，使用網頁版內容作為 fallback
        mobileContent = webContent;
        mobileHtml = webHtml; // 直接使用 webHtml 而不是設為 null
      }

      // 儲存模板
      const result = await saveTemplate({
        name: values.name,
        // description: values.description,
        pageId: postId || undefined,
        htmlContent: webContent,
        mobileContent: mobileContent,
      });

      console.log('儲存模板結果:', result);

      // 儲存模板成功後，自動更新 post.saved_template_id
      if (result.success && result.template?.id) {
        try {
          await savePostTemplate(postId, result.template.id);

          // 通知父組件更新資料
          onTemplateSaved?.(result.template.id);

          // 同時儲存文章
          if (postId) {
            await savePostWithTemplate(webContent, mobileContent);
          } else {
            toast.success(t('templateSavedSuccess'));
          }
        } catch (error) {
          console.error('更新 post.saved_template_id 失敗:', error);
          toast.error(t('templateUpdatedFailed'));
        }
      } else {
        toast.success(t('templateUpdatedSuccess'));
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error(t('saveTemplateFailed'), error);
      toast.error(t('saveTemplateFailed'));
    } finally {
      setIsTemplateSaving(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {enableSaveAs ? tn('templateChange') : tn('saveTemplate')}
          </DialogTitle>
          <DialogDescription>
            {enableSaveAs ? tn('confirmUpdate') : tn('createNewTemplate')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{tn('title')}</FormLabel>
                  <FormControl>
                    <Input placeholder={tn('enterTitle')} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            {/* <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>模板說明</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="請輸入模板說明（選填）"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <DialogFooter
              className={
                enableSaveAs
                  ? 'justify-between sm:justify-between'
                  : 'justify-end sm:'
              }
            >
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isTemplateSaving}
              >
                {tn('cancel')}
              </Button>

              {enableSaveAs ? (
                <div className="flex gap-2">
                  <ActionButton
                    type="button"
                    variant="outline"
                    disabled={!enableSaveAs || isTemplateSaving}
                    onClick={form.handleSubmit(handleOverwriteTemplate)}
                  >
                    {tn('overwrite')}
                  </ActionButton>
                  <ActionButton
                    type="button"
                    loading={isTemplateSaving}
                    disabled={isTemplateSaving}
                    onClick={form.handleSubmit(handleTemplateSave)}
                  >
                    {isTemplateSaving ? tn('saving') : tn('saveAs')}
                  </ActionButton>
                </div>
              ) : (
                <ActionButton
                  type="button"
                  loading={isTemplateSaving}
                  disabled={isTemplateSaving}
                  onClick={form.handleSubmit(handleTemplateSave)}
                >
                  {isTemplateSaving ? tn('saving') : tn('save')}
                </ActionButton>
              )}
            </DialogFooter>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
