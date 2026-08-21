import type { Locale } from './locales';

export interface HeroContent {
  eyebrow: string;
  headingLine1: string;
  headingLine2: string;
  subtext: string;
  ctaPrimary: string;
  ctaSecondary: string;
  bullets: [string, string, string, string];
  builtForTagline: string;
}

export interface WorkspaceItemContent {
  eyebrow: string;
  title: string;
  description: string;
  features: [string, string, string];
  seeAllPrefix: string;
}

export interface WorkspacesContent {
  kicker: string;
  heading: string;
  subheading: string;
  items: [WorkspaceItemContent, WorkspaceItemContent, WorkspaceItemContent];
}

export interface HowItWorksContent {
  kicker: string;
  heading: string;
  steps: [{ title: string; body: string }, { title: string; body: string }, { title: string; body: string }];
}

export interface TrustContent {
  heading: string;
  items: [{ title: string; body: string }, { title: string; body: string }, { title: string; body: string }];
  gdprBadge: string;
  tlsBadge: string;
}

export interface FaqContent {
  kicker: string;
  heading: string;
  items: [
    { q: string; a: string },
    { q: string; a: string },
    { q: string; a: string },
    { q: string; a: string },
    { q: string; a: string },
  ];
}

export interface ClosingCtaContent {
  heading: string;
  paragraph1: string;
  paragraph2: string;
  cta: string;
}

export interface HomeContent {
  hero: HeroContent;
  workspaces: WorkspacesContent;
  howItWorks: HowItWorksContent;
  trust: TrustContent;
  faq: FaqContent;
  closingCta: ClosingCtaContent;
}

const en: HomeContent = {
  hero: {
    eyebrow: 'AI-Powered PDF Platform',
    headingLine1: 'Your documents speak.',
    headingLine2: 'You just listen.',
    subtext:
      'Professional PDF tools built for three different worlds — contracts, invoices, and research papers. Dossiera understands what each one means to an expert in that field.',
    ctaPrimary: 'Try Free Now',
    ctaSecondary: 'See How It Works',
    bullets: ['⬤ Auto-delete within an hour', '⬤ Local processing in your browser', '⬤ No training on your data', '◆ Core tools free, forever — no AI features needed to get started'],
    builtForTagline: 'Built for how legal, accounting, and research teams actually review documents',
  },
  workspaces: {
    kicker: 'Purpose-Built Workspaces',
    heading: 'One engine, three ways of working',
    subheading:
      'Same underlying quality, wrapped in a completely different flow for each profession — reviewing a contract has nothing to do with reviewing an invoice or a research paper.',
    items: [
      {
        eyebrow: 'Legal',
        title: 'For Lawyers & Firms',
        description: 'Compare two versions of a contract, spot unusual clauses, and pull out obligations and dates automatically.',
        features: ['Contract comparison (redline)', 'Non-standard clause detection', 'Semantic search across your contract library'],
        seeAllPrefix: 'See all',
      },
      {
        eyebrow: 'Accounting',
        title: 'For Accountants & Small Business',
        description: 'Turn invoices and statements into clean, structured data ready to export in minutes.',
        features: ['High-accuracy data extraction', 'Automatic expense categorization', 'Ready export to QuickBooks/Xero'],
        seeAllPrefix: 'See all',
      },
      {
        eyebrow: 'Research',
        title: 'For Researchers & Grad Students',
        description: 'Chat with any research paper, summarize it your way, and pull a citation-ready reference list.',
        features: ['Chat with the paper', 'BibTeX / APA reference export', 'Searchable personal research library'],
        seeAllPrefix: 'See all',
      },
    ],
  },
  howItWorks: {
    kicker: 'How It Works',
    heading: 'Three steps, not thirty',
    steps: [
      { title: 'Upload', body: 'Drop a file or pick one from your library — no setup required.' },
      { title: 'AI analyzes it', body: 'Understood the way a professional in your field would read it.' },
      { title: 'Download or export', body: 'As a file, a summary, or straight into QuickBooks/Xero.' },
    ],
  },
  trust: {
    heading: "Privacy isn't a feature. It's the foundation.",
    items: [
      { title: 'Local processing by default', body: 'Simple operations run entirely inside your browser — no upload to any server.' },
      { title: 'Strict auto-deletion', body: 'Anything that does need server-side processing is deleted permanently within one hour of completion.' },
      { title: 'No training on your data', body: 'Your document content is never used to train any AI model, ever.' },
    ],
    gdprBadge: '🛡 GDPR-aligned',
    tlsBadge: '🔒 TLS encrypted',
  },
  faq: {
    kicker: 'Common Questions',
    heading: 'Before you ask',
    items: [
      {
        q: 'Is my data safe?',
        a: 'Yes. Simple tools run entirely in your browser and never touch our servers. Anything that does need server-side processing — AI analysis, OCR, conversions — is deleted permanently within one hour of completion, and your documents are never used to train any AI model.',
      },
      {
        q: 'Do I need a credit card to start?',
        a: 'No. Merge, split, rotate, and compress are free forever with no account and no card required. You only pay once you want AI-powered analysis, chat, or comparisons.',
      },
      {
        q: 'What happens to my files after 24 hours?',
        a: 'Files saved to a Library project are automatically and permanently deleted after 24 hours, unless you extend that project’s retention to 7 or 30 days from its options menu.',
      },
      {
        q: 'Which plan is right for me?',
        a: 'Choose the workspace that matches your work — Legal, Accounting, or Research — at signup (this is permanent), then pick weekly, monthly, quarterly, or yearly billing. You can change your billing cycle anytime from your dashboard.',
      },
      {
        q: 'Can I cancel anytime?',
        a: 'Yes, anytime from your account settings. You keep access through the end of your current billing period, and no cancellation fee applies.',
      },
    ],
  },
  closingCta: {
    heading: 'Start with one document, see the difference for yourself',
    paragraph1: 'No credit card, no long signup — try the workspace built for your profession right now.',
    paragraph2: 'Free forever for merge, split, compress & rotate. Paid plans unlock AI analysis, chat, and comparisons.',
    cta: 'Try Dossiera Free',
  },
};

