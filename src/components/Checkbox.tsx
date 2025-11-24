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

export default function Checkbox({ id, ariaLabel, onChange, size, color, initialChecked = false }: Props) {
  const [checked, setChecked] = useState(initialChecked);

  function handleClick() {
    const newChecked = !checked;
    setChecked(newChecked);
    onChange(newChecked);
  }

  return (
    <label htmlFor={id} className="checkbox">
      <input
        type="checkbox"
        id={id}
        className="hidden"
        aria-label={ariaLabel}
        checked={checked}
        onChange={handleClick}
      />
      {checked && icon('check', size, color)}
    </label>
  );
}
