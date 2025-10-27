"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { AnalyticsToolSetting } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { AnalysisSave } from "./analysis-save";

interface AnalysisTool extends Pick<AnalyticsToolSetting, "id" | "name"> {
  icon: string;
}

export interface SelectedTool {
  id: string;
  name: string;
  trackingId?: string;
}

const getAnalysisTools = (t: ReturnType<typeof useTranslations>): AnalysisTool[] => [
  {
    id: "ga4",
    name: t("selector.tools.google_analytics_4"),
    icon: "📊",
    // selected: false,
  },
];

export function AnalysisToolSelector({
  enabled,
}: {
  enabled: AnalyticsToolSetting[];
}) {
  const t = useTranslations("dashboard.settings.tracking");
  const [open, setOpen] = useState(false);
  const [currentTool, setCurrentTool] = useState<SelectedTool | null>();

  const analysisTools = getAnalysisTools(t);

  const addTool = (tool: SelectedTool) => {
    setOpen(true);
    setCurrentTool(tool);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-medium">{t("selector.title")}</h2>
        {/* <div className="w-4 h-4 rounded-full flex items-center justify-center text-xs">
          ?
        </div> */}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {analysisTools.map((tool) => {
          const selected = enabled.map((e) => e.id).includes(tool.id);
          return (
            <Card
              key={tool.id}
              className={cn(
                "relative rounded-md cursor-pointer transition-all shadow-none hover:shadow-md",
                "border-2",
                selected ? "border-green-500" : "",
              )}
              onClick={() => {
                if (!selected) {
                  addTool({
                    id: tool.id,
                    name: tool.name,
                  });
                }
              }}
            >
              {selected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
              )}

              <CardContent className="p-4 text-center space-y-3">
                <div className="text-sm font-medium leading-tight">
                  {tool.name}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {currentTool && (
        <AnalysisSave open={open} onOpenChange={setOpen} data={currentTool} />
      )}
    </div>
  );
}
