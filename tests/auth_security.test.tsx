import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Simple mock for localStorage to actually store data for the test context
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

interface TestAuthProps {
  action: 'register' | 'login';
  args: string[];
  onComplete?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError?: (error: any) => void;
}

const TestAuth = ({ action, args, onComplete, onError }: TestAuthProps) => {
  const { register, login } = useAuth();

  useEffect(() => {
    const performAction = async () => {
      try {
        if (action === 'register') {
          await register(args[0], args[1], args[2]);
        } else if (action === 'login') {
          await login(args[0], args[1]);
        }
        if (onComplete) onComplete();
      } catch (e) {
        if (onError) onError(e);
      }
    };
    performAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div>Test Action</div>;
};

describe('Auth Security', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('stores password hashed (Fix Verification)', async () => {
    render(
      <AuthProvider>
        <TestAuth action="register" args={['Test User', 'newuser@example.com', 'password123']} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('neoflow_users', expect.any(String));
    }, { timeout: 2000 });

    const storedUsersJson = localStorageMock.getItem('neoflow_users');
    expect(storedUsersJson).not.toBeNull();

    if (storedUsersJson) {
      const users = JSON.parse(storedUsersJson);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = users.find((u: any) => u.email === 'newuser@example.com');

      expect(user).toBeDefined();
      expect(user.password).not.toBe('password123'); // Should NOT be plaintext
      expect(user.password).toMatch(/^[a-f0-9]{64}$/); // Should be SHA-256 hex (64 chars)
    }
  });

  it('upgrades legacy plaintext password to hash on login', async () => {
    // 1. Setup legacy user in localStorage
    const legacyUser = {
      name: 'Legacy User',
      email: 'legacy@example.com',
      password: 'password123' // stored as plaintext
    };
    localStorageMock.setItem('neoflow_users', JSON.stringify([legacyUser]));

    // 2. Attempt login
    const onComplete = vi.fn();
    render(
      <AuthProvider>
        <TestAuth action="login" args={['legacy@example.com', 'password123']} onComplete={onComplete} />
      </AuthProvider>
    );

    // 3. Wait for login to succeed
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    }, { timeout: 2000 });

    // 4. Verify password is now hashed in localStorage
    const storedUsersJson = localStorageMock.getItem('neoflow_users');
    const users = JSON.parse(storedUsersJson!);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = users.find((u: any) => u.email === 'legacy@example.com');

    expect(user.password).not.toBe('password123');
    expect(user.password).toMatch(/^[a-f0-9]{64}$/);
  });

  it('allows login with hashed password', async () => {
    // Register first to generate hash
    render(
      <AuthProvider>
        <TestAuth action="register" args={['Hash User', 'hash@example.com', 'password123']} />
      </AuthProvider>
    );

    await waitFor(() => {
        // Wait for registration
        expect(localStorageMock.setItem).toHaveBeenCalled();
    }, { timeout: 2000 });

    // Clear mocks but keep storage
    vi.clearAllMocks();

    // Now try to login
    const onComplete = vi.fn();
    const onError = vi.fn();

    render(
       <AuthProvider>
         <TestAuth action="login" args={['hash@example.com', 'password123']} onComplete={onComplete} onError={onError} />
       </AuthProvider>
    );

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    }, { timeout: 2000 });
  });
});
