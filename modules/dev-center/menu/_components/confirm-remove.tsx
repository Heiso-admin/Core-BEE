"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@heiso/core/components/ui/alert-dialog";
import { useTranslations } from "next-intl";

export function ConfirmRemove({
  title,
  content,
  open = false,
  onClose,
  onConfirm,
  pending = false,
}: {
  title: string;
  content: string;
  open?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  pending?: boolean;
}) {
  const t = useTranslations("devCenter.menu");

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{content}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("actions.remove.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm?.();
            }}
            disabled={pending}
          >
            {pending
              ? t("actions.remove.removing")
              : t("actions.remove.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
