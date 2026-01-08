"use client";

import { IconSelector } from "@heiso/core/components/primitives";
import { Button } from "@heiso/core/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@heiso/core/components/ui/form";
import { Input } from "@heiso/core/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { MenuItem } from ".";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  path: z.string().optional(),
  icon: z.string().optional(),
  group: z.string().optional(),
});

interface MenuFormProps {
  item?: MenuItem | null;
  onSave: (item: Partial<Omit<MenuItem, "id">>) => void;
  onCancel: () => void;
}

export function MenuForm({ item, onSave, onCancel }: MenuFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: item?.title ?? "",
      path: item?.path ?? "",
      icon: item?.icon ?? "",
      group: item?.group ?? "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave({
      title: values.title,
      path: values.path,
      icon: values.icon,
      group: values.group,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter navigation title"
                  className="w-full"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="path"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Path</FormLabel>
              <FormControl>
                <Input
                  placeholder="/example/path"
                  className="w-full"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon (Optional)</FormLabel>
              <FormControl>
                <IconSelector
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="group"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Group name" className="w-full" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
