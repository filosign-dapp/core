import { useState } from "react"
import { PaintBrushIcon, PaletteIcon, SignatureIcon, TextAaIcon, UploadSimpleIcon, XIcon, TrashIcon } from "@phosphor-icons/react"
import { Button } from "@/src/lib/components/ui/button"
import { Input } from "@/src/lib/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/lib/components/ui/tabs"
import Logo from "@/src/lib/components/custom/Logo"
import SignatureDialog from "./_components/SignatureDialog"
import SignatureOptions from "./_components/SignatureOptions"
import { Image } from "@/src/lib/components/custom/Image"

export default function CreateNewSignaturePage() {
    const [fullName, setFullName] = useState("Kartikay Tiwari")
    const [initials, setInitials] = useState("KT")

    // Dialog states
    const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false)
    const [isInitialsDialogOpen, setIsInitialsDialogOpen] = useState(false)

    // Signature data
    const [signatureData, setSignatureData] = useState<string | null>(null)
    const [initialsData, setInitialsData] = useState<string | null>(null)
    
    // Selected signature from options
    const [selectedSignatureId, setSelectedSignatureId] = useState<string | null>(null)

    // Handle signature save
    const handleSignatureSave = (data: string) => {
        setSignatureData(data)
        setIsSignatureDialogOpen(false)
    }

    // Handle initials save
    const handleInitialsSave = (data: string) => {
        setInitialsData(data)
        setIsInitialsDialogOpen(false)
    }

    // Handle clear signature
    const handleClearSignature = () => {
        setSignatureData(null)
    }

    // Handle clear initials
    const handleClearInitials = () => {
        setInitialsData(null)
    }

    // Handle signature selection from options
    const handleSignatureSelection = (signature: string, initials: string) => {
        setSignatureData(signature)
        setInitialsData(initials)
        setSelectedSignatureId(signature) // Use signature as unique identifier
    }

    // Handle create signature
    const handleCreateSignature = () => {
        // TODO: Save signature data to your backend/state management
        console.log('Signature Data:', signatureData)
        console.log('Initials Data:', initialsData)
        console.log('Full Name:', fullName)
        console.log('Initials:', initials)

        // For now, just log the data - you can implement saving logic here
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="flex sticky top-0 z-50 justify-between items-center px-8 h-16 border-b glass bg-background/50 border-border">
                <div className="flex gap-4 items-center">
                    <Logo className="px-0" textClassName="text-foreground font-bold" iconOnly />
                    <h3>Create Your Signature</h3>
                </div>
                <Button variant="ghost" size="icon">
                    <XIcon className="w-5 h-5" />
                </Button>
            </header>

            {/* Main Content */}
            <main className="p-8 mx-auto max-w-6xl space-y-8 flex flex-col items-center justify-center min-h-[calc(100dvh-4rem)]">
                <div>
                    <Image src="/static/sign-bg.png" alt="Signature Background" className="w-full h-full rounded-xl" />
                </div>
                {/* Name and Initials Input */}
                <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="space-y-2">
                        <label htmlFor="fullName" className="text-sm font-medium">
                            Full Name *
                        </label>
                        <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="initials" className="text-sm font-medium">
                            Initials *
                        </label>
                        <Input
                            id="initials"
                            value={initials}
                            onChange={(e) => setInitials(e.target.value)}
                            placeholder="Enter your initials"
                        />
                    </div>
                </div>

                {/* Signature Creation Tabs */}
                <Tabs defaultValue="choose" className="w-full min-h-[32rem]">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="choose">
                            <PaletteIcon className="size-5" weight="bold" />
                            <p>Choose</p>
                        </TabsTrigger>
                        <TabsTrigger value="draw">
                            <PaintBrushIcon className="size-5" weight="bold" />
                            <p>Draw</p>
                        </TabsTrigger>
                        <TabsTrigger value="upload">
                            <UploadSimpleIcon className="size-5" weight="bold" />
                            <p>Upload</p>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="choose" className="mt-6">
                        <SignatureOptions
                            fullName={fullName}
                            initials={initials}
                            onSelect={handleSignatureSelection}
                            selectedSignatureId={selectedSignatureId || undefined}
                        />
                    </TabsContent>

                    <TabsContent value="draw" className="mt-6">
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
                                                        onClick={() => setIsSignatureDialogOpen(true)}
                                                    >
                                                        Edit Signature
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleClearSignature}
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
                                                    onClick={() => setIsSignatureDialogOpen(true)}
                                                >
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
                                                        onClick={() => setIsInitialsDialogOpen(true)}
                                                    >
                                                        Edit Initials
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleClearInitials}
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
                                                    onClick={() => setIsInitialsDialogOpen(true)}
                                                >
                                                    Draw Initials
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end mx-auto max-w-6xl w-full gap-4">
                                <Button variant="ghost" size="lg">
                                    <p className="hidden sm:block">Cancel</p>
                                </Button>
                                <Button variant="primary" size="lg" onClick={handleCreateSignature}>
                                    Save
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="upload" className="mt-6">
                        <div className="space-y-4">
                            <h4 className="text-muted-foreground">Upload Signature</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Signature upload area */}
                                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center min-h-[16rem] flex flex-col items-center justify-center">
                                    <SignatureIcon className="size-16" />
                                    <Button variant="primary" className="mt-2">Upload Signature</Button>
                                </div>
                                {/* Initials upload area */}
                                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center min-h-[16rem] flex flex-col items-center justify-center">
                                    <TextAaIcon className="size-16" />
                                    <Button variant="primary" className="mt-2">Upload Initials</Button>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Accepted File Formats: GIF, JPG, PNG, BMP. Max file size 2MB.
                            </p>
                            <div className="flex justify-end mx-auto max-w-6xl w-full gap-4">
                                <Button variant="ghost" size="lg">
                                    <p className="hidden sm:block">Cancel</p>
                                </Button>
                                <Button variant="primary" size="lg" onClick={handleCreateSignature}>
                                    Save
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Legal Disclaimer */}
                <div className="text-sm text-muted-foreground">
                    By clicking Save, I agree that the signature and initials will be the electronic representation of my signature and initials for all purposes when I (or my agent) use them on envelopes, including legally binding contracts.
                </div>
            </main>

            {/* Signature Dialog */}
            <SignatureDialog
                isOpen={isSignatureDialogOpen}
                onClose={() => setIsSignatureDialogOpen(false)}
                onSave={handleSignatureSave}
                title="Draw Your Signature"
            />

            {/* Initials Dialog */}
            <SignatureDialog
                isOpen={isInitialsDialogOpen}
                onClose={() => setIsInitialsDialogOpen(false)}
                onSave={handleInitialsSave}
                title="Draw Your Initials"
            />
        </div>
    )
}