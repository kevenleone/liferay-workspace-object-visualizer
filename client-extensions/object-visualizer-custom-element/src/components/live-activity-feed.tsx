import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Activity, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Zap, TrendingUp, Clock, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface LiveActivity {
  id: string
  type: "create" | "update" | "delete"
  objectName: string
  entryId: number
  entryName: string
  author: string
  timestamp: Date
  details?: string
  status: "pending" | "success" | "error"
}

interface LiveActivityFeedProps {
  objectName?: string
}

// Simulate real-time activities with animated entries
const generateMockActivity = (): LiveActivity => {
  const types: Array<"create" | "update" | "delete"> = ["create", "update", "delete"]
  const type = types[Math.floor(Math.random() * types.length)]
  const objectNames = ["Report", "User", "Order", "Document", "Project"]
  const object = objectNames[Math.floor(Math.random() * objectNames.length)]

  return {
    id: `${Date.now()}-${Math.random()}`,
    type,
    objectName: object,
    entryId: Math.floor(Math.random() * 100000),
    entryName: `${object} #${Math.floor(Math.random() * 10000)}`,
    author: ["john.doe", "jane.smith", "admin", "system"][Math.floor(Math.random() * 4)],
    timestamp: new Date(),
    status: "success",
    details: type === "create" ? "New entry created" : type === "update" ? "Fields updated" : "Entry removed",
  }
}

const getActivityIcon = (type: "create" | "update" | "delete") => {
  switch (type) {
    case "create":
      return Plus
    case "update":
      return Edit2
    case "delete":
      return Trash2
    default:
      return Activity
  }
}

const getActivityColor = (type: "create" | "update" | "delete") => {
  switch (type) {
    case "create":
      return "text-green-600 bg-green-50"
    case "update":
      return "text-blue-600 bg-blue-50"
    case "delete":
      return "text-red-600 bg-red-50"
  }
}

const getActivityBadgeColor = (type: "create" | "update" | "delete") => {
  switch (type) {
    case "create":
      return "bg-green-100 text-green-800"
    case "update":
      return "bg-blue-100 text-blue-800"
    case "delete":
      return "bg-red-100 text-red-800"
  }
}

export function LiveActivityFeed({ objectName }: LiveActivityFeedProps) {
  const [activities, setActivities] = useState<LiveActivity[]>([])
  const [isLive, setIsLive] = useState(true)
  const [stats, setStats] = useState({ created: 0, updated: 0, deleted: 0 })

  // Simulate live activity stream
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(
      () => {
        const newActivity = generateMockActivity()

        // Filter by object name if specified
        if (objectName && newActivity.objectName !== objectName) {
          return
        }

        setActivities((prev) => [newActivity, ...prev].slice(0, 50))

        // Update stats
        setStats((prev) => ({
          ...prev,
          created: prev.created + (newActivity.type === "create" ? 1 : 0),
          updated: prev.updated + (newActivity.type === "update" ? 1 : 0),
          deleted: prev.deleted + (newActivity.type === "delete" ? 1 : 0),
        }))
      },
      Math.random() * 2000 + 1000,
    )

    return () => clearInterval(interval)
  }, [isLive, objectName])

  const clearHistory = useCallback(() => {
    setActivities([])
    setStats({ created: 0, updated: 0, deleted: 0 })
  }, [])

  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
            <Plus className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.created}</div>
            <p className="text-xs text-muted-foreground">New entries added</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Updated</CardTitle>
            <Edit2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.updated}</div>
            <p className="text-xs text-muted-foreground">Entries modified</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deleted</CardTitle>
            <Trash2 className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.deleted}</div>
            <p className="text-xs text-muted-foreground">Entries removed</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Zap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.created + stats.updated + stats.deleted}</div>
            <p className="text-xs text-muted-foreground">Operations monitored</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Activity Stream
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700">{isLive ? "Live" : "Paused"}</span>
              </div>
              <Switch checked={isLive} onCheckedChange={setIsLive} />
            </div>
            <Button variant="outline" size="sm" onClick={clearHistory}>
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2 pr-4">
              {activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <Activity className="h-12 w-12 mb-3 opacity-20" />
                  <p className="text-sm">Waiting for live data...</p>
                  <p className="text-xs mt-1">Enable live mode to see real-time updates</p>
                </div>
              ) : (
                activities.map((activity, index) => {
                  const ActivityIcon = getActivityIcon(activity.type)
                  const colorClass = getActivityColor(activity.type)
                  const badgeColorClass = getActivityBadgeColor(activity.type)

                  return (
                    <div
                      key={activity.id}
                      className="animate-in fade-in slide-in-from-top-2 duration-300"
                      style={{
                        animationDelay: `${index * 50}ms`,
                      }}
                    >
                      <div className={cn("rounded-lg border p-3 transition-all hover:shadow-md", colorClass)}>
                        <div className="flex items-start gap-3">
                          <div className={cn("p-2 rounded-lg", colorClass)}>
                            <ActivityIcon className="h-4 w-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm truncate">{activity.entryName}</span>
                              <Badge className={badgeColorClass} variant="outline">
                                {activity.type === "create"
                                  ? "Created"
                                  : activity.type === "update"
                                    ? "Updated"
                                    : "Deleted"}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <span>{activity.objectName}</span>
                              <span>•</span>
                              <span>ID: {activity.entryId}</span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                <span>{activity.author}</span>
                                <Clock className="h-3 w-3 ml-1" />
                                <span>
                                  {activity.timestamp.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  })}
                                </span>
                              </div>
                              {activity.status === "success" && (
                                <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
                              )}
                              {activity.status === "error" && (
                                <AlertCircle className="h-3 w-3 text-red-600 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Activity Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Activity Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="font-medium text-green-900 mb-1">Most Active Operation</div>
              <div className="text-2xl font-bold text-green-600">
                {stats.created >= stats.updated && stats.created >= stats.deleted
                  ? "Create"
                  : stats.updated >= stats.deleted
                    ? "Update"
                    : "Delete"}
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="font-medium text-blue-900 mb-1">Activity Rate</div>
              <div className="text-2xl font-bold text-blue-600">{isLive ? "~30/min" : "—"}</div>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="font-medium text-purple-900 mb-1">Live Status</div>
              <div className="text-sm text-purple-700">{isLive ? "✓ Monitoring active" : "⊘ Monitoring paused"}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
