'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
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
import { Button } from '@/components/ui/button';
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
  updatePermission,
} from '@/modules/dev-center/permission/_server/permission.service';
import { DynamicIcon, type IconName } from "lucide-react/dynamic";

export interface Permission {
  id: string;
  resource: string;
  action: string;
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
  editable = false,
}: {
  permissionGroup: PermissionGroup;
  selectable?: {
    value: string[];
    onCheckedChange?: (value: string[]) => void;
  };
  editable?: boolean;
}) {
  const [isCreatePending, startCreateTransition] = useTransition();
  const [isEditPending, startEditTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null
  );
  const value = selectable?.value.length
    ? permissionGroup.permissions
        .filter((p) => selectable.value.includes(p.id))
        .map((p) => p.id)
    : [];
    
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

  // const handlePermissionChange = (
  //   // groupIndex: number,
  //   permissionIndex: number
  // ) => {
  //   // const newPermissionGroups = [...permissionGroups];
  //   // newPermissionGroups[groupIndex].permissions[permissionIndex].checked =
  //   //   !newPermissionGroups[groupIndex].permissions[permissionIndex].checked;
  //   // setPermissionGroups(newPermissionGroups);
  // };

  const handleSelectAll = (checked: boolean) => {
    if (selectable?.onCheckedChange) {
      selectable.onCheckedChange(
        checked ? permissionGroup.permissions.map((p) => p.id) : []
      );
    }
  };

  const handleCreatePermission = async (data: PermissionFormValues) => {
    startCreateTransition(async () => {
      await createPermission({
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

  const openEditDialog = (permission: Permission) => {
    setEditingPermission(permission);
    form.reset({
      resource: permission.resource,
      action: permission.action,
    });
    setIsDialogOpen(true);
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
              {selectable && (
                <Checkbox
                  id={`select-all-${permissionGroup.title}`}
                  // checked={permissionGroup.permissions.every((p) => p.checked)}
                  onCheckedChange={(checked: boolean) =>
                    handleSelectAll(checked)
                  }
                />
              )}
              <CardTitle className="text-md font-medium text-gray-400 flex items-center gap-2">
                {permissionGroup.icon && <DynamicIcon name={permissionGroup.icon as IconName} size={20} />}
                {permissionGroup.title}
              </CardTitle>
            </div>

            {editable && (
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
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {permissionGroup.permissions.map((permission, permissionIndex) => (
              <div
                key={permission.id}
                className="flex min-h-6 items-center justify-between mb-0"
              >
                <div className="flex items-center space-x-2">
                  {selectable && (
                    <Checkbox
                      id={permission.id}
                      checked={value.indexOf(permission.id) !== -1}
                      onCheckedChange={(checked) => {
                        // handlePermissionChange(permissionIndex);
                        selectable.onCheckedChange?.(
                          checked
                            ? [...value, permission.id]
                            : value.filter((id) => id !== permission.id)
                        );
                      }}
                    />
                  )}
                  <label
                    htmlFor={permission.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {permission.resource}: {permission.action}
                  </label>
                </div>
                {editable && (
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
                )}
              </div>
            ))}
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
}){
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
