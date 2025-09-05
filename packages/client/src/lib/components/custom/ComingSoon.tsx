import { Button } from "@/src/lib/components/ui/button"
import { ClockIcon, BellIcon, CaretLeftIcon } from "@phosphor-icons/react"
import { motion } from "framer-motion"

type ComingSoonProps = {
  title?: string
  description?: string
  showBackButton?: boolean
  showNotifyButton?: boolean
  onBack?: () => void
  onNotify?: () => void
}

export function ComingSoon({
  title = "Coming Soon",
  description = "We're working on something amazing. Stay tuned!",
  showBackButton = true,
  showNotifyButton = true,
  onBack,
  onNotify,
}: ComingSoonProps) {
  return (
    <div className="flex flex-col flex-1 gap-4 justify-center items-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="space-y-6 max-w-md"
      >
        {/* Coming Soon Illustration */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
          className="relative"
        >
          <div className="flex justify-center items-center mx-auto w-32 h-32 rounded-full bg-muted/20">
            <ClockIcon className="w-16 h-16 text-muted-foreground" />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.3 }}
            className="flex absolute -top-1 -right-1 justify-center items-center w-6 h-6 rounded-full bg-muted-foreground/20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-3 h-3 rounded-full border-2 border-background border-t-transparent"
            />
          </motion.div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-3"
        >
          <h1 className="text-foreground">
            {title}
          </h1>
          <p className="text-muted-foreground">
            {description}
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col gap-3 sm:flex-row sm:justify-center"
        >
          {showBackButton && (
            <Button
              variant="secondary"
              onClick={onBack}
              className="gap-2"
            >
              <CaretLeftIcon className="w-4 h-4" />
              Go Back
            </Button>
          )}
          {showNotifyButton && (
            <Button
              onClick={onNotify}
              className="gap-2"
            >
              <BellIcon className="w-4 h-4" />
              Notify Me
            </Button>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
