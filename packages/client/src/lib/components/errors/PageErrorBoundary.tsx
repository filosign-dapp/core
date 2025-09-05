import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { ErrorBoundary } from "./ErrorBoundary";
import { PageCrashed } from "../custom/PageCrashed";
import ThemeSwitch from "../custom/ThemeSwitch";

interface PageErrorBoundaryProps {
  children: React.ReactNode;
}

const DefaultErrorFallback = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-background">
      <div className="fixed bottom-4 right-4">
        <ThemeSwitch />
      </div>
      
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

const withPageErrorBoundary = <P extends {}>(Component: React.ComponentType<P>) => (props: P) =>
(
  <PageErrorBoundary>
    <Component {...props} />
  </PageErrorBoundary>
);

export { PageErrorBoundary, withPageErrorBoundary };
