import { useEffect, useId, useState } from 'react';
import type { Diagram } from '../../entities/diagram/diagram';
import { DiagramImage } from '../../entities/diagram/DiagramImage';
import { IconButton } from '../../shared/ui/Button';
import { Icon } from '../../shared/ui/Icon';
import { ModalOverlay } from '../../shared/ui/Modal';

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
  const [zoom, setZoom] = useState(1);
  const titleId = useId();

  useEffect(() => {
    if (open) setZoom(1);
  }, [open, diagram]);

  return (
    <ModalOverlay open={open} onClose={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
      >
        <header className="flex items-center justify-between gap-4 border-b border-zinc-200/70 px-6 py-4 dark:border-zinc-800/70">
          <h2 id={titleId} className="truncate text-base font-medium text-zinc-900 dark:text-zinc-100">{diagram?.title}</h2>
          <div className="flex shrink-0 items-center gap-0.5">
            <IconButton label="缩小" onClick={() => setZoom(current => clampZoom(current - ZOOM_STEP))}>
              <Icon name="zoomOut" />
            </IconButton>
            <button
              type="button"
              title="还原比例"
              onClick={() => setZoom(1)}
              className="w-12 text-center text-xs text-zinc-500 tabular-nums transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              {Math.round(zoom * 100)}%
            </button>
            <IconButton label="放大" onClick={() => setZoom(current => clampZoom(current + ZOOM_STEP))}>
              <Icon name="zoomIn" />
            </IconButton>
            {diagram && (
              <a
                href={diagram.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="打开原图"
                title="打开原图"
                className="inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                <Icon name="arrowUpRight" />
              </a>
            )}
            <div className="mx-1.5 h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
            <IconButton label="关闭" onClick={onClose}>
              <Icon name="close" className="size-5" />
            </IconButton>
          </div>
        </header>

        <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-12">
          <div className="overflow-auto border-b border-zinc-200/70 bg-white p-6 lg:col-span-8 lg:border-r lg:border-b-0 dark:border-zinc-800/70">
            {diagram && (
              // Width-based zoom keeps the enlarged image scrollable, unlike a CSS transform.
              <DiagramImage
                src={diagram.imageUrl}
                alt={diagram.title}
                className="max-w-none transition-[width] duration-200 ease-out"
                style={{ width: `${zoom * 100}%` }}
              />
            )}
          </div>
          <aside className="space-y-2 overflow-y-auto p-6 lg:col-span-4 md:p-8">
            <h3 className="text-xs font-medium tracking-wider text-zinc-400 uppercase">架构说明</h3>
            <p className="text-sm leading-relaxed font-light whitespace-pre-line text-zinc-600 dark:text-zinc-300">
              {diagram?.description || '暂无描述'}
            </p>
          </aside>
        </div>
      </div>
    </ModalOverlay>
  );
}
