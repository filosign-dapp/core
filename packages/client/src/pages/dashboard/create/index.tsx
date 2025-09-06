import { useForm, useFieldArray } from "react-hook-form"
import { motion } from "framer-motion"
// import { useNavigate } from "react-router-dom"
import { CaretLeftIcon } from "@phosphor-icons/react"
import { Button } from "@/src/lib/components/ui/button"
import { Form } from "@/src/lib/components/ui/form"
import Logo from "@/src/lib/components/custom/Logo"
import DocumentsSection from "./components/DocumentsSection"
import RecipientsSection from "./components/RecipientsSection"
import MessageSection from "./components/MessageSection"
import { useNavigate } from "@tanstack/react-router"

type Recipient = {
    name: string
    email: string
    walletAddress: string
    role: "signer" | "cc" | "approver"
}

type EnvelopeForm = {
    isOnlySigner: boolean
    recipients: Recipient[]
    emailSubject: string
    emailMessage: string
}

export default function CreateEnvelopePage() {
    const navigate = useNavigate();
    const form = useForm<EnvelopeForm>({
        defaultValues: {
            isOnlySigner: false,
            recipients: [{ name: "", email: "", walletAddress: "", role: "signer" }],
            emailSubject: "",
            emailMessage: ""
        }
    })

    const { fields, append, remove, move } = useFieldArray({
        control: form.control,
        name: "recipients"
    })

    const isOnlySigner = form.watch("isOnlySigner")

    const onSubmit = (data: EnvelopeForm) => {
        navigate({ to: "/dashboard/create/add-signature" })
        console.log("Form submitted:", data)
        // Navigate to signature placement page
        // navigate("/dashboard/create/add-signature")
        console.log("Would navigate to signature page")
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 glass bg-background/50 border-b border-border flex items-center justify-between h-16 px-8">
                <div className="flex items-center gap-4">
                    <Logo className="px-0" textClassName="text-foreground font-bold" iconOnly />
                    <h3>Create New Envelope</h3>
                </div>
            </header>

            {/* Main Content */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <main className="max-w-4xl mx-auto p-8 space-y-8">
                        <DocumentsSection />
                        <RecipientsSection
                            control={form.control}
                            fields={fields}
                            append={append}
                            remove={remove}
                            move={move}
                            isOnlySigner={isOnlySigner}
                        />
                        <MessageSection control={form.control} />
                    </main>
                    <div className="max-w-4xl mx-auto flex justify-end p-8 pt-0">
                        <Button type="submit" variant="primary" size="lg" className="gap-2">
                            Next
                            <CaretLeftIcon className="h-4 w-4 rotate-180" />
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
