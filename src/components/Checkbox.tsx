import { useState } from 'react';
import { icon } from '../utils/utils';

type Props = {
  id: string;
  onChange: (checked: boolean) => void;
  size?: string;
  color?: string;
  ariaLabel?: string;
  initialChecked?: boolean;
};

export default function Checkbox({ id, ariaLabel, onChange, size = '12px', color, initialChecked = false }: Props) {
  const [checked, setChecked] = useState(initialChecked);
  const iconSize = `${parseFloat(size) * 0.9}px`;

  function handleClick() {
    const newChecked = !checked;
    setChecked(newChecked);
    onChange(newChecked);
  }

  const containerStyles = { width: size, height: size };

  return (
    <label
      htmlFor={id}
      className="checkbox flex items-center justify-center shrink-0 border-1 border-light rounded-sm cursor-pointer"
      style={containerStyles}
    >
      <input
        type="checkbox"
        id={id}
        className="hidden"
        aria-label={ariaLabel}
        checked={checked}
        onChange={handleClick}
      />
      {checked && icon('check', color, iconSize)}
    </label>
  );
}
