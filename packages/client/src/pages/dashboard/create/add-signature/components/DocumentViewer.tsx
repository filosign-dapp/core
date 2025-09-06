import { useState, useRef, useCallback, useEffect } from "react"
import { XIcon, CaretLeftIcon, CaretRightIcon, SignatureIcon, TextAaIcon, CalendarIcon, UserIcon, EnvelopeIcon, TextBIcon, CheckSquareIcon, FileIcon } from "@phosphor-icons/react"
import { Button } from "@/src/lib/components/ui/button"
import { cn } from "@/src/lib/utils/utils"
import { type SignatureField, type Document } from "../mock"

interface DocumentViewerProps {
    document: Document
    currentPage: number
    zoom: number
    signatureFields: SignatureField[]
    selectedField: string | null
    isPlacingField: boolean
    onFieldPlaced: (x: number, y: number) => void
    onFieldSelect: (fieldId: string) => void
    onFieldRemove: (fieldId: string) => void
    onFieldUpdate: (fieldId: string, updates: Partial<SignatureField>) => void
    onPageChange: (page: number) => void
}

export default function DocumentViewer({
    document,
    currentPage,
    zoom,
    signatureFields,
    selectedField,
    isPlacingField,
    onFieldPlaced,
    onFieldSelect,
    onFieldRemove,
    onFieldUpdate,
    onPageChange
}: DocumentViewerProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [draggedField, setDraggedField] = useState<string | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const documentRef = useRef<HTMLDivElement>(null)
    const dragDataRef = useRef({ 
        startX: 0, 
        startY: 0, 
        fieldX: 0, 
        fieldY: 0, 
        fieldId: '' 
    })
    const lastUpdateRef = useRef(0)

    const handlePreviousPage = () => {
        onPageChange(Math.max(1, currentPage - 1))
    }

    const handleNextPage = () => {
        onPageChange(Math.min(document.pages, currentPage + 1))
    }

    const handleDocumentClick = useCallback((event: React.MouseEvent) => {
        if (!isPlacingField) return

        const documentRect = documentRef.current?.getBoundingClientRect()
        if (!documentRect) return

        // Calculate position relative to the document, not the container
        const x = event.clientX - documentRect.left
        const y = event.clientY - documentRect.top

        // Ensure the field is placed within document bounds
        const boundedX = Math.max(10, Math.min(x, documentRect.width - 160))
        const boundedY = Math.max(10, Math.min(y, documentRect.height - 50))

        onFieldPlaced(boundedX, boundedY)
    }, [isPlacingField, onFieldPlaced])

    const handleFieldClick = (fieldId: string, event: React.MouseEvent) => {
        event.stopPropagation()
        onFieldSelect(fieldId)
    }

    const handleFieldMouseDown = (fieldId: string, event: React.MouseEvent) => {
        event.stopPropagation()
        
        const field = signatureFields.find(f => f.id === fieldId)
        if (!field) return
        
        // Store drag data in ref for immediate access
        dragDataRef.current = {
            startX: event.clientX,
            startY: event.clientY,
            fieldX: field.x,
            fieldY: field.y,
            fieldId: fieldId
        }
        
        setIsDragging(true)
        setDraggedField(fieldId)
        onFieldSelect(fieldId)
    }

    // Handle mouse move for dragging - optimized with refs and throttling
    const handleMouseMove = useCallback((event: MouseEvent) => {
        if (!isDragging) return

        // Throttle updates to 60fps for smooth performance
        const now = performance.now()
        if (now - lastUpdateRef.current < 16) return // ~60fps
        lastUpdateRef.current = now

        const documentRect = documentRef.current?.getBoundingClientRect()
        if (!documentRect) return

        const dragData = dragDataRef.current
        const deltaX = event.clientX - dragData.startX
        const deltaY = event.clientY - dragData.startY

        const newX = Math.max(10, Math.min(dragData.fieldX + deltaX, documentRect.width - 160))
        const newY = Math.max(10, Math.min(dragData.fieldY + deltaY, documentRect.height - 50))

        // Update field position directly
        onFieldUpdate(dragData.fieldId, { x: newX, y: newY })
    }, [isDragging, onFieldUpdate])

    const handleMouseUp = useCallback(() => {
        setIsDragging(false)
        setDraggedField(null)
        // Reset drag data
        dragDataRef.current = { startX: 0, startY: 0, fieldX: 0, fieldY: 0, fieldId: '' }
    }, [])

    // Add global mouse event listeners when dragging
    useEffect(() => {
        if (isDragging) {
            const handleGlobalMouseMove = (event: MouseEvent) => handleMouseMove(event)
            const handleGlobalMouseUp = () => handleMouseUp()
            
            window.addEventListener('mousemove', handleGlobalMouseMove)
            window.addEventListener('mouseup', handleGlobalMouseUp)
            return () => {
                window.removeEventListener('mousemove', handleGlobalMouseMove)
                window.removeEventListener('mouseup', handleGlobalMouseUp)
            }
        }
    }, [isDragging, handleMouseMove, handleMouseUp])

    // Local field configuration for icons and labels
    const fieldConfig = {
        signature: { icon: SignatureIcon, label: "Signature" },
        initial: { icon: TextAaIcon, label: "Initial" },
        date: { icon: CalendarIcon, label: "Date Signed" },
        name: { icon: UserIcon, label: "Name" },
        email: { icon: EnvelopeIcon, label: "Email" },
        text: { icon: TextBIcon, label: "Text" },
        checkbox: { icon: CheckSquareIcon, label: "Checkbox" }
    } as const

    const getFieldIcon = (type: SignatureField["type"]) => {
        const config = fieldConfig[type]
        const IconComponent = config?.icon || FileIcon
        return <IconComponent className="size-6" weight="fill" />
    }

    const getFieldLabel = (type: SignatureField["type"]) => {
        return fieldConfig[type]?.label || "Field"
    }

    return (
        <div className="flex flex-col flex-1">
            {/* Page Navigation */}
            <div className="flex justify-between items-center p-4 border-b border-border">
                <div className="flex gap-2 items-center">
                    <Button variant="ghost" size="sm" disabled={currentPage === 1} onClick={handlePreviousPage}>
                        <CaretLeftIcon className="w-4 h-4" weight="bold" />
                    </Button>
                    <span className="text-sm font-medium">
                        Page {currentPage} of {document.pages}
                    </span>
                    <Button variant="ghost" size="sm" disabled={currentPage === document.pages} onClick={handleNextPage}>
                        <CaretRightIcon className="w-4 h-4" weight="bold" />
                    </Button>
                </div>
                
                <div className="text-sm text-muted-foreground">
                    {signatureFields.length} field{signatureFields.length !== 1 ? 's' : ''} placed
                </div>
            </div>

            {/* Document Container */}
            <div 
                ref={containerRef}
                className="overflow-auto flex-1 p-8 bg-muted/20"
                style={{ cursor: isPlacingField ? "crosshair" : "default" }}
            >
                <div
                    ref={documentRef}
                    className="mx-auto w-fit bg-white border shadow-lg border-border"
                    style={{
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: "top left"
                    }}
                    onClick={handleDocumentClick}
                >
                    {/* Mock Document */}
                    <div className="w-[600px] h-[800px] bg-white border border-border relative">
                        {/* Document Content Placeholder */}
                        <div className="p-8 space-y-4">
                            <div className="mb-8 text-2xl font-bold text-center">
                                {document.name}
                            </div>
                            
                            <div className="space-y-4 text-sm">
                                <p>This is a sample document for signature placement.</p>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                                <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                            </div>

                            {/* Signature Fields */}
                            {signatureFields.map((field) => (
                                <div
                                    key={field.id}
                                    className={cn(
                                        "absolute border-2 border-dashed rounded-md bg-primary/5 hover:bg-primary/10 cursor-move select-none group",
                                        selectedField === field.id 
                                            ? "border-primary bg-primary/10 shadow-lg" 
                                            : "border-primary/50 hover:border-primary/70"
                                    )}
                                    style={{
                                        left: field.x,
                                        top: field.y,
                                        width: field.width,
                                        height: field.height
                                    }}
                                    onClick={(e) => handleFieldClick(field.id, e)}
                                    onMouseDown={(e) => handleFieldMouseDown(field.id, e)}
                                >
                                    <div className="flex justify-between items-center p-2 h-full">
                                        <div className="flex flex-1 gap-2 items-center">
                                            <span className="text-primary">{getFieldIcon(field.type)}</span>
                                            <span className="text-xs font-medium text-primary">
                                                {getFieldLabel(field.type)}
                                            </span>
                                        </div>
                                        
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="p-0 w-4 h-4 opacity-0 transition-opacity hover:bg-destructive/20 group-hover:opacity-100"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onFieldRemove(field.id)
                                            }}
                                        >
                                            <XIcon className="w-3 h-3" />
                                        </Button>
                                    </div>
                                    
                                    {/* Resize handle */}
                                    {selectedField === field.id && (
                                        <div className="absolute -right-1 -bottom-1 w-3 h-3 rounded-full border border-white opacity-0 bg-primary cursor-se-resize group-hover:opacity-100" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
