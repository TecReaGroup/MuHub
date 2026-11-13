import { IconButton } from './Button';
import { Icon } from './Icon';

interface ItemActionsProps {
  itemTitle: string;
  onEdit: () => void;
  onRemove: () => void;
  className?: string;
}

/**
 * Edit/delete pair for a `Card`. Revealed on card hover or keyboard focus,
 * and always visible on touch screens where hover does not exist.
 */
export function ItemActions({ itemTitle, onEdit, onRemove, className = '' }: ItemActionsProps) {
  return (
    <div className={`flex items-center opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100 ${className}`}>
      <IconButton label={`编辑 ${itemTitle}`} onClick={onEdit}>
        <Icon name="pencil" className="size-3.5" />
      </IconButton>
      <IconButton label={`删除 ${itemTitle}`} onClick={onRemove} className="hover:text-danger!">
        <Icon name="trash" className="size-3.5" />
      </IconButton>
    </div>
  );
}
