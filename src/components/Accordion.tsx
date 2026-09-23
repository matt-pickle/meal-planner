import { useState, useId } from 'react';
import Icon from './Icon';

type Props = {
  heading: string;
  content: Array<React.JSX.Element>;
};

export default function Accordion({ heading, content }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = `${useId()}-content`;

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="accordion">
      <div className="flex justify-between items-center w-full">
        <h2 className="text-subtitle text-xl font-semibold">{heading}</h2>
        <button
          type="button"
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          onClick={toggleAccordion}
          aria-label="toggle accordion"
          aria-expanded={isOpen}
          aria-controls={contentId}
        >
          <Icon name="chevron-down" color="#bfdbfe" />
        </button>
      </div>
      {/* `hidden` rather than a collapsed grid row: collapsed content stays
          focusable and is still announced by screen readers. */}
      <div
        id={contentId}
        hidden={!isOpen}
        className="grid grid-rows-[1fr] transition-all duration-300 ease-in-out"
        data-testid="accordion-content"
      >
        <div className="overflow-hidden flex flex-col gap-4 sm:gap-2 pt-4">{content}</div>
      </div>
    </div>
  );
}
