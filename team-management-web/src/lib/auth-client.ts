
import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod';
import { env } from '../env';
import { getContext } from '../integrations/tanstack-query/root-provider';

const SESSION_QUERY_KEY = ['session'];

const userSchema = z.object({
  id: z.number(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
});

const { queryClient } = getContext();

export const authClient = {
  getSession: async () => {
    try {
      const response = await fetch(`${env.VITE_API_URL}/api/token/verify/`, { method: 'POST', credentials: 'include' });
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return userSchema.parse(data);
    } catch (error) {
      console.error('Error fetching session:', error);
      return null;
    }
  },

  login: async (credentials: { email: string; password: string }) => {
    try {
        const response = await fetch(`${env.VITE_API_URL}/api/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Login failed');
        }
        queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
        const data = await response.json();
        return userSchema.parse(data);
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  logout: async () => {
    const response = await fetch(`${env.VITE_API_URL}/api/logout/`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Logout failed');
    }
    queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
  },
};

export const sessionQueryOptions = queryOptions({
  queryKey: SESSION_QUERY_KEY,
  queryFn: () => authClient.getSession(),
  staleTime: 5 * 60 * 1000, // 5 minutes
});