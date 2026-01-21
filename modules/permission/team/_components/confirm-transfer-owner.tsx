"use client";

import { ActionButton } from "@heiso/core/components/primitives";
import { Button } from "@heiso/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@heiso/core/components/ui/dialog";
import { useTranslations } from "next-intl";

type Props = {
  open: boolean;
  data: {
    email: string;
    name?: string;
  };
  pending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const ConfirmTransferOwner = ({
  open,
  data,
  pending = false,
  onClose,
  onConfirm,
}: Props) => {
  const t = useTranslations("dashboard.permission.message.transfer");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <p
            className="text-sm text-muted-foreground"
            style={{ whiteSpace: "pre-line" }}
          >
            {t("content", {
              email: data.email,
              name: data.name || data.email.split("@")[0],
            })}
          </p>
          <p className="text-sm text-red-800 font-medium">
            {t("logoutWarning")}
          </p>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <ActionButton
              variant="default"
              onClick={async () => {
                await onConfirm();
              }}
              loading={pending}
            >
              {t("confirm")}
            </ActionButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
