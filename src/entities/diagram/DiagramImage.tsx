import { useEffect, useState, type CSSProperties } from 'react';

interface DiagramImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
}

/** Place on a `bg-diagram-canvas` surface: the image is pinned to its light palette. */
export function DiagramImage({ src, alt, className = '', style }: DiagramImageProps) {
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => setHasFailed(false), [src]);

  if (hasFailed) {
    return <div className="py-16 text-center text-xs font-light text-fg-subtle">图片加载失败</div>;
  }
  return (
    // draw.io exports use `color-scheme: light dark` + light-dark(), which follow the OS theme.
    // Pinning the img to light renders the authored palette on the white canvas behind it.
    <img
      src={src}
      alt={alt}
      loading="lazy"
      draggable={false}
      onError={() => setHasFailed(true)}
      className={`mx-auto block scheme-light select-none ${className}`}
      style={style}
    />
  );
}
