"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const STATUS_COLORS = {
  TODO: "#94a3b8", // slate-400
  IN_PROGRESS: "#3b82f6", // blue-500
  IN_REVIEW: "#a855f7", // purple-500
  DONE: "#22c55e", // green-500
};

const PRIORITY_COLORS = {
  LOW: "#2dd4bf", // teal-400
  MEDIUM: "#fbbf24", // amber-400
  HIGH: "#f97316", // orange-500
  URGENT: "#ef4444", // red-500
};

export function IssueCharts({ 
  statusData, 
  priorityData 
}: { 
  statusData: { status: string; count: number }[];
  priorityData: { priority: string; count: number }[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {/* Status Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Issues by Status</CardTitle>
          <CardDescription>Current workflow distribution across all sprints.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="status" className="text-xs" tick={{ fill: 'currentColor' }} />
              <YAxis className="text-xs" tick={{ fill: 'currentColor' }} allowDecimals={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.1)' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.TODO} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Priority Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Issues by Priority</CardTitle>
          <CardDescription>Breakdown of task urgency in this project.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="count"
                nameKey="priority"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.LOW} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}