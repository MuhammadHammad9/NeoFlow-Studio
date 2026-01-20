import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
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
    // Clear localStorage mock
    // Note: setup.ts defines window.localStorage with vi.fn() methods
    (window.localStorage.getItem as any).mockReset();
    (window.localStorage.setItem as any).mockReset();

    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('renders links with rel="noopener noreferrer" to prevent reverse tabnabbing', async () => {
    // Setup malicious link in history
    const maliciousHistory = JSON.stringify([
      {
        id: '1',
        role: 'model',
        text: 'Here is a [Malicious Link](http://evil.com)',
        timestamp: Date.now()
      }
    ]);

    (window.localStorage.getItem as any).mockImplementation((key: string) => {
      if (key === 'gemini_chat_history') return maliciousHistory;
      return null;
    });

    render(
      <ThemeProvider>
        <ChatBot />
      </ThemeProvider>
    );

    // Wait for the link to appear
    const link = await waitFor(() => screen.getByText('Malicious Link'));

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'http://evil.com');
    expect(link).toHaveAttribute('target', '_blank');

    // This assertion is expected to fail initially
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
