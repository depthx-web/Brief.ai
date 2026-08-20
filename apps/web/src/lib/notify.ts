import { isTauri } from './platform';

let permissionChecked = false;
let permissionGranted = false;

async function ensurePermission(): Promise<boolean> {
  const { isPermissionGranted, requestPermission } = await import('@tauri-apps/plugin-notification');
  if (!permissionChecked) {
    permissionGranted = await isPermissionGranted();
    if (!permissionGranted) {
      permissionGranted = (await requestPermission()) === 'granted';
    }
    permissionChecked = true;
  }
  return permissionGranted;
}

// A native OS toast for a background job finishing while the app is in the
// background — the in-app Activity Ball already covers the case where the
// user is looking at the app, so this only fires when the window is
// unfocused (mirrors how Slack/VS Code scope their own OS notifications).
export async function notifyJobComplete(filename: string, ok: boolean, error?: string): Promise<void> {
  if (!isTauri()) return;
  if (typeof document !== 'undefined' && document.hasFocus()) return;
  try {
    const granted = await ensurePermission();
    if (!granted) return;
    const { sendNotification } = await import('@tauri-apps/plugin-notification');
    sendNotification({
      title: ok ? 'Done' : 'Failed',
      body: ok ? `${filename} is ready.` : `${filename}: ${error ?? 'Operation failed.'}`,
    });
  } catch {
    // Notifications are a nice-to-have — a permission/plugin failure here
    // must never break the file operation that triggered it.
  }
}
