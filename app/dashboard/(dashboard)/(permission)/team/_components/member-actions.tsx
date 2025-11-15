import { Trash2, Edit2, Crown, RotateCcwKey, BadgeCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Member } from "../_server/team.service";
import { leaveTeam, resendInvite, transferOwnership, resetMemberPassword, updateMember } from "../_server/team.service";
import { ConfirmRemoveMember } from "./confirm-remove-member";
import { ConfirmResendInvitation } from "./confirm-resend-invitation";
import { ConfirmTransferOwner } from "./confirm-transfer-owner";
import { ConfirmResetPassword } from "./confirm-reset-password";
import { ConfirmReviewMember } from "./confirm-review-member";
import { useTranslations } from "next-intl";
import { EditMember } from "./edit-member";
import { MemberStatus, type Role } from "./member-list";

export function MemberActions({
  member,
  currentMembers,
  roles,
  children,
}: {
  member: Member;
  currentMembers: Member[];
  roles: Role[];
  children: React.ReactNode;
}) {
  const t = useTranslations("dashboard.permission.message");
  const { data: session } = useSession();
  const [isRemovePending, startRemoveTransition] = useTransition();
  const [isResendPending, startResendTransition] = useTransition();
  const [isTransferPending, startTransferTransition] = useTransition();
  const [isResetPasswordPending, startResetPasswordTransition] = useTransition();
  const [isReviewPending, startReviewTransition] = useTransition();
  const [openEditConfirm, setOpenEditConfirm] = useState<boolean>(false);
  const [openResendConfirm, setOpenResendConfirm] = useState<boolean>(false);
  const [openRemoveConfirm, setOpenRemoveConfirm] = useState<boolean>(false);
  const [openTransferConfirm, setOpenTransferConfirm] = useState<boolean>(false);
  const [openResetPassword, setOpenResetPassword] = useState<boolean>(false);
  const [openReviewConfirm, setOpenReviewConfirm] = useState<boolean>(false);

  const lastOwner = (currentMembers.filter(
    (m) => m.isOwner && m.status === MemberStatus.Joined,
  ).length) === 1;

  // 檢查當前用戶是否為擁有者
  const currentUserMember = currentMembers.find(m => m.user?.id === session?.user?.id);
  const isCurrentUserOwner = currentUserMember?.isOwner;
  const canTransferTo = member.status === MemberStatus.Joined && member.user?.id !== session?.user?.id;
  const isUserNotReview = member.status !== MemberStatus.Review;

  const actionItems = [
    {
      // 編輯權限
      key: "edit" as const,
      label: t("edit.title"),
      Icon: Edit2,
      visible: isUserNotReview,
      onClick: () => setOpenEditConfirm(true),
    },
    {
      // 只有當前用戶是擁有者且目標用戶是啟用狀態時才顯示轉移選項 
      key: "transfer" as const,
      label: t("transfer.title"),
      Icon: Crown,
      visible: isCurrentUserOwner && canTransferTo && isUserNotReview,
      onClick: () => setOpenTransferConfirm(true),
    },
    {
      // 審查用戶狀態，僅擁有者可操作
      key: "review" as const,
      label: t("review.action"),
      Icon: BadgeCheck,
      visible: isCurrentUserOwner && member.status === MemberStatus.Review,
      onClick: () => setOpenReviewConfirm(true),
    },
    {
      // 協助啟用的用戶重設密碼，僅擁有者可操作
      key: "resetPassword" as const,
      label: t("resetPassword.action"),
      Icon: RotateCcwKey,
      visible: isCurrentUserOwner && member.status === MemberStatus.Joined && isUserNotReview,
      onClick: () => setOpenResetPassword(true),
    },
    {
      // 刪除成員，僅擁有者可操作
      key: "remove" as const,
      label: t("remove.action"),
      Icon: Trash2,
      visible: isCurrentUserOwner,
      onClick: () => setOpenRemoveConfirm(true),
    },
    // {
    //   // 重新計算邀請郵件，目前拔掉，請使用者再次申請
    //   key: "resend" as const,
    //   label: "Resend invitation",
    //   Icon: Send,
    //   visible: member.status === MemberStatus.Invited,
    //   onClick: () => setOpenResendConfirm(true),
    // },
    // {
    //   // 踢出擁有者權限，但最後一個擁有者不能踢出
    //   key: "leaveTeam" as const,
    //   label: "Leave team",
    //   Icon: DoorOpen,
    //   visible: member.isOwner && member.status === MemberStatus.Joined,
    //   onClick: () => setOpenRemoveConfirm(true),
    // },
  ];

  const handleRemove = () => {
    startRemoveTransition(async () => {
      await leaveTeam(member.id);
      toast.success(t("remove.success"));
    });
  };

  const handleApproveReview = (roleId: string | null, isOwner: boolean) => {
    startReviewTransition(async () => {
      try {
        await updateMember({
          id: member.id,
          data: { isOwner: isOwner, roleId: roleId, status: MemberStatus.Joined, },
        });
        toast.success(t("review.success"));
        setOpenReviewConfirm(false);
      } catch (error) {
        toast.error(t("review.failed"));
        console.error("Approve review error:", error);
      }
    });
  };

  const handleRejectReview = () => {
    startReviewTransition(async () => {
      try {
        await updateMember({
          id: member.id,
          data: { status: MemberStatus.Disabled },
        });
        toast.success(t("review.success"));
        setOpenReviewConfirm(false);
      } catch (error) {
        toast.error(t("review.failed"));
        console.error("Reject review error:", error);
      }
    });
  };

  const handleResend = async () => {
    startResendTransition(async () => {
      await resendInvite(member.id);
      toast.success("Invitation resend");
    });
  };

  const handleTransfer = () => {
    if (!currentUserMember) return;

    startTransferTransition(async () => {
      try {
        await transferOwnership({
          newOwnerId: member.id,
          currentOwnerId: currentUserMember.id,
        });
        toast.success(t("transfer.successfully"));
        setOpenTransferConfirm(false);

        setTimeout(() => {
          signOut({
            callbackUrl: "/login", // 轉移完成後登出當前用戶
            redirect: true,
          });
        }, 1500);
      } catch (error) {
        toast.error(t("transfer.failed"));
        console.error("Transfer ownership error:", error);
      }
    });
  };

  const handleResetPassword = (newPassword: string) => {
    return new Promise<void>((resolve, reject) => {
      startResetPasswordTransition(async () => {
        try {
          const result = await resetMemberPassword({
            actorMemberId: currentUserMember?.id || "",
            targetMemberId: member.id,
            newPassword,
          });
          if (result?.success) {
            toast.success(t("resetPassword.message.successfully"));
            resolve();
            return;
          }
          const code = result?.error ?? "RESET_FAILED";
          throw new Error(code);
        } catch (error) {
          const code = (error as Error)?.message ?? "RESET_FAILED";
          toast.error(`${t("resetPassword.message.failed")} (${code})`);
          console.error("Reset password error:", error);
          reject(error);
        }
      });
    });
  };
  const visibleActionItems = actionItems.filter((a) => a.visible);

  if (visibleActionItems.length === 0) return null;

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {visibleActionItems
            .map(({ key, label, Icon, onClick }) => (
              <DropdownMenuItem
                key={key}
                className="text-xs cursor-pointer"
                onClick={onClick}
              >
                <Icon className="h-4 w-4" />
                {label}
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>


      <ConfirmRemoveMember
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
            An invitation will be sent to
            <span className="font-medium">{member.email}</span>
          </>
        }
        open={openResendConfirm}
        onClose={() => setOpenResendConfirm(false)}
        pending={isResendPending}
        onConfirm={handleResend}
      />

      <EditMember
        member={member}
        roles={roles}
        open={openEditConfirm}
        onClose={setOpenEditConfirm}
        lastOwner={lastOwner && member.isOwner && member.status !== MemberStatus.Disabled}
      />

      <ConfirmTransferOwner
        open={openTransferConfirm}
        onClose={() => setOpenTransferConfirm(false)}
        data={{
          email: member.email,
          name: member.user?.name,
        }}
        pending={isTransferPending}
        onConfirm={handleTransfer}
      />

      <ConfirmResetPassword
        open={openResetPassword}
        member={member}
        sessionUserId={session?.user?.id}
        pending={isResetPasswordPending}
        onClose={() => setOpenResetPassword(false)}
        onConfirm={handleResetPassword}
      />

      <ConfirmReviewMember
        open={openReviewConfirm}
        member={member}
        roles={roles}
        pending={isReviewPending}
        onClose={() => setOpenReviewConfirm(false)}
        onApprove={handleApproveReview}
        onReject={handleRejectReview}
      />
    </div>
  );
}
