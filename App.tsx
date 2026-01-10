import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { NoteWorkspace } from './components/NoteWorkspace';
import { ChatBot } from './components/ChatBot';
import { ImageAnalysis } from './components/ImageAnalysis';
import { SpeechGenerator } from './components/SpeechGenerator';
import { SettingsView } from './components/SettingsView';
import { Dashboard } from './components/Dashboard';
import { AuthScreen } from './components/AuthScreen';
import { ActiveTab } from './types';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

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
      {renderContent()}
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </AuthProvider>
  );
}