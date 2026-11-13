import { IconButton } from '../../shared/ui/Button';
import { Icon } from '../../shared/ui/Icon';
import type { Diagram } from './diagram';
import { DiagramImage } from './DiagramImage';

interface DiagramCardProps {
  diagram: Diagram;
  onPreview: (diagram: Diagram) => void;
  onEdit: (diagram: Diagram) => void;
  onRemove: (diagram: Diagram) => void;
}

export function DiagramCard({ diagram, onPreview, onEdit, onRemove }: DiagramCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-zinc-200/70 bg-card transition-colors duration-300 hover:border-zinc-300 dark:border-zinc-800/70 dark:hover:border-zinc-700">
      {/* Plain white canvas: SVGs are shown exactly as authored, never re-tinted for the theme. */}
      <button
        type="button"
        onClick={() => onPreview(diagram)}
        aria-label={`全屏查看 ${diagram.title}`}
        className="relative block w-full cursor-zoom-in border-b border-zinc-100 bg-white p-5 dark:border-zinc-800/70"
      >
        <DiagramImage
          src={diagram.imageUrl}
          alt={diagram.title}
          className="h-56 w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.01]"
        />
        <span className="absolute right-5 bottom-4 flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-white/90 px-3 py-1.5 text-[11px] font-medium text-zinc-600 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 dark:border-zinc-700/80 dark:bg-zinc-900/90 dark:text-zinc-300">
          <Icon name="expand" className="size-3.5" />
          全屏查看
        </span>
      </button>

      <div className="flex flex-1 items-start justify-between gap-4 p-6">
        <div className="min-w-0 space-y-2">
          <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100">{diagram.title}</h3>
          {diagram.description && (
            <p className="line-clamp-3 text-sm leading-relaxed font-light text-zinc-500 dark:text-zinc-400">{diagram.description}</p>
          )}
        </div>
        <div className="-mr-2 flex shrink-0 items-center opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
          <IconButton label={`编辑 ${diagram.title}`} onClick={() => onEdit(diagram)}>
            <Icon name="pencil" className="size-3.5" />
          </IconButton>
          <IconButton label={`删除 ${diagram.title}`} onClick={() => onRemove(diagram)} className="hover:text-red-600! dark:hover:text-red-400!">
            <Icon name="trash" className="size-3.5" />
          </IconButton>
        </div>
      </div>
    </article>
  );
}
