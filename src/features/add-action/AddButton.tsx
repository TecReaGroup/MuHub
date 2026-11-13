import { useI18n } from '../../shared/i18n/locale';
import { Button } from '../../shared/ui/Button';
import { Icon } from '../../shared/ui/Icon';
import { useAddActionRef } from './add-action-context';

/** Shell-level add button; the current page decides what it creates via `usePageAddAction`. */
export function AddButton({ className = '' }: { className?: string }) {
  const { text } = useI18n();
  const addRef = useAddActionRef();
  return (
    <Button
      tone="sunken"
      size="lg"
      aria-label={text['common.add']}
      title={text['common.add']}
      onClick={() => addRef.current()}
      className={className}
    >
      <Icon name="plus" />
    </Button>
  );
}
