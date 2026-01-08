"use client";

import { Button } from "@heiso/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@heiso/core/components/ui/dialog";
import { generateRandomPassword } from "@heiso/core/lib/utils/format";
import { Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import type { Member } from "../_server/team.service";
import { MemberUser } from "./member-list";

type Props = {
  open: boolean;
  member: Member;
  sessionUserId?: string;
  pending: boolean;
  onClose: () => void;
  onConfirm: (newPassword: string) => Promise<void>;
};

export const ConfirmResetPassword = ({
  open,
  member,
  sessionUserId,
  pending = false,
  onClose,
  onConfirm,
}: Props) => {
  const t = useTranslations("dashboard.permission.message.resetPassword");
  const [step, setStep] = useState<"confirm" | "result">("confirm");
  const [generatedPassword, setGeneratedPassword] = useState<string>("");

  const handleReset = () => {
    setStep("confirm");
    setGeneratedPassword("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleConfirm = async () => {
    const newPassword = generateRandomPassword(8);
    try {
      await onConfirm(newPassword);
      setGeneratedPassword(newPassword);
      setStep("result");
    } catch (_error) {
      setGeneratedPassword("");
    }
  };

  const copyPassword = () => {
    toast(t("result.copy"));
    navigator.clipboard.writeText(generatedPassword);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm!">
        {step === "confirm" ? (
          <>
            <DialogHeader>
              <DialogTitle>{t("confirm.title")}</DialogTitle>
              <DialogDescription style={{ whiteSpace: "pre-line" }}>
                {t("confirm.description", {
                  userName: member.user?.name || member.email.split("@")[0],
                })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={pending}
              >
                {t("confirm.cancel")}
              </Button>
              <Button onClick={handleConfirm} disabled={pending}>
                {t("confirm.generate")}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t("result.title")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <MemberUser
                member={member}
                isYou={member.user?.id === sessionUserId}
              />
              <div className="text-sm">{t("result.content")}</div>
              <div className="rounded-md border bg-muted px-4 py-3 text-xl font-medium select-all text-center relative">
                {generatedPassword}
                <Copy
                  className="size-5 absolute bottom-3 right-2 opacity-40 cursor-pointer"
                  onClick={copyPassword}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {t("result.remark")}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>{t("result.close")}</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
