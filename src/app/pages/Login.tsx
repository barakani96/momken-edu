import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/AuthProvider';
import { Button, Grid, Column, Tile, Theme } from '@carbon/react';
import { Login as LoginIcon } from '@carbon/icons-react';

export function Login() {
  const { t } = useTranslation();
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLogin = () => {
    login();
  };

  return (
    <Theme theme="white">
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--cds-background)',
          padding: '1rem',
        }}
      >
        <Grid style={{ width: '100%', maxWidth: '32rem', margin: 0, padding: 0 }}>
          <Column sm={4} md={8} lg={16}>
            <Tile style={{ padding: '1.5rem', boxSizing: 'border-box' }}>
              <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '0.75rem', fontWeight: 400 }}>
                {t('appTitle')}
              </h1>
              <p style={{ marginBottom: '1.75rem', color: 'var(--cds-text-secondary)', fontSize: '0.9375rem' }}>
                {t('login.welcome')}
              </p>
              <Button
                renderIcon={LoginIcon}
                onClick={handleLogin}
                style={{ width: '100%', minHeight: '2.75rem', justifyContent: 'center' }}
              >
                {t('login.submit')}
              </Button>
            </Tile>
          </Column>
        </Grid>
      </div>
    </Theme>
  );
}
