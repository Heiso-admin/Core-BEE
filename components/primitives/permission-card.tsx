'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
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

export interface Permission {
  id: string;
  resource: string;
  action: string;
}

export interface PermissionGroup {
  id: string;
  title: string;
  permissions: Permission[];
}

const permissionFormSchema = z.object({
  resource: z.string().min(1, 'Resource is required'),
  action: z.string().min(1, 'Action is required'),
});

type PermissionFormValues = z.infer<typeof permissionFormSchema>;

// TODO: remove this if the real PermissionGroups is ready
export const DemoPermissionGroups: PermissionGroup[] = [
  {
    id: 'USER',
    title: 'USER',
    permissions: ['view', 'edit', 'reset-password', 'create', 'delete'].map(
      (action) => ({
        id: `user:${action}`,
        name: `${
          action.charAt(0).toUpperCase() + action.slice(1).replace('-', ' ')
        } User`,
        resource: 'user',
        action,
      })
    ),
  },
  {
    id: 'ROLE',
    title: 'ROLE',
    permissions: ['view', 'edit', 'create', 'delete'].map((action) => ({
      id: `role:${action}`,
      name: `${action.charAt(0).toUpperCase() + action.slice(1)} Role`,
      resource: 'role',
      action,
    })),
  },
  {
    id: 'REPORTS',
    title: 'REPORTS',
    permissions: [
      {
        id: 'reports:view-all-cash',
        name: 'View All Cash Reports',
        resource: 'reports',
        action: 'view-all-cash',
      },
    ],
  },
  {
    id: 'PHARMACY PRODUCT',
    title: 'PHARMACY PRODUCT',
    permissions: ['view', 'edit', 'create', 'delete'].map((action) => ({
      id: `product:${action}`,
      name: `${action.charAt(0).toUpperCase() + action.slice(1)} Product`,
      resource: 'product',
      action,
    })),
  },
  {
    id: 'PATIENT',
    title: 'PATIENT',
    permissions: ['view', 'edit', 'create', 'delete'].map((action) => ({
      id: `patient:${action}`,
      name: `${action.charAt(0).toUpperCase() + action.slice(1)} Patient`,
      resource: 'patient',
      action,
    })),
  },
  {
    id: 'OTHER SERVICE',
    title: 'OTHER SERVICE',
    permissions: ['view', 'edit', 'create', 'delete'].map((action) => ({
      id: `service:${action}`,
      name: `${action.charAt(0).toUpperCase() + action.slice(1)} Service`,
      resource: 'service',
      action,
    })),
  },
  {
    id: 'LAB REPORT',
    title: 'LAB REPORT',
    permissions: [
      ...['view', 'edit', 'create', 'delete'].map((action) => ({
        id: `lab-report:${action}`,
        name: `${action.charAt(0).toUpperCase() + action.slice(1)} Lab Report`,
        resource: 'lab-report',
        action,
      })),
      ...['view', 'edit', 'create', 'delete'].map((action) => ({
        id: `unit:${action}`,
        name: `${action.charAt(0).toUpperCase() + action.slice(1)} Unit`,
        resource: 'unit',
        action,
      })),
      ...['view', 'edit', 'create', 'delete'].map((action) => ({
        id: `result-category:${action}`,
        name: `${
          action.charAt(0).toUpperCase() + action.slice(1)
        } Result Category`,
        resource: 'result-category',
        action,
      })),
      ...['view', 'edit', 'create', 'delete'].map((action) => ({
        id: `test-data:${action}`,
        name: `${action.charAt(0).toUpperCase() + action.slice(1)} Test Data`,
        resource: 'test-data',
        action,
      })),
      ...['view', 'edit', 'create', 'delete'].map((action) => ({
        id: `test-data-category:${action}`,
        name: `${
          action.charAt(0).toUpperCase() + action.slice(1)
        } Test Data Category`,
        resource: 'test-data-category',
        action,
      })),
      {
        id: 'patient-lab-report:view',
        name: 'View Patient Lab Report',
        resource: 'patient-lab-report',
        action: 'view',
      },
      {
        id: 'patient-lab-report:update',
        name: 'Update Patient Lab Report',
        resource: 'patient-lab-report',
        action: 'update',
      },
      {
        id: 'patient-lab-report:print',
        name: 'Print Patient Lab Report',
        resource: 'patient-lab-report',
        action: 'print',
      },
    ],
  },
  {
    id: 'INVOICE',
    title: 'INVOICE',
    permissions: [
      {
        id: 'invoice:create',
        name: 'Create Invoice',
        resource: 'invoice',
        action: 'create',
      },
      {
        id: 'invoice:reverse',
        name: 'Reverse Invoice',
        resource: 'invoice',
        action: 'reverse',
      },
    ],
  },
  {
    id: 'DOCTOR',
    title: 'DOCTOR',
    permissions: ['view', 'edit', 'create', 'delete'].map((action) => ({
      id: `doctor:${action}`,
      name: `${action.charAt(0).toUpperCase() + action.slice(1)} Doctor`,
      resource: 'doctor',
      action,
    })),
  },
  {
    id: 'CHANEL SESSION',
    title: 'CHANEL SESSION',
    permissions: ['view', 'edit', 'create', 'delete'].map((action) => ({
      id: `session:${action}`,
      name: `${action.charAt(0).toUpperCase() + action.slice(1)} Session`,
      resource: 'session',
      action,
    })),
  },
];

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

      <Card className="shadow-sm rounded-lg">
        <CardHeader className="space-y-1 border-b">
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
              <CardTitle className="text-lg font-medium">
                {permissionGroup.title}{' '}
                <span className="ml-2 text-sm text-muted-foreground">
                  Permission
                </span>
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
                className="flex min-h-6 items-center justify-between"
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
