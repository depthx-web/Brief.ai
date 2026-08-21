import type { Locale } from './i18n/locales';

export interface ToolFaqItem {
  q: string;
  a: string;
}

export interface ToolSeoContent {
  features: string[];
  faq: ToolFaqItem[];
  // Non-English content for a handful of the highest-traffic tools; a tool
  // with no entry for the requested locale (or none at all) falls back to
  // the English features/faq above — most of the 35 tool pages are only
  // covered in English today.
  translations?: Partial<Record<Exclude<Locale, 'en'>, { features: string[]; faq: ToolFaqItem[] }>>;
}

// Locale-aware accessor — use this from components instead of indexing
// TOOL_SEO_CONTENT directly, so the translation fallback stays in one place.
export function getToolSeoContent(slug: string, locale: Locale): ToolSeoContent | undefined {
  const entry = TOOL_SEO_CONTENT[slug];
  if (!entry) return undefined;
  if (locale === 'en') return entry;
  const translated = entry.translations?.[locale];
  return translated ? { features: translated.features, faq: translated.faq } : entry;
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
    translations: {
      de: {
        features: [
          'Konvertiert .docx-Word-Dokumente in PDF',
          'Erhält Formatierung, Schriftarten und Seitenlayout',
          'Wird auf unseren Servern verarbeitet und nach Gebrauch automatisch gelöscht',
        ],
        faq: [
          { q: 'Bleibt meine Formatierung erhalten?', a: 'Ja — Schriftarten, Abstände und Layout bleiben im ausgegebenen PDF erhalten.' },
          { q: 'Was passiert mit meiner Datei nach der Konvertierung?', a: 'Sie wird automatisch und dauerhaft gemäß Ihrer Aufbewahrungseinstellung gelöscht.' },
          { q: 'Ist dafür ein bezahlter Plan nötig?', a: 'Office-zu-PDF-Konvertierung ist ein serverseitiger Vorgang und erfordert möglicherweise einen Plan — siehe Preise.' },
        ],
      },
      fr: {
        features: [
          'Convertit les documents Word .docx en PDF',
          'Préserve la mise en forme, les polices et la mise en page',
          'Traité sur nos serveurs et supprimé automatiquement après utilisation',
        ],
        faq: [
          { q: 'Ma mise en forme restera-t-elle intacte ?', a: 'Oui — les polices, l’espacement et la mise en page sont préservés dans le PDF final.' },
          { q: 'Qu’advient-il de mon fichier après la conversion ?', a: 'Il est supprimé automatiquement et définitivement selon votre paramètre de conservation.' },
          { q: 'Cela nécessite-t-il un forfait payant ?', a: 'La conversion Office vers PDF est une opération côté serveur et peut nécessiter un forfait — voir Tarifs.' },
        ],
      },
      es: {
        features: [
          'Convierte documentos Word .docx a PDF',
          'Conserva el formato, las fuentes y el diseño de página',
          'Procesado en nuestros servidores y eliminado automáticamente tras su uso',
        ],
        faq: [
          { q: '¿Se mantendrá intacto mi formato?', a: 'Sí — las fuentes, el espaciado y el diseño se conservan en el PDF resultante.' },
          { q: '¿Qué sucede con mi archivo tras la conversión?', a: 'Se elimina automática y permanentemente según tu configuración de retención.' },
          { q: '¿Necesito un plan de pago para esto?', a: 'La conversión de Office a PDF es una operación del lado del servidor y puede requerir un plan — consulta Precios.' },
        ],
      },
      it: {
        features: [
          'Converte documenti Word .docx in PDF',
          'Preserva formattazione, font e layout della pagina',
          'Elaborato sui nostri server ed eliminato automaticamente dopo l’uso',
        ],
        faq: [
          { q: 'La mia formattazione rimarrà intatta?', a: 'Sì — font, spaziatura e layout vengono preservati nel PDF finale.' },
          { q: 'Cosa succede al mio file dopo la conversione?', a: 'Viene eliminato automaticamente e definitivamente in base alla tua impostazione di conservazione.' },
          { q: 'Serve un piano a pagamento?', a: 'La conversione da Office a PDF è un’operazione lato server e potrebbe richiedere un piano — vedi Prezzi.' },
        ],
      },
      ar: {
        features: [
          'يحوّل مستندات Word بصيغة .docx إلى PDF',
          'يحافظ على التنسيق والخطوط وتخطيط الصفحة',
          'تتم المعالجة على خوادمنا ويُحذف تلقائيًا بعد الاستخدام',
        ],
        faq: [
          { q: 'هل سيبقى تنسيقي سليمًا؟', a: 'نعم — يتم الحفاظ على الخطوط والمسافات والتخطيط في ملف PDF الناتج.' },
          { q: 'ماذا يحدث لملفي بعد التحويل؟', a: 'يُحذف تلقائيًا ونهائيًا وفقًا لإعداد الاحتفاظ الخاص بك.' },
          { q: 'هل يتطلب هذا خطة مدفوعة؟', a: 'تحويل Office إلى PDF عملية تتم على الخادم وقد تتطلب خطة — راجع صفحة الأسعار.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Konvertiert ein PDF in ein bearbeitbares .docx-Word-Dokument',
          'Stellt Absätze und grundlegende Formatierung wieder her, nicht nur reinen Text',
          'Wird auf unseren Servern verarbeitet und nach Gebrauch automatisch gelöscht',
        ],
        faq: [
          { q: 'Ist das Ergebnis vollständig bearbeitbar?', a: 'Ja — Text, Absätze und grundlegende Formatierung werden in ein bearbeitbares Word-Dokument umgewandelt.' },
          { q: 'Funktioniert das bei gescannten PDFs?', a: 'Die besten Ergebnisse erzielen textbasierte PDFs; führen Sie bei Scans zuerst eine OCR durch.' },
          { q: 'Wird meine Datei nach der Konvertierung gespeichert?', a: 'Nein, sie wird gemäß Ihrer Aufbewahrungseinstellung automatisch gelöscht.' },
        ],
      },
      fr: {
        features: [
          'Convertit un PDF en document Word .docx modifiable',
          'Récupère les paragraphes et la mise en forme de base, pas seulement le texte brut',
          'Traité sur nos serveurs et supprimé automatiquement après utilisation',
        ],
        faq: [
          { q: 'Le résultat sera-t-il entièrement modifiable ?', a: 'Oui — le texte, les paragraphes et la mise en forme de base sont convertis en document Word modifiable.' },
          { q: 'Cela fonctionne-t-il sur des PDF scannés ?', a: 'Les meilleurs résultats sont obtenus sur des PDF textuels ; pour les scans, exécutez d’abord l’OCR.' },
          { q: 'Mon fichier est-il stocké après conversion ?', a: 'Non, il est supprimé automatiquement selon votre paramètre de conservation.' },
        ],
      },
      es: {
        features: [
          'Convierte un PDF en un documento Word .docx editable',
          'Recupera párrafos y formato básico, no solo texto sin formato',
          'Procesado en nuestros servidores y eliminado automáticamente tras su uso',
        ],
        faq: [
          { q: '¿El resultado será totalmente editable?', a: 'Sí — el texto, los párrafos y el formato básico se convierten en un documento Word editable.' },
          { q: '¿Funciona con PDF escaneados?', a: 'Los mejores resultados se obtienen con PDF de texto; para escaneos, ejecuta primero el OCR.' },
          { q: '¿Se almacena mi archivo tras la conversión?', a: 'No, se elimina automáticamente según tu configuración de retención.' },
        ],
      },
      it: {
        features: [
          'Converte un PDF in un documento Word .docx modificabile',
          'Recupera paragrafi e formattazione di base, non solo testo grezzo',
          'Elaborato sui nostri server ed eliminato automaticamente dopo l’uso',
        ],
        faq: [
          { q: 'Il risultato sarà completamente modificabile?', a: 'Sì — testo, paragrafi e formattazione di base vengono convertiti in un documento Word modificabile.' },
          { q: 'Funziona con i PDF scansionati?', a: 'I risultati migliori si ottengono con PDF testuali; per le scansioni, esegui prima l’OCR.' },
          { q: 'Il mio file viene conservato dopo la conversione?', a: 'No, viene eliminato automaticamente in base alla tua impostazione di conservazione.' },
        ],
      },
      ar: {
        features: [
          'يحوّل ملف PDF إلى مستند Word بصيغة .docx قابل للتحرير',
          'يستعيد الفقرات والتنسيق الأساسي، وليس مجرد نص خام',
          'تتم المعالجة على خوادمنا ويُحذف تلقائيًا بعد الاستخدام',
        ],
        faq: [
          { q: 'هل ستكون النتيجة قابلة للتحرير بالكامل؟', a: 'نعم — يتم تحويل النص والفقرات والتنسيق الأساسي إلى مستند Word قابل للتحرير.' },
          { q: 'هل يعمل هذا مع ملفات PDF الممسوحة ضوئيًا؟', a: 'أفضل النتائج تكون مع ملفات PDF النصية؛ بالنسبة للمسح الضوئي، شغّل التعرف الضوئي أولاً.' },
          { q: 'هل يُخزَّن ملفي بعد التحويل؟', a: 'لا، يُحذف تلقائيًا وفقًا لإعداد الاحتفاظ الخاص بك.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Fasst mehrere PDFs zu einer einzigen Datei zusammen',
          'Reihenfolge der Dateien vor dem Zusammenführen per Drag & Drop ändern',
          'Läuft vollständig in Ihrem Browser — kein Upload nötig',
        ],
        faq: [
          { q: 'Gibt es ein Limit für die Anzahl der Dateien?', a: 'Kein praktisches Limit — führen Sie so viele PDFs zusammen, wie Sie benötigen.' },
          { q: 'Kann ich die Reihenfolge der Dateien ändern?', a: 'Ja, ziehen Sie die Dateien vor dem Zusammenführen in die gewünschte Reihenfolge.' },
          { q: 'Werden meine Dateien irgendwohin hochgeladen?', a: 'Nein, das Zusammenführen erfolgt lokal in Ihrem Browser.' },
        ],
      },
      fr: {
        features: [
          'Combine plusieurs PDF en un seul fichier',
          'Glissez pour réorganiser les fichiers avant la fusion',
          'Fonctionne entièrement dans votre navigateur — aucun envoi nécessaire',
        ],
        faq: [
          { q: 'Y a-t-il une limite au nombre de fichiers ?', a: 'Aucune limite pratique — fusionnez autant de PDF que nécessaire.' },
          { q: 'Puis-je changer l’ordre des fichiers ?', a: 'Oui, faites glisser les fichiers dans l’ordre souhaité avant la fusion.' },
          { q: 'Mes fichiers sont-ils envoyés quelque part ?', a: 'Non, la fusion s’effectue localement dans votre navigateur.' },
        ],
      },
      es: {
        features: [
          'Combina varios PDF en un solo archivo',
          'Arrastra para reordenar los archivos antes de combinar',
          'Se ejecuta totalmente en tu navegador — no requiere subir nada',
        ],
        faq: [
          { q: '¿Hay un límite de archivos que puedo combinar?', a: 'Sin límite práctico — combina tantos PDF como necesites.' },
          { q: '¿Puedo cambiar el orden de los archivos?', a: 'Sí, arrastra los archivos al orden que quieras antes de combinar.' },
          { q: '¿Esto sube mis archivos a algún lugar?', a: 'No, la combinación ocurre localmente en tu navegador.' },
        ],
      },
      it: {
        features: [
          'Unisce più PDF in un unico file',
          'Trascina per riordinare i file prima di unirli',
          'Funziona interamente nel tuo browser — nessun caricamento necessario',
        ],
        faq: [
          { q: 'C’è un limite al numero di file da unire?', a: 'Nessun limite pratico — unisci tutti i PDF di cui hai bisogno.' },
          { q: 'Posso cambiare l’ordine dei file?', a: 'Sì, trascina i file nell’ordine desiderato prima di unirli.' },
          { q: 'Questo carica i miei file da qualche parte?', a: 'No, l’unione avviene localmente nel tuo browser.' },
        ],
      },
      ar: {
        features: [
          'يدمج عدة ملفات PDF في ملف واحد',
          'اسحب لإعادة ترتيب الملفات قبل الدمج',
          'يعمل بالكامل داخل متصفحك — لا حاجة للرفع',
        ],
        faq: [
          { q: 'هل هناك حد لعدد الملفات التي يمكنني دمجها؟', a: 'لا يوجد حد عملي — ادمج أي عدد من ملفات PDF تحتاجه.' },
          { q: 'هل يمكنني تغيير ترتيب الملفات؟', a: 'نعم، اسحب الملفات إلى الترتيب الذي تريده قبل الدمج.' },
          { q: 'هل يتم رفع ملفاتي إلى أي مكان؟', a: 'لا، يتم الدمج محليًا داخل متصفحك.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Extrahiert einen Seitenbereich oder jede Seite einzeln',
          'Seiten in der Vorschau ansehen, bevor Sie auswählen',
          'Läuft vollständig in Ihrem Browser — kein Upload nötig',
        ],
        faq: [
          { q: 'Kann ich nicht zusammenhängende Seiten extrahieren?', a: 'Ja, geben Sie beliebige Kombinationen von Seiten oder Bereichen an.' },
          { q: 'Erhalte ich eine oder mehrere Dateien zurück?', a: 'Sie wählen: eine zusammengeführte Datei oder eine separate Datei pro Seite.' },
          { q: 'Wird meine Datei irgendwohin hochgeladen?', a: 'Nein, das Teilen erfolgt lokal in Ihrem Browser.' },
        ],
      },
      fr: {
        features: [
          'Extrait une plage de pages ou chaque page individuellement',
          'Prévisualisez les pages avant de choisir quoi extraire',
          'Fonctionne entièrement dans votre navigateur — aucun envoi nécessaire',
        ],
        faq: [
          { q: 'Puis-je extraire des pages non consécutives ?', a: 'Oui, indiquez toute combinaison de pages ou de plages.' },
          { q: 'Est-ce que j’obtiens un ou plusieurs fichiers ?', a: 'Vous choisissez : un fichier combiné, ou un fichier séparé par page.' },
          { q: 'Mon fichier est-il envoyé quelque part ?', a: 'Non, la division s’effectue localement dans votre navigateur.' },
        ],
      },
      es: {
        features: [
          'Extrae un rango de páginas o cada página individualmente',
          'Previsualiza las páginas antes de elegir qué extraer',
          'Se ejecuta totalmente en tu navegador — no requiere subir nada',
        ],
        faq: [
          { q: '¿Puedo extraer páginas no consecutivas?', a: 'Sí, indica cualquier combinación de páginas o rangos.' },
          { q: '¿Obtengo uno o varios archivos?', a: 'Tú eliges: un archivo combinado o un archivo separado por página.' },
          { q: '¿Se sube mi archivo a algún lugar?', a: 'No, la división ocurre localmente en tu navegador.' },
        ],
      },
      it: {
        features: [
          'Estrae un intervallo di pagine o ogni pagina singolarmente',
          'Visualizza l’anteprima delle pagine prima di scegliere cosa estrarre',
          'Funziona interamente nel tuo browser — nessun caricamento necessario',
        ],
        faq: [
          { q: 'Posso estrarre pagine non consecutive?', a: 'Sì, specifica qualsiasi combinazione di pagine o intervalli.' },
          { q: 'Ottengo uno o più file?', a: 'Scegli tu: un file combinato, oppure un file separato per pagina.' },
          { q: 'Il mio file viene caricato da qualche parte?', a: 'No, la divisione avviene localmente nel tuo browser.' },
        ],
      },
      ar: {
        features: [
          'يستخرج نطاق صفحات أو كل صفحة على حدة',
          'معاينة الصفحات قبل اختيار ما تريد استخراجه',
          'يعمل بالكامل داخل متصفحك — لا حاجة للرفع',
        ],
        faq: [
          { q: 'هل يمكنني استخراج صفحات غير متتالية؟', a: 'نعم، حدد أي مجموعة من الصفحات أو النطاقات.' },
          { q: 'هل أحصل على ملف واحد أم عدة ملفات؟', a: 'أنت تختار: ملف واحد مدمج، أو ملف منفصل لكل صفحة.' },
          { q: 'هل يتم رفع ملفي إلى أي مكان؟', a: 'لا، يتم التقسيم محليًا داخل متصفحك.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Verkleinert die Dateigröße gescannter oder bildlastiger PDFs',
          'Hält das Dokument bei kleinerer Größe lesbar',
          'Läuft vollständig in Ihrem Browser — kein Upload nötig',
        ],
        faq: [
          { q: 'Wie viel kleiner wird meine Datei?', a: 'Das hängt vom Inhalt ab — bildlastige Scans komprimieren am stärksten.' },
          { q: 'Leidet die Textqualität darunter?', a: 'Textbasierte PDFs sind kaum betroffen; dies zielt hauptsächlich auf eingebettete Bilder ab.' },
          { q: 'Wird meine Datei irgendwohin hochgeladen?', a: 'Nein, die Komprimierung erfolgt lokal in Ihrem Browser.' },
        ],
      },
      fr: {
        features: [
          'Réduit la taille des PDF scannés ou riches en images',
          'Garde le document lisible à une taille réduite',
          'Fonctionne entièrement dans votre navigateur — aucun envoi nécessaire',
        ],
        faq: [
          { q: 'De combien mon fichier sera-t-il réduit ?', a: 'Cela dépend du contenu — les scans riches en images se compressent le plus.' },
          { q: 'La qualité du texte va-t-elle en souffrir ?', a: 'Les PDF textuels sont peu affectés ; cela cible surtout les images intégrées.' },
          { q: 'Mon fichier est-il envoyé quelque part ?', a: 'Non, la compression s’effectue localement dans votre navigateur.' },
        ],
      },
      es: {
        features: [
          'Reduce el tamaño de PDF escaneados o con muchas imágenes',
          'Mantiene el documento legible con un tamaño menor',
          'Se ejecuta totalmente en tu navegador — no requiere subir nada',
        ],
        faq: [
          { q: '¿Cuánto se reducirá mi archivo?', a: 'Depende del contenido — los escaneos con muchas imágenes se comprimen más.' },
          { q: '¿Se verá afectada la calidad del texto?', a: 'Los PDF de texto apenas se ven afectados; esto se centra en las imágenes incrustadas.' },
          { q: '¿Se sube mi archivo a algún lugar?', a: 'No, la compresión ocurre localmente en tu navegador.' },
        ],
      },
      it: {
        features: [
          'Riduce le dimensioni di PDF scansionati o ricchi di immagini',
          'Mantiene il documento leggibile con dimensioni ridotte',
          'Funziona interamente nel tuo browser — nessun caricamento necessario',
        ],
        faq: [
          { q: 'Di quanto si ridurrà il mio file?', a: 'Dipende dal contenuto — le scansioni ricche di immagini si comprimono di più.' },
          { q: 'La qualità del testo ne risentirà?', a: 'I PDF testuali sono poco interessati; questo riguarda principalmente le immagini incorporate.' },
          { q: 'Il mio file viene caricato da qualche parte?', a: 'No, la compressione avviene localmente nel tuo browser.' },
        ],
      },
      ar: {
        features: [
          'يقلل حجم الملفات الممسوحة ضوئيًا أو الغنية بالصور',
          'يحافظ على وضوح المستند بحجم أصغر',
          'يعمل بالكامل داخل متصفحك — لا حاجة للرفع',
        ],
        faq: [
          { q: 'إلى أي مدى سيصغر حجم ملفي؟', a: 'يعتمد على المحتوى — المستندات الممسوحة الغنية بالصور تنضغط أكثر.' },
          { q: 'هل ستتأثر جودة النص؟', a: 'ملفات PDF النصية تتأثر قليلًا جدًا؛ هذا يستهدف بشكل أساسي الصور المضمنة.' },
          { q: 'هل يتم رفع ملفي إلى أي مكان؟', a: 'لا، يتم الضغط محليًا داخل متصفحك.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Macht ein gescanntes PDF durchsuchbar und markierbar',
          'Erkennt Text im gesamten Dokument',
          'Läuft vollständig in Ihrem Browser — kein Upload nötig',
        ],
        faq: [
          { q: 'Funktioniert das auch bei einem Foto eines Dokuments?', a: 'Ja, solange der Text einigermaßen lesbar ist.' },
          { q: 'Welche Sprachen werden unterstützt?', a: 'OCR funktioniert am besten mit englischem Text; andere Sprachen können ungenauer sein.' },
          { q: 'Wird meine Datei irgendwohin hochgeladen?', a: 'Nein, OCR läuft lokal in Ihrem Browser.' },
        ],
      },
      fr: {
        features: [
          'Rend un PDF scanné consultable et sélectionnable',
          'Reconnaît le texte dans tout le document',
          'Fonctionne entièrement dans votre navigateur — aucun envoi nécessaire',
        ],
        faq: [
          { q: 'Cela fonctionne-t-il sur une photo d’un document ?', a: 'Oui, tant que le texte est raisonnablement lisible.' },
          { q: 'Quelles langues sont prises en charge ?', a: 'L’OCR fonctionne mieux sur le texte anglais ; les autres langues peuvent être moins précises.' },
          { q: 'Mon fichier est-il envoyé quelque part ?', a: 'Non, l’OCR s’exécute localement dans votre navigateur.' },
        ],
      },
      es: {
        features: [
          'Hace que un PDF escaneado sea buscable y seleccionable',
          'Reconoce el texto en todo el documento',
          'Se ejecuta totalmente en tu navegador — no requiere subir nada',
        ],
        faq: [
          { q: '¿Funciona con una foto de un documento?', a: 'Sí, siempre que el texto sea razonablemente legible.' },
          { q: '¿Qué idiomas son compatibles?', a: 'El OCR funciona mejor con texto en inglés; otros idiomas pueden tener menor precisión.' },
          { q: '¿Se sube mi archivo a algún lugar?', a: 'No, el OCR se ejecuta localmente en tu navegador.' },
        ],
      },
      it: {
        features: [
          'Rende un PDF scansionato ricercabile e selezionabile',
          'Riconosce il testo in tutto il documento',
          'Funziona interamente nel tuo browser — nessun caricamento necessario',
        ],
        faq: [
          { q: 'Funziona con la foto di un documento?', a: 'Sì, purché il testo sia ragionevolmente leggibile.' },
          { q: 'Quali lingue sono supportate?', a: 'L’OCR funziona meglio con il testo in inglese; altre lingue potrebbero avere una precisione inferiore.' },
          { q: 'Il mio file viene caricato da qualche parte?', a: 'No, l’OCR viene eseguito localmente nel tuo browser.' },
        ],
      },
      ar: {
        features: [
          'يجعل ملف PDF الممسوح ضوئيًا قابلاً للبحث والتحديد',
          'يتعرف على النص في المستند بأكمله',
          'يعمل بالكامل داخل متصفحك — لا حاجة للرفع',
        ],
        faq: [
          { q: 'هل يعمل هذا مع صورة لمستند؟', a: 'نعم، طالما أن النص واضح بشكل معقول.' },
          { q: 'ما اللغات المدعومة؟', a: 'يعمل التعرف الضوئي بشكل أفضل مع النص الإنجليزي؛ قد تكون اللغات الأخرى أقل دقة.' },
          { q: 'هل يتم رفع ملفي إلى أي مكان؟', a: 'لا، يعمل التعرف الضوئي محليًا داخل متصفحك.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Signatur zeichnen oder hochladen und auf einer Seite platzieren',
          'Signatur zur Wiederverwendung speichern',
          'Läuft vollständig in Ihrem Browser — kein Upload nötig',
        ],
        faq: [
          { q: 'Ist dies eine rechtsverbindliche elektronische Signatur?', a: 'Dies fügt dem Dokument eine visuelle Unterschrift hinzu; es ist kein zertifizierter E-Signatur-Dienst.' },
          { q: 'Kann ich meine Signatur in Größe und Position ändern?', a: 'Ja, ziehen und skalieren Sie sie vor dem Speichern.' },
          { q: 'Wird meine Datei irgendwohin hochgeladen?', a: 'Nein, das Signieren erfolgt lokal in Ihrem Browser.' },
        ],
      },
      fr: {
        features: [
          'Dessinez ou téléversez une signature et placez-la sur une page',
          'Enregistrez une signature pour la réutiliser plus tard',
          'Fonctionne entièrement dans votre navigateur — aucun envoi nécessaire',
        ],
        faq: [
          { q: 'S’agit-il d’une signature électronique juridiquement contraignante ?', a: 'Cela ajoute une signature visuelle au document ; ce n’est pas un service de signature électronique certifié.' },
          { q: 'Puis-je redimensionner ou repositionner ma signature ?', a: 'Oui, faites-la glisser et redimensionnez-la avant d’enregistrer.' },
          { q: 'Mon fichier est-il envoyé quelque part ?', a: 'Non, la signature s’effectue localement dans votre navigateur.' },
        ],
      },
      es: {
        features: [
          'Dibuja o sube una firma y colócala en una página',
          'Guarda una firma para reutilizarla más tarde',
          'Se ejecuta totalmente en tu navegador — no requiere subir nada',
        ],
        faq: [
          { q: '¿Es esta una firma electrónica legalmente vinculante?', a: 'Esto añade una firma visual al documento; no es un servicio de firma electrónica certificado.' },
          { q: '¿Puedo redimensionar o reposicionar mi firma?', a: 'Sí, arrástrala y ajusta su tamaño antes de guardar.' },
          { q: '¿Se sube mi archivo a algún lugar?', a: 'No, la firma se realiza localmente en tu navegador.' },
        ],
      },
      it: {
        features: [
          'Disegna o carica una firma e posizionala su una pagina',
          'Salva una firma per riutilizzarla in seguito',
          'Funziona interamente nel tuo browser — nessun caricamento necessario',
        ],
        faq: [
          { q: 'È una firma elettronica legalmente vincolante?', a: 'Questo aggiunge una firma visiva al documento; non è un servizio di firma elettronica certificato.' },
          { q: 'Posso ridimensionare o riposizionare la mia firma?', a: 'Sì, trascinala e ridimensionala prima di salvare.' },
          { q: 'Il mio file viene caricato da qualche parte?', a: 'No, la firma avviene localmente nel tuo browser.' },
        ],
      },
      ar: {
        features: [
          'ارسم أو حمّل توقيعًا وضعه على صفحة',
          'احفظ التوقيع لإعادة استخدامه لاحقًا',
          'يعمل بالكامل داخل متصفحك — لا حاجة للرفع',
        ],
        faq: [
          { q: 'هل هذا توقيع إلكتروني ملزم قانونيًا؟', a: 'هذا يضيف توقيعًا مرئيًا إلى المستند؛ وليس خدمة توقيع إلكتروني معتمدة.' },
          { q: 'هل يمكنني تغيير حجم أو موضع توقيعي؟', a: 'نعم، اسحبه وغيّر حجمه قبل الحفظ.' },
          { q: 'هل يتم رفع ملفي إلى أي مكان؟', a: 'لا، يتم التوقيع محليًا داخل متصفحك.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Fügt ein Passwort hinzu, sodass nur Berechtigte die Datei öffnen können',
          'Separate Eigentümer- und Benutzerpasswörter wählen',
          'Wird auf unseren Servern verarbeitet und nach Gebrauch automatisch gelöscht',
        ],
        faq: [
          { q: 'Welche Verschlüsselung wird verwendet?', a: '256-Bit-AES-Verschlüsselung über die branchenübliche qpdf-Engine.' },
          { q: 'Kann ich unterschiedliche Passwörter für Bearbeiten und Öffnen festlegen?', a: 'Ja, Eigentümer- und Benutzerpasswörter können unabhängig voneinander festgelegt werden.' },
          { q: 'Ist dafür ein bezahlter Plan nötig?', a: 'Ja, dies ist ein serverseitiger Vorgang — siehe Preise.' },
        ],
      },
      fr: {
        features: [
          'Ajoute un mot de passe pour que seules les personnes qui le connaissent puissent ouvrir le fichier',
          'Choisissez des mots de passe propriétaire et utilisateur distincts',
          'Traité sur nos serveurs et supprimé automatiquement après utilisation',
        ],
        faq: [
          { q: 'Quel chiffrement est utilisé ?', a: 'Chiffrement AES 256 bits via le moteur qpdf, standard du secteur.' },
          { q: 'Puis-je définir un mot de passe différent pour modifier et ouvrir ?', a: 'Oui, les mots de passe propriétaire et utilisateur peuvent être définis indépendamment.' },
          { q: 'Cela nécessite-t-il un forfait payant ?', a: 'Oui, il s’agit d’une opération côté serveur — voir Tarifs.' },
        ],
      },
      es: {
        features: [
          'Añade una contraseña para que solo quienes la conocen puedan abrir el archivo',
          'Elige contraseñas de propietario y de usuario independientes',
          'Procesado en nuestros servidores y eliminado automáticamente tras su uso',
        ],
        faq: [
          { q: '¿Qué cifrado se utiliza?', a: 'Cifrado AES de 256 bits mediante el motor qpdf, estándar del sector.' },
          { q: '¿Puedo establecer una contraseña distinta para editar y para abrir?', a: 'Sí, las contraseñas de propietario y de usuario pueden establecerse de forma independiente.' },
          { q: '¿Necesito un plan de pago para esto?', a: 'Sí, es una operación del lado del servidor — consulta Precios.' },
        ],
      },
      it: {
        features: [
          'Aggiunge una password in modo che solo chi la conosce possa aprire il file',
          'Scegli password separate per proprietario e utente',
          'Elaborato sui nostri server ed eliminato automaticamente dopo l’uso',
        ],
        faq: [
          { q: 'Quale crittografia viene utilizzata?', a: 'Crittografia AES a 256 bit tramite il motore qpdf, standard del settore.' },
          { q: 'Posso impostare una password diversa per modificare e aprire?', a: 'Sì, le password di proprietario e utente possono essere impostate indipendentemente.' },
          { q: 'Serve un piano a pagamento?', a: 'Sì, questa è un’operazione lato server — vedi Prezzi.' },
        ],
      },
      ar: {
        features: [
          'يضيف كلمة مرور بحيث يمكن فقط لمن يعرفها فتح الملف',
          'اختر كلمتي مرور منفصلتين للمالك والمستخدم',
          'تتم المعالجة على خوادمنا ويُحذف تلقائيًا بعد الاستخدام',
        ],
        faq: [
          { q: 'ما نوع التشفير المستخدم؟', a: 'تشفير AES بمقاس 256 بت عبر محرك qpdf المعياري في الصناعة.' },
          { q: 'هل يمكنني تعيين كلمة مرور مختلفة للتعديل مقابل الفتح؟', a: 'نعم، يمكن تعيين كلمتي مرور المالك والمستخدم بشكل مستقل.' },
          { q: 'هل يتطلب هذا خطة مدفوعة؟', a: 'نعم، هذه عملية تتم على الخادم — راجع صفحة الأسعار.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Entfernt den Passwortschutz bei Angabe des aktuellen Passworts',
          'Stellt vollen, uneingeschränkten Zugriff auf die Datei wieder her',
          'Wird auf unseren Servern verarbeitet und nach Gebrauch automatisch gelöscht',
        ],
        faq: [
          { q: 'Muss ich das aktuelle Passwort kennen?', a: 'Ja, dies entfernt den Schutz nur bei einer Datei, die Sie bereits öffnen können.' },
          { q: 'Kann dies ein vergessenes Passwort knacken?', a: 'Nein, der Schutz wird nur entfernt, wenn das aktuelle Passwort angegeben wird.' },
          { q: 'Ist dafür ein bezahlter Plan nötig?', a: 'Ja, dies ist ein serverseitiger Vorgang — siehe Preise.' },
        ],
      },
      fr: {
        features: [
          'Supprime la protection par mot de passe si le mot de passe actuel est fourni',
          'Restaure un accès complet et illimité au fichier',
          'Traité sur nos serveurs et supprimé automatiquement après utilisation',
        ],
        faq: [
          { q: 'Dois-je connaître le mot de passe actuel ?', a: 'Oui, cela ne supprime la protection que d’un fichier que vous pouvez déjà ouvrir.' },
          { q: 'Cela peut-il déchiffrer un mot de passe oublié ?', a: 'Non, la protection n’est supprimée que si le mot de passe actuel est fourni.' },
          { q: 'Cela nécessite-t-il un forfait payant ?', a: 'Oui, il s’agit d’une opération côté serveur — voir Tarifs.' },
        ],
      },
      es: {
        features: [
          'Elimina la protección con contraseña si se indica la contraseña actual',
          'Restaura el acceso completo y sin restricciones al archivo',
          'Procesado en nuestros servidores y eliminado automáticamente tras su uso',
        ],
        faq: [
          { q: '¿Necesito conocer la contraseña actual?', a: 'Sí, esto solo elimina la protección de un archivo que ya puedes abrir.' },
          { q: '¿Puede esto descifrar una contraseña que olvidé?', a: 'No, solo elimina la protección cuando se proporciona la contraseña actual.' },
          { q: '¿Necesito un plan de pago para esto?', a: 'Sí, es una operación del lado del servidor — consulta Precios.' },
        ],
      },
      it: {
        features: [
          'Rimuove la protezione tramite password fornendo la password attuale',
          'Ripristina l’accesso completo e senza restrizioni al file',
          'Elaborato sui nostri server ed eliminato automaticamente dopo l’uso',
        ],
        faq: [
          { q: 'Devo conoscere la password attuale?', a: 'Sì, questo rimuove la protezione solo da un file che puoi già aprire.' },
          { q: 'Questo può craccare una password dimenticata?', a: 'No, rimuove la protezione solo se viene fornita la password attuale.' },
          { q: 'Serve un piano a pagamento?', a: 'Sì, questa è un’operazione lato server — vedi Prezzi.' },
        ],
      },
      ar: {
        features: [
          'يزيل حماية كلمة المرور عند إدخال كلمة المرور الحالية',
          'يستعيد الوصول الكامل وغير المقيد إلى الملف',
          'تتم المعالجة على خوادمنا ويُحذف تلقائيًا بعد الاستخدام',
        ],
        faq: [
          { q: 'هل أحتاج لمعرفة كلمة المرور الحالية؟', a: 'نعم، هذا يزيل الحماية فقط من ملف يمكنك فتحه بالفعل.' },
          { q: 'هل يمكن لهذا كسر كلمة مرور نسيتها؟', a: 'لا، يزيل الحماية فقط عند تقديم كلمة المرور الحالية.' },
          { q: 'هل يتطلب هذا خطة مدفوعة؟', a: 'نعم، هذه عملية تتم على الخادم — راجع صفحة الأسعار.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Vergleicht zwei Vertragsversionen nebeneinander',
          'KI markiert Änderungen und deren Risikostufe',
          'KI-gestützt — erfordert ein Konto und einen Plan',
        ],
        faq: [
          { q: 'Wie unterscheidet sich das von einem einfachen Textvergleich?', a: 'Die KI erklärt, was jede Änderung bedeutet, und markiert das Risiko — nicht nur, welcher Text sich verschoben hat.' },
          { q: 'Müssen beide Versionen PDFs sein?', a: 'Ja, laden Sie beide Vertragsversionen als PDF hoch.' },
          { q: 'Ist dieses Werkzeug kostenlos?', a: 'Der KI-Vergleich erfordert ein Konto mit aktivem Plan oder Guthaben.' },
        ],
      },
      fr: {
        features: [
          'Compare deux versions d’un contrat côte à côte',
          'L’IA signale ce qui a changé et son niveau de risque',
          'Propulsé par l’IA — nécessite un compte et un forfait',
        ],
        faq: [
          { q: 'En quoi cela diffère-t-il d’une simple comparaison de texte ?', a: 'L’IA explique ce que signifie chaque changement et signale le risque, pas seulement le texte déplacé.' },
          { q: 'Les deux versions doivent-elles être des PDF ?', a: 'Oui, téléversez les deux versions du contrat au format PDF.' },
          { q: 'Cet outil est-il gratuit ?', a: 'La comparaison par IA nécessite un compte avec un forfait actif ou des crédits.' },
        ],
      },
      es: {
        features: [
          'Compara dos versiones de un contrato una junto a la otra',
          'La IA señala qué cambió y su nivel de riesgo',
          'Con IA — requiere una cuenta y un plan',
        ],
        faq: [
          { q: '¿En qué se diferencia de una simple comparación de texto?', a: 'La IA explica qué significa cada cambio y señala el riesgo, no solo qué texto se movió.' },
          { q: '¿Ambas versiones deben ser PDF?', a: 'Sí, sube ambas versiones del contrato en formato PDF.' },
          { q: '¿Es gratuita esta herramienta?', a: 'La comparación con IA requiere una cuenta con un plan activo o créditos.' },
        ],
      },
      it: {
        features: [
          'Confronta due versioni di un contratto affiancate',
          'L’IA segnala cosa è cambiato e il relativo livello di rischio',
          'Basato su IA — richiede un account e un piano',
        ],
        faq: [
          { q: 'In cosa differisce da un semplice confronto testuale?', a: 'L’IA spiega cosa significa ogni modifica e segnala il rischio, non solo quale testo si è spostato.' },
          { q: 'Entrambe le versioni devono essere PDF?', a: 'Sì, carica entrambe le versioni del contratto in formato PDF.' },
          { q: 'Questo strumento è gratuito?', a: 'Il confronto con IA richiede un account con un piano attivo o crediti.' },
        ],
      },
      ar: {
        features: [
          'يقارن نسختين من عقد جنبًا إلى جنب',
          'يحدد الذكاء الاصطناعي ما تغيّر ومستوى الخطورة',
          'مدعوم بالذكاء الاصطناعي — يتطلب حسابًا وخطة',
        ],
        faq: [
          { q: 'كيف يختلف هذا عن مقارنة نصية عادية؟', a: 'يشرح الذكاء الاصطناعي معنى كل تغيير ويحدد مستوى الخطورة، وليس فقط أي نص تم نقله.' },
          { q: 'هل يجب أن تكون كلتا النسختين بصيغة PDF؟', a: 'نعم، ارفع كلتا نسختي العقد بصيغة PDF.' },
          { q: 'هل هذه الأداة مجانية؟', a: 'تتطلب المقارنة بالذكاء الاصطناعي حسابًا بخطة نشطة أو أرصدة.' },
        ],
      },
    },
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
