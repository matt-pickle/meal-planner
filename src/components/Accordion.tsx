import { useState } from 'react';
import { icon } from '../utils/utils';

type Props = {
  heading: string;
  content: Array<React.JSX.Element>;
};

export default function Accordion({ heading, content }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="accordion">
      <div className="flex justify-between items-center w-full">
        <h2 className="text-subtitle text-xl font-semibold">{heading}</h2>
        <button
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          onClick={toggleAccordion}
          aria-label="toggle accordion"
        >
          {icon('chevron-down', '#bfdbfe')}
        </button>
      </div>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
        data-testid="accordion-content"
      >
        <div className="overflow-hidden flex flex-col gap-4 sm:gap-2 pt-4">{content}</div>
      </div>
    </div>
  );
}
