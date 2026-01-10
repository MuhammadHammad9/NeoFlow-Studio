import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ToastProvider } from '../contexts/ToastContext';
import { Dashboard } from '../components/Dashboard';

// Mock Dependencies
vi.mock('../services/historyService', () => ({
  getHistory: () => [
    { id: '1', type: 'NOTE', title: 'Test Note', preview: 'Preview content', timestamp: Date.now() }
  ],
  getStats: () => ({ notes: 5, chats: 2, images: 1, tts: 0 }),
  clearHistoryLog: vi.fn(),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <ThemeProvider>
        <ToastProvider>
           {children}
        </ToastProvider>
    </ThemeProvider>
  </AuthProvider>
);

describe('Dashboard Component', () => {
  it('renders stats correctly', () => {
    render(
      <TestWrapper>
        <Dashboard onNavigate={vi.fn()} />
      </TestWrapper>
    );

    expect(screen.getByText('Smart Notes')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Count from mock
  });

  it('renders history items', async () => {
    render(
      <TestWrapper>
        <Dashboard onNavigate={vi.fn()} />
      </TestWrapper>
    );

    // Use findByText to wait for the async data to load
    expect(await screen.findByText('Test Note')).toBeInTheDocument();
    expect(await screen.findByText('Preview content')).toBeInTheDocument();
  });

  it('calls onNavigate when a quick action is clicked', () => {
    const onNavigate = vi.fn();
    render(
        <TestWrapper>
            <Dashboard onNavigate={onNavigate} />
        </TestWrapper>
    );

    const draftNoteBtn = screen.getByText('Draft a Note');
    fireEvent.click(draftNoteBtn);
    expect(onNavigate).toHaveBeenCalled();
  });
});