const de: HomeContent = {
  hero: {
    eyebrow: 'KI-gestützte PDF-Plattform',
    headingLine1: 'Ihre Dokumente sprechen.',
    headingLine2: 'Sie hören einfach zu.',
    subtext:
      'Professionelle PDF-Werkzeuge für drei unterschiedliche Welten — Verträge, Rechnungen und Forschungsarbeiten. Dossiera versteht, was jedes davon für eine Fachperson bedeutet.',
    ctaPrimary: 'Jetzt kostenlos testen',
    ctaSecondary: 'So funktioniert es',
    bullets: ['⬤ Automatische Löschung innerhalb einer Stunde', '⬤ Lokale Verarbeitung in Ihrem Browser', '⬤ Kein Training mit Ihren Daten', '◆ Kernfunktionen für immer kostenlos — kein KI-Feature zum Start nötig'],
    builtForTagline: 'Entwickelt danach, wie Recht-, Buchhaltungs- und Forschungsteams Dokumente wirklich prüfen',
  },
  workspaces: {
    kicker: 'Maßgeschneiderte Arbeitsbereiche',
    heading: 'Eine Engine, drei Arbeitsweisen',
    subheading:
      'Gleiche zugrunde liegende Qualität, verpackt in einen völlig anderen Ablauf für jeden Beruf — einen Vertrag zu prüfen hat nichts mit einer Rechnung oder einer Forschungsarbeit zu tun.',
    items: [
      {
        eyebrow: 'Recht',
        title: 'Für Anwälte & Kanzleien',
        description: 'Vergleichen Sie zwei Vertragsversionen, erkennen Sie ungewöhnliche Klauseln und extrahieren Sie automatisch Pflichten und Fristen.',
        features: ['Vertragsvergleich (Redline)', 'Erkennung untypischer Klauseln', 'Semantische Suche in Ihrer Vertragsbibliothek'],
        seeAllPrefix: 'Alle',
      },
      {
        eyebrow: 'Buchhaltung',
        title: 'Für Buchhalter & Kleinunternehmen',
        description: 'Verwandeln Sie Rechnungen und Kontoauszüge in Minuten in saubere, strukturierte Daten.',
        features: ['Hochpräzise Datenextraktion', 'Automatische Ausgabenkategorisierung', 'Export bereit für QuickBooks/Xero'],
        seeAllPrefix: 'Alle',
      },
      {
        eyebrow: 'Forschung',
        title: 'Für Forschende & Studierende',
        description: 'Chatten Sie mit jeder Forschungsarbeit, fassen Sie sie auf Ihre Weise zusammen und erstellen Sie eine zitierfertige Literaturliste.',
        features: ['Chat mit dem Paper', 'BibTeX-/APA-Referenzexport', 'Durchsuchbare persönliche Forschungsbibliothek'],
        seeAllPrefix: 'Alle',
      },
    ],
  },
  howItWorks: {
    kicker: 'So funktioniert es',
    heading: 'Drei Schritte, nicht dreißig',
    steps: [
      { title: 'Hochladen', body: 'Datei ablegen oder aus Ihrer Bibliothek wählen — keine Einrichtung nötig.' },
      { title: 'KI analysiert', body: 'Verstanden, wie eine Fachperson in Ihrem Bereich es lesen würde.' },
      { title: 'Herunterladen oder exportieren', body: 'Als Datei, Zusammenfassung oder direkt zu QuickBooks/Xero.' },
    ],
  },
  trust: {
    heading: 'Datenschutz ist kein Feature. Er ist das Fundament.',
    items: [
      { title: 'Standardmäßig lokale Verarbeitung', body: 'Einfache Vorgänge laufen komplett in Ihrem Browser — kein Upload zu einem Server.' },
      { title: 'Strikte automatische Löschung', body: 'Alles, was serverseitige Verarbeitung benötigt, wird innerhalb einer Stunde nach Abschluss dauerhaft gelöscht.' },
      { title: 'Kein Training mit Ihren Daten', body: 'Ihre Dokumentinhalte werden niemals zum Training eines KI-Modells verwendet.' },
    ],
    gdprBadge: '🛡 DSGVO-konform',
    tlsBadge: '🔒 TLS-verschlüsselt',
  },
  faq: {
    kicker: 'Häufige Fragen',
    heading: 'Bevor Sie fragen',
    items: [
      {
        q: 'Sind meine Daten sicher?',
        a: 'Ja. Einfache Werkzeuge laufen komplett in Ihrem Browser und berühren nie unsere Server. Alles, was serverseitige Verarbeitung braucht — KI-Analyse, OCR, Konvertierungen — wird innerhalb einer Stunde nach Abschluss dauerhaft gelöscht, und Ihre Dokumente werden nie zum Training eines KI-Modells verwendet.',
      },
      {
        q: 'Brauche ich eine Kreditkarte zum Start?',
        a: 'Nein. Zusammenführen, Teilen, Drehen und Komprimieren sind für immer kostenlos, ohne Konto und ohne Karte. Sie zahlen erst, wenn Sie KI-gestützte Analyse, Chat oder Vergleiche nutzen möchten.',
      },
      {
        q: 'Was passiert mit meinen Dateien nach 24 Stunden?',
        a: 'In einem Bibliotheksprojekt gespeicherte Dateien werden nach 24 Stunden automatisch und dauerhaft gelöscht, sofern Sie die Aufbewahrung dieses Projekts nicht über das Optionsmenü auf 7 oder 30 Tage verlängern.',
      },
      {
        q: 'Welcher Plan passt zu mir?',
        a: 'Wählen Sie bei der Anmeldung den zu Ihrer Arbeit passenden Arbeitsbereich — Recht, Buchhaltung oder Forschung (dauerhaft) — und dann wöchentliche, monatliche, vierteljährliche oder jährliche Abrechnung. Sie können Ihren Abrechnungszyklus jederzeit im Dashboard ändern.',
      },
      {
        q: 'Kann ich jederzeit kündigen?',
        a: 'Ja, jederzeit über Ihre Kontoeinstellungen. Sie behalten den Zugriff bis zum Ende Ihres aktuellen Abrechnungszeitraums, und es fallen keine Kündigungsgebühren an.',
      },
    ],
  },
  closingCta: {
    heading: 'Starten Sie mit einem Dokument und überzeugen Sie sich selbst',
    paragraph1: 'Keine Kreditkarte, keine lange Anmeldung — testen Sie jetzt den auf Ihren Beruf zugeschnittenen Arbeitsbereich.',
    paragraph2: 'Für immer kostenlos für Zusammenführen, Teilen, Komprimieren & Drehen. Bezahlpläne schalten KI-Analyse, Chat und Vergleiche frei.',
    cta: 'Dossiera kostenlos testen',
  },
};

