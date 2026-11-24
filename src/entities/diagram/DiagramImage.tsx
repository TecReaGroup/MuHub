import { useEffect, useState, type CSSProperties } from 'react';
import { useI18n } from '../../shared/i18n/locale';
import { diagramImageSrc } from './diagram';

interface DiagramImageProps {
  src: string;
  /** See `diagramImageSrc`. */
  revision: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
}

/** Place on a `bg-diagram-canvas` surface: the image is pinned to its light palette. */
export function DiagramImage({ src, revision, alt, className = '', style }: DiagramImageProps) {
  const { text } = useI18n();
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => setHasFailed(false), [src, revision]);

  if (hasFailed) {
    return <div className="py-16 text-center text-xs text-fg-subtle">{text['diagram.imageFailed']}</div>;
  }
  return (
    // draw.io exports use `color-scheme: light dark` + light-dark(), which follow the OS theme.
    // Pinning the img to light renders the authored palette on the white canvas behind it.
    <img
      src={diagramImageSrc(src, revision)}
      alt={alt}
      loading="lazy"
      draggable={false}
      onError={() => setHasFailed(true)}
      className={`mx-auto block scheme-light select-none ${className}`}
      style={style}
    />
  );
}
