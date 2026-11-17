import { useI18n } from '../../shared/i18n/locale';
import { Button } from '../../shared/ui/Button';
import { Icon } from '../../shared/ui/Icon';
import { useAddTrigger } from './add-action-context';

/** Shell-level add button; the current page decides what it creates via `usePageAddAction`. */
export function AddButton({ className = '' }: { className?: string }) {
  const { text } = useI18n();
  const triggerAdd = useAddTrigger();
  return (
    <Button tone="sunken" size="lg" aria-label={text['common.add']} title={text['common.add']} onClick={triggerAdd} className={className}>
      <Icon name="plus" />
    </Button>
  );
}
