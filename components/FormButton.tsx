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
      className="w-full border py-3 text-[13px] tracking-widest uppercase font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        borderColor: "var(--accent)",
        color: "var(--accent)",
        backgroundColor: "transparent",
      }}
    >
      {children}
    </button>
  );
}