const fr: HomeContent = {
  hero: {
    eyebrow: 'Plateforme PDF propulsée par l’IA',
    headingLine1: 'Vos documents parlent.',
    headingLine2: 'Vous n’avez qu’à écouter.',
    subtext:
      'Des outils PDF professionnels conçus pour trois univers différents — contrats, factures et articles de recherche. Dossiera comprend ce que chacun signifie pour un expert du domaine.',
    ctaPrimary: 'Essayer gratuitement',
    ctaSecondary: 'Voir comment ça marche',
    bullets: ['⬤ Suppression automatique en moins d’une heure', '⬤ Traitement local dans votre navigateur', '⬤ Aucun entraînement sur vos données', '◆ Outils de base gratuits pour toujours — aucune fonctionnalité IA requise pour commencer'],
    builtForTagline: 'Conçu selon la façon dont les équipes juridiques, comptables et de recherche examinent vraiment les documents',
  },
  workspaces: {
    kicker: 'Espaces de travail sur mesure',
    heading: 'Un seul moteur, trois façons de travailler',
    subheading:
      'Même qualité sous-jacente, intégrée dans un flux complètement différent pour chaque métier — examiner un contrat n’a rien à voir avec examiner une facture ou un article de recherche.',
    items: [
      {
        eyebrow: 'Juridique',
        title: 'Pour avocats & cabinets',
        description: 'Comparez deux versions d’un contrat, repérez les clauses inhabituelles et extrayez automatiquement obligations et dates.',
        features: ['Comparaison de contrats (redline)', 'Détection de clauses non standard', 'Recherche sémantique dans votre bibliothèque de contrats'],
        seeAllPrefix: 'Voir tous les',
      },
      {
        eyebrow: 'Comptabilité',
        title: 'Pour comptables & petites entreprises',
        description: 'Transformez factures et relevés en données propres et structurées, prêtes à exporter en quelques minutes.',
        features: ['Extraction de données haute précision', 'Catégorisation automatique des dépenses', 'Export prêt pour QuickBooks/Xero'],
        seeAllPrefix: 'Voir tous les',
      },
      {
        eyebrow: 'Recherche',
        title: 'Pour chercheurs & doctorants',
        description: 'Discutez avec n’importe quel article de recherche, résumez-le à votre façon et extrayez une liste de références prête à citer.',
        features: ['Discuter avec l’article', 'Export de références BibTeX / APA', 'Bibliothèque de recherche personnelle consultable'],
        seeAllPrefix: 'Voir tous les',
      },
    ],
  },
  howItWorks: {
    kicker: 'Comment ça marche',
    heading: 'Trois étapes, pas trente',
    steps: [
      { title: 'Téléverser', body: 'Déposez un fichier ou choisissez-en un dans votre bibliothèque — aucune configuration requise.' },
      { title: 'L’IA l’analyse', body: 'Compris comme le lirait un professionnel de votre domaine.' },
      { title: 'Télécharger ou exporter', body: 'Sous forme de fichier, de résumé, ou directement vers QuickBooks/Xero.' },
    ],
  },
  trust: {
    heading: 'La confidentialité n’est pas une fonctionnalité. C’est le fondement.',
    items: [
      { title: 'Traitement local par défaut', body: 'Les opérations simples s’exécutent entièrement dans votre navigateur — aucun envoi à un serveur.' },
      { title: 'Suppression automatique stricte', body: 'Tout ce qui nécessite un traitement côté serveur est supprimé définitivement dans l’heure suivant la fin du traitement.' },
      { title: 'Aucun entraînement sur vos données', body: 'Le contenu de vos documents n’est jamais utilisé pour entraîner un modèle d’IA.' },
    ],
    gdprBadge: '🛡 Conforme RGPD',
    tlsBadge: '🔒 Chiffré TLS',
  },
  faq: {
    kicker: 'Questions fréquentes',
    heading: 'Avant de demander',
    items: [
      {
        q: 'Mes données sont-elles en sécurité ?',
        a: 'Oui. Les outils simples s’exécutent entièrement dans votre navigateur et ne touchent jamais nos serveurs. Tout ce qui nécessite un traitement côté serveur — analyse IA, OCR, conversions — est supprimé définitivement dans l’heure suivant la fin du traitement, et vos documents ne sont jamais utilisés pour entraîner un modèle d’IA.',
      },
      {
        q: 'Ai-je besoin d’une carte bancaire pour commencer ?',
        a: 'Non. Fusionner, diviser, faire pivoter et compresser sont gratuits pour toujours, sans compte ni carte. Vous ne payez que lorsque vous souhaitez une analyse IA, un chat ou des comparaisons.',
      },
      {
        q: 'Que deviennent mes fichiers après 24 heures ?',
        a: 'Les fichiers enregistrés dans un projet de la bibliothèque sont automatiquement et définitivement supprimés après 24 heures, sauf si vous prolongez la conservation de ce projet à 7 ou 30 jours depuis son menu d’options.',
      },
      {
        q: 'Quel forfait me convient ?',
        a: 'Choisissez l’espace de travail correspondant à votre métier — Juridique, Comptabilité ou Recherche — lors de l’inscription (permanent), puis choisissez une facturation hebdomadaire, mensuelle, trimestrielle ou annuelle. Vous pouvez changer de cycle de facturation à tout moment depuis votre tableau de bord.',
      },
      {
        q: 'Puis-je annuler à tout moment ?',
        a: 'Oui, à tout moment depuis les paramètres de votre compte. Vous conservez l’accès jusqu’à la fin de votre période de facturation en cours, et aucun frais d’annulation ne s’applique.',
      },
    ],
  },
  closingCta: {
    heading: 'Commencez avec un seul document, constatez la différence par vous-même',
    paragraph1: 'Pas de carte bancaire, pas d’inscription longue — essayez dès maintenant l’espace de travail conçu pour votre métier.',
    paragraph2: 'Gratuit pour toujours pour fusionner, diviser, compresser & pivoter. Les forfaits payants débloquent l’analyse IA, le chat et les comparaisons.',
    cta: 'Essayer Dossiera gratuitement',
  },
};

