import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import React from 'react';

// Wrap provider
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext Security', () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {};

    vi.spyOn(window.localStorage, 'getItem').mockImplementation((key) => {
      return store[key] || null;
    });
    vi.spyOn(window.localStorage, 'setItem').mockImplementation((key, value) => {
      store[key] = value.toString();
    });
    vi.spyOn(window.localStorage, 'removeItem').mockImplementation((key) => {
      delete store[key];
    });
  });

  it('should hash password on registration', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register('Test User', 'test@example.com', 'password123');
    });

    const storedUsers = JSON.parse(store['neoflow_users']);
    expect(storedUsers).toHaveLength(1);
    expect(storedUsers[0].email).toBe('test@example.com');
    expect(storedUsers[0].password).not.toBe('password123'); // Should be hashed
    expect(storedUsers[0].salt).toBeDefined();
  });

  it('should login successfully with hashed password', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register('Test User', 'test@example.com', 'password123');
    });

    // Logout to clear session
    act(() => {
        result.current.logout();
    });

    // Login again
    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('test@example.com');
  });

  it('should fail login with wrong password', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register('Test User', 'test@example.com', 'password123');
    });

    act(() => {
        result.current.logout();
    });

    await expect(async () => {
        await act(async () => {
            await result.current.login('test@example.com', 'wrongpassword');
        });
    }).rejects.toThrow('Invalid password.');
  });

  it('should upgrade legacy plaintext password to hash on login', async () => {
    // Seed with legacy user
    const legacyUser = {
        name: 'Legacy User',
        email: 'legacy@example.com',
        password: 'plainpassword' // Plaintext!
    };
    store['neoflow_users'] = JSON.stringify([legacyUser]);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Login with plaintext
    await act(async () => {
      await result.current.login('legacy@example.com', 'plainpassword');
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Verify storage was updated
    const storedUsers = JSON.parse(store['neoflow_users']);
    const updatedUser = storedUsers[0];

    expect(updatedUser.password).not.toBe('plainpassword'); // Should be hashed now
    expect(updatedUser.salt).toBeDefined();

    // Verify we can login again with the new hash
    act(() => {
        result.current.logout();
    });

    await act(async () => {
        await result.current.login('legacy@example.com', 'plainpassword');
    });
    expect(result.current.isAuthenticated).toBe(true);
  });
});
