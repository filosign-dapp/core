import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useRef, useState } from "react";
import ClosedBetaDialog from "@/src/pages/landing/closed-beta-dialog";

/**
 * Guard component that intercepts successful Privy authentication
 * and shows a closed beta dialog to prevent users from accessing the app.
 */
export default function ClosedBetaGuard() {
	const { ready, authenticated } = usePrivy();
	const [showDialog, setShowDialog] = useState(false);
	const hasShownDialogRef = useRef(false);
	const wasAuthenticatedRef = useRef(false);
	const isInitialMountRef = useRef(true);

	useEffect(() => {
		// Skip on initial mount if user is already authenticated (they might have seen it before)
		if (isInitialMountRef.current) {
			isInitialMountRef.current = false;
			if (authenticated) {
				wasAuthenticatedRef.current = true;
				return;
			}
		}

		// Only show dialog when authentication state changes from false to true
		if (
			ready &&
			authenticated &&
			!wasAuthenticatedRef.current &&
			!hasShownDialogRef.current
		) {
			setShowDialog(true);
			hasShownDialogRef.current = true;
		}

		// Track previous authentication state
		wasAuthenticatedRef.current = authenticated;
	}, [ready, authenticated]);

	return (
		<ClosedBetaDialog open={showDialog} onOpenChange={setShowDialog} />
	);
}

