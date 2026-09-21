import { useState } from 'react';
import { icon } from '../utils/utils';

type Props = {
  id: string;
  onChange: (checked: boolean) => void;
  size?: string;
  color?: string;
  ariaLabel?: string;
  initialChecked?: boolean;
  checked?: boolean;
};

export default function Checkbox({
  id,
  ariaLabel,
  onChange,
  size = '12px',
  color,
  initialChecked = false,
  checked: controlledChecked,
}: Props) {
  // Uncontrolled unless the parent owns the value by passing `checked`
  const [internalChecked, setInternalChecked] = useState(initialChecked);
  const checked = controlledChecked ?? internalChecked;
  const iconSize = `${parseFloat(size) * 0.9}px`;

  function handleClick() {
    const newChecked = !checked;
    setInternalChecked(newChecked);
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
