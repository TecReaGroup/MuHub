import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { navigate } from './history';

type RouteLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

// Modified or non-primary clicks keep native behavior (new tab, new window, download).
function isPlainLeftClick(event: MouseEvent) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

/** In-app link: a real `<a href>` for crawlers and middle-click, client-side navigation for plain clicks. */
export function RouteLink({ href, onClick, ...anchorProps }: RouteLinkProps) {
  return (
    <a
      {...anchorProps}
      href={href}
      onClick={event => {
        onClick?.(event);
        if (event.defaultPrevented || !isPlainLeftClick(event)) return;
        event.preventDefault();
        navigate(href);
      }}
    />
  );
}
