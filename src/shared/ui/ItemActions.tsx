import { useI18n } from '../i18n/locale';
import { IconButton } from './Button';
import { Icon } from './Icon';

/**
 * Hover-reveal: hidden until the parent `group` is hovered or holds focus.
 * Only devices that can hover hide it; touch screens always show it.
 */
export const HOVER_REVEAL_CLASS = 'transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100';

interface ItemActionsProps {
  itemTitle: string;
  onEdit: () => void;
  onRemove: () => void;
  /** Layout only. */
  className?: string;
}

/** Edit/delete pair for a `Card`. */
export function ItemActions({ itemTitle, onEdit, onRemove, className = '' }: ItemActionsProps) {
  const { text } = useI18n();
  return (
    <div className={`flex items-center gap-0.5 ${HOVER_REVEAL_CLASS} ${className}`}>
      <IconButton label={text['common.editItem'](itemTitle)} size="sm" onClick={onEdit}>
        <Icon name="pencil" />
      </IconButton>
      <IconButton label={text['common.deleteItem'](itemTitle)} tone="quietDanger" size="sm" onClick={onRemove}>
        <Icon name="trash" />
      </IconButton>
    </div>
  );
}
