import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AuthProvider } from '../auth/AuthProvider';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { LanguageProvider } from '../i18n/LanguageProvider';
import { ErrorBoundary } from '../core/ErrorBoundary';
import { ThemeProvider } from '../core/theme/ThemeProvider';
import { NotificationProvider } from '../core/notifications/NotificationContext';
import { KeyboardShortcutProvider } from '../hooks/KeyboardShortcutProvider';
import { SessionTimeoutWarning } from '../components/auth/SessionTimeoutWarning';

function AppContent() {
  return (
    <>
      <SessionTimeoutWarning />
      <RouterProvider router={router} />
    </>
  );
}

export default function App() {
  return (
    <React.StrictMode>
      <I18nextProvider i18n={i18n}>
        <LanguageProvider>
          <ThemeProvider>
            <NotificationProvider>
              <KeyboardShortcutProvider>
                <AuthProvider>
                  <ErrorBoundary>
                    <AppContent />
                  </ErrorBoundary>
                </AuthProvider>
              </KeyboardShortcutProvider>
            </NotificationProvider>
          </ThemeProvider>
        </LanguageProvider>
      </I18nextProvider>
    </React.StrictMode>
  );
}
