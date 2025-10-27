"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { removeJoinToken } from "../_server/member.service";

export function InvalidJoinToken() {
  return (
    <div className="h-screen flex flex-col gap-4 items-center justify-center">
      <p>Invite token is invalid</p>
      <Button
        onClick={async () => {
          await removeJoinToken();
        }}
        asChild
      >
        <Link href="/dashboard">Go to dashboard</Link>
      </Button>
    </div>
  );
}
