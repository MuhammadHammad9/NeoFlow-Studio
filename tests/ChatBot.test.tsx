import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ChatBot } from '../components/ChatBot';
import { ThemeProvider } from '../contexts/ThemeContext';
import React from 'react';

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('ChatBot Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders links with rel="noopener noreferrer" when opening in new tab', async () => {
    const maliciousLinkMsg = [
        {
            id: 'test-1',
            role: 'model',
            text: 'Here is a [link](https://example.com)',
            timestamp: Date.now()
        }
    ];

    // Mock getItem to return our message
    (window.localStorage.getItem as any).mockReturnValue(JSON.stringify(maliciousLinkMsg));

    render(
      <ThemeProvider>
        <ChatBot />
      </ThemeProvider>
    );

    // Wait for message to appear
    const link = await screen.findByRole('link', { name: /link/i });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
