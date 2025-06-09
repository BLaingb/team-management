import { useAppForm } from "@/hooks/useAppForm";
import { authClient } from "@/lib/auth-client";
import type { TeamInvitationDetail } from "@/lib/team-client";
import { toast } from "sonner";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone_number: z.string().min(1, "Phone number is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  password2: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.password2, {
  message: "Passwords do not match",
  path: ["password2"],
});

export function SignupForm({ invitation, onSuccess }: { invitation: TeamInvitationDetail; onSuccess: () => void }) {
  const form = useAppForm({
    defaultValues: {
      email: invitation.email || "",
      first_name: invitation.first_name || "",
      last_name: invitation.last_name || "",
      phone_number: invitation.phone_number || "",
      password: "",
      password2: "",
    },
    validators: {
      onBlur: signupSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await authClient.signup(value);
        toast.success("Signup successful!");
        onSuccess();
      } catch (err) {
        toast.error((err as Error).message || "Signup failed");
      }
    },
  });

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4 w-full"
      noValidate
    >
      <form.AppField name="first_name">
        {(field) => <field.TextField label="First Name" placeholder="Enter your first name" />}
      </form.AppField>
      <form.AppField name="last_name">
        {(field) => <field.TextField label="Last Name" placeholder="Enter your last name" />}
      </form.AppField>
      <form.AppField name="email">
        {(field) => <field.TextField label="Email" placeholder="Enter your email" />}
      </form.AppField>
      <form.AppField name="phone_number">
        {(field) => <field.TextField label="Phone Number" placeholder="Enter your phone number" />}
      </form.AppField>
      <form.AppField name="password">
        {(field) => <field.PasswordField label="Password" placeholder="********" />}
      </form.AppField>
      <form.AppField name="password2">
        {(field) => <field.PasswordField label="Confirm Password" placeholder="********" />}
      </form.AppField>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md text-sm"
        disabled={form.state.isSubmitting}
      >
        {form.state.isSubmitting ? "Signing up..." : "Sign up & accept invitation"}
      </button>
    </form>
  );
} 