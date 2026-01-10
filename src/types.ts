export enum ActiveTab {
  DASHBOARD = 'DASHBOARD',
  NOTES = 'NOTES',
  CHAT = 'CHAT',
  IMAGES = 'IMAGES',
  TTS = 'TTS',
  SETTINGS = 'SETTINGS'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
}

export interface NoteState {
  title: string;
  content: string;
  audioData: string | null; // Base64
}

export interface AnalysisResult {
  text: string;
  loading: boolean;
  error: string | null;
}

export interface HistoryItem {
  id: string;
  type: 'NOTE' | 'CHAT' | 'IMAGE' | 'TTS';
  title: string;
  preview: string;
  timestamp: number;
}