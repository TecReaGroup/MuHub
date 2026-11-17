import { useId, useState } from 'react';
import { useI18n } from '../i18n/locale';
import { Button, IconButton } from './Button';
import { MENU_ITEM_CLASS } from './control-class';
import { Icon } from './Icon';
import { DialogFrame } from './Modal';
import { TEXT_ROLE } from './text-class';

/**
 * Hover-reveal: hidden until the parent `group` is hovered or holds focus.
 * Only devices that can hover hide it.
 */
const HOVER_REVEAL_CLASS = 'transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100';

interface ItemActionsProps {
  itemTitle: string;
  onEdit: () => void;
  onRemove: () => void;
  /** Layout only. */
  className?: string;
}

/**
 * Edit/delete for a collection item. Precise pointers get two inline icons; touch screens get one
 * overflow button opening an action sheet, so cards stay uncluttered and delete is never a mis-tap away from edit.
 */
export function ItemActions({ itemTitle, onEdit, onRemove, className = '' }: ItemActionsProps) {
  const { text } = useI18n();
  return (
    <div className={`flex items-center ${className}`}>
      <div className={`flex items-center gap-0.5 pointer-coarse:hidden ${HOVER_REVEAL_CLASS}`}>
        <IconButton label={text['common.editItem'](itemTitle)} size="sm" onClick={onEdit}>
          <Icon name="pencil" />
        </IconButton>
        <IconButton label={text['common.deleteItem'](itemTitle)} tone="quietDanger" size="sm" onClick={onRemove}>
          <Icon name="trash" />
        </IconButton>
      </div>
      <ItemActionSheet itemTitle={itemTitle} onEdit={onEdit} onRemove={onRemove} />
    </div>
  );
}

function ItemActionSheet({ itemTitle, onEdit, onRemove }: Omit<ItemActionsProps, 'className'>) {
  const { text } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();

  function closeThen(action: () => void) {
    setIsOpen(false);
    action();
  }

  return (
    <>
      <IconButton label={text['common.moreActions'](itemTitle)} size="sm" onClick={() => setIsOpen(true)} className="not-pointer-coarse:hidden">
        <Icon name="ellipsis" />
      </IconButton>
      <DialogFrame open={isOpen} onClose={() => setIsOpen(false)} labelledBy={titleId} className="w-[min(22rem,calc(100vw-1rem))] p-2">
        <h2 id={titleId} className={`truncate px-3 pt-2 pb-1.5 text-center ${TEXT_ROLE.label}`}>{itemTitle}</h2>
        <button type="button" className={MENU_ITEM_CLASS} onClick={() => closeThen(onEdit)}>
          <span className="flex items-center gap-3">
            <Icon name="pencil" className="size-[1.125rem] text-fg-muted" />
            {text['common.edit']}
          </span>
        </button>
        <button type="button" className={MENU_ITEM_CLASS} onClick={() => closeThen(onRemove)}>
          <span className="flex items-center gap-3 text-danger">
            <Icon name="trash" className="size-[1.125rem]" />
            {text['common.delete']}
          </span>
        </button>
        <Button size="lg" data-autofocus className="mt-2 w-full" onClick={() => setIsOpen(false)}>
          {text['common.cancel']}
        </Button>
      </DialogFrame>
    </>
  );
}
