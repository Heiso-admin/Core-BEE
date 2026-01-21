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
  content?: React.ReactNode;
  open: boolean;
  data: {
    email: string;
  };
  pending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const ConfirmRemoveMember = ({
  content,
  open,
  data,
  pending = false,
  onClose,
  onConfirm,
}: Props) => {
  const t = useTranslations("dashboard.permission.message.remove");
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">{content}</div>
          <p className="text-sm text-muted-foreground">
            {t("content", { email: data.email })}
          </p>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <ActionButton
              variant="destructive"
              onClick={async () => {
                await onConfirm();
                onClose();
              }}
              loading={pending}
              disabled={pending}
            >
              {t("remove")}
            </ActionButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
