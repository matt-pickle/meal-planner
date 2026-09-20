import { useState, useRef, useEffect } from 'react';
import { icon } from '../utils/utils';

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
  onSelect: (value: string) => void;
};

export default function Dropdown({
  options,
  placeholder = 'Select an option...',
  width,
  value = '',
  classOverrides,
  onSelect,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(option => option.value === selectedValue);

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

  // Follow the selection along when the parent changes it
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  function handleOptionClick(option: Option) {
    setSelectedValue(option.value);
    setIsOpen(false);
    onSelect(option.value);
  };

  const style = {
    maxWidth: width,
  };

  return (
    <div className={`dropdown w-full mb-8 ${classOverrides}`}>
      <div ref={dropdownRef} className="relative w-full cursor-pointer" style={style}>
        <div
          className="flex justify-between items-center border-b-1 border-slate-200 py-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="dropdown"
        >
          <span className="text-light">{selectedOption?.label || <span>{placeholder}</span>}</span>
          <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>{icon('chevron-down', "#ffffff")}</div>
        </div>

        <div
          className={`absolute left-0 right-0 !p-0 z-2 border-t-0 transition-all duration-300 ease-in-out bg-slate-200 ${
            isOpen ? 'max-h-48 overflow-y-auto opacity-100' : 'max-h-0 overflow-y-hidden opacity-0'
          }`}
        >
          {options.map(option => (
            <div
              key={option.value}
              className={`p-[.7rem] cursor-pointer hover:bg-medium hover:text-white ${
                selectedValue === option.value ? 'bg-medium text-white selected' : ''
              }`}
              onClick={() => handleOptionClick(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
