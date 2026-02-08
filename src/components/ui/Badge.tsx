type Color = "blue" | "green" | "yellow" | "red" | "gray";

const colors: Record<Color, string> = {
  blue: "bg-blue-100 text-blue-800",
  green: "bg-green-100 text-green-800",
  yellow: "bg-yellow-100 text-yellow-800",
  red: "bg-red-100 text-red-800",
  gray: "bg-gray-100 text-gray-800",
};

export function Badge({
  children,
  color = "blue",
}: {
  children: React.ReactNode;
  color?: Color;
}) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}
