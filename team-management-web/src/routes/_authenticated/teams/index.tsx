import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/teams/')({
  component: RouteComponent,
})

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function RouteComponent() {
  // Mocked team data
  const teams = [
    {
      id: 1,
      name: 'Frontend Wizards',
      description: 'Building beautiful and interactive user interfaces.',
      members: [
        { user: { id: '1', full_name: 'Alice Johnson', email: 'alice@example.com', phone_number: '1234567890' }, role: { id: '1', name: 'Admin', description: 'Admin' } },
        { user: { id: '2', full_name: 'Bob Smith', email: 'bob@example.com', phone_number: '1234567890' }, role: { id: '2', name: 'User', description: 'User' } },
      ],
    },
    {
      id: 2,
      name: 'Backend Ninjas',
      description: 'Crafting robust and scalable backend systems.',
      members: [
        { user: { id: '3', full_name: 'Charlie Brown', email: 'charlie@example.com', phone_number: '1234567890' }, role: { id: '3', name: 'Admin', description: 'Admin' } },
        { user: { id: '4', full_name: 'Dana White', email: 'dana@example.com', phone_number: '1234567890' }, role: { id: '4', name: 'User', description: 'User' } },
        { user: { id: '5', full_name: 'Eve Black', email: 'eve@example.com', phone_number: '1234567890' }, role: { id: '5', name: 'User', description: 'User' } },
        { user: { id: '6', full_name: 'Frank Green', email: 'frank@example.com', phone_number: '1234567890' }, role: { id: '6', name: 'User', description: 'User' } },
      ],
    },
  ];
  const membersByTeam = teams.reduce((acc: Record<number, { members: { user: { id: string, full_name: string, email: string, phone_number: string }, role: { id: string, name: string, description: string } }[], extraCount: number }>, team) => {
    const members = team.members.slice(0, 3);
    const extraCount = team.members.length - 3;
    acc[team.id] = {
      members,
      extraCount,
    }
    return acc
  }, {} as Record<number, { members: { user: { id: string, full_name: string, email: string, phone_number: string }, role: { id: string, name: string, description: string } }[], extraCount: number }>)

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto space-y-6">
        {teams.map((team) => {
          const { members, extraCount } = membersByTeam[team.id]
          return (
            <Card key={team.id} className="border border-gray-200 rounded-lg bg-white">
              <CardHeader>
                <CardTitle>{team.name}</CardTitle>
                <div className="text-gray-500 text-sm mt-1">{team.description}</div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center">
                     {members.map((member, idx) => (
                      <div
                        key={member.user.id}
                        className={`w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm border-2 border-white ${idx !== 0 ? '-ml-2' : ''}`}
                        title={member.user.full_name}
                      >
                        {getInitials(member.user.full_name)}
                      </div>
                    ))}
                    {extraCount > 0 && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-semibold text-sm border-2 border-white -ml-2">
                        +{extraCount}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="text-gray-400 w-8 h-8 mt-[-12%]" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
