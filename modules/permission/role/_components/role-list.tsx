"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ActionButton, MenuTree } from "@/components/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
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
import { Textarea } from "@/components/ui/textarea";
import type { TMenu } from "@/lib/db/schema";
import type { Role } from "../_server/role.service";
import { createRole, deleteRole, updateRole } from "../_server/role.service";
import { assignMenus, assignPermissions } from "../_server/assign.service";
import { CaptionTotal } from '@/components/ui/caption-total';
import { Plus, ChevronDown, ChevronRight, Pencil, Trash, ListChevronsDownUp } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { toast } from "sonner";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoginMethodEnum } from '@/modules/auth/_components/loginForm';
import { useAccount } from '@/providers/account';
import { Separator } from '@/components/ui/separator';

export function RoleList({
  data,
  menus,
  permissions,
}: {
  data: Role[];
  menus: TMenu[];
  permissions: any;
}) {
  const t = useTranslations('dashboard.permission.role');
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Role | null>(null);
  const [isCollapsedClose, setIsListCollapsedClose] = useState<boolean>(false); //點擊一律關閉

  return (
    <div className="container mx-auto pt-4 pr-4 h-full flex flex-col">
      <CreateOrUpdateRole
        open={open}
        onClose={() => {
          setOpen(false);
          setSelectedItem(null);
        }}
        data={selectedItem}
      />
      <div className="flex items-center justify-between mb-4">
        <CaptionTotal title={t('title')} total={data.length} />
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="bg-transparent"
            onClick={() => setIsListCollapsedClose(!isCollapsedClose)}
          >
            <ListChevronsDownUp className="h-4 w-4" />
          </Button>
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            {t('list.add_new')}
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        {data.map((role) => (
          <RoleItemCollapsible
            key={role.id}
            role={role}
            menus={menus}
            permissionGroups={permissions}
            isCollapsedClose={isCollapsedClose}
          />
        ))}
      </div>
    </div>
  );
}

