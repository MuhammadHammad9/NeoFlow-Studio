import axios from 'axios';
import { HistoryItem } from '../types';

export const getHistory = async (): Promise<HistoryItem[]> => {
  try {
    const res = await axios.get('/api/history');
    return res.data;
  } catch (e) {
    console.error("Failed to fetch history", e);
    return [];
  }
};

export const addToHistory = async (type: HistoryItem['type'], title: string, preview: string, content?: string) => {
  try {
    const res = await axios.post('/api/history', {
        type,
        title,
        preview: preview.substring(0, 180) + (preview.length > 180 ? '...' : ''),
        content
    });

    // Dispatch event so Dashboard updates in real-time if open
    window.dispatchEvent(new Event('historyUpdated'));
    return res.data;
  } catch (e) {
      console.error("Failed to add to history", e);
  }
};

export const clearHistoryLog = async () => {
    try {
        await axios.delete('/api/history');
        window.dispatchEvent(new Event('historyUpdated'));
    } catch (e) {
        console.error("Failed to clear history", e);
    }
};

export const getStats = async () => {
    const history = await getHistory();
    return {
        total: history.length,
        notes: history.filter(h => h.type === 'NOTE').length,
        chats: history.filter(h => h.type === 'CHAT').length,
        images: history.filter(h => h.type === 'IMAGE').length,
        tts: history.filter(h => h.type === 'TTS').length,
    };
};
