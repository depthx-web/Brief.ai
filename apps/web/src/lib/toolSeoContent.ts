export interface ToolFaqItem {
  q: string;
  a: string;
}

export interface ToolSeoContent {
  features: string[];
  faq: ToolFaqItem[];
}

// Fallback content per tool page (route slug -> content), read by
// ToolSeoSections.tsx below the tool's own upload UI. This is the default
// an admin's CMS edit (Page slug `tools-<slug>`, sections `features`/`faq`)
// overrides — see AdminCms.tsx's `features`/`faq` section editors.
export const TOOL_SEO_CONTENT: Record<string, ToolSeoContent> = {
  'pdf-to-images': {
    features: [
      'Exports every page as a separate JPG or PNG',
      'Keeps full page resolution for printing or sharing',
      'Runs entirely in your browser — no upload needed',
    ],
    faq: [
      { q: 'What image formats can I export to?', a: 'JPG and PNG, one image per page.' },
      { q: 'Is there a page limit?', a: 'No — every page in the PDF is exported.' },
      { q: 'Does this upload my file anywhere?', a: 'No, the conversion runs locally in your browser.' },
    ],
  },
  'images-to-pdf': {
    features: [
      'Combines any number of JPG or PNG images into one PDF',
      'Preserves each image at its original quality',
      'Runs entirely in your browser — no upload needed',
    ],
    faq: [
      { q: 'Can I reorder the images before combining?', a: 'Yes — drag images into the order you want before converting.' },
      { q: 'Does it work with mixed JPG and PNG files?', a: 'Yes, you can combine both formats in one PDF.' },
      { q: 'Is my image data uploaded anywhere?', a: 'No, everything is processed locally in your browser.' },
    ],
  },
  'word-to-pdf': {
    features: [
      'Converts .docx Word documents to PDF',
      'Preserves formatting, fonts, and page layout',
      'Processed on our servers and auto-deleted after use',
    ],
    faq: [
      { q: 'Will my formatting stay intact?', a: 'Yes — fonts, spacing, and layout are preserved in the output PDF.' },
      { q: 'What happens to my file after conversion?', a: 'It is automatically and permanently deleted per your retention setting.' },
      { q: 'Does this need a paid plan?', a: 'Office-to-PDF conversion is a server-side operation and may require a plan — see Pricing.' },
    ],
  },
  'pdf-to-word': {
    features: [
      'Converts a PDF into an editable .docx Word document',
      'Recovers paragraphs and basic formatting, not just raw text',
      'Processed on our servers and auto-deleted after use',
    ],
    faq: [
      { q: 'Will the output be fully editable?', a: 'Yes — text, paragraphs, and basic formatting convert into an editable Word document.' },
      { q: 'Does this work on scanned PDFs?', a: 'Best results are on text-based PDFs; for scans, run OCR first.' },
      { q: 'Is my file stored after conversion?', a: 'No, it is auto-deleted per your retention setting.' },
    ],
  },
  'excel-to-pdf': {
    features: [
      'Converts .xlsx spreadsheets to PDF',
      'Preserves columns, rows, and cell formatting',
      'Processed on our servers and auto-deleted after use',
    ],
    faq: [
      { q: 'Do multiple sheets convert too?', a: 'Yes, every sheet in the workbook is included.' },
      { q: 'Will large spreadsheets fit on the page?', a: 'Wide sheets scale to fit the printable page width.' },
      { q: 'Is billing required?', a: 'This is a server-side operation and may require a plan — see Pricing.' },
    ],
  },
  'pdf-to-excel': {
    features: [
      'Converts a PDF into an editable .xlsx spreadsheet',
      'Attempts to recover tabular data into real cells',
      'Processed on our servers and auto-deleted after use',
    ],
    faq: [
      { q: 'Does this work well on any PDF?', a: 'Best results are on PDFs with clear table structure.' },
      { q: 'Will formulas be recreated?', a: 'No — values convert as static data, not live formulas.' },
      { q: 'Is my file kept afterward?', a: 'No, it is auto-deleted per your retention setting.' },
    ],
  },
  'powerpoint-to-pdf': {
    features: [
      'Converts .pptx presentations to PDF',
      'Preserves slide layout, images, and text',
      'Processed on our servers and auto-deleted after use',
    ],
    faq: [
      { q: 'Are speaker notes included?', a: 'No, only the visible slide content converts.' },
      { q: 'Will animations or transitions carry over?', a: 'No — PDF is a static format, so each slide becomes one page.' },
      { q: 'Is billing required?', a: 'This is a server-side operation and may require a plan — see Pricing.' },
    ],
  },
  'pdf-to-powerpoint': {
    features: [
      'Converts a PDF into an editable .pptx presentation',
      'One slide is created per PDF page',
      'Processed on our servers and auto-deleted after use',
    ],
    faq: [
      { q: 'Will text be editable in the output?', a: 'Yes, text boxes are recreated as editable PowerPoint elements.' },
      { q: 'Does formatting match the original PDF exactly?', a: 'Layout is approximated — complex designs may need minor adjustment.' },
      { q: 'Is my file kept afterward?', a: 'No, it is auto-deleted per your retention setting.' },
    ],
  },
  'pdf-to-text': {
    features: [
      'Extracts every page’s text into a single .txt file',
      'Keeps reading order intact',
      'Runs entirely in your browser — no upload needed',
    ],
    faq: [
      { q: 'Does this work on scanned PDFs?', a: 'Only on text-based PDFs; scans need OCR first for extractable text.' },
      { q: 'Is formatting like bold or tables preserved?', a: 'No — output is plain text with no formatting.' },
      { q: 'Is my file uploaded anywhere?', a: 'No, extraction runs locally in your browser.' },
    ],
  },
  'pdf-to-html': {
    features: [
      'Converts a PDF into a single styled HTML page',
      'Keeps text selectable and readable in a browser',
      'Processed on our servers and auto-deleted after use',
    ],
    faq: [
      { q: 'Will images be included?', a: 'Yes, embedded images convert along with the text.' },
      { q: 'Can I edit the HTML afterward?', a: 'Yes, the output is plain HTML you can edit in any editor.' },
      { q: 'Is billing required?', a: 'This is a server-side operation and may require a plan — see Pricing.' },
    ],
  },
  merge: {
    features: [
      'Combines multiple PDFs into a single file',
      'Drag to reorder files before merging',
      'Runs entirely in your browser — no upload needed',
    ],
    faq: [
      { q: 'Is there a limit on how many files I can merge?', a: 'No practical limit — merge as many PDFs as you need.' },
      { q: 'Can I change the order of the files?', a: 'Yes, drag files into the order you want before merging.' },
      { q: 'Does this upload my files anywhere?', a: 'No, merging happens locally in your browser.' },
    ],
  },
  split: {
    features: [
      'Extracts a page range or every page individually',
      'Preview pages before choosing what to extract',
      'Runs entirely in your browser — no upload needed',
    ],
    faq: [
      { q: 'Can I extract non-consecutive pages?', a: 'Yes, specify any combination of pages or ranges.' },
      { q: 'What do I get back — one file or several?', a: 'You choose: one combined file, or a separate file per page.' },
      { q: 'Is my file uploaded anywhere?', a: 'No, splitting runs locally in your browser.' },
    ],
  },
  organize: {
    features: [
      'Drag to reorder pages within a PDF',
      'Delete unwanted pages in the same view',
      'Runs entirely in your browser — no upload needed',
    ],
    faq: [
      { q: 'Can I both reorder and delete pages at once?', a: 'Yes, both actions happen in the same workspace.' },
      { q: 'Will page numbers update automatically?', a: 'The PDF reflects your new order; existing page-number stamps are not recalculated.' },
      { q: 'Is my file uploaded anywhere?', a: 'No, organizing runs locally in your browser.' },
    ],
  },
  rotate: {
    features: [
      'Rotates every page in a PDF, or just the ones you pick',
      'Preview each page’s orientation before saving',
      'Runs entirely in your browser — no upload needed',
    ],
    faq: [
      { q: 'Can I rotate just one page instead of all of them?', a: 'Yes, rotation can be applied per page.' },
      { q: 'What rotation angles are supported?', a: '90, 180, and 270 degrees.' },
      { q: 'Is my file uploaded anywhere?', a: 'No, rotation runs locally in your browser.' },
    ],
  },
  'page-numbers': {
    features: [
      'Stamps page numbers onto every page',
      'Choose position, starting number, and format',
      'Runs entirely in your browser — no upload needed',
    ],
    faq: [
      { q: 'Can I start numbering from a page other than 1?', a: 'Yes, set any starting number.' },
      { q: 'Where can the numbers be placed?', a: 'Any corner or center position, top or bottom.' },
      { q: 'Is my file uploaded anywhere?', a: 'No, this runs locally in your browser.' },
    ],
  },
  compress: {
    features: [
      'Shrinks file size for scanned or image-heavy PDFs',
      'Keeps the document readable at a smaller size',
      'Runs entirely in your browser — no upload needed',
    ],
    faq: [
      { q: 'How much smaller will my file get?', a: 'It depends on content — image-heavy scans compress the most.' },
      { q: 'Will text quality suffer?', a: 'Text-based PDFs are largely unaffected; this mainly targets embedded images.' },
      { q: 'Is my file uploaded anywhere?', a: 'No, compression runs locally in your browser.' },
    ],
  },
  'compress-high-ratio': {
    features: [
      'Server-side high-ratio compression for the toughest files',
      'Keeps text sharp and selectable, unlike basic compression',
      'Processed on our servers and auto-deleted after use',
    ],
    faq: [
      { q: 'How is this different from the free Compress tool?', a: 'It uses a stronger server-side engine for deeper size reduction while keeping text selectable.' },
      { q: 'Does this need a paid plan?', a: 'Yes, this is a server-side operation — see Pricing.' },
      { q: 'Is my file kept afterward?', a: 'No, it is auto-deleted per your retention setting.' },
    ],
  },
  ocr: {
    features: [
      'Makes a scanned PDF searchable and selectable',
      'Recognizes text across the whole document',
      'Runs entirely in your browser — no upload needed',
    ],
    faq: [
      { q: 'Will this work on a photo of a document?', a: 'Yes, as long as the text is reasonably legible.' },
      { q: 'What languages are supported?', a: 'OCR works best on English text; other languages may have lower accuracy.' },
      { q: 'Is my file uploaded anywhere?', a: 'No, OCR runs locally in your browser.' },
    ],
  },
  sign: {
    features: [
      'Draw or upload a signature and place it on a page',
      'Save a signature for reuse next time',
      'Runs entirely in your browser — no upload needed',
    ],
    faq: [
      { q: 'Is this a legally binding e-signature?', a: 'This adds a visual signature to the document; it is not a certified e-signature service.' },
      { q: 'Can I resize or reposition my signature?', a: 'Yes, drag and resize it before saving.' },
      { q: 'Is my file uploaded anywhere?', a: 'No, signing runs locally in your browser.' },
    ],
  },
  protect: {
    features: [
      'Adds a password so only people who know it can open the file',
      'Choose separate owner and user passwords',
      'Processed on our servers and auto-deleted after use',
    ],
    faq: [
      { q: 'What encryption is used?', a: '256-bit AES encryption via the industry-standard qpdf engine.' },
      { q: 'Can I set a different password for editing vs. opening?', a: 'Yes, owner and user passwords can be set independently.' },
      { q: 'Does this need a paid plan?', a: 'Yes, this is a server-side operation — see Pricing.' },
    ],
  },
  'remove-password': {
    features: [
      'Removes password protection given the current password',
      'Restores full, unrestricted access to the file',
      'Processed on our servers and auto-deleted after use',
    ],
    faq: [
      { q: 'Do I need to know the current password?', a: 'Yes, this only removes protection from a file you can already open.' },
      { q: 'Can this crack a password I’ve forgotten?', a: 'No, it only removes protection when the current password is provided.' },
      { q: 'Does this need a paid plan?', a: 'Yes, this is a server-side operation — see Pricing.' },
    ],
  },
  watermark: {
    features: [
      'Stamps text across every page',
      'Control opacity, angle, and position',
      'Runs entirely in your browser — no upload needed',
    ],
    faq: [
      { q: 'Can I use my own text?', a: 'Yes, type any text — a name, "Confidential", a date, etc.' },
      { q: 'Will the watermark cover important content?', a: 'You control opacity and placement so it stays legible underneath.' },
      { q: 'Is my file uploaded anywhere?', a: 'No, watermarking runs locally in your browser.' },
    ],
  },
  'batch-invoices': {
    features: [
      'Extracts data from many invoices at once',
      'Exports results to CSV for your accounting software',
      'AI-powered — requires an account and a plan',
    ],
    faq: [
      { q: 'How many invoices can I process at once?', a: 'Upload as many as you need in one batch.' },
      { q: 'What fields are extracted?', a: 'Vendor, amount, date, and invoice number, among other common fields.' },
      { q: 'Is this tool free?', a: 'AI extraction requires an account with an active plan or credits.' },
    ],
  },
  'contract-compare': {
    features: [
      'Compares two versions of a contract side by side',
      'AI flags what changed and its risk level',
      'AI-powered — requires an account and a plan',
    ],
    faq: [
      { q: 'How does this differ from a plain text diff?', a: 'AI explains what each change means and flags risk, not just what text moved.' },
      { q: 'Do both versions need to be PDFs?', a: 'Yes, upload both contract versions as PDF.' },
      { q: 'Is this tool free?', a: 'AI comparison requires an account with an active plan or credits.' },
    ],
  },
  'high-risk-clauses': {
    features: [
      'Flags unfair, incomplete, or non-standard clauses',
      'Explains why each flagged clause is risky',
      'AI-powered — requires an account and a plan',
    ],
    faq: [
      { q: 'Does this replace a lawyer’s review?', a: 'No, it flags clauses worth a closer look, not a substitute for legal advice.' },
      { q: 'What kinds of contracts work best?', a: 'Any standard business contract — NDAs, service agreements, leases, and similar.' },
      { q: 'Is this tool free?', a: 'AI analysis requires an account with an active plan or credits.' },
    ],
  },
  'plain-summary': {
    features: [
      'Turns a contract into a summary a non-legal reader can understand',
      'Highlights key obligations and dates in plain language',
      'AI-powered — requires an account and a plan',
    ],
    faq: [
      { q: 'Who is this summary written for?', a: 'A client or colleague without a legal background.' },
      { q: 'Does it cover every clause?', a: 'It focuses on the most important terms, not a clause-by-clause breakdown.' },
      { q: 'Is this tool free?', a: 'AI summarization requires an account with an active plan or credits.' },
    ],
  },
  'nda-audit': {
    features: [
      'Checks an NDA against confidentiality duration, exceptions, and scope',
      'Flags terms that are unusually broad or missing',
      'AI-powered — requires an account and a plan',
    ],
    faq: [
      { q: 'What does the audit actually check?', a: 'Duration, exceptions, scope of confidential information, and other standard NDA terms.' },
      { q: 'Does this work for mutual and one-way NDAs?', a: 'Yes, both are supported.' },
      { q: 'Is this tool free?', a: 'AI analysis requires an account with an active plan or credits.' },
    ],
  },
  'redaction-detector': {
    features: [
      'Detects ID numbers and bank account numbers worth redacting',
      'Flags sensitive data before you share a document',
      'AI-powered — requires an account and a plan',
    ],
    faq: [
      { q: 'Does this redact the document automatically?', a: 'It flags what to redact — you review and apply redactions yourself.' },
      { q: 'What kinds of sensitive data are detected?', a: 'ID numbers, bank account numbers, and similar identifiers.' },
      { q: 'Is this tool free?', a: 'AI detection requires an account with an active plan or credits.' },
    ],
  },
  'duplicate-payments': {
    features: [
      'Flags the same vendor, amount, and date appearing more than once',
      'Catches accidental double-payments before they go out',
      'AI-powered — requires an account and a plan',
    ],
    faq: [
      { q: 'What counts as a duplicate?', a: 'Matching vendor, amount, and date within the documents you upload.' },
      { q: 'Can I upload multiple invoices at once?', a: 'Yes, upload a batch and duplicates are flagged across all of them.' },
      { q: 'Is this tool free?', a: 'AI detection requires an account with an active plan or credits.' },
    ],
  },
  'financial-ratios': {
    features: [
      'Extracts liquidity and profitability ratios from financial statements',
      'Explains each ratio in plain language',
      'AI-powered — requires an account and a plan',
    ],
    faq: [
      { q: 'What ratios are calculated?', a: 'Common liquidity and profitability ratios such as current ratio and profit margin.' },
      { q: 'What kind of document do I need?', a: 'A financial statement in PDF form — balance sheet or income statement.' },
      { q: 'Is this tool free?', a: 'AI analysis requires an account with an active plan or credits.' },
    ],
  },
  'bank-reconciliation': {
    features: [
      'Compares a bank statement against recorded invoices',
      'Flags discrepancies automatically',
      'AI-powered — requires an account and a plan',
    ],
    faq: [
      { q: 'What documents do I need?', a: 'A bank statement and the invoices or records you want to reconcile against it.' },
      { q: 'What counts as a discrepancy?', a: 'Amounts or transactions in one document with no clear match in the other.' },
      { q: 'Is this tool free?', a: 'AI reconciliation requires an account with an active plan or credits.' },
    ],
  },
  'tax-deductible': {
    features: [
      'Highlights likely tax-deductible line items by category',
      'Works from receipts, invoices, or statements',
      'AI-powered — requires an account and a plan',
    ],
    faq: [
      { q: 'Is this a substitute for a tax professional?', a: 'No, it flags likely deductible items for you to confirm, not tax advice.' },
      { q: 'What categories does it recognize?', a: 'Common business expense categories such as travel, supplies, and software.' },
      { q: 'Is this tool free?', a: 'AI analysis requires an account with an active plan or credits.' },
    ],
  },
  'multi-paper-compare': {
    features: [
      'Compares methodology and results across two papers',
      'AI explains what differs and why it matters',
      'AI-powered — requires an account and a plan',
    ],
    faq: [
      { q: 'Do both papers need to be on the same topic?', a: 'It works best when the papers address related research questions.' },
      { q: 'Does it compare more than two papers at once?', a: 'Currently, it compares two papers per run.' },
      { q: 'Is this tool free?', a: 'AI comparison requires an account with an active plan or credits.' },
    ],
  },
  'methodology-extractor': {
    features: [
      'Summarizes methodology into a structured sample/tools/analysis table',
      'Makes it easy to compare methods across papers',
      'AI-powered — requires an account and a plan',
    ],
    faq: [
      { q: 'What does the output look like?', a: 'A structured table covering sample, tools, and analysis approach.' },
      { q: 'Does this work for qualitative research too?', a: 'Yes, both quantitative and qualitative methodology sections are supported.' },
      { q: 'Is this tool free?', a: 'AI extraction requires an account with an active plan or credits.' },
    ],
  },
  'presentation-outline': {
    features: [
      'Turns a paper into slide-ready talking points',
      'Organized in a logical presentation flow',
      'AI-powered — requires an account and a plan',
    ],
    faq: [
      { q: 'Does this generate actual slides?', a: 'It generates the talking points and structure — you build the slides.' },
      { q: 'How long is the resulting outline?', a: 'It scales to the paper’s length, covering its key points.' },
      { q: 'Is this tool free?', a: 'AI generation requires an account with an active plan or credits.' },
    ],
  },
};
