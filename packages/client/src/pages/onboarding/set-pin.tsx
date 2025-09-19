import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/src/lib/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card"
import { Progress } from "@/src/lib/components/ui/progress"
import OtpInput from "./_components/OtpInput"
import { useNavigate } from "@tanstack/react-router"
import { ArrowRightIcon, ArrowLeftIcon, KeyIcon, SparkleIcon } from "@phosphor-icons/react"

export default function OnboardingSetPinPage() {
    const [pin, setPin] = useState("")
    const [confirmPin, setConfirmPin] = useState("")
    const [step, setStep] = useState<'enter' | 'confirm'>('enter')
    const [isLoading, setIsLoading] = useState(false)
    const [loadingProgress, setLoadingProgress] = useState(0)
    const navigate = useNavigate()

    const simulateKeyGeneration = async () => {
        setIsLoading(true)
        setLoadingProgress(0)

        // Simulate progress over 3 seconds
        const duration = 3000 // 3 seconds
        const steps = 60 // Update every 50ms for smooth animation
        const increment = 100 / steps

        for (let i = 0; i <= steps; i++) {
            setTimeout(() => {
                setLoadingProgress(Math.min(i * increment, 100))
            }, (duration / steps) * i)
        }

        // Wait 3 seconds then navigate
        setTimeout(() => {
            localStorage.setItem('onboarding_pin', pin)
            navigate({ to: '/onboarding/create-signature' })
        }, duration)
    }

    const handlePinSubmit = () => {
        if (pin.length === 6) {
            if (step === 'enter') {
                setStep('confirm')
                setConfirmPin("")
            } else if (step === 'confirm') {
                if (pin === confirmPin) {
                    simulateKeyGeneration()
                } else {
                    setConfirmPin("")
                }
            }
        }
    }

    const handleBack = () => {
        if (step === 'confirm') {
            setStep('enter')
            setConfirmPin("")
        } else {
            navigate({ to: '/onboarding' })
        }
    }

    const currentPin = step === 'enter' ? pin : confirmPin
    const isComplete = currentPin.length === 6
    const isPinMismatch = step === 'confirm' && confirmPin.length === 6 && pin !== confirmPin

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-full max-w-md mx-auto px-8">
                <AnimatePresence mode="wait">
                    {!isLoading ? (
                        <motion.div
                            key="pin-input"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {step === 'enter' ? 'Enter PIN' : 'Confirm PIN'}
                                    </CardTitle>
                                    <CardDescription>
                                        {step === 'enter'
                                            ? 'Choose a 6-digit PIN for your account'
                                            : 'Re-enter your PIN to confirm'
                                        }
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <OtpInput
                                        value={currentPin}
                                        onChange={step === 'enter' ? setPin : setConfirmPin}
                                        length={6}
                                    />

                                    {isPinMismatch && (
                                        <p className="text-destructive text-sm">
                                            PINs don't match. Please try again.
                                        </p>
                                    )}

                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={handleBack}
                                            className="flex-1"
                                        >
                                            <ArrowLeftIcon className="mr-2 size-4" weight="bold" />
                                            Back
                                        </Button>

                                        <Button
                                            onClick={handlePinSubmit}
                                            disabled={!isComplete}
                                            className="flex-1"
                                        >
                                            {step === 'enter' ? 'Continue' : 'Confirm'}
                                            <ArrowRightIcon className="ml-2 size-4" weight="bold" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                        className="mb-6"
                                    >
                                        <div className="relative inline-block">
                                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                                <KeyIcon className="w-10 h-10 text-primary" weight="bold" />
                                            </div>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                className="absolute -top-1 -right-1"
                                            >
                                                <SparkleIcon className="w-6 h-6 text-primary" weight="bold" />
                                            </motion.div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="space-y-4"
                                    >
                                        <h3 className="text-xl font-semibold">Generating Private Key</h3>
                                        <p className="text-muted-foreground text-sm">
                                            Creating your secure cryptographic keys...
                                        </p>

                                        <div className="space-y-3">
                                            <Progress value={loadingProgress} className="h-2" />
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>Encrypting...</span>
                                                <span>{Math.round(loadingProgress)}%</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center gap-2 mt-4">
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                className="w-2 h-2 bg-primary rounded-full"
                                            />
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                                                className="w-2 h-2 bg-primary rounded-full"
                                            />
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                                                className="w-2 h-2 bg-primary rounded-full"
                                            />
                                        </div>
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
