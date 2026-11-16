/**
 * Authentication service.
 *
 * A thin, intention revealing layer on top of `api.ts` — the components call
 * `authService.login(...)` instead of `authApi.login(...)`.
 */

import { authApi, type RegisterPayload } from './api';
import type { AuthResponse, User } from '../types';

export const authService = {
  /** Sign in with e-mail and password. */
  login(email: string, password: string): Promise<AuthResponse> {
    return authApi.login(email, password);
  },

  /** Create a new account and sign in. */
  register(payload: RegisterPayload): Promise<AuthResponse> {
    return authApi.register(payload);
  },

  /** Invalidate the current token. */
  logout(): Promise<void> {
    return authApi.logout();
  },

  /** The currently signed in user. */
  me(signal?: AbortSignal): Promise<User> {
    return authApi.me(signal);
  },
};

export default authService;
