import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { INPUT_CLASS, MENU_ITEM_CLASS, MENU_SURFACE_CLASS } from './control-class';
import { FormField } from './FormField';
import { Icon } from './Icon';
import { useScrollbar } from './use-scrollbar';

const MAX_VISIBLE_OPTIONS = 4;
const MENU_GAP = 6;
const VIEWPORT_MARGIN = 8;

interface ComboboxFieldProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
}

/** Offers existing values while allowing a new value to be typed. */
export function ComboboxField({ label, value, options, onChange, placeholder, required, maxLength }: ComboboxFieldProps) {
  const inputId = useId();
  const listId = `${inputId}-list`;
  const fieldRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeOptionRef = useRef<HTMLLIElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [query, setQuery] = useState('');
  const menuRef = useRef<HTMLUListElement>(null);
  const scrollbar = useScrollbar();
  const matchingOptions = options.filter(option => option.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const listVisible = expanded && matchingOptions.length > 0;

  useEffect(() => {
    const field = fieldRef.current!;
    const dismissOutsideField = (event: Event) => {
      if (event.target instanceof Node && !field.contains(event.target)) {
        setExpanded(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('pointerdown', dismissOutsideField, true);
    document.addEventListener('focusin', dismissOutsideField);
    return () => {
      document.removeEventListener('pointerdown', dismissOutsideField, true);
      document.removeEventListener('focusin', dismissOutsideField);
    };
  }, []);

  useEffect(() => {
    if (listVisible) activeOptionRef.current?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, listVisible]);

  useLayoutEffect(() => {
    if (!listVisible) return;
    const input = inputRef.current!;
    const menu = menuRef.current!;
    const viewport = window.visualViewport;
    // Top layer, so the menu neither scrolls nor is clipped by an enclosing modal <dialog>.
    // Set imperatively: React 18 does not know the `popover` attribute.
    menu.setAttribute('popover', 'manual');
    if (!menu.matches(':popover-open')) menu.showPopover();
    const menuBox = getComputedStyle(menu);
    const menuChrome = ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'] as const;
    // Row height differs between pointer types, so measure it rather than hard-coding a pixel cap.
    const menuMaxHeight = (menu.firstElementChild as HTMLElement).offsetHeight * MAX_VISIBLE_OPTIONS
      + menuChrome.reduce((sum, side) => sum + parseFloat(menuBox[side]), 0);
    const updatePlacement = () => {
      const anchor = input.getBoundingClientRect();
      const visibleTop = (viewport?.offsetTop ?? 0) + VIEWPORT_MARGIN;
      const visibleBottom = (viewport?.offsetTop ?? 0) + (viewport?.height ?? window.innerHeight) - VIEWPORT_MARGIN;
      const spaceAbove = anchor.top - MENU_GAP - visibleTop;
      const spaceBelow = visibleBottom - anchor.bottom - MENU_GAP;
      const neededHeight = Math.min(menuMaxHeight, menu.scrollHeight);
      // Phones always open upward: the keyboard animating in would otherwise cover a menu below.
      const opensUpward = window.matchMedia('(width < 48rem)').matches || (spaceBelow < neededHeight && spaceAbove > spaceBelow);
      const maxHeight = Math.max(0, Math.min(menuMaxHeight, opensUpward ? spaceAbove : spaceBelow));
      Object.assign(menu.style, {
        left: `${anchor.left}px`,
        width: `${anchor.width}px`,
        maxHeight: `${maxHeight}px`,
        top: opensUpward ? 'auto' : `${anchor.bottom + MENU_GAP}px`,
        bottom: opensUpward ? `${window.innerHeight - anchor.top + MENU_GAP}px` : 'auto',
      });
    };
    updatePlacement();
    viewport?.addEventListener('resize', updatePlacement);
    viewport?.addEventListener('scroll', updatePlacement);
    window.addEventListener('resize', updatePlacement);
    document.addEventListener('scroll', updatePlacement, true);
    return () => {
      viewport?.removeEventListener('resize', updatePlacement);
      viewport?.removeEventListener('scroll', updatePlacement);
      window.removeEventListener('resize', updatePlacement);
      document.removeEventListener('scroll', updatePlacement, true);
    };
  }, [listVisible, matchingOptions.length]);

  function selectOption(option: string) {
    onChange(option);
    setExpanded(false);
    setActiveIndex(-1);
  }

  function toggleOptions() {
    inputRef.current?.focus();
    setQuery('');
    setExpanded(!listVisible);
    setActiveIndex(-1);
  }

  return (
    <div ref={fieldRef}>
      <FormField htmlFor={inputId} label={label}>
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={listVisible}
          aria-controls={listVisible ? listId : undefined}
          aria-activedescendant={listVisible && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
          autoComplete="off"
          value={value}
          required={required}
          maxLength={maxLength}
          placeholder={placeholder}
          className={`${INPUT_CLASS} pr-10 text-left`}
          onPointerDown={event => {
            if (event.button !== 0) return;
            setQuery('');
            setExpanded(true);
            setActiveIndex(-1);
          }}
          onChange={event => {
            onChange(event.currentTarget.value);
            setQuery(event.currentTarget.value);
            setExpanded(true);
            setActiveIndex(-1);
          }}
          onKeyDown={event => {
            if (event.nativeEvent.isComposing) return;
            if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && matchingOptions.length > 0) {
              event.preventDefault();
              setExpanded(true);
              const step = event.key === 'ArrowDown' ? 1 : -1;
              setActiveIndex(index => index < 0 ? (step === 1 ? 0 : matchingOptions.length - 1) : (index + step + matchingOptions.length) % matchingOptions.length);
            } else if (event.key === 'Enter' && listVisible && activeIndex >= 0) {
              event.preventDefault();
              selectOption(matchingOptions[activeIndex]);
            } else if (event.key === 'Escape' && expanded) {
              event.preventDefault();
              event.stopPropagation();
              setExpanded(false);
              setActiveIndex(-1);
            }
          }}
        />
        {options.length > 0 && (
          <button
            type="button"
            tabIndex={-1}
            aria-label={label}
            aria-expanded={listVisible}
            aria-controls={listVisible ? listId : undefined}
            className="absolute inset-y-0 right-1.5 my-auto flex size-7 cursor-pointer items-center justify-center rounded-tight text-fg-muted transition-colors hover:bg-hover hover:text-fg"
            onPointerDown={event => {
              if (event.button !== 0) return;
              event.preventDefault();
              toggleOptions();
            }}
            onClick={event => {
              // Keyboard and assistive activation have no pointer press.
              if (event.detail === 0) toggleOptions();
            }}
          >
            <Icon name="chevronDown" className={`size-4 transition-transform motion-reduce:transition-none ${listVisible ? 'rotate-180' : ''}`} />
          </button>
        )}
        {listVisible && (
          <ul ref={menuRef} {...scrollbar} id={listId} role="listbox" aria-label={label} className={`${MENU_SURFACE_CLASS} scrollbar-subtle fixed m-0 animate-fade-in overflow-y-auto overscroll-contain p-1.5 text-fg`}>
            {matchingOptions.map((option, index) => (
              <li
                key={option}
                ref={activeIndex === index ? activeOptionRef : undefined}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={value === option}
                className={`${MENU_ITEM_CLASS} ${activeIndex === index ? 'bg-hover' : ''}`}
                onMouseDown={event => event.preventDefault()}
                onClick={() => selectOption(option)}
              >
                <span className="min-w-0 truncate" title={option}>{option}</span>
                <Icon name="check" className={`size-4 shrink-0 text-accent ${value === option ? '' : 'invisible'}`} />
              </li>
            ))}
          </ul>
        )}
      </div>
      </FormField>
    </div>
  );
}
