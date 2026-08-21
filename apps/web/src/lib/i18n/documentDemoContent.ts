import type { Locale } from './locales';

export type DemoSegmentKey = 'law' | 'acc' | 'res';

export interface DemoLine {
  html: string;
}

export interface DemoContent {
  tabLabel: string;
  filename: string;
  page: string;
  title: string;
  lines: DemoLine[];
}

export type DocumentDemoContent = Record<DemoSegmentKey, DemoContent>;

// Backs the animated document-preview card in the homepage hero. `lines[].html`
// is rendered via dangerouslySetInnerHTML (see DocumentDemo.tsx) — the
// mark/span markup and class names must stay intact in every translation,
// only the text around/inside them changes.
const en: DocumentDemoContent = {
  law: {
    tabLabel: 'Legal',
    filename: 'Contract_Draft.pdf',
    page: 'p. 3/12',
    title: "Dossiera's Analysis",
    lines: [
      { html: 'Termination clause <mark class="hl">30 days</mark><span class="note">shorter than typical for similar contracts</span>' },
      { html: 'Second party <span class="circ">1</span> not clearly defined on page 2' },
      { html: 'Confidentiality term <mark class="strike">unlimited duration</mark> <mark class="insert">suggest setting a time cap</mark>' },
      { html: 'Ready to compare with <span class="circ">2</span> the previous version' },
    ],
  },
  acc: {
    tabLabel: 'Accounting',
    filename: 'Invoice_Q3.pdf',
    page: 'p. 1/4',
    title: "Dossiera's Analysis",
    lines: [
      { html: 'Total expenses <mark class="hl">$14,230</mark> for August<span class="note">matches bank statement</span>' },
      { html: 'Office rent item <span class="circ">1</span> auto-categorized under "Operational"' },
      { html: 'Recurring charge <mark class="strike">$340</mark> <mark class="insert">flagged as excluded</mark>' },
      { html: 'Ready to export to <span class="circ">2</span> QuickBooks' },
    ],
  },
  res: {
    tabLabel: 'Research',
    filename: 'Research_Paper.pdf',
    page: 'p. 1/22',
    title: "Dossiera's Analysis",
    lines: [
      { html: 'Core hypothesis <mark class="hl">supported by 3 prior studies</mark>' },
      { html: 'Sampling methodology <span class="circ">1</span> noted in section 2.1' },
      { html: 'Incomplete reference <mark class="strike">Smith, 2019</mark> <mark class="insert">full source found</mark>' },
      { html: 'Ready to export <span class="circ">2</span> as BibTeX' },
    ],
  },
};

const de: DocumentDemoContent = {
  law: {
    tabLabel: 'Recht',
    filename: 'Vertragsentwurf.pdf',
    page: 'S. 3/12',
    title: 'Dossieras Analyse',
    lines: [
      { html: 'Kündigungsklausel <mark class="hl">30 Tage</mark><span class="note">kürzer als üblich bei ähnlichen Verträgen</span>' },
      { html: 'Zweite Partei <span class="circ">1</span> auf Seite 2 nicht klar definiert' },
      { html: 'Vertraulichkeitsdauer <mark class="strike">unbegrenzt</mark> <mark class="insert">zeitliche Begrenzung empfohlen</mark>' },
      { html: 'Bereit zum Vergleich mit <span class="circ">2</span> der vorherigen Version' },
    ],
  },
  acc: {
    tabLabel: 'Buchhaltung',
    filename: 'Rechnung_Q3.pdf',
    page: 'S. 1/4',
    title: 'Dossieras Analyse',
    lines: [
      { html: 'Gesamtausgaben <mark class="hl">14.230 $</mark> für August<span class="note">stimmt mit Kontoauszug überein</span>' },
      { html: 'Büromietenposten <span class="circ">1</span> automatisch als „Betrieblich“ eingeordnet' },
      { html: 'Wiederkehrende Belastung <mark class="strike">340 $</mark> <mark class="insert">als ausgeschlossen markiert</mark>' },
      { html: 'Bereit zum Export zu <span class="circ">2</span> QuickBooks' },
    ],
  },
  res: {
    tabLabel: 'Forschung',
    filename: 'Forschungsarbeit.pdf',
    page: 'S. 1/22',
    title: 'Dossieras Analyse',
    lines: [
      { html: 'Kernhypothese <mark class="hl">durch 3 frühere Studien gestützt</mark>' },
      { html: 'Stichprobenmethodik <span class="circ">1</span> in Abschnitt 2.1 vermerkt' },
      { html: 'Unvollständiger Verweis <mark class="strike">Smith, 2019</mark> <mark class="insert">vollständige Quelle gefunden</mark>' },
      { html: 'Bereit zum Export <span class="circ">2</span> als BibTeX' },
    ],
  },
};

