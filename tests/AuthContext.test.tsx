import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('AuthContext Security', () => {
  beforeEach(() => {
    // Implement working localStorage mock
    let store: Record<string, string> = {};

    vi.mocked(window.localStorage.getItem).mockImplementation((key: string) => store[key] || null);
    vi.mocked(window.localStorage.setItem).mockImplementation((key: string, value: string) => {
      store[key] = value.toString();
    });
    vi.mocked(window.localStorage.removeItem).mockImplementation((key: string) => {
      delete store[key];
    });
    vi.mocked(window.localStorage.clear).mockImplementation(() => {
      store = {};
    });
  });

  it('should hash password upon registration', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.register('Test User', 'test@example.com', 'password123');
    });

    const storedUsers = JSON.parse(window.localStorage.getItem('neoflow_users') || '[]');
    expect(storedUsers).toHaveLength(1);
    expect(storedUsers[0].email).toBe('test@example.com');
    expect(storedUsers[0].password).toBeUndefined(); // Plaintext should not exist
    expect(storedUsers[0].passwordHash).toBeDefined();
    expect(storedUsers[0].salt).toBeDefined();
    expect(storedUsers[0].passwordHash).not.toBe('password123');
  });

  it('should login successfully with valid credentials', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.register('Test User', 'test@example.com', 'password123');
    });

    // Logout to reset state (though register auto-logins, we want to test explicit login flow maybe?
    // actually register auto-logins, so we can verify we are logged in first)
    expect(result.current.isAuthenticated).toBe(true);

    await act(async () => {
      result.current.logout();
    });
    expect(result.current.isAuthenticated).toBe(false);

    // Login
    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('test@example.com');
  });

  it('should fail login with invalid credentials', async () => {
     const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

     await act(async () => {
       await result.current.register('Test User', 'test@example.com', 'password123');
     });

     await act(async () => {
       result.current.logout();
     });

     await expect(async () => {
        await act(async () => {
            await result.current.login('test@example.com', 'wrongpassword');
        });
     }).rejects.toThrow('Invalid password.');
   });

  it('should upgrade legacy plaintext password to hashed', async () => {
    // Manually insert legacy user
    const legacyUser = {
      name: 'Legacy User',
      email: 'legacy@example.com',
      password: 'legacyPassword'
    };
    window.localStorage.setItem('neoflow_users', JSON.stringify([legacyUser]));

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.login('legacy@example.com', 'legacyPassword');
    });

    expect(result.current.isAuthenticated).toBe(true);

    const storedUsers = JSON.parse(window.localStorage.getItem('neoflow_users') || '[]');
    expect(storedUsers[0].password).toBeUndefined(); // Should be removed
    expect(storedUsers[0].passwordHash).toBeDefined(); // Should be added
    expect(storedUsers[0].salt).toBeDefined();
  });
});
