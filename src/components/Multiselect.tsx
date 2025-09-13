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
  onSelect: (options: Array<string>) => void;
};

export default function Multiselect({
  options,
  placeholder = 'Select option(s)...',
  width,
  onSelect,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Array<string>>([]);
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
    if (selectedOptions.includes(option.value)) {
      setSelectedOptions(prev => prev.filter(v => v !== option.value));
    } else {
      setSelectedOptions(prev => [...prev, option.value]);
    }
    onSelect(selectedOptions);
  }

  const style = {
    maxWidth: width,
  };

  return (
    <div className="dropdown w-full">
      <div ref={dropdownRef} className="relative w-full cursor-pointer" style={style}>
        <div
          className="flex justify-between items-center"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="dropdown"
        >
          {selectedOptions.length === 0 ? (
            <span className="text-primary">{placeholder}</span>
          ) : (
            selectedOptions.map(value => {
              const option = options.find(opt => opt.value === value);
              return (
                <span key={value}>
                  {option?.label}
                  <button
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedOptions(prev => prev.filter(v => v !== value));
                      onSelect(selectedOptions);
                    }}
                  >
                    {icon('x')}
                  </button>
                </span>
              );
            })
          )}
          <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            {icon('chevron-down')}
          </div>
        </div>

        <div
          className={`absolute left-0 right-0 !p-0 z-2 border-t-0 transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-48 overflow-y-auto opacity-100' : 'max-h-0 overflow-y-hidden opacity-0'
          }`}
        >
          {options.map(option => (
            <div
              key={option.value}
              className={`p-[.7rem] cursor-pointer hover:bg-gray-200 ${
                selectedOptions.includes(option.value) ? 'text-secondary selected' : ''
              }`}
              onClick={() => handleOptionClick(option)}
            >
              <div className="inline-block w-5 h-5 border-gray-400 rounded-sm">
                <div
                  className={selectedOptions.includes(option.value) ? '' : 'invisible'}
                  aria-label="check icon"
                >
                  {icon('check')}
                </div>
              </div>
              {option.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
