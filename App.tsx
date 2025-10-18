
import React from 'react';
import { QueryProvider } from './providers/QueryProvider';
import { PWAInstallPrompt, PWAInstallBanner } from './src/components/ui/enhanced/PWAInstallPrompt';
import { AppContent } from './AppContent';
import './src/utils/errorHandler'; // Initialize error handler

const App: React.FC = () => {
  return (
    <QueryProvider>
      <PWAInstallBanner />
      <AppContent />
      <PWAInstallPrompt />
    </QueryProvider>
  );
};

export default App;
