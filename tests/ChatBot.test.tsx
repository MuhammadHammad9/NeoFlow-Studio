import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ChatBot } from '../components/ChatBot';
import { ThemeProvider } from '../contexts/ThemeContext';
import * as geminiService from '../services/geminiService';

// Mock geminiService
vi.mock('../services/geminiService', () => ({
  sendChatMessage: vi.fn(),
  getFriendlyErrorMessage: vi.fn(),
}));

// Mock historyService
vi.mock('../services/historyService', () => ({
  addToHistory: vi.fn(),
}));

describe('ChatBot Security Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('renders links securely', async () => {
    // Setup mock response with a link
    const mockResponse = 'Check out [NeoFlow](https://neoflow.app)';
    vi.mocked(geminiService.sendChatMessage).mockResolvedValue(mockResponse);

    render(
      <ThemeProvider>
        <ChatBot />
      </ThemeProvider>
    );

    const input = screen.getByPlaceholderText(/Ask NeoFlow anything/i);

    // Simulate typing
    fireEvent.change(input, { target: { value: 'Hello' } });

    const form = input.closest('form');
    if (!form) throw new Error("Form not found");

    // Submit form
    fireEvent.submit(form);

    // Wait for response
    await waitFor(() => {
      // We look for the text that is part of the link's surrounding text
      // Note: ReactMarkdown might split text into different elements, but "Check out" should be there
      // or we can look for the link directly
      expect(screen.getByRole('link', { name: 'NeoFlow' })).toBeInTheDocument();
    });

    // Find the link
    const link = screen.getByRole('link', { name: 'NeoFlow' });

    // Assert it has target="_blank"
    expect(link).toHaveAttribute('target', '_blank');

    // Assert it HAS rel="noopener noreferrer"
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
