import { toast } from 'sonner';
import { env } from '../env';

function isTokenNotValidError(data: unknown): data is { code: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'code' in data &&
    (data as { code: unknown }).code === 'token_not_valid'
  );
}

/**
 * Wrapper around fetch that handles token expiration and refresh for authenticated requests to 
 * the Team Management API.
 * @param input - The URL to fetch
 * @param init - The fetch options
 * @returns The response from the fetch call
 */
export async function apiClient(input: RequestInfo, init?: RequestInit, retryOnAuthError = true): Promise<Response> {
  let response = await fetch(input, { ...init, credentials: 'include' });

  if (response.status === 401) {
    let data: unknown = {};
    try {
      data = await response.clone().json();
    } catch {}
    if (isTokenNotValidError(data) && retryOnAuthError) {
      const refreshResponse = await fetch(`${env.VITE_API_URL}/api/token/refresh/`, {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshResponse.ok) {
        // Retry the original request if refresh is successful
        response = await fetch(input, { ...init, credentials: 'include' });
        if (response.status !== 401) {
          return response;
        }
      }
      // If refresh fails, redirect to login and show toast
      toast.error('Session expired. Please log in again.');
      window.location.href = '/auth/login';
      throw new Error('Session expired. Please log in again.');
    }
  }

  return response;
} 