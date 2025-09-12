import { useState, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { TrashIcon, UploadIcon } from "@phosphor-icons/react"
import { Button } from "@/src/lib/components/ui/button"
import { cn } from "@/src/lib/utils/utils"

const ACCEPTED_FILE_TYPES = ["image/gif", "image/jpeg", "image/png", "image/bmp"]
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

interface SignatureUploadProps {
    onFileUpload: (dataUrl: string) => void
    onFileClear: () => void
    title: string
    icon: React.ReactNode
    uploadedFile: string | null
}

export default function SignatureUpload({ onFileUpload, onFileClear, title, icon, uploadedFile }: SignatureUploadProps) {
    const [isDragOver, setIsDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [error, setError] = useState<string | null>(null)

    const handleFileSelect = useCallback((file: File | null) => {
        if (!file) return

        setError(null)

        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
            setError("Unsupported file format.")
            return
        }

        if (file.size > MAX_FILE_SIZE) {
            setError("File is too large (max 2MB).")
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            onFileUpload(reader.result as string)
        }
        reader.readAsDataURL(file)
    }, [onFileUpload])

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleFileSelect(event.target.files?.[0] || null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleUploadClick = () => {
        fileInputRef.current?.click()
    }

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault()
        setIsDragOver(true)
    }

    const handleDragLeave = (event: React.DragEvent) => {
        event.preventDefault()
        setIsDragOver(false)
    }

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault()
        setIsDragOver(false)
        handleFileSelect(event.dataTransfer.files?.[0] || null)
    }

    return (
        <div className="space-y-3">
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                className="hidden"
                accept={ACCEPTED_FILE_TYPES.join(",")}
            />
            <div
                className={cn(
                    "border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center min-h-[16rem] flex flex-col items-center justify-center transition-colors",
                    isDragOver ? "border-primary bg-primary/5" : "hover:border-muted-foreground/50",
                    uploadedFile && "p-4"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {uploadedFile ? (
                    <div className="space-y-3">
                        <img
                            src={uploadedFile}
                            alt="Uploaded preview"
                            className="max-w-full max-h-32 object-contain"
                        />
                        <div className="flex gap-2 justify-center">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleUploadClick}
                            >
                                Change
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onFileClear}
                                className="text-destructive hover:text-destructive"
                            >
                                <TrashIcon className="size-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 230, damping: 25 }}
                        className="space-y-3 flex flex-col items-center justify-center"
                    >
                        {icon}
                        <p className="text-sm text-muted-foreground">
                            {isDragOver ? "Drop your file here" : `Drop file here or`}
                        </p>
                        <Button
                            type="button"
                            variant="primary"
                            onClick={handleUploadClick}
                        >
                            <UploadIcon className="size-4 mr-2" weight="bold" />
                            {title}
                        </Button>
                    </motion.div>
                )}
            </div>
            {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
            )}
        </div>
    )
}
