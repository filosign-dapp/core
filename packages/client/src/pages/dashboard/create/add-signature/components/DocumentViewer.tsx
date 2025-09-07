import { useState, useRef, useCallback, useEffect } from "react"
import { XIcon, CaretLeftIcon, CaretRightIcon, SignatureIcon, TextAaIcon, CalendarIcon, UserIcon, EnvelopeIcon, TextBIcon, CheckSquareIcon, FileIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon, PrinterIcon, ArrowCounterClockwiseIcon, ArrowClockwiseIcon, FloppyDiskIcon } from "@phosphor-icons/react"
import { Button } from "@/src/lib/components/ui/button"
import { cn } from "@/src/lib/utils/utils"
import { type SignatureField, type Document } from "../mock"
import { Image } from "@/src/lib/components/custom/Image"

interface DocumentViewerProps {
    document: Document | null
    zoom: number
    signatureFields: SignatureField[]
    selectedField: string | null
    isPlacingField: boolean
    onFieldPlaced: (x: number, y: number) => void
    onFieldSelect: (fieldId: string) => void
    onFieldRemove: (fieldId: string) => void
    onFieldUpdate: (fieldId: string, updates: Partial<SignatureField>) => void
    onZoomChange: (zoom: number) => void
    onBack: () => void
}

export default function DocumentViewer({
    document,
    zoom,
    signatureFields,
    selectedField,
    isPlacingField,
    onFieldPlaced,
    onFieldSelect,
    onFieldRemove,
    onFieldUpdate,
    onZoomChange,
    onBack
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

    const handleDocumentClick = useCallback((event: React.MouseEvent) => {
        if (!isPlacingField) return

        const documentRect = documentRef.current?.getBoundingClientRect()
        if (!documentRect) return

        // Calculate position relative to the document, accounting for zoom
        const x = (event.clientX - documentRect.left) / (zoom / 100)
        const y = (event.clientY - documentRect.top) / (zoom / 100)

        // Ensure the field is placed within document bounds (600x800 is the document size)
        const boundedX = Math.max(10, Math.min(x, 500))
        const boundedY = Math.max(10, Math.min(y, 750))

        onFieldPlaced(boundedX, boundedY)
    }, [isPlacingField, onFieldPlaced, zoom])

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

        const now = performance.now()
        if (now - lastUpdateRef.current < 16) return
        lastUpdateRef.current = now

        const documentRect = documentRef.current?.getBoundingClientRect()
        if (!documentRect) return

        const dragData = dragDataRef.current
        const deltaX = (event.clientX - dragData.startX) / (zoom / 100)
        const deltaY = (event.clientY - dragData.startY) / (zoom / 100)

        const newX = Math.max(10, Math.min(dragData.fieldX + deltaX, 500))
        const newY = Math.max(10, Math.min(dragData.fieldY + deltaY, 750))

        onFieldUpdate(dragData.fieldId, { x: newX, y: newY })
    }, [isDragging, onFieldUpdate, zoom])

    const handleMouseUp = useCallback(() => {
        setIsDragging(false)
        setDraggedField(null)
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
            {/* Document Tools */}
            <div className="flex items-center justify-center gap-2 py-4 w-full border-b px-4 z-20">
                <Button variant="ghost" size="sm" onClick={onBack}>
                    <ArrowCounterClockwiseIcon className="size-5" />
                </Button>
                <Button variant="ghost" size="sm">
                    <ArrowClockwiseIcon className="size-5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onZoomChange(Math.max(zoom - 25, 50))}>
                    <MagnifyingGlassMinusIcon className="size-5" />
                </Button>
                <span className="text-sm font-medium min-w-[3rem] text-center">{zoom}%</span>
                <Button variant="ghost" size="sm" onClick={() => onZoomChange(Math.min(zoom + 25, 200))}>
                    <MagnifyingGlassPlusIcon className="size-5" />
                </Button>
                <Button variant="ghost" size="sm">
                    <PrinterIcon className="size-5" />
                </Button>
            </div>

            {/* Document Container */}
            <div
                ref={containerRef}
                className={cn(
                    "overflow-auto bg-muted/10 flex items-start justify-center px-8 py-8 flex-1",
                    isPlacingField ? "cursor-crosshair" : "cursor-default"
                )}
            >
                <div
                    ref={documentRef}
                    className="w-fit bg-white border shadow-lg border-border"
                    style={{
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: "top left"
                    }}
                >
                    {/* Document Page */}
                    <div className="w-[300px] md:w-[600px] aspect-[3/4] bg-white relative">
                        {/* Render uploaded PDF or image if provided */}
                        {document?.url ? (
                            (document.url.startsWith("data:application/pdf") || document.name?.toLowerCase().endsWith(".pdf")) ? (
                                <>
                                    <object
                                        data={document.url}
                                        type="application/pdf"
                                        className="absolute inset-0 w-full h-full pointer-events-none"
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground px-6 text-center">
                                            PDF preview not supported in this browser.
                                        </div>
                                    </object>
                                    <div
                                        className={cn(
                                            "absolute inset-0 w-full h-full pointer-events-auto",
                                            isPlacingField ? "cursor-crosshair bg-blue-500/5" : "cursor-default bg-transparent"
                                        )}
                                        onClick={handleDocumentClick}
                                    />
                                </>
                            ) : (
                                <Image
                                    src={document.url}
                                    alt={document.name}
                                    className="absolute inset-0 w-full h-full object-contain bg-white"
                                    draggable={false}
                                    onClick={handleDocumentClick}
                                />
                            )
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground px-6 text-center">
                                No document preview available
                            </div>
                        )}

                        {/* Signature Fields */}
                        {signatureFields.map((field) => (
                            <div
                                key={field.id}
                                className={cn(
                                    "absolute border-2 border-dashed rounded-md bg-primary/5 hover:bg-primary/10 cursor-move select-none group inline-flex items-center gap-2 p-2",
                                    selectedField === field.id
                                        ? "border-primary bg-primary/10 shadow-lg"
                                        : "border-primary/50 hover-border-primary/70"
                                )}
                                style={{
                                    left: field.x,
                                    top: field.y,
                                    height: field.height
                                }}
                                onClick={(e) => handleFieldClick(field.id, e)}
                                onMouseDown={(e) => handleFieldMouseDown(field.id, e)}
                            >
                                <span className="text-primary">{getFieldIcon(field.type)}</span>
                                <span className="text-xs font-medium text-primary whitespace-nowrap">
                                    {getFieldLabel(field.type)}
                                </span>
                                <button
                                    type="button"
                                    className="p-0 w-4 h-4"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onFieldRemove(field.id)
                                    }}
                                >
                                    <XIcon className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
