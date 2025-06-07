import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/teams/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/teams/"!</div>
}
