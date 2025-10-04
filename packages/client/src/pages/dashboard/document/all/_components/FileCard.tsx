import { motion } from "motion/react";
import {
  FileIcon,
  FilePdfIcon,
  FileImageIcon,
  FileTextIcon,
  DotsThreeVertical,
  DotsThreeVerticalIcon,
} from "@phosphor-icons/react";
import { cn } from "@/src/lib/utils/utils";
import type { MockFile } from "../mock";
import { Image } from "@/src/lib/components/custom/Image";
import { Button } from "@/src/lib/components/ui/button";

interface FileCardProps {
  file: MockFile;
  onClick?: (file: MockFile) => void;
  variant?: "list" | "grid";
}

const getFileIcon = (fileType: string) => {
  if (fileType.includes("pdf")) return FilePdfIcon;
  if (
    fileType.includes("image") ||
    fileType.includes("jpg") ||
    fileType.includes("jpeg") ||
    fileType.includes("png") ||
    fileType.includes("gif")
  )
    return FileImageIcon;
  if (fileType.includes("text") || fileType.includes("txt"))
    return FileTextIcon;
  return FileIcon;
};

const getFileTypeColor = (fileType: string) => {
  if (fileType.includes("pdf")) return "text-red-500";
  if (fileType.includes("image")) return "text-green-500";
  if (fileType.includes("text")) return "text-gray-500";
  return "text-primary";
};

export default function FileCard({
  file,
  onClick,
  variant = "grid",
}: FileCardProps) {
  const FileIconComponent = getFileIcon(file.type);
  const iconColor = getFileTypeColor(file.type);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleClick = () => {
    onClick?.(file);
  };

  const isImage = file.type.includes("image");
  const shouldShowPreview = isImage && file.dataUrl;

  // Grid variant
  if (variant === "grid") {
    return (
      <motion.div
        className="group bg-background border rounded-lg p-3 hover:bg-accent/50 transition-colors cursor-pointer"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 230,
          damping: 25,
          duration: 0.3,
        }}
        onClick={handleClick}
      >
        {/* Preview/Icon */}
        <div className="aspect-square mb-3 bg-card rounded-lg flex items-center justify-center">
          {shouldShowPreview ? (
            <Image
              src={file.dataUrl}
              alt={file.name}
              className="w-full h-full object-cover object-top rounded-lg"
            />
          ) : (
            <FileIconComponent className={cn("size-12", iconColor)} />
          )}
        </div>

        {/* File info */}
        <div className="space-y-1">
          <p className="text-sm font-medium truncate" title={file.name}>
            {file.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(file.createdAt)}
          </p>
        </div>
      </motion.div>
    );
  }

  // List variant
  return (
    <motion.div
      className="flex items-center justify-between p-3 bg-background border border-border rounded-lg hover:bg-muted/20 transition-colors cursor-pointer"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        type: "spring",
        stiffness: 230,
        damping: 25,
        duration: 0.3,
      }}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          {shouldShowPreview ? (
            <Image
              src={file.dataUrl}
              alt={file.name}
              className="size-10 object-cover object-top rounded-lg"
              width={200}
              height={200}
            />
          ) : (
            <div className="p-2 bg-muted/20 rounded-lg">
              <FileIconComponent className={cn("size-6", iconColor)} />
            </div>
          )}
          <div>
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(file.size)} • {formatDate(file.createdAt)}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <DotsThreeVerticalIcon className="size-5" />
        </Button>
      </div>
    </motion.div>
  );
}
