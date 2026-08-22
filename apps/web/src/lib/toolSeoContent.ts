import type { Locale } from './i18n/locales';

export interface ToolFaqItem {
  q: string;
  a: string;
}

export interface ToolSeoContent {
  features: string[];
  faq: ToolFaqItem[];
  // Non-English content for every tool page; a locale with no entry here
  // (or a tool with no translations at all) falls back to the English
  // features/faq above.
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
    translations: {
      de: {
        features: [
          'Exportiert jede Seite als separates JPG oder PNG',
          'Erhält die volle Seitenauflösung zum Drucken oder Teilen',
          'Läuft vollständig in Ihrem Browser — kein Upload nötig',
        ],
        faq: [
          { q: 'In welche Bildformate kann ich exportieren?', a: 'JPG und PNG, ein Bild pro Seite.' },
          { q: 'Gibt es ein Seitenlimit?', a: 'Nein — jede Seite im PDF wird exportiert.' },
          { q: 'Wird meine Datei irgendwohin hochgeladen?', a: 'Nein, die Konvertierung erfolgt lokal in Ihrem Browser.' },
        ],
      },
      fr: {
        features: [
          'Exporte chaque page en JPG ou PNG séparé',
          'Conserve la pleine résolution de la page pour l’impression ou le partage',
          'Fonctionne entièrement dans votre navigateur — aucun envoi nécessaire',
        ],
        faq: [
          { q: 'Vers quels formats d’image puis-je exporter ?', a: 'JPG et PNG, une image par page.' },
          { q: 'Y a-t-il une limite de pages ?', a: 'Non — chaque page du PDF est exportée.' },
          { q: 'Mon fichier est-il envoyé quelque part ?', a: 'Non, la conversion s’effectue localement dans votre navigateur.' },
        ],
      },
      es: {
        features: [
          'Exporta cada página como un JPG o PNG independiente',
          'Conserva la resolución completa de la página para imprimir o compartir',
          'Se ejecuta totalmente en tu navegador — no requiere subir nada',
        ],
        faq: [
          { q: '¿A qué formatos de imagen puedo exportar?', a: 'JPG y PNG, una imagen por página.' },
          { q: '¿Hay un límite de páginas?', a: 'No — se exporta cada página del PDF.' },
          { q: '¿Se sube mi archivo a algún lugar?', a: 'No, la conversión ocurre localmente en tu navegador.' },
        ],
      },
      it: {
        features: [
          'Esporta ogni pagina come JPG o PNG separato',
          'Mantiene la piena risoluzione della pagina per la stampa o la condivisione',
          'Funziona interamente nel tuo browser — nessun caricamento necessario',
        ],
        faq: [
          { q: 'In quali formati immagine posso esportare?', a: 'JPG e PNG, un’immagine per pagina.' },
          { q: 'C’è un limite di pagine?', a: 'No — ogni pagina del PDF viene esportata.' },
          { q: 'Il mio file viene caricato da qualche parte?', a: 'No, la conversione avviene localmente nel tuo browser.' },
        ],
      },
      ar: {
        features: [
          'يصدّر كل صفحة كملف JPG أو PNG منفصل',
          'يحافظ على دقة الصفحة الكاملة للطباعة أو المشاركة',
          'يعمل بالكامل داخل متصفحك — لا حاجة للرفع',
        ],
        faq: [
          { q: 'إلى أي صيغ صور يمكنني التصدير؟', a: 'JPG وPNG، صورة واحدة لكل صفحة.' },
          { q: 'هل هناك حد لعدد الصفحات؟', a: 'لا — يتم تصدير كل صفحة في ملف PDF.' },
          { q: 'هل يتم رفع ملفي إلى أي مكان؟', a: 'لا، يتم التحويل محليًا داخل متصفحك.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Kombiniert beliebig viele JPG- oder PNG-Bilder zu einem PDF',
          'Erhält jedes Bild in seiner ursprünglichen Qualität',
          'Läuft vollständig in Ihrem Browser — kein Upload nötig',
        ],
        faq: [
          { q: 'Kann ich die Bilder vor dem Kombinieren neu anordnen?', a: 'Ja — ziehen Sie die Bilder vor der Konvertierung in die gewünschte Reihenfolge.' },
          { q: 'Funktioniert das mit gemischten JPG- und PNG-Dateien?', a: 'Ja, Sie können beide Formate in einem PDF kombinieren.' },
          { q: 'Werden meine Bilddaten irgendwohin hochgeladen?', a: 'Nein, alles wird lokal in Ihrem Browser verarbeitet.' },
        ],
      },
      fr: {
        features: [
          'Combine un nombre illimité d’images JPG ou PNG en un seul PDF',
          'Préserve chaque image dans sa qualité d’origine',
          'Fonctionne entièrement dans votre navigateur — aucun envoi nécessaire',
        ],
        faq: [
          { q: 'Puis-je réorganiser les images avant de les combiner ?', a: 'Oui — faites glisser les images dans l’ordre souhaité avant la conversion.' },
          { q: 'Cela fonctionne-t-il avec des fichiers JPG et PNG mélangés ?', a: 'Oui, vous pouvez combiner les deux formats dans un seul PDF.' },
          { q: 'Mes données d’image sont-elles envoyées quelque part ?', a: 'Non, tout est traité localement dans votre navigateur.' },
        ],
      },
      es: {
        features: [
          'Combina cualquier cantidad de imágenes JPG o PNG en un solo PDF',
          'Conserva cada imagen en su calidad original',
          'Se ejecuta totalmente en tu navegador — no requiere subir nada',
        ],
        faq: [
          { q: '¿Puedo reordenar las imágenes antes de combinarlas?', a: 'Sí — arrastra las imágenes al orden que quieras antes de convertir.' },
          { q: '¿Funciona con archivos JPG y PNG mixtos?', a: 'Sí, puedes combinar ambos formatos en un solo PDF.' },
          { q: '¿Se suben mis datos de imagen a algún lugar?', a: 'No, todo se procesa localmente en tu navegador.' },
        ],
      },
      it: {
        features: [
          'Combina un numero qualsiasi di immagini JPG o PNG in un unico PDF',
          'Mantiene ogni immagine nella sua qualità originale',
          'Funziona interamente nel tuo browser — nessun caricamento necessario',
        ],
        faq: [
          { q: 'Posso riordinare le immagini prima di combinarle?', a: 'Sì — trascina le immagini nell’ordine desiderato prima della conversione.' },
          { q: 'Funziona con file JPG e PNG misti?', a: 'Sì, puoi combinare entrambi i formati in un unico PDF.' },
          { q: 'I miei dati immagine vengono caricati da qualche parte?', a: 'No, tutto viene elaborato localmente nel tuo browser.' },
        ],
      },
      ar: {
        features: [
          'يجمع أي عدد من صور JPG أو PNG في ملف PDF واحد',
          'يحافظ على الجودة الأصلية لكل صورة',
          'يعمل بالكامل داخل متصفحك — لا حاجة للرفع',
        ],
        faq: [
          { q: 'هل يمكنني إعادة ترتيب الصور قبل الدمج؟', a: 'نعم — اسحب الصور إلى الترتيب الذي تريده قبل التحويل.' },
          { q: 'هل يعمل هذا مع ملفات JPG وPNG مختلطة؟', a: 'نعم، يمكنك دمج كلا الصيغتين في ملف PDF واحد.' },
          { q: 'هل تُرفع بيانات صوري إلى أي مكان؟', a: 'لا، تتم معالجة كل شيء محليًا داخل متصفحك.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Konvertiert .xlsx-Tabellen in PDF',
          'Erhält Spalten, Zeilen und Zellformatierung',
          'Wird auf unseren Servern verarbeitet und nach Gebrauch automatisch gelöscht',
        ],
        faq: [
          { q: 'Werden auch mehrere Blätter konvertiert?', a: 'Ja, jedes Blatt in der Arbeitsmappe wird einbezogen.' },
          { q: 'Passen große Tabellen auf die Seite?', a: 'Breite Tabellen werden auf die druckbare Seitenbreite skaliert.' },
          { q: 'Ist eine Abrechnung erforderlich?', a: 'Dies ist ein serverseitiger Vorgang und erfordert möglicherweise einen Plan — siehe Preise.' },
        ],
      },
      fr: {
        features: [
          'Convertit les feuilles de calcul .xlsx en PDF',
          'Préserve les colonnes, les lignes et la mise en forme des cellules',
          'Traité sur nos serveurs et supprimé automatiquement après utilisation',
        ],
        faq: [
          { q: 'Les feuilles multiples sont-elles converties aussi ?', a: 'Oui, chaque feuille du classeur est incluse.' },
          { q: 'Les grandes feuilles tiendront-elles sur la page ?', a: 'Les feuilles larges sont mises à l’échelle pour tenir dans la largeur imprimable.' },
          { q: 'Une facturation est-elle nécessaire ?', a: 'Il s’agit d’une opération côté serveur qui peut nécessiter un forfait — voir Tarifs.' },
        ],
      },
      es: {
        features: [
          'Convierte hojas de cálculo .xlsx a PDF',
          'Conserva columnas, filas y formato de celdas',
          'Procesado en nuestros servidores y eliminado automáticamente tras su uso',
        ],
        faq: [
          { q: '¿Se convierten también varias hojas?', a: 'Sí, se incluyen todas las hojas del libro.' },
          { q: '¿Las hojas grandes se ajustarán a la página?', a: 'Las hojas anchas se escalan para ajustarse al ancho imprimible.' },
          { q: '¿Se requiere facturación?', a: 'Es una operación del lado del servidor y puede requerir un plan — consulta Precios.' },
        ],
      },
      it: {
        features: [
          'Converte fogli di calcolo .xlsx in PDF',
          'Preserva colonne, righe e formattazione delle celle',
          'Elaborato sui nostri server ed eliminato automaticamente dopo l’uso',
        ],
        faq: [
          { q: 'Vengono convertiti anche più fogli?', a: 'Sì, ogni foglio della cartella di lavoro è incluso.' },
          { q: 'I fogli di grandi dimensioni si adatteranno alla pagina?', a: 'I fogli larghi vengono ridimensionati per adattarsi alla larghezza stampabile della pagina.' },
          { q: 'È richiesta la fatturazione?', a: 'Questa è un’operazione lato server e potrebbe richiedere un piano — vedi Prezzi.' },
        ],
      },
      ar: {
        features: [
          'يحوّل جداول بيانات .xlsx إلى PDF',
          'يحافظ على الأعمدة والصفوف وتنسيق الخلايا',
          'تتم المعالجة على خوادمنا ويُحذف تلقائيًا بعد الاستخدام',
        ],
        faq: [
          { q: 'هل يتم تحويل الأوراق المتعددة أيضًا؟', a: 'نعم، يتم تضمين كل ورقة في المصنف.' },
          { q: 'هل تتناسب جداول البيانات الكبيرة مع الصفحة؟', a: 'يتم تحجيم الأوراق العريضة لتناسب عرض الصفحة القابل للطباعة.' },
          { q: 'هل الفوترة مطلوبة؟', a: 'هذه عملية تتم على الخادم وقد تتطلب خطة — راجع صفحة الأسعار.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Konvertiert ein PDF in eine bearbeitbare .xlsx-Tabelle',
          'Versucht, tabellarische Daten in echte Zellen wiederherzustellen',
          'Wird auf unseren Servern verarbeitet und nach Gebrauch automatisch gelöscht',
        ],
        faq: [
          { q: 'Funktioniert das gut bei jedem PDF?', a: 'Die besten Ergebnisse erzielen PDFs mit klarer Tabellenstruktur.' },
          { q: 'Werden Formeln wiederhergestellt?', a: 'Nein — Werte werden als statische Daten konvertiert, nicht als aktive Formeln.' },
          { q: 'Wird meine Datei danach aufbewahrt?', a: 'Nein, sie wird gemäß Ihrer Aufbewahrungseinstellung automatisch gelöscht.' },
        ],
      },
      fr: {
        features: [
          'Convertit un PDF en feuille de calcul .xlsx modifiable',
          'Tente de récupérer les données tabulaires dans de vraies cellules',
          'Traité sur nos serveurs et supprimé automatiquement après utilisation',
        ],
        faq: [
          { q: 'Cela fonctionne-t-il bien sur n’importe quel PDF ?', a: 'Les meilleurs résultats sont obtenus sur des PDF à structure tabulaire claire.' },
          { q: 'Les formules seront-elles recréées ?', a: 'Non — les valeurs sont converties en données statiques, pas en formules actives.' },
          { q: 'Mon fichier est-il conservé ensuite ?', a: 'Non, il est supprimé automatiquement selon votre paramètre de conservation.' },
        ],
      },
      es: {
        features: [
          'Convierte un PDF en una hoja de cálculo .xlsx editable',
          'Intenta recuperar los datos tabulares en celdas reales',
          'Procesado en nuestros servidores y eliminado automáticamente tras su uso',
        ],
        faq: [
          { q: '¿Funciona bien con cualquier PDF?', a: 'Los mejores resultados se obtienen con PDF de estructura de tabla clara.' },
          { q: '¿Se recrearán las fórmulas?', a: 'No — los valores se convierten como datos estáticos, no fórmulas activas.' },
          { q: '¿Se conserva mi archivo después?', a: 'No, se elimina automáticamente según tu configuración de retención.' },
        ],
      },
      it: {
        features: [
          'Converte un PDF in un foglio di calcolo .xlsx modificabile',
          'Tenta di recuperare i dati tabulari in celle reali',
          'Elaborato sui nostri server ed eliminato automaticamente dopo l’uso',
        ],
        faq: [
          { q: 'Funziona bene con qualsiasi PDF?', a: 'I risultati migliori si ottengono con PDF con una struttura a tabella chiara.' },
          { q: 'Le formule verranno ricreate?', a: 'No — i valori vengono convertiti come dati statici, non formule attive.' },
          { q: 'Il mio file viene conservato in seguito?', a: 'No, viene eliminato automaticamente in base alla tua impostazione di conservazione.' },
        ],
      },
      ar: {
        features: [
          'يحوّل ملف PDF إلى جدول بيانات .xlsx قابل للتحرير',
          'يحاول استعادة البيانات الجدولية في خلايا حقيقية',
          'تتم المعالجة على خوادمنا ويُحذف تلقائيًا بعد الاستخدام',
        ],
        faq: [
          { q: 'هل يعمل هذا جيدًا مع أي ملف PDF؟', a: 'أفضل النتائج تكون مع ملفات PDF ذات بنية جدول واضحة.' },
          { q: 'هل سيتم إعادة إنشاء الصيغ؟', a: 'لا — يتم تحويل القيم كبيانات ثابتة، وليست صيغًا فعالة.' },
          { q: 'هل يُحتفظ بملفي بعد ذلك؟', a: 'لا، يُحذف تلقائيًا وفقًا لإعداد الاحتفاظ الخاص بك.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Konvertiert .pptx-Präsentationen in PDF',
          'Erhält Folienlayout, Bilder und Text',
          'Wird auf unseren Servern verarbeitet und nach Gebrauch automatisch gelöscht',
        ],
        faq: [
          { q: 'Sind Referentennotizen enthalten?', a: 'Nein, nur der sichtbare Folieninhalt wird konvertiert.' },
          { q: 'Werden Animationen oder Übergänge übernommen?', a: 'Nein — PDF ist ein statisches Format, daher wird jede Folie zu einer Seite.' },
          { q: 'Ist eine Abrechnung erforderlich?', a: 'Dies ist ein serverseitiger Vorgang und erfordert möglicherweise einen Plan — siehe Preise.' },
        ],
      },
      fr: {
        features: [
          'Convertit les présentations .pptx en PDF',
          'Préserve la mise en page des diapositives, les images et le texte',
          'Traité sur nos serveurs et supprimé automatiquement après utilisation',
        ],
        faq: [
          { q: 'Les notes du présentateur sont-elles incluses ?', a: 'Non, seul le contenu visible des diapositives est converti.' },
          { q: 'Les animations ou transitions seront-elles conservées ?', a: 'Non — le PDF est un format statique, donc chaque diapositive devient une page.' },
          { q: 'Une facturation est-elle nécessaire ?', a: 'Il s’agit d’une opération côté serveur qui peut nécessiter un forfait — voir Tarifs.' },
        ],
      },
      es: {
        features: [
          'Convierte presentaciones .pptx a PDF',
          'Conserva el diseño de las diapositivas, las imágenes y el texto',
          'Procesado en nuestros servidores y eliminado automáticamente tras su uso',
        ],
        faq: [
          { q: '¿Se incluyen las notas del orador?', a: 'No, solo se convierte el contenido visible de las diapositivas.' },
          { q: '¿Se conservarán las animaciones o transiciones?', a: 'No — el PDF es un formato estático, así que cada diapositiva se convierte en una página.' },
          { q: '¿Se requiere facturación?', a: 'Es una operación del lado del servidor y puede requerir un plan — consulta Precios.' },
        ],
      },
      it: {
        features: [
          'Converte presentazioni .pptx in PDF',
          'Preserva il layout delle diapositive, le immagini e il testo',
          'Elaborato sui nostri server ed eliminato automaticamente dopo l’uso',
        ],
        faq: [
          { q: 'Sono incluse le note del relatore?', a: 'No, viene convertito solo il contenuto visibile delle diapositive.' },
          { q: 'Le animazioni o le transizioni verranno mantenute?', a: 'No — il PDF è un formato statico, quindi ogni diapositiva diventa una pagina.' },
          { q: 'È richiesta la fatturazione?', a: 'Questa è un’operazione lato server e potrebbe richiedere un piano — vedi Prezzi.' },
        ],
      },
      ar: {
        features: [
          'يحوّل عروض .pptx التقديمية إلى PDF',
          'يحافظ على تخطيط الشرائح والصور والنص',
          'تتم المعالجة على خوادمنا ويُحذف تلقائيًا بعد الاستخدام',
        ],
        faq: [
          { q: 'هل تُضمَّن ملاحظات المتحدث؟', a: 'لا، يتم تحويل محتوى الشريحة المرئي فقط.' },
          { q: 'هل تنتقل الرسوم المتحركة أو الانتقالات؟', a: 'لا — PDF صيغة ثابتة، لذا تصبح كل شريحة صفحة واحدة.' },
          { q: 'هل الفوترة مطلوبة؟', a: 'هذه عملية تتم على الخادم وقد تتطلب خطة — راجع صفحة الأسعار.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Konvertiert ein PDF in eine bearbeitbare .pptx-Präsentation',
          'Pro PDF-Seite wird eine Folie erstellt',
          'Wird auf unseren Servern verarbeitet und nach Gebrauch automatisch gelöscht',
        ],
        faq: [
          { q: 'Wird der Text im Ergebnis bearbeitbar sein?', a: 'Ja, Textfelder werden als bearbeitbare PowerPoint-Elemente neu erstellt.' },
          { q: 'Entspricht die Formatierung genau dem Original-PDF?', a: 'Das Layout wird angenähert — komplexe Designs benötigen möglicherweise kleinere Anpassungen.' },
          { q: 'Wird meine Datei danach aufbewahrt?', a: 'Nein, sie wird gemäß Ihrer Aufbewahrungseinstellung automatisch gelöscht.' },
        ],
      },
      fr: {
        features: [
          'Convertit un PDF en présentation .pptx modifiable',
          'Une diapositive est créée par page PDF',
          'Traité sur nos serveurs et supprimé automatiquement après utilisation',
        ],
        faq: [
          { q: 'Le texte sera-t-il modifiable dans le résultat ?', a: 'Oui, les zones de texte sont recréées en tant qu’éléments PowerPoint modifiables.' },
          { q: 'La mise en forme correspond-elle exactement au PDF original ?', a: 'La mise en page est approximative — les designs complexes peuvent nécessiter un léger ajustement.' },
          { q: 'Mon fichier est-il conservé ensuite ?', a: 'Non, il est supprimé automatiquement selon votre paramètre de conservation.' },
        ],
      },
      es: {
        features: [
          'Convierte un PDF en una presentación .pptx editable',
          'Se crea una diapositiva por cada página del PDF',
          'Procesado en nuestros servidores y eliminado automáticamente tras su uso',
        ],
        faq: [
          { q: '¿Será el texto editable en el resultado?', a: 'Sí, los cuadros de texto se recrean como elementos editables de PowerPoint.' },
          { q: '¿El formato coincide exactamente con el PDF original?', a: 'El diseño se aproxima — los diseños complejos pueden necesitar un pequeño ajuste.' },
          { q: '¿Se conserva mi archivo después?', a: 'No, se elimina automáticamente según tu configuración de retención.' },
        ],
      },
      it: {
        features: [
          'Converte un PDF in una presentazione .pptx modificabile',
          'Viene creata una diapositiva per ogni pagina del PDF',
          'Elaborato sui nostri server ed eliminato automaticamente dopo l’uso',
        ],
        faq: [
          { q: 'Il testo sarà modificabile nel risultato?', a: 'Sì, le caselle di testo vengono ricreate come elementi PowerPoint modificabili.' },
          { q: 'La formattazione corrisponde esattamente al PDF originale?', a: 'Il layout è approssimato — i design complessi potrebbero richiedere piccoli aggiustamenti.' },
          { q: 'Il mio file viene conservato in seguito?', a: 'No, viene eliminato automaticamente in base alla tua impostazione di conservazione.' },
        ],
      },
      ar: {
        features: [
          'يحوّل ملف PDF إلى عرض .pptx تقديمي قابل للتحرير',
          'يتم إنشاء شريحة واحدة لكل صفحة PDF',
          'تتم المعالجة على خوادمنا ويُحذف تلقائيًا بعد الاستخدام',
        ],
        faq: [
          { q: 'هل سيكون النص قابلاً للتحرير في الناتج؟', a: 'نعم، يُعاد إنشاء مربعات النص كعناصر PowerPoint قابلة للتحرير.' },
          { q: 'هل يطابق التنسيق ملف PDF الأصلي تمامًا؟', a: 'يتم تقريب التخطيط — قد تحتاج التصاميم المعقدة إلى تعديل طفيف.' },
          { q: 'هل يُحتفظ بملفي بعد ذلك؟', a: 'لا، يُحذف تلقائيًا وفقًا لإعداد الاحتفاظ الخاص بك.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Extrahiert den Text jeder Seite in eine einzige .txt-Datei',
          'Erhält die Lesereihenfolge',
          'Läuft vollständig in Ihrem Browser — kein Upload nötig',
        ],
        faq: [
          { q: 'Funktioniert das bei gescannten PDFs?', a: 'Nur bei textbasierten PDFs; Scans benötigen zuerst eine OCR für extrahierbaren Text.' },
          { q: 'Bleibt Formatierung wie Fett oder Tabellen erhalten?', a: 'Nein — die Ausgabe ist reiner Text ohne Formatierung.' },
          { q: 'Wird meine Datei irgendwohin hochgeladen?', a: 'Nein, die Extraktion erfolgt lokal in Ihrem Browser.' },
        ],
      },
      fr: {
        features: [
          'Extrait le texte de chaque page dans un seul fichier .txt',
          'Conserve l’ordre de lecture',
          'Fonctionne entièrement dans votre navigateur — aucun envoi nécessaire',
        ],
        faq: [
          { q: 'Cela fonctionne-t-il sur des PDF scannés ?', a: 'Uniquement sur des PDF textuels ; les scans nécessitent d’abord l’OCR pour un texte extractible.' },
          { q: 'La mise en forme comme le gras ou les tableaux est-elle préservée ?', a: 'Non — le résultat est du texte brut sans mise en forme.' },
          { q: 'Mon fichier est-il envoyé quelque part ?', a: 'Non, l’extraction s’effectue localement dans votre navigateur.' },
        ],
      },
      es: {
        features: [
          'Extrae el texto de cada página en un solo archivo .txt',
          'Mantiene intacto el orden de lectura',
          'Se ejecuta totalmente en tu navegador — no requiere subir nada',
        ],
        faq: [
          { q: '¿Funciona con PDF escaneados?', a: 'Solo con PDF de texto; los escaneos necesitan primero el OCR para texto extraíble.' },
          { q: '¿Se conserva el formato como negrita o tablas?', a: 'No — el resultado es texto sin formato.' },
          { q: '¿Se sube mi archivo a algún lugar?', a: 'No, la extracción ocurre localmente en tu navegador.' },
        ],
      },
      it: {
        features: [
          'Estrae il testo di ogni pagina in un unico file .txt',
          'Mantiene intatto l’ordine di lettura',
          'Funziona interamente nel tuo browser — nessun caricamento necessario',
        ],
        faq: [
          { q: 'Funziona con i PDF scansionati?', a: 'Solo con PDF testuali; le scansioni necessitano prima dell’OCR per un testo estraibile.' },
          { q: 'Viene preservata la formattazione come grassetto o tabelle?', a: 'No — il risultato è testo semplice senza formattazione.' },
          { q: 'Il mio file viene caricato da qualche parte?', a: 'No, l’estrazione avviene localmente nel tuo browser.' },
        ],
      },
      ar: {
        features: [
          'يستخرج نص كل صفحة إلى ملف .txt واحد',
          'يحافظ على ترتيب القراءة سليمًا',
          'يعمل بالكامل داخل متصفحك — لا حاجة للرفع',
        ],
        faq: [
          { q: 'هل يعمل هذا مع ملفات PDF الممسوحة ضوئيًا؟', a: 'فقط مع ملفات PDF النصية؛ تحتاج المسوحات الضوئية إلى التعرف الضوئي أولاً للحصول على نص قابل للاستخراج.' },
          { q: 'هل يُحافظ على التنسيق مثل الخط الغامق أو الجداول؟', a: 'لا — الناتج نص عادي بدون تنسيق.' },
          { q: 'هل يتم رفع ملفي إلى أي مكان؟', a: 'لا، يتم الاستخراج محليًا داخل متصفحك.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Konvertiert ein PDF in eine einzige gestaltete HTML-Seite',
          'Erhält Text auswählbar und lesbar im Browser',
          'Wird auf unseren Servern verarbeitet und nach Gebrauch automatisch gelöscht',
        ],
        faq: [
          { q: 'Werden Bilder einbezogen?', a: 'Ja, eingebettete Bilder werden zusammen mit dem Text konvertiert.' },
          { q: 'Kann ich das HTML danach bearbeiten?', a: 'Ja, die Ausgabe ist reines HTML, das Sie in jedem Editor bearbeiten können.' },
          { q: 'Ist eine Abrechnung erforderlich?', a: 'Dies ist ein serverseitiger Vorgang und erfordert möglicherweise einen Plan — siehe Preise.' },
        ],
      },
      fr: {
        features: [
          'Convertit un PDF en une seule page HTML stylisée',
          'Garde le texte sélectionnable et lisible dans un navigateur',
          'Traité sur nos serveurs et supprimé automatiquement après utilisation',
        ],
        faq: [
          { q: 'Les images seront-elles incluses ?', a: 'Oui, les images intégrées sont converties avec le texte.' },
          { q: 'Puis-je modifier le HTML ensuite ?', a: 'Oui, le résultat est du HTML brut que vous pouvez modifier dans n’importe quel éditeur.' },
          { q: 'Une facturation est-elle nécessaire ?', a: 'Il s’agit d’une opération côté serveur qui peut nécessiter un forfait — voir Tarifs.' },
        ],
      },
      es: {
        features: [
          'Convierte un PDF en una sola página HTML con estilo',
          'Mantiene el texto seleccionable y legible en un navegador',
          'Procesado en nuestros servidores y eliminado automáticamente tras su uso',
        ],
        faq: [
          { q: '¿Se incluirán las imágenes?', a: 'Sí, las imágenes incrustadas se convierten junto con el texto.' },
          { q: '¿Puedo editar el HTML después?', a: 'Sí, el resultado es HTML simple que puedes editar en cualquier editor.' },
          { q: '¿Se requiere facturación?', a: 'Es una operación del lado del servidor y puede requerir un plan — consulta Precios.' },
        ],
      },
      it: {
        features: [
          'Converte un PDF in un’unica pagina HTML stilizzata',
          'Mantiene il testo selezionabile e leggibile in un browser',
          'Elaborato sui nostri server ed eliminato automaticamente dopo l’uso',
        ],
        faq: [
          { q: 'Le immagini saranno incluse?', a: 'Sì, le immagini incorporate vengono convertite insieme al testo.' },
          { q: 'Posso modificare l’HTML in seguito?', a: 'Sì, il risultato è HTML semplice che puoi modificare in qualsiasi editor.' },
          { q: 'È richiesta la fatturazione?', a: 'Questa è un’operazione lato server e potrebbe richiedere un piano — vedi Prezzi.' },
        ],
      },
      ar: {
        features: [
          'يحوّل ملف PDF إلى صفحة HTML واحدة منسقة',
          'يحافظ على النص قابلاً للتحديد وسهل القراءة في المتصفح',
          'تتم المعالجة على خوادمنا ويُحذف تلقائيًا بعد الاستخدام',
        ],
        faq: [
          { q: 'هل ستُضمَّن الصور؟', a: 'نعم، تُحوَّل الصور المضمنة مع النص.' },
          { q: 'هل يمكنني تعديل HTML بعد ذلك؟', a: 'نعم، الناتج هو HTML عادي يمكنك تعديله في أي محرر.' },
          { q: 'هل الفوترة مطلوبة؟', a: 'هذه عملية تتم على الخادم وقد تتطلب خطة — راجع صفحة الأسعار.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Seiten innerhalb eines PDFs per Drag & Drop neu anordnen',
          'Unerwünschte Seiten in derselben Ansicht löschen',
          'Läuft vollständig in Ihrem Browser — kein Upload nötig',
        ],
        faq: [
          { q: 'Kann ich Seiten gleichzeitig neu anordnen und löschen?', a: 'Ja, beide Aktionen erfolgen im selben Arbeitsbereich.' },
          { q: 'Werden Seitenzahlen automatisch aktualisiert?', a: 'Das PDF spiegelt Ihre neue Reihenfolge wider; vorhandene Seitenzahl-Stempel werden nicht neu berechnet.' },
          { q: 'Wird meine Datei irgendwohin hochgeladen?', a: 'Nein, das Organisieren erfolgt lokal in Ihrem Browser.' },
        ],
      },
      fr: {
        features: [
          'Glissez pour réorganiser les pages dans un PDF',
          'Supprimez les pages indésirables dans la même vue',
          'Fonctionne entièrement dans votre navigateur — aucun envoi nécessaire',
        ],
        faq: [
          { q: 'Puis-je réorganiser et supprimer des pages en même temps ?', a: 'Oui, les deux actions se déroulent dans le même espace de travail.' },
          { q: 'Les numéros de page seront-ils mis à jour automatiquement ?', a: 'Le PDF reflète votre nouvel ordre ; les numéros de page déjà tamponnés ne sont pas recalculés.' },
          { q: 'Mon fichier est-il envoyé quelque part ?', a: 'Non, l’organisation s’effectue localement dans votre navigateur.' },
        ],
      },
      es: {
        features: [
          'Arrastra para reordenar páginas dentro de un PDF',
          'Elimina páginas no deseadas en la misma vista',
          'Se ejecuta totalmente en tu navegador — no requiere subir nada',
        ],
        faq: [
          { q: '¿Puedo reordenar y eliminar páginas a la vez?', a: 'Sí, ambas acciones ocurren en el mismo espacio de trabajo.' },
          { q: '¿Se actualizarán los números de página automáticamente?', a: 'El PDF refleja tu nuevo orden; los sellos de número de página existentes no se recalculan.' },
          { q: '¿Se sube mi archivo a algún lugar?', a: 'No, la organización ocurre localmente en tu navegador.' },
        ],
      },
      it: {
        features: [
          'Trascina per riordinare le pagine all’interno di un PDF',
          'Elimina le pagine indesiderate nella stessa vista',
          'Funziona interamente nel tuo browser — nessun caricamento necessario',
        ],
        faq: [
          { q: 'Posso riordinare ed eliminare pagine contemporaneamente?', a: 'Sì, entrambe le azioni avvengono nello stesso spazio di lavoro.' },
          { q: 'I numeri di pagina si aggiorneranno automaticamente?', a: 'Il PDF riflette il tuo nuovo ordine; i timbri dei numeri di pagina esistenti non vengono ricalcolati.' },
          { q: 'Il mio file viene caricato da qualche parte?', a: 'No, l’organizzazione avviene localmente nel tuo browser.' },
        ],
      },
      ar: {
        features: [
          'اسحب لإعادة ترتيب الصفحات داخل ملف PDF',
          'احذف الصفحات غير المرغوبة في نفس العرض',
          'يعمل بالكامل داخل متصفحك — لا حاجة للرفع',
        ],
        faq: [
          { q: 'هل يمكنني إعادة الترتيب والحذف في آن واحد؟', a: 'نعم، يحدث كلا الإجراءين في نفس مساحة العمل.' },
          { q: 'هل تُحدَّث أرقام الصفحات تلقائيًا؟', a: 'يعكس ملف PDF ترتيبك الجديد؛ لا يُعاد حساب أختام أرقام الصفحات الموجودة.' },
          { q: 'هل يتم رفع ملفي إلى أي مكان؟', a: 'لا، يتم التنظيم محليًا داخل متصفحك.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Dreht jede Seite eines PDFs oder nur die ausgewählten',
          'Vorschau der Ausrichtung jeder Seite vor dem Speichern',
          'Läuft vollständig in Ihrem Browser — kein Upload nötig',
        ],
        faq: [
          { q: 'Kann ich nur eine Seite statt aller drehen?', a: 'Ja, die Drehung kann pro Seite angewendet werden.' },
          { q: 'Welche Drehwinkel werden unterstützt?', a: '90, 180 und 270 Grad.' },
          { q: 'Wird meine Datei irgendwohin hochgeladen?', a: 'Nein, die Drehung erfolgt lokal in Ihrem Browser.' },
        ],
      },
      fr: {
        features: [
          'Fait pivoter chaque page d’un PDF, ou seulement celles que vous choisissez',
          'Prévisualisez l’orientation de chaque page avant d’enregistrer',
          'Fonctionne entièrement dans votre navigateur — aucun envoi nécessaire',
        ],
        faq: [
          { q: 'Puis-je faire pivoter une seule page au lieu de toutes ?', a: 'Oui, la rotation peut être appliquée par page.' },
          { q: 'Quels angles de rotation sont pris en charge ?', a: '90, 180 et 270 degrés.' },
          { q: 'Mon fichier est-il envoyé quelque part ?', a: 'Non, la rotation s’effectue localement dans votre navigateur.' },
        ],
      },
      es: {
        features: [
          'Gira cada página de un PDF, o solo las que elijas',
          'Previsualiza la orientación de cada página antes de guardar',
          'Se ejecuta totalmente en tu navegador — no requiere subir nada',
        ],
        faq: [
          { q: '¿Puedo girar solo una página en lugar de todas?', a: 'Sí, la rotación se puede aplicar por página.' },
          { q: '¿Qué ángulos de rotación son compatibles?', a: '90, 180 y 270 grados.' },
          { q: '¿Se sube mi archivo a algún lugar?', a: 'No, la rotación ocurre localmente en tu navegador.' },
        ],
      },
      it: {
        features: [
          'Ruota ogni pagina di un PDF, o solo quelle selezionate',
          'Visualizza in anteprima l’orientamento di ogni pagina prima di salvare',
          'Funziona interamente nel tuo browser — nessun caricamento necessario',
        ],
        faq: [
          { q: 'Posso ruotare solo una pagina invece di tutte?', a: 'Sì, la rotazione può essere applicata per pagina.' },
          { q: 'Quali angoli di rotazione sono supportati?', a: '90, 180 e 270 gradi.' },
          { q: 'Il mio file viene caricato da qualche parte?', a: 'No, la rotazione avviene localmente nel tuo browser.' },
        ],
      },
      ar: {
        features: [
          'يُدوّر كل صفحة في ملف PDF، أو الصفحات التي تختارها فقط',
          'معاينة اتجاه كل صفحة قبل الحفظ',
          'يعمل بالكامل داخل متصفحك — لا حاجة للرفع',
        ],
        faq: [
          { q: 'هل يمكنني تدوير صفحة واحدة فقط بدلاً من كلها؟', a: 'نعم، يمكن تطبيق التدوير لكل صفحة على حدة.' },
          { q: 'ما زوايا التدوير المدعومة؟', a: '90 و180 و270 درجة.' },
          { q: 'هل يتم رفع ملفي إلى أي مكان؟', a: 'لا، يتم التدوير محليًا داخل متصفحك.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Stempelt Seitenzahlen auf jede Seite',
          'Position, Startnummer und Format wählen',
          'Läuft vollständig in Ihrem Browser — kein Upload nötig',
        ],
        faq: [
          { q: 'Kann ich die Nummerierung ab einer anderen Seite als 1 beginnen?', a: 'Ja, legen Sie eine beliebige Startnummer fest.' },
          { q: 'Wo können die Zahlen platziert werden?', a: 'An jeder Ecke oder mittig, oben oder unten.' },
          { q: 'Wird meine Datei irgendwohin hochgeladen?', a: 'Nein, dies erfolgt lokal in Ihrem Browser.' },
        ],
      },
      fr: {
        features: [
          'Tamponne les numéros de page sur chaque page',
          'Choisissez la position, le numéro de départ et le format',
          'Fonctionne entièrement dans votre navigateur — aucun envoi nécessaire',
        ],
        faq: [
          { q: 'Puis-je commencer la numérotation à une page autre que 1 ?', a: 'Oui, définissez n’importe quel numéro de départ.' },
          { q: 'Où les numéros peuvent-ils être placés ?', a: 'N’importe quel coin ou position centrale, en haut ou en bas.' },
          { q: 'Mon fichier est-il envoyé quelque part ?', a: 'Non, cela s’effectue localement dans votre navigateur.' },
        ],
      },
      es: {
        features: [
          'Estampa números de página en cada página',
          'Elige la posición, el número inicial y el formato',
          'Se ejecuta totalmente en tu navegador — no requiere subir nada',
        ],
        faq: [
          { q: '¿Puedo empezar la numeración desde una página distinta de la 1?', a: 'Sí, establece cualquier número inicial.' },
          { q: '¿Dónde se pueden colocar los números?', a: 'En cualquier esquina o posición central, arriba o abajo.' },
          { q: '¿Se sube mi archivo a algún lugar?', a: 'No, esto ocurre localmente en tu navegador.' },
        ],
      },
      it: {
        features: [
          'Applica i numeri di pagina su ogni pagina',
          'Scegli posizione, numero iniziale e formato',
          'Funziona interamente nel tuo browser — nessun caricamento necessario',
        ],
        faq: [
          { q: 'Posso iniziare la numerazione da una pagina diversa da 1?', a: 'Sì, imposta qualsiasi numero iniziale.' },
          { q: 'Dove possono essere posizionati i numeri?', a: 'Qualsiasi angolo o posizione centrale, in alto o in basso.' },
          { q: 'Il mio file viene caricato da qualche parte?', a: 'No, questo avviene localmente nel tuo browser.' },
        ],
      },
      ar: {
        features: [
          'يضع أرقام الصفحات على كل صفحة',
          'اختر الموضع ورقم البداية والتنسيق',
          'يعمل بالكامل داخل متصفحك — لا حاجة للرفع',
        ],
        faq: [
          { q: 'هل يمكنني بدء الترقيم من صفحة غير 1؟', a: 'نعم، حدد أي رقم بداية.' },
          { q: 'أين يمكن وضع الأرقام؟', a: 'أي زاوية أو موضع مركزي، أعلى أو أسفل.' },
          { q: 'هل يتم رفع ملفي إلى أي مكان؟', a: 'لا، يتم هذا محليًا داخل متصفحك.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Serverseitige Hochkompression für die anspruchsvollsten Dateien',
          'Erhält scharfen, auswählbaren Text im Gegensatz zur einfachen Komprimierung',
          'Wird auf unseren Servern verarbeitet und nach Gebrauch automatisch gelöscht',
        ],
        faq: [
          { q: 'Wie unterscheidet sich das vom kostenlosen Komprimieren-Tool?', a: 'Es nutzt eine stärkere serverseitige Engine für eine tiefere Größenreduzierung bei gleichzeitig auswählbarem Text.' },
          { q: 'Ist dafür ein bezahlter Plan nötig?', a: 'Ja, dies ist ein serverseitiger Vorgang — siehe Preise.' },
          { q: 'Wird meine Datei danach aufbewahrt?', a: 'Nein, sie wird gemäß Ihrer Aufbewahrungseinstellung automatisch gelöscht.' },
        ],
      },
      fr: {
        features: [
          'Compression haute performance côté serveur pour les fichiers les plus difficiles',
          'Garde le texte net et sélectionnable, contrairement à la compression basique',
          'Traité sur nos serveurs et supprimé automatiquement après utilisation',
        ],
        faq: [
          { q: 'En quoi cela diffère-t-il de l’outil de compression gratuit ?', a: 'Il utilise un moteur côté serveur plus puissant pour une réduction de taille plus poussée tout en gardant le texte sélectionnable.' },
          { q: 'Cela nécessite-t-il un forfait payant ?', a: 'Oui, il s’agit d’une opération côté serveur — voir Tarifs.' },
          { q: 'Mon fichier est-il conservé ensuite ?', a: 'Non, il est supprimé automatiquement selon votre paramètre de conservation.' },
        ],
      },
      es: {
        features: [
          'Compresión de alta relación del lado del servidor para los archivos más difíciles',
          'Mantiene el texto nítido y seleccionable, a diferencia de la compresión básica',
          'Procesado en nuestros servidores y eliminado automáticamente tras su uso',
        ],
        faq: [
          { q: '¿En qué se diferencia de la herramienta gratuita de Compresión?', a: 'Utiliza un motor del lado del servidor más potente para una reducción de tamaño más profunda manteniendo el texto seleccionable.' },
          { q: '¿Necesito un plan de pago para esto?', a: 'Sí, es una operación del lado del servidor — consulta Precios.' },
          { q: '¿Se conserva mi archivo después?', a: 'No, se elimina automáticamente según tu configuración de retención.' },
        ],
      },
      it: {
        features: [
          'Compressione ad alto rapporto lato server per i file più difficili',
          'Mantiene il testo nitido e selezionabile, a differenza della compressione di base',
          'Elaborato sui nostri server ed eliminato automaticamente dopo l’uso',
        ],
        faq: [
          { q: 'In cosa differisce dallo strumento di compressione gratuito?', a: 'Utilizza un motore lato server più potente per una riduzione delle dimensioni più profonda mantenendo il testo selezionabile.' },
          { q: 'Serve un piano a pagamento?', a: 'Sì, questa è un’operazione lato server — vedi Prezzi.' },
          { q: 'Il mio file viene conservato in seguito?', a: 'No, viene eliminato automaticamente in base alla tua impostazione di conservazione.' },
        ],
      },
      ar: {
        features: [
          'ضغط عالي النسبة من جانب الخادم لأصعب الملفات',
          'يحافظ على وضوح النص وقابليته للتحديد، بخلاف الضغط الأساسي',
          'تتم المعالجة على خوادمنا ويُحذف تلقائيًا بعد الاستخدام',
        ],
        faq: [
          { q: 'بم يختلف هذا عن أداة الضغط المجانية؟', a: 'يستخدم محركًا أقوى من جانب الخادم لتقليل الحجم بشكل أعمق مع إبقاء النص قابلاً للتحديد.' },
          { q: 'هل يتطلب هذا خطة مدفوعة؟', a: 'نعم، هذه عملية تتم على الخادم — راجع صفحة الأسعار.' },
          { q: 'هل يُحتفظ بملفي بعد ذلك؟', a: 'لا، يُحذف تلقائيًا وفقًا لإعداد الاحتفاظ الخاص بك.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Stempelt Text über jede Seite',
          'Deckkraft, Winkel und Position steuern',
          'Läuft vollständig in Ihrem Browser — kein Upload nötig',
        ],
        faq: [
          { q: 'Kann ich meinen eigenen Text verwenden?', a: 'Ja, geben Sie beliebigen Text ein — einen Namen, „Vertraulich“, ein Datum usw.' },
          { q: 'Wird das Wasserzeichen wichtige Inhalte verdecken?', a: 'Sie steuern Deckkraft und Platzierung, sodass der Inhalt darunter lesbar bleibt.' },
          { q: 'Wird meine Datei irgendwohin hochgeladen?', a: 'Nein, das Wasserzeichen erfolgt lokal in Ihrem Browser.' },
        ],
      },
      fr: {
        features: [
          'Tamponne du texte sur chaque page',
          'Contrôlez l’opacité, l’angle et la position',
          'Fonctionne entièrement dans votre navigateur — aucun envoi nécessaire',
        ],
        faq: [
          { q: 'Puis-je utiliser mon propre texte ?', a: 'Oui, saisissez n’importe quel texte — un nom, « Confidentiel », une date, etc.' },
          { q: 'Le filigrane couvrira-t-il un contenu important ?', a: 'Vous contrôlez l’opacité et le placement afin qu’il reste lisible en dessous.' },
          { q: 'Mon fichier est-il envoyé quelque part ?', a: 'Non, le filigrane s’effectue localement dans votre navigateur.' },
        ],
      },
      es: {
        features: [
          'Estampa texto en cada página',
          'Controla la opacidad, el ángulo y la posición',
          'Se ejecuta totalmente en tu navegador — no requiere subir nada',
        ],
        faq: [
          { q: '¿Puedo usar mi propio texto?', a: 'Sí, escribe cualquier texto — un nombre, "Confidencial", una fecha, etc.' },
          { q: '¿La marca de agua cubrirá contenido importante?', a: 'Controlas la opacidad y la ubicación para que siga siendo legible debajo.' },
          { q: '¿Se sube mi archivo a algún lugar?', a: 'No, la marca de agua se aplica localmente en tu navegador.' },
        ],
      },
      it: {
        features: [
          'Applica un timbro di testo su ogni pagina',
          'Controlla opacità, angolo e posizione',
          'Funziona interamente nel tuo browser — nessun caricamento necessario',
        ],
        faq: [
          { q: 'Posso usare il mio testo personalizzato?', a: 'Sì, digita qualsiasi testo — un nome, "Riservato", una data, ecc.' },
          { q: 'La filigrana coprirà contenuti importanti?', a: 'Controlli tu l’opacità e il posizionamento, così resta leggibile sotto.' },
          { q: 'Il mio file viene caricato da qualche parte?', a: 'No, l’applicazione della filigrana avviene localmente nel tuo browser.' },
        ],
      },
      ar: {
        features: [
          'يضع ختم نص عبر كل صفحة',
          'تحكم في الشفافية والزاوية والموضع',
          'يعمل بالكامل داخل متصفحك — لا حاجة للرفع',
        ],
        faq: [
          { q: 'هل يمكنني استخدام نصي الخاص؟', a: 'نعم، اكتب أي نص — اسم، "سري"، تاريخ، إلخ.' },
          { q: 'هل ستغطي العلامة المائية محتوى مهمًا؟', a: 'أنت تتحكم في الشفافية والموضع بحيث يبقى المحتوى تحتها مقروءًا.' },
          { q: 'هل يتم رفع ملفي إلى أي مكان؟', a: 'لا، توضع العلامة المائية محليًا داخل متصفحك.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Extrahiert Daten aus vielen Rechnungen gleichzeitig',
          'Exportiert Ergebnisse als CSV für Ihre Buchhaltungssoftware',
          'KI-gestützt — erfordert ein Konto und einen Plan',
        ],
        faq: [
          { q: 'Wie viele Rechnungen kann ich auf einmal verarbeiten?', a: 'Laden Sie so viele hoch, wie Sie in einem Batch benötigen.' },
          { q: 'Welche Felder werden extrahiert?', a: 'Anbieter, Betrag, Datum und Rechnungsnummer, neben weiteren gängigen Feldern.' },
          { q: 'Ist dieses Tool kostenlos?', a: 'Die KI-Extraktion erfordert ein Konto mit aktivem Plan oder Guthaben.' },
        ],
      },
      fr: {
        features: [
          'Extrait les données de nombreuses factures à la fois',
          'Exporte les résultats en CSV pour votre logiciel de comptabilité',
          'Propulsé par l’IA — nécessite un compte et un forfait',
        ],
        faq: [
          { q: 'Combien de factures puis-je traiter à la fois ?', a: 'Téléversez-en autant que nécessaire en un seul lot.' },
          { q: 'Quels champs sont extraits ?', a: 'Fournisseur, montant, date et numéro de facture, parmi d’autres champs courants.' },
          { q: 'Cet outil est-il gratuit ?', a: 'L’extraction par IA nécessite un compte avec un forfait actif ou des crédits.' },
        ],
      },
      es: {
        features: [
          'Extrae datos de muchas facturas a la vez',
          'Exporta los resultados a CSV para tu software de contabilidad',
          'Con IA — requiere una cuenta y un plan',
        ],
        faq: [
          { q: '¿Cuántas facturas puedo procesar a la vez?', a: 'Sube tantas como necesites en un solo lote.' },
          { q: '¿Qué campos se extraen?', a: 'Proveedor, importe, fecha y número de factura, entre otros campos comunes.' },
          { q: '¿Es gratuita esta herramienta?', a: 'La extracción con IA requiere una cuenta con un plan activo o créditos.' },
        ],
      },
      it: {
        features: [
          'Estrae dati da molte fatture contemporaneamente',
          'Esporta i risultati in CSV per il tuo software di contabilità',
          'Basato su IA — richiede un account e un piano',
        ],
        faq: [
          { q: 'Quante fatture posso elaborare contemporaneamente?', a: 'Carica quante ne servono in un unico batch.' },
          { q: 'Quali campi vengono estratti?', a: 'Fornitore, importo, data e numero fattura, tra gli altri campi comuni.' },
          { q: 'Questo strumento è gratuito?', a: 'L’estrazione con IA richiede un account con un piano attivo o crediti.' },
        ],
      },
      ar: {
        features: [
          'يستخرج البيانات من العديد من الفواتير دفعة واحدة',
          'يصدّر النتائج بصيغة CSV لبرنامج المحاسبة الخاص بك',
          'مدعوم بالذكاء الاصطناعي — يتطلب حسابًا وخطة',
        ],
        faq: [
          { q: 'كم عدد الفواتير التي يمكنني معالجتها دفعة واحدة؟', a: 'ارفع بقدر ما تحتاج في دفعة واحدة.' },
          { q: 'ما الحقول التي يتم استخراجها؟', a: 'المورّد والمبلغ والتاريخ ورقم الفاتورة، من بين حقول شائعة أخرى.' },
          { q: 'هل هذه الأداة مجانية؟', a: 'يتطلب الاستخراج بالذكاء الاصطناعي حسابًا بخطة نشطة أو أرصدة.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Markiert unfaire, unvollständige oder unübliche Klauseln',
          'Erklärt, warum jede markierte Klausel riskant ist',
          'KI-gestützt — erfordert ein Konto und einen Plan',
        ],
        faq: [
          { q: 'Ersetzt dies die Prüfung durch einen Anwalt?', a: 'Nein, es markiert Klauseln, die eine genauere Prüfung verdienen — kein Ersatz für Rechtsberatung.' },
          { q: 'Welche Vertragsarten eignen sich am besten?', a: 'Jeder gängige Geschäftsvertrag — NDAs, Dienstleistungsverträge, Mietverträge und ähnliche.' },
          { q: 'Ist dieses Tool kostenlos?', a: 'Die KI-Analyse erfordert ein Konto mit aktivem Plan oder Guthaben.' },
        ],
      },
      fr: {
        features: [
          'Signale les clauses inéquitables, incomplètes ou non standard',
          'Explique pourquoi chaque clause signalée est risquée',
          'Propulsé par l’IA — nécessite un compte et un forfait',
        ],
        faq: [
          { q: 'Cela remplace-t-il la relecture d’un avocat ?', a: 'Non, cela signale des clauses méritant un examen plus approfondi, ce n’est pas un substitut à un conseil juridique.' },
          { q: 'Quels types de contrats fonctionnent le mieux ?', a: 'Tout contrat commercial standard — NDA, accords de service, baux et similaires.' },
          { q: 'Cet outil est-il gratuit ?', a: 'L’analyse par IA nécessite un compte avec un forfait actif ou des crédits.' },
        ],
      },
      es: {
        features: [
          'Señala cláusulas injustas, incompletas o no estándar',
          'Explica por qué cada cláusula señalada es riesgosa',
          'Con IA — requiere una cuenta y un plan',
        ],
        faq: [
          { q: '¿Esto reemplaza la revisión de un abogado?', a: 'No, señala cláusulas que merecen un examen más detallado, no sustituye el asesoramiento legal.' },
          { q: '¿Qué tipos de contratos funcionan mejor?', a: 'Cualquier contrato comercial estándar — NDA, acuerdos de servicio, arrendamientos y similares.' },
          { q: '¿Es gratuita esta herramienta?', a: 'El análisis con IA requiere una cuenta con un plan activo o créditos.' },
        ],
      },
      it: {
        features: [
          'Segnala clausole ingiuste, incomplete o non standard',
          'Spiega perché ogni clausola segnalata è rischiosa',
          'Basato su IA — richiede un account e un piano',
        ],
        faq: [
          { q: 'Questo sostituisce la revisione di un avvocato?', a: 'No, segnala clausole che meritano un esame più attento, non è un sostituto della consulenza legale.' },
          { q: 'Quali tipi di contratti funzionano meglio?', a: 'Qualsiasi contratto commerciale standard — NDA, accordi di servizio, contratti di locazione e simili.' },
          { q: 'Questo strumento è gratuito?', a: 'L’analisi con IA richiede un account con un piano attivo o crediti.' },
        ],
      },
      ar: {
        features: [
          'يحدد البنود غير العادلة أو غير المكتملة أو غير القياسية',
          'يشرح سبب خطورة كل بند تم تحديده',
          'مدعوم بالذكاء الاصطناعي — يتطلب حسابًا وخطة',
        ],
        faq: [
          { q: 'هل يحل هذا محل مراجعة محامٍ؟', a: 'لا، فهو يحدد البنود التي تستحق نظرة أقرب، وليس بديلاً عن الاستشارة القانونية.' },
          { q: 'ما أنواع العقود التي تعمل بشكل أفضل؟', a: 'أي عقد تجاري قياسي — اتفاقيات عدم الإفصاح، اتفاقيات الخدمة، عقود الإيجار وما شابه.' },
          { q: 'هل هذه الأداة مجانية؟', a: 'يتطلب التحليل بالذكاء الاصطناعي حسابًا بخطة نشطة أو أرصدة.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Verwandelt einen Vertrag in eine für Laien verständliche Zusammenfassung',
          'Hebt wichtige Pflichten und Termine in einfacher Sprache hervor',
          'KI-gestützt — erfordert ein Konto und einen Plan',
        ],
        faq: [
          { q: 'Für wen ist diese Zusammenfassung gedacht?', a: 'Für einen Kunden oder Kollegen ohne juristischen Hintergrund.' },
          { q: 'Deckt sie jede Klausel ab?', a: 'Sie konzentriert sich auf die wichtigsten Bedingungen, nicht auf eine klauselweise Aufschlüsselung.' },
          { q: 'Ist dieses Tool kostenlos?', a: 'Die KI-Zusammenfassung erfordert ein Konto mit aktivem Plan oder Guthaben.' },
        ],
      },
      fr: {
        features: [
          'Transforme un contrat en résumé compréhensible pour un lecteur non juriste',
          'Met en évidence les obligations clés et les dates en langage simple',
          'Propulsé par l’IA — nécessite un compte et un forfait',
        ],
        faq: [
          { q: 'Pour qui ce résumé est-il rédigé ?', a: 'Pour un client ou un collègue sans formation juridique.' },
          { q: 'Couvre-t-il chaque clause ?', a: 'Il se concentre sur les termes les plus importants, pas une analyse clause par clause.' },
          { q: 'Cet outil est-il gratuit ?', a: 'Le résumé par IA nécessite un compte avec un forfait actif ou des crédits.' },
        ],
      },
      es: {
        features: [
          'Convierte un contrato en un resumen que un lector sin formación jurídica puede entender',
          'Destaca las obligaciones clave y las fechas en lenguaje sencillo',
          'Con IA — requiere una cuenta y un plan',
        ],
        faq: [
          { q: '¿Para quién está escrito este resumen?', a: 'Para un cliente o colega sin formación jurídica.' },
          { q: '¿Cubre cada cláusula?', a: 'Se centra en los términos más importantes, no en un desglose cláusula por cláusula.' },
          { q: '¿Es gratuita esta herramienta?', a: 'El resumen con IA requiere una cuenta con un plan activo o créditos.' },
        ],
      },
      it: {
        features: [
          'Trasforma un contratto in un riepilogo comprensibile per un lettore non esperto di diritto',
          'Evidenzia obblighi chiave e date in linguaggio semplice',
          'Basato su IA — richiede un account e un piano',
        ],
        faq: [
          { q: 'Per chi è scritto questo riepilogo?', a: 'Per un cliente o un collega senza background legale.' },
          { q: 'Copre ogni clausola?', a: 'Si concentra sui termini più importanti, non su un’analisi clausola per clausola.' },
          { q: 'Questo strumento è gratuito?', a: 'Il riepilogo con IA richiede un account con un piano attivo o crediti.' },
        ],
      },
      ar: {
        features: [
          'يحوّل العقد إلى ملخص يفهمه القارئ غير المتخصص قانونيًا',
          'يبرز الالتزامات الرئيسية والتواريخ بلغة بسيطة',
          'مدعوم بالذكاء الاصطناعي — يتطلب حسابًا وخطة',
        ],
        faq: [
          { q: 'لمن يُكتب هذا الملخص؟', a: 'لعميل أو زميل بدون خلفية قانونية.' },
          { q: 'هل يغطي كل بند؟', a: 'يركز على أهم الشروط، وليس تحليلاً بندًا ببند.' },
          { q: 'هل هذه الأداة مجانية؟', a: 'يتطلب التلخيص بالذكاء الاصطناعي حسابًا بخطة نشطة أو أرصدة.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Prüft eine NDA hinsichtlich Vertraulichkeitsdauer, Ausnahmen und Umfang',
          'Markiert ungewöhnlich weit gefasste oder fehlende Bedingungen',
          'KI-gestützt — erfordert ein Konto und einen Plan',
        ],
        faq: [
          { q: 'Was prüft die Audit tatsächlich?', a: 'Dauer, Ausnahmen, Umfang der vertraulichen Informationen und andere Standard-NDA-Bedingungen.' },
          { q: 'Funktioniert das bei gegenseitigen und einseitigen NDAs?', a: 'Ja, beide werden unterstützt.' },
          { q: 'Ist dieses Tool kostenlos?', a: 'Die KI-Analyse erfordert ein Konto mit aktivem Plan oder Guthaben.' },
        ],
      },
      fr: {
        features: [
          'Vérifie un NDA en fonction de la durée de confidentialité, des exceptions et de la portée',
          'Signale les termes anormalement larges ou manquants',
          'Propulsé par l’IA — nécessite un compte et un forfait',
        ],
        faq: [
          { q: 'Que vérifie réellement l’audit ?', a: 'La durée, les exceptions, la portée des informations confidentielles et d’autres termes standard des NDA.' },
          { q: 'Cela fonctionne-t-il pour les NDA mutuels et unilatéraux ?', a: 'Oui, les deux sont pris en charge.' },
          { q: 'Cet outil est-il gratuit ?', a: 'L’analyse par IA nécessite un compte avec un forfait actif ou des crédits.' },
        ],
      },
      es: {
        features: [
          'Verifica un NDA según la duración de la confidencialidad, las excepciones y el alcance',
          'Señala términos inusualmente amplios o ausentes',
          'Con IA — requiere una cuenta y un plan',
        ],
        faq: [
          { q: '¿Qué comprueba realmente la auditoría?', a: 'Duración, excepciones, alcance de la información confidencial y otros términos estándar del NDA.' },
          { q: '¿Funciona con NDA mutuos y unilaterales?', a: 'Sí, ambos son compatibles.' },
          { q: '¿Es gratuita esta herramienta?', a: 'El análisis con IA requiere una cuenta con un plan activo o créditos.' },
        ],
      },
      it: {
        features: [
          'Verifica un NDA rispetto a durata della riservatezza, eccezioni e ambito',
          'Segnala termini insolitamente ampi o mancanti',
          'Basato su IA — richiede un account e un piano',
        ],
        faq: [
          { q: 'Cosa verifica effettivamente l’audit?', a: 'Durata, eccezioni, ambito delle informazioni riservate e altri termini standard degli NDA.' },
          { q: 'Funziona per NDA reciproci e unilaterali?', a: 'Sì, entrambi sono supportati.' },
          { q: 'Questo strumento è gratuito?', a: 'L’analisi con IA richiede un account con un piano attivo o crediti.' },
        ],
      },
      ar: {
        features: [
          'يتحقق من اتفاقية عدم الإفصاح من حيث مدة السرية والاستثناءات والنطاق',
          'يحدد الشروط الواسعة بشكل غير معتاد أو المفقودة',
          'مدعوم بالذكاء الاصطناعي — يتطلب حسابًا وخطة',
        ],
        faq: [
          { q: 'ما الذي تتحقق منه المراجعة فعليًا؟', a: 'المدة والاستثناءات ونطاق المعلومات السرية وشروط أخرى قياسية لاتفاقيات عدم الإفصاح.' },
          { q: 'هل يعمل هذا مع اتفاقيات عدم الإفصاح المتبادلة والأحادية؟', a: 'نعم، كلاهما مدعوم.' },
          { q: 'هل هذه الأداة مجانية؟', a: 'يتطلب التحليل بالذكاء الاصطناعي حسابًا بخطة نشطة أو أرصدة.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Erkennt Ausweisnummern und Bankkontonummern, die geschwärzt werden sollten',
          'Markiert sensible Daten, bevor Sie ein Dokument teilen',
          'KI-gestützt — erfordert ein Konto und einen Plan',
        ],
        faq: [
          { q: 'Schwärzt dies das Dokument automatisch?', a: 'Es markiert, was geschwärzt werden sollte — Sie prüfen und wenden die Schwärzungen selbst an.' },
          { q: 'Welche Arten sensibler Daten werden erkannt?', a: 'Ausweisnummern, Bankkontonummern und ähnliche Kennungen.' },
          { q: 'Ist dieses Tool kostenlos?', a: 'Die KI-Erkennung erfordert ein Konto mit aktivem Plan oder Guthaben.' },
        ],
      },
      fr: {
        features: [
          'Détecte les numéros d’identité et de compte bancaire à caviarder',
          'Signale les données sensibles avant de partager un document',
          'Propulsé par l’IA — nécessite un compte et un forfait',
        ],
        faq: [
          { q: 'Cela caviarde-t-il le document automatiquement ?', a: 'Cela signale ce qu’il faut caviarder — vous vérifiez et appliquez vous-même les caviardages.' },
          { q: 'Quels types de données sensibles sont détectés ?', a: 'Numéros d’identité, numéros de compte bancaire et identifiants similaires.' },
          { q: 'Cet outil est-il gratuit ?', a: 'La détection par IA nécessite un compte avec un forfait actif ou des crédits.' },
        ],
      },
      es: {
        features: [
          'Detecta números de identificación y de cuenta bancaria que conviene redactar',
          'Señala datos sensibles antes de compartir un documento',
          'Con IA — requiere una cuenta y un plan',
        ],
        faq: [
          { q: '¿Esto redacta el documento automáticamente?', a: 'Señala qué redactar — tú revisas y aplicas las redacciones.' },
          { q: '¿Qué tipos de datos sensibles se detectan?', a: 'Números de identificación, números de cuenta bancaria e identificadores similares.' },
          { q: '¿Es gratuita esta herramienta?', a: 'La detección con IA requiere una cuenta con un plan activo o créditos.' },
        ],
      },
      it: {
        features: [
          'Rileva numeri di documenti d’identità e conti bancari da oscurare',
          'Segnala dati sensibili prima di condividere un documento',
          'Basato su IA — richiede un account e un piano',
        ],
        faq: [
          { q: 'Questo oscura automaticamente il documento?', a: 'Segnala cosa oscurare — sei tu a rivedere e applicare gli oscuramenti.' },
          { q: 'Che tipi di dati sensibili vengono rilevati?', a: 'Numeri di documenti d’identità, numeri di conto bancario e identificatori simili.' },
          { q: 'Questo strumento è gratuito?', a: 'Il rilevamento con IA richiede un account con un piano attivo o crediti.' },
        ],
      },
      ar: {
        features: [
          'يكتشف أرقام الهوية والحسابات المصرفية الجديرة بالإخفاء',
          'يحدد البيانات الحساسة قبل مشاركة المستند',
          'مدعوم بالذكاء الاصطناعي — يتطلب حسابًا وخطة',
        ],
        faq: [
          { q: 'هل يُخفي هذا المستند تلقائيًا؟', a: 'إنه يحدد ما يجب إخفاؤه — أنت تراجع وتطبق الإخفاء بنفسك.' },
          { q: 'ما أنواع البيانات الحساسة التي يتم اكتشافها؟', a: 'أرقام الهوية وأرقام الحسابات المصرفية ومعرّفات مشابهة.' },
          { q: 'هل هذه الأداة مجانية؟', a: 'يتطلب الاكتشاف بالذكاء الاصطناعي حسابًا بخطة نشطة أو أرصدة.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Markiert denselben Anbieter, Betrag und Datum, die mehrfach vorkommen',
          'Erkennt versehentliche Doppelzahlungen, bevor sie ausgeführt werden',
          'KI-gestützt — erfordert ein Konto und einen Plan',
        ],
        faq: [
          { q: 'Was gilt als Duplikat?', a: 'Übereinstimmender Anbieter, Betrag und Datum innerhalb der hochgeladenen Dokumente.' },
          { q: 'Kann ich mehrere Rechnungen gleichzeitig hochladen?', a: 'Ja, laden Sie einen Batch hoch, und Duplikate werden über alle hinweg markiert.' },
          { q: 'Ist dieses Tool kostenlos?', a: 'Die KI-Erkennung erfordert ein Konto mit aktivem Plan oder Guthaben.' },
        ],
      },
      fr: {
        features: [
          'Signale le même fournisseur, montant et date apparaissant plus d’une fois',
          'Détecte les doubles paiements accidentels avant leur envoi',
          'Propulsé par l’IA — nécessite un compte et un forfait',
        ],
        faq: [
          { q: 'Qu’est-ce qui compte comme un doublon ?', a: 'Fournisseur, montant et date correspondants dans les documents téléversés.' },
          { q: 'Puis-je téléverser plusieurs factures à la fois ?', a: 'Oui, téléversez un lot et les doublons sont signalés sur l’ensemble.' },
          { q: 'Cet outil est-il gratuit ?', a: 'La détection par IA nécessite un compte avec un forfait actif ou des crédits.' },
        ],
      },
      es: {
        features: [
          'Señala el mismo proveedor, importe y fecha que aparecen más de una vez',
          'Detecta pagos duplicados accidentales antes de que se realicen',
          'Con IA — requiere una cuenta y un plan',
        ],
        faq: [
          { q: '¿Qué se considera un duplicado?', a: 'Proveedor, importe y fecha coincidentes dentro de los documentos que subes.' },
          { q: '¿Puedo subir varias facturas a la vez?', a: 'Sí, sube un lote y los duplicados se señalan en todas ellas.' },
          { q: '¿Es gratuita esta herramienta?', a: 'La detección con IA requiere una cuenta con un plan activo o créditos.' },
        ],
      },
      it: {
        features: [
          'Segnala lo stesso fornitore, importo e data che compaiono più di una volta',
          'Individua pagamenti doppi accidentali prima che vengano effettuati',
          'Basato su IA — richiede un account e un piano',
        ],
        faq: [
          { q: 'Cosa conta come duplicato?', a: 'Fornitore, importo e data corrispondenti all’interno dei documenti caricati.' },
          { q: 'Posso caricare più fatture contemporaneamente?', a: 'Sì, carica un batch e i duplicati vengono segnalati su tutte.' },
          { q: 'Questo strumento è gratuito?', a: 'Il rilevamento con IA richiede un account con un piano attivo o crediti.' },
        ],
      },
      ar: {
        features: [
          'يحدد نفس المورّد والمبلغ والتاريخ الذي يظهر أكثر من مرة',
          'يكتشف الدفعات المزدوجة العرضية قبل صرفها',
          'مدعوم بالذكاء الاصطناعي — يتطلب حسابًا وخطة',
        ],
        faq: [
          { q: 'ما الذي يُعد تكرارًا؟', a: 'تطابق المورّد والمبلغ والتاريخ ضمن المستندات التي ترفعها.' },
          { q: 'هل يمكنني رفع عدة فواتير دفعة واحدة؟', a: 'نعم، ارفع دفعة وسيتم تحديد التكرارات عبرها جميعًا.' },
          { q: 'هل هذه الأداة مجانية؟', a: 'يتطلب الاكتشاف بالذكاء الاصطناعي حسابًا بخطة نشطة أو أرصدة.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Extrahiert Liquiditäts- und Rentabilitätskennzahlen aus Finanzberichten',
          'Erklärt jede Kennzahl in einfacher Sprache',
          'KI-gestützt — erfordert ein Konto und einen Plan',
        ],
        faq: [
          { q: 'Welche Kennzahlen werden berechnet?', a: 'Gängige Liquiditäts- und Rentabilitätskennzahlen wie das Current Ratio und die Gewinnmarge.' },
          { q: 'Welche Art von Dokument benötige ich?', a: 'Einen Finanzbericht im PDF-Format — Bilanz oder Gewinn- und Verlustrechnung.' },
          { q: 'Ist dieses Tool kostenlos?', a: 'Die KI-Analyse erfordert ein Konto mit aktivem Plan oder Guthaben.' },
        ],
      },
      fr: {
        features: [
          'Extrait les ratios de liquidité et de rentabilité des états financiers',
          'Explique chaque ratio en langage simple',
          'Propulsé par l’IA — nécessite un compte et un forfait',
        ],
        faq: [
          { q: 'Quels ratios sont calculés ?', a: 'Les ratios courants de liquidité et de rentabilité tels que le ratio de liquidité générale et la marge bénéficiaire.' },
          { q: 'Quel type de document me faut-il ?', a: 'Un état financier au format PDF — bilan ou compte de résultat.' },
          { q: 'Cet outil est-il gratuit ?', a: 'L’analyse par IA nécessite un compte avec un forfait actif ou des crédits.' },
        ],
      },
      es: {
        features: [
          'Extrae ratios de liquidez y rentabilidad de los estados financieros',
          'Explica cada ratio en lenguaje sencillo',
          'Con IA — requiere una cuenta y un plan',
        ],
        faq: [
          { q: '¿Qué ratios se calculan?', a: 'Ratios comunes de liquidez y rentabilidad, como el ratio corriente y el margen de beneficio.' },
          { q: '¿Qué tipo de documento necesito?', a: 'Un estado financiero en formato PDF — balance general o estado de resultados.' },
          { q: '¿Es gratuita esta herramienta?', a: 'El análisis con IA requiere una cuenta con un plan activo o créditos.' },
        ],
      },
      it: {
        features: [
          'Estrae indici di liquidità e redditività dai bilanci',
          'Spiega ogni indice in linguaggio semplice',
          'Basato su IA — richiede un account e un piano',
        ],
        faq: [
          { q: 'Quali indici vengono calcolati?', a: 'Indici comuni di liquidità e redditività come il current ratio e il margine di profitto.' },
          { q: 'Che tipo di documento mi serve?', a: 'Un bilancio in formato PDF — stato patrimoniale o conto economico.' },
          { q: 'Questo strumento è gratuito?', a: 'L’analisi con IA richiede un account con un piano attivo o crediti.' },
        ],
      },
      ar: {
        features: [
          'يستخرج نسب السيولة والربحية من البيانات المالية',
          'يشرح كل نسبة بلغة بسيطة',
          'مدعوم بالذكاء الاصطناعي — يتطلب حسابًا وخطة',
        ],
        faq: [
          { q: 'ما النسب التي يتم حسابها؟', a: 'نسب السيولة والربحية الشائعة مثل النسبة الجارية وهامش الربح.' },
          { q: 'ما نوع المستند الذي أحتاجه؟', a: 'بيان مالي بصيغة PDF — الميزانية العمومية أو بيان الدخل.' },
          { q: 'هل هذه الأداة مجانية؟', a: 'يتطلب التحليل بالذكاء الاصطناعي حسابًا بخطة نشطة أو أرصدة.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Vergleicht einen Kontoauszug mit erfassten Rechnungen',
          'Markiert Unstimmigkeiten automatisch',
          'KI-gestützt — erfordert ein Konto und einen Plan',
        ],
        faq: [
          { q: 'Welche Dokumente benötige ich?', a: 'Einen Kontoauszug und die Rechnungen oder Aufzeichnungen, mit denen Sie abgleichen möchten.' },
          { q: 'Was gilt als Unstimmigkeit?', a: 'Beträge oder Transaktionen in einem Dokument ohne eindeutige Entsprechung im anderen.' },
          { q: 'Ist dieses Tool kostenlos?', a: 'Der KI-Abgleich erfordert ein Konto mit aktivem Plan oder Guthaben.' },
        ],
      },
      fr: {
        features: [
          'Compare un relevé bancaire aux factures enregistrées',
          'Signale automatiquement les écarts',
          'Propulsé par l’IA — nécessite un compte et un forfait',
        ],
        faq: [
          { q: 'Quels documents me faut-il ?', a: 'Un relevé bancaire et les factures ou registres avec lesquels vous souhaitez le rapprocher.' },
          { q: 'Qu’est-ce qui compte comme un écart ?', a: 'Des montants ou transactions dans un document sans correspondance claire dans l’autre.' },
          { q: 'Cet outil est-il gratuit ?', a: 'Le rapprochement par IA nécessite un compte avec un forfait actif ou des crédits.' },
        ],
      },
      es: {
        features: [
          'Compara un extracto bancario con las facturas registradas',
          'Señala discrepancias automáticamente',
          'Con IA — requiere una cuenta y un plan',
        ],
        faq: [
          { q: '¿Qué documentos necesito?', a: 'Un extracto bancario y las facturas o registros con los que quieres conciliarlo.' },
          { q: '¿Qué se considera una discrepancia?', a: 'Importes o transacciones en un documento sin una coincidencia clara en el otro.' },
          { q: '¿Es gratuita esta herramienta?', a: 'La conciliación con IA requiere una cuenta con un plan activo o créditos.' },
        ],
      },
      it: {
        features: [
          'Confronta un estratto conto bancario con le fatture registrate',
          'Segnala automaticamente le discrepanze',
          'Basato su IA — richiede un account e un piano',
        ],
        faq: [
          { q: 'Che documenti mi servono?', a: 'Un estratto conto bancario e le fatture o i registri con cui vuoi riconciliarlo.' },
          { q: 'Cosa conta come discrepanza?', a: 'Importi o transazioni in un documento senza una corrispondenza chiara nell’altro.' },
          { q: 'Questo strumento è gratuito?', a: 'La riconciliazione con IA richiede un account con un piano attivo o crediti.' },
        ],
      },
      ar: {
        features: [
          'يقارن كشف حساب مصرفي بالفواتير المسجلة',
          'يحدد التناقضات تلقائيًا',
          'مدعوم بالذكاء الاصطناعي — يتطلب حسابًا وخطة',
        ],
        faq: [
          { q: 'ما المستندات التي أحتاجها؟', a: 'كشف حساب مصرفي والفواتير أو السجلات التي تريد مطابقتها معه.' },
          { q: 'ما الذي يُعد تناقضًا؟', a: 'مبالغ أو معاملات في مستند دون تطابق واضح في الآخر.' },
          { q: 'هل هذه الأداة مجانية؟', a: 'تتطلب المطابقة بالذكاء الاصطناعي حسابًا بخطة نشطة أو أرصدة.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Hebt wahrscheinlich steuerlich absetzbare Posten nach Kategorie hervor',
          'Funktioniert mit Quittungen, Rechnungen oder Kontoauszügen',
          'KI-gestützt — erfordert ein Konto und einen Plan',
        ],
        faq: [
          { q: 'Ist dies ein Ersatz für einen Steuerberater?', a: 'Nein, es markiert wahrscheinlich absetzbare Posten zur Bestätigung durch Sie, keine Steuerberatung.' },
          { q: 'Welche Kategorien erkennt es?', a: 'Gängige Geschäftsausgabenkategorien wie Reisen, Material und Software.' },
          { q: 'Ist dieses Tool kostenlos?', a: 'Die KI-Analyse erfordert ein Konto mit aktivem Plan oder Guthaben.' },
        ],
      },
      fr: {
        features: [
          'Met en évidence les postes probablement déductibles par catégorie',
          'Fonctionne à partir de reçus, factures ou relevés',
          'Propulsé par l’IA — nécessite un compte et un forfait',
        ],
        faq: [
          { q: 'Est-ce un substitut à un professionnel de la fiscalité ?', a: 'Non, cela signale les postes probablement déductibles pour que vous les confirmiez, ce n’est pas un conseil fiscal.' },
          { q: 'Quelles catégories reconnaît-il ?', a: 'Les catégories de dépenses professionnelles courantes telles que les voyages, les fournitures et les logiciels.' },
          { q: 'Cet outil est-il gratuit ?', a: 'L’analyse par IA nécessite un compte avec un forfait actif ou des crédits.' },
        ],
      },
      es: {
        features: [
          'Destaca las partidas probablemente deducibles de impuestos por categoría',
          'Funciona con recibos, facturas o extractos',
          'Con IA — requiere una cuenta y un plan',
        ],
        faq: [
          { q: '¿Es esto un sustituto de un profesional fiscal?', a: 'No, señala partidas probablemente deducibles para que las confirmes, no es asesoría fiscal.' },
          { q: '¿Qué categorías reconoce?', a: 'Categorías comunes de gastos empresariales como viajes, suministros y software.' },
          { q: '¿Es gratuita esta herramienta?', a: 'El análisis con IA requiere una cuenta con un plan activo o créditos.' },
        ],
      },
      it: {
        features: [
          'Evidenzia le voci probabilmente deducibili per categoria',
          'Funziona con ricevute, fatture o estratti conto',
          'Basato su IA — richiede un account e un piano',
        ],
        faq: [
          { q: 'È un sostituto di un professionista fiscale?', a: 'No, segnala voci probabilmente deducibili da confermare, non è consulenza fiscale.' },
          { q: 'Quali categorie riconosce?', a: 'Categorie comuni di spese aziendali come viaggi, forniture e software.' },
          { q: 'Questo strumento è gratuito?', a: 'L’analisi con IA richiede un account con un piano attivo o crediti.' },
        ],
      },
      ar: {
        features: [
          'يبرز البنود المرجح أنها قابلة للخصم الضريبي حسب الفئة',
          'يعمل من الإيصالات أو الفواتير أو كشوف الحساب',
          'مدعوم بالذكاء الاصطناعي — يتطلب حسابًا وخطة',
        ],
        faq: [
          { q: 'هل هذا بديل عن أخصائي ضرائب؟', a: 'لا، إنه يحدد البنود المرجح خصمها لتؤكدها أنت، وليس استشارة ضريبية.' },
          { q: 'ما الفئات التي يتعرف عليها؟', a: 'فئات نفقات الأعمال الشائعة مثل السفر واللوازم والبرامج.' },
          { q: 'هل هذه الأداة مجانية؟', a: 'يتطلب التحليل بالذكاء الاصطناعي حسابًا بخطة نشطة أو أرصدة.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Vergleicht Methodik und Ergebnisse zweier Arbeiten',
          'KI erklärt, was sich unterscheidet und warum es wichtig ist',
          'KI-gestützt — erfordert ein Konto und einen Plan',
        ],
        faq: [
          { q: 'Müssen beide Arbeiten dasselbe Thema behandeln?', a: 'Es funktioniert am besten, wenn die Arbeiten verwandte Forschungsfragen behandeln.' },
          { q: 'Vergleicht es mehr als zwei Arbeiten gleichzeitig?', a: 'Derzeit vergleicht es zwei Arbeiten pro Durchlauf.' },
          { q: 'Ist dieses Tool kostenlos?', a: 'Der KI-Vergleich erfordert ein Konto mit aktivem Plan oder Guthaben.' },
        ],
      },
      fr: {
        features: [
          'Compare la méthodologie et les résultats de deux articles',
          'L’IA explique ce qui diffère et pourquoi c’est important',
          'Propulsé par l’IA — nécessite un compte et un forfait',
        ],
        faq: [
          { q: 'Les deux articles doivent-ils porter sur le même sujet ?', a: 'Cela fonctionne mieux lorsque les articles abordent des questions de recherche liées.' },
          { q: 'Compare-t-il plus de deux articles à la fois ?', a: 'Actuellement, il compare deux articles par exécution.' },
          { q: 'Cet outil est-il gratuit ?', a: 'La comparaison par IA nécessite un compte avec un forfait actif ou des crédits.' },
        ],
      },
      es: {
        features: [
          'Compara la metodología y los resultados de dos artículos',
          'La IA explica qué difiere y por qué importa',
          'Con IA — requiere una cuenta y un plan',
        ],
        faq: [
          { q: '¿Deben ambos artículos tratar el mismo tema?', a: 'Funciona mejor cuando los artículos abordan preguntas de investigación relacionadas.' },
          { q: '¿Compara más de dos artículos a la vez?', a: 'Actualmente, compara dos artículos por ejecución.' },
          { q: '¿Es gratuita esta herramienta?', a: 'La comparación con IA requiere una cuenta con un plan activo o créditos.' },
        ],
      },
      it: {
        features: [
          'Confronta metodologia e risultati di due articoli',
          'L’IA spiega cosa differisce e perché è importante',
          'Basato su IA — richiede un account e un piano',
        ],
        faq: [
          { q: 'Entrambi gli articoli devono trattare lo stesso argomento?', a: 'Funziona meglio quando gli articoli affrontano domande di ricerca correlate.' },
          { q: 'Confronta più di due articoli alla volta?', a: 'Attualmente confronta due articoli per esecuzione.' },
          { q: 'Questo strumento è gratuito?', a: 'Il confronto con IA richiede un account con un piano attivo o crediti.' },
        ],
      },
      ar: {
        features: [
          'يقارن المنهجية والنتائج بين ورقتين بحثيتين',
          'يشرح الذكاء الاصطناعي ما يختلف ولماذا يهم',
          'مدعوم بالذكاء الاصطناعي — يتطلب حسابًا وخطة',
        ],
        faq: [
          { q: 'هل يجب أن تتناول الورقتان نفس الموضوع؟', a: 'يعمل بشكل أفضل عندما تتناول الورقتان أسئلة بحثية مترابطة.' },
          { q: 'هل يقارن أكثر من ورقتين في المرة الواحدة؟', a: 'حاليًا، يقارن ورقتين لكل تشغيل.' },
          { q: 'هل هذه الأداة مجانية؟', a: 'تتطلب المقارنة بالذكاء الاصطناعي حسابًا بخطة نشطة أو أرصدة.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Fasst die Methodik in einer strukturierten Stichprobe/Werkzeuge/Analyse-Tabelle zusammen',
          'Erleichtert den Vergleich von Methoden zwischen Arbeiten',
          'KI-gestützt — erfordert ein Konto und einen Plan',
        ],
        faq: [
          { q: 'Wie sieht das Ergebnis aus?', a: 'Eine strukturierte Tabelle mit Stichprobe, Werkzeugen und Analyseansatz.' },
          { q: 'Funktioniert das auch für qualitative Forschung?', a: 'Ja, sowohl quantitative als auch qualitative Methodikabschnitte werden unterstützt.' },
          { q: 'Ist dieses Tool kostenlos?', a: 'Die KI-Extraktion erfordert ein Konto mit aktivem Plan oder Guthaben.' },
        ],
      },
      fr: {
        features: [
          'Résume la méthodologie dans un tableau structuré échantillon/outils/analyse',
          'Facilite la comparaison des méthodes entre articles',
          'Propulsé par l’IA — nécessite un compte et un forfait',
        ],
        faq: [
          { q: 'À quoi ressemble le résultat ?', a: 'Un tableau structuré couvrant l’échantillon, les outils et l’approche d’analyse.' },
          { q: 'Cela fonctionne-t-il aussi pour la recherche qualitative ?', a: 'Oui, les sections méthodologiques quantitatives et qualitatives sont prises en charge.' },
          { q: 'Cet outil est-il gratuit ?', a: 'L’extraction par IA nécessite un compte avec un forfait actif ou des crédits.' },
        ],
      },
      es: {
        features: [
          'Resume la metodología en una tabla estructurada de muestra/herramientas/análisis',
          'Facilita la comparación de métodos entre artículos',
          'Con IA — requiere una cuenta y un plan',
        ],
        faq: [
          { q: '¿Cómo es el resultado?', a: 'Una tabla estructurada que cubre la muestra, las herramientas y el enfoque de análisis.' },
          { q: '¿Funciona también para investigación cualitativa?', a: 'Sí, se admiten secciones de metodología tanto cuantitativa como cualitativa.' },
          { q: '¿Es gratuita esta herramienta?', a: 'La extracción con IA requiere una cuenta con un plan activo o créditos.' },
        ],
      },
      it: {
        features: [
          'Riassume la metodologia in una tabella strutturata campione/strumenti/analisi',
          'Facilita il confronto dei metodi tra articoli',
          'Basato su IA — richiede un account e un piano',
        ],
        faq: [
          { q: 'Che aspetto ha il risultato?', a: 'Una tabella strutturata che copre campione, strumenti e approccio di analisi.' },
          { q: 'Funziona anche per la ricerca qualitativa?', a: 'Sì, sono supportate sia le sezioni metodologiche quantitative che qualitative.' },
          { q: 'Questo strumento è gratuito?', a: 'L’estrazione con IA richiede un account con un piano attivo o crediti.' },
        ],
      },
      ar: {
        features: [
          'يلخص المنهجية في جدول منظم للعينة/الأدوات/التحليل',
          'يسهّل مقارنة الأساليب بين الأوراق البحثية',
          'مدعوم بالذكاء الاصطناعي — يتطلب حسابًا وخطة',
        ],
        faq: [
          { q: 'كيف يبدو الناتج؟', a: 'جدول منظم يغطي العينة والأدوات ومنهج التحليل.' },
          { q: 'هل يعمل هذا مع البحث النوعي أيضًا؟', a: 'نعم، تُدعم أقسام المنهجية الكمية والنوعية على حد سواء.' },
          { q: 'هل هذه الأداة مجانية؟', a: 'يتطلب الاستخراج بالذكاء الاصطناعي حسابًا بخطة نشطة أو أرصدة.' },
        ],
      },
    },
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
    translations: {
      de: {
        features: [
          'Verwandelt eine Arbeit in präsentationsfertige Gesprächspunkte',
          'Logisch für den Präsentationsablauf organisiert',
          'KI-gestützt — erfordert ein Konto und einen Plan',
        ],
        faq: [
          { q: 'Werden tatsächliche Folien erstellt?', a: 'Es erstellt die Gesprächspunkte und Struktur — Sie erstellen die Folien.' },
          { q: 'Wie lang ist die resultierende Gliederung?', a: 'Sie skaliert mit der Länge der Arbeit und deckt deren Kernpunkte ab.' },
          { q: 'Ist dieses Tool kostenlos?', a: 'Die KI-Erstellung erfordert ein Konto mit aktivem Plan oder Guthaben.' },
        ],
      },
      fr: {
        features: [
          'Transforme un article en points clés prêts pour des diapositives',
          'Organisé selon un déroulement de présentation logique',
          'Propulsé par l’IA — nécessite un compte et un forfait',
        ],
        faq: [
          { q: 'Cela génère-t-il de vraies diapositives ?', a: 'Cela génère les points clés et la structure — vous construisez les diapositives.' },
          { q: 'Quelle est la longueur du plan résultant ?', a: 'Elle s’adapte à la longueur de l’article, en couvrant ses points clés.' },
          { q: 'Cet outil est-il gratuit ?', a: 'La génération par IA nécessite un compte avec un forfait actif ou des crédits.' },
        ],
      },
      es: {
        features: [
          'Convierte un artículo en puntos clave listos para diapositivas',
          'Organizado en un flujo de presentación lógico',
          'Con IA — requiere una cuenta y un plan',
        ],
        faq: [
          { q: '¿Esto genera diapositivas reales?', a: 'Genera los puntos clave y la estructura — tú construyes las diapositivas.' },
          { q: '¿Cuán largo es el esquema resultante?', a: 'Se ajusta a la extensión del artículo, cubriendo sus puntos clave.' },
          { q: '¿Es gratuita esta herramienta?', a: 'La generación con IA requiere una cuenta con un plan activo o créditos.' },
        ],
      },
      it: {
        features: [
          'Trasforma un articolo in punti chiave pronti per le diapositive',
          'Organizzato in un flusso di presentazione logico',
          'Basato su IA — richiede un account e un piano',
        ],
        faq: [
          { q: 'Questo genera diapositive vere e proprie?', a: 'Genera i punti chiave e la struttura — sei tu a costruire le diapositive.' },
          { q: 'Quanto è lungo lo schema risultante?', a: 'Si adatta alla lunghezza dell’articolo, coprendone i punti chiave.' },
          { q: 'Questo strumento è gratuito?', a: 'La generazione con IA richiede un account con un piano attivo o crediti.' },
        ],
      },
      ar: {
        features: [
          'يحوّل الورقة البحثية إلى نقاط حديث جاهزة للشرائح',
          'منظمة في تسلسل عرض تقديمي منطقي',
          'مدعوم بالذكاء الاصطناعي — يتطلب حسابًا وخطة',
        ],
        faq: [
          { q: 'هل يُنشئ هذا شرائح فعلية؟', a: 'يُنشئ نقاط الحديث والهيكل — أنت من يبني الشرائح.' },
          { q: 'ما طول المخطط الناتج؟', a: 'يتناسب مع طول الورقة البحثية، ويغطي نقاطها الرئيسية.' },
          { q: 'هل هذه الأداة مجانية؟', a: 'يتطلب الإنشاء بالذكاء الاصطناعي حسابًا بخطة نشطة أو أرصدة.' },
        ],
      },
    },
  },
};
