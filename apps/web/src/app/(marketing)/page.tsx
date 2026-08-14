import Link from 'next/link';
import DocumentDemo from '@/components/DocumentDemo';

const WORKSPACES = [
  {
    eyebrow: 'Legal',
    title: 'For Lawyers & Firms',
    description:
      'Compare two versions of a contract, spot unusual clauses, and pull out obligations and dates automatically.',
    features: ['Contract comparison (redline)', 'Non-standard clause detection', 'Semantic search across your contract library'],
  },
  {
    eyebrow: 'Accounting',
    title: 'For Accountants & Small Business',
    description: 'Turn invoices and statements into clean, structured data ready to export in minutes.',
    features: ['High-accuracy data extraction', 'Automatic expense categorization', 'Ready export to QuickBooks/Xero'],
  },
  {
    eyebrow: 'Research',
    title: 'For Researchers & Grad Students',
    description: 'Chat with any research paper, summarize it your way, and pull a citation-ready reference list.',
    features: ['Chat with the paper', 'BibTeX / APA reference export', 'Searchable personal research library'],
  },
];

const TRUST_ITEMS = [
  {
    n: '01',
    title: 'Local processing by default',
    body: 'Simple operations run entirely inside your browser — no upload to any server.',
  },
  {
    n: '02',
    title: 'Strict auto-deletion',
    body: 'Anything that does need server-side processing is deleted permanently within one hour of completion.',
  },
  {
    n: '03',
    title: 'No training on your data',
    body: "Your document content is never used to train any AI model, ever.",
  },
];

export default function LandingPage() {
  return (
    <>
      <section className="relative grid gap-10 overflow-hidden bg-gradient-to-b from-navy via-[#142A4D] to-navy-light px-6 py-20 text-white sm:px-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
        <div className="relative z-[2]">
          <div className="mb-5 flex items-center gap-2.5 font-mono text-xs uppercase tracking-wider text-emerald before:h-px before:w-5 before:bg-emerald">
            AI-Powered PDF Platform
          </div>
          <h1 className="mb-5 max-w-xl font-serif text-4xl font-medium leading-tight sm:text-5xl">
            Your documents speak.
            <br />
            <em className="text-emerald not-italic italic">You just listen.</em>
          </h1>
          <p className="mb-8 max-w-md text-[17px] leading-relaxed text-[#C9D4E3]">
            Professional PDF tools built for three different worlds — contracts, invoices, and
            research papers. Brief.ai understands what each one means to an expert in that field.
          </p>
          <div className="flex flex-wrap items-center gap-3.5">
            <Link
              href="/signup"
              className="rounded-md bg-emerald px-7 py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(30,157,117,0.4)]"
            >
              Try Free Now
            </Link>
            <a
              href="#workspaces"
              className="rounded-md border border-white/30 px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:border-white hover:bg-white/[0.06]"
            >
              See How It Works
            </a>
          </div>
          <div className="mt-9 flex flex-wrap gap-5 text-[13px] text-[#8FA1BC]">
            <span>⬤ Auto-delete within an hour</span>
            <span>⬤ Local processing in your browser</span>
            <span>⬤ No training on your data</span>
          </div>
        </div>

        <DocumentDemo />
      </section>

      <section id="workspaces" className="mx-auto max-w-6xl px-6 py-24 sm:px-12">
        <div className="mb-14 max-w-xl">
          <div className="mb-3.5 font-mono text-xs uppercase tracking-wider text-emerald">
            Purpose-Built Workspaces
          </div>
          <h2 className="font-serif text-3xl font-medium leading-tight text-navy sm:text-4xl">
            One engine, three ways of working
          </h2>
          <p className="mt-3.5 text-base leading-relaxed text-ink-soft">
            Same underlying quality, wrapped in a completely different flow for each profession —
            reviewing a contract has nothing to do with reviewing an invoice or a research paper.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {WORKSPACES.map((ws) => (
            <div
              key={ws.eyebrow}
              className="rounded-xl border border-gray-200 bg-white p-7 transition-all hover:-translate-y-1 hover:border-emerald"
            >
              <span className="mb-3.5 block font-mono text-[11px] uppercase tracking-wide text-emerald">
                {ws.eyebrow}
              </span>
              <h3 className="mb-3 font-serif text-xl font-semibold text-navy">{ws.title}</h3>
              <p className="mb-4 text-sm leading-relaxed text-ink-soft">{ws.description}</p>
              <ul className="text-sm text-ink-soft">
                {ws.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 border-t border-gray-100 py-1.5">
                    <span className="text-[8px] text-emerald">●</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="trust" className="bg-navy px-6 py-16 text-white sm:px-12">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <h2 className="font-serif text-2xl font-medium sm:text-3xl">
            Privacy isn&apos;t a feature. It&apos;s the foundation.
          </h2>
          <div className="flex flex-col gap-6">
            {TRUST_ITEMS.map((item) => (
              <div key={item.n} className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald/15 font-mono text-[13px] text-emerald">
                  {item.n}
                </div>
                <div>
                  <h4 className="mb-1 text-[15.5px] font-semibold">{item.title}</h4>
                  <p className="text-sm leading-relaxed text-[#9FB0C6]">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-emerald-soft px-6 py-28 text-center sm:px-12">
        <h2 className="mx-auto mb-4 max-w-xl font-serif text-3xl font-medium text-navy">
          Start with one document, see the difference for yourself
        </h2>
        <p className="mx-auto mb-8 max-w-md text-base text-ink-soft">
          No credit card, no long signup — try the workspace built for your profession right now.
        </p>
        <Link
          href="/signup"
          className="rounded-md bg-emerald px-7 py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(30,157,117,0.4)]"
        >
          Try Brief.ai Free
        </Link>
      </section>
    </>
  );
}