const es: HomeContent = {
  hero: {
    eyebrow: 'Plataforma de PDF con IA',
    headingLine1: 'Tus documentos hablan.',
    headingLine2: 'Tú solo escuchas.',
    subtext:
      'Herramientas PDF profesionales creadas para tres mundos distintos: contratos, facturas y artículos de investigación. Dossiera entiende lo que cada uno significa para un experto en ese campo.',
    ctaPrimary: 'Probar gratis ahora',
    ctaSecondary: 'Ver cómo funciona',
    bullets: ['⬤ Eliminación automática en menos de una hora', '⬤ Procesamiento local en tu navegador', '⬤ Sin entrenamiento con tus datos', '◆ Herramientas básicas gratis para siempre — no necesitas funciones de IA para empezar'],
    builtForTagline: 'Diseñado según cómo los equipos legales, contables y de investigación realmente revisan documentos',
  },
  workspaces: {
    kicker: 'Espacios de trabajo a medida',
    heading: 'Un motor, tres formas de trabajar',
    subheading:
      'La misma calidad subyacente, envuelta en un flujo completamente distinto para cada profesión — revisar un contrato no tiene nada que ver con revisar una factura o un artículo de investigación.',
    items: [
      {
        eyebrow: 'Legal',
        title: 'Para abogados y despachos',
        description: 'Compara dos versiones de un contrato, detecta cláusulas inusuales y extrae automáticamente obligaciones y fechas.',
        features: ['Comparación de contratos (redline)', 'Detección de cláusulas no estándar', 'Búsqueda semántica en tu biblioteca de contratos'],
        seeAllPrefix: 'Ver todas las',
      },
      {
        eyebrow: 'Contabilidad',
        title: 'Para contadores y pequeñas empresas',
        description: 'Convierte facturas y estados de cuenta en datos limpios y estructurados, listos para exportar en minutos.',
        features: ['Extracción de datos de alta precisión', 'Categorización automática de gastos', 'Exportación lista para QuickBooks/Xero'],
        seeAllPrefix: 'Ver todas las',
      },
      {
        eyebrow: 'Investigación',
        title: 'Para investigadores y estudiantes de posgrado',
        description: 'Chatea con cualquier artículo de investigación, resúmelo a tu manera y extrae una lista de referencias lista para citar.',
        features: ['Chatea con el artículo', 'Exportación de referencias BibTeX / APA', 'Biblioteca de investigación personal con búsqueda'],
        seeAllPrefix: 'Ver todas las',
      },
    ],
  },
  howItWorks: {
    kicker: 'Cómo funciona',
    heading: 'Tres pasos, no treinta',
    steps: [
      { title: 'Sube tu archivo', body: 'Suelta un archivo o elige uno de tu biblioteca — no requiere configuración.' },
      { title: 'La IA lo analiza', body: 'Entendido como lo leería un profesional de tu campo.' },
      { title: 'Descarga o exporta', body: 'Como archivo, resumen, o directo a QuickBooks/Xero.' },
    ],
  },
  trust: {
    heading: 'La privacidad no es una función. Es el fundamento.',
    items: [
      { title: 'Procesamiento local por defecto', body: 'Las operaciones simples se ejecutan completamente en tu navegador — sin subir nada a ningún servidor.' },
      { title: 'Eliminación automática estricta', body: 'Todo lo que requiera procesamiento en el servidor se elimina permanentemente dentro de la hora siguiente a su finalización.' },
      { title: 'Sin entrenamiento con tus datos', body: 'El contenido de tus documentos nunca se usa para entrenar ningún modelo de IA.' },
    ],
    gdprBadge: '🛡 Conforme al RGPD',
    tlsBadge: '🔒 Cifrado TLS',
  },
  faq: {
    kicker: 'Preguntas frecuentes',
    heading: 'Antes de preguntar',
    items: [
      {
        q: '¿Están seguros mis datos?',
        a: 'Sí. Las herramientas simples se ejecutan completamente en tu navegador y nunca tocan nuestros servidores. Todo lo que necesite procesamiento en el servidor — análisis de IA, OCR, conversiones — se elimina permanentemente dentro de la hora siguiente a su finalización, y tus documentos nunca se usan para entrenar ningún modelo de IA.',
      },
      {
        q: '¿Necesito una tarjeta de crédito para empezar?',
        a: 'No. Combinar, dividir, rotar y comprimir son gratis para siempre, sin cuenta ni tarjeta. Solo pagas cuando quieras análisis con IA, chat o comparaciones.',
      },
      {
        q: '¿Qué pasa con mis archivos después de 24 horas?',
        a: 'Los archivos guardados en un proyecto de la biblioteca se eliminan automática y permanentemente después de 24 horas, a menos que extiendas la retención de ese proyecto a 7 o 30 días desde su menú de opciones.',
      },
      {
        q: '¿Qué plan es el adecuado para mí?',
        a: 'Elige el espacio de trabajo que corresponda a tu profesión — Legal, Contabilidad o Investigación — al registrarte (esto es permanente), y luego elige facturación semanal, mensual, trimestral o anual. Puedes cambiar tu ciclo de facturación en cualquier momento desde tu panel.',
      },
      {
        q: '¿Puedo cancelar en cualquier momento?',
        a: 'Sí, en cualquier momento desde la configuración de tu cuenta. Conservas el acceso hasta el final de tu período de facturación actual, y no se aplica ninguna tarifa de cancelación.',
      },
    ],
  },
  closingCta: {
    heading: 'Empieza con un documento y comprueba la diferencia tú mismo',
    paragraph1: 'Sin tarjeta de crédito, sin registro largo — prueba ahora mismo el espacio de trabajo creado para tu profesión.',
    paragraph2: 'Gratis para siempre para combinar, dividir, comprimir y rotar. Los planes de pago desbloquean análisis con IA, chat y comparaciones.',
    cta: 'Probar Dossiera gratis',
  },
};

