import React from 'react';
import { Grid, Column } from '@carbon/react';
import { PageHeader, PageHeaderProps } from './PageHeader';

export interface PageLayoutProps extends Partial<PageHeaderProps> {
  children: React.ReactNode;
  contentWidth?: 'narrow' | 'default' | 'wide' | 'full';
}

export function PageLayout({
  title,
  description,
  breadcrumbs,
  actions,
  children,
  contentWidth = 'full',
}: PageLayoutProps) {
  
  // Determine Carbon Grid span based on content width
  const getColSpan = () => {
    switch (contentWidth) {
      case 'narrow':
        return { sm: 4, md: 6, lg: 8, offsetLg: 4 };
      case 'wide':
      case 'full':
      case 'default':
      default:
        return { sm: 4, md: 8, lg: 16 };
    }
  };

  const colProps = getColSpan();

  return (
    <div className="page-layout" style={{ width: '100%', maxWidth: '100%' }}>
      {title && (
        <Grid fullWidth style={{ width: '100%', maxWidth: '100%' }}>
          <Column sm={4} md={8} lg={16}>
            <PageHeader
              title={title}
              description={description}
              breadcrumbs={breadcrumbs}
              actions={actions}
            />
          </Column>
        </Grid>
      )}
      
      <Grid fullWidth style={{ width: '100%', maxWidth: '100%' }}>
        <Column 
          sm={colProps.sm} 
          md={colProps.md} 
          lg={colProps.lg} 
          {...(colProps.offsetLg ? { lg: { span: colProps.lg, offset: colProps.offsetLg } } : {})}
        >
          <div style={{ marginTop: title ? '1rem' : 0, width: '100%', maxWidth: '100%' }}>
            {children}
          </div>
        </Column>
      </Grid>
    </div>
  );
}

