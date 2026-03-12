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
        className="w-full text-[10px] uppercase tracking-widest py-2 transition-colors disabled:opacity-40"
        style={{
          color: "var(--darkroom-text-tertiary)",
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
      className="w-full border py-3 text-xs tracking-widest uppercase font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        borderColor: "var(--darkroom-accent)",
        color: "var(--darkroom-accent)",
        backgroundColor: "transparent",
      }}
    >
      {children}
    </button>
  );
}
