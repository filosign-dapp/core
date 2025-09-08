import { useState } from "react"
import { cn } from "@/src/lib/utils"

interface SignatureOption {
    id: string
    signature: string
    initials: string
    style: string
}

interface SignatureOptionsProps {
    fullName: string
    initials: string
    onSelect: (signature: string, initials: string) => void
    selectedSignatureId?: string
}

// Generate different signature styles using actual handwritten fonts
const generateSignatureStyles = (fullName: string, initials: string): SignatureOption[] => {
    const styles = [
        {
            id: "typed",
            style: "typed",
            signature: fullName,
            initials: initials
        },
        {
            id: "caveat",
            style: "caveat",
            signature: fullName,
            initials: initials
        },
        {
            id: "gloria-hallelujah", 
            style: "gloria-hallelujah",
            signature: fullName,
            initials: initials
        },
        {
            id: "homemade-apple",
            style: "homemade-apple",
            signature: fullName,
            initials: initials
        },
        {
            id: "nothing-you-could-do",
            style: "nothing-you-could-do",
            signature: fullName,
            initials: initials
        },
        {
            id: "reenie-beanie",
            style: "reenie-beanie",
            signature: fullName,
            initials: initials
        },
        {
            id: "mr-dafoe",
            style: "mr-dafoe",
            signature: fullName,
            initials: initials
        }
    ]

    return styles
}

export default function SignatureOptions({ fullName, initials, onSelect, selectedSignatureId }: SignatureOptionsProps) {
    const [selectedId, setSelectedId] = useState<string | null>(selectedSignatureId || null)
    
    const signatureOptions = generateSignatureStyles(fullName, initials)

    const handleSelect = (option: SignatureOption) => {
        setSelectedId(option.id)
        onSelect(option.signature, option.initials)
    }

    const getSignatureStyle = (style: string) => {
        const baseClasses = "text-foreground"
        
        switch (style) {
            case "typed":
                return `${baseClasses} font-mono text-sm` // Typed is monospace
            case "caveat":
                return `${baseClasses} text-xl font-medium` // Caveat is casual and modern
            case "gloria-hallelujah":
                return `${baseClasses} text-lg` // Gloria Hallelujah is playful and casual
            case "homemade-apple":
                return `${baseClasses} text-xl` // Homemade Apple is handwritten and personal
            case "nothing-you-could-do":
                return `${baseClasses} text-lg` // Nothing You Could Do is casual and flowing
            case "reenie-beanie":
                return `${baseClasses} text-2xl` // Reenie Beanie is bold and handwritten
            case "mr-dafoe":
                return `${baseClasses} text-2xl` // Mr Dafoe is elegant and script-like
            default:
                return baseClasses
        }
    }

    const getInitialsStyle = (style: string) => {
        const baseClasses = "text-foreground"
        
        switch (style) {
            case "typed":
                return `${baseClasses} font-mono text-xs` // Typed initials
            case "caveat":
                return `${baseClasses} text-lg font-medium` // Caveat initials
            case "gloria-hallelujah":
                return `${baseClasses} text-base` // Gloria Hallelujah initials
            case "homemade-apple":
                return `${baseClasses} text-lg` // Homemade Apple initials
            case "nothing-you-could-do":
                return `${baseClasses} text-base` // Nothing You Could Do initials
            case "reenie-beanie":
                return `${baseClasses} text-xl` // Reenie Beanie initials
            case "mr-dafoe":
                return `${baseClasses} text-xl` // Mr Dafoe initials
            default:
                return baseClasses
        }
    }

    return (
        <div className="space-y-4">
            <p className="text-muted-foreground">Choose from pre-generated signature styles</p>
            
            <div className="grid gap-3 max-h-96 overflow-y-auto">
                {signatureOptions.map((option) => (
                    <div
                        key={option.id}
                        className={cn(
                            "flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/50",
                            selectedId === option.id 
                                ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                                : "border-border hover:border-primary/50"
                        )}
                        onClick={() => handleSelect(option)}
                    >
                        {/* Radio Button */}
                        <div className="flex-shrink-0">
                            <div className={cn(
                                "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                selectedId === option.id 
                                    ? "border-primary bg-primary" 
                                    : "border-muted-foreground"
                            )}>
                                {selectedId === option.id && (
                                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                                )}
                            </div>
                        </div>

                        {/* Signature Display */}
                        <div className="flex-1 min-w-0">
                            <div className="space-y-2">
                                <div className="text-xs text-muted-foreground">Signed by:</div>
                                <div 
                                    className={cn(
                                        getSignatureStyle(option.style),
                                        `font-${option.style}`
                                    )}
                                >
                                    {option.signature}
                                </div>
                            </div>
                        </div>

                        {/* Initials Display */}
                        <div className="flex-shrink-0 text-right">
                            <div className="space-y-2">
                                <div className="text-xs text-muted-foreground">DS</div>
                                <div 
                                    className={cn(
                                        getInitialsStyle(option.style),
                                        `font-${option.style}`
                                    )}
                                >
                                    {option.initials}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedId && (
                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                        Selected: {signatureOptions.find(opt => opt.id === selectedId)?.style.replace('-', ' ').toUpperCase()} style
                    </p>
                </div>
            )}
        </div>
    )
}
