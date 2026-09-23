import { useState, useEffect, useRef, useId } from 'react';
import Icon from './Icon';
import { type MealType } from '../utils/types';

type Props = {
  meal: MealType;
  setEditMealModalIsOpen: (isOpen: boolean) => void;
  setMealToEdit: (meal: MealType | null) => void;
  setDeleteMealModalIsOpen: (isOpen: boolean) => void;
  setMealToDelete: (meal: MealType | null) => void;
};

export default function Meal({
  meal,
  setEditMealModalIsOpen,
  setMealToEdit,
  setDeleteMealModalIsOpen,
  setMealToDelete,
}: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const optionsButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuId = useId();

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isMenuOpen]);

  function handleEditClick() {
    setMealToEdit(meal);
    setEditMealModalIsOpen(true);
    setIsMenuOpen(false);
  }

  function handleDeleteClick() {
    setMealToDelete(meal);
    setDeleteMealModalIsOpen(true);
    setIsMenuOpen(false);
  }

  function handleDotsClick() {
    setIsMenuOpen(!isMenuOpen);
  }

  // Escape closes the menu from the button or from inside it, and puts focus
  // back on the button so a keyboard user isn't left on a removed element
  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape' && isMenuOpen) {
      event.preventDefault();
      setIsMenuOpen(false);
      optionsButtonRef.current?.focus();
    }
  }

  return (
    <div ref={containerRef} className="meal bg-dark rounded-md p-6">
      <div className="flex items-start justify-between gap-2 relative" onKeyDown={handleKeyDown}>
        <h2 className="text-xl text-subtitle font-semibold mb-3">
          {meal.emoji}&nbsp;&nbsp;{meal.name}
        </h2>
        <button
          ref={optionsButtonRef}
          type="button"
          className="translate-x-2"
          onClick={handleDotsClick}
          aria-label={`options for ${meal.name}`}
          aria-expanded={isMenuOpen}
          aria-controls={menuId}
        >
          {<Icon name="dots" color="#ffffff" size="24px" />}
        </button>
        {/* Rendered only while open, as Dropdown does: a menu collapsed with
            max-height kept EDIT and DELETE tabbable and read out for every card.
            starting: runs the slide-open transition as it appears. */}
        {isMenuOpen && (
          <div
            id={menuId}
            className="flex flex-col absolute right-0 top-8 transition-all duration-300 overflow-hidden rounded-md max-h-[200px] starting:max-h-0"
          >
            <button
              type="button"
              onClick={handleEditClick}
              aria-label="edit"
              className="w-30 bg-light hover:bg-blue-700 font-semibold text-sm hover:text-light p-3"
            >
              EDIT
            </button>
            <button
              type="button"
              onClick={handleDeleteClick}
              aria-label="delete"
              className="w-30 bg-light hover:bg-red-800 font-semibold text-sm hover:text-light p-3"
            >
              DELETE
            </button>
          </div>
        )}
      </div>
      <ul className="flex flex-col gap-2 text-light">
        {meal.ingredients.map((ingredient, index) => (
          <li key={index}>
            {ingredient.quantity}&nbsp;
            {ingredient.units}&nbsp; -&nbsp;
            {ingredient.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
