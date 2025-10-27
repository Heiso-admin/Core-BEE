import { ActionButton } from "@/components/primitives";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Props = {
  title: string;
  description?: React.ReactNode;
  open: boolean;
  pending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmResendInvitation({
  title,
  description,
  open,
  pending = false,
  onClose,
  onConfirm,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <ActionButton
              onClick={onConfirm}
              loading={pending}
              disabled={pending}
            >
              Continue
            </ActionButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
