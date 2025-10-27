"use client";

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
  data: {
    email: string;
  };
  pending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const ConfirmRemoveMember = ({
  title,
  content,
  open,
  data,
  pending = false,
  onClose,
  onConfirm,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">{content}</div>

          <p className="border-b text-sm text-muted-foreground">
            Are you sure you want to remove{" "}
            <span className="font-medium">{data.email}</span> ?
          </p>

          <div className="flex justify-end gap-4">
            <Button onClick={onClose}>Cancel</Button>
            <ActionButton
              variant="destructive"
              onClick={async () => {
                await onConfirm();
                onClose();
              }}
              loading={pending}
              disabled={pending}
            >
              Remove
            </ActionButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
