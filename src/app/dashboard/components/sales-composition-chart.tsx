"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { salesData } from "@/lib/data";
import { SummaryTool } from "./summary-tool";

const chartConfig = {
  sales: {
    label: "Sales",
  },
  Mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-1))",
  },
  Desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-2))",
  },
  Tablet: {
    label: "Tablet",
    color: "hsl(var(--chart-3))",
  },
  Other: {
    label: "Other",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export function SalesCompositionChart() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Sales Composition</CardTitle>
          <CardDescription>Breakdown of sales by device type.</CardDescription>
        </div>
        <SummaryTool
          panelData={salesData}
          panelDescription="Sales data broken down by device type."
        />
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-full max-h-[300px]"
        >
          <PieChart>
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="name" />}
            />
            <Pie
              data={salesData}
              dataKey="sales"
              nameKey="name"
              innerRadius={50}
              strokeWidth={5}
              labelLine={false}
            >
              {salesData.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-translate-y-4 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
