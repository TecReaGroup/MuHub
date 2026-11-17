import type { PlainMessageKey } from '../i18n/message';
import type { IconName } from './Icon';

/** A top-level destination; the desktop sidebar and the mobile tab bar render the same list. */
export interface NavRoute {
  id: string;
  path: string;
  labelKey: PlainMessageKey;
  icon: IconName;
}
