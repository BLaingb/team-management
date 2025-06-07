import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="text-center">
      <header className="min-h-screen flex flex-col items-center justify-center bg-[#282c34] text-white text-[calc(10px+2vmin)]">
        <h1>Instawork Team Management</h1>
        <h3>Start managing your team today</h3>
        <Link to="/teams" className="text-blue-500">
          Go to Team Management
        </Link>
      </header>
    </div>
  )
}
