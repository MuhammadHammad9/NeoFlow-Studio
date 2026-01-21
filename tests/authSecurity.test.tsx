import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import React from 'react';
import { vi, describe, it, expect, beforeAll } from 'vitest';

// Mock component to trigger auth actions
const TestComponent = () => {
    const { register, login } = useAuth();

    return (
        <div>
            <button onClick={() => register('Test User', 'test@example.com', 'password123')}>Register</button>
            <button onClick={() => login('test@example.com', 'password123')}>Login</button>
        </div>
    );
};

describe('Auth Security', () => {
    beforeAll(() => {
         // Polyfill Web Crypto API for JSDOM
         // eslint-disable-next-line @typescript-eslint/no-require-imports
         const { webcrypto } = require('node:crypto');

         // We need to ensure window.crypto is available and has subtle
         // Note: JSDOM might have basic crypto but not subtle
         Object.defineProperty(window, 'crypto', {
             writable: true,
             value: {
                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
                 getRandomValues: (arr: any) => webcrypto.getRandomValues(arr),
                 subtle: webcrypto.subtle,
             }
         });
    });

    it('should store hashed password instead of plaintext on register', async () => {
         // Mock localStorage if not already handled by setup.ts properly for persistence logic
         // setup.ts mocks it but we need to ensure getItem works as expected for our verification
         const store: Record<string, string> = {};

         vi.spyOn(window.localStorage, 'setItem').mockImplementation((key, value) => {
             store[key] = value;
         });
         vi.spyOn(window.localStorage, 'getItem').mockImplementation((key) => {
             return store[key] || null;
         });

         render(
             <AuthProvider>
                 <TestComponent />
             </AuthProvider>
         );

         const user = userEvent.setup();
         await user.click(screen.getByText('Register'));

         // Wait for async operation (setTimeout 800ms in AuthContext)
         await waitFor(() => {
             const stored = store['neoflow_users'];
             expect(stored).toBeTruthy();

             const users = JSON.parse(stored!);
             expect(users).toHaveLength(1);
             expect(users[0].email).toBe('test@example.com');

             // CRITICAL CHECK: Plaintext password should NOT be stored
             expect(users[0].password).toBeUndefined();

             // Hashed password AND salt should be stored
             expect(users[0].passwordHash).toBeDefined();
             expect(users[0].salt).toBeDefined();

             // Hash should not be the plaintext
             expect(users[0].passwordHash).not.toBe('password123');
         }, { timeout: 2000 });
    });
});
