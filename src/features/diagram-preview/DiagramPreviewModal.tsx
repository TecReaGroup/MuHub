import { useEffect, useId, useRef, useState } from 'react';
import { diagramImageSrc, type Diagram } from '../../entities/diagram/diagram';
import { DiagramImage } from '../../entities/diagram/DiagramImage';
import { useI18n } from '../../shared/i18n/locale';
import { IconButton, IconLink } from '../../shared/ui/Button';
import { Icon } from '../../shared/ui/Icon';
import { DialogFrame } from '../../shared/ui/Modal';
import { TEXT_ROLE } from '../../shared/ui/text-class';
import { useScrollbar } from '../../shared/ui/use-scrollbar';

const ZOOM_SENSITIVITY = 0.002;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;

interface DiagramPreviewModalProps {
  open: boolean;
  /** Kept while closing so the exit transition still shows content. */
  diagram: Diagram | null;
  onClose: () => void;
}

function clampZoom(zoom: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

export function DiagramPreviewModal({ open, diagram, onClose }: DiagramPreviewModalProps) {
  const { text } = useI18n();
  const [viewport, setViewport] = useState({ zoom: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const titleId = useId();
  const scrollbar = useScrollbar();

  useEffect(() => {
    if (open) {
      setViewport({ zoom: 1, x: 0, y: 0 });
      dragRef.current = null;
      setIsDragging(false);
    }
  }, [open, diagram]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!open || !canvas) return;

    function zoomAtPointer(event: WheelEvent) {
      event.preventDefault();
      const bounds = canvas!.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? bounds.height : 1);
      setViewport(current => {
        const zoom = clampZoom(current.zoom * Math.exp(-delta * ZOOM_SENSITIVITY));
        const ratio = zoom / current.zoom;
        return { zoom, x: x - (x - current.x) * ratio, y: y - (y - current.y) * ratio };
      });
    }

    // A non-passive listener keeps wheel zoom from scrolling the surrounding dialog.
    canvas.addEventListener('wheel', zoomAtPointer, { passive: false });
    return () => canvas.removeEventListener('wheel', zoomAtPointer);
  }, [open, diagram]);

  return (
    <DialogFrame
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      className="h-[min(56rem,calc(100dvh-2rem))] w-[min(72rem,calc(100vw-1rem))] overflow-hidden"
    >
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-line py-3 pr-3 pl-5">
        <h2 id={titleId} className={`min-w-0 truncate ${TEXT_ROLE.dialogTitle}`}>{diagram?.title}</h2>
        <div className="flex shrink-0 items-center gap-0.5">
          {diagram && (
            <IconLink label={text['diagram.openOriginal']} href={diagramImageSrc(diagram.imageUrl)}>
              <Icon name="arrowUpRight" />
            </IconLink>
          )}
          <div aria-hidden="true" className="mx-1.5 h-4 w-px bg-line" />
          <IconButton label={text['common.close']} onClick={onClose}>
            <Icon name="close" />
          </IconButton>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_20rem] lg:grid-rows-1">
        <div
          ref={canvasRef}
          className={`min-h-0 overflow-hidden touch-none bg-diagram-canvas ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onPointerDown={event => {
            if (event.button !== 0 || dragRef.current) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
            setIsDragging(true);
          }}
          onPointerMove={event => {
            const drag = dragRef.current;
            if (!drag || drag.pointerId !== event.pointerId) return;
            const dx = event.clientX - drag.x;
            const dy = event.clientY - drag.y;
            dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
            setViewport(current => ({ ...current, x: current.x + dx, y: current.y + dy }));
          }}
          onLostPointerCapture={() => {
            dragRef.current = null;
            setIsDragging(false);
          }}
        >
          {diagram && (
            <div
              className="h-full w-full origin-top-left p-6"
              style={{ transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})` }}
            >
              <DiagramImage src={diagram.imageUrl} alt={diagram.title} className="h-full w-full object-contain" />
            </div>
          )}
        </div>
        <aside className="flex min-h-0 max-h-48 flex-col border-t border-line py-[var(--radius-dialog)] lg:max-h-none lg:border-t-0 lg:border-l">
          <div {...scrollbar} className="scrollbar-subtle min-h-0 space-y-2 overflow-y-auto px-5">
            <h3 className={TEXT_ROLE.panelTitle}>{text['diagram.notes']}</h3>
            <p className={`${TEXT_ROLE.body} break-words whitespace-pre-line`}>
              {diagram?.description || text['diagram.noDescription']}
            </p>
          </div>
        </aside>
      </div>
    </DialogFrame>
  );
}
