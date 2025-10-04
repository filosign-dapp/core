import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/src/lib/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/lib/components/ui/card";
import { CaretRightIcon } from "@phosphor-icons/react";
import Logo from "@/src/lib/components/custom/Logo";
import { useStorePersist } from "@/src/lib/hooks/use-store";
import { useFilosignMutation } from "@filosign/sdk/react";

export default function OnboardingWelcomeCompletePage() {
  const [userName, setUserName] = useState("");
  const { onboardingForm, setOnboardingForm } = useStorePersist();
  const register = useFilosignMutation(["register"]);

  console.log("register", register.isSuccess, register.isError);

  useEffect(() => {
    const name = onboardingForm?.name || "there";
    setUserName(name);
  }, [onboardingForm]);

  console.log("onboardingForm", onboardingForm);

  function handleSubmit() {
    if (onboardingForm) {
      setOnboardingForm({ ...onboardingForm, hasOnboarded: true });
    }

    if (!onboardingForm?.pin) {
      return;
    }

    register.mutateAsync({
      pin: onboardingForm?.pin,
    });

    console.log("onboardingForm", onboardingForm);
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex flex-col justify-center items-center px-8 mx-auto w-full max-w-lg"
      >
        <Logo className="mb-4" textClassName="text-foreground font-semibold" />
        <Card className="w-full">
          <CardHeader>
            <CardTitle>All Set, {userName.split(" ")[0]}!</CardTitle>
            <CardDescription>Your Filosign account is ready.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full group"
              variant="primary"
              onClick={handleSubmit}
            >
              Go to Dashboard
              <CaretRightIcon
                className="transition-transform duration-200 size-4 group-hover:translate-x-1"
                weight="bold"
              />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
