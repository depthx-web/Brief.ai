const TOOL_GROUPS = [
  {
    title: 'Organize',
    tools: [
      { href: '/merge', name: 'Merge', description: 'Combine multiple PDFs into one file.' },
      { href: '/split', name: 'Split', description: 'Extract page ranges or every page individually.' },
      { href: '/organize', name: 'Organize', description: 'Reorder or delete pages within a PDF.' },
      { href: '/rotate', name: 'Rotate', description: 'Rotate every page in a PDF.' },
      { href: '/page-numbers', name: 'Page Numbers', description: 'Stamp page numbers onto every page.' },
    ],
  },
  {
    title: 'Convert',
    tools: [
      { href: '/pdf-to-images', name: 'PDF to Images', description: 'Export every page as a JPG or PNG.' },
      { href: '/images-to-pdf', name: 'Images to PDF', description: 'Combine JPG or PNG images into a PDF.' },
      { href: '/office-to-pdf', name: 'Office to PDF', description: 'Convert Word, Excel, or PowerPoint to PDF.' },
      { href: '/pdf-to-office', name: 'PDF to Office', description: 'Convert PDF to editable Word, Excel, or PowerPoint.' },
    ],
  },
  {
    title: 'Optimize',
    tools: [
      { href: '/compress', name: 'Compress', description: 'Shrink file size for scanned or image-heavy PDFs.' },
      { href: '/ocr', name: 'OCR', description: 'Make a scanned PDF searchable and selectable.' },
    ],
  },
  {
    title: 'Sign & Protect',
    tools: [
      { href: '/sign', name: 'Sign', description: 'Draw or upload a signature and place it on a page.' },
      { href: '/protect', name: 'Protect', description: 'Add a password so only people who know it can open the file.' },
      { href: '/remove-password', name: 'Remove Password', description: 'Remove password protection given the current password.' },
    ],
  },
  {
    title: 'Accounting',
    tools: [
      {
        href: '/batch-invoices',
        name: 'Batch Invoice Export',
        description: 'Extract data from many invoices at once and export to CSV.',
      },
    ],
  },
];

export default function ToolsIndex() {
  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <h1 className="font-serif text-2xl font-medium text-navy">Tools</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Single-purpose utilities that don&apos;t need the full document workspace.
      </p>
      <div className="mt-8 space-y-10">
        {TOOL_GROUPS.map((group) => (
          <div key={group.title}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">
              {group.title}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {group.tools.map((tool) => (
                <a
                  key={tool.href}
                  href={tool.href}
                  className="rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-emerald"
                >
                  <h3 className="font-medium text-navy">{tool.name}</h3>
                  <p className="mt-1 text-sm text-ink-soft">{tool.description}</p>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
