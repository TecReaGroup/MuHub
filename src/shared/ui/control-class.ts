/*
 * Style primitives for interactive controls. Callers pick a tone × size tier and may only add
 * layout classes (margin, width, visibility); never override color, size or radius here.
 */

export type ControlTone = 'primary' | 'secondary' | 'sunken' | 'ghost' | 'quietDanger' | 'danger';
export type ControlSize = 'sm' | 'md' | 'lg';

// Touch screens get a 44px minimum hit area (Apple HIG / WCAG 2.5.5) without changing the desktop look.
const CONTROL_BASE_CLASS = 'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 font-medium whitespace-nowrap transition-colors select-none pointer-coarse:min-h-11 pointer-coarse:min-w-11 disabled:pointer-events-none disabled:opacity-50';

const CONTROL_TONE_CLASS: Record<ControlTone, string> = {
  primary: 'bg-accent text-on-accent shadow-rest hover:bg-accent-hover active:bg-accent-hover',
  secondary: 'border border-line bg-surface text-fg shadow-rest hover:border-line-strong hover:bg-hover active:bg-hover',
  // Recessed into the canvas: for persistent shell actions that should be visible but not loud.
  sunken: 'bg-surface-sunken text-fg-muted hover:bg-line hover:text-fg active:bg-line',
  ghost: 'text-fg-muted hover:bg-hover hover:text-fg active:bg-hover',
  // Looks like ghost at rest; turns danger only once the pointer commits to it.
  quietDanger: 'text-fg-muted hover:bg-danger-soft hover:text-danger active:bg-danger-soft active:text-danger',
  danger: 'bg-danger text-white shadow-rest hover:bg-danger-hover active:bg-danger-hover',
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

/**
 * Round 44px icon action in the compact (mobile) app bar.
 * `aria-expanded` / an open parent `<details>` mark the panel it controls as shown.
 */
export const APP_BAR_ACTION_CLASS = 'inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-fg-muted transition-colors select-none hover:bg-hover hover:text-fg active:bg-hover aria-expanded:bg-accent-soft aria-expanded:text-fg group-open:bg-accent-soft group-open:text-fg [&_svg]:size-5';

// Accent border plus a soft glow on focus; shape is chosen by the exported tiers below.
// 16px text on touch screens: iOS zooms the page into any focused field smaller than that.
const FIELD_SURFACE_CLASS = 'w-full min-w-0 border border-line bg-surface text-sm text-fg transition-[border-color,box-shadow] placeholder:text-fg-subtle hover:border-line-strong focus:border-accent focus:ring-3 focus:ring-accent-soft focus:outline-none pointer-coarse:text-base';

/** Text inputs and anything that must look like one. */
export const FIELD_CLASS = `${FIELD_SURFACE_CLASS} rounded-control`;

export const INPUT_CLASS = `${FIELD_CLASS} h-10 px-3 pointer-coarse:h-11`;

/** The global search box: a pill so it reads as navigation, not a form field. */
export const SEARCH_FIELD_CLASS = `${FIELD_SURFACE_CLASS} h-10 rounded-full pointer-coarse:h-11`;
