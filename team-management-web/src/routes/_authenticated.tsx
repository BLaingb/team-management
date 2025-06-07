// src/routes/(authenticated).tsx
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { getContext } from '../integrations/tanstack-query/root-provider';
import { sessionQueryOptions } from '../lib/auth-client';


export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { queryClient } = getContext();
    // Attempt to get session data.
    // This will hit the backend if not cached or stale.
    const session = await queryClient.fetchQuery(sessionQueryOptions);

    if (!session) {
      // If no session, redirect to login page.
      // The `search` parameter is useful for redirecting back after successful login.
      throw redirect({
        to: '/auth/login',
        search: {
          redirect: location.pathname,
        },
      });
    }

    // If session exists, pass it to the loader context for child routes if needed
    return { session };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  // This layout will only render if the user is authenticated
  return (
    <div className="min-h-screen">
      <header>
        <h1>Protected App</h1>
        {/* Navigation, Logout button, etc. */}
      </header>
      <Outlet /> {/* Renders the child route components */}
    </div>
  );
}