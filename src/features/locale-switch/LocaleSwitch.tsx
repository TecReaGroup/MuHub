import { useEffect, useRef } from 'react';
import { useI18n } from '../../shared/i18n/locale';
import { LOCALES, type Locale } from '../../shared/i18n/message';
import { textControlClass } from '../../shared/ui/control-class';
import { Icon } from '../../shared/ui/Icon';

const LOCALE_LABELS: Record<Locale, string> = { 'zh-CN': '简体中文', en: 'English' };

/** Selects the interface language from the supported locales. */
export function LocaleSwitch() {
  const { locale, text, setLocale } = useI18n();
  const dropdownRef = useRef<HTMLDetailsElement>(null);
  const triggerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const dropdown = dropdownRef.current;
    if (!dropdown) return;
    const dismissOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !dropdown.contains(event.target)) dropdown.open = false;
    };
    document.addEventListener('pointerdown', dismissOnOutsideClick);
    return () => document.removeEventListener('pointerdown', dismissOnOutsideClick);
  }, []);

  return (
    <details
      ref={dropdownRef}
      className="group relative"
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
      }}
      onKeyDown={event => {
        if (event.key === 'Escape' && event.currentTarget.open) {
          event.preventDefault();
          event.currentTarget.open = false;
          triggerRef.current?.focus();
        }
      }}
    >
      <summary
        ref={triggerRef}
        aria-label={text['locale.switch']}
        className={`${textControlClass('secondary', 'lg')} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}
      >
        <Icon name="globe" className="size-4 text-fg-muted" />
        <span className="min-w-16 text-center">{LOCALE_LABELS[locale]}</span>
        <Icon name="chevronDown" className="size-4 text-fg-muted transition-transform group-open:rotate-180 motion-reduce:transition-none" />
      </summary>
      <div
        role="group"
        aria-label={text['locale.switch']}
        className="absolute right-0 top-full z-40 mt-2 w-full rounded-card border border-line bg-surface p-1.5 shadow-overlay"
      >
        {LOCALES.map(option => (
          <button
            key={option}
            type="button"
            lang={option}
            aria-pressed={locale === option}
            className="relative flex h-10 w-full cursor-pointer items-center justify-center rounded-control px-7 text-center text-sm text-fg transition-colors hover:bg-hover aria-pressed:bg-accent-soft aria-pressed:font-medium"
            onClick={() => {
              setLocale(option);
              if (dropdownRef.current) dropdownRef.current.open = false;
              triggerRef.current?.focus();
            }}
          >
            <span>{LOCALE_LABELS[option]}</span>
            {locale === option && <Icon name="check" className="absolute right-2 size-4 text-accent" />}
          </button>
        ))}
      </div>
    </details>
  );
}
