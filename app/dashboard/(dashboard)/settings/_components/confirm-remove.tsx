"use client";

import { useTranslations } from "next-intl";
import { ActionButton } from "@/components/primitives";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  title: string;
  content?: React.ReactNode;
  open: boolean;
  pending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const ConfirmRemove = ({
  title,
  content,
  open,
  pending = false,
  onClose,
  onConfirm,
}: Props) => {
  const t = useTranslations("tracking");
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">{content}</div>

          <div className="flex justify-end gap-4">
            <Button onClick={onClose}>
              {t("confirm_remove.actions.cancel")}
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
              {t("confirm_remove.actions.remove")}
            </ActionButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
