"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { ActionButton, PermissionCard } from "@/components/primitives";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { TPermission } from "@/lib/db/schema";
import { assignPermissions } from "../_server/assign.service";
import type { Role } from "../_server/role.service";

export function PermissionAccess({
  children,
  data,
  permissions,
}: {
  children: React.ReactNode;
  data: Role;
  permissions: TPermission[];
}) {
  const [checkedPermissionIds, setCheckedPermissionIds] = useState<
    Record<string, string[]>
  >({});

  const [isSaving, startTransition] = useTransition();
  const formSchema = z.object({
    permissions: z.array(z.string()),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      permissions: data.permissions.map((e) => e.permission.id),
    },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      await assignPermissions({
        roleId: data.id,
        permissions: values.permissions,
      });

      toast("permission access updated");
    });
  }

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="min-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Manage permission access </SheetTitle>
          <SheetDescription>
            Update role and permissions for {data?.name}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-4 space-y-4"
          >
            <FormField
              control={form.control}
              name="permissions"
              render={({ field }) => (
                <FormItem>
                  <div className="space-y-2">
                    {permissions.map((permission: any, i: number) => (
                      <PermissionCard
                        permissionGroup={permission}
                        key={permission.id}
                        selectable={{
                          value: field.value ?? [],
                          onCheckedChange: (value: string[]) => {
                            const newPermissionIds = {
                              ...checkedPermissionIds,
                              [permission.id]: value,
                            };
                            setCheckedPermissionIds(newPermissionIds);
                            const values =
                              Object.values(newPermissionIds).flat();
                            field.onChange(values);
                          },
                        }}
                      />
                    ))}
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Cancel
              </Button>
              <ActionButton type="submit" disabled={isSaving}>
                Save
              </ActionButton>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
