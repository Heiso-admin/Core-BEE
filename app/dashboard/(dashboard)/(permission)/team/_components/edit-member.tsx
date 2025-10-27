import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { ActionButton } from "@/components/primitives";
import { Button } from "@/components/ui/button";
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { type Member, updateMember } from "../_server/team.service";
import type { Role } from "./member-list";

export function EditMember({
  member,
  roles,
  children,
}: {
  member: Member;
  roles: Role[];
  children: React.ReactNode;
}) {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("dashboard.permission.team.edit");

  const updateMemberFormSchema = z.object({
    role: z.string(),
  });

  type UpdateMemberFormValues = z.infer<typeof updateMemberFormSchema>;

  const form = useForm<UpdateMemberFormValues>({
    resolver: zodResolver(updateMemberFormSchema),
    defaultValues: {
      ...(member.roleId && { role: member.roleId }),
      ...(member.isOwner && { role: "owner" }),
    },
  });

  const onSubmit = async (data: UpdateMemberFormValues) => {
    startTransition(async () => {
      await updateMember({
        id: member.id,
        data: {
          isOwner: data.role === "owner",
          ...(data.role !== "owner" && { roleId: data.role }),
        },
      });
      form.reset();
      toast(t("success.title"), {
        description: t("success.description"),
      });
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>
            {t("description", { email: member.user?.email || "" })}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="h-[calc(100%-120px)] flex flex-col mx-4 my-6"
          >
            <div className="flex-1 space-y-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.role")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("form.rolePlaceholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="owner">{t("form.owner")}</SelectItem>
                        {roles.map((e, i) => (
                          <SelectItem key={i} value={e.id}>
                            {e.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <SheetClose asChild>
                <Button
                  variant="outline"
                  onClick={() => {
                    form.reset();
                  }}
                >
                  {t("actions.cancel")}
                </Button>
              </SheetClose>
              <ActionButton loading={isPending} disabled={isPending}>
                {t("actions.save")}
              </ActionButton>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
