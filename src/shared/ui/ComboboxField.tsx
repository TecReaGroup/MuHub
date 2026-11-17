import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { INPUT_CLASS } from './control-class';
import { FormField } from './FormField';
import { Icon } from './Icon';
import { useScrollbar } from './use-scrollbar';

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
  const [menuStyle, setMenuStyle] = useState<CSSProperties>();
  const [listStyle, setListStyle] = useState<CSSProperties>();
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
    const viewport = window.visualViewport;
    const updatePlacement = () => {
      if (!window.matchMedia('(width < 48rem)').matches) {
        setMenuStyle(undefined);
        setListStyle(undefined);
        return;
      }
      const anchor = input.getBoundingClientRect();
      const dialog = input.closest('dialog')?.getBoundingClientRect();
      const visibleTop = Math.max(viewport?.offsetTop ?? 0, dialog?.top ?? 0);
      const visibleBottom = Math.min((viewport?.offsetTop ?? 0) + (viewport?.height ?? window.innerHeight), dialog?.bottom ?? window.innerHeight);
      // Keep the mobile menu above its input while the keyboard animates.
      const availableHeight = Math.max(0, Math.min(anchor.top, visibleBottom) - visibleTop - 8);
      const menu = document.getElementById(listId)!.parentElement!;
      const menuPadding = parseFloat(getComputedStyle(menu).paddingTop) + parseFloat(getComputedStyle(menu).paddingBottom);
      setMenuStyle({ top: 'auto', bottom: '100%', marginTop: 0, marginBottom: 8 });
      setListStyle({ maxHeight: Math.max(0, Math.min(160, availableHeight - menuPadding - 2)) });
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
  }, [listVisible, listId]);

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
            className="absolute inset-y-0 right-0 flex w-10 cursor-pointer items-center justify-center rounded-control text-fg-muted hover:text-fg"
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
          <div style={menuStyle} className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-card border border-line bg-surface py-[var(--radius-card)] shadow-overlay">
            <ul {...scrollbar} style={listStyle} id={listId} role="listbox" aria-label={label} className="scrollbar-subtle max-h-40 overflow-y-auto overscroll-contain px-1.5">
              {matchingOptions.map((option, index) => (
                <li
                  key={option}
                  ref={activeIndex === index ? activeOptionRef : undefined}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={value === option}
                  className={`relative flex min-h-10 cursor-pointer items-center rounded-control pl-3 pr-8 text-left text-sm text-fg transition-colors hover:bg-hover active:bg-hover aria-selected:bg-accent-soft aria-selected:font-medium pointer-coarse:min-h-11 ${activeIndex === index ? 'bg-hover' : ''}`}
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => selectOption(option)}
                >
                  <span className="min-w-0 truncate" title={option}>{option}</span>
                  {value === option && <Icon name="check" className="absolute right-2 size-4 text-accent" />}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      </FormField>
    </div>
  );
}
