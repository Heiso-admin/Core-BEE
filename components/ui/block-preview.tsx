"use client";
import { Suspense } from 'react';
import type { HTMLAttributes } from 'react';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LaptopMinimal, Smartphone } from "lucide-react";
// import { format } from 'date-fns';

export function PreviewPost({ editLink, html, mobileHtml, tags, excerpt, user, date, ...props }: HTMLAttributes<HTMLDivElement> & {
  editLink?: string;
  html: string;
  mobileHtml?: string;
  tags?: {
    tag: { id: string; name: string } | null;
  }[];
  excerpt?: string | null;
  user?: {
    id: string;
    name: string;
    avatar: string | null;
  } | null;
  date?: Date | null;
}) {
  const t = useTranslations("components.block");
  const tabConfigs = [
    { value: "web", className: "w-full mx-auto", label: t("web"), icon: LaptopMinimal },
    { value: "mobile", className: "w-sm mx-auto", label: t("mobile"), icon: Smartphone },
  ];
  const previewPropsWeb = { html, tags, excerpt, user, date };
  const previewPropsMobile = { html: mobileHtml ?? html, tags, excerpt, user, date };
  const hasContent = (html && html.trim().length > 0) || (mobileHtml && mobileHtml.trim().length > 0);

  return (
    <div className="container py-6 px-2 max-w-7xl flex-1 w-full m-auto" {...props}>
      {!hasContent ?  (
        <div className="text-center text-muted-foreground">
          {t("noFilledText")}
        </div>
      ):
      (
        <Tabs defaultValue="web" className="relative flex flex-col min-h-[50dvh] h-full">
          {editLink && 
            <Button className="float-right absolute -top-1 right-0" variant="ghost" asChild>
              <Link href={editLink}>{t("edit")}</Link>
            </Button>
          }
          <TabsList className="rounded-full px-1 bg-secondary mx-auto">
              {tabConfigs.map(({ value, label, icon: Icon }) => (
                <TabsTrigger key={value} value={value} variant="preview">
                  <Icon className="size-4" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          {tabConfigs.map(({ value, className }) => (
            <TabsContent key={value} value={value} variant='preview' className={className}>
              <PreviewContainer {...(value === "mobile" ? previewPropsMobile : previewPropsWeb)} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

export const PreviewTitle = ({ 
  className,
  title = "",
  found = false,
  noFilled = false,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & {  
  className?: string 
  title?: string | null 
  found?: boolean
  noFilled?: boolean
}) => {
  const t = useTranslations("components.block");
  let titleText = t("found");
  if (found) {
    titleText = t("found");
  } else if (noFilled) {
    titleText = t("noFilledTitle");
  } else if (title && title.trim().length > 0) {
    titleText = title;
  }
  return (
    <h1 className={cn("text-4xl mb-4", className)} {...props}>{titleText}</h1>
  );
};

export const PreviewContainer = ({ html, tags, excerpt, user, date, ...props }: HTMLAttributes<HTMLDivElement> & {
  html: string;
  tags?: {
    tag: { id: string; name: string } | null;
  }[];
  excerpt?: string | null;
  user?: {
    id: string;
    name: string;
    avatar: string | null;
  } | null;
  date?: Date | null;
}) => {
  return (
    <div {...props}>
      <Suspense fallback="loading">
        <article className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert mx-auto">
    
        {/* Author info and publish date */}
        {/* <div className="flex items-center gap-4 mb-8 not-prose">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{user.name}</div>
          <div className="text-sm text-muted-foreground">
            {format(new Date(date), 'PPP')}
          </div>
        </div>
      </div> */}

        {/* Featured image */}
        {/* {featuredImage && (
        <img
          src={featuredImage}
          alt={title || ''}
          className="w-full rounded-lg mb-8"
        />
      )} */}

        {/* Article excerpt */}
        {excerpt && (
          <div className="lead mb-8 text-muted-foreground">
            {excerpt}
          </div>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 not-prose">
            {tags.map((item) => (
              <Badge key={item.tag?.id} variant="secondary">
                {item.tag?.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Article content */}
        <div
          className="mt-8 leading-6"
          dangerouslySetInnerHTML={{ __html: html || '' }}
        />
        </article>
      </Suspense>
    </div>
  );
}