import { useIsLoggedIn, useIsRegistered } from "@filosign/react/hooks";
import { usePrivy } from "@privy-io/react-auth";
import { Navigate } from "@tanstack/react-router";

export default function OnboardingProtector({
	children,
}: {
	children: React.ReactNode;
}) {
	const { ready, authenticated } = usePrivy();
	const isRegistered = useIsRegistered();

	// App is in closed beta - redirect authenticated users back to landing
	if (ready && authenticated) {
		return <Navigate to="/" replace />;
	}

	if (isRegistered.data) {
		return <Navigate to="/dashboard" replace />;
	}

	return <>{children}</>;
}
