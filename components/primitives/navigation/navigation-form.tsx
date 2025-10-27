"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import type React from "react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { getCategoryList } from "@/app/dashboard/(dashboard)/(features)/article/_server/category.service";
import { getPostList } from "@/app/dashboard/(dashboard)/(features)/article/_server/post.service";
import {
  getCategories,
  getPages,
} from "@/app/dashboard/(dashboard)/(features)/pages/_server/pages.service";
import { ActionButton } from "@/components/primitives";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUploadFile } from "@/hooks/use-upload-file";
import { cn } from "@/lib/utils";
import { IconUploader } from "../file-uploader";
import type { NavigationItem } from ".";

const formSchema = z
  .object({
    title: z.string().min(1, "This is required"),
    slug: z.string(),
    subTitle: z.string(),
    parentItem: z.string().optional(),
    linkType: z.string(),
    link: z.string().optional(),
    linkCategory: z.string().optional(),
    linkItem: z.string().optional(),
    icon: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    // 條件1：當 linkType 是 'link' 時，'link' 欄位為必填
    if (data.linkType === "link") {
      if (!data.link || data.link.trim() === "") {
        ctx.addIssue({
          code: "custom",
          path: ["linkItem"],
          message: "This is required",
        });
      }
    }

    // 條件2：當 linkType 是 'page' 或 'article' 時，'linkCategory' 和 'linkItem' 為必填
    if (data.linkType === "page" || data.linkType === "article") {
      if (!data.linkCategory) {
        ctx.addIssue({
          code: "custom",
          path: ["linkCategory"],
          message: "This is required",
        });
      }
      if (!data.linkItem) {
        ctx.addIssue({
          code: "custom",
          path: ["linkItem"],
          message: "This is required",
        });
      }
    }
  });
interface NavigationFormProps {
  item?: NavigationItem | null;
  isPending?: boolean;
  onSave: (item: Partial<Omit<NavigationItem, "id">>) => void;
  onCancel: () => void;
  navigationItems: NavigationItem[];
}

