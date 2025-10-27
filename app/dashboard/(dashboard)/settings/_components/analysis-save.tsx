"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AnalyticsToolSetting } from "@/lib/db/schema";
import {
  addAnalyticsTool,
  updateAnalyticsTool,
} from "../_server/analytics-tools.service";

const getFormSchema = (t: ReturnType<typeof useTranslations>) =>
  z.object({
    trackingId: z.string().min(1, {
      message: t("form.tracking_id_required"),
    }),
  });

type FormValues = {
  trackingId: string;
};

interface AnalysisEditProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: {
    id: string;
    name: string;
    trackingId?: string;
  };
}

export function AnalysisSave({ open, onOpenChange, data }: AnalysisEditProps) {
  const t = useTranslations("tracking");
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formSchema = getFormSchema(t);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trackingId: data.trackingId ?? "",
    },
  });

  const userId = session?.user.id;
  if (!userId) return;

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (data.trackingId) {
        await updateAnalyticsTool({
          ...data,
          ...values,
        });
      } else {
        await addAnalyticsTool({
          userId,
          ...data,
          ...values,
        });
      }
      // Add actual submission logic here
      toast.success(t("toast.success"));
      onOpenChange(false);
    } catch (error) {
      toast.error(t("toast.error"));
    } finally {
      form.reset();
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("form.title")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <Label className="text-sm font-medium">
              {t("form.tool_label")}
              <b>{data.name}</b>
            </Label>

            {/* Tracking ID */}
            <FormField
              control={form.control}
              name="trackingId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {t("form.tracking_id_label")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("form.tracking_id_placeholder")}
                      {...field}
                      className="font-mono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                {t("form.actions.discard")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? t("form.actions.saving")
                  : t("form.actions.save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
