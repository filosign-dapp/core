import * as React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import { XIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon, PrinterIcon, ArrowCounterClockwiseIcon, ArrowClockwiseIcon, DownloadIcon, MagnifyingGlassIcon, FileIcon } from "@phosphor-icons/react";
import { Button } from "../ui/button";
import { cn } from "../../utils";
import { Image } from "./Image";

interface FileViewerProps {
  fileId: string;
  fileName?: string;
  fileUrl?: string;
  fileType?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FileViewer({ fileId, fileName, fileUrl, fileType, open, onOpenChange }: FileViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 25, 200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 25, 50));
  }, []);

  const handleDownload = useCallback(() => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName || fileId;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [fileUrl, fileName, fileId]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onOpenChange]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  }, [onOpenChange]);

  const renderFileContent = () => {
    if (!fileUrl) {
      return (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground px-4 @md:px-6 text-center">
          <div className="flex flex-col items-center gap-3 @md:gap-4">
            <FileIcon className="size-12 @md:size-16 text-muted-foreground/50" />
            <div className="text-xs @md:text-sm">No file preview available</div>
          </div>
        </div>
      );
    }

    // Handle PDF files
    if (fileType?.toLowerCase().includes('pdf') || fileName?.toLowerCase().endsWith('.pdf') || fileUrl.includes('pdf')) {
      return (
        <>
          <object
            data={fileUrl}
            type="application/pdf"
            className="absolute inset-0 w-full h-full z-10"
          >
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground px-4 @md:px-6 text-center">
              <div className="flex flex-col items-center gap-3 @md:gap-4">
                <FileIcon className="size-12 @md:size-16 text-muted-foreground/50" />
                <div className="text-xs @md:text-sm">PDF preview not supported in this browser.</div>
                <Button onClick={handleDownload} variant="outline" size="sm" className="text-xs @md:text-sm">
                  <DownloadIcon className="size-3 @md:size-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </object>
        </>
      );
    }

    // Handle image files
    if (fileType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName || '')) {
      return (
        <Image
          src={fileUrl}
          alt={fileName || fileId}
          className="absolute inset-0 w-full h-full object-contain bg-card z-10"
          draggable={false}
        />
      );
    }

    // Handle other file types or fallback
    return (
      <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground px-4 @md:px-6 text-center">
        <div className="flex flex-col items-center gap-3 @md:gap-4">
          <FileIcon className="size-12 @md:size-16 text-muted-foreground/50" />
          <div className="text-xs @md:text-sm">Preview not available for this file type</div>
          <Button onClick={handleDownload} variant="outline" size="sm" className="text-xs @md:text-sm">
            <DownloadIcon className="size-3 @md:size-4 mr-2" />
            Download File
          </Button>
        </div>
      </div>
    );
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-foreground/90 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      {/* Responsive Navbar */}
      <div className="absolute top-0 left-0 right-0 z-50 px-4 py-3 @md:px-6 @md:py-4 glass border-b border-border flex-shrink-0">
        <div className="flex flex-col @md:flex-row @md:items-center @md:justify-between gap-3 @md:gap-0">
          {/* File name and close button row on mobile */}
          <div className="flex items-center justify-between @md:hidden">
            <h2 className="text-base font-semibold truncate text-primary-foreground max-w-[60%]">
              {fileName || `File Preview - ${fileId}`}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-primary-foreground hover:bg-primary/10 size-8 p-0"
            >
              <XIcon className="size-5" />
            </Button>
          </div>

          {/* Desktop header row */}
          <div className="hidden @md:block">
            <h2 className="text-lg font-semibold truncate text-primary-foreground">
              {fileName || `File Preview - ${fileId}`}
            </h2>
          </div>

          {/* Tools - responsive layout */}
          <div className="flex items-center justify-between @md:justify-end gap-2 @md:gap-0">
            {/* Mobile: Rotate tools */}
            <div className="flex items-center gap-1 @md:hidden">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary-foreground hover:bg-primary/10 size-8 p-0">
                <ArrowCounterClockwiseIcon className="size-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary-foreground hover:bg-primary/10 size-8 p-0">
                <ArrowClockwiseIcon className="size-4" />
              </Button>
            </div>

            {/* Zoom controls - always visible */}
            <div className="flex items-center gap-1 @md:gap-2">
              <Button variant="ghost" size="sm" onClick={handleZoomOut} className="text-muted-foreground hover:text-primary-foreground hover:bg-primary/10 size-8 p-0 @md:size-auto @md:p-2">
                <MagnifyingGlassMinusIcon className="size-4 @md:size-5" />
              </Button>
              <span className="text-sm font-medium min-w-[3rem] text-center text-primary-foreground hidden @sm:inline-block">{zoom}%</span>
              <span className="text-xs font-medium min-w-[2.5rem] text-center text-primary-foreground @sm:hidden">{zoom}%</span>
              <Button variant="ghost" size="sm" onClick={handleZoomIn} className="text-muted-foreground hover:text-primary-foreground hover:bg-primary/10 size-8 p-0 @md:size-auto @md:p-2">
                <MagnifyingGlassPlusIcon className="size-4 @md:size-5" />
              </Button>
            </div>

            <div className="w-px h-6 bg-border hidden @md:block mx-2" />

            {/* Desktop: Rotate tools */}
            <div className="hidden @md:flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary-foreground hover:bg-primary/10">
                <ArrowCounterClockwiseIcon className="size-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary-foreground hover:bg-primary/10">
                <ArrowClockwiseIcon className="size-5" />
              </Button>
            </div>

            <div className="w-px h-6 bg-border hidden @md:block mx-2" />

            {/* Action tools */}
            <div className="flex items-center gap-1 @md:gap-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary-foreground hover:bg-primary/10 size-8 p-0 @md:size-auto @md:p-2">
                <MagnifyingGlassIcon className="size-4 @md:size-5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handlePrint} className="text-muted-foreground hover:text-primary-foreground hover:bg-primary/10 size-8 p-0 @md:size-auto @md:p-2">
                <PrinterIcon className="size-4 @md:size-5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDownload} className="text-muted-foreground hover:text-primary-foreground hover:bg-primary/10 size-8 p-0 @md:size-auto @md:p-2">
                <DownloadIcon className="size-4 @md:size-5" />
              </Button>
            </div>

            <div className="w-px h-6 bg-border hidden @md:block mx-2" />

            {/* Desktop close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-primary-foreground hover:bg-primary/10 hidden @md:flex"
            >
              <XIcon className="size-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col h-screen pt-16 @md:pt-20 overflow-hidden">
        {/* Document Container */}
        <div
          ref={containerRef}
          className="overflow-auto bg-transparent flex items-center justify-center px-4 py-4 @md:px-8 @md:py-8 flex-1"
        >
          <div
            ref={documentRef}
            className="w-fit bg-card border shadow-2xl border-border
                       min-w-[320px] min-h-[480px]
                       @sm:min-w-[400px] @sm:min-h-[600px]
                       @md:min-w-[500px] @md:min-h-[700px]
                       @lg:min-w-[600px] @lg:min-h-[800px]
                       max-w-[95vw] max-h-[80vh]
                       rounded-lg overflow-hidden"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "center center"
            }}
          >
            {/* Document Page */}
            <div className="bg-card relative w-full h-full
                          min-w-[320px] min-h-[480px]
                          @sm:min-w-[400px] @sm:min-h-[600px]
                          @md:min-w-[500px] @md:min-h-[700px]
                          @lg:min-w-[600px] @lg:min-h-[800px]">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-20">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 @md:h-8 @md:w-8 border-b-2 border-primary"></div>
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                </div>
              )}
              {renderFileContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}