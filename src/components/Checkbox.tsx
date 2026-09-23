import Icon from './Icon';

type Props = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: string;
  color?: string;
  ariaLabel?: string;
};

export default function Checkbox({
  id,
  checked,
  ariaLabel,
  onChange,
  size = '12px',
  color,
}: Props) {
  const iconSize = `${parseFloat(size) * 0.9}px`;

  function handleClick() {
    onChange(!checked);
  }

  const containerStyles = { width: size, height: size };

  // The label is the visible box. It is `relative` to contain the visually
  // hidden input, and it shows the focus ring the input can't show itself.
  return (
    <label
      htmlFor={id}
      className="checkbox relative flex items-center justify-center shrink-0 border-1 border-light rounded-sm cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-title"
      style={containerStyles}
    >
      <input
        type="checkbox"
        id={id}
        // sr-only, not hidden: display: none would take the input out of the tab
        // order and the accessibility tree, so keyboard and screen reader users
        // couldn't mark an item as bought
        className="sr-only"
        aria-label={ariaLabel}
        checked={checked}
        onChange={handleClick}
      />
      {checked && <Icon name="check" color={color} size={iconSize} />}
    </label>
  );
}