const it: HomeContent = {
  hero: {
    eyebrow: 'Piattaforma PDF basata su IA',
    headingLine1: 'I tuoi documenti parlano.',
    headingLine2: 'Tu devi solo ascoltare.',
    subtext:
      'Strumenti PDF professionali pensati per tre mondi diversi — contratti, fatture e articoli di ricerca. Dossiera capisce cosa significa ciascuno per un esperto del settore.',
    ctaPrimary: 'Prova gratis ora',
    ctaSecondary: 'Scopri come funziona',
    bullets: ['⬤ Eliminazione automatica entro un’ora', '⬤ Elaborazione locale nel tuo browser', '⬤ Nessun addestramento sui tuoi dati', '◆ Strumenti di base gratuiti per sempre — nessuna funzione IA necessaria per iniziare'],
    builtForTagline: 'Pensato per come i team legali, contabili e di ricerca esaminano davvero i documenti',
  },
  workspaces: {
    kicker: 'Aree di lavoro su misura',
    heading: 'Un motore, tre modi di lavorare',
    subheading:
      'Stessa qualità di base, racchiusa in un flusso completamente diverso per ogni professione — esaminare un contratto non ha nulla a che vedere con l’esaminare una fattura o un articolo di ricerca.',
    items: [
      {
        eyebrow: 'Legale',
        title: 'Per avvocati e studi legali',
        description: 'Confronta due versioni di un contratto, individua clausole insolite ed estrai automaticamente obblighi e scadenze.',
        features: ['Confronto contratti (redline)', 'Rilevamento clausole non standard', 'Ricerca semantica nella tua libreria di contratti'],
        seeAllPrefix: 'Vedi tutti gli',
      },
      {
        eyebrow: 'Contabilità',
        title: 'Per commercialisti e piccole imprese',
        description: 'Trasforma fatture ed estratti conto in dati puliti e strutturati, pronti da esportare in pochi minuti.',
        features: ['Estrazione dati ad alta precisione', 'Categorizzazione automatica delle spese', 'Esportazione pronta per QuickBooks/Xero'],
        seeAllPrefix: 'Vedi tutti gli',
      },
      {
        eyebrow: 'Ricerca',
        title: 'Per ricercatori e dottorandi',
        description: 'Chatta con qualsiasi articolo di ricerca, riassumilo a modo tuo ed estrai un elenco di riferimenti pronto per la citazione.',
        features: ['Chatta con l’articolo', 'Esportazione riferimenti BibTeX / APA', 'Libreria di ricerca personale consultabile'],
        seeAllPrefix: 'Vedi tutti gli',
      },
    ],
  },
  howItWorks: {
    kicker: 'Come funziona',
    heading: 'Tre passaggi, non trenta',
    steps: [
      { title: 'Carica', body: 'Trascina un file o scegline uno dalla tua libreria — nessuna configurazione necessaria.' },
      { title: 'L’IA lo analizza', body: 'Compreso come lo leggerebbe un professionista del tuo settore.' },
      { title: 'Scarica o esporta', body: 'Come file, riepilogo, o direttamente su QuickBooks/Xero.' },
    ],
  },
  trust: {
    heading: 'La privacy non è una funzione. È il fondamento.',
    items: [
      { title: 'Elaborazione locale per impostazione predefinita', body: 'Le operazioni semplici vengono eseguite interamente nel tuo browser — nessun upload verso alcun server.' },
      { title: 'Eliminazione automatica rigorosa', body: 'Tutto ciò che richiede elaborazione lato server viene eliminato definitivamente entro un’ora dal completamento.' },
      { title: 'Nessun addestramento sui tuoi dati', body: 'Il contenuto dei tuoi documenti non viene mai usato per addestrare alcun modello di IA.' },
    ],
    gdprBadge: '🛡 Conforme al GDPR',
    tlsBadge: '🔒 Crittografia TLS',
  },
  faq: {
    kicker: 'Domande frequenti',
    heading: 'Prima di chiedere',
    items: [
      {
        q: 'I miei dati sono al sicuro?',
        a: 'Sì. Gli strumenti semplici funzionano interamente nel tuo browser e non toccano mai i nostri server. Tutto ciò che richiede elaborazione lato server — analisi IA, OCR, conversioni — viene eliminato definitivamente entro un’ora dal completamento, e i tuoi documenti non vengono mai usati per addestrare alcun modello di IA.',
      },
      {
        q: 'Serve una carta di credito per iniziare?',
        a: 'No. Unire, dividere, ruotare e comprimere sono gratuiti per sempre, senza account né carta. Paghi solo quando vuoi analisi con IA, chat o confronti.',
      },
      {
        q: 'Cosa succede ai miei file dopo 24 ore?',
        a: 'I file salvati in un progetto della libreria vengono eliminati automaticamente e definitivamente dopo 24 ore, a meno che tu non estenda la conservazione di quel progetto a 7 o 30 giorni dal suo menu opzioni.',
      },
      {
        q: 'Quale piano fa per me?',
        a: 'Scegli l’area di lavoro adatta al tuo lavoro — Legale, Contabilità o Ricerca — in fase di registrazione (permanente), quindi scegli la fatturazione settimanale, mensile, trimestrale o annuale. Puoi cambiare il ciclo di fatturazione in qualsiasi momento dalla dashboard.',
      },
      {
        q: 'Posso annullare in qualsiasi momento?',
        a: 'Sì, in qualsiasi momento dalle impostazioni del tuo account. Mantieni l’accesso fino alla fine del periodo di fatturazione corrente, senza alcuna penale di annullamento.',
      },
    ],
  },
  closingCta: {
    heading: 'Inizia con un documento, scopri tu stesso la differenza',
    paragraph1: 'Nessuna carta di credito, nessuna registrazione lunga — prova subito l’area di lavoro pensata per la tua professione.',
    paragraph2: 'Gratis per sempre per unire, dividere, comprimere e ruotare. I piani a pagamento sbloccano analisi IA, chat e confronti.',
    cta: 'Prova Dossiera gratis',
  },
};

