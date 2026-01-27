// import { usePrivy } from "@privy-io/react-auth";
// import { useEffect, useRef, useState } from "react";
// import ClosedBetaDialog from "@/src/pages/landing/closed-beta-dialog";

// export default function ClosedBetaGuard() {
// 	const { ready, authenticated } = usePrivy();
// 	const [showDialog, setShowDialog] = useState(false);
// 	const hasShownDialogRef = useRef(false);
// 	const wasAuthenticatedRef = useRef(false);
// 	const isInitialMountRef = useRef(true);

// 	useEffect(() => {
// 		if (isInitialMountRef.current) {
// 			isInitialMountRef.current = false;
// 			if (authenticated) {
// 				wasAuthenticatedRef.current = true;
// 				return;
// 			}
// 		}

// 		if (
// 			ready &&
// 			authenticated &&
// 			!wasAuthenticatedRef.current &&
// 			!hasShownDialogRef.current
// 		) {
// 			setShowDialog(true);
// 			hasShownDialogRef.current = true;
// 		}

// 		wasAuthenticatedRef.current = authenticated;
// 	}, [ready, authenticated]);

// 	return (
// 		<ClosedBetaDialog open={showDialog} onOpenChange={setShowDialog} />
// 	);
// }
