'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useLocale } from '@/lib/i18n/LocaleContext';
import { LOCALES, LOCALE_LABELS } from '@/lib/i18n/locales';

// Reused on both the dark marketing nav and light app/desktop chrome —
// `variant` swaps just the trigger's color scheme, not its layout.
export default function LanguageSwitcher({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label={t('language.choose')}
          className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
            variant === 'dark'
              ? 'text-[#C9D4E3] hover:bg-white/10 hover:text-white'
              : 'text-ink-soft hover:bg-gray-100 hover:text-ink'
          }`}
        >
          <span aria-hidden>🌐</span>
          <span className="uppercase">{locale}</span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 w-40 rounded-[10px] bg-white p-1.5 shadow-level-2"
        >
          {LOCALES.map((code) => (
            <DropdownMenu.Item
              key={code}
              onSelect={() => setLocale(code)}
              className={`flex cursor-pointer select-none items-center justify-between rounded-md px-2.5 py-2 text-[13px] outline-none transition-colors data-[highlighted]:bg-emerald-soft ${
                code === locale ? 'font-semibold text-emerald' : 'text-ink'
              }`}
            >
              {LOCALE_LABELS[code]}
              {code === locale && <span aria-hidden>✓</span>}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
