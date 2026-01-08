"use client";

// import { Header } from '../_components';
import { Button } from "@heiso/core/components/ui/button";
import { useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function Pending() {
  const t = useTranslations("auth.join");
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";
  const _searchParams = useSearchParams();
  // const error = searchParams?.get('error');

  return (
    <>
      <div className="space-y-2">
        <p className="whitespace-pre-line text-center">
          {t("notAllowed", { email })}
        </p>
      </div>
      <Button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="block mt-6 mx-auto"
      >
        {t("action.reLogin")}
      </Button>
    </>
  );
}
