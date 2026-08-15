import LegalLayout, { type LegalSection } from '@/components/LegalLayout';

const sections: LegalSection[] = [
  {
    id: 'acceptance',
    title: 'Acceptance of terms',
    body: (
      <p>
        By creating an account or using any tool on Brief.ai, you agree to these terms. If you do
        not agree, please don't use the service.
      </p>
    ),
  },
  {
    id: 'the-service',
    title: 'Description of service',
    body: (
      <p>
        Brief.ai provides PDF tools and AI-powered document analysis for legal, accounting, and
        research workflows. Some tools run entirely in your browser; others require uploading a
        file to our servers for processing, as described in our{' '}
        <a href="/privacy" className="text-emerald hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    ),
  },
  {
    id: 'plans',
    title: 'Free and paid plans',
    body: (
      <p>
        The free plan covers browser-only tools with no account required. AI features, OCR, and
        server-side conversion are part of a paid workspace plan, billed on a weekly, monthly,
        quarterly, or yearly cycle through our payment processor. Prices and included features are
        shown on the Pricing page and may change with notice.
      </p>
    ),
  },
  {
    id: 'account-responsibilities',
    title: 'Account responsibilities',
    body: (
      <p>
        You're responsible for keeping your password confidential and for all activity under your
        account. Notify us right away if you believe your account has been accessed without
        authorization.
      </p>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable use',
    body: (
      <p>
        You agree not to upload content you don't have the right to process, use the service to
        break the law, or attempt to disrupt, reverse-engineer, or gain unauthorized access to any
        part of Brief.ai.
      </p>
    ),
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual property',
    body: (
      <p>
        You retain full ownership of every document you upload and every file our tools generate
        for you. Brief.ai and its branding are our property; using the service doesn't grant you
        rights to either.
      </p>
    ),
  },
  {
    id: 'termination',
    title: 'Termination',
    body: (
      <p>
        You can delete your account at any time from Settings. We may suspend or terminate an
        account that violates these terms, misuses the service, or goes unpaid on a paid plan.
      </p>
    ),
  },
  {
    id: 'disclaimers',
    title: 'Disclaimers & limitation of liability',
    body: (
      <p>
        Brief.ai is provided "as is." AI-generated analysis is a starting point, not professional
        legal, accounting, or research advice — always verify results before relying on them. To the
        extent permitted by law, Brief.ai isn't liable for indirect or consequential damages arising
        from use of the service.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    body: (
      <p>
        We may update these terms as the product evolves. Material changes will be reflected in the
        date at the top of this page.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <p>
        Questions about these terms can be sent to{' '}
        <a href="mailto:support@brief.ai" className="text-emerald hover:underline">
          support@brief.ai
        </a>
        .
      </p>
    ),
  },
];

export default function TermsPage() {
  return <LegalLayout title="Terms of Service" lastUpdated="August 15, 2026" sections={sections} />;
}
