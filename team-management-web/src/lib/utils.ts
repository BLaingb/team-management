import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { TeamPermission } from './team-client'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string) {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase();
}

export function hasTeamPermission(permission: string, teamPermissions: TeamPermission['permissions'] = []): boolean {
  return teamPermissions.includes(permission);
}

export function ensurePhoneNumberPrefix(value: string) {
  if (value.startsWith('+')) {
    return value
  }
  return `+${value}`
}