const fr: DocumentDemoContent = {
  law: {
    tabLabel: 'Juridique',
    filename: 'Projet_Contrat.pdf',
    page: 'p. 3/12',
    title: 'Analyse de Dossiera',
    lines: [
      { html: 'Clause de résiliation <mark class="hl">30 jours</mark><span class="note">plus courte que la normale pour des contrats similaires</span>' },
      { html: 'Deuxième partie <span class="circ">1</span> non clairement définie à la page 2' },
      { html: 'Durée de confidentialité <mark class="strike">illimitée</mark> <mark class="insert">suggestion d’une limite dans le temps</mark>' },
      { html: 'Prêt à comparer avec <span class="circ">2</span> la version précédente' },
    ],
  },
  acc: {
    tabLabel: 'Comptabilité',
    filename: 'Facture_T3.pdf',
    page: 'p. 1/4',
    title: 'Analyse de Dossiera',
    lines: [
      { html: 'Dépenses totales <mark class="hl">14 230 $</mark> pour août<span class="note">correspond au relevé bancaire</span>' },
      { html: 'Poste loyer de bureau <span class="circ">1</span> catégorisé automatiquement sous « Opérationnel »' },
      { html: 'Charge récurrente <mark class="strike">340 $</mark> <mark class="insert">signalée comme exclue</mark>' },
      { html: 'Prêt à exporter vers <span class="circ">2</span> QuickBooks' },
    ],
  },
  res: {
    tabLabel: 'Recherche',
    filename: 'Article_Recherche.pdf',
    page: 'p. 1/22',
    title: 'Analyse de Dossiera',
    lines: [
      { html: 'Hypothèse principale <mark class="hl">confirmée par 3 études antérieures</mark>' },
      { html: 'Méthodologie d’échantillonnage <span class="circ">1</span> notée à la section 2.1' },
      { html: 'Référence incomplète <mark class="strike">Smith, 2019</mark> <mark class="insert">source complète trouvée</mark>' },
      { html: 'Prêt à exporter <span class="circ">2</span> au format BibTeX' },
    ],
  },
};

const es: DocumentDemoContent = {
  law: {
    tabLabel: 'Legal',
    filename: 'Borrador_Contrato.pdf',
    page: 'p. 3/12',
    title: 'Análisis de Dossiera',
    lines: [
      { html: 'Cláusula de rescisión <mark class="hl">30 días</mark><span class="note">más corta de lo habitual para contratos similares</span>' },
      { html: 'La segunda parte <span class="circ">1</span> no está claramente definida en la página 2' },
      { html: 'Duración de confidencialidad <mark class="strike">indefinida</mark> <mark class="insert">se sugiere establecer un límite de tiempo</mark>' },
      { html: 'Listo para comparar con <span class="circ">2</span> la versión anterior' },
    ],
  },
  acc: {
    tabLabel: 'Contabilidad',
    filename: 'Factura_T3.pdf',
    page: 'p. 1/4',
    title: 'Análisis de Dossiera',
    lines: [
      { html: 'Gastos totales <mark class="hl">$14,230</mark> en agosto<span class="note">coincide con el estado de cuenta bancario</span>' },
      { html: 'Partida de alquiler de oficina <span class="circ">1</span> categorizada automáticamente como "Operativo"' },
      { html: 'Cargo recurrente <mark class="strike">$340</mark> <mark class="insert">marcado como excluido</mark>' },
      { html: 'Listo para exportar a <span class="circ">2</span> QuickBooks' },
    ],
  },
  res: {
    tabLabel: 'Investigación',
    filename: 'Articulo_Investigacion.pdf',
    page: 'p. 1/22',
    title: 'Análisis de Dossiera',
    lines: [
      { html: 'Hipótesis principal <mark class="hl">respaldada por 3 estudios previos</mark>' },
      { html: 'Metodología de muestreo <span class="circ">1</span> señalada en la sección 2.1' },
      { html: 'Referencia incompleta <mark class="strike">Smith, 2019</mark> <mark class="insert">fuente completa encontrada</mark>' },
      { html: 'Listo para exportar <span class="circ">2</span> como BibTeX' },
    ],
  },
};

