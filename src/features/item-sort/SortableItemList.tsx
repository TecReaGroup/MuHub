import { closestCenter, DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { rectSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode } from 'react';

// A press must be held this long, staying within the tolerance, before it becomes a drag;
// shorter presses stay clicks and swipes stay scrolls.
const HOLD_DELAY_MS = 250;
const HOLD_TOLERANCE_PX = 5;
const HOLD_CONSTRAINT = { delay: HOLD_DELAY_MS, tolerance: HOLD_TOLERANCE_PX };

interface SortableItemListProps<Item extends { id: string }> {
  items: Item[];
  /** Called on drop with the dragged item and the item whose slot it took. */
  onMove: (activeId: string, overId: string) => void;
  renderItem: (item: Item) => ReactNode;
}

// dnd-kit stops the post-drop click from reaching React but not the browser's default action,
// so a dropped site card would still follow its link. The click, if any, fires in the same task.
function suppressClickAfterDrop() {
  const preventClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };
  window.addEventListener('click', preventClick, { capture: true });
  window.setTimeout(() => window.removeEventListener('click', preventClick, { capture: true }));
}

function SortableItem({ id, children }: { id: string; children: ReactNode }) {
  const { setNodeRef, listeners, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      // Android opens the link menu on a long press that is already dragging.
      onContextMenu={isDragging ? event => event.preventDefault() : undefined}
      className={`touch-manipulation [-webkit-touch-callout:none] pointer-coarse:select-none ${isDragging ? 'relative z-20 scale-[1.03] cursor-grabbing opacity-90 transition-[scale,opacity] duration-short' : ''}`}
    >
      {children}
    </div>
  );
}

/** Grid items reorderable by press-and-hold then drag, with mouse or touch. */
export function SortableItemList<Item extends { id: string }>({ items, onMove, renderItem }: SortableItemListProps<Item>) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: HOLD_CONSTRAINT }),
    useSensor(TouchSensor, { activationConstraint: HOLD_CONSTRAINT }),
  );
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        suppressClickAfterDrop();
        if (over && active.id !== over.id) onMove(String(active.id), String(over.id));
      }}
      onDragCancel={suppressClickAfterDrop}
    >
      <SortableContext items={items} strategy={rectSortingStrategy}>
        {items.map(item => <SortableItem key={item.id} id={item.id}>{renderItem(item)}</SortableItem>)}
      </SortableContext>
    </DndContext>
  );
}
