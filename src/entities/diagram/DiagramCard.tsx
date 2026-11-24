import { useI18n } from '../../shared/i18n/locale';
import { ItemActions } from '../../shared/ui/ItemActions';
import { SkeletonBar } from '../../shared/ui/Placeholder';
import { TEXT_ROLE } from '../../shared/ui/text-class';
import { diagramRevision, type Diagram } from './diagram';
import { DiagramImage } from './DiagramImage';

// Media tile: the framed preview is the card; title and actions sit below it on the canvas.
const PREVIEW_FRAME_CLASS = 'relative block w-full overflow-hidden rounded-card border border-line bg-diagram-canvas p-4 sm:p-5';
// Shorter on phones so more than one diagram fits on the first screen.
const PREVIEW_HEIGHT_CLASS = 'h-48 sm:h-56';

interface DiagramCardProps {
  diagram: Diagram;
  onPreview: (diagram: Diagram) => void;
  onEdit: (diagram: Diagram) => void;
  onRemove: (diagram: Diagram) => void;
}

export function DiagramCard({ diagram, onPreview, onEdit, onRemove }: DiagramCardProps) {
  const { text } = useI18n();
  return (
    <article className="group flex flex-col gap-3">
      <button
        type="button"
        onClick={() => onPreview(diagram)}
        aria-label={text['diagram.fullscreenItem'](diagram.title)}
        className={`${PREVIEW_FRAME_CLASS} cursor-pointer transition-[scale,border-color,box-shadow] duration-medium hover:border-line-strong hover:shadow-hover active:scale-[0.98]`}
      >
        <DiagramImage
          src={diagram.imageUrl}
          revision={diagramRevision(diagram)}
          alt={diagram.title}
          className={`${PREVIEW_HEIGHT_CLASS} w-full object-contain transition-transform duration-long group-hover:scale-[1.02]`}
        />
      </button>

      <div className="flex items-start gap-3 px-0.5">
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className={TEXT_ROLE.cardTitle}>{diagram.title}</h3>
          {diagram.description && (
            <p className={TEXT_ROLE.cardDescription}>{diagram.description}</p>
          )}
        </div>
        <ItemActions
          itemTitle={diagram.title}
          onEdit={() => onEdit(diagram)}
          onRemove={() => onRemove(diagram)}
          className="-mt-1 -mr-1.5"
        />
      </div>
    </article>
  );
}

/** Same frame and preview height as `DiagramCard`, so the swap causes no layout shift. */
export function DiagramCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className={PREVIEW_FRAME_CLASS}>
        <SkeletonBar className={`${PREVIEW_HEIGHT_CLASS} w-full`} />
      </div>
      <div className="space-y-2 px-0.5">
        <SkeletonBar className="h-4 w-2/5" />
        <SkeletonBar className="h-3 w-3/4" />
      </div>
    </div>
  );
}
