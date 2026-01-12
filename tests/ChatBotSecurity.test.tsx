import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChatBot } from '../components/ChatBot';
import { ThemeProvider } from '../contexts/ThemeContext';
import { vi, describe, it, expect } from 'vitest';

// Mock the dependencies
vi.mock('../services/geminiService', () => ({
  sendChatMessage: vi.fn(),
  getFriendlyErrorMessage: vi.fn(),
}));

vi.mock('../services/historyService', () => ({
  addToHistory: vi.fn(),
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('ChatBot Security', () => {
  it('should render links with target="_blank" AND rel="noopener noreferrer"', async () => {
    // We need to inject a message that contains a link.
    const vulnerableMessage = {
      id: 'test-msg',
      role: 'model',
      text: 'Here is a [link](https://example.com)',
      timestamp: Date.now()
    };

    // Mock localStorage.getItem to return our message
    const getItemSpy = vi.spyOn(window.localStorage, 'getItem');
    getItemSpy.mockImplementation((key) => {
      if (key === 'gemini_chat_history') {
        return JSON.stringify([vulnerableMessage]);
      }
      return null;
    });

    render(
      <ThemeProvider>
        <ChatBot />
      </ThemeProvider>
    );

    // Wait for the link to appear
    const link = await screen.findByText('link');

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');

    // Verify the fix
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
  });
});
