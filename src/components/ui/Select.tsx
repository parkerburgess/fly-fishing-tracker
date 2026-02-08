import { SelectHTMLAttributes } from "react";

export function Select({
  label,
  error,
  options,
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  options: readonly string[];
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={props.id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${error ? "border-red-500" : ""} ${className}`}
        {...props}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
