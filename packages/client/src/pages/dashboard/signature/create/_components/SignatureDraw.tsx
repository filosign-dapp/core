import { PaintBrushIcon, SignatureIcon, TextAaIcon, TrashIcon } from "@phosphor-icons/react"
import { Button } from "@/src/lib/components/ui/button"

interface SignatureDrawProps {
    signatureData: string | null
    initialsData: string | null
    onSignatureDialogOpen: () => void
    onInitialsDialogOpen: () => void
    onSignatureClear: () => void
    onInitialsClear: () => void
    onCreateSignature: () => void
}

export default function SignatureDraw({
    signatureData,
    initialsData,
    onSignatureDialogOpen,
    onInitialsDialogOpen,
    onSignatureClear,
    onInitialsClear,
    onCreateSignature
}: SignatureDrawProps) {
    return (
        <div className="space-y-4">
            <h4 className="text-muted-foreground">Draw Signature</h4>
            <div className="grid grid-cols-2 gap-4">
                {/* Signature drawing area */}
                <div className="space-y-3">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center min-h-[16rem] flex flex-col items-center justify-center bg-background">
                        {signatureData ? (
                            <div className="space-y-3">
                                <img
                                    src={signatureData}
                                    alt="Signature"
                                    className="max-w-full max-h-32 object-contain"
                                />
                                <div className="flex gap-2 justify-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onSignatureDialogOpen}
                                    >
                                        Edit Signature
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onSignatureClear}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <TrashIcon className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3 flex flex-col items-center justify-center">
                                <SignatureIcon className="size-16 text-muted-foreground" />
                                <Button
                                    variant="primary"
                                    onClick={onSignatureDialogOpen}
                                >
                                    <PaintBrushIcon className="size-4" weight="bold" />
                                    Draw Signature
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                {/* Initials drawing area */}
                <div className="space-y-3">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center min-h-[16rem] flex flex-col items-center justify-center bg-background">
                        {initialsData ? (
                            <div className="space-y-3">
                                <img
                                    src={initialsData}
                                    alt="Initials"
                                    className="max-w-full max-h-32 object-contain"
                                />
                                <div className="flex gap-2 justify-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onInitialsDialogOpen}
                                    >
                                        Edit Initials
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onInitialsClear}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <TrashIcon className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3 flex flex-col items-center justify-center">
                                <TextAaIcon className="size-16 text-muted-foreground" />
                                <Button
                                    variant="primary"
                                    onClick={onInitialsDialogOpen}
                                >
                                    <PaintBrushIcon className="size-4" weight="bold" />
                                    Draw Initials
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
                Exported File Format: PNG
            </p>

            <div className="flex justify-end mx-auto max-w-6xl w-full gap-4">
                <Button variant="ghost" size="lg">
                    <p className="hidden sm:block">Cancel</p>
                </Button>
                <Button variant="primary" size="lg" onClick={onCreateSignature}>
                    Save
                </Button>
            </div>
        </div>
    )
}
