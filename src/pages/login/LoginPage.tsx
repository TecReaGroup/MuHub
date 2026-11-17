import { LoginForm } from '../../features/access/LoginForm';
import { LocaleSwitch } from '../../features/locale-switch/LocaleSwitch';
import { Brand } from '../../shared/ui/Brand';

/** Shown at any URL while locked; logging in reveals that same page, so deep links survive the login. */
export function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-fg">
      {/* z-30 keeps the locale menu above the card, matching the app bar. */}
      <header className="relative z-30 flex h-14 shrink-0 items-center justify-between px-4">
        <Brand />
        <LocaleSwitch />
      </header>
      {/* Bottom padding mirrors the header so the card sits at the true center of the window. */}
      <main className="flex flex-1 items-center justify-center px-4 pb-14 animate-fade-in">
        <LoginForm />
      </main>
    </div>
  );
}
