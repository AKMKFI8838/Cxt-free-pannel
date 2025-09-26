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
  ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { subscribersData } from "@/lib/data";
import { SummaryTool } from "./summary-tool";

const chartConfig: ChartConfig = {
  subscribers: {
    label: "Subscribers",
    color: "hsl(var(--chart-2))",
  },
};

export function SubscribersChart() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>New Subscribers</CardTitle>
          <CardDescription>
            Growth in your subscriber base over time.
          </CardDescription>
        </div>
        <SummaryTool
          panelData={subscribersData}
          panelDescription="New subscribers per month."
        />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={subscribersData}>
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar
              dataKey="subscribers"
              fill="hsl(var(--chart-2))"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
