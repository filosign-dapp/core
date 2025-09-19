import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { Button } from "@/src/lib/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card"
import { Link } from "@tanstack/react-router"
import { CheckIcon, ArrowRightIcon } from "@phosphor-icons/react"

export default function OnboardingWelcomeCompletePage() {
    const [userName, setUserName] = useState("")

    useEffect(() => {
        const name = localStorage.getItem('onboarding_name') || 'there'
        setUserName(name)
    }, [])

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-full max-w-md mx-auto px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <Card>
                        <CardHeader className="text-center">
                            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckIcon className="w-8 h-8 text-primary-foreground" weight="bold" />
                            </div>
                            <CardTitle className="text-2xl">
                                All Set, {userName}!
                            </CardTitle>
                            <CardDescription>
                                Your Filosign account is ready. Let's start creating digital signatures.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-muted/20 rounded-lg p-4 text-sm">
                                <h4 className="font-medium mb-2">What's next?</h4>
                                <ul className="text-muted-foreground space-y-1">
                                    <li>• Create and manage your digital signatures</li>
                                    <li>• Sign documents securely with blockchain verification</li>
                                    <li>• Access your signature library anytime</li>
                                </ul>
                            </div>

                            <Button asChild className="w-full">
                                <Link to="/dashboard">
                                    Go to Dashboard
                                    <ArrowRightIcon className="ml-2 size-4" weight="bold" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
