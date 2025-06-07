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
      id: 'team-1',
      name: 'Frontend Wizards',
      description: 'Building beautiful and interactive user interfaces.',
      members: [
        { id: '1', name: 'Alice Johnson', email: 'alice@example.com' },
        { id: '2', name: 'Bob Smith', email: 'bob@example.com' },
      ],
    },
    {
      id: 'team-2',
      name: 'Backend Ninjas',
      description: 'Crafting robust and scalable backend systems.',
      members: [
        { id: '3', name: 'Charlie Brown', email: 'charlie@example.com' },
        { id: '4', name: 'Dana White', email: 'dana@example.com' },
        { id: '5', name: 'Eve Black', email: 'eve@example.com' },
        { id: '6', name: 'Frank Green', email: 'frank@example.com' },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto space-y-6">
        {teams.map((team) => {
          const firstThree = team.members.slice(0, 3)
          const extraCount = team.members.length - 3
          return (
            <Card key={team.id} className="border border-gray-200 rounded-lg bg-white">
              <CardHeader>
                <CardTitle>{team.name}</CardTitle>
                <div className="text-gray-500 text-sm mt-1">{team.description}</div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center">
                    {firstThree.map((member, idx) => (
                      <div
                        key={member.id}
                        className={`w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm border-2 border-white ${idx !== 0 ? '-ml-2' : ''}`}
                        title={member.name}
                      >
                        {getInitials(member.name)}
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
