"use client";

import { Button } from "@heiso/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@heiso/core/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@heiso/core/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@heiso/core/components/ui/select";
import { Separator } from "@heiso/core/components/ui/separator";
import { Switch } from "@heiso/core/components/ui/switch";
import { cn } from "@heiso/core/lib/utils";
import { readableDateTime } from "@heiso/core/lib/utils/format";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { Member } from "../_server/team.service";
import { updateMember } from "../_server/team.service";
import { MemberStatus, MemberUser } from "./member-list";

const updateMemberFormSchema = z.object({
  roleId: z.string(),
  isOwner: z.boolean(),
  status: z.string(),
});

type UpdateMemberFormValues = z.infer<typeof updateMemberFormSchema>;

interface EditMemberProps {
  open: boolean;
  onClose: (open: boolean) => void;
  member: Member;
  roles: { id: string; name: string }[];
  lastOwner: boolean;
}

export function EditMember({
  open,
  onClose,
  member,
  roles,
  lastOwner,
}: EditMemberProps) {
  const t = useTranslations("dashboard.permission.message.edit");
  const [isLoading, setIsLoading] = useState(false);
  const isRole = roles.find((role) => role.id === member.roleId)?.id;

  const form = useForm<UpdateMemberFormValues>({
    resolver: zodResolver(updateMemberFormSchema),
    defaultValues: {
      roleId: isRole || undefined,
      isOwner: member.isOwner, // 這個只是用來一開始的狀態
      status: member.status || "active", // 預設為啟用狀態
    },
  });

  const onSubmit = async (values: UpdateMemberFormValues) => {
    setIsLoading(true);
    const isOwner = values.roleId === MemberStatus.Owner;

    try {
      await updateMember({
        id: member.id,
        data: {
          roleId: isOwner ? null : values.roleId,
          isOwner: isOwner,
          status: values.status,
        },
      });
      toast.success(t("successfully"));
      onClose(false);
    } catch (error) {
      console.error("Failed to update member:", error);
      toast.error(t("failed"));
    } finally {
      setIsLoading(false);
    }
  };

  const showDescription = () => {
    switch (true) {
      case member.status === MemberStatus.Invited:
        return t("invitedDescription");
      case lastOwner:
        return t("lastOwnerDescription");
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{showDescription()}</DialogDescription>
        </DialogHeader>

        {/* Member Information Section */}
        <MemberUser member={member} isYou={false} />
        <Separator />

        {/* Role Edit Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={cn(
              "space-y-4",
              lastOwner && "pointer-events-none opacity-60",
            )}
          >
            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("role")}</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        {form.watch("isOwner") ? (
                          <span>{MemberStatus.Owner}</span>
                        ) : (
                          <SelectValue placeholder={t("selectRole")} />
                        )}
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="w-full">
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start justify-between ">
                  <FormLabel>{t("status")}</FormLabel>
                  <div className="space-y-0.5 rounded-lg border py-3 px-4 w-full flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {field.value === MemberStatus.Joined
                        ? t("statuses.activate")
                        : t("statuses.deactivate")}
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value === MemberStatus.Joined}
                        onCheckedChange={(checked) => {
                          field.onChange(
                            checked
                              ? MemberStatus.Joined
                              : MemberStatus.Disabled,
                          );
                        }}
                        disabled={member.status === MemberStatus.Invited}
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
            {member.status !== MemberStatus.Invited && (
              <div>
                <p className="text-sm text-foreground font-medium">
                  {" "}
                  {t("lastLogin")}{" "}
                </p>
                <p className="text-sm text-muted-foreground pt-1">
                  {member.updatedAt ? readableDateTime(member.updatedAt) : "-"}
                </p>
              </div>
            )}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onClose(false)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t("saving") : t("save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
