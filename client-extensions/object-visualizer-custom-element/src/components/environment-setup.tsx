"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Database, Clock, TestTube, Eye, EyeOff } from "lucide-react"

interface Environment {
  id: string
  name: string
  host: string
  port: string
  username: string
  type: "production" | "staging" | "development" | "local"
  color: string
  lastUsed?: Date
  isDefault?: boolean
}

interface EnvironmentSetupProps {
  onEnvironmentSelect: (environmentId: string) => void
}

const mockEnvironments: Environment[] = [
  {
    id: "1",
    name: "Production Portal",
    host: "portal.company.com",
    port: "8080",
    username: "admin",
    type: "production",
    color: "#F44336",
    lastUsed: new Date(Date.now() - 1000 * 60 * 30),
    isDefault: true,
  },
  {
    id: "2",
    name: "Staging Environment",
    host: "staging.company.com",
    port: "8080",
    username: "test-admin",
    type: "staging",
    color: "#FF9800",
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "3",
    name: "Local Development",
    host: "localhost",
    port: "8080",
    username: "test@liferay.com",
    type: "local",
    color: "#4CAF50",
    lastUsed: new Date(Date.now() - 1000 * 60 * 5),
  },
]

const colorOptions = [
  "#9E9E9E",
  "#F44336",
  "#E91E63",
  "#9C27B0",
  "#673AB7",
  "#3F51B5",
  "#2196F3",
  "#03A9F4",
  "#00BCD4",
  "#009688",
  "#4CAF50",
  "#8BC34A",
  "#CDDC39",
  "#FFEB3B",
  "#FFC107",
  "#FF9800",
  "#FF5722",
]

