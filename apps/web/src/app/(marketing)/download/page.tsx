import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Download — Brief.ai Desktop',
  description: 'Get the Brief.ai desktop app — local PDF tools that run entirely on your machine, no upload required.',
};

export default function DownloadPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-24 text-center sm:px-12">
      <div className="mb-3.5 font-mono text-xs uppercase tracking-wider text-emerald">Desktop App</div>
      <h1 className="mb-5 font-serif text-3xl font-medium leading-tight text-navy sm:text-4xl">
        Brief.ai for Windows is almost here
      </h1>
      <p className="mx-auto mb-8 max-w-md text-base leading-relaxed text-ink-soft">
        We&apos;re finishing up packaging and signing before making the installer public. In the
        meantime, every core tool — protect, unlock, compress, and convert — already works fully
        offline in your browser at{' '}
        <a href="/tools" className="text-emerald hover:underline">
          brief.ai/tools
        </a>
        .
      </p>
      <a
        href="mailto:support@brief.ai?subject=Notify%20me%20when%20the%20desktop%20app%20is%20ready"
        className="inline-block rounded-md bg-emerald px-7 py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(30,157,117,0.4)]"
      >
        Notify me when it&apos;s ready
      </a>
    </section>
  );
}
