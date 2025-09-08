import {
  Outlet,
  createRouter,
  createRoute,
  createRootRoute,
} from '@tanstack/react-router'
import { withPageErrorBoundary } from "@/src/lib/components/errors/PageErrorBoundary";
import LandingPage from "./landing";
import { useAnalytics } from '../lib/hooks/use-analytics';
import DashboardPage from './dashboard';
import CreateEnvelopePage from './dashboard/envelope/create/create-envelope';
import AddSignaturePage from './dashboard/envelope/create/add-sign';
import CreateNewSignaturePage from './dashboard/signature/create';
import PitchPage from './pitch';  

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


const routeTree = rootRoute.addChildren([indexRoute, dashboardRoute, createEnvelopeRoute, addSignatureRoute, createSignatureRoute, pitchRoute])
const router = createRouter({
  routeTree,
})
  
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default router;