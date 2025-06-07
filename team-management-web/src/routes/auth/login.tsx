import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { useAppForm } from '../../hooks/demo.form'
import { authClient } from '../../lib/auth-client'

const loginSearchParamsSchema = z.object({
  redirect: z.string().optional(),
})
type LoginSearchParams = z.infer<typeof loginSearchParamsSchema>

export const Route = createFileRoute('/auth/login')({
  component: LoginForm,
  validateSearch: (search: Record<string, unknown>): LoginSearchParams => {
    const parsed = loginSearchParamsSchema.safeParse(search)
    if (!parsed.success) {
        return {}
    }
    return parsed.data
  }
})

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

function LoginForm() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/auth/login' })
  const form = useAppForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onBlur: schema,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await authClient.login(value)
        navigate({ to: (search?.redirect) || '/teams' })
      } catch (err) {
        formApi.resetField('password')
        toast.error('Invalid email or password')
      }
    },
  })

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm bg-white p-6 rounded-lg border border-gray-200">
        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.AppField name="email">
            {(field) => <field.TextField label="Email" placeholder="Enter your email" />}
          </form.AppField>
          <form.AppField name="password">
            {(field) => <field.PasswordField label="Password" placeholder="Enter your password" />}
          </form.AppField>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md text-sm"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}
