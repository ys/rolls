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
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b5a52", display: "block" }}>
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
        style={{
          width: "100%", background: "none", border: "none",
          borderBottom: "1px solid var(--sheet-border)",
          padding: "8px 0", fontSize: 17, fontFamily: "inherit",
          color: "var(--sheet-text)", outline: "none", caretColor: "var(--accent)",
        }}
      />
    </div>
  );
}
