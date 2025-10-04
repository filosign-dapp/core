import { Input } from "@/src/lib/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/lib/components/ui/select";
import { Button } from "@/src/lib/components/ui/button";
import {
  FileTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  GridFourIcon,
  ListIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import DashboardLayout from "../../layout";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { getRootItems } from "./mock";
import FolderCard from "./_components/FolderCard";
import FileCard from "./_components/FileCard";
import { FileViewer } from "@/src/lib/components/custom/FileViewer";
import type { MockFolder, MockFile } from "./mock";

export default function DocumentAllPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [isViewSwitching, setIsViewSwitching] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const items = getRootItems();

  const handleViewModeChange = (newViewMode: "list" | "grid") => {
    if (newViewMode !== viewMode) {
      setIsViewSwitching(true);
      setViewMode(newViewMode);
      // Reset the switching state after animation completes
      setTimeout(() => {
        setIsViewSwitching(false);
      }, 300);
    }
  };

  const handleItemClick = (item: MockFolder | MockFile) => {
    if ("documentCount" in item) {
      // It's a folder, navigate to folder page
      navigate({
        to: "/dashboard/document/folder/$folderId",
        params: { folderId: item.id },
      });
    } else {
      // It's a file, open file viewer
      setSelectedFileId(item.id);
      setViewerOpen(true);
    }
  };

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
              <h2 className="text-lg font-medium text-foreground">
                All Documents ({items.length})
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
                      placeholder="Search documents..."
                      className="w-64 pl-10"
                      size="sm"
                    />
                  </div>

                  <Select>
                    <SelectTrigger className="w-full min-w-40" size="sm">
                      <SelectValue placeholder="Sender: All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="me">Me</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
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

                <Button
                  variant={isFilterOpen ? "default" : "outline"}
                  size="sm"
                  className="size-8 p-0"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <FunnelIcon className="size-4" />
                </Button>
              </motion.div>

              <div className="flex items-center gap-2 bg-card rounded-lg p-1">
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

          {/* Animated Filter Row */}
          <motion.div
            className="overflow-hidden border-b border-border"
            initial={false}
            animate={{
              height: isFilterOpen ? "auto" : 0,
              opacity: isFilterOpen ? 1 : 0,
            }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
              opacity: { duration: 0.2 },
            }}
          >
            <div className="px-8 py-4 bg-background/50 backdrop-blur-sm">
              <div className="flex flex-col gap-4 @md:flex-row @md:items-center">
                <div className="flex items-center gap-2">
                  <FunnelIcon className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Filters
                  </span>
                </div>

                <div className="flex flex-col gap-3 @md:flex-row @md:gap-4 @md:flex-1">
                  <Select>
                    <SelectTrigger
                      className="w-full @md:w-auto @md:min-w-40"
                      size="sm"
                    >
                      <SelectValue placeholder="Sender: All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="me">Me</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger
                      className="w-full @md:w-auto @md:min-w-40"
                      size="sm"
                    >
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
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.4 }}
                  className="space-y-4 text-center"
                >
                  <div className="size-40 mx-auto mb-6">
                    <FileTextIcon
                      className="size-full text-muted-foreground/50"
                      weight="light"
                    />
                  </div>
                  <h2 className="font-semibold text-foreground">
                    No documents
                  </h2>
                  <p className="max-w-md px-4 text-muted-foreground">
                    You have not yet created or received any documents. Get
                    started by creating a new envelope.
                  </p>
                  <Link to="/dashboard/envelope/create">
                    <Button variant="primary" className="gap-2">
                      <PlusIcon className="size-4" weight="bold" />
                      Create New Envelope
                    </Button>
                  </Link>
                </motion.div>
              </div>
            ) : (
              <>
                {/* Folders Section */}
                {(() => {
                  const folders = items.filter(
                    (item) => "documentCount" in item,
                  ) as MockFolder[];
                  const files = items.filter(
                    (item) => !("documentCount" in item),
                  ) as MockFile[];

                  return (
                    <>
                      {/* Folders */}
                      {folders.length > 0 && (
                        <motion.div
                          className="space-y-4"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: 0.4 }}
                        >
                          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            Folders ({folders.length})
                          </h3>
                          <div className="grid grid-cols-1 @xl:grid-cols-2 @2xl:grid-cols-3 @3xl:grid-cols-4 @5xl:grid-cols-5 gap-3">
                            {folders.map((folder) => (
                              <FolderCard
                                key={`folder-${folder.id}`}
                                folder={folder}
                                onClick={handleItemClick}
                                variant="grid"
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Files Section */}
                      {files.length > 0 && (
                        <motion.div
                          className="space-y-4"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: 0.5 }}
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
                                  onClick={handleItemClick}
                                  variant="list"
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 @xl:grid-cols-3 @2xl:grid-cols-4 @3xl:grid-cols-5 @5xl:grid-cols-5 gap-4">
                              {files.map((file) => (
                                <FileCard
                                  key={`file-${file.id}`}
                                  file={file}
                                  onClick={handleItemClick}
                                  variant="grid"
                                />
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </>
                  );
                })()}
              </>
            )}
          </motion.div>
        </div>
      </div>
      <FileViewer
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        fileId={selectedFileId || ""}
      />
    </DashboardLayout>
  );
}
