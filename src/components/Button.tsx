type Props = {
  classOverrides?: string;
  text?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
};

export default function Button({ classOverrides, text, icon, onClick }: Props) {
  return (
    <button
      className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${classOverrides}`}
      onClick={onClick}
    >
      {icon}
      {text}
    </button>
  );
}
