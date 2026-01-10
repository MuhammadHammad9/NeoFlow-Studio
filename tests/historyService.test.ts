import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getHistory, addToHistory, clearHistoryLog, getStats } from '../services/historyService';

describe('historyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (localStorage.getItem as any).mockReturnValue(null);
    (localStorage.setItem as any).mockImplementation(() => {});
    (localStorage.removeItem as any).mockImplementation(() => {});
  });

  describe('getHistory', () => {
    it('should return empty array when no history exists', () => {
      (localStorage.getItem as any).mockReturnValue(null);
      
      const result = getHistory();
      
      expect(result).toEqual([]);
      expect(localStorage.getItem).toHaveBeenCalledWith('neoflow_activity_log');
    });

    it('should return parsed history when it exists', () => {
      const mockHistory = [
        { id: '1', type: 'NOTE', title: 'Test', preview: 'Preview', timestamp: 12345 }
      ];
      (localStorage.getItem as any).mockReturnValue(JSON.stringify(mockHistory));
      
      const result = getHistory();
      
      expect(result).toEqual(mockHistory);
    });

    it('should return empty array on JSON parse error', () => {
      (localStorage.getItem as any).mockReturnValue('invalid json');
      
      const result = getHistory();
      
      expect(result).toEqual([]);
    });
  });

  describe('addToHistory', () => {
    it('should add a new item to history', () => {
      (localStorage.getItem as any).mockReturnValue(null);
      
      addToHistory('NOTE', 'Test Note', 'This is a test preview');
      
      expect(localStorage.setItem).toHaveBeenCalled();
      const setItemCall = (localStorage.setItem as any).mock.calls[0];
      expect(setItemCall[0]).toBe('neoflow_activity_log');
      
      const savedData = JSON.parse(setItemCall[1]);
      expect(savedData).toHaveLength(1);
      expect(savedData[0].type).toBe('NOTE');
      expect(savedData[0].title).toBe('Test Note');
      expect(savedData[0].preview).toBe('This is a test preview');
    });

    it('should truncate preview to 180 characters', () => {
      (localStorage.getItem as any).mockReturnValue(null);
      const longPreview = 'a'.repeat(200);
      
      addToHistory('CHAT', 'Test', longPreview);
      
      const setItemCall = (localStorage.setItem as any).mock.calls[0];
      const savedData = JSON.parse(setItemCall[1]);
      expect(savedData[0].preview).toHaveLength(183); // 180 + '...'
      expect(savedData[0].preview).toContain('...');
    });

    it('should prepend new items to existing history', () => {
      const existingHistory = [
        { id: '1', type: 'NOTE', title: 'Old', preview: 'Old preview', timestamp: 12345 }
      ];
      (localStorage.getItem as any).mockReturnValue(JSON.stringify(existingHistory));
      
      addToHistory('CHAT', 'New', 'New preview');
      
      const setItemCall = (localStorage.setItem as any).mock.calls[0];
      const savedData = JSON.parse(setItemCall[1]);
      expect(savedData).toHaveLength(2);
      expect(savedData[0].type).toBe('CHAT');
      expect(savedData[1].type).toBe('NOTE');
    });

    it('should limit history to 100 items', () => {
      const existingHistory = Array.from({ length: 100 }, (_, i) => ({
        id: String(i),
        type: 'NOTE',
        title: `Note ${i}`,
        preview: `Preview ${i}`,
        timestamp: i
      }));
      (localStorage.getItem as any).mockReturnValue(JSON.stringify(existingHistory));
      
      addToHistory('CHAT', 'New', 'New preview');
      
      const setItemCall = (localStorage.setItem as any).mock.calls[0];
      const savedData = JSON.parse(setItemCall[1]);
      expect(savedData).toHaveLength(100);
      expect(savedData[0].type).toBe('CHAT');
    });

    it('should dispatch historyUpdated event', () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
      (localStorage.getItem as any).mockReturnValue(null);
      
      addToHistory('IMAGE', 'Test', 'Preview');
      
      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
      const eventArg = dispatchEventSpy.mock.calls[0][0] as Event;
      expect(eventArg.type).toBe('historyUpdated');
    });
  });

  describe('clearHistoryLog', () => {
    it('should remove history from localStorage', () => {
      clearHistoryLog();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('neoflow_activity_log');
    });

    it('should dispatch historyUpdated event', () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
      
      clearHistoryLog();
      
      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
      const eventArg = dispatchEventSpy.mock.calls[0][0] as Event;
      expect(eventArg.type).toBe('historyUpdated');
    });
  });

  describe('getStats', () => {
    it('should return zeros when no history exists', () => {
      (localStorage.getItem as any).mockReturnValue(null);
      
      const stats = getStats();
      
      expect(stats).toEqual({
        total: 0,
        notes: 0,
        chats: 0,
        images: 0,
        tts: 0,
      });
    });

    it('should count items by type correctly', () => {
      const mockHistory = [
        { id: '1', type: 'NOTE', title: 'Note 1', preview: '', timestamp: 1 },
        { id: '2', type: 'NOTE', title: 'Note 2', preview: '', timestamp: 2 },
        { id: '3', type: 'CHAT', title: 'Chat 1', preview: '', timestamp: 3 },
        { id: '4', type: 'IMAGE', title: 'Image 1', preview: '', timestamp: 4 },
        { id: '5', type: 'TTS', title: 'TTS 1', preview: '', timestamp: 5 },
        { id: '6', type: 'TTS', title: 'TTS 2', preview: '', timestamp: 6 },
      ];
      (localStorage.getItem as any).mockReturnValue(JSON.stringify(mockHistory));
      
      const stats = getStats();
      
      expect(stats).toEqual({
        total: 6,
        notes: 2,
        chats: 1,
        images: 1,
        tts: 2,
      });
    });
  });
});
