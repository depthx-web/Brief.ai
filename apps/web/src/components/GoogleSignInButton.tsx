const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// Follows Google's official "Sign in with Google" branding guidelines
// exactly (shape, colors, the multicolor G, spacing) — per the spec, this
// must NOT be recolored with Brief.ai's navy/emerald identity, since that
// would violate Google's brand policy. Integrated only through the layout
// around it, never its own styling.
export default function GoogleSignInButton({ label = 'Sign in with Google' }: { label?: string }) {
  return (
    <a
      href={`${API_URL}/auth/google`}
      className="flex w-full items-center justify-center gap-3 rounded border border-[#747775] bg-white px-4 py-2.5 text-sm font-medium text-[#1F1F1F] transition-colors hover:bg-[#F8F9FA] active:bg-[#F1F3F4]"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.87 2.69-6.62Z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.85.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18Z"
        />
        <path
          fill="#FBBC05"
          d="M3.96 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l3-2.33Z"
        />
        <path
          fill="#EA4335"
          d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58Z"
        />
      </svg>
      {label}
    </a>
  );
}
