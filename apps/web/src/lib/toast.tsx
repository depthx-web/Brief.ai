'use client';

import toast, { Toaster as HotToaster, type Toast } from 'react-hot-toast';
import { useLocale } from './i18n/LocaleContext';
import { CloseIcon } from './icons';

// Platform-wide notification system (Batch 3, Section 10). Built on
// react-hot-toast for the stacking/lifecycle machinery, but every pixel of
// the card itself is ours — kind, icon, leading-edge bar, and progress bar
// all follow the spec directly rather than the library's default look.

type ToastKind = 'success' | 'error' | 'loading';

const BAR_COLOR: Record<ToastKind, string> = {
  success: 'bg-emerald',
  error: 'bg-redline',
  loading: 'bg-navy-light',
};

function SuccessIcon() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-soft text-emerald">
      <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth={2.5}>
        <path d="M4 10.5 8 14l8-8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function ErrorIcon() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-50 text-redline">
      <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth={2.5}>
        <path d="M10 6v5" strokeLinecap="round" />
        <circle cx="10" cy="13.5" r="0.75" fill="currentColor" stroke="none" />
      </svg>
    </span>
  );
}

function Spinner() {
  return (
    <span
      className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-navy-light/25 border-t-navy-light"
      aria-hidden
    />
  );
}

interface CardProps {
  id: string;
  visible: boolean;
  kind: ToastKind;
  message: string;
  progress?: number;
  onRetry?: () => void;
}

function ToastCard({ id, visible, kind, message, progress, onRetry }: CardProps) {
  const { t } = useLocale();
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className={`relative flex w-[calc(100vw-2rem)] items-start gap-3 overflow-hidden rounded-[10px] bg-white py-3 ps-4 pe-3.5 shadow-level-2 sm:w-[340px] ${
        visible ? 'animate-toast-in' : 'animate-toast-out'
      }`}
    >
      <span className={`absolute inset-y-0 end-0 w-1 ${BAR_COLOR[kind]}`} aria-hidden />
      {kind === 'success' && <SuccessIcon />}
      {kind === 'error' && <ErrorIcon />}
      {kind === 'loading' && <Spinner />}
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm text-ink">{message}</p>
        {kind === 'loading' && typeof progress === 'number' && (
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-emerald transition-[width] duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
        {kind === 'error' && onRetry && (
          <button
            onClick={onRetry}
            className="mt-1.5 text-xs font-medium text-navy underline-offset-2 hover:underline"
          >
            {t('common.retry')}
          </button>
        )}
      </div>
      <button
        onClick={() => toast.dismiss(id)}
        aria-label={t('common.dismiss')}
        className="shrink-0 rounded p-0.5 text-ink-soft/50 transition-colors hover:bg-gray-100 hover:text-ink-soft"
      >
        <CloseIcon size={12} />
      </button>
    </div>
  );
}

export function Toaster() {
  // react-hot-toast's position prop is a physical corner, not a logical one
  // — flip it to the trailing edge under RTL so toasts still appear where
  // reading naturally starts, matching every other logical-direction fix.
  const { dir } = useLocale();
  return (
    <HotToaster
      position={dir === 'rtl' ? 'top-left' : 'top-right'}
      gutter={10}
      toastOptions={{ style: { background: 'transparent', boxShadow: 'none', padding: 0, margin: 0 } }}
    />
  );
}

// Errors used to stay up forever (duration: Infinity) with no way to
// dismiss one short of navigating away — on a narrow viewport especially,
// a stuck error could sit over real content indefinitely. ToastCard now
// always has a close button regardless of kind, and error/failure toasts
// additionally clear themselves after a generous but finite window so one
// left unread doesn't linger forever either. Loading stays Infinity on
// purpose — it represents a real in-progress operation, not a final state,
// so only the close button (not a timeout) should be able to hide it.
const ERROR_DURATION_MS = 10000;

export function showSuccess(message: string): string {
  return toast.custom((t: Toast) => <ToastCard id={t.id} visible={t.visible} kind="success" message={message} />, {
    duration: 4000,
  });
}

export function showError(message: string, opts?: { onRetry?: () => void }): string {
  return toast.custom(
    (t: Toast) => <ToastCard id={t.id} visible={t.visible} kind="error" message={message} onRetry={opts?.onRetry} />,
    { duration: ERROR_DURATION_MS }
  );
}

export function showLoading(message: string, progress?: number): string {
  return toast.custom((t: Toast) => <ToastCard id={t.id} visible={t.visible} kind="loading" message={message} progress={progress} />, {
    duration: Infinity,
  });
}

export function updateLoading(id: string, message: string, progress?: number): void {
  toast.custom((t: Toast) => <ToastCard id={t.id} visible={t.visible} kind="loading" message={message} progress={progress} />, {
    id,
    duration: Infinity,
  });
}

export function resolveLoading(id: string, message: string): void {
  toast.custom((t: Toast) => <ToastCard id={t.id} visible={t.visible} kind="success" message={message} />, {
    id,
    duration: 4000,
  });
}

export function failLoading(id: string, message: string, opts?: { onRetry?: () => void }): void {
  toast.custom(
    (t: Toast) => <ToastCard id={t.id} visible={t.visible} kind="error" message={message} onRetry={opts?.onRetry} />,
    { id, duration: ERROR_DURATION_MS }
  );
}

export function dismissToast(id: string): void {
  toast.dismiss(id);
}
