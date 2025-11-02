"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MemberUser } from "./member-list";
import { generateRandomPassword } from "@/lib/utils/format";
import type { Member } from "../_server/team.service";
import { useTranslations } from "next-intl";
import { Copy } from "lucide-react";
import { toast } from "sonner";

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
    } catch (error) {
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
              <DialogDescription style={{ whiteSpace: 'pre-line' }}>
                {t("confirm.description", {
                  userName: member.user?.name || member.email.split("@")[0],
                })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={pending}>
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
              <MemberUser member={member} isYou={member.user?.id === sessionUserId} />
              <div className="text-sm">{t("result.content")}</div>
              <div className="rounded-md border bg-muted px-4 py-3 text-xl font-medium select-all text-center relative">
                {generatedPassword}
                <Copy className="size-5 absolute bottom-3 right-2 opacity-40 cursor-pointer" onClick={copyPassword}/>
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