/**
 * IBM Carbon Design System Spacing & Layout Tokens
 * Official reference: https://carbondesignsystem.com/elements/spacing/overview/
 */

export const spacingTokens = {
  spacing01: '0.125rem', // 2px
  spacing02: '0.25rem',  // 4px
  spacing03: '0.5rem',   // 8px
  spacing04: '0.75rem',  // 12px
  spacing05: '1rem',     // 16px
  spacing06: '1.5rem',   // 24px
  spacing07: '2rem',     // 32px
  spacing08: '2.5rem',   // 40px
  spacing09: '3rem',     // 48px
  spacing10: '4rem',     // 64px
  spacing11: '5rem',     // 80px
  spacing12: '6rem',     // 96px
  spacing13: '10rem',    // 160px
} as const;

export const spacingVars = {
  spacing01: 'var(--cds-spacing-01, 0.125rem)',
  spacing02: 'var(--cds-spacing-02, 0.25rem)',
  spacing03: 'var(--cds-spacing-03, 0.5rem)',
  spacing04: 'var(--cds-spacing-04, 0.75rem)',
  spacing05: 'var(--cds-spacing-05, 1rem)',
  spacing06: 'var(--cds-spacing-06, 1.5rem)',
  spacing07: 'var(--cds-spacing-07, 2rem)',
  spacing08: 'var(--cds-spacing-08, 2.5rem)',
  spacing09: 'var(--cds-spacing-09, 3rem)',
  spacing10: 'var(--cds-spacing-10, 4rem)',
  spacing11: 'var(--cds-spacing-11, 5rem)',
  spacing12: 'var(--cds-spacing-12, 6rem)',
  spacing13: 'var(--cds-spacing-13, 10rem)',
} as const;

export const layoutTokens = {
  layout01: '1rem',    // 16px
  layout02: '1.5rem',  // 24px
  layout03: '2rem',    // 32px
  layout04: '3rem',    // 48px
  layout05: '4rem',    // 64px
  layout06: '6rem',    // 96px
  layout07: '10rem',   // 160px
} as const;

export const layoutVars = {
  layout01: 'var(--cds-layout-01, 1rem)',
  layout02: 'var(--cds-layout-02, 1.5rem)',
  layout03: 'var(--cds-layout-03, 2rem)',
  layout04: 'var(--cds-layout-04, 3rem)',
  layout05: 'var(--cds-layout-05, 4rem)',
  layout06: 'var(--cds-layout-06, 6rem)',
  layout07: 'var(--cds-layout-07, 10rem)',
} as const;

export type SpacingKey = keyof typeof spacingTokens;
export type LayoutKey = keyof typeof layoutTokens;
