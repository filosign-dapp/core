import { useIsLoggedIn, useIsRegistered } from "@filosign/react/hooks";
import { Navigate } from "@tanstack/react-router";

export default function OnboardingProtector({ children }: { children: React.ReactNode }) {
    const isRegistered = useIsRegistered();

    if (isRegistered.data) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}