const ar: HomeContent = {
  hero: {
    eyebrow: 'منصة PDF مدعومة بالذكاء الاصطناعي',
    headingLine1: 'مستنداتك تتحدث.',
    headingLine2: 'وأنت فقط تستمع.',
    subtext:
      'أدوات PDF احترافية مصممة لثلاثة عوالم مختلفة — العقود والفواتير وأوراق البحث. يفهم Dossiera ما يعنيه كل منها لخبير في ذلك المجال.',
    ctaPrimary: 'جرّب مجانًا الآن',
    ctaSecondary: 'شاهد كيف يعمل',
    bullets: ['⬤ حذف تلقائي خلال ساعة واحدة', '⬤ معالجة محلية داخل متصفحك', '⬤ لا تدريب على بياناتك أبدًا', '◆ الأدوات الأساسية مجانية إلى الأبد — لا حاجة لميزات الذكاء الاصطناعي للبدء'],
    builtForTagline: 'مصمم وفق الطريقة التي تراجع بها فرق القانون والمحاسبة والبحث المستندات فعليًا',
  },
  workspaces: {
    kicker: 'مساحات عمل مصممة خصيصًا',
    heading: 'محرك واحد، ثلاث طرق للعمل',
    subheading:
      'نفس الجودة الأساسية، مغلفة في تدفق مختلف تمامًا لكل مهنة — مراجعة عقد لا علاقة لها بمراجعة فاتورة أو ورقة بحثية.',
    items: [
      {
        eyebrow: 'قانوني',
        title: 'للمحامين والشركات القانونية',
        description: 'قارن نسختين من عقد، واكتشف البنود غير المعتادة، واستخرج الالتزامات والتواريخ تلقائيًا.',
        features: ['مقارنة العقود (تتبع التغييرات)', 'كشف البنود غير القياسية', 'بحث دلالي في مكتبة عقودك'],
        seeAllPrefix: 'عرض كل',
      },
      {
        eyebrow: 'محاسبة',
        title: 'للمحاسبين والشركات الصغيرة',
        description: 'حوّل الفواتير وكشوف الحسابات إلى بيانات نظيفة ومنظمة جاهزة للتصدير خلال دقائق.',
        features: ['استخراج بيانات عالي الدقة', 'تصنيف تلقائي للمصروفات', 'تصدير جاهز إلى QuickBooks/Xero'],
        seeAllPrefix: 'عرض كل',
      },
      {
        eyebrow: 'بحث',
        title: 'للباحثين وطلاب الدراسات العليا',
        description: 'تحدث مع أي ورقة بحثية، لخّصها بطريقتك، واستخرج قائمة مراجع جاهزة للاستشهاد.',
        features: ['محادثة مع الورقة البحثية', 'تصدير مراجع BibTeX / APA', 'مكتبة بحثية شخصية قابلة للبحث'],
        seeAllPrefix: 'عرض كل',
      },
    ],
  },
  howItWorks: {
    kicker: 'كيف يعمل',
    heading: 'ثلاث خطوات، لا ثلاثون',
    steps: [
      { title: 'رفع الملف', body: 'أسقط ملفًا أو اختر واحدًا من مكتبتك — لا حاجة لأي إعداد.' },
      { title: 'يحلله الذكاء الاصطناعي', body: 'مفهوم بالطريقة التي يقرأه بها محترف في مجالك.' },
      { title: 'تنزيل أو تصدير', body: 'كملف، أو ملخص، أو مباشرة إلى QuickBooks/Xero.' },
    ],
  },
  trust: {
    heading: 'الخصوصية ليست ميزة. إنها الأساس.',
    items: [
      { title: 'معالجة محلية افتراضيًا', body: 'تعمل العمليات البسيطة بالكامل داخل متصفحك — دون رفع أي شيء إلى خادم.' },
      { title: 'حذف تلقائي صارم', body: 'كل ما يحتاج معالجة على الخادم يُحذف نهائيًا خلال ساعة واحدة من اكتماله.' },
      { title: 'لا تدريب على بياناتك', body: 'لا يُستخدم محتوى مستنداتك أبدًا لتدريب أي نموذج ذكاء اصطناعي.' },
    ],
    gdprBadge: '🛡 متوافق مع GDPR',
    tlsBadge: '🔒 مشفّر بـ TLS',
  },
  faq: {
    kicker: 'أسئلة شائعة',
    heading: 'قبل أن تسأل',
    items: [
      {
        q: 'هل بياناتي آمنة؟',
        a: 'نعم. تعمل الأدوات البسيطة بالكامل داخل متصفحك ولا تلمس خوادمنا أبدًا. أي شيء يحتاج معالجة على الخادم — تحليل الذكاء الاصطناعي، التعرف الضوئي، التحويلات — يُحذف نهائيًا خلال ساعة من اكتماله، ولا تُستخدم مستنداتك أبدًا لتدريب أي نموذج ذكاء اصطناعي.',
      },
      {
        q: 'هل أحتاج بطاقة ائتمان للبدء؟',
        a: 'لا. الدمج والتقسيم والتدوير والضغط مجانية إلى الأبد دون حساب أو بطاقة. تدفع فقط عندما تريد تحليلًا بالذكاء الاصطناعي أو محادثة أو مقارنات.',
      },
      {
        q: 'ماذا يحدث لملفاتي بعد 24 ساعة؟',
        a: 'تُحذف الملفات المحفوظة في مشروع بالمكتبة تلقائيًا ونهائيًا بعد 24 ساعة، ما لم تُمدّد فترة الاحتفاظ بذلك المشروع إلى 7 أو 30 يومًا من قائمة خياراته.',
      },
      {
        q: 'ما الخطة المناسبة لي؟',
        a: 'اختر مساحة العمل المناسبة لعملك — قانوني أو محاسبة أو بحث — عند التسجيل (دائم)، ثم اختر الفوترة الأسبوعية أو الشهرية أو ربع السنوية أو السنوية. يمكنك تغيير دورة الفوترة في أي وقت من لوحة التحكم.',
      },
      {
        q: 'هل يمكنني الإلغاء في أي وقت؟',
        a: 'نعم، في أي وقت من إعدادات حسابك. تحتفظ بالوصول حتى نهاية فترة الفوترة الحالية، ولا تُطبق أي رسوم إلغاء.',
      },
    ],
  },
  closingCta: {
    heading: 'ابدأ بمستند واحد، وشاهد الفرق بنفسك',
    paragraph1: 'دون بطاقة ائتمان، ودون تسجيل طويل — جرّب الآن مساحة العمل المصممة لمهنتك.',
    paragraph2: 'مجاني إلى الأبد للدمج والتقسيم والضغط والتدوير. تفتح الخطط المدفوعة تحليل الذكاء الاصطناعي والمحادثة والمقارنات.',
    cta: 'جرّب Dossiera مجانًا',
  },
};

const HOME_CONTENT: Record<Locale, HomeContent> = { en, de, fr, es, it, ar };

export function getHomeContent(locale: Locale): HomeContent {
  return HOME_CONTENT[locale] ?? HOME_CONTENT.en;
}
