import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';

// Wrapper for AuthProvider
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext Security', () => {
  beforeEach(() => {
    // Mock localStorage implementation
    let store: Record<string, string> = {};

    const mockStorage = {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
      removeItem: vi.fn((key: string) => { delete store[key]; }),
      clear: vi.fn(() => { store = {}; }),
      length: 0,
      key: vi.fn((_i: number) => null),
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true
    });
  });

  it('should store hashed password on register', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register('Test User', 'test@example.com', 'password123');
    });

    const storedUsers = JSON.parse(window.localStorage.getItem('neoflow_users') || '[]');
    expect(storedUsers).toHaveLength(1);
    const user = storedUsers[0];
    expect(user.email).toBe('test@example.com');
    expect(user.password).toBeUndefined(); // No plaintext
    expect(user.passwordHash).toBeDefined();
    expect(user.salt).toBeDefined();
  });

  it('should login successfully with hashed password', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Register first
    await act(async () => {
      await result.current.register('Test User', 'test@example.com', 'password123');
    });

    // Login
    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should fail login with wrong password', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register('Test User', 'test@example.com', 'password123');
    });

    await expect(async () => {
      await act(async () => {
        await result.current.login('test@example.com', 'wrongpassword');
      });
    }).rejects.toThrow('Invalid password');
  });

  it('should migrate legacy password to hash on login', async () => {
    // Setup legacy user
    const legacyUser = {
      name: 'Legacy User',
      email: 'legacy@example.com',
      password: 'legacyPassword'
    };
    window.localStorage.setItem('neoflow_users', JSON.stringify([legacyUser]));

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Login
    await act(async () => {
      await result.current.login('legacy@example.com', 'legacyPassword');
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Verify migration
    const storedUsers = JSON.parse(window.localStorage.getItem('neoflow_users') || '[]');
    const user = storedUsers[0];
    expect(user.password).toBeUndefined();
    expect(user.passwordHash).toBeDefined();
    expect(user.salt).toBeDefined();
  });
});
