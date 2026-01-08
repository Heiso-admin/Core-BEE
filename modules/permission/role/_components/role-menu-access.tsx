"use client";

import { MenuTree } from "@heiso/core/components/primitives";
import { Button } from "@heiso/core/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@heiso/core/components/ui/form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@heiso/core/components/ui/sheet";
import type { TMenu } from "@heiso/core/lib/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { assignMenus } from "../_server/assign.service";
import type { Role } from "../_server/role.service";

const formSchema = z.object({
  selectedMenus: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

export function MenuAccess({
  children,
  data,
  menus,
}: {
  children: React.ReactNode;
  data?: Role;
  menus: TMenu[];
}) {
  const [_isSaving, startTransition] = useTransition();
  const t = useTranslations("role.menuAccess");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selectedMenus: data?.menus.map((e) => e.menus.id) ?? [],
    },
  });

  const onSubmit = async (values: FormValues) => {
    const roleId = data?.id;
    if (!roleId) return;

    startTransition(async () => {
      await assignMenus({
        roleId,
        menus: values.selectedMenus,
      });
      toast(t("success"));
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="min-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>
            {t("description", { name: data?.name || "" })}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-4 space-y-4"
          >
            <FormField
              control={form.control}
              name="selectedMenus"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <MenuTree
                      items={menus}
                      selectable={{
                        selectedItems: field.value,
                        onSelectionChange: (itemId, checked) => {
                          const newValue = checked
                            ? [...field.value, itemId]
                            : field.value.filter((id) => id !== itemId);
                          field.onChange(newValue);
                        },
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                {t("actions.cancel")}
              </Button>
              <Button type="submit">{t("actions.save")}</Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
