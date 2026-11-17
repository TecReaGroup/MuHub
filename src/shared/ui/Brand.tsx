import { RouteLink } from '../router/RouteLink';

/** Logo and wordmark, linking home; shared by the app bar and the login page. */
export function Brand({ className = '' }: { className?: string }) {
  return (
    <RouteLink href="/" aria-label="MuHub" className={`flex items-center gap-2.5 justify-self-start rounded-control ${className}`}>
      <img src="/favicon.svg" alt="" className="size-8 shrink-0" />
      <span className="text-lg font-semibold tracking-tight">
        <span className="text-fg">Mu</span>
        <span className="font-normal text-fg-muted">Hub</span>
      </span>
    </RouteLink>
  );
}
