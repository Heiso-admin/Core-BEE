"use client";

import { Globe } from "lucide-react";
import Link from "next/link";

export function Notification() {
  return (
    <div className="flex h-8 items-center justify-center gap-2 bg-emerald-100 text-emerald-700 dark:bg-green-950 dark:text-primary text-sm">
      <Globe className="h-4 w-4" />
      <span>We are investigating technical issues</span>
      <Link
        href="https://status.supabase.com"
        className="underline"
        target="_blank"
      >
        View Status Updates
      </Link>
    </div>
  );
}
