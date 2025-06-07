// src/routes/(authenticated).tsx
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { getContext } from '../integrations/tanstack-query/root-provider';
import { sessionQueryOptions } from '../lib/auth-client';


export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { queryClient } = getContext();
    const session = await queryClient.fetchQuery(sessionQueryOptions);

    if (!session) {
      throw redirect({
        to: '/auth/login',
        search: {
          redirect: location.pathname,
        },
      });
    }

    return { session };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
}