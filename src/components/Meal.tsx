import { useState, useEffect, useRef } from 'react';
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

  return (
    <div ref={containerRef} className="meal bg-dark rounded-md p-6">
      <div className="flex items-start justify-between gap-2 relative">
        <h2 className="text-xl text-subtitle font-semibold mb-3">
          {meal.emoji}&nbsp;&nbsp;{meal.name}
        </h2>
        <button className="translate-x-2" onClick={handleDotsClick}>
          {<Icon name="dots" color="#ffffff" size="24px" />}
        </button>
        <div
          className={`flex flex-col absolute right-0 top-8 transition-all duration-300 overflow-hidden rounded-md ${
            isMenuOpen ? 'max-h-[200px]' : 'max-h-0'
          }`}
        >
          <button
            onClick={handleEditClick}
            aria-label="edit"
            className="w-30 bg-light hover:bg-blue-700 font-semibold text-sm hover:text-light p-3"
          >
            EDIT
          </button>
          <button
            onClick={handleDeleteClick}
            aria-label="delete"
            className="w-30 bg-light hover:bg-red-800 font-semibold text-sm hover:text-light p-3"
          >
            DELETE
          </button>
        </div>
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
