import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ChatBot } from '../components/ChatBot';
import { ThemeProvider } from '../contexts/ThemeContext';

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('ChatBot Security', () => {
  beforeEach(() => {
    // Mock localStorage.getItem to return our crafted history
    const history = [
      {
        id: '1',
        role: 'model',
        text: 'Hello! Here is a [link](https://example.com)',
        timestamp: Date.now()
      }
    ];

    (localStorage.getItem as any).mockImplementation((key: string) => {
      if (key === 'gemini_chat_history') {
        return JSON.stringify(history);
      }
      return null;
    });
  });

  it('renders links with rel="noopener noreferrer" when target="_blank" is used', async () => {
    render(
      <ThemeProvider>
        <ChatBot />
      </ThemeProvider>
    );

    // Wait for the message to appear
    const link = await screen.findByText('link');

    // Check if the link exists
    expect(link).toBeInTheDocument();

    // Check for target="_blank"
    expect(link).toHaveAttribute('target', '_blank');

    // Check for rel="noopener noreferrer" (This is expected to fail initially)
    // Note: Use a more flexible check for rel attribute
    const rel = link.getAttribute('rel');
    expect(rel).toContain('noopener');
    expect(rel).toContain('noreferrer');
  });
});
