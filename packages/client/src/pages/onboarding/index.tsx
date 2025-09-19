import { useState } from "react"
import { motion } from "motion/react"
import { Button } from "@/src/lib/components/ui/button"
import { Input } from "@/src/lib/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card"
import { useNavigate } from "@tanstack/react-router"
import { ArrowRightIcon } from "@phosphor-icons/react"

export default function OnboardingWelcomePage() {
    const [name, setName] = useState("")
    const navigate = useNavigate()

    const handleContinue = () => {
        if (name.trim()) {
            localStorage.setItem('onboarding_name', name.trim())
            navigate({ to: '/onboarding/set-pin' })
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && name.trim()) {
            handleContinue()
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-full max-w-md mx-auto px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>What's your name?</CardTitle>
                            <CardDescription>
                                We'll use this to personalize your experience
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter your full name"
                                autoFocus
                            />
                            <Button
                                onClick={handleContinue}
                                disabled={!name.trim()}
                                className="w-full"
                            >
                                Continue
                                <ArrowRightIcon className="ml-2 size-4" weight="bold" />
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
