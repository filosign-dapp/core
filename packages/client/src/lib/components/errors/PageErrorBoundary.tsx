import { useNavigate } from "@tanstack/react-router";
import type React from "react";
import { PageCrashed } from "../custom/PageCrashed";
import ThemeSwitch from "../custom/ThemeSwitch";
import { ErrorBoundary } from "./ErrorBoundary";

interface PageErrorBoundaryProps {
	children: React.ReactNode;
}

const DefaultErrorFallback = () => {
	const navigate = useNavigate();

	return (
		<div className="flex flex-1 flex-col gap-4 h-screen">
			<PageCrashed
				title="Something went wrong"
				description="There was an error loading this page."
				showRetryButton={true}
				showBackButton={true}
				showHomeButton={false}
				onRetry={() => window.location.reload()}
				onBack={() => navigate({ to: "/" })}
			/>
		</div>
	);
};

const PageErrorBoundary: React.FC<PageErrorBoundaryProps> = ({ children }) => {
	const handleError = (error: Error) => {
		console.error("Page error:", error);
	};

	return (
		<ErrorBoundary fallback={<DefaultErrorFallback />} onError={handleError}>
			{children}
		</ErrorBoundary>
	);
};

const withPageErrorBoundary =
	<P extends {}>(Component: React.ComponentType<P>) =>
	(props: P) => (
		<PageErrorBoundary>
			<Component {...props} />
		</PageErrorBoundary>
	);

export { PageErrorBoundary, withPageErrorBoundary };
