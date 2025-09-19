import { useState } from "react"
import { CaretLeftIcon, PaintBrushIcon, PaletteIcon, SignatureIcon, TextAaIcon, TrashIcon, UploadIcon } from "@phosphor-icons/react"
import { motion } from "motion/react"
import { Button } from "@/src/lib/components/ui/button"
import { Input } from "@/src/lib/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/lib/components/ui/tabs"
import Logo from "@/src/lib/components/custom/Logo"
import SignatureDialog from "./_components/SignatureDialog"
import { Image } from "@/src/lib/components/custom/Image"
import SignatureUpload from "./_components/SignatureUpload"
import SignatureDraw from "./_components/SignatureDraw"
import SignatureChoose from "./_components/SignatureChoose"
import { Link } from "@tanstack/react-router"

export default function CreateNewSignaturePage() {
    const [fullName, setFullName] = useState("Kartikay Tiwari")
    const [initials, setInitials] = useState("KT")

    // Tab state
    const [activeTab, setActiveTab] = useState("choose")

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

    // Handle file uploads
    const handleSignatureUpload = (data: string) => {
        setSignatureData(data)
    }

    const handleInitialsUpload = (data: string) => {
        setInitialsData(data)
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

    const handleTabChange = (value: string) => {
        setActiveTab(value)
        setSignatureData(null)
        setInitialsData(null)
        setSelectedSignatureId(null)
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="flex sticky top-0 z-50 justify-between items-center px-8 h-16 border-b glass bg-background/50 border-border">
                <div className="flex gap-4 items-center">
                    <Logo className="px-0" textClassName="text-foreground font-bold" iconOnly />
                    <motion.h3
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.1 }}
                    >
                        Create Your Signature
                    </motion.h3>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-8 mx-auto max-w-6xl space-y-8 flex flex-col items-center justify-center min-h-[calc(100dvh-4rem)]">
                <Button variant="ghost" size="lg" className="self-start mb-4" asChild>
                    <Link to="/dashboard">
                        <CaretLeftIcon className="size-5" weight="bold" />
                        <p>Back</p>
                    </Link>
                </Button>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.2 }}
                >
                    <Image src="/static/sign-bg.png" alt="Signature Background" className="w-full h-full rounded-xl" />
                </motion.div>
                {/* Name and Initials Input */}
                <motion.div
                    className="grid grid-cols-2 gap-4 w-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.3 }}
                >
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
                </motion.div>

                {/* Signature Creation Tabs */}
                <motion.div
                    className="w-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.4 }}
                >
                    <Tabs defaultValue="choose" onValueChange={handleTabChange} className="w-full min-h-[32rem]">
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
                                <UploadIcon className="size-5" weight="bold" />
                                <p>Upload</p>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="choose" className="mt-6">
                            <SignatureChoose
                                fullName={fullName}
                                initials={initials}
                                signatureData={signatureData}
                                initialsData={initialsData}
                                selectedSignatureId={selectedSignatureId || undefined}
                                onSignatureSelection={handleSignatureSelection}
                                onCreateSignature={handleCreateSignature}
                            />
                        </TabsContent>

                        <TabsContent value="draw" className="mt-6">
                            <SignatureDraw
                                signatureData={signatureData}
                                initialsData={initialsData}
                                onSignatureDialogOpen={() => setIsSignatureDialogOpen(true)}
                                onInitialsDialogOpen={() => setIsInitialsDialogOpen(true)}
                                onSignatureClear={handleClearSignature}
                                onInitialsClear={handleClearInitials}
                                onCreateSignature={handleCreateSignature}
                            />
                        </TabsContent>

                        <TabsContent value="upload" className="mt-6">
                            <SignatureUpload
                                signatureData={signatureData}
                                initialsData={initialsData}
                                onSignatureUpload={handleSignatureUpload}
                                onInitialsUpload={handleInitialsUpload}
                                onSignatureClear={handleClearSignature}
                                onInitialsClear={handleClearInitials}
                                onCreateSignature={handleCreateSignature}
                            />
                        </TabsContent>
                    </Tabs>
                </motion.div>
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