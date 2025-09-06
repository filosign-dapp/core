import { motion } from "framer-motion"
import {
    SignatureIcon,
    TextAaIcon,
    CalendarIcon,
    UserIcon,
    EnvelopeIcon,
    TextBIcon,
    CheckSquareIcon
} from "@phosphor-icons/react"
import { Button } from "@/src/lib/components/ui/button"
import { cn } from "@/src/lib/utils/utils"
import { type SignatureField } from "../mock"

type SignatureFieldType = SignatureField["type"]

interface MobileSignatureToolbarProps {
    onAddField: (fieldType: SignatureFieldType) => void
    isPlacingField?: boolean
    pendingFieldType?: SignatureFieldType | null
}

// Local field type configuration with icons for mobile toolbar
const fieldTypes = [
    {
        type: "signature" as const,
        icon: SignatureIcon,
    },
    {
        type: "initial" as const,
        icon: TextAaIcon,
    },
    {
        type: "date" as const,
        icon: CalendarIcon,
    },
    {
        type: "name" as const,
        icon: UserIcon,
    },
    {
        type: "email" as const,
        icon: EnvelopeIcon,
    },
    {
        type: "text" as const,
        icon: TextBIcon,
    },
    {
        type: "checkbox" as const,
        icon: CheckSquareIcon,
    }
]

export default function MobileSignatureToolbar({ onAddField, isPlacingField, pendingFieldType }: MobileSignatureToolbarProps) {
    return (
        <motion.div
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 lg:hidden"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                type: "spring",
                stiffness: 230,
                damping: 25,
                mass: 1.0,
            }}
        >
            <div className="glass bg-background/95 border border-border rounded-large p-4 shadow-lg">
                <div className="flex items-center gap-3">
                    {fieldTypes.map((field, index) => {
                        const IconComponent = field.icon
                        return (
                            <motion.div
                                key={field.type}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 230,
                                    damping: 25,
                                    delay: index * 0.05
                                }}
                            >
                                <button
                                    className={cn(
                                        "py-2 px-4 transition-all duration-200 hover:scale-110 hover:-translate-y-2 rounded-main",
                                        isPlacingField && pendingFieldType === field.type && "bg-secondary border border-primary/20"
                                    )}
                                    onClick={() => onAddField(field.type)}
                                >
                                    <IconComponent className="size-6 text-secondary-foreground" weight="fill" />
                                </button>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </motion.div>
    )
}
