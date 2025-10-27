"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
  type Dispatch,
  Fragment,
  type SetStateAction,
  useEffect,
  useState,
  useTransition,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { 
  ActionButton, 
  type NavigationItem
} from "@/components/primitives";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Textarea } from "@/components/ui/textarea";
import type { TNavigation } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import {
  addNavigation,
  removeNavigation,
  updateNavigation,
} from "../_server/navigations.service";
import { ConfirmRemove } from "./confirm-remove";
import { flattenTree } from "./utils";
import { SidebarItemLink, SidebarNavItem, SidebarNavList } from "@/components/primitives/layout/sidebar-nav-list";

const formSchema = (t: ReturnType<typeof useTranslations>) =>
  z.object({
    name: z.string().min(1, { message: t("nameRequired") }),
    slug: z.string().min(1, { message: t("slugRequired") }),
    parentId: z.string().nullable().optional(),
    description: z.string().optional(),
  });

type FormValues = z.infer<ReturnType<typeof formSchema>>;

export function NavigationManager({
  className,
  navId,
  navList,
  itemsList,
}: {
  className?: string;
  navId: string;
  navList: TNavigation[];
  itemsList: NavigationItem[];
}) {
  const t = useTranslations("dashboard.navigation.navigation-manager");
  const [isRemovePending, startRemoveTransition] = useTransition();

  const [selectedNav, setSelectedNav] = useState<TNavigation | undefined>(
    undefined,
  );
  const [openRemoveConfirm, setOpenRemoveConfirm] = useState(false);
  const [openAddNav, setOpenAddNav] = useState(false);
  const [openEditNav, setOpenEditNav] = useState(false);

  const flattenList = flattenTree(itemsList);

  const handleRemove = async () => {
    if (selectedNav) {
      startRemoveTransition(async () => {
        await removeNavigation(selectedNav.id);
        toast.success(t("navigationRemoved"));
      });
    }
  };

  return (
    <Fragment>
       <SidebarNavList className={className} title={t("title")} onAddClick={() => setOpenAddNav(true)} >
          <nav className="space-y-1">
          {navList.map((item, index) => {
            const href = `/dashboard/navigation/${item.id}`;
            return (
              <SidebarNavItem
                key={item.id}
                className={cn("relative", item.id === navId && "is-active bg-sidebar-accent text-sidebar-accent-foreground font-medium")}
                onEdit={() => {
                  setSelectedNav(item);
                  setOpenEditNav(true);
                }}
                onRemove={() => setOpenRemoveConfirm(true)}
                icon={index === 0 ? "" : undefined}
              >
                <SidebarItemLink href={href} active={item.id === navId} className="col-start-1 col-end-2">{item.name} </SidebarItemLink>
              </SidebarNavItem>
            );
          })}
          </nav>
      </SidebarNavList>
      <ConfirmRemove
        title={t("deleteNavigation")}
        content={t("deleteNavigationConfirm")}
        open={openRemoveConfirm}
        onCancel={() => setOpenRemoveConfirm(false)}
        onClose={() => setOpenEditNav(false)}
        pending={isRemovePending}
        onConfirm={handleRemove}
      />
      <NavigationDialog
        open={openAddNav}
        onClose={() => setOpenAddNav(false)}
        mode="add"
        flattenList={flattenList}
      />
      <NavigationDialog
        open={openEditNav}
        onClose={() => setOpenEditNav(false)}
        mode="edit"
        nav={selectedNav}
        setOpenRemoveConfirm={setOpenRemoveConfirm}
        flattenList={flattenList}
      />
    </Fragment>
  );
}

