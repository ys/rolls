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
        className="w-full text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white py-2 transition-colors disabled:opacity-40"
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
      className="w-full border border-zinc-900 dark:border-white text-zinc-900 dark:text-white py-3 text-xs tracking-widest uppercase font-medium hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}
