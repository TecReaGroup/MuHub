import { useId, useState, type FormEvent } from 'react';
import { useI18n } from '../../shared/i18n/locale';
import { IconButton, SubmitButton } from '../../shared/ui/Button';
import { INPUT_CLASS } from '../../shared/ui/control-class';
import { FormField } from '../../shared/ui/FormField';
import { Icon } from '../../shared/ui/Icon';
import { TEXT_ROLE } from '../../shared/ui/text-class';
import { login, type LoginOutcome } from './access-store';

type LoginFailure = Exclude<LoginOutcome, 'granted'>;

/** Password card; a successful login flips the access store, which swaps this page for the app. */
export function LoginForm() {
  const { text } = useI18n();
  const passwordId = useId();
  const errorId = useId();
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [failure, setFailure] = useState<LoginFailure | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setIsPending(true);
    setFailure(null);
    const outcome = await login(password);
    // On success this component unmounts, so only failures update its state.
    if (outcome !== 'granted') {
      setFailure(outcome);
      setIsPending(false);
    }
  }

  const failureMessage = failure === 'wrongPassword' ? text['access.wrongPassword'] : text['access.unavailable'];

  return (
    <form onSubmit={submit} className="w-full max-w-sm rounded-card border border-line bg-surface p-6 shadow-hover sm:p-8">
      <span className="flex size-12 items-center justify-center rounded-control bg-surface-sunken text-fg">
        <Icon name="lock" className="size-5" />
      </span>
      <h1 className={`mt-6 ${TEXT_ROLE.pageTitle}`}>{text['access.title']}</h1>
      <p className={`mt-2 ${TEXT_ROLE.body}`}>{text['access.subtitle']}</p>

      <div className="mt-6">
        <FormField htmlFor={passwordId} label={text['access.password']}>
          <div className="relative">
            <input
              id={passwordId}
              type={isPasswordVisible ? 'text' : 'password'}
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={event => setPassword(event.target.value)}
              aria-invalid={failure === 'wrongPassword'}
              aria-describedby={failure ? errorId : undefined}
              className={`${INPUT_CLASS} pr-11`}
            />
            <IconButton
              label={isPasswordVisible ? text['access.hidePassword'] : text['access.showPassword']}
              aria-pressed={isPasswordVisible}
              onClick={() => setIsPasswordVisible(visible => !visible)}
              className="absolute inset-y-0 right-1 my-auto"
            >
              <Icon name={isPasswordVisible ? 'eyeSlash' : 'eye'} />
            </IconButton>
          </div>
        </FormField>
        {failure && <p id={errorId} role="alert" className="mt-2 text-xs text-danger">{failureMessage}</p>}
      </div>

      <SubmitButton pending={isPending} disabled={password === ''} className="mt-6 w-full">
        {text['access.submit']}
        {!isPending && <Icon name="arrowRight" />}
      </SubmitButton>
    </form>
  );
}
