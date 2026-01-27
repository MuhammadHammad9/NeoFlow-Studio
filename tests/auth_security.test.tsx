import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { describe, it, expect, beforeEach, Mock } from 'vitest';

// Test component to trigger auth actions
const TestComponent = () => {
  const { register, login, user, isAuthenticated } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <div data-testid="user-info">{user?.email}</div>
      ) : (
        <div data-testid="login-form">
            <button onClick={() => register('Test User', 'test@example.com', 'password123')}>Register</button>
            <button onClick={() => login('test@example.com', 'password123')}>Login</button>
        </div>
      )}
    </div>
  );
};

describe('Auth Security', () => {
  beforeEach(() => {
    window.localStorage.clear();
    // Reset mocks if needed
  });

  it('should store passwords as hashes, not plaintext', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Click Register
    const registerBtn = screen.getByText('Register');
    await user.click(registerBtn);

    // Wait for registration to complete (simulated delay in AuthContext)
    await waitFor(() => {
        expect(screen.getByTestId('user-info')).toHaveTextContent('test@example.com');
    }, { timeout: 2000 });

    // Check localStorage
    // We need to access the mock directly or via window.localStorage
    // Note: In setup.ts, localStorage is mocked.
    // However, the mock implementation in setup.ts uses jest.fn() which doesn't automatically store state
    // unless implemented to do so.
    // Let's check setup.ts again.

    // Ah, setup.ts mocks methods with vi.fn(). It doesn't seem to have an underlying store implementation
    // that persists data between calls unless we provided one.
    // BUT, AuthContext uses localStorage.setItem.
    // So we can check the calls to localStorage.setItem.

    expect(window.localStorage.setItem).toHaveBeenCalled();

    // Find the call that sets 'neoflow_users'
    const setItemMock = window.localStorage.setItem as Mock;
    const calls = setItemMock.mock.calls;
    const usersCall = calls.find((call: unknown[]) => call[0] === 'neoflow_users');

    expect(usersCall).toBeDefined();

    // safe cast since we know it's a localStorage.setItem call which takes (key, value)
    const args = usersCall as [string, string];
    const storedUsers = JSON.parse(args[1]);

    expect(storedUsers).toHaveLength(1);
    const storedUser = storedUsers[0];

    expect(storedUser.email).toBe('test@example.com');

    // CRITICAL SECURITY CHECK: Password should NOT be plaintext
    // This expectation will fail initially (which is correct for TDD)
    expect(storedUser.password).not.toBe('password123');

    // Ensure it has a salt (once implemented)
    // expect(storedUser.salt).toBeDefined();
  });
});
