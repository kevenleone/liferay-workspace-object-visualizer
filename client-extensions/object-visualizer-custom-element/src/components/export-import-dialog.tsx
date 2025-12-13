import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Download, Upload, FileJson, Database, Table, Settings } from "lucide-react"

interface ExportImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportImportDialog({ open, onOpenChange }: ExportImportDialogProps) {
  const [exportFormat, setExportFormat] = useState("json")
  const [exportType, setExportType] = useState("data")
  const [selectedObjects, setSelectedObjects] = useState<string[]>(["Report", "Project"])
  const [importData, setImportData] = useState("")

  const mockObjects = ["Report", "Project", "Task", "User", "Organization", "Document", "Media", "Category"]

  const handleObjectToggle = (objectName: string) => {
    setSelectedObjects((prev) =>
      prev.includes(objectName) ? prev.filter((name) => name !== objectName) : [...prev, objectName],
    )
  }

  const handleExport = () => {
    // Mock export functionality
    const exportData = {
      type: exportType,
      format: exportFormat,
      objects: selectedObjects,
      timestamp: new Date().toISOString(),
      data: exportType === "data" ? "Mock data export..." : "Mock schema export...",
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `liferay-objects-${exportType}-${Date.now()}.${exportFormat}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    // Mock import functionality
    console.log("[v0] Import data:", importData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Export / Import Data & Definitions
          </DialogTitle>
          <DialogDescription>Export or import object data and schema definitions</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Export Type</Label>
                <Select value={exportType} onValueChange={setExportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="data">
                      <div className="flex items-center gap-2">
                        <Table className="h-4 w-4" />
                        Data Only
                      </div>
                    </SelectItem>
                    <SelectItem value="schema">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Schema Only
                      </div>
                    </SelectItem>
                    <SelectItem value="both">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Data + Schema
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">
                      <div className="flex items-center gap-2">
                        <FileJson className="h-4 w-4" />
                        JSON
                      </div>
                    </SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="xml">XML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Objects</Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                {mockObjects.map((object) => (
                  <div key={object} className="flex items-center space-x-2">
                    <Checkbox
                      id={object}
                      checked={selectedObjects.includes(object)}
                      onCheckedChange={() => handleObjectToggle(object)}
                    />
                    <Label htmlFor={object} className="text-sm font-normal">
                      {object}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleExport} className="bg-primary hover:bg-primary-dark">
                <Download className="h-4 w-4 mr-2" />
                Export ({selectedObjects.length} objects)
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <div className="space-y-2">
              <Label>Import Data</Label>
              <Textarea
                placeholder="Paste your JSON, CSV, or XML data here..."
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="validate" />
              <Label htmlFor="validate" className="text-sm">
                Validate data before import
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="backup" defaultChecked />
              <Label htmlFor="backup" className="text-sm">
                Create backup before import
              </Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={!importData.trim()}>
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
