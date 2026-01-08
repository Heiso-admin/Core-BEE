"use client";

import { ActionButton } from "@heiso/core/components/primitives";
import { Badge } from "@heiso/core/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@heiso/core/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@heiso/core/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@heiso/core/components/ui/form";
import { Input } from "@heiso/core/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@heiso/core/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type ColumnDef,
  type FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import type { Developer } from "../_server/developer.service";
import { addDeveloper, removeDeveloper } from "../_server/developer.service";

const fuzzyFilter: FilterFn<Developer> = (row, _columnId, filterValue) => {
  const searchValue = filterValue.toLowerCase();
  const user = row.original.user;

  return (
    user.name?.toLowerCase().includes(searchValue) ||
    user.email?.toLowerCase().includes(searchValue)
  );
};

export function DeveloperList({ data }: { data: Developer[] }) {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [isRemovePending, startRemoveTransition] = useTransition();
  const [filtering, setFiltering] = useState("");
  const [open, setOpen] = useState(false);
  const t = useTranslations("devCenter.developers");

  const columns: ColumnDef<Developer>[] = [
    {
      header: t("columns.name"),
      cell: ({ row }) => {
        const { id, name } = row.original.user;
        const isYou = session?.user?.id === id;
        return (
          <div className="flex items-center justify-between gap-3 min-h-[35px]">
            <div className="flex gap-2">
              <span>{name}</span>
              {isYou && (
                <Badge variant={"outline"} className="text-xs">
                  {t("columns.youBadge")}
                </Badge>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: t("columns.email"),
      cell: ({ row }) => {
        const { email } = row.original.user;
        return (
          <div className="flex items-center justify-between gap-3 min-h-[35px]">
            <div className="flex flex-col">
              <span>{email}</span>
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-end gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <ActionButton
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  loading={isRemovePending}
                  disabled={isRemovePending}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">{t("actions.moreActions")}</span>
                </ActionButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-xs text-destructive"
                  onClick={() => {
                    startRemoveTransition(async () => {
                      await removeDeveloper({ id: row.original.userId });
                    });
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("actions.remove")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const form = useForm<FormValues>({
    resolver: zodResolver(inviteFormSchema(t)),
    defaultValues: {
      email: "",
    },
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter: filtering,
    },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setFiltering,
  });

  const onSubmit = async (data: FormValues) => {
    startTransition(async () => {
      try {
        await addDeveloper({
          email: data.email,
        });
        toast.success(t("notifications.addSuccess"));
        setOpen(false);
        form.reset();
      } catch (error) {
        toast.error(t("notifications.addError"));
        console.error("Error adding administrator:", error);
      }
    });
  };

  return (
    <div className="container mx-auto max-w-6xl justify-start py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder={t("search.inputPlaceholder")}
            className="h-9 w-[240px]"
            value={filtering}
            onChange={(e) => setFiltering(e.target.value)}
          />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <ActionButton
              variant="default"
              disabled={isPending}
              loading={isPending}
            >
              {t("add.buttonLabel")}
            </ActionButton>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("add.dialogTitle")}</DialogTitle>
              <DialogDescription>
                {t("add.dialogDescription")}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("add.emailLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("add.emailPlaceholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <ActionButton
                    type="submit"
                    loading={isPending}
                    disabled={isPending}
                  >
                    {isPending ? t("add.savingButton") : t("add.saveButton")}
                  </ActionButton>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="px-6 py-3 space-y-4">
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="py-2 border-t text-start text-sm">
            {t("table.totalCount", {
              count: table.getFilteredRowModel().rows.length,
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const inviteFormSchema = (t: ReturnType<typeof useTranslations>) =>
  z.object({
    email: z.string().email(t("validation.emailInvalid")),
  });

type FormValues = z.infer<ReturnType<typeof inviteFormSchema>>;
