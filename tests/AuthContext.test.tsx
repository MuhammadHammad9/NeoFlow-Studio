import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('AuthContext Security', () => {
  beforeEach(() => {
    // Mock localStorage implementation
    let store: Record<string, string> = {};

    vi.mocked(localStorage.getItem).mockImplementation((key) => store[key] || null);
    vi.mocked(localStorage.setItem).mockImplementation((key, value) => {
      store[key] = value.toString();
    });
    vi.mocked(localStorage.removeItem).mockImplementation((key) => {
      delete store[key];
    });
    vi.mocked(localStorage.clear).mockImplementation(() => {
      store = {};
    });
  });

  it('hashes password upon registration', async () => {
    let capturedRegister: any;
    const TestComp = () => {
      const auth = useAuth();
      capturedRegister = auth.register;
      return null;
    };

    render(
      <AuthProvider>
        <TestComp />
      </AuthProvider>
    );

    // Wait for auth to initialize
    await waitFor(() => expect(capturedRegister).toBeDefined());

    await act(async () => {
      await capturedRegister('Test', 'test@secure.com', 'secret123');
    });

    const storedUsers = JSON.parse(localStorage.getItem('neoflow_users') || '[]');
    expect(storedUsers).toHaveLength(1);
    expect(storedUsers[0].email).toBe('test@secure.com');
    // Verify password is NOT plaintext
    expect(storedUsers[0].password).not.toBe('secret123');
    // Verify it looks like a SHA-256 hash
    expect(storedUsers[0].password).toMatch(/^[a-f0-9]{64}$/);
  });

  it('migrates legacy plaintext password to hash on login', async () => {
    // Setup legacy user
    const legacyUser = { name: 'Legacy', email: 'legacy@test.com', password: 'plainpassword' };
    localStorage.setItem('neoflow_users', JSON.stringify([legacyUser]));

    let capturedLogin: any;
    const TestComp = () => {
      const auth = useAuth();
      capturedLogin = auth.login;
      return null;
    };

    render(
      <AuthProvider>
        <TestComp />
      </AuthProvider>
    );

    await waitFor(() => expect(capturedLogin).toBeDefined());

    await act(async () => {
      await capturedLogin('legacy@test.com', 'plainpassword');
    });

    // Check storage for migration
    const storedUsers = JSON.parse(localStorage.getItem('neoflow_users') || '[]');
    expect(storedUsers[0].password).not.toBe('plainpassword');
    expect(storedUsers[0].password).toMatch(/^[a-f0-9]{64}$/);

    // Check we are logged in
    const session = JSON.parse(localStorage.getItem('neoflow_session') || '{}');
    expect(session.email).toBe('legacy@test.com');
  });

  it('fails login with incorrect password', async () => {
    let capturedRegister: any;
    let capturedLogin: any;

    const TestComp = () => {
      const auth = useAuth();
      capturedRegister = auth.register;
      capturedLogin = auth.login;
      return null;
    };

    render(
      <AuthProvider>
        <TestComp />
      </AuthProvider>
    );

    await waitFor(() => expect(capturedRegister).toBeDefined());

    // Register first
    await act(async () => {
      await capturedRegister('Test', 'fail@test.com', 'correctpassword');
    });

    // Try login with wrong password
    // Note: Since login is async and might reject, we need to catch it.
    // Inside the component, we usually catch errors. Here we are calling the function directly.

    let error: any;
    try {
      await act(async () => {
        await capturedLogin('fail@test.com', 'wrongpassword');
      });
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.message).toBe('Invalid password.');
  });

  it('logs in successfully with correct password', async () => {
      let capturedRegister: any;
      let capturedLogin: any;
      let capturedIsAuthenticated: boolean = false;

      const TestComp = () => {
        const auth = useAuth();
        capturedRegister = auth.register;
        capturedLogin = auth.login;
        capturedIsAuthenticated = auth.isAuthenticated;
        return null;
      };

      const { rerender } = render(
        <AuthProvider>
          <TestComp />
        </AuthProvider>
      );

      await waitFor(() => expect(capturedRegister).toBeDefined());

      // Register
      await act(async () => {
        await capturedRegister('Test', 'success@test.com', 'correctpassword');
      });

      // Login
      await act(async () => {
        await capturedLogin('success@test.com', 'correctpassword');
      });

      rerender(
        <AuthProvider>
            <TestComp />
        </AuthProvider>
      );

      await waitFor(() => expect(capturedIsAuthenticated).toBe(true));
  });
});
