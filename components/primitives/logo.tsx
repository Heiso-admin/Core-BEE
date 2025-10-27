"use client";

import Link from "next/link";
import { useSite } from "@/providers/site";
// import config from '@/config';

export function Logo({
  href = "/",
  hasTitle = true,
  title,
  classNames,
}: {
  href?: string;
  hasTitle?: boolean;
  title?: string;
  badge?: string;
  classNames: {
    main?: string;
    img?: string;
    badge?: string;
    text?: string;
  };
}) {
  const { site } = useSite();

  return (
    <>
      <Link
        href={href}
        className={classNames.main}
        title={title ?? site?.basic?.title ?? ""}
      >
        <img
          src={
            site?.assets?.logo?.length ? site?.assets?.logo : "/images/logo.png"
          }
          className={classNames.img ?? "h-8 w-8 text-primary"}
          alt={site?.basic?.title ?? site?.basic?.title ?? ""}
        />
        {hasTitle && (
          <>
            <div className={classNames.text ?? "text-lg font-bold"}>
              {title ?? site?.basic?.title}
            </div>
          </>
        )}
      </Link>
    </>
  );
}
