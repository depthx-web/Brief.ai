'use client';

import { useRef, useState } from 'react';
import { convertPdfToOffice, downloadBlob, type OfficeFamily } from '@/lib/convertApi';
import { usePendingToolFile } from '@/lib/usePendingToolFile';
import { useLocale } from '@/lib/i18n/LocaleContext';

const FAMILY_LABEL: Record<OfficeFamily, string> = { word: 'Word', excel: 'Excel', powerpoint: 'PowerPoint' };
const FAMILY_EXTENSION: Record<OfficeFamily, string> = { word: '.docx', excel: '.xlsx', powerpoint: '.pptx' };

interface Props {
  family: OfficeFamily;
}

export default function PdfToOfficeTool({ family }: Props) {
  const { t } = useLocale();
  const label = FAMILY_LABEL[family];
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  usePendingToolFile(handleFileSelect);

  function handleFileSelect(selected: File) {
    setError(null);
    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setError(t('dashboard.selectPdfError'));
      return;
    }
    setFile(selected);
  }

  async function handleConvert() {
    if (!file) return;
    setError(null);
    setIsProcessing(true);
    try {
      const { blob, filename } = await convertPdfToOffice(file, family);
      downloadBlob(blob, filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('toolPage.pdfToHtml.couldNotConvert'));
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-2xl font-semibold text-navy">{t('toolPage.pdfToOffice.title').replace('{label}', label)}</h1>
      <p className="mt-2 text-gray-600">{t('toolPage.pdfToOffice.description').replace('{label}', label).replace('{ext}', FAMILY_EXTENSION[family])}</p>
      <p className="mt-1 text-xs text-gray-400">
        {t('toolPage.pdfToOffice.serverNote')}
      </p>

      <div
        onClick={() => inputRef.current?.click()}
        className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-12 text-center"
      >
        <p className="text-gray-600">{file ? file.name : t('aiTool.clickToChoosePdf')}</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        />
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        onClick={handleConvert}
        disabled={!file || isProcessing}
        className="mt-6 w-full rounded-lg bg-emerald px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isProcessing ? t('toolPage.converting') : t('toolPage.pdfToImages.convertAndDownload')}
      </button>
    </div>
  );
}
