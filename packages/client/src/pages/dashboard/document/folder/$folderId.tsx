import { Input } from "@/src/lib/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/lib/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/src/lib/components/ui/popover"
import { Button } from "@/src/lib/components/ui/button"
import {
  FileTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  GridFourIcon,
  ListIcon,
  ArrowLeftIcon,
  CaretLeftIcon,
} from "@phosphor-icons/react"
import { motion } from "motion/react"
import DashboardLayout from "../../layout"
import { Link, useParams } from "@tanstack/react-router"
import { useState } from "react"
import { getFilesInFolder, getFolderById } from "../all/mock"
import FileCard from "../all/_components/FileCard"
import { FileViewer } from "@/src/lib/components/custom/FileViewer"
import type { MockFile } from "../all/mock"

export default function DocumentFolderPage() {
  const { folderId } = useParams({ from: '/dashboard/document/folder/$folderId' })
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid")
  const [isViewSwitching, setIsViewSwitching] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)

  const folder = getFolderById(folderId!)
  const files = getFilesInFolder(folderId!)

  const handleViewModeChange = (newViewMode: "list" | "grid") => {
    if (newViewMode !== viewMode) {
      setIsViewSwitching(true)
      setViewMode(newViewMode)
      // Reset the switching state after animation completes
      setTimeout(() => {
        setIsViewSwitching(false)
      }, 300)
    }
  }

  const handleFileClick = (file: MockFile) => {
    setSelectedFileId(file.id)
    setViewerOpen(true)
  }

  if (!folder) {
    return (
      <DashboardLayout>
        <div className="flex flex-col h-full rounded-tl-2xl bg-background @container">
          <div className="flex flex-1 flex-col items-center justify-center">
            <h2 className="text-lg font-medium text-foreground">Folder not found</h2>
            <Link to="/dashboard/document/all">
              <Button variant="outline" className="mt-4">
                Back to All Documents
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full rounded-tl-2xl bg-background @container">
        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          {/* Header with view mode toggle */}
          <motion.div
            className="flex items-center justify-between px-8 py-4 border-b border-border"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
          >
            <div className="flex items-center gap-4">
              <Link to="/dashboard/document/all">
                <Button variant="ghost" size="sm" className="gap-2">
                  <CaretLeftIcon className="size-4" />
                  Back
                </Button>
              </Link>
              <h2 className="text-lg font-medium text-foreground">
                {folder.name} ({files.length} files)
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <motion.div
                className="flex items-center justify-between"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <div className="hidden w-full max-w-2xl gap-4 @5xl:flex">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute transform -translate-y-1/2 left-3 top-1/2 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Search files..."
                      className="w-64 pl-10"
                      size="sm"
                    />
                  </div>

                  <Select>
                    <SelectTrigger className="w-full min-w-40" size="sm">
                      <SelectValue placeholder="Type: All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="image">Images</SelectItem>
                      <SelectItem value="text">Text Files</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger className="w-full min-w-40" size="sm">
                      <SelectValue placeholder="All Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="@5xl:hidden">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        <FunnelIcon className="size-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="mt-2 w-80" align="end">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium leading-none text-md text-foreground">Filters</h3>
                          <p className="mt-2 text-sm text-muted-foreground">Select at least one filter</p>
                        </div>

                        <Select>
                          <SelectTrigger className="w-full" size="sm">
                            <SelectValue placeholder="Type: All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="image">Images</SelectItem>
                            <SelectItem value="text">Text Files</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select>
                          <SelectTrigger className="w-full" size="sm">
                            <SelectValue placeholder="All Time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </motion.div>

              <div className="flex items-center gap-2 bg-muted/20 rounded-lg p-1">
                <Button
                  type="button"
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleViewModeChange("grid")}
                  className="h-7 w-7 p-0"
                >
                  <GridFourIcon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleViewModeChange("list")}
                  className="h-7 w-7 p-0"
                >
                  <ListIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            className="flex-1 p-8 space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.3 }}
          >
            {files.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.4 }}
                  className="space-y-4 text-center"
                >
                  <div className="size-40 mx-auto mb-6">
                    <FileTextIcon className="size-full text-muted-foreground/50" weight="light" />
                  </div>
                  <h2 className="font-semibold text-foreground">No files in this folder</h2>
                  <p className="max-w-md px-4 text-muted-foreground">
                    This folder is empty. Upload some documents to get started.
                  </p>
                </motion.div>
              </div>
            ) : (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.4 }}
              >
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Files ({files.length})
                </h3>
                {viewMode === "list" ? (
                  <div className="space-y-2">
                    {files.map((file) => (
                      <FileCard
                        key={`file-${file.id}`}
                        file={file}
                        onClick={handleFileClick}
                        variant="list"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {files.map((file) => (
                      <FileCard
                        key={`file-${file.id}`}
                        file={file}
                        onClick={handleFileClick}
                        variant="grid"
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
      <FileViewer
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        fileId={selectedFileId || ''}
      />
    </DashboardLayout>
  )
}