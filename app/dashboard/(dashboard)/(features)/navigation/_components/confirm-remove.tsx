"use client";

import { cn } from "@udecode/cn";
import { useTranslations } from "next-intl";
import { ActionButton } from "@/components/primitives";
import { Button, buttonVariants } from "@/components/ui/button";
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
  onCancel?: () => void;
  onConfirm: () => void;
};

export const ConfirmRemove = ({
  title,
  content,
  open,
  pending = false,
  onClose,
  onCancel = onClose,
  onConfirm,
}: Props) => {
  const t = useTranslations("dashboard.navigation.confirm-remove");

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">{content}</div>

          <div className="flex justify-end gap-4">
            <Button
              className={cn(
                buttonVariants({ variant: "outline", size: "w_md" }),
              )}
              onClick={onCancel}
            >
              {t("cancelButton")}
            </Button>
            <ActionButton
              className={cn(buttonVariants({ variant: "error", size: "w_md" }))}
              variant="destructive"
              onClick={async () => {
                await onConfirm();
                onCancel();
                onClose();
              }}
              loading={pending}
              disabled={pending}
            >
              {t("removeButton")}
            </ActionButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
