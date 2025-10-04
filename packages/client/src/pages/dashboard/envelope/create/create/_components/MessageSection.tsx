import { useState } from "react";
import { type Control } from "react-hook-form";
import { motion } from "framer-motion";
import { EnvelopeIcon, CaretDownIcon } from "@phosphor-icons/react";
import { Input } from "@/src/lib/components/ui/input";
import { Textarea } from "@/src/lib/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/lib/components/ui/collapsible";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/lib/components/ui/form";
import { cn } from "@/src/lib/utils/utils";
import type { EnvelopeForm } from "../../types";

interface MessageSectionProps {
  control: Control<EnvelopeForm>;
  isOnlySigner: boolean;
}

export default function MessageSection({
  control,
  isOnlySigner,
}: MessageSectionProps) {
  const [isMessageOpen, setIsMessageOpen] = useState(false);

  return (
    <motion.section
      className="space-y-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 25,
        delay: 0.6,
      }}
    >
      <Collapsible open={isMessageOpen} onOpenChange={setIsMessageOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer hover:bg-accent/50 transition-colors p-2 -m-2 rounded-md group/add-message">
            <h4 className="flex items-center gap-3">
              <EnvelopeIcon
                className={cn(
                  "size-5 text-muted-foreground transition-transform duration-200",
                )}
              />
              Add message (optional)
            </h4>
            <CaretDownIcon
              className={cn(
                "size-4 text-muted-foreground transition-transform duration-200",
                isMessageOpen && "rotate-180",
              )}
              weight="bold"
            />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-6 space-y-6">
          <div className="space-y-4">
            <FormField
              control={control}
              name="emailSubject"
              rules={{
                required: isOnlySigner ? false : "Email subject is required",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Subject {!isOnlySigner && "*"}</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email subject" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormField
              control={control}
              name="emailMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your message to recipients..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </motion.section>
  );
}
