import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { ChatBot } from '../components/ChatBot';
import { ThemeProvider } from '../contexts/ThemeContext';

// Mock dependencies
vi.mock('../services/geminiService', () => ({
  sendChatMessage: vi.fn(),
  getFriendlyErrorMessage: vi.fn(),
}));

vi.mock('../services/historyService', () => ({
  addToHistory: vi.fn(),
}));

describe('ChatBot Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock scrollIntoView which is not implemented in jsdom
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('renders links with rel="noopener noreferrer" to prevent reverse tabnabbing', async () => {
    // Setup initial state with a message containing a link
    const maliciousLink = 'https://malicious-site.com';
    const initialMessages = [
      {
        id: '1',
        role: 'model',
        text: `Here is a [link](${maliciousLink})`,
        timestamp: Date.now(),
      },
    ];

    // Mock localStorage.getItem to return our history
    // Note: window.localStorage is mocked in tests/setup.ts
    const getItemMock = window.localStorage.getItem as unknown as ReturnType<typeof vi.fn>;
    getItemMock.mockImplementation((key: string) => {
        if (key === 'gemini_chat_history') {
            return JSON.stringify(initialMessages);
        }
        return null;
    });

    render(
      <ThemeProvider>
        <ChatBot />
      </ThemeProvider>
    );

    // Wait for the message to appear
    const linkElement = await waitFor(() => screen.getByRole('link', { name: /link/i }));

    // Check for security attributes
    expect(linkElement).toHaveAttribute('href', maliciousLink);
    expect(linkElement).toHaveAttribute('target', '_blank');

    // These expectations verify the security fix
    const rel = linkElement.getAttribute('rel');
    expect(rel).not.toBeNull();
    expect(rel).toContain('noopener');
    expect(rel).toContain('noreferrer');
  });
});
