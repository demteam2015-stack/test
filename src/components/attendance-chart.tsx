"use client"

import { Pie, PieChart, ResponsiveContainer, Cell, Legend } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"

interface AttendanceChartProps {
  data: {
    present: number;
    absent: number;
    excused: number;
  };
}

const chartData = (data: AttendanceChartProps['data']) => [
  { name: "Присутствовал", value: data.present, fill: "hsl(var(--chart-1))" },
  { name: "Отсутствовал", value: data.absent, fill: "hsl(var(--chart-3))" },
  { name: "Уваж. причина", value: data.excused, fill: "hsl(var(--chart-5))" },
];

export function AttendanceChart({ data }: AttendanceChartProps) {
  const chartConfig = {
    present: { label: "Присутствовал", color: "hsl(var(--chart-1))" },
    absent: { label: "Отсутствовал", color: "hsl(var(--chart-3))" },
    excused: { label: "Уваж. причина", color: "hsl(var(--chart-5))" },
  }

  const total = data.present + data.absent + data.excused;
  if (total === 0) return null;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Диаграмма посещаемости</CardTitle>
        <CardDescription>Соотношение всех отмеченных тренировок</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[250px]"
        >
          <ResponsiveContainer>
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData(data)}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
              >
                 {chartData(data).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                 ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
