import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { cn } from "@/src/lib/utils/utils"
import Header from "./components/Header"
import SignatureFieldsSidebar from "./components/SignatureFieldsSidebar"
import DocumentViewer from "./components/DocumentViewer"
import MobileSignatureToolbar from "./components/MobileSignatureToolbar"
import { mockDocuments, fieldTypeConfigs, type SignatureField, type Document } from "./mock"

export default function AddSignaturePage() {
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState(1)
    const [zoom, setZoom] = useState(100)
    const [signatureFields, setSignatureFields] = useState<SignatureField[]>([])
    const [selectedField, setSelectedField] = useState<string | null>(null)
    const [isPlacingField, setIsPlacingField] = useState(false)
    const [pendingFieldType, setPendingFieldType] = useState<SignatureField["type"] | null>(null)

    const currentDocument = mockDocuments[0]

    // Local utility function for generating unique IDs
    const generateFieldId = () => Math.random().toString(36).substr(2, 9)

    const handleAddField = (fieldType: SignatureField["type"]) => {
        setPendingFieldType(fieldType)
        setIsPlacingField(true)
        setSelectedField(null) // Clear any selected field when starting to place a new one
    }

    const handleFieldPlaced = (x: number, y: number) => {
        if (!pendingFieldType) return

        const fieldConfig = fieldTypeConfigs.find(config => config.type === pendingFieldType)
        if (!fieldConfig) return

        const newField: SignatureField = {
            id: generateFieldId(),
            type: pendingFieldType,
            x,
            y,
            width: fieldConfig.defaultWidth,
            height: fieldConfig.defaultHeight,
            page: currentPage,
            required: true,
            label: fieldConfig.label
        }

        setSignatureFields(prev => [...prev, newField])
        setIsPlacingField(false)
        setPendingFieldType(null)
    }

    const handleFieldSelect = (fieldId: string) => {
        setSelectedField(fieldId)
    }

    const handleFieldRemove = (fieldId: string) => {
        setSignatureFields(prev => prev.filter(field => field.id !== fieldId))
        if (selectedField === fieldId) {
            setSelectedField(null)
        }
    }

    const handleFieldUpdate = (fieldId: string, updates: Partial<SignatureField>) => {
        setSignatureFields(prev => prev.map(field =>
            field.id === fieldId ? { ...field, ...updates } : field
        ))
    }

    const handleBack = () => {
        navigate({ to: "/dashboard/create" })
    }

    const handleSend = () => {
        // Handle sending the envelope with signatures
        console.log("Sending envelope with fields:", signatureFields)
        navigate({ to: "/dashboard" })
    }

    const currentPageFields = signatureFields.filter(field => field.page === currentPage)

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header 
                zoom={zoom}
                onZoomChange={setZoom}
                onBack={handleBack}
                onSend={handleSend}
            />

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Signature Fields */}
                <aside className="hidden lg:block w-64 border-r border-border bg-muted/5">
                    <SignatureFieldsSidebar
                        onAddField={handleAddField}
                        isPlacingField={isPlacingField}
                        pendingFieldType={pendingFieldType}
                    />
                </aside>

                {/* Document Viewer */}
                <main className="flex-1 flex flex-col">
                    <DocumentViewer
                        document={currentDocument}
                        currentPage={currentPage}
                        zoom={zoom}
                        signatureFields={currentPageFields}
                        selectedField={selectedField}
                        isPlacingField={isPlacingField}
                        onFieldPlaced={handleFieldPlaced}
                        onFieldSelect={handleFieldSelect}
                        onFieldRemove={handleFieldRemove}
                        onFieldUpdate={handleFieldUpdate}
                        onPageChange={setCurrentPage}
                    />
                </main>

                {/* Right Sidebar - Document Thumbnails */}
                <aside className="hidden lg:block w-48 border-l border-border bg-muted/5 p-4">
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Pages</h4>
                        {Array.from({ length: currentDocument.pages }, (_, i) => (
                            <div
                                key={i + 1}
                                className={cn(
                                    "aspect-[3/4] bg-muted rounded border-2 cursor-pointer transition-colors",
                                    currentPage === i + 1
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-muted-foreground/50"
                                )}
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                <div className="p-2 text-xs text-center">
                                    Page {i + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>

            {/* Mobile Signature Toolbar */}
            <MobileSignatureToolbar
                onAddField={handleAddField}
                isPlacingField={isPlacingField}
                pendingFieldType={pendingFieldType}
            />
        </div>
    )
}
