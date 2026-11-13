import { useState } from 'react';
import { log, serializeError } from '../../shared/lib/logger';
import { IconButton } from '../../shared/ui/Button';
import { Icon } from '../../shared/ui/Icon';

// Also read by the pre-paint script in index.html.
const THEME_STORAGE_KEY = 'muhub-theme';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  function toggleTheme() {
    const nextIsDark = !isDark;
    document.documentElement.classList.toggle('dark', nextIsDark);
    setIsDark(nextIsDark);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextIsDark ? 'dark' : 'light');
    } catch (error) {
      log('warn', 'Theme', 'Theme preference not persisted', serializeError(error));
    }
  }

  return (
    <IconButton label={isDark ? '切换到浅色主题' : '切换到深色主题'} onClick={toggleTheme}>
      <Icon name={isDark ? 'sun' : 'moon'} />
    </IconButton>
  );
}
