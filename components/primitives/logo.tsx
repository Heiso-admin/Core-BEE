"use client";

import { useSite } from "@heiso/core/providers/site";
import Image from "next/image";
import Link from "next/link";
// import config from '@heiso/core/config';

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
    <Link
      href={href}
      className={classNames.main}
      title={title ?? site?.basic?.title ?? ""}
    >
      <Image
        src={site?.assets?.logo?.length ? site.assets.logo : "/images/logo.png"}
        alt={site?.basic?.title ?? site?.basic?.title ?? ""}
        width={1000}
        height={1000}
        priority
        className={classNames.img ?? "h-8 w-auto text-primary"}
      />
      {hasTitle && (
        <div className={classNames.text ?? "text-lg font-bold"}>
          {title ?? site?.basic?.title}
        </div>
      )}
    </Link>
  );
}