const it: DocumentDemoContent = {
  law: {
    tabLabel: 'Legale',
    filename: 'Bozza_Contratto.pdf',
    page: 'p. 3/12',
    title: 'Analisi di Dossiera',
    lines: [
      { html: 'Clausola di recesso <mark class="hl">30 giorni</mark><span class="note">più breve del solito per contratti simili</span>' },
      { html: 'La seconda parte <span class="circ">1</span> non è chiaramente definita a pagina 2' },
      { html: 'Durata di riservatezza <mark class="strike">illimitata</mark> <mark class="insert">si consiglia un limite di tempo</mark>' },
      { html: 'Pronto per il confronto con <span class="circ">2</span> la versione precedente' },
    ],
  },
  acc: {
    tabLabel: 'Contabilità',
    filename: 'Fattura_T3.pdf',
    page: 'p. 1/4',
    title: 'Analisi di Dossiera',
    lines: [
      { html: 'Spese totali <mark class="hl">14.230 $</mark> per agosto<span class="note">corrisponde all’estratto conto bancario</span>' },
      { html: 'Voce affitto ufficio <span class="circ">1</span> categorizzata automaticamente come "Operativo"' },
      { html: 'Addebito ricorrente <mark class="strike">340 $</mark> <mark class="insert">contrassegnato come escluso</mark>' },
      { html: 'Pronto per l’esportazione su <span class="circ">2</span> QuickBooks' },
    ],
  },
  res: {
    tabLabel: 'Ricerca',
    filename: 'Articolo_Ricerca.pdf',
    page: 'p. 1/22',
    title: 'Analisi di Dossiera',
    lines: [
      { html: 'Ipotesi principale <mark class="hl">supportata da 3 studi precedenti</mark>' },
      { html: 'Metodologia di campionamento <span class="circ">1</span> indicata nella sezione 2.1' },
      { html: 'Riferimento incompleto <mark class="strike">Smith, 2019</mark> <mark class="insert">fonte completa trovata</mark>' },
      { html: 'Pronto per l’esportazione <span class="circ">2</span> in formato BibTeX' },
    ],
  },
};

const ar: DocumentDemoContent = {
  law: {
    tabLabel: 'قانوني',
    filename: 'مسودة_العقد.pdf',
    page: 'ص. 3/12',
    title: 'تحليل Dossiera',
    lines: [
      { html: 'بند الإنهاء <mark class="hl">30 يومًا</mark><span class="note">أقصر من المعتاد للعقود المماثلة</span>' },
      { html: 'الطرف الثاني <span class="circ">1</span> غير محدد بوضوح في الصفحة 2' },
      { html: 'مدة السرية <mark class="strike">غير محدودة</mark> <mark class="insert">يُقترح تحديد سقف زمني</mark>' },
      { html: 'جاهز للمقارنة مع <span class="circ">2</span> النسخة السابقة' },
    ],
  },
  acc: {
    tabLabel: 'محاسبة',
    filename: 'فاتورة_الربع3.pdf',
    page: 'ص. 1/4',
    title: 'تحليل Dossiera',
    lines: [
      { html: 'إجمالي المصاريف <mark class="hl">14,230$</mark> لشهر أغسطس<span class="note">يطابق كشف الحساب البنكي</span>' },
      { html: 'بند إيجار المكتب <span class="circ">1</span> مصنّف تلقائيًا ضمن "التشغيلية"' },
      { html: 'رسوم متكررة <mark class="strike">340$</mark> <mark class="insert">مُعلّمة كمستبعدة</mark>' },
      { html: 'جاهز للتصدير إلى <span class="circ">2</span> QuickBooks' },
    ],
  },
  res: {
    tabLabel: 'بحث',
    filename: 'ورقة_بحثية.pdf',
    page: 'ص. 1/22',
    title: 'تحليل Dossiera',
    lines: [
      { html: 'الفرضية الأساسية <mark class="hl">مدعومة بثلاث دراسات سابقة</mark>' },
      { html: 'منهجية أخذ العينات <span class="circ">1</span> مذكورة في القسم 2.1' },
      { html: 'مرجع غير مكتمل <mark class="strike">Smith, 2019</mark> <mark class="insert">تم العثور على المصدر الكامل</mark>' },
      { html: 'جاهز للتصدير <span class="circ">2</span> بصيغة BibTeX' },
    ],
  },
};

const DOCUMENT_DEMO_CONTENT: Record<Locale, DocumentDemoContent> = { en, de, fr, es, it, ar };

export function getDocumentDemoContent(locale: Locale): DocumentDemoContent {
  return DOCUMENT_DEMO_CONTENT[locale] ?? DOCUMENT_DEMO_CONTENT.en;
}
