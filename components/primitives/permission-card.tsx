'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition, useEffect, useCallback } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import * as z from 'zod';
import { ActionButton } from '@/components/primitives';
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
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
// TODO: change service to external
import {
  createPermission,
  deletePermission,
  deletePermissionByKey,
  updatePermission,
} from '@/modules/dev-center/permission/_server/permission.service';
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import _ from 'lodash';
import { generatePermissionId } from '@/lib/id-generator';
import { Separator } from '../ui/separator';
import { type CheckedState } from '@radix-ui/react-checkbox';

export interface Permission {
  id: string;
  resource: string;
  action: string;
  checked?: boolean;
}

export interface PermissionGroup {
  id: string;
  title: string;
  icon: string | null;
  permissions: Permission[];
}

const permissionFormSchema = z.object({
  resource: z.string().min(1, 'Resource is required'),
  action: z.string().min(1, 'Action is required'),
});

type PermissionFormValues = z.infer<typeof permissionFormSchema>;

export function PermissionCard({
  permissionGroup,
  selectable,
}: {
  permissionGroup: PermissionGroup;
  selectable?: {
    value: string[];
    onCheckedChange?: (value: string[]) => void;
  };
}) {
  const [isCreatePending, startCreateTransition] = useTransition();
  const [isEditPending, startEditTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null
  );
  const [localPermissions, setLocalPermissions] = useState<Permission[]>(permissionGroup.permissions);
  const [isAll, setIsAll] = useState<CheckedState>(false);

  const getOverallCheckboxState = useCallback((list: { checked?: boolean }[]): CheckedState => {
    const areAllChecked = list.length > 0 && list.every(p => !!p.checked);
    const isAnyChecked = list.some(p => !!p.checked);

    if (areAllChecked) {
      return true;
    }

    if (isAnyChecked) {
      return 'indeterminate';
    }
    return false;
  }, []);

  useEffect(() => {
    setLocalPermissions(permissionGroup.permissions);
    setIsAll(getOverallCheckboxState(permissionGroup.permissions));
  }, [permissionGroup.permissions, getOverallCheckboxState]);

  useEffect(() => {
    setIsAll(getOverallCheckboxState(localPermissions));
  }, [localPermissions, getOverallCheckboxState]);

  const form = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      resource: '',
      action: '',
    },
  });

  if (selectable && permissionGroup.permissions.length === 0) {
    return null;
  }

  const handleCreatePermission = async (data: PermissionFormValues) => {
    startCreateTransition(async () => {
      await createPermission({
        id: generatePermissionId(),
        menuId: permissionGroup.id,
        resource: data.resource,
        action: data.action,
      });
      form.reset();
      setIsDialogOpen(false);
    });
  };

  const handleEditPermission = async (data: PermissionFormValues) => {
    if (!editingPermission) return;

    startEditTransition(async () => {
      await updatePermission({
        id: editingPermission.id,
        resource: data.resource,
        action: data.action,
      });
      setIsDialogOpen(false);
      setEditingPermission(null);
      form.reset();
    });
  };

  const handleDeletePermission = async (id: string) => {
    await deletePermission({ id });
  };

  const openEditDialog = (permission: Permission) => {
    setEditingPermission(permission);
    form.reset({
      resource: permission.resource,
      action: permission.action,
    });
    setIsDialogOpen(true);
  };

  const handlePermissionChange = (
    checked: boolean | string,
    permission: Permission
  ) => {
    if (typeof checked !== 'boolean') return;

    const { resource, action, id } = permission;
    setLocalPermissions((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, checked } : p,
      ),
    );

    if (checked) {
      startCreateTransition(async () => {
        const created = await createPermission({
          id: permission.id,
          menuId: permissionGroup.id,
          resource,
          action,
        });
      });
    } else {
      startEditTransition(async () => {
        await deletePermissionByKey({ id: permission.id });
      });
    }
  };

  const handleToggleAll = (checkedAll: boolean) => {
    setIsAll(checkedAll);
    const currentPermissions = localPermissions;

    setLocalPermissions((prevState) => prevState.map((p) => ({ ...p, checked: checkedAll })));

    if (checkedAll) {
      const toCreate = currentPermissions.filter((p) => !p.checked);
      if (toCreate.length === 0) return;

      startCreateTransition(async () => {
        await Promise.all(
          toCreate.map((p) =>
            createPermission({ id: p.id, menuId: permissionGroup.id, resource: p.resource, action: p.action }),
          ),
        );
      });
    } else {
      startEditTransition(async () => {
        const toDelete = currentPermissions.filter((p) => p.checked);
        if (toDelete.length === 0) return;

        await Promise.all(
          toDelete.map((p) => deletePermissionByKey({ id: p.id })),
        );
      });
    }
  };

  return (
    <div className="">
      <AddOrEditPermission
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        editingPermission={editingPermission}
        permissionGroup={permissionGroup}
        form={form}
        handleCreatePermission={handleCreatePermission}
        handleEditPermission={handleEditPermission}
        isCreatePending={isCreatePending}
        isEditPending={isEditPending}
      />

      <Card className="shadow-none rounded-lg gap-0 h-full">
        <CardHeader className="space-y-1">
          <div className="flex justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-md font-medium text-gray-400 flex items-center gap-2">
                {permissionGroup.icon && <DynamicIcon name={permissionGroup.icon as IconName} size={20} />}
                {permissionGroup.title}
              </CardTitle>
            </div>
            {/* 可自行新增按鈕（目前移除，要將權限自行寫進資料庫內） */}
            {/* {editable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  form.reset({
                    resource: '',
                    action: '',
                  });
                  setIsDialogOpen(true);
                }}
              >
                Add new
              </Button>
            )} */}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {localPermissions.length > 0 && (
            <>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`select-all-${permissionGroup.id}`}
                  checked={isAll}
                  onCheckedChange={(checked: boolean) =>
                    handleToggleAll(checked)
                  }
                />
                <label
                  htmlFor={`select-all-${permissionGroup.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Select All
                </label>
              </div>
              <Separator className="my-4" />
            </>
          )}
          <div className="space-y-2">
            {localPermissions.map((permission) => {
              const uiId = `${permission.resource}:${permission.action}:${permission.id}`;
              return (
                <div
                  key={`${permission.id}:${permission.resource}:${permission.action}`}
                  className="flex min-h-6 items-center justify-between mb-0"
                >
                  <div className="flex items-center space-x-2">
                    {(
                      <Checkbox
                        id={uiId}
                        checked={permission?.checked}
                        onCheckedChange={(isChecked) => {
                          handlePermissionChange(isChecked, permission);
                        }}
                      />
                    )}
                    <label
                      htmlFor={uiId}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {permission.resource}: {permission.action}
                    </label>
                  </div>
                  {/* {editable && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openEditDialog({
                            id: permission.id,
                            resource: permission.resource,
                            action: permission.action,
                          })
                        }
                      >
                        Edit
                      </Button>
                      <DeleteConfirm id={permission.id}>
                        <Button variant="ghost" size="sm">
                          Delete
                        </Button>
                      </DeleteConfirm>
                    </div>
                  )} */}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AddOrEditPermission({
  isDialogOpen,
  setIsDialogOpen,
  editingPermission,
  permissionGroup,
  form,
  handleCreatePermission,
  handleEditPermission,
  isCreatePending,
  isEditPending,
}: {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  editingPermission?: Permission | null;
  permissionGroup: PermissionGroup;
  form: UseFormReturn<PermissionFormValues>;
  handleCreatePermission: (data: PermissionFormValues) => Promise<void>;
  handleEditPermission: (data: PermissionFormValues) => Promise<void>;
  isCreatePending: boolean;
  isEditPending: boolean;
}) {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingPermission ? 'Edit Permission' : 'Create Permission'}
            <span className="ml-1 text-xs text-muted-foreground">
              - {permissionGroup.title}
            </span>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              editingPermission
                ? handleEditPermission
                : handleCreatePermission
            )}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="resource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ActionButton
              type="submit"
              className="w-full"
              disabled={editingPermission ? isEditPending : isCreatePending}
              loading={editingPermission ? isEditPending : isCreatePending}
            >
              {editingPermission ? 'Update' : 'Create'}
            </ActionButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteConfirm({
  children,
  id,
}: {
  children: React.ReactNode;
  id: string;
}) {
  const [isDeletePending, startDeleteTransition] = useTransition();

  const handleDeletePermission = async (id: string) => {
    startDeleteTransition(async () => {
      await deletePermission({ id });
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this
            permission.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <ActionButton
              onClick={() => handleDeletePermission(id)}
              loading={isDeletePending}
              disabled={isDeletePending}
            >
              Delete
            </ActionButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
