import { useEffect, useRef } from 'react';
import { useI18n } from '../../shared/i18n/locale';
import { LOCALES, type Locale } from '../../shared/i18n/message';
import { APP_BAR_ACTION_CLASS, MENU_ITEM_CLASS, MENU_SURFACE_CLASS } from '../../shared/ui/control-class';
import { Icon } from '../../shared/ui/Icon';
import { TEXT_ROLE } from '../../shared/ui/text-class';

const LOCALE_LABELS: Record<Locale, string> = { 'zh-CN': '简体中文', en: 'English' };

// Compact icon action on mobile; a labelled secondary pill from `md` up.
const TRIGGER_CLASS = `${APP_BAR_ACTION_CLASS} list-none [&::-webkit-details-marker]:hidden md:h-9 md:w-auto md:gap-1.5 md:rounded-control md:border md:border-line md:bg-surface md:px-4 md:text-sm md:font-medium md:whitespace-nowrap md:text-fg md:shadow-rest md:hover:border-line-strong md:group-open:bg-surface md:group-open:text-fg md:pointer-coarse:min-h-11 md:[&_svg]:size-4`;

/** Selects the interface language from the supported locales. */
export function LocaleSwitch() {
  const { locale, text, setLocale } = useI18n();
  const dropdownRef = useRef<HTMLDetailsElement>(null);
  const triggerRef = useRef<HTMLElement>(null);

  function closeAndRefocus() {
    dropdownRef.current!.open = false;
    triggerRef.current?.focus();
  }

  useEffect(() => {
    const dropdown = dropdownRef.current!;
    const dismissOnOutsidePress = (event: PointerEvent) => {
      if (event.target instanceof Node && !dropdown.contains(event.target)) dropdown.open = false;
    };
    document.addEventListener('pointerdown', dismissOnOutsidePress);
    return () => document.removeEventListener('pointerdown', dismissOnOutsidePress);
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
          closeAndRefocus();
        }
      }}
    >
      <summary ref={triggerRef} aria-label={text['locale.switch']} title={text['locale.switch']} className={TRIGGER_CLASS}>
        <Icon name="globe" className="text-fg-muted" />
        <span className="hidden min-w-16 text-center md:inline">{LOCALE_LABELS[locale]}</span>
        <Icon name="chevronDown" className="hidden text-fg-muted transition-transform group-open:rotate-180 motion-reduce:transition-none md:block" />
      </summary>
      <div
        role="group"
        aria-label={text['locale.switch']}
        className={`${MENU_SURFACE_CLASS} absolute top-full right-0 z-40 mt-2 w-48 origin-top-right animate-fade-in p-1.5 md:w-max md:min-w-full`}
      >
        {/* The mobile trigger is icon-only, so the open menu names itself. */}
        <p className={`px-3 pt-1.5 pb-1 font-medium md:hidden ${TEXT_ROLE.caption}`}>{text['locale.switch']}</p>
        {LOCALES.map(option => (
          <button
            key={option}
            type="button"
            lang={option}
            aria-pressed={locale === option}
            className={MENU_ITEM_CLASS}
            onClick={() => {
              setLocale(option);
              closeAndRefocus();
            }}
          >
            <span>{LOCALE_LABELS[option]}</span>
            <Icon name="check" className={`size-4 text-accent ${locale === option ? '' : 'invisible'}`} />
          </button>
        ))}
      </div>
    </details>
  );
}
