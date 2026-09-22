type Props = {
  classOverrides?: string;
  text?: string;
  icon?: React.JSX.Element;
  ariaLabel?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export default function Button({
  classOverrides,
  text,
  icon,
  ariaLabel,
  onClick,
  disabled = false,
}: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${classOverrides}`}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
    >
      {icon}
      {text}
    </button>
  );
}
