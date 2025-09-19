import {
  Outlet,
  createRouter,
  createRoute,
  createRootRoute,
} from '@tanstack/react-router'
import { withPageErrorBoundary } from "@/src/lib/components/errors/PageErrorBoundary";
import LandingPage from "./landing";
import { useAnalytics } from '../lib/hooks/use-analytics';
import DocumentAllPage from './dashboard/document/all';
import DocumentFolderPage from './dashboard/document/folder/$folderId';
import CreateEnvelopePage from './dashboard/envelope/create/create';
import AddSignaturePage from './dashboard/envelope/create/add-sign';
import CreateNewSignaturePage from './dashboard/signature/create';
import PitchPage from './pitch';
import FilesPage from './dashboard/files';
import DashboardPage from './dashboard';
import ProfilePage from './dashboard/profile';
import { NotFound } from '../lib/components/custom/NotFound';

const rootRoute = createRootRoute({
  component: () => {
    useAnalytics();

    return (
      <>
        <Outlet />
      </>
    )
  },
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: function Index() {
    return withPageErrorBoundary(LandingPage)({});
  },
})

const pitchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pitch',
  component: function Pitch() {
    return withPageErrorBoundary(PitchPage)({});
  },
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: function Dashboard() {
    return withPageErrorBoundary(DashboardPage)({});
  },
})

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/settings/profile',
  component: function Profile() {
    return withPageErrorBoundary(ProfilePage)({});
  },
})

const dashboardDocumentAllRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/document/all',
  component: function DocumentAll() {
    return withPageErrorBoundary(DocumentAllPage)({});
  },
})

const dashboardDocumentFolderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/document/folder/$folderId',
  component: function DocumentFolder() {
    return withPageErrorBoundary(DocumentFolderPage)({});
  },
})

const createSignatureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/signature/create',
  component: function CreateSignature() {
    return withPageErrorBoundary(CreateNewSignaturePage)({});
  },
})

const createEnvelopeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/envelope/create',
  component: function Create() {
    return withPageErrorBoundary(CreateEnvelopePage)({});
  },
})

const addSignatureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/envelope/create/add-sign',
  component: function AddSignature() {
    return withPageErrorBoundary(AddSignaturePage)({});
  },
})

const allDocsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/files',
  component: function Files() {
    return withPageErrorBoundary(FilesPage)({});
  },
})

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '$',
  component: function NotFoundPage() {
    return <NotFound />;
  },
})

const routeTree = rootRoute.addChildren([indexRoute, pitchRoute, dashboardRoute, profileRoute, dashboardDocumentAllRoute, dashboardDocumentFolderRoute, createEnvelopeRoute, addSignatureRoute, createSignatureRoute, allDocsRoute, notFoundRoute])
const router = createRouter({
  routeTree,
})
  
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default router;