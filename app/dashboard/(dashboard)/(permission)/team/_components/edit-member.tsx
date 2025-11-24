"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { boolean, z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { updateMember } from "../_server/team.service";
import type { Member } from "../_server/team.service";
import { readableDateTime } from "@/lib/utils/format";
import { MemberStatus, MemberUser } from "./member-list";
import { cn } from '@/lib/utils';

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
  const t = useTranslations('dashboard.permission.message.edit');
  const [isLoading, setIsLoading] = useState(false);
  const isRole = roles.find((role) => role.id === member.roleId)?.id;

  const form = useForm<UpdateMemberFormValues>({
    resolver: zodResolver(updateMemberFormSchema),
    defaultValues: {
      roleId: isRole || undefined,
      isOwner: member.isOwner, // 這個只是用來一開始的狀態
      status: member.status || 'active', // 預設為啟用狀態
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
      toast.success(t('successfully'));
      onClose(false);
    } catch (error) {
      console.error('Failed to update member:', error);
      toast.error(t('failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const showDescription = () => {
    switch (true) {
      case member.status === MemberStatus.Invited:
        return t('invitedDescription');
      case lastOwner:
        return t('lastOwnerDescription');
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
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
              'space-y-4',
              lastOwner && 'pointer-events-none opacity-60'
            )}
          >
            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('role')}</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        {form.watch('isOwner') ? (
                          <span>{MemberStatus.Owner}</span>
                        ) : (
                          <SelectValue placeholder={t('selectRole')} />
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
                  <FormLabel>{t('status')}</FormLabel>
                  <div className="space-y-0.5 rounded-lg border py-3 px-4 w-full flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {field.value === MemberStatus.Joined
                        ? t('statuses.activate')
                        : t('statuses.deactivate')}
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value === MemberStatus.Joined}
                        onCheckedChange={(checked) => {
                          field.onChange(
                            checked
                              ? MemberStatus.Joined
                              : MemberStatus.Disabled
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
                  {' '}
                  {t('lastLogin')}{' '}
                </p>
                <p className="text-sm text-muted-foreground pt-1">
                  {member.updatedAt ? readableDateTime(member.updatedAt) : '-'}
                </p>
              </div>
            )}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onClose(false)}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t('saving') : t('save')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
