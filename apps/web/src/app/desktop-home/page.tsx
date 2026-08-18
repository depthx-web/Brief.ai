import { AuthProvider } from '@/lib/AuthContext';
import DesktopHome from '@/components/DesktopHome';

// Only ever reached one way: tauri.conf.json points the app window's
// initial URL directly at this page's static export (desktop-home.html) —
// no in-app link points here, and the web deploy never links to it either.
// Not a route group (no (app)/(tools) parens) so it doesn't inherit their
// layouts/guards, which assume the web nav shells this replaces for desktop.
export default function DesktopHomePage() {
  return (
    <AuthProvider>
      <DesktopHome />
    </AuthProvider>
  );
}
