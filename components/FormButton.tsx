"use client";

export default function FormButton({
  children,
  variant = "primary",
  type = "button",
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
}) {
  if (variant === "secondary") {
    return (
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className="w-full text-[11px] uppercase tracking-widest py-2 transition-colors disabled:opacity-40"
        style={{
          color: "var(--text-tertiary)",
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="w-full py-3 text-[11px] tracking-widest uppercase font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        backgroundColor: disabled ? "var(--sheet-border)" : "var(--accent)",
        color: "#fff",
        border: "none",
        fontFamily: "inherit",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}
