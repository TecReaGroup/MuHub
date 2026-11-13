/*
 * Text roles. Two weights only (medium for controls/labels, semibold for headings) and
 * three colors (fg, fg-muted, fg-subtle). Add a role here before inventing one at a call site.
 */
export const TEXT_ROLE = {
  pageTitle: 'text-2xl font-semibold text-fg',
  dialogTitle: 'text-base font-semibold text-fg',
  panelTitle: 'text-xs font-semibold text-fg-muted',
  cardTitle: 'truncate text-[0.9375rem] font-medium text-fg',
  body: 'text-sm leading-relaxed text-fg-muted',
  label: 'text-xs font-medium text-fg-muted',
  meta: 'text-xs text-fg-subtle',
  caption: 'text-caption text-fg-subtle',
} as const;
