// Shared icon set for the desktop shell + a couple of web components that
// previously each defined their own byte-identical copy (DesktopSidebar,
// DesktopHome, RecentFiles, ActivityBall, PricingPage) — consolidated here
// so an edit to one propagates everywhere instead of silently drifting.

const strokeIconProps = (color: string) => ({
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: color,
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

// Called as a plain function — {ConvertIcon(color)} — not JSX, matching
// the (color: string) => ReactNode contract DesktopSidebar's NavRow uses
// for every nav icon in its table.
export function ConvertIcon(color: string) {
  return (
    <svg {...strokeIconProps(color)}>
      <path d="M7 7h10M7 7l3-3M7 7l3 3" />
      <path d="M17 17H7M17 17l-3-3M17 17l-3 3" />
    </svg>
  );
}

export function ProtectIcon(color: string) {
  return (
    <svg {...strokeIconProps(color)}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
    </svg>
  );
}

export function AiIcon(color: string) {
  return (
    <svg {...strokeIconProps(color)}>
      <path d="M12 3l1.8 5.5L19 10l-5.2 1.5L12 17l-1.8-5.5L5 10l5.2-1.5L12 3z" />
    </svg>
  );
}

export function FileIcon({ size = 18 }: { size?: number } = {}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#4B5768" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M6 3h9l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

export function CloseIcon({ size = 14 }: { size?: number } = {}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export function DashboardIcon(color: string) {
  return (
    <svg {...strokeIconProps(color)}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}

export function LibraryIcon(color: string) {
  return (
    <svg {...strokeIconProps(color)}>
      <path d="M4 6a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" />
    </svg>
  );
}

export function WalletIcon(color: string) {
  return (
    <svg {...strokeIconProps(color)}>
      <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
      <path d="M16 12h3v3h-3a1.5 1.5 0 0 1 0-3z" />
    </svg>
  );
}

export function ReferralIcon(color: string) {
  return (
    <svg {...strokeIconProps(color)}>
      <circle cx="7" cy="7" r="3" />
      <circle cx="17" cy="17" r="3" />
      <path d="M9.5 9.5l5 5" />
    </svg>
  );
}

export function ToolsGroupIcon(color: string) {
  return (
    <svg {...strokeIconProps(color)}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <path d="M13 17.5l2 2 4.5-4.5" />
      <path d="M4 17.5l2 2 4.5-4.5" />
    </svg>
  );
}

export function SettingsIcon(color: string) {
  return (
    <svg {...strokeIconProps(color)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function CheckIcon({
  size = 14,
  color = 'currentColor',
  className,
}: { size?: number; color?: string; className?: string } = {}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
