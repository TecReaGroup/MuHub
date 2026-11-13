import { useEffect, useId, useState } from 'react';
import type { Diagram } from '../../entities/diagram/diagram';
import { DiagramImage } from '../../entities/diagram/DiagramImage';
import { useI18n } from '../../shared/i18n/locale';
import { Button, IconButton, IconLink } from '../../shared/ui/Button';
import { Icon } from '../../shared/ui/Icon';
import { DialogFrame } from '../../shared/ui/Modal';
import { TEXT_ROLE } from '../../shared/ui/text-class';

const ZOOM_STEP = 0.25;
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
  const [zoom, setZoom] = useState(1);
  const titleId = useId();

  useEffect(() => {
    if (open) setZoom(1);
  }, [open, diagram]);

  return (
    <DialogFrame
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      className="h-[min(56rem,calc(100dvh-2rem))] w-[min(72rem,calc(100vw-2rem))] overflow-hidden"
    >
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-line py-3 pr-3 pl-5">
        <h2 id={titleId} className={`min-w-0 truncate ${TEXT_ROLE.dialogTitle}`}>{diagram?.title}</h2>
        <div className="flex shrink-0 items-center gap-0.5">
          <IconButton label={text['diagram.zoomOut']} onClick={() => setZoom(current => clampZoom(current - ZOOM_STEP))}>
            <Icon name="zoomOut" />
          </IconButton>
          <Button tone="ghost" title={text['diagram.zoomReset']} onClick={() => setZoom(1)} className="w-14 tabular-nums">
            {Math.round(zoom * 100)}%
          </Button>
          <IconButton label={text['diagram.zoomIn']} onClick={() => setZoom(current => clampZoom(current + ZOOM_STEP))}>
            <Icon name="zoomIn" />
          </IconButton>
          {diagram && (
            <IconLink label={text['diagram.openOriginal']} href={diagram.imageUrl}>
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
        {/* The zoomed canvas is the one place two-axis scrolling is expected: it is how users pan. */}
        <div className="scrollbar-subtle min-h-0 overflow-auto bg-diagram-canvas p-6">
          {diagram && (
            // Width-based zoom keeps the enlarged image scrollable, unlike a CSS transform.
            <DiagramImage
              src={diagram.imageUrl}
              alt={diagram.title}
              className="max-w-none transition-[width] duration-medium"
              style={{ width: `${zoom * 100}%` }}
            />
          )}
        </div>
        <aside className="scrollbar-subtle max-h-48 space-y-2 overflow-y-auto border-t border-line p-5 lg:max-h-none lg:border-t-0 lg:border-l">
          <h3 className={TEXT_ROLE.panelTitle}>{text['diagram.notes']}</h3>
          <p className={`${TEXT_ROLE.body} break-words whitespace-pre-line`}>
            {diagram?.description || text['diagram.noDescription']}
          </p>
        </aside>
      </div>
    </DialogFrame>
  );
}
