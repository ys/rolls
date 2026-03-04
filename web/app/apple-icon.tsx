import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fde047 0%, #f59e0b 45%, #f97316 100%)",
          borderRadius: 38,
        }}
      >
        {/* Sun rays */}
        <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.6" stroke-linecap="round">
          <line x1="12" y1="2"    x2="12" y2="5"    />
          <line x1="12" y1="19"   x2="12" y2="22"   />
          <line x1="2"  y1="12"   x2="5"  y2="12"   />
          <line x1="19" y1="12"   x2="22" y2="12"   />
          <line x1="5.28"  y1="5.28"  x2="7.4"  y2="7.4"  />
          <line x1="16.6"  y1="16.6"  x2="18.72" y2="18.72" />
          <line x1="18.72" y1="5.28"  x2="16.6"  y2="7.4"  />
          <line x1="7.4"   y1="16.6"  x2="5.28"  y2="18.72" />
          {/* Film reel outer ring */}
          <circle cx="12" cy="12" r="4.5" stroke="white" stroke-width="1.5" fill="none" />
          {/* Film reel hub */}
          <circle cx="12" cy="12" r="1.5" fill="white" stroke="none" />
        </svg>
      </div>
    ),
    { width: 180, height: 180 }
  );
}
