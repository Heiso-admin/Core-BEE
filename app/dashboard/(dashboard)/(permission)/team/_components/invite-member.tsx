"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ActionButton } from "@/components/primitives";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { invite } from "../_server/team.service";
import type { Role } from "./member-list";
import { toast } from "sonner";

export function InviteMember({
  userName,
  roles,
  children,
}: {
  userName: string;
  roles: Role[];
  children: React.ReactNode;
}) {
  const t = useTranslations("dashboard.permission.team.invite");
  const [isInviting, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const inviteFormSchema = z.object({
    email: z
      .string()
      .min(1, t("form.validation.emailInvalid")),
    role: z
      .string()
      .min(1, t("form.validation.roleInvalid")),
    entry: z.string().optional(),
  });

  type InviteFormValues = z.infer<typeof inviteFormSchema>;

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      role: "",
      entry: "",
    },
  });

  const onSubmit = async (data: InviteFormValues) => {
    form.clearErrors('root.serverError');

    startTransition(async () => {
      try {
        await invite({
          email: data.email,
          role: data.role,
        });
        toast.success(t("form.success", { email: data.email }));
        form.reset();
        setOpen(false);
      } catch (error) {
        let errorMessage: string = "";
        
        const isEmailRepeatError = 
            error instanceof Error && 
            error.message.includes("EMAIL_REPEAT"); 

        if (isEmailRepeatError) {
            errorMessage = t("form.validation.emailRepeat");
        } else {
            console.error(error);
            errorMessage = t("form.error");
        }
        
        form.setError('email', {
          type: 'server', 
          message: errorMessage,
        });
      }
    });
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t("form.email")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("form.emailPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t("form.role")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("form.rolePlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <ActionButton
                type="submit"
                loading={isInviting}
                disabled={isInviting}
              >
                {isInviting ? t("actions.sending") : t("actions.send")}
              </ActionButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
