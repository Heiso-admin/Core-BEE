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
  
  const handleRemove = () => {
    startRemoveTransition(async () => {
      await leaveTeam(member.id);
      toast.success("Member removed");
    });
  };

  const handleApproveReview = (roleId: string) => {
    startReviewTransition(async () => {
      try {
        await updateMember({
          id: member.id,
          data: { status: MemberStatus.Joined, roleId },
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
          data: { status: MemberStatus.Disabled, roleId: null },
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

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* 編輯用戶權限 */}
          <DropdownMenuItem
            className="text-xs cursor-pointer"
            onClick={() => setOpenEditConfirm(true)}
          >
            <Edit2 className="h-4 w-4" />
            {t("edit.title")}
          </DropdownMenuItem>

          {/* 只有當前用戶是擁有者且目標用戶是啟用狀態時才顯示轉移選項 */}
          {isCurrentUserOwner && canTransferTo && (
            <DropdownMenuItem
              className="text-xs cursor-pointer"
              onClick={() => setOpenTransferConfirm(true)}
            >
              <Crown className="h-4 w-4" />
              {t("transfer.title")}
            </DropdownMenuItem>
          )}

          {/* 審查用戶狀態，僅擁有者可操作 */}
          {isCurrentUserOwner && member.status === MemberStatus.Review && (
            <DropdownMenuItem
              className="text-xs"
              onClick={() => setOpenReviewConfirm(true)}
            >
              <BadgeCheck className="h-4 w-4" />
              {t("review.action")}
            </DropdownMenuItem>
          )}

          {/* 重新計算邀請郵件，目前拔掉，請使用者再次申請 */}
          {/* {member.status === MemberStatus.Invited && (
            <DropdownMenuItem
              className="text-xs"
              onClick={() => setOpenResendConfirm(true)}
            >
              <Send className="h-4 w-4" />
              Resend invitation
            </DropdownMenuItem>
          )} */}

          {/* 踢出擁有者權限，但最後一個擁有者不能踢出 */}
          {/* {member.isOwner && member.status === MemberStatus.Joined && (
            <DropdownMenuItem
              className="text-xs"
              disabled={lastOwner}
              onClick={() => setOpenRemoveConfirm(true)}
            >
              <DoorOpen className="h-4 w-4" />
              Leave team
            </DropdownMenuItem>
          )} */}

          {/* 協助啟用的用戶重設密碼，僅擁有者可操作 */}
          {isCurrentUserOwner && member.status === MemberStatus.Joined && (
            <DropdownMenuItem
              className="text-xs"
              onClick={() => setOpenResetPassword(true)}
            >
              <RotateCcwKey className="h-4 w-4" />
              {t("resetPassword.action")}
            </DropdownMenuItem>
          )}

          {/* 刪除成員，僅未驗證者，已驗證者僅只能停用 */}
          {member.status === "invited" && (
            <DropdownMenuItem
              className="text-xs"
              onClick={() => setOpenRemoveConfirm(true)}
            >
              <Trash2 className="h-4 w-4" />
              {t("remove.action")}
            </DropdownMenuItem>
          )}
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
