import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/src/lib/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/lib/components/ui/card";
import OtpInput from "./_components/OtpInput";
import { useNavigate } from "@tanstack/react-router";
import { CaretRightIcon, ArrowLeftIcon } from "@phosphor-icons/react";
import Logo from "@/src/lib/components/custom/Logo";
import { useStorePersist } from "@/src/lib/hooks/use-store";

export default function OnboardingSetPinPage() {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"enter" | "confirm">("enter");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { onboardingForm, setOnboardingForm } = useStorePersist();

  const simulateKeyGeneration = async () => {
    setIsLoading(true);

    setTimeout(() => {
      if (onboardingForm) {
        setOnboardingForm({ ...onboardingForm, pin });
      }
      setIsLoading(false);
      navigate({ to: "/onboarding/create-signature" });
    }, 2000);
  };

  const handlePinSubmit = () => {
    if (pin.length === 6) {
      if (step === "enter") {
        setStep("confirm");
        setConfirmPin("");
      } else if (step === "confirm") {
        if (pin === confirmPin) {
          simulateKeyGeneration();
        } else {
          setConfirmPin("");
        }
      }
    }
  };

  const handleBack = () => {
    if (step === "confirm") {
      setStep("enter");
      setConfirmPin("");
    } else {
      navigate({ to: "/onboarding" });
    }
  };

  const currentPin = step === "enter" ? pin : confirmPin;
  const isComplete = currentPin.length === 6;
  const isPinMismatch =
    step === "confirm" && confirmPin.length === 6 && pin !== confirmPin;

  return (
    <div className="flex justify-center items-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex flex-col justify-center items-center px-8 mx-auto w-full max-w-lg"
      >
        <Logo className="mb-4" textClassName="text-foreground font-semibold" />
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col justify-center items-center mx-auto w-full max-w-lg"
            >
              <Card className="w-full">
                <CardContent className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="mb-6"
                  >
                    <div className="flex space-x-1 justify-center">
                      <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
                    </div>
                  </motion.div>

                  <div className="flex flex-col">
                    <div className="space-y-1">
                      <p className="font-semibold">Processing...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="pin-input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex flex-col justify-center items-center px-8 mx-auto w-full max-w-lg"
            >
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>
                    {step === "enter" ? "Setup your PIN" : "Confirm PIN"}
                  </CardTitle>
                  <CardDescription>
                    {step === "enter"
                      ? "Choose a 6-digit PIN for your account"
                      : "Re-enter your PIN to confirm"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <OtpInput
                      value={currentPin}
                      onChange={step === "enter" ? setPin : setConfirmPin}
                      length={6}
                      autoFocus={true}
                      onSubmit={handlePinSubmit}
                    />
                  </div>

                  {isPinMismatch && (
                    <p className="text-destructive text-sm">
                      PINs don't match. Please try again.
                    </p>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={handleBack}
                      className="flex-1"
                    >
                      Back
                    </Button>

                    <Button
                      onClick={handlePinSubmit}
                      disabled={!isComplete}
                      className="flex-1 group"
                      variant="primary"
                    >
                      {step === "enter" ? "Continue" : "Confirm"}
                      <CaretRightIcon
                        className="transition-transform duration-200 size-4 group-hover:translate-x-1 ml-2"
                        weight="bold"
                      />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
