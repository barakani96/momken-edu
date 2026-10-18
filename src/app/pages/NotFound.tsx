import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Grid, Column, Tile } from '@carbon/react';
import { ArrowLeft } from '@carbon/icons-react';

export function NotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
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
      <Grid style={{ width: '100%', maxWidth: '36rem', margin: 0, padding: 0 }}>
        <Column sm={4} md={8} lg={16}>
          <Tile style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '0.75rem', fontWeight: 300 }}>
              {t('notfound.title')}
            </h1>
            <p style={{ marginBottom: '2rem', fontSize: '1.125rem', color: 'var(--cds-text-secondary)' }}>
              {t('notfound.message')}
            </p>
            <Button
              kind="secondary"
              renderIcon={ArrowLeft}
              onClick={() => navigate('/')}
              style={{ minHeight: '2.75rem' }}
            >
              {t('notfound.back')}
            </Button>
          </Tile>
        </Column>
      </Grid>
    </div>
  );
}
