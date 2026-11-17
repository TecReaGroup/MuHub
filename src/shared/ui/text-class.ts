/*
 * Text roles. Two weights only (medium for controls/labels, semibold for headings) and
 * three colors (fg, fg-muted, fg-subtle). Add a role here before inventing one at a call site.
 */
export const TEXT_ROLE = {
  pageTitle: 'text-xl leading-7 font-semibold text-fg sm:text-2xl sm:leading-8',
  pageSubtitle: 'text-xs leading-5 text-fg-muted sm:text-sm sm:leading-relaxed',
  dialogTitle: 'text-base font-semibold text-fg',
  sectionTitle: 'text-sm font-semibold text-fg',
  panelTitle:'text-xs font-semibold text-fg-muted',
  cardTitle: 'truncate text-[0.9375rem] font-medium text-fg',
  // Fixed 20px lines so a two-line clamp has a predictable height for skeletons.
  cardDescription: 'line-clamp-2 whitespace-pre-line text-sm leading-5 break-words text-fg-muted',
  body: 'text-sm leading-relaxed text-fg-muted',
  label: 'text-xs font-medium text-fg-muted',
  meta: 'text-xs text-fg-subtle',
  caption: 'text-caption text-fg-subtle',
} as const;
