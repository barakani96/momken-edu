/**
 * @schools/i18n — Bilingual Localization Package (Arabic RTL & English LTR First)
 * Enforces AGENTS.md Section 1: Bilingual Execution Pattern.
 */

export { default as i18n } from '../../../src/i18n';
export { LanguageProvider, useLanguage } from '../../../src/i18n/LanguageProvider';
import enLocale from '../../../src/i18n/locales/en.json';
import arLocale from '../../../src/i18n/locales/ar.json';

export { enLocale, arLocale };
export type SupportedLocale = 'en' | 'ar';
