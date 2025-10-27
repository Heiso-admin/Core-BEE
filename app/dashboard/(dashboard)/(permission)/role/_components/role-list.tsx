"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { TMenu } from "@/lib/db/schema";
import type { Role } from "../_server/role.service";
import { createRole, deleteRole, updateRole } from "../_server/role.service";
import { MenuAccess } from "./role-menu-access";
import { PermissionAccess } from "./role-permission-access";

export function RoleList({
  data,
  menus,
  permissions,
}: {
  data: Role[];
  menus: TMenu[];
  permissions: any;
}) {
  const t = useTranslations("dashboard.permission.role.list");
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Role | null>(null);

  return (
    <div className="space-y-3">
      <CreateOrUpdateRole
        open={open}
        onClose={() => {
          setOpen(false);
          setSelectedItem(null);
        }}
        data={selectedItem}
      />

      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>{t("add_new")}</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("table.role_name")}</TableHead>
            <TableHead>{t("table.description")}</TableHead>
            <TableHead className="text-right">{t("table.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((role) => (
            <TableRow key={role.id}>
              <TableCell>
                {role.name}{" "}
                {role.fullAccess && (
                  <Badge className="ml-1" variant="outline">
                    {t("full_access")}
                  </Badge>
                )}
              </TableCell>
              <TableCell>{role.description}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedItem(role);
                    setOpen(true);
                  }}
                >
                  {t("actions.edit")}
                </Button>
                {!role.fullAccess && (
                  <>
                    <MenuAccess data={role} menus={menus}>
                      <Button size="sm" variant="secondary">
                        {t("actions.menu_access")}
                      </Button>
                    </MenuAccess>
                    <PermissionAccess data={role} permissions={permissions}>
                      <Button size="sm" variant="secondary">
                        {t("actions.permission")}
                      </Button>
                    </PermissionAccess>
                  </>
                )}
                <DeleteConfirm id={role.id}>
                  <Button size="sm" variant="destructive">
                    {t("actions.delete")}
                  </Button>
                </DeleteConfirm>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CreateOrUpdateRole({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: Role | null;
}) {
  const t = useTranslations("dashboard.permission.role.form");
  const [isPending, startTransition] = useTransition();

  const formSchema = z.object({
    name: z.string().min(1, { message: t("validation.name_required") }),
    description: z.string().optional(),
    fullAccess: z.boolean().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullAccess: false,
    },
  });

  useEffect(() => {
    if (data) {
      form.setValue("name", data.name);
      form.setValue("description", data.description ?? "");
      form.setValue("fullAccess", data.fullAccess ?? false);
    }
  }, [data, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Handle form submission
    startTransition(async () => {
      if (data) {
        await updateRole(data.id, values);
      } else {
        await createRole({
          ...values,
        });
      }
      form.reset();
      onClose();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {data ? t("update_title") : t("create_title")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              defaultValue=""
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("name")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              defaultValue=""
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("description")}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t("description")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullAccess"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>{t("full_access")}</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <ActionButton
                type="submit"
                loading={isPending}
                disabled={isPending}
              >
                {t("save")}
              </ActionButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteConfirm({
  children,
  id,
}: {
  children: React.ReactNode;
  id: string;
}) {
  const t = useTranslations("dashboard.permission.role");
  const [isDeletePending, startDeleteTransition] = useTransition();

  const handleDelete = async () => {
    startDeleteTransition(async () => {
      await deleteRole({ id });
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("delete_title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("delete_description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction asChild>
            <ActionButton
              onClick={handleDelete}
              loading={isDeletePending}
              disabled={isDeletePending}
            >
              {t("delete")}
            </ActionButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
