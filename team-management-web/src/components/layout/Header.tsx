import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { authClient } from '../../lib/auth-client'
import { Button } from '../ui/button'

export default function Header() {
  const navigate = useNavigate()
  const { data: session, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: authClient.getSession,
  })

  const handleLogout = async () => {
    try {
      await authClient.logout()
      toast.success('Logged out successfully')
      navigate({ to: '/auth/login' })
    } catch (err) {
      toast.error('Logout failed')
    }
  }

  return (
    <header className="p-2 flex gap-2 bg-white text-black justify-between items-center border-b border-gray-200">
      <nav className="flex flex-row">
        <div className="px-2 font-bold">
          <Link to="/">Home</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to="/teams">Teams</Link>
        </div>
      </nav>
      {!isLoading && session && (
        <Button onClick={handleLogout} className="bg-gray-700 hover:bg-gray-900 text-white rounded-md text-sm px-4 py-2">
          Logout
        </Button>
      )}
    </header>
  )
}
