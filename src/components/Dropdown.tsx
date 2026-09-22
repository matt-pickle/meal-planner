import { useState, useRef, useEffect, useId } from 'react';
import Icon from './Icon';

type Option = {
  label: string;
  value: string;
};

type Props = {
  options: Array<Option>;
  placeholder?: string;
  width?: number;
  value?: string;
  classOverrides?: string;
  ariaLabel?: string;
  // When set, an extra first option with this label clears the selection
  clearLabel?: string;
  onSelect: (value: string) => void;
};

export default function Dropdown({
  options,
  placeholder = 'Select an option...',
  width,
  value = '',
  classOverrides,
  ariaLabel,
  clearLabel,
  onSelect,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  // Which option the keyboard is on while the list is open
  const [activeIndex, setActiveIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();
  const listId = `${id}-listbox`;

  // The clear entry is offered in the list but is not a selection of its own:
  // with nothing chosen the trigger shows the placeholder, not the clear label.
  const listOptions =
    clearLabel === undefined ? options : [{ label: clearLabel, value: '' }, ...options];

  // Fully controlled: the selection is whatever the parent passes
  const selectedIndex = listOptions.findIndex(option => option.value === value);
  const selectedOption = options.find(option => option.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Move focus into the list when it opens so arrow keys work straight away
  useEffect(() => {
    if (isOpen) {
      listRef.current?.focus();
    }
  }, [isOpen]);

  function open() {
    setActiveIndex(selectedIndex === -1 ? 0 : selectedIndex);
    setIsOpen(true);
  }

  function close(returnFocus = true) {
    setIsOpen(false);
    if (returnFocus) {
      buttonRef.current?.focus();
    }
  }

  function choose(option: Option) {
    close();
    onSelect(option.value);
  }

  function handleButtonKeyDown(event: React.KeyboardEvent) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      open();
    }
  }

  function handleListKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex(index => Math.min(index + 1, listOptions.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex(index => Math.max(index - 1, 0));
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(listOptions.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (listOptions[activeIndex]) choose(listOptions[activeIndex]);
        break;
      case 'Escape':
        event.preventDefault();
        close();
        break;
      case 'Tab':
        close(false);
        break;
    }
  }

  const style = {
    maxWidth: width,
  };

  return (
    <div className={`dropdown w-full mb-8 ${classOverrides}`}>
      <div ref={dropdownRef} className="relative w-full" style={style}>
        <button
          ref={buttonRef}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-label={ariaLabel}
          onClick={() => (isOpen ? close(false) : open())}
          onKeyDown={handleButtonKeyDown}
          className="flex justify-between items-center w-full border-b-1 border-slate-200 py-2 cursor-pointer text-left"
        >
          <span className="text-light">{selectedOption?.label || placeholder}</span>
          <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            <Icon name="chevron-down" color="#ffffff" />
          </span>
        </button>

        {/* Rendered only while open: a collapsed list stays focusable and is
            still announced by screen readers. */}
        {isOpen && (
          <ul
            id={listId}
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            aria-label={ariaLabel}
            aria-activedescendant={
              listOptions[activeIndex] ? `${id}-option-${activeIndex}` : undefined
            }
            onKeyDown={handleListKeyDown}
            className="absolute left-0 right-0 !p-0 z-2 max-h-48 overflow-y-auto border-t-0 bg-slate-200 outline-none"
          >
            {listOptions.map((option, index) => (
              <li
                key={option.value}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={value === option.value}
                className={`p-[.7rem] cursor-pointer hover:bg-medium hover:text-white ${
                  value === option.value ? 'bg-medium text-white selected' : ''
                } ${index === activeIndex ? 'bg-medium/80 text-white' : ''}`}
                onClick={() => choose(option)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