function RoleItemCollapsible({
  role,
  menus,
  permissionGroups,
  isCollapsedClose,
}: {
  role: Role;
  menus: TMenu[];
  permissionGroups: any[];
  isCollapsedClose: boolean;
}) {
  const t = useTranslations('dashboard.permission.role');
  const { isDeveloper } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMenus, setSelectedMenus] = useState<string[]>(
    role.menus?.map((m: any) => m.menus.id) ?? []
  );
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    role.permissions?.map((p: any) => p.permission.id) ?? []
  );
  const [name, setName] = useState<string>(role.name || '');
  const [description, setDescription] = useState<string>(
    role.description || ''
  );
  const [loginMethod, setLoginMethod] = useState<string>(
    role.loginMethod || LoginMethodEnum.Both
  );
  const [fullAccessEditing, setFullAccessEditing] = useState<boolean>(
    role.fullAccess ?? false
  );
  const prevPermissionsRef = useRef<string[] | null>(null);
  const prevMenusRef = useRef<string[] | null>(null);
  const [isSaving, startTransition] = useTransition();
  const ItemColStyle = {
    gridTemplateColumns: 'minmax(200px, 1fr) 3fr',
    gap: '1rem',
  };

  // helpers: 取得角色預設的選單/權限 ID（穩定引用）
  const getRoleMenuIds = useCallback(
    (r: Role) => r.menus?.map((m: any) => m.menus.id) ?? [],
    []
  );
  const getRolePermissionIds = useCallback(
    (r: Role) => r.permissions?.map((p: any) => p.permission.id) ?? [],
    []
  );

  // helpers: 將狀態重置為角色目前資料（不改 isEditing）（穩定引用）
  const applyRoleState = useCallback(
    (r: Role) => {
      setSelectedMenus(getRoleMenuIds(r));
      setSelectedPermissions(getRolePermissionIds(r));
      setName(r.name || '');
      setDescription(r.description || '');
      setFullAccessEditing(r.fullAccess ?? false);
      prevPermissionsRef.current = null;
      prevMenusRef.current = null;
    },
    [getRoleMenuIds, getRolePermissionIds]
  );

  // helpers: 記住原先選擇（僅在尚未記住時）（依賴目前選擇）
  const snapshotPrevIfNeeded = useCallback(() => {
    if (!prevPermissionsRef.current)
      prevPermissionsRef.current = selectedPermissions;
    if (!prevMenusRef.current) prevMenusRef.current = selectedMenus;
  }, [selectedPermissions, selectedMenus]);

  const allPermissionIds = useMemo(() => {
    const ids: string[] = [];
    (permissionGroups || []).forEach((g: any) => {
      (g.permissions || []).forEach((p: any) => {
        ids.push(p.id);
      });
    });
    return Array.from(new Set(ids));
  }, [permissionGroups]);

  const allMenuIds = useMemo(() => {
    const ids: string[] = [];
    const walk = (arr: any[]) => {
      (arr || []).forEach((n) => {
        ids.push(n.id);
        if (n.children) walk(n.children);
      });
    };
    walk(menus as any);
    return Array.from(new Set(ids));
  }, [menus]);

  // helpers: 全選權限與選單（僅在未全選時才設定）（穩定依賴）
  const selectAllMenusAndPermissions = useCallback(() => {
    snapshotPrevIfNeeded();
    if (selectedPermissions.length !== allPermissionIds.length) {
      setSelectedPermissions(allPermissionIds);
    }
    if (selectedMenus.length !== allMenuIds.length) {
      setSelectedMenus(allMenuIds);
    }
  }, [
    snapshotPrevIfNeeded,
    selectedPermissions.length,
    allPermissionIds,
    selectedMenus.length,
    allMenuIds,
  ]);

  // helpers: 從快照還原選擇，並清空快照（穩定引用）
  const restoreSelectionsFromPrev = useCallback(() => {
    setSelectedPermissions(prevPermissionsRef.current ?? []);
    prevPermissionsRef.current = null;
    setSelectedMenus(prevMenusRef.current ?? []);
    prevMenusRef.current = null;
  }, []);

  useEffect(() => {
    if (typeof isCollapsedClose === 'boolean') {
      setIsOpen(false);
    }
  }, [isCollapsedClose]);

  useEffect(() => {
    // 重置為角色目前的權限/選單；儲存進行中時避免被舊資料覆蓋
    if (isSaving) return;
    applyRoleState(role);
  }, [role, applyRoleState, isSaving]);

  const permissionMap = useMemo(() => {
    const m = new Map<string, any[]>();
    (permissionGroups || []).forEach((g: any) => {
      m.set(g.id, g.permissions || []);
    });
    return m;
  }, [permissionGroups]);

  const menusWithPerms = useMemo(() => {
    const attach = (arr: any[]): any[] =>
      (arr || []).map((node) => ({
        ...node,
        permissions: permissionMap.get(node.id) || [],
        children: node.children ? attach(node.children) : undefined,
      }));
    return attach(menus as any);
  }, [menus, permissionMap]);

  const handleCancelEdit = () => {
    applyRoleState(role);
    setIsEditing(false);
  };

  const handleSave = () => {
    startTransition(async () => {
      await updateRole(role.id, {
        name,
        description,
        fullAccess: fullAccessEditing,
        loginMethod: loginMethod,
      });
      await assignMenus({ roleId: role.id, menus: selectedMenus });
      await assignPermissions({
        roleId: role.id,
        permissions: selectedPermissions,
      });
      toast.success(t('form.update_title'));
      setIsEditing(false);
    });
  };

  // 當預設或切換為完全訪問時，確保選單與權限已全選，視覺與資料一致
  useEffect(() => {
    if (!fullAccessEditing) return;
    // 記住原先狀態以便之後還原，並補齊未全選的項目
    selectAllMenusAndPermissions();
  }, [fullAccessEditing, selectAllMenusAndPermissions]);

  const handleToggleFullAccess = (checked: boolean | 'indeterminate') => {
    if (!isEditing) return;
    const isChecked = checked === true;
    setFullAccessEditing(isChecked);
    if (isChecked) {
      selectAllMenusAndPermissions();
    } else {
      restoreSelectionsFromPrev();
    }
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={isEditing ? undefined : setIsOpen}
      className="flex flex-col gap-4 layout-split-pane border-none"
    >
      <div
        className="grid items-center gap-4"
        style={{ gridTemplateColumns: 'minmax(200px, auto) 1fr auto' }}
      >
        <CollapsibleTrigger asChild>
          <div className="flex items-center space-x-3 cursor-pointer">
            {isOpen ? (
              <ChevronDown className="size-5" />
            ) : (
              <ChevronRight className="size-5" />
            )}
            {isEditing ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('form.name')}
                className="h-8 w-[220px]"
              />
            ) : (
              <h4 className="text-sm font-semibold">{role.name}</h4>
            )}
          </div>
        </CollapsibleTrigger>
        {/* Setting user loginMethod*/}
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          {isEditing ? (
            <Select value={loginMethod} onValueChange={setLoginMethod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('form.method.description')} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{t('form.method.title')}</SelectLabel>
                  {Object.values(LoginMethodEnum).map((methodValue) => (
                    <SelectItem key={methodValue} value={methodValue}>
                      {t(`form.method.${methodValue}`)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : (
            <span>{`${t(`form.method.${loginMethod}`)}`}</span>
          )}
        </div>

        <div className="flex items-center">
          {!isEditing ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                setIsOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button
                className="mr-2"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelEdit();
                }}
              >
                {t('form.cancel')}
              </Button>
              <ActionButton
                className="mr-2"
                size="sm"
                loading={isSaving}
                disabled={isSaving}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
              >
                {t('form.save')}
              </ActionButton>
            </>
          )}
          {isDeveloper && (
            <DeleteConfirm id={role.id}>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash className="size-4" />
              </Button>
            </DeleteConfirm>
          )}
        </div>
      </div>
      <CollapsibleContent className="flex flex-col gap-6 px-8 pt-2">
        <span className="w-full wrap-break-words overflow-hidden ">
          {isEditing ? (
            <Textarea
              className="min-h-8 py-1"
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= 200)
                  setDescription(e.target.value);
              }}
              placeholder={t('form.description')}
              maxLength={200}
            />
          ) : (
            <span className="text-sm">{`${t('form.description')} : ${role.description}`}</span>
          )}
        </span>
        <Separator />

        {/* Header row */}
        <div className="grid items-center justify-between" style={ItemColStyle}>
          <div className="flex items-center gap-2 ">
            <Checkbox
              id={`fullAccess-${role.id}`}
              checked={!!fullAccessEditing}
              disabled={!isEditing}
              onCheckedChange={handleToggleFullAccess}
            />
            <label
              htmlFor={`fullAccess-${role.id}`}
              className={cn(
                'text-sm ml-2',
                !isEditing ? 'text-muted-foreground' : ''
              )}
            >
              <h5 className="text-sm font-medium text-muted-foreground">
                {t('form.menuTitle')}
              </h5>
            </label>
            {(role.fullAccess || fullAccessEditing) && (
              <Badge className="ml-1" variant="outline">
                {t('list.full_access')}
              </Badge>
            )}
          </div>
          <h5 className="text-sm font-medium text-muted-foreground">
            {t('form.permissionTitle')}
          </h5>
        </div>

        {/* Menu 與權限行內結合（權限在 MenuTree 內部以 resource 群組顯示） */}
        <MenuTree
          style={ItemColStyle}
          items={menusWithPerms as any}
          selectable={{
            selectedItems: selectedMenus,
            disabled: !isEditing || !!fullAccessEditing,
            onSelectionChange: (itemId, checked) => {
              if (!isEditing || fullAccessEditing) return;
              setSelectedMenus((prev) =>
                checked ? [...prev, itemId] : prev.filter((id) => id !== itemId)
              );
            },
          }}
          selectPermission={{
            selectedItems: selectedPermissions,
            disabled: !isEditing || !!fullAccessEditing,
            onSelectionChange: (permissionId, checked) => {
              if (!isEditing || fullAccessEditing) return;
              setSelectedPermissions((prev) =>
                checked
                  ? [...prev, permissionId]
                  : prev.filter((id) => id !== permissionId)
              );
            },
          }}
        />
      </CollapsibleContent>
    </Collapsible>
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
    loginMethod: z.string(),
    fullAccess: z.boolean().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullAccess: false,
      loginMethod: LoginMethodEnum.Both,
    },
  });

  useEffect(() => {
    if (data) {
      form.setValue("name", data.name);
      form.setValue("description", data.description ?? "");
      form.setValue("fullAccess", data.fullAccess ?? false);
      form.setValue("loginMethod", data.loginMethod ?? LoginMethodEnum.Both);
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
              name="loginMethod"
              defaultValue=""
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("method.title")}</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("method.description")} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(LoginMethodEnum).map((methodValue) => (
                          <SelectItem key={methodValue} value={methodValue}>
                            {t(`method.${methodValue}`)}
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
  const t = useTranslations("dashboard.permission.role.delete_confirm");
  const [isDeletePending, startDeleteTransition] = useTransition();

  const handleDelete = async () => {
    startDeleteTransition(async () => {
      await deleteRole({ id });
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>
            <Button variant="outline">{t("cancel")}</Button>
          </DialogClose>
          <DialogClose>
            <ActionButton
              onClick={handleDelete}
              loading={isDeletePending}
              disabled={isDeletePending}
            >
              {t("delete")}
            </ActionButton>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
