import type { Locale } from './i18n/locales';

export interface DownloadStep {
  title: string;
  body: string;
}

export interface DownloadFaqItem {
  q: string;
  a: string;
}

export interface DownloadContent {
  steps: DownloadStep[];
  faq: DownloadFaqItem[];
}

// Shown until/unless an admin overrides via the CMS (Page slug 'download',
// sections 'instructions'/'faq') — see AdminCms.tsx's editors for those
// section keys. Matches the English seed in migration
// 20260821220000_add_download_page_cms so first boot and an unpublished
// page render identically.
export const DOWNLOAD_CONTENT: Record<Locale, DownloadContent> = {
  en: {
    steps: [
      {
        title: 'Download the installer',
        body: 'Pick the version for your operating system below. Every build is signed, so you shouldn’t see extra security warnings.',
      },
      {
        title: 'Run the installer',
        body: 'Open the downloaded file and follow the prompts — no special permissions beyond your OS’s normal installer flow.',
      },
      {
        title: 'Start converting files right away',
        body: 'Merge, split, compress, protect, and convert files completely offline. No account needed for any of it.',
      },
      {
        title: 'Sign in only for AI features',
        body: 'AI tools like contract comparison and clause analysis need an internet connection and a signed-in account — everything else works without one.',
      },
    ],
    faq: [
      { q: 'Which operating systems are supported?', a: 'Windows, Mac, and Linux.' },
      { q: 'Do I need an account to use it?', a: 'No — every core tool works fully offline with no sign-in required. You only need an account for AI features.' },
      { q: 'Is my data uploaded anywhere?', a: 'Core tools process files entirely on your device. Only AI features send extracted text to our AI server, and only while you’re using them.' },
      { q: 'Is the desktop app free?', a: 'Yes — the desktop app itself is free to install. AI features use the same credit system as the web app.' },
      { q: 'How do I get updates?', a: 'The app checks for updates automatically and prompts you before installing one.' },
    ],
  },
  de: {
    steps: [
      {
        title: 'Installer herunterladen',
        body: 'Wählen Sie unten die Version für Ihr Betriebssystem. Jede Version ist signiert, daher sollten keine zusätzlichen Sicherheitswarnungen erscheinen.',
      },
      {
        title: 'Installer ausführen',
        body: 'Öffnen Sie die heruntergeladene Datei und folgen Sie den Anweisungen — keine besonderen Berechtigungen über den normalen Installationsablauf Ihres Betriebssystems hinaus nötig.',
      },
      {
        title: 'Sofort mit der Dateikonvertierung beginnen',
        body: 'Zusammenführen, Teilen, Komprimieren, Schützen und Konvertieren von Dateien vollständig offline. Dafür ist kein Konto nötig.',
      },
      {
        title: 'Nur für KI-Funktionen anmelden',
        body: 'KI-Werkzeuge wie Vertragsvergleich und Klauselanalyse benötigen eine Internetverbindung und ein angemeldetes Konto — alles andere funktioniert auch ohne.',
      },
    ],
    faq: [
      { q: 'Welche Betriebssysteme werden unterstützt?', a: 'Windows, Mac und Linux.' },
      { q: 'Brauche ich ein Konto, um die App zu nutzen?', a: 'Nein — alle Kernfunktionen laufen vollständig offline, ohne Anmeldung. Ein Konto brauchen Sie nur für KI-Funktionen.' },
      { q: 'Werden meine Daten irgendwohin hochgeladen?', a: 'Kernfunktionen verarbeiten Dateien vollständig auf Ihrem Gerät. Nur KI-Funktionen senden extrahierten Text an unseren KI-Server, und das nur während der Nutzung.' },
      { q: 'Ist die Desktop-App kostenlos?', a: 'Ja — die Desktop-App selbst ist kostenlos installierbar. KI-Funktionen nutzen dasselbe Guthabensystem wie die Web-App.' },
      { q: 'Wie erhalte ich Updates?', a: 'Die App sucht automatisch nach Updates und fragt vor der Installation nach.' },
    ],
  },
  fr: {
    steps: [
      {
        title: 'Téléchargez l’installateur',
        body: 'Choisissez ci-dessous la version pour votre système d’exploitation. Chaque version est signée, vous ne devriez donc pas voir d’avertissements de sécurité supplémentaires.',
      },
      {
        title: 'Exécutez l’installateur',
        body: 'Ouvrez le fichier téléchargé et suivez les instructions — aucune autorisation particulière n’est requise au-delà du processus d’installation habituel de votre système.',
      },
      {
        title: 'Commencez à convertir vos fichiers immédiatement',
        body: 'Fusionnez, divisez, compressez, protégez et convertissez des fichiers entièrement hors ligne. Aucun compte n’est nécessaire.',
      },
      {
        title: 'Connectez-vous uniquement pour les fonctionnalités IA',
        body: 'Les outils IA comme la comparaison de contrats et l’analyse de clauses nécessitent une connexion internet et un compte connecté — tout le reste fonctionne sans.',
      },
    ],
    faq: [
      { q: 'Quels systèmes d’exploitation sont pris en charge ?', a: 'Windows, Mac et Linux.' },
      { q: 'Ai-je besoin d’un compte pour l’utiliser ?', a: 'Non — tous les outils principaux fonctionnent entièrement hors ligne, sans connexion requise. Un compte n’est nécessaire que pour les fonctionnalités IA.' },
      { q: 'Mes données sont-elles envoyées quelque part ?', a: 'Les outils principaux traitent les fichiers entièrement sur votre appareil. Seules les fonctionnalités IA envoient le texte extrait à notre serveur IA, uniquement pendant leur utilisation.' },
      { q: 'L’application de bureau est-elle gratuite ?', a: 'Oui — l’application de bureau elle-même est gratuite à installer. Les fonctionnalités IA utilisent le même système de crédits que l’application web.' },
      { q: 'Comment recevoir les mises à jour ?', a: 'L’application vérifie automatiquement les mises à jour et vous demande confirmation avant d’en installer une.' },
    ],
  },
  es: {
    steps: [
      {
        title: 'Descarga el instalador',
        body: 'Elige a continuación la versión para tu sistema operativo. Cada versión está firmada, por lo que no deberías ver advertencias de seguridad adicionales.',
      },
      {
        title: 'Ejecuta el instalador',
        body: 'Abre el archivo descargado y sigue las instrucciones — no se necesitan permisos especiales más allá del proceso de instalación habitual de tu sistema.',
      },
      {
        title: 'Empieza a convertir archivos de inmediato',
        body: 'Combina, divide, comprime, protege y convierte archivos completamente sin conexión. No se necesita cuenta para nada de esto.',
      },
      {
        title: 'Inicia sesión solo para las funciones de IA',
        body: 'Las herramientas de IA, como la comparación de contratos y el análisis de cláusulas, necesitan conexión a internet y una cuenta iniciada — todo lo demás funciona sin ella.',
      },
    ],
    faq: [
      { q: '¿Qué sistemas operativos son compatibles?', a: 'Windows, Mac y Linux.' },
      { q: '¿Necesito una cuenta para usarla?', a: 'No — todas las herramientas principales funcionan completamente sin conexión y sin necesidad de iniciar sesión. Solo necesitas una cuenta para las funciones de IA.' },
      { q: '¿Se suben mis datos a algún lugar?', a: 'Las herramientas principales procesan los archivos por completo en tu dispositivo. Solo las funciones de IA envían texto extraído a nuestro servidor de IA, y únicamente mientras las usas.' },
      { q: '¿La aplicación de escritorio es gratuita?', a: 'Sí — la aplicación de escritorio en sí es gratuita de instalar. Las funciones de IA usan el mismo sistema de créditos que la aplicación web.' },
      { q: '¿Cómo recibo actualizaciones?', a: 'La aplicación busca actualizaciones automáticamente y te pregunta antes de instalar una.' },
    ],
  },
  it: {
    steps: [
      {
        title: 'Scarica il programma di installazione',
        body: 'Scegli qui sotto la versione per il tuo sistema operativo. Ogni versione è firmata, quindi non dovresti vedere avvisi di sicurezza aggiuntivi.',
      },
      {
        title: 'Esegui il programma di installazione',
        body: 'Apri il file scaricato e segui le istruzioni — non servono permessi speciali oltre alla normale procedura di installazione del tuo sistema.',
      },
      {
        title: 'Inizia subito a convertire i file',
        body: 'Unisci, dividi, comprimi, proteggi e converti i file completamente offline. Non serve alcun account.',
      },
      {
        title: 'Accedi solo per le funzionalità IA',
        body: 'Gli strumenti IA come il confronto contratti e l’analisi delle clausole richiedono una connessione a internet e un account collegato — tutto il resto funziona senza.',
      },
    ],
    faq: [
      { q: 'Quali sistemi operativi sono supportati?', a: 'Windows, Mac e Linux.' },
      { q: 'Serve un account per usarla?', a: 'No — tutti gli strumenti principali funzionano interamente offline, senza bisogno di accesso. Un account serve solo per le funzionalità IA.' },
      { q: 'I miei dati vengono caricati da qualche parte?', a: 'Gli strumenti principali elaborano i file interamente sul tuo dispositivo. Solo le funzionalità IA inviano il testo estratto al nostro server IA, e solo mentre le usi.' },
      { q: 'L’app desktop è gratuita?', a: 'Sì — l’app desktop in sé è gratuita da installare. Le funzionalità IA usano lo stesso sistema di crediti dell’app web.' },
      { q: 'Come ricevo gli aggiornamenti?', a: 'L’app controlla automaticamente gli aggiornamenti e chiede conferma prima di installarne uno.' },
    ],
  },
  ar: {
    steps: [
      {
        title: 'نزّل برنامج التثبيت',
        body: 'اختر أدناه النسخة المناسبة لنظام التشغيل لديك. كل نسخة موقّعة، لذا لن تظهر تحذيرات أمنية إضافية عادةً.',
      },
      {
        title: 'شغّل برنامج التثبيت',
        body: 'افتح الملف الذي نزّلته واتبع التعليمات — لا حاجة لأي أذونات خاصة بخلاف مسار التثبيت المعتاد لنظام التشغيل لديك.',
      },
      {
        title: 'ابدأ بتحويل الملفات على الفور',
        body: 'ادمج الملفات وقسّمها واضغطها واحمِها وحوّلها دون اتصال بالإنترنت بشكل كامل. لا حاجة لأي حساب لأي من ذلك.',
      },
      {
        title: 'سجّل الدخول فقط لميزات الذكاء الاصطناعي',
        body: 'تحتاج أدوات الذكاء الاصطناعي، مثل مقارنة العقود وتحليل البنود، إلى اتصال بالإنترنت وحساب مسجَّل الدخول — أما البقية فتعمل دون ذلك.',
      },
    ],
    faq: [
      { q: 'ما أنظمة التشغيل المدعومة؟', a: 'Windows وMac وLinux.' },
      { q: 'هل أحتاج إلى حساب لاستخدامه؟', a: 'لا — تعمل جميع الأدوات الأساسية بلا اتصال بالكامل ودون الحاجة لتسجيل الدخول. تحتاج إلى حساب فقط لميزات الذكاء الاصطناعي.' },
      { q: 'هل تُرفع بياناتي إلى أي مكان؟', a: 'تعالج الأدوات الأساسية الملفات بالكامل على جهازك. ميزات الذكاء الاصطناعي فقط هي التي ترسل النص المستخرج إلى خادم الذكاء الاصطناعي لدينا، وفقط أثناء استخدامها.' },
      { q: 'هل تطبيق سطح المكتب مجاني؟', a: 'نعم — تثبيت تطبيق سطح المكتب نفسه مجاني. تستخدم ميزات الذكاء الاصطناعي نظام الأرصدة نفسه المستخدم في تطبيق الويب.' },
      { q: 'كيف أحصل على التحديثات؟', a: 'يتحقق التطبيق من التحديثات تلقائيًا ويطلب موافقتك قبل تثبيت أي تحديث.' },
    ],
  },
};

export function getDownloadContent(locale: Locale): DownloadContent {
  return DOWNLOAD_CONTENT[locale] ?? DOWNLOAD_CONTENT.en;
}
