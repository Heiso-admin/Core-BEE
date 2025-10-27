"use client";

import { ChevronRight, User, UserCog } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";

export default function RoleSelect() {
  const t = useTranslations("auth.roleSelect");

  return (
    <div className="flex w-full max-w-lg flex-col gap-4">
      <h3 className="text-center text-muted-foreground">{t('title')}</h3>

      <Link href="/dashboard" className="block">
        <Card className="group flex flex-row cursor-pointer items-center justify-between p-6 transition-colors hover:bg-muted/50">
          <div className="flex items-center gap-4">
            <div className="rounded-full p-2">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-semibold">{t('dashboard.title')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.description')}
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Card>
      </Link>

      <Link href="/dev-center" className="block">
        <Card className="group flex flex-row cursor-pointer items-center justify-between p-6 transition-colors hover:bg-muted/50">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-purple-100 p-2">
              <UserCog className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h2 className="font-semibold">{t('admin.title')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('admin.description')}
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Card>
      </Link>
    </div>
  );
}
