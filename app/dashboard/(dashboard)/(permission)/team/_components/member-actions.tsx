import { DoorOpen, Send, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Member } from "../_server/team.service";
import { leaveTeam, resendInvite } from "../_server/team.service";
import { ConfirmRemoveMember } from "./confirm-remove-member";
import { ConfirmResendInvitation } from "./confirm-resend-invitation";

export function MemberActions({
  member,
  currentMembers,
  children,
}: {
  member: Member;
  currentMembers: Member[];
  children: React.ReactNode;
}) {
  const [isRemovePending, startRemoveTransition] = useTransition();
  const [isResendPending, startResendTransition] = useTransition();
  const [openResendConfirm, setOpenResendConfirm] = useState(false);
  const [openRemoveConfirm, setOpenRemoveConfirm] = useState(false);
  const ownerCount = currentMembers.filter(
    (m) => m.isOwner && m.status === "joined",
  ).length;

  const handleRemove = () => {
    startRemoveTransition(async () => {
      await leaveTeam(member.id);
      toast.success("Member removed");
    });
  };

  const handleResend = async () => {
    startResendTransition(async () => {
      await resendInvite(member.id);
      toast.success("Invitation resend");
    });
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {member.status === "invited" && (
            <DropdownMenuItem
              className="text-xs"
              onClick={() => setOpenResendConfirm(true)}
            >
              <Send className="h-4 w-4" />
              Resend invitation
            </DropdownMenuItem>
          )}

          {member.status === "declined" && (
            <DropdownMenuItem
              className="text-xs"
              onClick={() => setOpenRemoveConfirm(true)}
            >
              <Trash2 className="h-4 w-4" />
              Remove member
            </DropdownMenuItem>
          )}

          {member.isOwner && member.status === "joined" && (
            <DropdownMenuItem
              className="text-xs"
              disabled={ownerCount === 1}
              onClick={() => setOpenRemoveConfirm(true)}
            >
              <DoorOpen className="h-4 w-4" />
              Leave team
            </DropdownMenuItem>
          )}

          {!member.isOwner && (
            <DropdownMenuItem
              className="text-xs"
              onClick={() => setOpenRemoveConfirm(true)}
            >
              <Trash2 className="h-4 w-4" />
              Remove member
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmRemoveMember
        title="Confirm to remove member"
        // content={
        //   <>
        //     <AlertTriangle className="h-5 w-5 text-amber-500" />
        //     <div className="flex flex-col gap-2">
        //       <p className="font-medium">
        //         All user content from this member will be permanently removed.
        //       </p>
        //       <p className="text-sm text-muted-foreground">
        //         Removing a member will delete all of the user's saved content in
        //         all projects of this organization, which includes:
        //       </p>
        //       <ul className="list-inside list-disc text-sm text-muted-foreground">
        //         <li>
        //           SQL snippets (both <span className="underline">private</span>{' '}
        //           and <span className="underline">shared</span> snippets)
        //         </li>
        //         <li>Custom reports</li>
        //         <li>Log Explorer queries</li>
        //       </ul>
        //       <p className="text-sm text-muted-foreground">
        //         If you'd like to retain the member's shared SQL snippets, right
        //         click on them and "Duplicate query" in the SQL Editor before
        //         removing this member.
        //       </p>
        //     </div>
        //   </>
        // }
        open={openRemoveConfirm}
        onClose={() => setOpenRemoveConfirm(false)}
        data={{
          email: member.email,
        }}
        pending={isRemovePending}
        onConfirm={handleRemove}
      />

      <ConfirmResendInvitation
        title="Confirm to resend invitation"
        description={
          <>
            An invitation will be sent to{" "}
            <span className="font-medium">{member.email}</span>
          </>
        }
        open={openResendConfirm}
        onClose={() => setOpenResendConfirm(false)}
        pending={isResendPending}
        onConfirm={handleResend}
      />
    </div>
  );
}
