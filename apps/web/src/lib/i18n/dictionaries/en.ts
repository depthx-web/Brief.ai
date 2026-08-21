// Base dictionary — the source of truth for keys. Every other locale file
// must cover the same key set; missing keys fall back to this one at runtime.
const en = {
  // Marketing nav
  'nav.workspaces': 'Workspaces',
  'nav.privacy': 'Privacy',
  'nav.pricing': 'Pricing',
  'nav.desktopApp': 'Desktop App',
  'nav.goToDashboard': 'Go to Dashboard',
  'nav.logIn': 'Log in',
  'nav.signUp': 'Sign up',

  // Workspace sidebar (app + desktop)
  'sidebar.home': 'Home',
  'sidebar.dashboard': 'Dashboard',
  'sidebar.tools': 'Tools',
  'sidebar.convert': 'Convert',
  'sidebar.organize': 'Organize',
  'sidebar.protect': 'Protect',
  'sidebar.aiTools': 'AI Tools',
  'sidebar.library': 'Library',
  'sidebar.myLibrary': 'My Library',
  'sidebar.recent': 'Recent',
  'sidebar.wallet': 'Wallet',
  'sidebar.myWallet': 'My Wallet',
  'sidebar.referrals': 'Referral Program',
  'sidebar.settings': 'Settings',
  'sidebar.logout': 'Log out',
  'sidebar.browsingAsGuest': 'Browsing as a guest',
  'sidebar.logInArrow': 'Log in →',

  // Common actions
  'common.save': 'Save',
  'common.saveChanges': 'Save Changes',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.continue': 'Continue',
  'common.close': 'Close',
  'common.loading': 'Loading…',
  'common.download': 'Download',
  'common.rename': 'Rename',
  'common.duplicate': 'Duplicate',
  'common.confirm': 'Confirm',

  // Change plan modal
  'changePlan.title': 'Change your plan',
  'changePlan.subtitle': 'Billing cycle for your current workspace.',
  'changePlan.billingCycle': 'Billing cycle',
  'changePlan.updating': 'Updating…',
  'changePlan.updated': 'Plan updated',
  'changePlan.save10': 'Save 10%',
  'changePlan.save20': 'Save 20%',

  // Auth forms
  'auth.email': 'Email address',
  'auth.password': 'Password',
  'auth.confirmPassword': 'Confirm password',
  'auth.name': 'Name',
  'auth.logInTitle': 'Log in',
  'auth.signUpTitle': 'Create your account',
  'auth.consentPrefix': 'I agree to the',
  'auth.privacyPolicy': 'Privacy Policy',
  'auth.and': 'and',
  'auth.termsOfService': 'Terms of Service',
  'auth.continueWithGoogle': 'Continue with Google',

  // Settings
  'settings.title': 'Settings',
  'settings.profile': 'Profile',
  'settings.subscription': 'Subscription',
  'settings.billingDetails': 'Billing details',
  'settings.privacy': 'Privacy',
  'settings.team': 'Team',
  'settings.language': 'Language',

  // Language switcher
  'language.choose': 'Choose language',

  // Desktop sidebar
  'desktop.workspace': 'Workspace',
  'desktop.files': 'Files',
  'desktop.account': 'Account',
  'desktop.online': 'Online',
  'desktop.offline': 'Offline',
  'desktop.reconnecting': 'Reconnecting',
  'desktop.onlineBody': 'Core tools always run on this device. AI features are connected.',
  'desktop.offlineBody': 'Core tools still work offline. AI features need a connection.',
  'desktop.reconnectingBody': 'Reconnecting to AI features… core tools are unaffected.',
  'desktop.noWorkspace': 'No workspace',
  'desktop.pro': 'Pro',
  'desktop.free': 'Free',
  'desktop.logInForAiTools': 'Log in for AI tools →',
  'segment.legal': 'Legal',
  'segment.accounting': 'Accounting',
  'segment.research': 'Research',
} as const;

export default en;
export type DictionaryKey = keyof typeof en;
