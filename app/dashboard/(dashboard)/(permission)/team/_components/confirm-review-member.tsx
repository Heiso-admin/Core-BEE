"use client";

import { Button } from "@heiso/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@heiso/core/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@heiso/core/components/ui/select";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Member } from "../_server/team.service";
import type { Role } from "./member-list";
import { MemberStatus, MemberUser } from "./member-list";

type Props = {
  open: boolean;
  member: Member;
  roles: Role[];
  pending?: boolean;
  onClose: () => void;
  onApprove: (roleId: string | null, isOwner: boolean) => void;
  onReject: () => void;
};

export const ConfirmReviewMember = ({
  open,
  member,
  roles,
  pending = false,
  onClose,
  onApprove,
  onReject,
}: Props) => {
  const t = useTranslations("dashboard.permission.message.review");
  const labelT = useTranslations("dashboard.permission.team.invite");
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    member.isOwner ? MemberStatus.Owner : member.role?.id || "",
  );

  const handleApprove = () => {
    if (!selectedRoleId) return;
    const isOwner = selectedRoleId === MemberStatus.Owner;
    const roleId =
      selectedRoleId === MemberStatus.Owner
        ? null
        : roles.find((r) => r.id === selectedRoleId)?.id || null;
    onApprove(roleId, isOwner);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md!">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription style={{ whiteSpace: "pre-line" }}>
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <MemberUser member={member} isYou={false} />

          <div className="space-y-2">
            <div className="text-sm font-medium">{labelT("form.role")}</div>
            <Select
              value={selectedRoleId}
              onValueChange={setSelectedRoleId}
              disabled={pending}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={labelT("form.rolePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onReject} disabled={pending}>
            {t("reject")}
          </Button>
          <Button onClick={handleApprove} disabled={pending || !selectedRoleId}>
            {t("approve")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
