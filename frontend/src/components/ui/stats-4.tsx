"use client";

import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as RechartsPrimitive from "recharts";
import { ExternalLink } from "lucide-react";
import { useFeedbackStats, useFeedbackTimeseries } from "@/hooks";
import { useQuery } from "@tanstack/react-query";
import { reclamationsApi } from "@/lib/api/reclamations";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#111111] text-slate-900 dark:text-white shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  );
};

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-slate-600 dark:[&_.recharts-cartesian-axis-tick_text]:fill-slate-400 [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-slate-200 dark:[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-slate-800 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-slate-200 dark:[&_.recharts-curve.recharts-tooltip-cursor]:stroke-slate-800 [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-slate-200 dark:[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-slate-800 [&_.recharts-radial-bar-background-sector]:fill-slate-200 dark:[&_.recharts-radial-bar-background-sector]:fill-slate-800 [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-slate-200 dark:[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-slate-800 [&_.recharts-reference-line_[stroke='#ccc']]:stroke-slate-200 dark:[&_.recharts-reference-line_[stroke='#ccc']]:stroke-slate-800 flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const flatData = Array.from({ length: 15 }, (_, i) => ({ date: `J${i + 1}`, value: 0 }));

const sanitizeName = (name: string) => {
  return name
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "_")
    .toLowerCase();
};

export default function Stats4() {
  const { data: feedbackStats, changes } = useFeedbackStats();
  const { data: timeseriesData } = useFeedbackTimeseries(15);
  const { data: reclamationStats } = useQuery({
    queryKey: ['reclamations', 'stats', '30d'],
    queryFn: () => reclamationsApi.getStats('30d'),
  });
  const { data: reclamationsData } = useQuery({
    queryKey: ['reclamations', 'list-spark'],
    queryFn: () => reclamationsApi.getAll({ pageSize: 500 }),
  });

  // Sparkline feedbacks : depuis le vrai endpoint timeseries
  const feedbackSparkline = React.useMemo(() => {
    if (timeseriesData && timeseriesData.length > 0) {
      return timeseriesData.map((d, i) => ({ date: `J${i + 1}`, value: d.count }));
    }
    return flatData;
  }, [timeseriesData]);

  // Sparkline réclamations : depuis la liste
  const reclamationSparkline = React.useMemo(() => {
    const items = reclamationsData?.data ?? [];
    return Array.from({ length: 15 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (14 - i));
      return {
        date: `J${i + 1}`,
        value: items.filter((r) => new Date(r.createdAt).toDateString() === d.toDateString()).length,
      };
    });
  }, [reclamationsData]);

  const positive = feedbackStats?.bySentiment?.positive ?? 0;
  const totalFB = feedbackStats?.total ?? 0;
  const avgRating = feedbackStats?.averageRating ?? 0;
  const totalRCL = reclamationStats?.total ?? 0;
  const receivedRCL = reclamationStats?.byStatus?.received ?? 0;
  const resolvedRCL = reclamationStats?.byStatus?.resolved ?? 0;

  const summary = [
    {
      name: "Feedbacks",
      tickerSymbol: "FB",
      value: totalFB.toLocaleString('fr-FR'),
      change: `+${positive}`,
      percentageChange: avgRating ? `${avgRating.toFixed(1)}/5` : '—',
      changeType: "positive",
      sparkline: feedbackSparkline,
    },
    {
      name: "Satisfaction",
      tickerSymbol: "SAT",
      value: avgRating ? `${avgRating.toFixed(1)}/5` : '—',
      change: changes?.avgRating != null ? `${changes.avgRating > 0 ? '+' : ''}${changes.avgRating}` : '—',
      percentageChange: "—",
      changeType: "positive",
      sparkline: feedbackSparkline,
    },
    {
      name: "Réclamations",
      tickerSymbol: "RCL",
      value: totalRCL.toString(),
      change: `${receivedRCL} reçues`,
      percentageChange: resolvedRCL ? `${resolvedRCL} résolues` : '—',
      changeType: "positive",
      sparkline: reclamationSparkline,
    },
  ];

  return (
    <div className="w-full">
      <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full">
        {summary.map((item) => {
          const sanitizedName = sanitizeName(item.name);
          const gradientId = `gradient-${sanitizedName}`;

          // Utilise #3a5a40 pour positif, rouge pour négatif
          const color =
            item.changeType === "positive"
              ? "#3a5a40" // Ta couleur !
              : "#ef4444"; // Rouge

          return (
            <Card key={item.name} className="p-0 transition-all duration-200 hover:shadow-lg hover:shadow-primary-600/5">
              <CardContent className="p-4 pb-0">
                <div>
                  <dt className="text-sm font-medium text-slate-900 dark:text-white">
                    {item.name}{" "}
                    <span className="font-normal text-slate-600 dark:text-slate-400">
                      ({item.tickerSymbol})
                    </span>
                  </dt>
                  <div className="flex items-baseline justify-between">
                    <dd
                      className={cn(
                        item.changeType === "positive"
                          ? "text-primary-600 dark:text-primary-400"
                          : "text-red-600 dark:text-red-500",
                        "text-lg font-semibold"
                      )}
                    >
                      {item.value}
                    </dd>
                    <dd className="flex items-center space-x-1 text-sm">
                      <span className="font-medium text-slate-900 dark:text-white">
                        {item.change}
                      </span>
                      <span
                        className={cn(
                          item.changeType === "positive"
                            ? "text-primary-600 dark:text-primary-400"
                            : "text-red-600 dark:text-red-500"
                        )}
                      >
                        ({item.percentageChange})
                      </span>
                    </dd>
                  </div>
                </div>

                <div className="mt-2 h-16 overflow-hidden">
                  <ChartContainer
                    className="w-full h-full"
                    config={{
                      [item.name]: {
                        label: item.name,
                        color: color,
                      },
                    }}
                  >
                    <RechartsPrimitive.AreaChart data={item.sparkline || flatData}>
                      <defs>
                        <linearGradient
                          id={gradientId}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={color}
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor={color}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <RechartsPrimitive.XAxis dataKey="date" hide={true} />
                      <RechartsPrimitive.Area
                        dataKey="value"
                        stroke={color}
                        fill={`url(#${gradientId})`}
                        fillOpacity={0.4}
                        strokeWidth={1.5}
                        type="monotone"
                      />
                    </RechartsPrimitive.AreaChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </dl>
    </div>
  );
}
