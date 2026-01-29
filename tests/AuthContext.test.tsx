import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { hashPassword } from '../utils/security';
import React, { useState } from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Wrapper component
const TestApp = ({ action, email = 'test@example.com', password = 'password123' }: { action: 'login' | 'register', email?: string, password?: string }) => {
  const Inner = () => {
    const { login, register } = useAuth();
    const [status, setStatus] = useState('idle');

    const handleAction = async () => {
      setStatus('loading');
      try {
        if (action === 'register') {
          await register('Test User', email, password);
          setStatus('registered');
        } else {
          await login(email, password);
          setStatus('logged_in');
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
            setStatus('error: ' + e.message);
        } else {
            setStatus('error: unknown error');
        }
      }
    };

    return (
      <div>
        <div data-testid="status">{status}</div>
        <button onClick={handleAction}>Do Action</button>
      </div>
    );
  };

  return (
    <AuthProvider>
      <Inner />
    </AuthProvider>
  );
};

describe('AuthContext Security', () => {
  beforeEach(() => {
    // Functional LocalStorage Mock
    let store: Record<string, string> = {};
    const localStorageMock = {
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
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
    vi.clearAllMocks();
  });

  it('registers user with hashed password', async () => {
    render(<TestApp action="register" />);

    const btn = screen.getByText('Do Action');
    fireEvent.click(btn);

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('registered'), { timeout: 2000 });

    const storedUsers = JSON.parse(window.localStorage.getItem('neoflow_users') || '[]');
    expect(storedUsers).toHaveLength(1);
    expect(storedUsers[0].email).toBe('test@example.com');

    // Verify password is NOT plaintext
    expect(storedUsers[0].password).not.toBe('password123');

    // Verify it IS the expected hash
    const expectedHash = await hashPassword('password123');
    expect(storedUsers[0].password).toBe(expectedHash);
  });

  it('upgrades legacy plaintext password to hash on login', async () => {
    // Setup legacy user
    const legacyUser = {
      name: 'Legacy User',
      email: 'legacy@example.com',
      password: 'legacyPassword' // Plaintext!
    };
    window.localStorage.setItem('neoflow_users', JSON.stringify([legacyUser]));

    render(<TestApp action="login" email="legacy@example.com" password="legacyPassword" />);

    const btn = screen.getByText('Do Action');
    fireEvent.click(btn);

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('logged_in'), { timeout: 2000 });

    // Verify storage is updated
    const storedUsers = JSON.parse(window.localStorage.getItem('neoflow_users') || '[]');
    expect(storedUsers[0].password).not.toBe('legacyPassword');
    const expectedHash = await hashPassword('legacyPassword');
    expect(storedUsers[0].password).toBe(expectedHash);
  });

  it('fails login with incorrect password', async () => {
     // Setup user with hashed password
     const password = 'securePassword';
     const hashedPassword = await hashPassword(password);

     const user = {
       name: 'Secure User',
       email: 'secure@example.com',
       password: hashedPassword
     };
     window.localStorage.setItem('neoflow_users', JSON.stringify([user]));

     render(<TestApp action="login" email="secure@example.com" password="wrongPassword" />);

     const btn = screen.getByText('Do Action');
     fireEvent.click(btn);

     await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('error'), { timeout: 2000 });
  });
});
