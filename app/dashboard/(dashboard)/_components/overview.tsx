"use client";

import { useSite } from "@heiso/core/providers/site";
// import type { OverviewInfo } from "../_server/overview.service";

export function Overview() {
  const { site } = useSite();
  // const t = useTranslations('dashboard.overview');

  // const metrics = [
  //   {
  //     title: t("article"),
  //     icon: Newspaper,
  //     label: t("articles"),
  //     path: "/article",
  //     value: info.articleCount,
  //     hasActivity: info.articleCount > 0,
  //   },
  // ];

  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="border-b px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium">{site?.basic?.name ?? ""}</h1>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* {metrics.map((metric) => {
            const IconComponent = metric.icon;
            return (
              <Card
                key={metric.title}
                className="hover:border-muted-foreground/35"
              >
                <Link href={`/dashboard${metric.path}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <IconComponent className="h-5 w-5" />
                      <h3 className="text-lg font-medium">{metric.title}</h3>
                    </div>

                    <div className="mb-2">
                      <div className="text-sm mb-1">{metric.label}</div>
                      <div className="text-3xl font-medium">{metric.value}</div>
                    </div>

                    <div className="h-20 flex items-end justify-center mb-4">
                      {metric.hasActivity ? (
                        <div className="flex items-end gap-1 h-full">
                          <div className="w-2 h-12"></div>
                          <div className="w-2 h-16"></div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-sm">
                          {t('noActivity')}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Link>
              </Card>
            );
          })} */}
        </div>
      </div>
    </div>
  );
}
