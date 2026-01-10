import { HistoryItem } from '../types';

const STORAGE_KEY = 'neoflow_activity_log';

export const getHistory = (): HistoryItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export const addToHistory = (type: HistoryItem['type'], title: string, preview: string) => {
  const newItem: HistoryItem = {
    id: Date.now().toString(),
    type,
    title,
    preview: preview.substring(0, 180) + (preview.length > 180 ? '...' : ''),
    timestamp: Date.now(),
  };

  const history = getHistory();
  // Keep last 100 items
  const updated = [newItem, ...history].slice(0, 100);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  
  // Dispatch event so Dashboard updates in real-time if open
  window.dispatchEvent(new Event('historyUpdated'));
};

export const clearHistoryLog = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('historyUpdated'));
};

export const getStats = () => {
    const history = getHistory();
    return {
        total: history.length,
        notes: history.filter(h => h.type === 'NOTE').length,
        chats: history.filter(h => h.type === 'CHAT').length,
        images: history.filter(h => h.type === 'IMAGE').length,
        tts: history.filter(h => h.type === 'TTS').length,
    };
};