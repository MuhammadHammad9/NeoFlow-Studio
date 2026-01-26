import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatBot } from '../components/ChatBot';
import { ThemeProvider } from '../contexts/ThemeContext';

describe('ChatBot Security', () => {
  beforeEach(() => {
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();

    // Clear localStorage before each test
    window.localStorage.clear();
  });

  it('renders external links with rel="noopener noreferrer"', () => {
    // Seed localStorage with a message containing a link
    const maliciousMessage = {
      id: 'test-msg-1',
      role: 'model',
      text: 'Check out this [Malicious Link](http://evil.com)',
      timestamp: Date.now()
    };

    // Mock getItem to return our seeded history
    // Note: The setup.ts mocks localStorage completely, so we should rely on its implementation if it works,
    // or override it. The setup.ts defines window.localStorage with spies.
    // Let's just override the spy for this test to be sure.
    vi.spyOn(window.localStorage, 'getItem').mockImplementation((key) => {
      if (key === 'gemini_chat_history') {
        return JSON.stringify([maliciousMessage]);
      }
      return null;
    });

    render(
      <ThemeProvider>
        <ChatBot />
      </ThemeProvider>
    );

    const link = screen.getByRole('link', { name: /Malicious Link/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('target', '_blank');

    // This assertion checks for the security fix
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
