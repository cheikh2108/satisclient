"use client";

import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as RechartsPrimitive from "recharts";
import { ExternalLink } from "lucide-react";

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

// Données SatisClient avec #3a5a40
const data = [
  { date: "18 Mar", Feedbacks: 100, NPS: 64, Réclamations: 45 },
  { date: "21 Mar", Feedbacks: 115, NPS: 66, Réclamations: 42 },
  { date: "24 Mar", Feedbacks: 120, NPS: 68, Réclamations: 38 },
  { date: "27 Mar", Feedbacks: 110, NPS: 67, Réclamations: 40 },
  { date: "30 Mar", Feedbacks: 178, NPS: 70, Réclamations: 35 },
  { date: "02 Apr", Feedbacks: 180, NPS: 71, Réclamations: 32 },
  { date: "05 Apr", Feedbacks: 205, NPS: 73, Réclamations: 30 },
  { date: "08 Apr", Feedbacks: 185, NPS: 72, Réclamations: 28 },
  { date: "11 Apr", Feedbacks: 180, NPS: 74, Réclamations: 26 },
  { date: "14 Apr", Feedbacks: 183, NPS: 75, Réclamations: 24 },
  { date: "17 Apr", Feedbacks: 185, NPS: 73, Réclamations: 23 },
  { date: "20 Apr", Feedbacks: 185, NPS: 76, Réclamations: 21 },
  { date: "23 Apr", Feedbacks: 166, NPS: 74, Réclamations: 22 },
  { date: "26 Apr", Feedbacks: 181, NPS: 77, Réclamations: 20 },
  { date: "29 Apr", Feedbacks: 168, NPS: 75, Réclamations: 19 },
];

const summary = [
  {
    name: "Feedbacks",
    tickerSymbol: "FB",
    value: "3,150",
    change: "+420",
    percentageChange: "+15.4%",
    changeType: "positive",
  },
  {
    name: "NPS",
    tickerSymbol: "NPS",
    value: "75",
    change: "+11",
    percentageChange: "+17.2%",
    changeType: "positive",
  },
  {
    name: "Réclamations",
    tickerSymbol: "RCL",
    value: "19",
    change: "-26",
    percentageChange: "-57.8%",
    changeType: "positive", // Baisse = positif pour réclamations !
  },
];

const sanitizeName = (name: string) => {
  return name
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "_")
    .toLowerCase();
};

export default function Stats4() {
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
                    <RechartsPrimitive.AreaChart data={data}>
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
                        dataKey={item.name}
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
