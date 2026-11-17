import {
  closestCenter,
  DndContext,
  DragOverlay,
  MeasuringStrategy,
  MouseSensor,
  pointerWithin,
  TouchSensor,
  useSensor,
  useSensors,
  type ClientRect,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { arrayMove, rectSortingStrategy, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { ItemPlacement } from '../../shared/lib/item-placement';
import { TEXT_ROLE } from '../../shared/ui/text-class';

// A press must be held this long, staying within the tolerance, before it becomes a drag;
// shorter presses stay clicks and swipes stay scrolls.
const HOLD_DELAY_MS = 250;
const HOLD_TOLERANCE_PX = 5;
const HOLD_CONSTRAINT = { delay: HOLD_DELAY_MS, tolerance: HOLD_TOLERANCE_PX };
// Section ids are user text (e.g. category names) and share dnd-kit's id space with item ids.
const SECTION_KEY_PREFIX = 'section:';
// Moving a card into another section changes droppable rects mid-drag; with the default lazy measuring
// the moved card keeps its old rect, so dropping past a section's last card snaps it back before that card.
const MEASURING = { droppable: { strategy: MeasuringStrategy.Always } };
const SECTION_HEADING_CLASS = 'mb-3 flex w-fit items-baseline gap-2 sm:mb-4';

export interface BoardSection<Item> {
  id: string;
  /** Untitled sections have no heading, so they cannot be dragged themselves. */
  title?: string;
  items: Item[];
}

interface SectionLayout {
  id: string;
  itemIds: string[];
}

interface SortableBoardProps<Item extends { id: string }> {
  sections: BoardSection<Item>[];
  /** Grid columns and gap of each section. */
  layoutClassName: string;
  renderItem: (item: Item) => ReactNode;
  /** The board shows the dropped layout until this settles, so the move never flashes back. */
  onMoveItem: (placement: ItemPlacement) => Promise<void>;
  onMoveSection?: (activeSectionId: string, overSectionId: string) => Promise<void>;
}

const sectionKey = (sectionId: string) => `${SECTION_KEY_PREFIX}${sectionId}`;
const isSectionKey = (id: UniqueIdentifier) => String(id).startsWith(SECTION_KEY_PREFIX);
const sectionIdOf = (key: UniqueIdentifier) => String(key).slice(SECTION_KEY_PREFIX.length);

/**
 * Sections only collide with sections. An item targets the section under the pointer first, then the
 * closest item inside it; nearest-item-overall would let the card's own far-away slot beat a section's
 * empty trailing space. An empty section is itself the target, having no item to drop onto.
 */
const detectCollision: CollisionDetection = args => {
  const sectionContainers = args.droppableContainers.filter(container => isSectionKey(container.id));
  if (isSectionKey(args.active.id)) return closestCenter({ ...args, droppableContainers: sectionContainers });

  const itemContainers = args.droppableContainers.filter(container => !isSectionKey(container.id));
  const [hoveredSection] = pointerWithin({ ...args, droppableContainers: sectionContainers });
  if (!hoveredSection) return closestCenter({ ...args, droppableContainers: itemContainers });
  const hoveredSectionId = sectionIdOf(hoveredSection.id);
  const sectionItems = itemContainers.filter(container => container.data.current?.sectionId === hoveredSectionId);
  return sectionItems.length > 0 ? closestCenter({ ...args, droppableContainers: sectionItems }) : [hoveredSection];
};

function toLayout<Item extends { id: string }>(sections: BoardSection<Item>[]): SectionLayout[] {
  return sections.map(section => ({ id: section.id, itemIds: section.items.map(item => item.id) }));
}

function findSectionIndex(layout: SectionLayout[], itemId: string): number {
  return layout.findIndex(section => section.itemIds.includes(itemId));
}

// Grid-aware "drop after": on the same row compare horizontally, otherwise vertically.
function isPastCenter(activeRect: ClientRect, overRect: ClientRect): boolean {
  const activeCenterY = activeRect.top + activeRect.height / 2;
  const overCenterY = overRect.top + overRect.height / 2;
  const isSameRow = Math.abs(activeCenterY - overCenterY) < overRect.height / 2;
  return isSameRow
    ? activeRect.left + activeRect.width / 2 > overRect.left + overRect.width / 2
    : activeCenterY > overCenterY;
}

function moveAcrossSections(layout: SectionLayout[], activeId: string, targetIndex: number, insertAt: (itemIds: string[]) => number): SectionLayout[] {
  return layout.map((section, index) => {
    const itemIds = section.itemIds.filter(id => id !== activeId);
    if (index === targetIndex) itemIds.splice(insertAt(itemIds), 0, activeId);
    return { ...section, itemIds };
  });
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

function SortableItem({ id, sectionId, children }: { id: string; sectionId: string; children: ReactNode }) {
  const { setNodeRef, listeners, transform, transition, isDragging } = useSortable({ id, data: { sectionId } });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      // Android opens the link menu on a long press that is already dragging.
      onContextMenu={isDragging ? event => event.preventDefault() : undefined}
      className={`touch-manipulation [-webkit-touch-callout:none] pointer-coarse:select-none ${isDragging ? 'opacity-40' : ''}`}
    >
      {children}
    </div>
  );
}

function SectionHeadingText({ title, itemCount }: { title: string; itemCount: number }) {
  return (
    <>
      <h2 className={TEXT_ROLE.sectionTitle}>{title}</h2>
      <span className={TEXT_ROLE.meta}>{itemCount}</span>
    </>
  );
}

interface SortableSectionProps {
  id: string;
  title?: string;
  itemCount: number;
  layoutClassName: string;
  children: ReactNode;
}

function SortableSection({ id, title, itemCount, layoutClassName, children }: SortableSectionProps) {
  const { setNodeRef, setActivatorNodeRef, listeners, transform, transition, isDragging } = useSortable({ id: sectionKey(id) });
  return (
    <section
      ref={setNodeRef}
      aria-label={title}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={isDragging ? 'opacity-40' : undefined}
    >
      {title && (
        <div
          ref={setActivatorNodeRef}
          {...listeners}
          onContextMenu={isDragging ? event => event.preventDefault() : undefined}
          className={`${SECTION_HEADING_CLASS} touch-manipulation select-none [-webkit-touch-callout:none] ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          <SectionHeadingText title={title} itemCount={itemCount} />
        </div>
      )}
      <div className={`grid ${layoutClassName}`}>{children}</div>
    </section>
  );
}

/**
 * Sections of grid items, all reorderable by press-and-hold then drag, with mouse or touch:
 * items within and across sections, and titled sections by their heading.
 */
export function SortableBoard<Item extends { id: string }>({
  sections,
  layoutClassName,
  renderItem,
  onMoveItem,
  onMoveSection,
}: SortableBoardProps<Item>) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: HOLD_CONSTRAINT }),
    useSensor(TouchSensor, { activationConstraint: HOLD_CONSTRAINT }),
  );
  // Set from drag start until the move is persisted; otherwise the layout follows `sections`.
  const [draftLayout, setDraftLayout] = useState<SectionLayout[] | null>(null);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  // Crossing sections reflows the grid under the pointer, which can bounce the item straight back; wait a frame.
  const isCrossingRef = useRef(false);

  const layout = draftLayout ?? toLayout(sections);
  const itemById = new Map(sections.flatMap(section => section.items).map(item => [item.id, item]));
  const titleById = new Map(sections.map(section => [section.id, section.title]));
  const activeItem = activeId && !isSectionKey(activeId) ? itemById.get(String(activeId)) : undefined;
  const activeSection = activeId && isSectionKey(activeId) ? layout.find(section => sectionKey(section.id) === activeId) : undefined;
  const activeSectionTitle = activeSection && titleById.get(activeSection.id);

  async function persistLayout(nextLayout: SectionLayout[], persist: () => Promise<void>) {
    setDraftLayout(nextLayout);
    try {
      await persist();
    } finally {
      setDraftLayout(null);
    }
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!draftLayout || !over || isSectionKey(active.id) || isCrossingRef.current) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const isOverEmptySection = isSectionKey(over.id);
    const targetIndex = isOverEmptySection
      ? draftLayout.findIndex(section => section.id === sectionIdOf(over.id))
      : findSectionIndex(draftLayout, overId);
    if (findSectionIndex(draftLayout, activeId) === targetIndex) return;
    const activeRect = active.rect.current.translated;
    const isAfterOver = activeRect ? isPastCenter(activeRect, over.rect) : false;
    setDraftLayout(moveAcrossSections(draftLayout, activeId, targetIndex, itemIds => isOverEmptySection
      ? 0
      : itemIds.indexOf(overId) + (isAfterOver ? 1 : 0)));
    isCrossingRef.current = true;
    requestAnimationFrame(() => {
      isCrossingRef.current = false;
    });
  }

  async function dropSection(activeKey: UniqueIdentifier, overKey: UniqueIdentifier) {
    const fromIndex = layout.findIndex(section => sectionKey(section.id) === activeKey);
    const toIndex = layout.findIndex(section => sectionKey(section.id) === overKey);
    if (!onMoveSection || fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
      setDraftLayout(null);
      return;
    }
    await persistLayout(arrayMove(layout, fromIndex, toIndex), () => onMoveSection(sectionIdOf(activeKey), sectionIdOf(overKey)));
  }

  async function dropItem(activeId: string, overId: string | null) {
    let finalLayout = layout;
    const sectionIndex = findSectionIndex(finalLayout, activeId);
    if (overId && overId !== activeId && findSectionIndex(finalLayout, overId) === sectionIndex) {
      const { itemIds } = finalLayout[sectionIndex];
      finalLayout = finalLayout.map((section, index) => index === sectionIndex
        ? { ...section, itemIds: arrayMove(itemIds, itemIds.indexOf(activeId), itemIds.indexOf(overId)) }
        : section);
    }

    const { id: sectionId, itemIds } = finalLayout[sectionIndex];
    const position = itemIds.indexOf(activeId);
    const original = toLayout(sections);
    const originalSectionIndex = findSectionIndex(original, activeId);
    if (original[originalSectionIndex]?.id === sectionId && original[originalSectionIndex].itemIds.indexOf(activeId) === position) {
      setDraftLayout(null);
      return;
    }
    await persistLayout(finalLayout, () => onMoveItem({
      itemId: activeId,
      sectionId,
      previousId: itemIds[position - 1] ?? null,
      nextId: itemIds[position + 1] ?? null,
    }));
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    suppressClickAfterDrop();
    setActiveId(null);
    if (isSectionKey(active.id)) await dropSection(active.id, over?.id ?? active.id);
    else await dropItem(String(active.id), over ? String(over.id) : null);
  }

  function handleDragCancel() {
    suppressClickAfterDrop();
    setActiveId(null);
    setDraftLayout(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={detectCollision}
      measuring={MEASURING}
      onDragStart={({ active }) => {
        setDraftLayout(toLayout(sections));
        setActiveId(active.id);
      }}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={layout.map(section => sectionKey(section.id))} strategy={verticalListSortingStrategy}>
        <div className="space-y-8 sm:space-y-10">
          {layout.map(section => (
            <SortableSection
              key={section.id}
              id={section.id}
              title={titleById.get(section.id)}
              itemCount={section.itemIds.length}
              layoutClassName={layoutClassName}
            >
              <SortableContext items={section.itemIds} strategy={rectSortingStrategy}>
                {section.itemIds.map(id => {
                  const item = itemById.get(id);
                  return item && <SortableItem key={id} id={id} sectionId={section.id}>{renderItem(item)}</SortableItem>;
                })}
              </SortableContext>
            </SortableSection>
          ))}
        </div>
      </SortableContext>
      {/* Portaled because a transform-animated ancestor (animate-fade-in) becomes the containing block
          of the overlay's position: fixed, offsetting it from the pointer. */}
      {createPortal(<DragOverlay>
        {activeItem && <div className="scale-[1.03] cursor-grabbing opacity-95">{renderItem(activeItem)}</div>}
        {activeSection && activeSectionTitle && (
          <section className="cursor-grabbing opacity-95">
            <div className={SECTION_HEADING_CLASS}>
              <SectionHeadingText title={activeSectionTitle} itemCount={activeSection.itemIds.length} />
            </div>
            <div className={`grid ${layoutClassName}`}>
              {activeSection.itemIds.map(id => {
                const item = itemById.get(id);
                return item && <div key={id}>{renderItem(item)}</div>;
              })}
            </div>
          </section>
        )}
      </DragOverlay>, document.body)}
    </DndContext>
  );
}
