import { useAppForm } from '@/hooks/useAppForm';
import { teamClient } from '@/lib/team-client';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Team name is required'),
  description: z.string().min(1, 'Description is required'),
});

export const Route = createFileRoute('/_authenticated/teams/new-team')({
  component: NewTeamPage,
});

function NewTeamPage() {
  const navigate = useNavigate();
  const form = useAppForm({
    defaultValues: {
      name: '',
      description: '',
    },
    validators: {
      onBlur: schema,
    },
    onSubmit: async ({ value }) => {
      try {
        await teamClient.createTeam({
          name: value.name,
          description: value.description,
        });
        toast.success('Team created!');
        navigate({ to: '/teams' });
      } catch (err) {
        toast.error((err as Error).message || 'Failed to create team');
      }
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg border border-gray-200">
        <div className="text-xl font-semibold mb-1">Create a new team</div>
        <div className="text-gray-500 text-sm mb-6">Set a name and description for your team.</div>
        <form
          onSubmit={e => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
          noValidate
        >
          <form.AppField name="name">
            {(field) => <field.TextField label="Team name" placeholder="Enter team name" />}
          </form.AppField>
          <form.AppField name="description">
            {(field) => <field.TextArea label="Description" rows={3} />}
          </form.AppField>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md text-sm"
            disabled={form.state.isSubmitting}
          >
            {form.state.isSubmitting ? 'Creating…' : 'Create Team'}
          </button>
        </form>
      </div>
    </div>
  );
}
