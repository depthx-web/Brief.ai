'use client';

import { auditNda, type NdaCriterion } from '@/lib/aiApi';
import SingleDocAiTool from './SingleDocAiTool';

const STATUS_STYLE: Record<NdaCriterion['status'], string> = {
  ok: 'bg-emerald-soft text-emerald',
  concern: 'bg-amber-100 text-amber-700',
  missing: 'bg-red-50 text-redline',
};

const STATUS_LABEL: Record<NdaCriterion['status'], string> = {
  ok: 'OK',
  concern: 'Concern',
  missing: 'Missing',
};

export default function NdaAuditor() {
  return (
    <SingleDocAiTool
      title="Quick NDA Auditor"
      description="Checks the NDA against three standard criteria: confidentiality duration, exceptions, and scope of protection."
      runLabel="Audit NDA"
      onRun={(pages, token) => auditNda(pages, token)}
      renderResult={(audit) => (
        <ul className="space-y-3">
          {audit.criteria.map((c) => (
            <li key={c.name} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-ink">{c.name}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLE[c.status]}`}>
                  {STATUS_LABEL[c.status]}
                </span>
              </div>
              <p className="mt-2 text-sm text-ink-soft">{c.detail}</p>
            </li>
          ))}
        </ul>
      )}
    />
  );
}
