import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { log, serializeError } from '../lib/logger';
import { LOCALES, MESSAGE_CATALOGS, type Locale, type MessageCatalog } from './message';

const LOCALE_STORAGE_KEY = 'muhub-locale';
const FALLBACK_LOCALE: Locale = 'zh-CN';

interface LocaleContextValue {
  locale: Locale;
  text: MessageCatalog;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function isLocale(value: unknown): value is Locale {
  return LOCALES.includes(value as Locale);
}

// Stored choice first, then the browser language, then the fallback.
function readInitialLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch (error) {
    log('warn', 'Locale', 'Locale preference not readable', serializeError(error));
  }
  if (!navigator.language) return FALLBACK_LOCALE;
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en';
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState(readInitialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    } catch (error) {
      log('warn', 'Locale', 'Locale preference not persisted', serializeError(error));
    }
  }, []);

  const contextValue = useMemo(() => ({ locale, text: MESSAGE_CATALOGS[locale], setLocale }), [locale, setLocale]);
  return <LocaleContext.Provider value={contextValue}>{children}</LocaleContext.Provider>;
}

export function useI18n(): LocaleContextValue {
  const contextValue = useContext(LocaleContext);
  if (!contextValue) throw new Error('useI18n must be used inside LocaleProvider');
  return contextValue;
}
