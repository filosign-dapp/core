import { motion } from "motion/react";
import { FolderIcon } from "@phosphor-icons/react";
import type { MockFolder } from "../mock";

interface FolderCardProps {
  folder: MockFolder;
  onClick?: (folder: MockFolder) => void;
  variant?: "list" | "grid";
}

export default function FolderCard({
  folder,
  onClick,
  variant = "grid",
}: FolderCardProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleClick = () => {
    onClick?.(folder);
  };

  // Compact grid variant
  if (variant === "grid") {
    return (
      <motion.div
        className="flex-shrink-0 p-2 min-w-0 rounded-lg border transition-colors cursor-pointer group bg-card border-border hover:bg-accent/50"
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
        <div className="flex gap-2 items-center">
          <FolderIcon className="size-10 text-primary" weight="fill" />
          <div className="space-y-0.5">
            <h3
              className="text-xs font-medium truncate text-foreground max-w-24"
              title={folder.name}
            >
              {folder.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {folder.documentCount}{" "}
              {folder.documentCount === 1 ? "file" : "files"}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Compact list variant
  return (
    <motion.div
      className="flex flex-shrink-0 justify-between items-center p-2 min-w-0 rounded-lg border transition-colors cursor-pointer bg-background border-border hover:bg-accent/50"
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
      <div className="flex gap-2 items-center">
        <div className="p-1.5 bg-primary/10 rounded-lg">
          <FolderIcon className="size-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-medium truncate text-foreground">
            {folder.name}
          </h3>
          <p className="text-xs truncate text-muted-foreground">
            {folder.documentCount} {folder.documentCount === 1 ? "doc" : "docs"}{" "}
            • {formatDate(folder.createdAt)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
