import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import { TrendingUp, BarChart3, PieChartIcon, Activity, Users, FileText } from "lucide-react"

interface DataVisualizationProps {
  objectName: string
}

// Mock analytics data
const mockAnalytics = {
  Report: {
    statusDistribution: [
      { name: "APPROVED", value: 15, fill: "hsl(var(--chart-1))" },
      { name: "PENDING", value: 8, fill: "hsl(var(--chart-2))" },
      { name: "REJECTED", value: 3, fill: "hsl(var(--chart-3))" },
    ],
    creationTrend: [
      { date: "2024-01-01", count: 2 },
      { date: "2024-01-02", count: 5 },
      { date: "2024-01-03", count: 3 },
      { date: "2024-01-04", count: 8 },
      { date: "2024-01-05", count: 6 },
      { date: "2024-01-06", count: 4 },
      { date: "2024-01-07", count: 7 },
    ],
    authorStats: [
      { author: "default-service-account", count: 12 },
      { author: "john.doe", count: 8 },
      { author: "jane.smith", count: 6 },
      { author: "bob.wilson", count: 4 },
    ],
    metrics: {
      total: 26,
      approved: 15,
      pending: 8,
      avgPerDay: 3.7,
    },
  },
  User: {
    statusDistribution: [
      { name: "Active", value: 1420, fill: "hsl(var(--chart-1))" },
      { name: "Inactive", value: 123, fill: "hsl(var(--chart-2))" },
    ],
    registrationTrend: [
      { date: "2023-12-01", count: 45 },
      { date: "2023-12-02", count: 52 },
      { date: "2023-12-03", count: 38 },
      { date: "2023-12-04", count: 61 },
      { date: "2023-12-05", count: 49 },
      { date: "2023-12-06", count: 43 },
      { date: "2023-12-07", count: 55 },
    ],
    metrics: {
      total: 1543,
      active: 1420,
      inactive: 123,
      avgPerDay: 51.4,
    },
  },
}

const chartConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--chart-1))",
  },
  approved: {
    label: "Approved",
    color: "hsl(var(--chart-1))",
  },
  pending: {
    label: "Pending",
    color: "hsl(var(--chart-2))",
  },
  rejected: {
    label: "Rejected",
    color: "hsl(var(--chart-3))",
  },
}

export function DataVisualization({ objectName }: DataVisualizationProps) {
  const analytics = mockAnalytics[objectName as keyof typeof mockAnalytics]

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No analytics available for {objectName}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.metrics.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{objectName === "Report" ? "Approved" : "Active"}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {objectName === "Report" ? analytics.metrics.approved : analytics.metrics.active}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                ((objectName === "Report" ? analytics.metrics.approved : analytics.metrics.active) /
                  analytics.metrics.total) *
                  100,
              )}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{objectName === "Report" ? "Pending" : "Inactive"}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {objectName === "Report" ? analytics.metrics.pending : analytics.metrics.inactive}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                ((objectName === "Report" ? analytics.metrics.pending : analytics.metrics.inactive) /
                  analytics.metrics.total) *
                  100,
              )}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.metrics.avgPerDay}</div>
            <p className="text-xs text-muted-foreground">entries per day</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="distribution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  {objectName === "Report" ? "Status Distribution" : "User Status"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-64">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={analytics.statusDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {analytics.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Status Legend */}
            <Card>
              <CardHeader>
                <CardTitle>Legend & Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.statusDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{item.value}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {Math.round((item.value / analytics.metrics.total) * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {objectName === "Report" ? "Creation Trend" : "Registration Trend"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-80">
                <LineChart data={objectName === "Report" ? analytics.creationTrend : analytics.registrationTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-1))" }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          {objectName === "Report" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Reports by Author
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <BarChart data={analytics.authorStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="author" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(var(--chart-1))" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {objectName === "User" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  User Activity Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Additional user analytics would be displayed here.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
