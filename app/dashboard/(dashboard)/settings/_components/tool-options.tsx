"use client";

import { Edit, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AnalyticsToolSetting } from "@/lib/db/schema";
import type { SelectedTool } from "../_components/tool-selector";
import { removeAnalyticsTool } from "../_server/analytics-tools.service";
import { AnalysisSave } from "./analysis-save";
import { ConfirmRemove } from "./confirm-remove";

export function AnalysisToolOptions({
  enabled,
}: {
  enabled: AnalyticsToolSetting[];
}) {
  const t = useTranslations("tracking");
  const [open, setOpen] = useState(false);
  const [currentTool, setCurrentTool] = useState<SelectedTool | null>();
  const [isRemovePending, startRemoveTransition] = useTransition();
  const [openRemoveConfirm, setOpenRemoveConfirm] = useState(false);

  if (enabled.length === 0) return null;

  const handleEdit = (tool: SelectedTool) => {
    setOpen(true);
    setCurrentTool(tool);
  };

  const handleRemove = () => {
    if (!currentTool?.id) return;
    startRemoveTransition(async () => {
      await removeAnalyticsTool(currentTool.id);
      toast.success(t("toast.removed"));
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-medium">
                {t("table.headers.tool")}
              </TableHead>
              {/* <TableHead className="font-medium text-gray-700">
                Tracking Event / Activity
              </TableHead> */}
              <TableHead className="font-medium">
                {t("table.headers.tracking_id")}
              </TableHead>
              <TableHead className="w-[120px] font-medium">
                {t("table.headers.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enabled.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{item.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-mono text-sm whitespace-pre-line">
                    {item.trackingId}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleEdit({
                          id: item.id,
                          name: item.name,
                          trackingId: item.trackingId,
                        })
                      }
                      className="h-8 px-3"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCurrentTool({
                          id: item.id,
                          name: item.name,
                          trackingId: item.trackingId,
                        });
                        setOpenRemoveConfirm(true);
                      }}
                      className="h-8 w-8 p-0 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {currentTool && (
        <AnalysisSave open={open} onOpenChange={setOpen} data={currentTool} />
      )}

      <ConfirmRemove
        title={t("confirm_remove.title")}
        content={t("confirm_remove.content")}
        open={openRemoveConfirm}
        onClose={() => setOpenRemoveConfirm(false)}
        pending={isRemovePending}
        onConfirm={handleRemove}
      />
    </div>
  );
}
