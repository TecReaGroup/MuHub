/*
 * Style primitives for interactive controls. Callers pick a tone × size tier and may only add
 * layout classes (margin, width, visibility); never override color, size or radius here.
 */

export type ControlTone = 'primary' | 'secondary' | 'sunken' | 'ghost' | 'quietDanger' | 'danger';
export type ControlSize = 'sm' | 'md' | 'lg';

const CONTROL_BASE_CLASS = 'inline-flex shrink-0 items-center justify-center gap-1.5 font-medium whitespace-nowrap transition-colors select-none disabled:pointer-events-none disabled:opacity-50';

const CONTROL_TONE_CLASS: Record<ControlTone, string> = {
  primary: 'bg-accent text-on-accent shadow-rest hover:bg-accent-hover',
  secondary: 'border border-line bg-surface text-fg shadow-rest hover:border-line-strong hover:bg-hover',
  // Recessed into the canvas: for persistent shell actions that should be visible but not loud.
  sunken: 'bg-surface-sunken text-fg-muted hover:bg-line hover:text-fg',
  ghost: 'text-fg-muted hover:bg-hover hover:text-fg',
  // Looks like ghost at rest; turns danger only once the pointer commits to it.
  quietDanger: 'text-fg-muted hover:bg-danger-soft hover:text-danger',
  danger: 'bg-danger text-white shadow-rest hover:bg-danger-hover',
};

// sm: inside cards and list rows. md: toolbars and panel headers. lg: form submit, nav items, beside inputs.
const TEXT_CONTROL_SIZE_CLASS: Record<ControlSize, string> = {
  sm: 'h-7 rounded-tight px-2.5 text-xs [&_svg]:size-3.5',
  md: 'h-8 rounded-control px-3 text-sm [&_svg]:size-4',
  lg: 'h-9 rounded-control px-4 text-sm [&_svg]:size-4',
};

const ICON_CONTROL_SIZE_CLASS: Record<ControlSize, string> = {
  sm: 'size-7 rounded-tight [&_svg]:size-3.5',
  md: 'size-8 rounded-control [&_svg]:size-4',
  lg: 'size-9 rounded-control [&_svg]:size-[1.125rem]',
};

export function textControlClass(tone: ControlTone, size: ControlSize): string {
  return `${CONTROL_BASE_CLASS} ${CONTROL_TONE_CLASS[tone]} ${TEXT_CONTROL_SIZE_CLASS[size]}`;
}

export function iconControlClass(tone: ControlTone, size: ControlSize): string {
  return `${CONTROL_BASE_CLASS} ${CONTROL_TONE_CLASS[tone]} ${ICON_CONTROL_SIZE_CLASS[size]}`;
}

// Accent border plus a soft glow on focus; shape is chosen by the exported tiers below.
const FIELD_SURFACE_CLASS = 'w-full border border-line bg-surface text-sm text-fg transition-[border-color,box-shadow] placeholder:text-fg-subtle hover:border-line-strong focus:border-accent focus:ring-3 focus:ring-accent-soft focus:outline-none';

/** Text inputs and anything that must look like one. */
export const FIELD_CLASS = `${FIELD_SURFACE_CLASS} rounded-control`;

/** The global search box: a pill so it reads as navigation, not a form field. */
export const SEARCH_FIELD_CLASS = `${FIELD_SURFACE_CLASS} rounded-full`;
