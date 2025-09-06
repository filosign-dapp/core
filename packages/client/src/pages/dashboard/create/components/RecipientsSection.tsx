import { useState } from "react"
import { motion } from "framer-motion"
import { useWatch } from "react-hook-form"
import type { Control, FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove } from "react-hook-form"
import {
    MagnifyingGlassIcon,
    CaretDownIcon,
    UserIcon,
    EnvelopeIcon,
    WalletIcon,
    PlusIcon,
    XIcon,
    CaretUpIcon,
    CaretDownIcon as ArrowDownIcon
} from "@phosphor-icons/react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/src/lib/components/ui/collapsible"
import { Button } from "@/src/lib/components/ui/button"
import { Input } from "@/src/lib/components/ui/input"
import { Checkbox } from "@/src/lib/components/ui/checkbox"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/src/lib/components/ui/form"
import { cn } from "@/src/lib/utils/utils"
import type { EnvelopeForm, Recipient } from "../types"

interface RecipientsSectionProps {
    control: Control<EnvelopeForm>
    fields: FieldArrayWithId<EnvelopeForm, "recipients", "id">[]
    append: UseFieldArrayAppend<EnvelopeForm, "recipients">
    remove: UseFieldArrayRemove
    move: (from: number, to: number) => void
    isOnlySigner: boolean
}

export default function RecipientsSection({
    control,
    fields,
    append,
    remove,
    move,
    isOnlySigner
}: RecipientsSectionProps) {
    const [isRecipientsOpen, setIsRecipientsOpen] = useState(true)
    
    // Watch all recipient names to update headers dynamically
    const recipientNames = useWatch({
        control,
        name: "recipients"
    }) as Recipient[]

    const handleAddRecipient = () => {
        append({ name: "", email: "", walletAddress: "", role: "signer" })
    }

    const handleRemoveRecipient = (index: number) => {
        if (fields.length > 1) {
            remove(index)
        }
    }

    const handleMoveUp = (index: number) => {
        if (index > 0) {
            move(index, index - 1)
        }
    }

    const handleMoveDown = (index: number) => {
        if (index < fields.length - 1) {
            move(index, index + 1)
        }
    }

    return (
        <motion.section
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                type: "spring",
                stiffness: 200,
                damping: 25,
                delay: 0.3
            }}
        >
            <Collapsible open={isRecipientsOpen} onOpenChange={setIsRecipientsOpen}>
                <CollapsibleTrigger asChild>
                    <div
                        className="flex items-center justify-between cursor-pointer hover:bg-accent/50 transition-colors p-2 -m-2 rounded-md group/add-recipients"
                    >
                        <h4 className="flex items-center gap-3">
                            <MagnifyingGlassIcon className={cn(
                                "size-5 text-muted-foreground group-hover/add-recipients:scale-110 transition-transform duration-200",
                                isRecipientsOpen && "scale-110"
                            )} />
                            Add recipients
                        </h4>
                        <CaretDownIcon className={cn(
                            "size-4 text-muted-foreground transition-transform duration-200",
                            isRecipientsOpen && "rotate-180"
                        )} weight="bold" />
                    </div>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-6">
                    <div className="space-y-6">
                        {/* Signing Options */}
                        <div className="space-y-3">
                            <FormField
                                control={control}
                                name="isOnlySigner"
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-3">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormLabel className="cursor-pointer">
                                            I'm the only signer
                                        </FormLabel>
                                    </FormItem>
                                )}
                            />
                            
                        </div>

                        {/* Recipients */}
                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <motion.div
                                    key={field.id}
                                    className="bg-muted/5 border border-border rounded-lg p-6 space-y-6"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 230,
                                        damping: 25,
                                        delay: index * 0.1
                                    }}
                                >
                                    {/* Recipient Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="size-6 rounded-full bg-secondary text-secondary-foreground text-sm font-medium flex items-center justify-center">
                                                {index + 1}
                                            </div>
                                            <h4 className="">
                                                {recipientNames[index]?.name ? 
                                                    recipientNames[index].name.split(' ')[0] : 
                                                    `Recipient ${index + 1}`
                                                }
                                            </h4>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {/* Reorder buttons - always show when there are multiple recipients */}
                                            {fields.length > 1 && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleMoveUp(index)}
                                                        disabled={index === 0 || isOnlySigner}
                                                        className="h-6 w-6 p-0"
                                                    >
                                                        <CaretUpIcon className="size-4" weight="bold" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleMoveDown(index)}
                                                        disabled={index === fields.length - 1 || isOnlySigner}
                                                        className="h-6 w-6 p-0"
                                                    >
                                                        <ArrowDownIcon className="size-4" weight="bold" />
                                                    </Button>
                                                </div>
                                            )}
                                            {fields.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveRecipient(index)}
                                                >
                                                    <XIcon className="size-4" weight="bold" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="space-y-4">
                                        {/* Name and Email Row */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Name Field */}
                                            <FormField
                                                control={control}
                                                name={`recipients.${index}.name`}
                                                rules={{ 
                                                    required: isOnlySigner ? false : "Name is required" 
                                                }}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                                                            Name *
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Enter recipient name"
                                                                className=""
                                                                disabled={isOnlySigner}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Email Field */}
                                            <FormField
                                                control={control}
                                                name={`recipients.${index}.email`}
                                                rules={{ 
                                                    required: isOnlySigner ? false : "Email is required",
                                                    pattern: isOnlySigner ? undefined : {
                                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                        message: "Invalid email address"
                                                    }
                                                }}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            <EnvelopeIcon className="h-4 w-4 text-muted-foreground" />
                                                            Email *
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="email"
                                                                placeholder="Enter email address"
                                                                className=""
                                                                disabled={isOnlySigner}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Wallet Address Field - Full Width */}
                                        <FormField
                                            control={control}
                                            name={`recipients.${index}.walletAddress`}
                                            rules={{ 
                                                required: isOnlySigner ? false : "Wallet address is required",
                                                pattern: isOnlySigner ? undefined : {
                                                    value: /^0x[a-fA-F0-9]{40}$/,
                                                    message: "Invalid wallet address format"
                                                }
                                            }}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        <WalletIcon className="h-4 w-4 text-muted-foreground" />
                                                        Wallet Address *
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter wallet address (0x...)"
                                                            className=" w-full"
                                                            disabled={isOnlySigner}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Add Recipient Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 230,
                                damping: 25,
                                delay: 0.1
                            }}
                        >
                            <Button
                                type="button"
                                variant="muted"
                                size="lg"
                                onClick={handleAddRecipient}
                                disabled={isOnlySigner}
                                className="w-full"
                            >
                                <PlusIcon className="h-4 w-4" />
                                Add Recipient
                            </Button>
                        </motion.div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </motion.section>
    )
}