export function EnvironmentSetup({ onEnvironmentSelect }: EnvironmentSetupProps) {
  const [savedEnvironments] = useState<Environment[]>(mockEnvironments.filter((env) => env.isDefault || env.lastUsed))
  const [recentEnvironments] = useState<Environment[]>(
    mockEnvironments.sort((a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0)),
  )
  const [showNewConnection, setShowNewConnection] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    host: "",
    port: "8080",
    username: "",
    password: "",
    type: "development" as Environment["type"],
    color: "#2196F3",
    savePassword: true,
    enableSSL: false,
  })

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours} hour${hours > 1 ? "s" : ""} ago`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days} day${days > 1 ? "s" : ""} ago`
    }
  }

  const getTypeColor = (type: Environment["type"]) => {
    switch (type) {
      case "production":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
      case "staging":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
      case "development":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
      case "local":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
    }
  }

  const handleConnect = (environmentId: string) => {
    onEnvironmentSelect(environmentId)
  }

  if (showNewConnection) {
    return (
      <div className="flex h-full">
        <div className="w-80 bg-surface border-r border-border-light flex flex-col h-full">
          <div className="p-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text-primary">Environments</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewConnection(false)}
                className="text-text-secondary"
              >
                Cancel
              </Button>
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary-dark text-white"
              onClick={() => setShowNewConnection(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Environment
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pt-0">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">SAVED</h3>
                  <Badge variant="secondary" className="text-xs">
                    {savedEnvironments.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {savedEnvironments.map((env) => (
                    <div
                      key={env.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-surface-secondary cursor-pointer"
                      onClick={() => handleConnect(env.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: env.color }} />
                        <div>
                          <div className="font-medium text-text-primary">{env.name}</div>
                          <div className="text-sm text-text-secondary">{env.host}</div>
                        </div>
                      </div>
                      <Badge className={getTypeColor(env.type)}>{env.type}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-text-primary">New Environment</h1>
              <Button
                variant="outline"
                className="text-primary border-primary hover:bg-primary hover:text-white bg-transparent"
              >
                Import from URL
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Environment Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="env-type">Environment Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: Environment["type"]) => setFormData((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="production">Production</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="local">Local</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="connection-mode">Connection Mode</Label>
                    <Select defaultValue="host-port">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="host-port">Host and Port</SelectItem>
                        <SelectItem value="url">Connection URL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="host">Host</Label>
                    <Input
                      id="host"
                      placeholder="localhost"
                      value={formData.host}
                      onChange={(e) => setFormData((prev) => ({ ...prev, host: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      placeholder="8080"
                      value={formData.port}
                      onChange={(e) => setFormData((prev) => ({ ...prev, port: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable-ssl"
                    checked={formData.enableSSL}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, enableSSL: checked }))}
                  />
                  <Label htmlFor="enable-ssl">Enable SSL</Label>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">User</Label>
                    <Input
                      id="username"
                      placeholder="admin@liferay.com"
                      value={formData.username}
                      onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-text-secondary" />
                        ) : (
                          <Eye className="h-4 w-4 text-text-secondary" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default-site">Default Site</Label>
                  <Input id="default-site" placeholder="Guest" defaultValue="Guest" />
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" className="text-text-secondary bg-transparent">
                    <TestTube className="w-4 h-4 mr-2" />
                    Test
                  </Button>
                  <Button className="bg-primary hover:bg-primary-dark text-white" onClick={() => handleConnect("new")}>
                    Connect
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary">Save Environment</h3>

                  <div className="space-y-2">
                    <Label htmlFor="env-name">Environment Name</Label>
                    <Input
                      id="env-name"
                      placeholder="My Liferay Portal"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="save-password"
                      checked={formData.savePassword}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, savePassword: !!checked }))}
                    />
                    <Label htmlFor="save-password">Save Passwords</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          className={`w-6 h-6 rounded-full border-2 ${
                            formData.color === color ? "border-text-primary" : "border-border"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData((prev) => ({ ...prev, color }))}
                        />
                      ))}
                    </div>
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary-dark text-white">Save</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      <div className="w-80 bg-surface border-r border-border-light flex flex-col h-full">
        <div className="p-4 flex-shrink-0">
          <h2 className="text-lg font-semibold text-text-primary mb-6">Environments</h2>

          <Button
            className="w-full bg-primary hover:bg-primary-dark text-white mb-6"
            onClick={() => setShowNewConnection(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Environment
          </Button>

          <Input placeholder="Filter" className="w-full" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 pt-0">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">SAVED</h3>
                <Badge variant="secondary" className="text-xs">
                  {savedEnvironments.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {savedEnvironments.map((env) => (
                  <div
                    key={env.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-surface-secondary cursor-pointer"
                    onClick={() => handleConnect(env.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: env.color }} />
                      <div>
                        <div className="font-medium text-text-primary">{env.name}</div>
                        <div className="text-sm text-text-secondary">{env.host}</div>
                      </div>
                    </div>
                    <Badge className={getTypeColor(env.type)}>{env.type}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">RECENT</h3>
                <Badge variant="secondary" className="text-xs">
                  {recentEnvironments.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {recentEnvironments.map((env) => (
                  <div
                    key={env.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-surface-secondary cursor-pointer"
                    onClick={() => handleConnect(env.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: env.color }} />
                      <div>
                        <div className="font-medium text-text-primary">{env.name}</div>
                        <div className="text-sm text-text-secondary flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {env.lastUsed && formatTimeAgo(env.lastUsed)}
                        </div>
                      </div>
                    </div>
                    <Badge className={getTypeColor(env.type)}>{env.type}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-surface-secondary">
        <div className="text-center space-y-4">
          <Database className="w-16 h-16 text-text-tertiary mx-auto" />
          <h2 className="text-xl font-semibold text-text-primary">Select an Environment</h2>
          <p className="text-text-secondary max-w-md">
            Choose a Liferay Portal environment from the sidebar to start browsing objects and data.
          </p>
          <Button className="bg-primary hover:bg-primary-dark text-white" onClick={() => setShowNewConnection(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Environment
          </Button>
        </div>
      </div>
    </div>
  )
}
