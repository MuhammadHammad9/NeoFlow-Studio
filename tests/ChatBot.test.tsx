import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { ChatBot } from '../components/ChatBot';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ChatMessage } from '../types';

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('ChatBot Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // localStorage is mocked in setup.ts, we reset the mock implementation
    vi.mocked(localStorage.getItem).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders links with rel="noopener noreferrer" for security', async () => {
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        role: 'model',
        text: 'Here is a [malicious link](https://example.com)',
        timestamp: Date.now(),
      },
    ];

    // Mock localStorage to return our messages
    vi.mocked(localStorage.getItem).mockImplementation((key) => {
      if (key === 'gemini_chat_history') {
        return JSON.stringify(mockMessages);
      }
      return null;
    });

    render(
      <ThemeProvider>
        <ChatBot />
      </ThemeProvider>
    );

    // Wait for the message to be rendered (it happens in useEffect)
    const link = await screen.findByText('malicious link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('target', '_blank');

    // This expectation is expected to fail initially
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
