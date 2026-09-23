'use client';

import { useCallback, useMemo, useState } from 'react';

export type SeriesPoint = { value: number; date: string };
export type MetricAccent = 'forest' | 'emerald' | 'rose' | 'amber' | 'blue' | 'neutral';
export type ChartView = 'curve' | 'bars';
export type MetricSeries = { name: string; data: SeriesPoint[]; accent?: MetricAccent };
export type ChartSeries = { name: string; data: SeriesPoint[]; color: string };

// Palette adaptée à #3a5a40
export const ACCENTS: Record<MetricAccent, { stroke: string; fill: string; text: string }> = {
  forest: { stroke: '#3a5a40', fill: '#3a5a4033', text: '#3a5a40' }, // Ta couleur !
  emerald: { stroke: '#10b981', fill: '#10b98133', text: '#10b981' },
  rose: { stroke: '#f43f5e', fill: '#f43f5e33', text: '#f43f5e' },
  amber: { stroke: '#f59e0b', fill: '#f59e0b33', text: '#f59e0b' },
  blue: { stroke: '#3b82f6', fill: '#3b82f633', text: '#3b82f6' },
  neutral: { stroke: '#64748b', fill: '#64748b33', text: '#64748b' },
};

export const SERIES_COLORS = [
  '#3a5a40', // Primary
  '#f17528', // Accent
  '#10b981',
  '#f59e0b',
  '#3b82f6',
  '#8b5cf6',
];

export function formatCompact(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toString();
}

interface MetricChartProps {
  series: ChartSeries[];
  view: ChartView;
  defaultIndex?: number;
  valueFormatter?: (value: number) => string;
  dateFormatter?: (date: string) => string;
}

export function MetricChart({
  series,
  view,
  defaultIndex = 0,
  valueFormatter = (n) => n.toLocaleString(),
  dateFormatter = (d) => d,
}: MetricChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const activeIndex = hoverIndex ?? defaultIndex;

  const primary = series[0];
  if (!primary?.data?.length) return null;

  const values = primary.data.map((d) => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const normalize = useCallback((v: number) => ((v - min) / range) * 100, [min, range]);

  const chartWidth = 100;
  const chartHeight = 100;
  const padding = { top: 5, bottom: 5 };
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const points = primary.data.map((d, i) => ({
    x: (i / (primary.data.length - 1)) * chartWidth,
    y: chartHeight - padding.bottom - normalize(d.value) * (innerHeight / 100),
  }));

  // Smooth curve path (Catmull-Rom spline)
  const curvePath = useMemo(() => {
    if (points.length < 2) return '';

    const tension = 0.5;
    let path = `M ${points[0].x},${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }

    return path;
  }, [points]);

  // Area fill path
  const areaPath = useMemo(() => {
    if (view !== 'curve') return '';
    return `${curvePath} L ${chartWidth},${chartHeight - padding.bottom} L 0,${chartHeight - padding.bottom} Z`;
  }, [curvePath, chartWidth, chartHeight, padding.bottom, view]);

  // Bars
  const bars = useMemo(() => {
    if (view !== 'bars') return [];
    const barWidth = chartWidth / primary.data.length * 0.7;
    return points.map((p, i) => ({
      x: p.x - barWidth / 2,
      y: p.y,
      width: barWidth,
      height: chartHeight - padding.bottom - p.y,
    }));
  }, [view, points, chartWidth, chartHeight, padding.bottom, primary.data.length]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * chartWidth;
      const closest = points.reduce((prev, curr, i) =>
        Math.abs(curr.x - x) < Math.abs(points[prev].x - x) ? i : prev,
      0);
      setHoverIndex(closest);
    },
    [points, chartWidth],
  );

  const handleMouseLeave = useCallback(() => {
    setHoverIndex(null);
  }, []);

  const activePoint = primary.data[activeIndex];

  return (
    <div className="relative h-full w-full">
      {/* Tooltip */}
      <div className="pointer-events-none absolute left-4 top-4 z-20 flex flex-col gap-1">
        {series.map((s) => {
          const point = s.data[activeIndex];
          return (
            <div key={s.name} className="flex items-center gap-2 text-[13px]">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              <span className="font-medium text-foreground">{valueFormatter(point.value)}</span>
              <span className="text-muted-foreground">{s.name}</span>
            </div>
          );
        })}
        <div className="mt-0.5 text-[11px] text-muted-foreground">
          {dateFormatter(activePoint.date)}
        </div>
      </div>

      {/* Chart */}
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="h-full w-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: 'crosshair' }}
      >
        {series.map((s, seriesIdx) => {
          const seriesPoints = s.data.map((d, i) => ({
            x: (i / (s.data.length - 1)) * chartWidth,
            y: chartHeight - padding.bottom - normalize(d.value) * (innerHeight / 100),
          }));

          const seriesCurve = (() => {
            if (seriesPoints.length < 2) return '';
            const tension = 0.5;
            let path = `M ${seriesPoints[0].x},${seriesPoints[0].y}`;
            for (let i = 0; i < seriesPoints.length - 1; i++) {
              const p0 = seriesPoints[Math.max(0, i - 1)];
              const p1 = seriesPoints[i];
              const p2 = seriesPoints[i + 1];
              const p3 = seriesPoints[Math.min(seriesPoints.length - 1, i + 2)];
              const cp1x = p1.x + (p2.x - p0.x) * tension;
              const cp1y = p1.y + (p2.y - p0.y) * tension;
              const cp2x = p2.x - (p3.x - p1.x) * tension;
              const cp2y = p2.y - (p3.y - p1.y) * tension;
              path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
            }
            return path;
          })();

          const seriesArea = `${seriesCurve} L ${chartWidth},${chartHeight - padding.bottom} L 0,${chartHeight - padding.bottom} Z`;

          return (
            <g key={s.name}>
              {view === 'curve' && (
                <>
                  {/* Area fill (only first series) */}
                  {seriesIdx === 0 && (
                    <path
                      d={seriesArea}
                      fill={`${s.color}33`}
                      className="transition-opacity duration-300"
                      style={{ opacity: hoverIndex !== null ? 0.8 : 1 }}
                    />
                  )}
                  {/* Stroke */}
                  <path
                    d={seriesCurve}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={seriesIdx === 0 ? 2 : 1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-opacity duration-300"
                    style={{ opacity: hoverIndex !== null ? 0.9 : 1 }}
                  />
                </>
              )}
              {view === 'bars' &&
                seriesIdx === 0 &&
                bars.map((bar, i) => (
                  <rect
                    key={i}
                    x={bar.x}
                    y={bar.y}
                    width={bar.width}
                    height={bar.height}
                    fill={i === activeIndex ? s.color : `${s.color}66`}
                    rx={1}
                    className="transition-all duration-150"
                  />
                ))}
            </g>
          );
        })}

        {/* Active point indicator */}
        {view === 'curve' && (
          <circle
            cx={points[activeIndex].x}
            cy={points[activeIndex].y}
            r={3}
            fill={series[0].color}
            stroke="white"
            strokeWidth={2}
            className="transition-all duration-150"
          />
        )}
      </svg>
    </div>
  );
}
