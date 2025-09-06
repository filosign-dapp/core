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
import CreateEnvelopePage from './dashboard/create';
import AddSignaturePage from './dashboard/create/add-signature';

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

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: function Dashboard() {
    return withPageErrorBoundary(DashboardPage)({});
  },
})

const createEnvelopeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/create',
  component: function Create() {
    return withPageErrorBoundary(CreateEnvelopePage)({});
  },
})

const addSignatureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/create/add-signature',
  component: function AddSignature() {
    return withPageErrorBoundary(AddSignaturePage)({});
  },
})


const routeTree = rootRoute.addChildren([indexRoute, dashboardRoute, createEnvelopeRoute, addSignatureRoute])
const router = createRouter({
  routeTree,
})
  
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default router;