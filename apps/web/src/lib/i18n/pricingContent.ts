import type { Locale } from './locales';

export interface PricingContent {
  planTabs: { legal: string; accounting: string; research: string; credits: string };
  planNames: { legal: string; accounting: string; research: string };
  coreToolsLine: string;
  cycleLabels: { weekly: string; monthly: string; quarterly: string; yearly: string };
  cyclePeriod: { weekly: string; monthly: string; quarterly: string; yearly: string };
  heading: string;
  faqs: { q: string; a: string }[];
  desktopTitle: string;
  desktopSubtitle: string;
  comparePlans: string;
  payAsYouGoDescription: string;
  loading: string;
  bestValue: string;
  buyCredits: string;
  startingCheckout: string;
  signUpToBuy: string;
  creditsNeverExpire: string;
  billingNotLive: string;
  free: string;
  paid: string;
  forever: string;
  yourCurrentPlan: string;
  includedWithEveryPlan: string;
  startFree: string;
  everythingInFreePlus: string;
  saveQuarterly: string;
  saveYearly: string;
  billingSetupInProgress: string;
  subscribe: string;
  signUp: string;
  comparePlansTitle: string;
  comparePlansDescription: string;
  close: string;
  couldNotStartCheckout: string;
}

const en: PricingContent = {
  planTabs: { legal: 'Legal', accounting: 'Accounting', research: 'Research', credits: 'Pay as you go' },
  planNames: {
    legal: 'For Lawyers & Firms',
    accounting: 'For Accountants & Small Business',
    research: 'For Researchers & Grad Students',
  },
  coreToolsLine: 'Merge, split, compress, rotate & other core PDF tools — free, unlimited, forever',
  cycleLabels: { weekly: 'Weekly', monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly' },
  cyclePeriod: { weekly: '/week', monthly: '/month', quarterly: '/quarter', yearly: '/year' },
  heading: 'A plan for every profession',
  faqs: [
    {
      q: 'Is my document content used to train any AI model?',
      a: 'No. Your files and extracted text are sent only to process your request, never used for training.',
    },
    {
      q: 'Can I switch professions/workspace later?',
      a: 'No — your workspace is set once at registration and can’t be changed afterward. You can still change your billing plan anytime from Settings or the dashboard sidebar.',
    },
    {
      q: 'What does "processed locally" mean?',
      a: 'Merge, split, rotate, organize, and other core tools run entirely in your browser — the file never leaves your device, and they stay free with no usage cap.',
    },
    {
      q: 'What needs a paid plan?',
      a: 'AI features and anything that needs our servers (Office↔PDF conversion, password protect/remove) are part of a paid workspace plan. OCR runs locally in your browser and stays free.',
    },
  ],
  desktopTitle: 'Pricing',
  desktopSubtitle: 'Compare plans for your workspace',
  comparePlans: 'Compare plans →',
  payAsYouGoDescription: '1 credit = 1 AI analysis, chat session, or comparison. No subscription required.',
  loading: 'Loading…',
  bestValue: 'Best value',
  buyCredits: 'Buy credits',
  startingCheckout: 'Starting checkout…',
  signUpToBuy: 'Sign up to buy',
  creditsNeverExpire: 'Credits never expire. Best for occasional use — for regular monthly use, a subscription plan costs less per document.',
  billingNotLive: 'Billing isn’t live yet — every tool is free to use while we finish it.',
  free: 'Free',
  paid: 'Paid',
  forever: 'forever',
  yourCurrentPlan: 'Your current plan',
  includedWithEveryPlan: 'Included with every plan',
  startFree: 'Start Free',
  everythingInFreePlus: 'Everything in Free, plus:',
  saveQuarterly: 'Save 10%',
  saveYearly: 'Save 20%',
  billingSetupInProgress: 'Billing setup in progress',
  subscribe: 'Subscribe',
  signUp: 'Sign Up',
  comparePlansTitle: 'Compare plans — {name}',
  comparePlansDescription: 'Everything below is scoped to your workspace — pick a billing cycle for Paid.',
  close: 'Close',
  couldNotStartCheckout: 'Could not start checkout.',
};

const de: PricingContent = {
  planTabs: { legal: 'Recht', accounting: 'Buchhaltung', research: 'Forschung', credits: 'Pay-as-you-go' },
  planNames: {
    legal: 'Für Anwälte & Kanzleien',
    accounting: 'Für Buchhalter & Kleinunternehmen',
    research: 'Für Forschende & Studierende',
  },
  coreToolsLine: 'Zusammenführen, Teilen, Komprimieren, Drehen & andere Kernwerkzeuge — kostenlos, unbegrenzt, für immer',
  cycleLabels: { weekly: 'Wöchentlich', monthly: 'Monatlich', quarterly: 'Vierteljährlich', yearly: 'Jährlich' },
  cyclePeriod: { weekly: '/Woche', monthly: '/Monat', quarterly: '/Quartal', yearly: '/Jahr' },
  heading: 'Ein Plan für jeden Beruf',
  faqs: [
    {
      q: 'Wird der Inhalt meiner Dokumente zum Training eines KI-Modells verwendet?',
      a: 'Nein. Ihre Dateien und extrahierten Texte werden nur zur Bearbeitung Ihrer Anfrage gesendet, niemals zum Training.',
    },
    {
      q: 'Kann ich später den Beruf/Arbeitsbereich wechseln?',
      a: 'Nein — Ihr Arbeitsbereich wird einmalig bei der Registrierung festgelegt und kann danach nicht geändert werden. Sie können Ihren Abrechnungsplan jedoch jederzeit in den Einstellungen oder der Dashboard-Seitenleiste ändern.',
    },
    {
      q: 'Was bedeutet „lokal verarbeitet“?',
      a: 'Zusammenführen, Teilen, Drehen, Organisieren und andere Kernwerkzeuge laufen komplett in Ihrem Browser — die Datei verlässt nie Ihr Gerät und bleibt kostenlos ohne Nutzungslimit.',
    },
    {
      q: 'Was benötigt einen bezahlten Plan?',
      a: 'KI-Funktionen und alles, was unsere Server benötigt (Office↔PDF-Konvertierung, Passwort schützen/entfernen), gehören zu einem bezahlten Arbeitsbereich-Plan. OCR läuft lokal in Ihrem Browser und bleibt kostenlos.',
    },
  ],
  desktopTitle: 'Preise',
  desktopSubtitle: 'Vergleichen Sie Pläne für Ihren Arbeitsbereich',
  comparePlans: 'Pläne vergleichen →',
  payAsYouGoDescription: '1 Guthaben = 1 KI-Analyse, Chat-Sitzung oder Vergleich. Kein Abonnement erforderlich.',
  loading: 'Wird geladen…',
  bestValue: 'Bestes Angebot',
  buyCredits: 'Guthaben kaufen',
  startingCheckout: 'Kasse wird gestartet…',
  signUpToBuy: 'Zum Kaufen registrieren',
  creditsNeverExpire: 'Guthaben verfällt nie. Am besten für gelegentliche Nutzung — bei regelmäßiger monatlicher Nutzung kostet ein Abonnement pro Dokument weniger.',
  billingNotLive: 'Die Abrechnung ist noch nicht aktiv — jedes Werkzeug ist kostenlos nutzbar, während wir sie fertigstellen.',
  free: 'Kostenlos',
  paid: 'Bezahlt',
  forever: 'für immer',
  yourCurrentPlan: 'Ihr aktueller Plan',
  includedWithEveryPlan: 'In jedem Plan enthalten',
  startFree: 'Kostenlos starten',
  everythingInFreePlus: 'Alles aus Kostenlos, plus:',
  saveQuarterly: '10 % sparen',
  saveYearly: '20 % sparen',
  billingSetupInProgress: 'Abrechnung wird eingerichtet',
  subscribe: 'Abonnieren',
  signUp: 'Registrieren',
  comparePlansTitle: 'Pläne vergleichen — {name}',
  comparePlansDescription: 'Alles unten bezieht sich auf Ihren Arbeitsbereich — wählen Sie einen Abrechnungszyklus für Bezahlt.',
  close: 'Schließen',
  couldNotStartCheckout: 'Der Bezahlvorgang konnte nicht gestartet werden.',
};

const fr: PricingContent = {
  planTabs: { legal: 'Juridique', accounting: 'Comptabilité', research: 'Recherche', credits: 'Paiement à l’usage' },
  planNames: {
    legal: 'Pour avocats & cabinets',
    accounting: 'Pour comptables & petites entreprises',
    research: 'Pour chercheurs & doctorants',
  },
  coreToolsLine: 'Fusionner, diviser, compresser, pivoter & autres outils PDF de base — gratuits, illimités, pour toujours',
  cycleLabels: { weekly: 'Hebdomadaire', monthly: 'Mensuel', quarterly: 'Trimestriel', yearly: 'Annuel' },
  cyclePeriod: { weekly: '/semaine', monthly: '/mois', quarterly: '/trimestre', yearly: '/an' },
  heading: 'Un forfait pour chaque profession',
  faqs: [
    {
      q: 'Le contenu de mes documents est-il utilisé pour entraîner un modèle d’IA ?',
      a: 'Non. Vos fichiers et le texte extrait ne sont envoyés que pour traiter votre demande, jamais utilisés pour l’entraînement.',
    },
    {
      q: 'Puis-je changer de métier/espace de travail plus tard ?',
      a: 'Non — votre espace de travail est défini une seule fois à l’inscription et ne peut plus être modifié ensuite. Vous pouvez toutefois changer votre forfait de facturation à tout moment depuis les paramètres ou la barre latérale du tableau de bord.',
    },
    {
      q: 'Que signifie « traité localement » ?',
      a: 'Fusionner, diviser, pivoter, organiser et les autres outils de base s’exécutent entièrement dans votre navigateur — le fichier ne quitte jamais votre appareil, et ils restent gratuits sans limite d’utilisation.',
    },
    {
      q: 'Qu’est-ce qui nécessite un forfait payant ?',
      a: 'Les fonctionnalités IA et tout ce qui nécessite nos serveurs (conversion Office↔PDF, protection/suppression de mot de passe) font partie d’un forfait d’espace de travail payant. L’OCR s’exécute localement dans votre navigateur et reste gratuit.',
    },
  ],
  desktopTitle: 'Tarifs',
  desktopSubtitle: 'Comparez les forfaits pour votre espace de travail',
  comparePlans: 'Comparer les forfaits →',
  payAsYouGoDescription: '1 crédit = 1 analyse IA, session de chat ou comparaison. Aucun abonnement requis.',
  loading: 'Chargement…',
  bestValue: 'Meilleure offre',
  buyCredits: 'Acheter des crédits',
  startingCheckout: 'Démarrage du paiement…',
  signUpToBuy: 'S’inscrire pour acheter',
  creditsNeverExpire: 'Les crédits n’expirent jamais. Idéal pour un usage occasionnel — pour un usage mensuel régulier, un abonnement coûte moins cher par document.',
  billingNotLive: 'La facturation n’est pas encore active — tous les outils sont gratuits pendant que nous la finalisons.',
  free: 'Gratuit',
  paid: 'Payant',
  forever: 'pour toujours',
  yourCurrentPlan: 'Votre forfait actuel',
  includedWithEveryPlan: 'Inclus avec tous les forfaits',
  startFree: 'Commencer gratuitement',
  everythingInFreePlus: 'Tout ce qui est inclus dans Gratuit, plus :',
  saveQuarterly: 'Économisez 10 %',
  saveYearly: 'Économisez 20 %',
  billingSetupInProgress: 'Configuration de la facturation en cours',
  subscribe: 'S’abonner',
  signUp: 'S’inscrire',
  comparePlansTitle: 'Comparer les forfaits — {name}',
  comparePlansDescription: 'Tout ci-dessous est propre à votre espace de travail — choisissez un cycle de facturation pour Payant.',
  close: 'Fermer',
  couldNotStartCheckout: 'Impossible de démarrer le paiement.',
};

const es: PricingContent = {
  planTabs: { legal: 'Legal', accounting: 'Contabilidad', research: 'Investigación', credits: 'Pago por uso' },
  planNames: {
    legal: 'Para abogados y despachos',
    accounting: 'Para contadores y pequeñas empresas',
    research: 'Para investigadores y estudiantes de posgrado',
  },
  coreToolsLine: 'Combinar, dividir, comprimir, rotar y otras herramientas PDF básicas — gratis, ilimitado, para siempre',
  cycleLabels: { weekly: 'Semanal', monthly: 'Mensual', quarterly: 'Trimestral', yearly: 'Anual' },
  cyclePeriod: { weekly: '/semana', monthly: '/mes', quarterly: '/trimestre', yearly: '/año' },
  heading: 'Un plan para cada profesión',
  faqs: [
    {
      q: '¿Se usa el contenido de mis documentos para entrenar algún modelo de IA?',
      a: 'No. Tus archivos y el texto extraído se envían solo para procesar tu solicitud, nunca se usan para entrenamiento.',
    },
    {
      q: '¿Puedo cambiar de profesión/espacio de trabajo más adelante?',
      a: 'No — tu espacio de trabajo se establece una sola vez al registrarte y no se puede cambiar después. Aun así, puedes cambiar tu plan de facturación en cualquier momento desde la configuración o la barra lateral del panel.',
    },
    {
      q: '¿Qué significa "procesado localmente"?',
      a: 'Combinar, dividir, rotar, organizar y otras herramientas básicas se ejecutan completamente en tu navegador — el archivo nunca sale de tu dispositivo, y siguen siendo gratuitas sin límite de uso.',
    },
    {
      q: '¿Qué necesita un plan de pago?',
      a: 'Las funciones de IA y todo lo que requiera nuestros servidores (conversión Office↔PDF, proteger/quitar contraseña) forman parte de un plan de espacio de trabajo de pago. El OCR se ejecuta localmente en tu navegador y sigue siendo gratuito.',
    },
  ],
  desktopTitle: 'Precios',
  desktopSubtitle: 'Compara planes para tu espacio de trabajo',
  comparePlans: 'Comparar planes →',
  payAsYouGoDescription: '1 crédito = 1 análisis de IA, sesión de chat o comparación. No se requiere suscripción.',
  loading: 'Cargando…',
  bestValue: 'Mejor valor',
  buyCredits: 'Comprar créditos',
  startingCheckout: 'Iniciando el pago…',
  signUpToBuy: 'Regístrate para comprar',
  creditsNeverExpire: 'Los créditos nunca caducan. Ideal para uso ocasional — para uso mensual regular, un plan de suscripción cuesta menos por documento.',
  billingNotLive: 'La facturación aún no está activa — todas las herramientas son gratis mientras la terminamos.',
  free: 'Gratis',
  paid: 'De pago',
  forever: 'para siempre',
  yourCurrentPlan: 'Tu plan actual',
  includedWithEveryPlan: 'Incluido en todos los planes',
  startFree: 'Empezar gratis',
  everythingInFreePlus: 'Todo lo de Gratis, más:',
  saveQuarterly: 'Ahorra 10 %',
  saveYearly: 'Ahorra 20 %',
  billingSetupInProgress: 'Configuración de facturación en curso',
  subscribe: 'Suscribirse',
  signUp: 'Regístrate',
  comparePlansTitle: 'Comparar planes — {name}',
  comparePlansDescription: 'Todo lo de abajo es específico de tu espacio de trabajo — elige un ciclo de facturación para De pago.',
  close: 'Cerrar',
  couldNotStartCheckout: 'No se pudo iniciar el pago.',
};

const it: PricingContent = {
  planTabs: { legal: 'Legale', accounting: 'Contabilità', research: 'Ricerca', credits: 'Paga a consumo' },
  planNames: {
    legal: 'Per avvocati e studi legali',
    accounting: 'Per commercialisti e piccole imprese',
    research: 'Per ricercatori e dottorandi',
  },
  coreToolsLine: 'Unire, dividere, comprimere, ruotare e altri strumenti PDF di base — gratuiti, illimitati, per sempre',
  cycleLabels: { weekly: 'Settimanale', monthly: 'Mensile', quarterly: 'Trimestrale', yearly: 'Annuale' },
  cyclePeriod: { weekly: '/settimana', monthly: '/mese', quarterly: '/trimestre', yearly: '/anno' },
  heading: 'Un piano per ogni professione',
  faqs: [
    {
      q: 'Il contenuto dei miei documenti viene usato per addestrare un modello di IA?',
      a: 'No. I tuoi file e il testo estratto vengono inviati solo per elaborare la tua richiesta, mai usati per l’addestramento.',
    },
    {
      q: 'Posso cambiare professione/area di lavoro in seguito?',
      a: 'No — la tua area di lavoro viene impostata una sola volta alla registrazione e non può essere modificata in seguito. Puoi comunque cambiare il piano di fatturazione in qualsiasi momento dalle impostazioni o dalla barra laterale della dashboard.',
    },
    {
      q: 'Cosa significa "elaborato localmente"?',
      a: 'Unire, dividere, ruotare, organizzare e altri strumenti di base funzionano interamente nel tuo browser — il file non lascia mai il tuo dispositivo, e restano gratuiti senza limiti di utilizzo.',
    },
    {
      q: 'Cosa richiede un piano a pagamento?',
      a: 'Le funzioni IA e tutto ciò che richiede i nostri server (conversione Office↔PDF, protezione/rimozione password) fanno parte di un piano a pagamento. L’OCR funziona localmente nel tuo browser e resta gratuito.',
    },
  ],
  desktopTitle: 'Prezzi',
  desktopSubtitle: 'Confronta i piani per la tua area di lavoro',
  comparePlans: 'Confronta i piani →',
  payAsYouGoDescription: '1 credito = 1 analisi IA, sessione di chat o confronto. Nessun abbonamento richiesto.',
  loading: 'Caricamento…',
  bestValue: 'Miglior valore',
  buyCredits: 'Acquista crediti',
  startingCheckout: 'Avvio del pagamento…',
  signUpToBuy: 'Registrati per acquistare',
  creditsNeverExpire: 'I crediti non scadono mai. Ideali per un uso occasionale — per un uso mensile regolare, un piano in abbonamento costa meno per documento.',
  billingNotLive: 'La fatturazione non è ancora attiva — tutti gli strumenti sono gratuiti mentre la completiamo.',
  free: 'Gratuito',
  paid: 'A pagamento',
  forever: 'per sempre',
  yourCurrentPlan: 'Il tuo piano attuale',
  includedWithEveryPlan: 'Incluso in ogni piano',
  startFree: 'Inizia gratis',
  everythingInFreePlus: 'Tutto quello di Gratuito, più:',
  saveQuarterly: 'Risparmia il 10%',
  saveYearly: 'Risparmia il 20%',
  billingSetupInProgress: 'Configurazione della fatturazione in corso',
  subscribe: 'Abbonati',
  signUp: 'Registrati',
  comparePlansTitle: 'Confronta i piani — {name}',
  comparePlansDescription: 'Tutto qui sotto è specifico per la tua area di lavoro — scegli un ciclo di fatturazione per A pagamento.',
  close: 'Chiudi',
  couldNotStartCheckout: 'Impossibile avviare il pagamento.',
};

const ar: PricingContent = {
  planTabs: { legal: 'قانوني', accounting: 'محاسبة', research: 'بحث', credits: 'الدفع حسب الاستخدام' },
  planNames: {
    legal: 'للمحامين والشركات القانونية',
    accounting: 'للمحاسبين والشركات الصغيرة',
    research: 'للباحثين وطلاب الدراسات العليا',
  },
  coreToolsLine: 'الدمج والتقسيم والضغط والتدوير وأدوات PDF الأساسية الأخرى — مجانية وغير محدودة وإلى الأبد',
  cycleLabels: { weekly: 'أسبوعي', monthly: 'شهري', quarterly: 'ربع سنوي', yearly: 'سنوي' },
  cyclePeriod: { weekly: '/أسبوعيًا', monthly: '/شهريًا', quarterly: '/ربع سنوي', yearly: '/سنويًا' },
  heading: 'خطة لكل مهنة',
  faqs: [
    {
      q: 'هل يُستخدم محتوى مستنداتي لتدريب أي نموذج ذكاء اصطناعي؟',
      a: 'لا. تُرسل ملفاتك والنصوص المستخرجة فقط لمعالجة طلبك، ولا تُستخدم أبدًا للتدريب.',
    },
    {
      q: 'هل يمكنني تغيير المهنة/مساحة العمل لاحقًا؟',
      a: 'لا — تُحدَّد مساحة عملك مرة واحدة عند التسجيل ولا يمكن تغييرها بعد ذلك. يمكنك مع ذلك تغيير خطة الفوترة في أي وقت من الإعدادات أو الشريط الجانبي للوحة التحكم.',
    },
    {
      q: 'ماذا تعني "معالجة محليًا"؟',
      a: 'الدمج والتقسيم والتدوير والتنظيم وأدوات أخرى أساسية تعمل بالكامل داخل متصفحك — لا يغادر الملف جهازك أبدًا، وتبقى مجانية دون حد للاستخدام.',
    },
    {
      q: 'ما الذي يتطلب خطة مدفوعة؟',
      a: 'ميزات الذكاء الاصطناعي وكل ما يحتاج خوادمنا (تحويل Office↔PDF، حماية/إزالة كلمة المرور) جزء من خطة مساحة عمل مدفوعة. يعمل التعرف الضوئي محليًا في متصفحك ويبقى مجانيًا.',
    },
  ],
  desktopTitle: 'الأسعار',
  desktopSubtitle: 'قارن الخطط الخاصة بمساحة عملك',
  comparePlans: 'مقارنة الخطط ←',
  payAsYouGoDescription: 'رصيد واحد = تحليل ذكاء اصطناعي واحد، أو جلسة محادثة، أو مقارنة واحدة. لا حاجة لاشتراك.',
  loading: 'جارٍ التحميل…',
  bestValue: 'أفضل قيمة',
  buyCredits: 'شراء أرصدة',
  startingCheckout: 'جارٍ بدء الدفع…',
  signUpToBuy: 'سجّل للشراء',
  creditsNeverExpire: 'لا تنتهي صلاحية الأرصدة أبدًا. الأنسب للاستخدام العرضي — أما الاستخدام الشهري المنتظم فتكون فيه خطة الاشتراك أقل تكلفة لكل مستند.',
  billingNotLive: 'الفوترة غير مفعّلة بعد — كل أداة مجانية الاستخدام حتى ننتهي منها.',
  free: 'مجاني',
  paid: 'مدفوع',
  forever: 'إلى الأبد',
  yourCurrentPlan: 'خطتك الحالية',
  includedWithEveryPlan: 'مُتضمَّن في كل خطة',
  startFree: 'ابدأ مجانًا',
  everythingInFreePlus: 'كل ما في المجاني، بالإضافة إلى:',
  saveQuarterly: 'وفّر 10%',
  saveYearly: 'وفّر 20%',
  billingSetupInProgress: 'إعداد الفوترة قيد التنفيذ',
  subscribe: 'اشترك',
  signUp: 'سجّل',
  comparePlansTitle: 'مقارنة الخطط — {name}',
  comparePlansDescription: 'كل ما يلي خاص بمساحة عملك — اختر دورة فوترة للخطة المدفوعة.',
  close: 'إغلاق',
  couldNotStartCheckout: 'تعذر بدء عملية الدفع.',
};

const PRICING_CONTENT: Record<Locale, PricingContent> = { en, de, fr, es, it, ar };

export function getPricingContent(locale: Locale): PricingContent {
  return PRICING_CONTENT[locale] ?? PRICING_CONTENT.en;
}
