/**
 * EduCore Admin Console - SessionTimeoutWarning Component
 * Monitors user activity, tracks JWT / session expiration time,
 * dispatches warning alerts via NotificationProvider, and provides an
 * interactive re-authentication prompt modal before automatic session logoff.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Modal,
  PasswordInput,
  InlineNotification,
  Button,
  ProgressBar,
  Tag,
} from '@carbon/react';
import { Warning, Time, Locked, UserAvatar, Renew } from '@carbon/icons-react';

import { useAuth } from '../../auth/AuthProvider';
import { useNotification } from '../../core/notifications/NotificationContext';

export interface SessionTimeoutWarningProps {
  /**
   * Total session lifetime in minutes if tokenExpiresAt is not dynamically provided.
   * Default is 15 minutes.
   */
  sessionTimeoutMinutes?: number;

  /**
   * Threshold in seconds before session expiry when warning prompt and notification trigger.
   * Default is 120 seconds (2 minutes).
   */
  warningThresholdSeconds?: number;

  /**
   * Timer polling interval in milliseconds. Default is 1000ms.
   */
  checkIntervalMs?: number;
}

export function SessionTimeoutWarning({
  sessionTimeoutMinutes = 15,
  warningThresholdSeconds = 120,
  checkIntervalMs = 1000,
}: SessionTimeoutWarningProps) {
  const { currentUser, isAuthenticated, logout, extendSession, tokenExpiresAt } = useAuth();
  const { notify } = useNotification();

  // State
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Activity tracking
  const lastActivityRef = useRef<number>(Date.now());
  const warningTriggeredRef = useRef<boolean>(false);
  const expiredTriggeredRef = useRef<boolean>(false);

  // Throttled activity listener
  const handleUserActivity = useCallback(() => {
    // If modal is open, user activity does NOT dismiss modal automatically (requires password / button click)
    if (isWarningModalOpen) return;

    const now = Date.now();
    // Throttle activity recording to once every 2 seconds
    if (now - lastActivityRef.current > 2000) {
      lastActivityRef.current = now;
    }
  }, [isWarningModalOpen]);

  // Bind activity listeners to document
  useEffect(() => {
    if (!isAuthenticated) return;

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'pointerdown'];
    
    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
    };
  }, [isAuthenticated, handleUserActivity]);

  // Main countdown & expiration timer hook
  useEffect(() => {
    if (!isAuthenticated) {
      setIsWarningModalOpen(false);
      warningTriggeredRef.current = false;
      expiredTriggeredRef.current = false;
      setSecondsRemaining(null);
      return;
    }

    const intervalId = setInterval(() => {
      const now = Date.now();
      // Calculate expiry timestamp
      const targetExpiry = tokenExpiresAt || lastActivityRef.current + sessionTimeoutMinutes * 60 * 1000;
      const remainingSecs = Math.max(0, Math.floor((targetExpiry - now) / 1000));

      setSecondsRemaining(remainingSecs);

      // 1. Warning Threshold Reached
      if (remainingSecs <= warningThresholdSeconds && remainingSecs > 0) {
        if (!warningTriggeredRef.current) {
          warningTriggeredRef.current = true;
          setIsWarningModalOpen(true);

          // Dispatch Notification Alert via NotificationProvider
          notify({
            kind: 'warning',
            title: 'Session Expiring Soon',
            subtitle: `Your administrative session will expire in ${Math.floor(remainingSecs / 60)}m ${remainingSecs % 60}s due to inactivity. Please re-authenticate to extend your session.`,
            timeout: 10000,
          });
        }
      }

      // 2. Session Expired (0 seconds remaining)
      if (remainingSecs === 0) {
        if (!expiredTriggeredRef.current) {
          expiredTriggeredRef.current = true;
          setIsWarningModalOpen(false);

          // Dispatch Error Notification Alert
          notify({
            kind: 'error',
            title: 'Session Expired',
            subtitle: 'Your session has expired due to extended inactivity. You have been automatically logged out for security.',
            timeout: 8000,
          });

          // Perform automatic logout
          logout();
        }
      }
    }, checkIntervalMs);

    return () => clearInterval(intervalId);
  }, [
    isAuthenticated,
    tokenExpiresAt,
    sessionTimeoutMinutes,
    warningThresholdSeconds,
    checkIntervalMs,
    logout,
    notify,
  ]);

  // Re-authentication submit handler
  const handleReauthenticate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setPasswordError(null);

    // Simulate password verification delay
    setTimeout(() => {
      setIsSubmitting(false);

      // Extend session in AuthProvider
      extendSession(sessionTimeoutMinutes);
      lastActivityRef.current = Date.now();
      warningTriggeredRef.current = false;
      expiredTriggeredRef.current = false;
      setIsWarningModalOpen(false);
      setPasswordInput('');

      // Dispatch Success Notification Alert
      notify({
        kind: 'success',
        title: 'Session Renewed',
        subtitle: 'Authentication token successfully refreshed. Your session has been extended.',
        timeout: 5000,
      });
    }, 600);
  };

  // Manual Log Out handler
  const handleManualLogout = () => {
    setIsWarningModalOpen(false);
    logout();

    notify({
      kind: 'info',
      title: 'Logged Out',
      subtitle: 'You have logged out of your session.',
      timeout: 5000,
    });
  };

  if (!isAuthenticated || secondsRemaining === null) {
    return null;
  }

  // Formatting helper MM:SS
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const progressPercent = Math.min(100, Math.max(0, (secondsRemaining / warningThresholdSeconds) * 100));

  return (
    <>
      {/* Re-authentication Warning Modal */}
      <Modal
        open={isWarningModalOpen}
        modalHeading="Session Expiring - Re-authentication Required"
        modalLabel="Security & Session Policy"
        primaryButtonText={isSubmitting ? 'Verifying...' : 'Re-authenticate & Extend Session'}
        secondaryButtonText="Log Out Now"
        onRequestSubmit={handleReauthenticate}
        onRequestClose={handleManualLogout}
        preventCloseOnClickOutside
        size="sm"
        primaryButtonDisabled={isSubmitting}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingTop: '0.5rem' }}>
          {/* Warning Banner */}
          <InlineNotification
            kind="warning"
            title="Inactivity Warning"
            subtitle={`Your authenticated session will expire in ${formattedTime}.`}
            hideCloseButton
          />

          {/* User Profile Context Card */}
          <div
            style={{
              padding: '0.875rem 1rem',
              backgroundColor: 'var(--cds-layer-02)',
              border: '1px solid var(--cds-border-subtle)',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <UserAvatar size={24} style={{ fill: 'var(--cds-icon-primary)' }} />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
                  {currentUser?.name || 'Administrator'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                  {currentUser?.email || 'admin@educore.edu'}
                </div>
              </div>
            </div>
            <Tag type="blue" size="sm">
              SUPERADMIN
            </Tag>
          </div>

          {/* Remaining Time Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--cds-text-secondary)', fontWeight: 600 }}>TIME REMAINING BEFORE LOGOUT</span>
              <span style={{ color: 'var(--cds-support-warning)', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.875rem' }}>
                {formattedTime}
              </span>
            </div>
            <ProgressBar
              label="Session expiration countdown"
              hideLabel
              value={progressPercent}
              max={100}
              status={progressPercent < 30 ? 'error' : 'active'}
            />
          </div>

          {/* Password Input Form */}
          <form onSubmit={handleReauthenticate}>
            <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginBottom: '1rem' }}>
              Please enter your password to confirm re-authentication and keep your current workspace active.
            </p>
            <PasswordInput
              id="reauth-password-input"
              labelText="Password"
              placeholder="Enter your administrative password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              invalid={!!passwordError}
              invalidText={passwordError || ''}
              autoFocus
            />
          </form>
        </div>
      </Modal>
    </>
  );
}

export default SessionTimeoutWarning;
