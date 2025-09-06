import { useForm, useFieldArray } from "react-hook-form"
import { CaretLeftIcon } from "@phosphor-icons/react"
import { Button } from "@/src/lib/components/ui/button"
import { Form } from "@/src/lib/components/ui/form"
import Logo from "@/src/lib/components/custom/Logo"
import DocumentsSection from "./components/DocumentsSection"
import RecipientsSection from "./components/RecipientsSection"
import MessageSection from "./components/MessageSection"
import { useNavigate } from "@tanstack/react-router"
import type { EnvelopeForm } from "./types"

export default function CreateEnvelopePage() {
    const navigate = useNavigate();
    const form = useForm<EnvelopeForm>({
        defaultValues: {
            isOnlySigner: false,
            recipients: [{ name: "", email: "", walletAddress: "", role: "signer" }],
            emailSubject: "",
            emailMessage: "",
            documents: []
        }
    })

    const { fields, append, remove, move } = useFieldArray({
        control: form.control,
        name: "recipients"
    })

    const { fields: documentFields, append: appendDocument, remove: removeDocument } = useFieldArray({
        control: form.control,
        name: "documents"
    })

    const isOnlySigner = form.watch("isOnlySigner")

    const onSubmit = (data: EnvelopeForm) => {
        console.log("Form submitted:", data)
        console.log("Would navigate to signature page")
        navigate({ to: "/dashboard/create/add-signature" })
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="flex sticky top-0 z-50 justify-between items-center px-8 h-16 border-b glass bg-background/50 border-border">
                <div className="flex gap-4 items-center">
                    <Logo className="px-0" textClassName="text-foreground font-bold" iconOnly />
                    <h3>Create New Envelope</h3>
                </div>
            </header>

            {/* Main Content */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <main className="p-8 mx-auto space-y-8 max-w-4xl">
                        <DocumentsSection 
                            control={form.control}
                            fields={documentFields}
                            append={appendDocument}
                            remove={removeDocument}
                        />
                        <RecipientsSection
                            control={form.control}
                            fields={fields}
                            append={append}
                            remove={remove}
                            move={move}
                            isOnlySigner={isOnlySigner}
                        />
                        <MessageSection control={form.control} isOnlySigner={isOnlySigner} />
                    </main>
                    <div className="flex justify-end p-8 pt-0 mx-auto max-w-4xl">
                        <Button type="submit" variant="primary" size="lg" className="gap-2">
                            Next
                            <CaretLeftIcon className="w-4 h-4 rotate-180" />
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