export function NavigationForm({
  item,
  isPending = false,
  onSave,
  onCancel,
  navigationItems,
}: NavigationFormProps) {
  const t = useTranslations("dashboard.navigation.navigation-manager");
  const { uploadFile, isUploading } = useUploadFile();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: item?.title ?? "",
      slug: item?.slug ?? "",
      subTitle: item?.subTitle ?? "",
      parentItem: item?.parentId ?? "null",
      linkType: item?.linkType ?? "none",
      linkCategory: item?.link.split("/")[0] ?? "",
      linkItem: item?.link.split("/")[1] ?? "",
      icon: item?.icon,
    },
  });

  const [pageCategories, setPageCategories] = useState<
    Array<{
      id: string;
      name: string;
    }>
  >([]);
  const [pages, setPages] = useState<Array<{ id: string; title: string }>>([]);
  const [articleCategories, setArticleCategories] = useState<
    Array<{
      id: string;
      name: string;
      slug: string;
    }>
  >([]);
  const [articles, setArticles] = useState<
    Array<{ id: string; title: string; slug: string }>
  >([]);

  useEffect(() => {
    getCategories().then((categories) => {
      setPageCategories(categories);
    });
    getCategoryList().then(setArticleCategories);
  }, []);

  const linkType = useWatch({
    control: form.control,
    name: "linkType",
  });

  const linkCategory = useWatch({
    control: form.control,
    name: "linkCategory",
  });

  useEffect(() => {
    if (linkType === "page") {
      const categoryId = linkCategory;
      if (categoryId) {
        getPages({ categoryId }).then((result) => {
          if (result?.pages) {
            setPages(
              result.pages.map((page) => ({
                id: page.id,
                title: page.title || "",
              })),
            );
          }
        });
      } else {
        setPages([]);
      }
    } else if (linkType === "article") {
      const categoryId = linkCategory;
      if (categoryId) {
        getPostList({ categoryId, start: 0, limit: 100 }).then((result) => {
          if (result?.data) {
            setArticles(
              result.data.map((post) => ({
                id: post.id,
                title: post.title || "",
                slug: post.slug,
              })),
            );
          }
        });
      } else {
        setArticles([]);
      }
    }
  }, [linkType, linkCategory]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let finalLink = "";
    if (
      (values.linkType === "page" || values.linkType === "article") &&
      values.linkCategory &&
      values.linkItem
    ) {
      finalLink = `${values.linkCategory}/${values.linkItem}`;
    } else if (values.linkType === "link") {
      finalLink = values.linkItem || "";
    }

    const dataToSave: Partial<Omit<NavigationItem, "id">> = {
      title: values.title.trim(),
      slug: values.slug.trim(),
      subTitle: values.subTitle.trim() ?? "",
      parentId: values.parentItem === "null" ? null : values.parentItem,
      linkType: values.linkType,
      link: finalLink,
      icon: values.icon,
    };

    // 檢查 icon 欄位是否是一個新的 File 物件
    if (values.icon instanceof File) {
      try {
        toast.info("Uploading icon...");
        const uploadedFile = await uploadFile(values.icon);

        dataToSave.icon = uploadedFile.url;
        toast.success("Icon uploaded successfully!");
      } catch (error) {
        toast.error("Icon upload failed");
        console.error(error);
        return;
      }
    } else {
      dataToSave.icon = values.icon;
    }

    onSave(dataToSave);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t("titleItem")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("enterTitle")}
                  className="w-full"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("subtitleItem")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("enterSubtitle")}
                  className="w-full"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parentItem"
          render={({ field }) => (
            <FormItem>
              <FormLabel onClick={() => console.log(item)}>
                {t("parentItem.title")}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Icon
                        icon="lucide:circle-question-mark"
                        className="ml-1 size-3 text-gray-500"
                      />
                    </TooltipTrigger>
                    <TooltipContent className="whitespace-pre-line">
                      {item?.children && item.children.length > 0
                        ? t("parentItem.note.cannotMove")
                        : t("parentItem.note.canSelectParent")}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(`${value}`);
                  }}
                  //當我是父層選單時，還有子層不可選擇
                  disabled={item?.children && item.children.length > 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("parentItem.note.text")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">
                      {t("parentItem.note.none")}
                    </SelectItem>
                    {navigationItems?.map((nav) => (
                      <SelectItem
                        key={nav.id}
                        value={nav.id}
                        disabled={item?.id === nav.id}
                      >
                        {nav.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="linkType"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t("linkItem")}</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    // 每次切換 linkType 時，清空 link 的值
                    form.setValue("linkCategory", "");
                    form.setValue("linkItem", "");
                    field.onChange(`${value}`);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select link type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("typeNone")}</SelectItem>
                    <SelectItem value="link">{t("typeLink")}</SelectItem>
                    <SelectItem value="page">{t("typePage")}</SelectItem>
                    <SelectItem value="article">{t("typeArticle")}</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />

        {linkType === "link" && (
          <FormField
            control={form.control}
            name="linkItem"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>{t("typeLink")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("inputLink")}
                    className="w-full"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {linkType === "page" && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="linkCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t("typePageCategory")}</FormLabel>
                  <Select
                    value={field.value || ""}
                    onValueChange={(value) => field.onChange(`${value}`)}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("inputPageCategory")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pageCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {form.watch("linkCategory") && (
              <FormField
                control={form.control}
                name="linkItem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t("typePage")}</FormLabel>
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("inputPage")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {pages.map((page) => (
                          <SelectItem key={page.id} value={page.id}>
                            {page.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}
          </div>
        )}

        {linkType === "article" && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="linkCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t("typeArticleCategory")}</FormLabel>
                  <Select
                    value={field.value || ""}
                    onValueChange={(value) => field.onChange(`${value}`)}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("inputArticleCategory")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {articleCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {form.watch("linkCategory") && (
              <FormField
                control={form.control}
                name="linkItem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t("typeArticle")}</FormLabel>
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("inputArticle")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {articles.map((article) => (
                          <SelectItem key={article.id} value={article.id}>
                            {article.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}
          </div>
        )}

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("iconItem")}</FormLabel>
              <FormControl>
                <IconUploader
                  value={field.value}
                  onValueChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("cancel")}
          </Button>
          <ActionButton
            disabled={isPending || isUploading}
            loading={isPending || isUploading}
            type="submit"
          >
            {t("save")}
          </ActionButton>
        </div>
      </form>
    </Form>
  );
}
