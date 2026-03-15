"use client";

export default function FormField({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
  inputMode,
  autoFocus,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>["inputMode"];
  autoFocus?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] uppercase tracking-widest text-zinc-400">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        inputMode={inputMode}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white py-2 text-base focus:outline-none transition-colors"
      />
    </div>
  );
}
