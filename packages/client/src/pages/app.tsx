import {
  Outlet,
  createRouter,
  createRoute,
  createRootRoute,
} from "@tanstack/react-router";
import { withPageErrorBoundary } from "@/src/lib/components/errors/PageErrorBoundary";
import LandingPage from "./landing";
import { useAnalytics } from "../lib/hooks/use-analytics";
import DocumentAllPage from "./dashboard/document/all";
import DocumentFolderPage from "./dashboard/document/folder/$folderId";
import CreateEnvelopePage from "./dashboard/envelope/create/create";
import AddSignaturePage from "./dashboard/envelope/create/add-sign";
import CreateNewSignaturePage from "./dashboard/signature/create";
import PitchPage from "./pitch";
import FilesPage from "./dashboard/files";
import DashboardPage from "./dashboard";
import ProfilePage from "./dashboard/profile";
import OnboardingWelcomePage from "./onboarding";
import OnboardingSetPinPage from "./onboarding/set-pin";
import OnboardingCreateSignaturePage from "./onboarding/create-signature";
import OnboardingWelcomeCompletePage from "./onboarding/welcome";
import { NotFound } from "../lib/components/custom/NotFound";
import TestPage from "./test";

const rootRoute = createRootRoute({
  component: () => {
    useAnalytics();

    return (
      <>
        <Outlet />
      </>
    );
  },
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: function Index() {
    return withPageErrorBoundary(LandingPage)({});
  },
});

const pitchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pitch",
  component: function Pitch() {
    return withPageErrorBoundary(PitchPage)({});
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: function Dashboard() {
    return withPageErrorBoundary(DashboardPage)({});
  },
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/settings/profile",
  component: function Profile() {
    return withPageErrorBoundary(ProfilePage)({});
  },
});

const dashboardDocumentAllRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/document/all",
  component: function DocumentAll() {
    return withPageErrorBoundary(DocumentAllPage)({});
  },
});

const dashboardDocumentFolderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/document/folder/$folderId",
  component: function DocumentFolder() {
    return withPageErrorBoundary(DocumentFolderPage)({});
  },
});

const createSignatureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/signature/create",
  component: function CreateSignature() {
    return withPageErrorBoundary(CreateNewSignaturePage)({});
  },
});

const createEnvelopeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/envelope/create",
  component: function Create() {
    return withPageErrorBoundary(CreateEnvelopePage)({});
  },
});

const addSignatureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/envelope/create/add-sign",
  component: function AddSignature() {
    return withPageErrorBoundary(AddSignaturePage)({});
  },
});

const allDocsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/files",
  component: function Files() {
    return withPageErrorBoundary(FilesPage)({});
  },
});

// Onboarding Routes
const onboardingWelcomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: function OnboardingWelcome() {
    return withPageErrorBoundary(OnboardingWelcomePage)({});
  },
});

const onboardingSetPinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding/set-pin",
  component: function OnboardingSetPin() {
    return withPageErrorBoundary(OnboardingSetPinPage)({});
  },
});

const onboardingCreateSignatureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding/create-signature",
  component: function OnboardingCreateSignature() {
    return withPageErrorBoundary(OnboardingCreateSignaturePage)({});
  },
});

const onboardingWelcomeCompleteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding/welcome",
  component: function OnboardingWelcomeComplete() {
    return withPageErrorBoundary(OnboardingWelcomeCompletePage)({});
  },
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "$",
  component: function NotFoundPage() {
    return <NotFound />;
  },
});

const testRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/test",
  component: function Test() {
    return withPageErrorBoundary(TestPage)({});
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  pitchRoute,
  dashboardRoute,
  profileRoute,
  dashboardDocumentAllRoute,
  dashboardDocumentFolderRoute,
  createEnvelopeRoute,
  addSignatureRoute,
  createSignatureRoute,
  allDocsRoute,
  onboardingWelcomeRoute,
  onboardingSetPinRoute,
  onboardingCreateSignatureRoute,
  onboardingWelcomeCompleteRoute,
  notFoundRoute,
  testRoute,
]);
const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default router;
