import {
  Outlet,
  createRouter,
  createRoute,
  createRootRoute,
  redirect,
} from '@tanstack/react-router'
import { withPageErrorBoundary } from "@/src/lib/components/errors/PageErrorBoundary";
import LandingPage from "./landing";
import { useAnalytics } from '../lib/hooks/use-analytics';
import DocumentAllPage from './dashboard/document/all';
import CreateEnvelopePage from './dashboard/envelope/create/create-envelope';
import AddSignaturePage from './dashboard/envelope/create/add-sign';
import CreateNewSignaturePage from './dashboard/signature/create';
import PitchPage from './pitch';  
import FilesPage from './dashboard/files';

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
  beforeLoad: () => {
    throw redirect({
      to: '/dashboard/document/all',
      replace: true,
    });
  },
})

const dashboardDocumentAllRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/document/all',
  component: function DocumentAll() {
    return withPageErrorBoundary(DocumentAllPage)({});
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



const routeTree = rootRoute.addChildren([indexRoute, pitchRoute, dashboardRoute, dashboardDocumentAllRoute, createEnvelopeRoute, addSignatureRoute, createSignatureRoute, allDocsRoute])
const router = createRouter({
  routeTree,
})
  
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default router;