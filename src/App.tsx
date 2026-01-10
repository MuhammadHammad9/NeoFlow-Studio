import React, { useState, Suspense, lazy } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AuthScreen } from './components/AuthScreen';
import { ActiveTab } from './types';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { Loader2 } from 'lucide-react';

// Lazy Load Heavy Components
const NoteWorkspace = lazy(() => import('./components/NoteWorkspace').then(module => ({ default: module.NoteWorkspace })));
const ChatBot = lazy(() => import('./components/ChatBot').then(module => ({ default: module.ChatBot })));
const ImageAnalysis = lazy(() => import('./components/ImageAnalysis').then(module => ({ default: module.ImageAnalysis })));
const SpeechGenerator = lazy(() => import('./components/SpeechGenerator').then(module => ({ default: module.SpeechGenerator })));
const SettingsView = lazy(() => import('./components/SettingsView').then(module => ({ default: module.SettingsView })));

const LoadingSpinner = () => (
    <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
    </div>
);

const MainApp = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.DASHBOARD);

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case ActiveTab.DASHBOARD:
        return <Dashboard onNavigate={setActiveTab} />;
      case ActiveTab.NOTES:
        return <NoteWorkspace />;
      case ActiveTab.CHAT:
        return <ChatBot />;
      case ActiveTab.IMAGES:
        return <ImageAnalysis />;
      case ActiveTab.TTS:
        return <SpeechGenerator />;
      case ActiveTab.SETTINGS:
        return <SettingsView />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <Suspense fallback={<LoadingSpinner />}>
        {renderContent()}
      </Suspense>
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
           <MainApp />
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}