function NavigationDialog({
  mode,
  open,
  onClose,
  nav,
  setOpenRemoveConfirm,
  flattenList
}: {
  mode: "add" | "edit";
  open: boolean;
  onClose: () => void;
  // 以下只有編輯模式時才需要
  nav?: TNavigation;
  setOpenRemoveConfirm?: Dispatch<SetStateAction<boolean>>;
  flattenList: NavigationItem[];
}) {
  const t = useTranslations("dashboard.navigation.navigation-manager");
  const { data: session } = useSession();
  const userId = session?.user.id;
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema(t)),
    defaultValues: {
      name: "",
      slug: "",
      parentId: null,
      description: "",
    },
  });

  const handleSubmit = async (data: FormValues) => {
    startTransition(async () => {
      try {
        if (mode === "add") {
          if (!userId) return;
          await addNavigation({
            data: {
              userId,
              slug: data.slug,
              name: data.name,
              parentId: data.parentId ?? null,
              description: data.description,
            },
            revalidateUri: "/dashboard/navigation",
          });
          toast.success(t("success"), {
            description: t("navigationCreatedSuccessfully"),
          });
        } else {
          await updateNavigation({
            data: {
              id: nav?.id,
              name: data.name,
              slug: data.slug,
              parentId: data.parentId ?? null,
              description: data.description,
            },
            revalidateUri: "./navigation",
          });
          toast.success(t("success"), {
            description: t("navigationUpdatedSuccessfully"),
          });
        }

        form.reset();
        onClose();
      } catch (error) {
        toast.error(t("error"), {
          description:
            mode === "add" ? t("createTopicError") : t("updateTopicError"),
        });
      }
    });
  };

  useEffect(() => {
    if (open && mode === "edit" && nav) {
      form.reset({
        name: nav.name,
        slug: nav.slug ?? "",
        parentId: nav.parentId ?? null,
        description: nav.description ?? "",
      });
    } else if (open && mode === "add") {
      form.reset({
        name: "",
        slug: "",
        parentId: null,
        description: "",
      });
    }
  }, [open, mode, nav, form.reset, form]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? t("addNewTitle") : t("editTitle")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("enterTitle")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("slug")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("slug")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("parentNavigation")}</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value ?? "null"}
                      onValueChange={(value) => {
                        field.onChange(value === "null" ? null : value);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("parentNavigation")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="null">{t("typeNone")}</SelectItem>
                        {flattenList?.map((nav) => (
                          <SelectItem key={nav.id} value={nav.id}>
                            {nav.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("enterTopicDescription")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              {mode === "edit" && setOpenRemoveConfirm && (
                <ActionButton
                  type="button"
                  className={cn(
                    buttonVariants({ variant: "destructive", size: "w_md" }),
                    "mr-auto",
                  )}
                  onClick={() => {
                    setOpenRemoveConfirm(true);
                  }}
                >
                  {t("delete")}
                </ActionButton>
              )}

              <ActionButton
                type="button"
                className={cn(
                  buttonVariants({ variant: "outline", size: "w_md" }),
                )}
                onClick={onClose}
              >
                {t("cancel")}
              </ActionButton>
              <ActionButton
                type="submit"
                disabled={isPending}
                loading={isPending}
                className={cn(buttonVariants({ size: "w_md" }))}
              >
                {t("save")}
              </ActionButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function NavSelectDropdown({
  navId,
  navList,
  onAddNew,
  onEdit,
}: {
  navId: string;
  navList: TNavigation[];
  onAddNew: () => void;
  onEdit: (nav: TNavigation) => void;
}) {
  const t = useTranslations("dashboard.navigation.navigation-manager");
  const router = useRouter();
  const currentNav = navList?.find((n) => n.id === navId) ?? {
    id: navId,
    name: t("main"),
  };
  const [isOpen, setIsOpen] = useState(false);

  return (
    
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="text-xl font-bold flex items-center gap-1 bg-transparent! border-0 shadow-none px-0 py-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          {currentNav.name}
          <span className="inline-flex">
            <Icon
              icon="mdi:menu-down-outline"
              className="ml-1 text-(--text-Neutral) size-5"
            />
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="p-1 w-56" align="start">
        {navList?.map((n, k) => (
          <DropdownMenuItem
            key={n.id}
            onSelect={(e) => e.preventDefault()}
            className="flex items-center justify-between w-full"
          >
            {/* 文字：點擊後導航 */}
            <button
              type="button"
              className="flex-grow px-2 py-1.5 text-left cursor-pointer"
              onClick={() => {
                if (n.id && n.id !== navId) {
                  router.push(`/dashboard/navigation/${n.id}`);
                }
                setIsOpen(false);
              }}
            >
              {n.name}
            </button>

            {/* Icon ：點擊後觸發編輯，第一個主要的不能編輯及刪除 */}
            {k !== 0 && (
              <button
                type="button"
                aria-label={t("editTitle")}
                className="p-2 cursor-pointer hover:bg-accent rounded-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(n);
                  setIsOpen(false);
                }}
              >
                <Icon icon="lsicon:more-filled" className="size-4" />
              </button>
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* 新增導航選項 */}
        <DropdownMenuItem
          onClick={() => {
            onAddNew();
            setIsOpen(false);
          }}
          className="flex-grow cursor-pointer"
        >
          <span className="flex-grow px-2 py-1.5 text-(--text-Neutral)">
            {t("addNewTitle")}
          </span>
          <span className="p-2 hover:bg-accent rounded-sm ">
            <Icon
              icon="basil:add-outline"
              className="size-4 text-(--text-Neutral)"
            />
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
