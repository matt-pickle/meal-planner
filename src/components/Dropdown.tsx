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
  onSelect: (value: string) => void;
};

export default function Dropdown({
  options,
  placeholder = 'Select an option...',
  width,
  onSelect,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option>({ value: '', label: '' });
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  function handleOptionClick(option: Option) {
    setSelectedOption(option);
    setIsOpen(false);
    onSelect(option.value);
  };

  const style = {
    maxWidth: width,
  };

  return (
    <div className="dropdown w-full mb-8">
      <div ref={dropdownRef} className="relative w-full cursor-pointer" style={style}>
        <div
          className="flex justify-between items-center border-b-1 border-slate-200 py-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="dropdown"
        >
          <span className="text-white">{selectedOption.label || <span>{placeholder}</span>}</span>
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
              className={`p-[.7rem] cursor-pointer hover:bg-gray-800 hover:text-white ${
                selectedOption.value === option.value ? 'bg-gray-800 text-white selected' : ''
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
