"use client";

import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useTransition } from "react";
import { ActionButton } from "@/components/primitives";
import { decline, join, removeJoinToken } from "../_server/member.service";

export function JoinOrDecline({ id }: { id: string }) {
  const { data: session } = useSession();
  const [isJoining, startJoiningTransition] = useTransition();
  const [isDeclining, startDecliningTransition] = useTransition();

  useEffect(() => {
    // Remove join-token cookie when component mounts
    console.log("remove cookie");
    removeJoinToken().then();
  }, []);

  const handleJoin = async () => {
    startJoiningTransition(async () => {
      const userId = session?.user?.id;
      if (!userId) {
        throw new Error("User not found");
      }
      await join(id, userId);
      redirect(`/dashboard`);
    });
  };

  const handleDecline = async () => {
    startDecliningTransition(async () => {
      await decline(id);
      redirect(`/dashboard`);
    });
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <ActionButton
        variant="outline"
        className="w-24"
        loading={isDeclining}
        onClick={handleDecline}
      >
        Decline
      </ActionButton>
      <ActionButton className="w-40" loading={isJoining} onClick={handleJoin}>
        Join organization
      </ActionButton>
    </div>
  );
}
