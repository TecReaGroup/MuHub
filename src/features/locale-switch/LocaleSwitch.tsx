import { useI18n } from '../../shared/i18n/locale';
import { Button } from '../../shared/ui/Button';
import { Icon } from '../../shared/ui/Icon';

/** Toggles between the two supported locales; the label names the language it switches to. */
export function LocaleSwitch() {
  const { locale, text, setLocale } = useI18n();
  return (
    <Button
      tone="ghost"
      size="lg"
      aria-label={text['locale.switch']}
      title={text['locale.switch']}
      onClick={() => setLocale(locale === 'zh-CN' ? 'en' : 'zh-CN')}
    >
      <Icon name="globe" />
      <span className="w-4 text-center">{text['locale.next']}</span>
    </Button>
  );
}
