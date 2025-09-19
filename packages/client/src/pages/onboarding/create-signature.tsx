import { motion } from "motion/react"
import { Button } from "@/src/lib/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card"
import { useNavigate } from "@tanstack/react-router"
import { ArrowRightIcon, ArrowLeftIcon } from "@phosphor-icons/react"
import CreateNewSignaturePage from "../dashboard/signature/create"

export default function OnboardingCreateSignaturePage() {
    const navigate = useNavigate()

    const handleBack = () => {
        navigate({ to: '/onboarding/set-pin' })
    }

    const handleComplete = () => {
        navigate({ to: '/onboarding/welcome' })
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
        >
            <CreateNewSignaturePage onboarding={true} />
        </motion.div>
    )
}
