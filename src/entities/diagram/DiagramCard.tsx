import { Card } from '../../shared/ui/Card';
import { Icon } from '../../shared/ui/Icon';
import { ItemActions } from '../../shared/ui/ItemActions';
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
    <Card className="flex flex-col">
      <button
        type="button"
        onClick={() => onPreview(diagram)}
        aria-label={`全屏查看 ${diagram.title}`}
        className="relative block w-full cursor-zoom-in border-b border-line bg-diagram-canvas p-5 focus-visible:-outline-offset-2"
      >
        <DiagramImage
          src={diagram.imageUrl}
          alt={diagram.title}
          className="h-56 w-full object-contain transition-transform duration-500 ease-out-expo group-hover:scale-[1.01]"
        />
        <span className="absolute right-4 bottom-4 flex items-center gap-1.5 rounded-full border border-line bg-surface/90 px-3 py-1.5 text-[11px] font-medium text-fg-muted opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
          <Icon name="expand" className="size-3.5" />
          全屏查看
        </span>
      </button>

      <div className="flex flex-1 items-start justify-between gap-4 p-6">
        <div className="min-w-0 space-y-2">
          <h3 className="text-base font-medium text-fg">{diagram.title}</h3>
          {diagram.description && (
            <p className="line-clamp-3 text-sm leading-relaxed font-light text-fg-muted">{diagram.description}</p>
          )}
        </div>
        <ItemActions
          itemTitle={diagram.title}
          onEdit={() => onEdit(diagram)}
          onRemove={() => onRemove(diagram)}
          className="-mr-2 shrink-0"
        />
      </div>
    </Card>
  );
}
