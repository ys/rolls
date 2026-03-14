export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "#7c2d12",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}
