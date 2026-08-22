-- The 'download' page's `instructions` and `faq` CMS sections were seeded
-- English-only (migration 20260821220000) with no `_locales` overlay, so
-- resolveLocaleFields() had nothing to return for any other locale and
-- silently fell back to the English base — which DownloadContent.tsx then
-- always preferred over its own already-correct per-locale translations in
-- lib/downloadContent.ts, since a non-empty CMS section always wins over
-- the local fallback. This adds the same translations already used there
-- as `_locales` overrides, so every locale finally gets what the frontend
-- already had on hand.

UPDATE `ContentSection`
SET
  `draftFields` = JSON_SET(`draftFields`, '$._locales', JSON_OBJECT(
    'de', JSON_OBJECT('items', JSON_ARRAY(
      JSON_OBJECT('title', 'Installer herunterladen', 'body', 'Wählen Sie unten die Version für Ihr Betriebssystem. Jede Version ist signiert, daher sollten keine zusätzlichen Sicherheitswarnungen erscheinen.'),
      JSON_OBJECT('title', 'Installer ausführen', 'body', 'Öffnen Sie die heruntergeladene Datei und folgen Sie den Anweisungen — keine besonderen Berechtigungen über den normalen Installationsablauf Ihres Betriebssystems hinaus nötig.'),
      JSON_OBJECT('title', 'Sofort mit der Dateikonvertierung beginnen', 'body', 'Zusammenführen, Teilen, Komprimieren, Schützen und Konvertieren von Dateien vollständig offline. Dafür ist kein Konto nötig.'),
      JSON_OBJECT('title', 'Nur für KI-Funktionen anmelden', 'body', 'KI-Werkzeuge wie Vertragsvergleich und Klauselanalyse benötigen eine Internetverbindung und ein angemeldetes Konto — alles andere funktioniert auch ohne.')
    )),
    'fr', JSON_OBJECT('items', JSON_ARRAY(
      JSON_OBJECT('title', 'Téléchargez l''installateur', 'body', 'Choisissez ci-dessous la version pour votre système d''exploitation. Chaque version est signée, vous ne devriez donc pas voir d''avertissements de sécurité supplémentaires.'),
      JSON_OBJECT('title', 'Exécutez l''installateur', 'body', 'Ouvrez le fichier téléchargé et suivez les instructions — aucune autorisation particulière n''est requise au-delà du processus d''installation habituel de votre système.'),
      JSON_OBJECT('title', 'Commencez à convertir vos fichiers immédiatement', 'body', 'Fusionnez, divisez, compressez, protégez et convertissez des fichiers entièrement hors ligne. Aucun compte n''est nécessaire.'),
      JSON_OBJECT('title', 'Connectez-vous uniquement pour les fonctionnalités IA', 'body', 'Les outils IA comme la comparaison de contrats et l''analyse de clauses nécessitent une connexion internet et un compte connecté — tout le reste fonctionne sans.')
    )),
    'es', JSON_OBJECT('items', JSON_ARRAY(
      JSON_OBJECT('title', 'Descarga el instalador', 'body', 'Elige a continuación la versión para tu sistema operativo. Cada versión está firmada, por lo que no deberías ver advertencias de seguridad adicionales.'),
      JSON_OBJECT('title', 'Ejecuta el instalador', 'body', 'Abre el archivo descargado y sigue las instrucciones — no se necesitan permisos especiales más allá del proceso de instalación habitual de tu sistema.'),
      JSON_OBJECT('title', 'Empieza a convertir archivos de inmediato', 'body', 'Combina, divide, comprime, protege y convierte archivos completamente sin conexión. No se necesita cuenta para nada de esto.'),
      JSON_OBJECT('title', 'Inicia sesión solo para las funciones de IA', 'body', 'Las herramientas de IA, como la comparación de contratos y el análisis de cláusulas, necesitan conexión a internet y una cuenta iniciada — todo lo demás funciona sin ella.')
    )),
    'it', JSON_OBJECT('items', JSON_ARRAY(
      JSON_OBJECT('title', 'Scarica il programma di installazione', 'body', 'Scegli qui sotto la versione per il tuo sistema operativo. Ogni versione è firmata, quindi non dovresti vedere avvisi di sicurezza aggiuntivi.'),
      JSON_OBJECT('title', 'Esegui il programma di installazione', 'body', 'Apri il file scaricato e segui le istruzioni — non servono permessi speciali oltre alla normale procedura di installazione del tuo sistema.'),
      JSON_OBJECT('title', 'Inizia subito a convertire i file', 'body', 'Unisci, dividi, comprimi, proteggi e converti i file completamente offline. Non serve alcun account.'),
      JSON_OBJECT('title', 'Accedi solo per le funzionalità IA', 'body', 'Gli strumenti IA come il confronto contratti e l''analisi delle clausole richiedono una connessione a internet e un account collegato — tutto il resto funziona senza.')
    )),
    'ar', JSON_OBJECT('items', JSON_ARRAY(
      JSON_OBJECT('title', 'نزّل برنامج التثبيت', 'body', 'اختر أدناه النسخة المناسبة لنظام التشغيل لديك. كل نسخة موقّعة، لذا لن تظهر تحذيرات أمنية إضافية عادةً.'),
      JSON_OBJECT('title', 'شغّل برنامج التثبيت', 'body', 'افتح الملف الذي نزّلته واتبع التعليمات — لا حاجة لأي أذونات خاصة بخلاف مسار التثبيت المعتاد لنظام التشغيل لديك.'),
      JSON_OBJECT('title', 'ابدأ بتحويل الملفات على الفور', 'body', 'ادمج الملفات وقسّمها واضغطها واحمِها وحوّلها دون اتصال بالإنترنت بشكل كامل. لا حاجة لأي حساب لأي من ذلك.'),
      JSON_OBJECT('title', 'سجّل الدخول فقط لميزات الذكاء الاصطناعي', 'body', 'تحتاج أدوات الذكاء الاصطناعي، مثل مقارنة العقود وتحليل البنود، إلى اتصال بالإنترنت وحساب مسجَّل الدخول — أما البقية فتعمل دون ذلك.')
    ))
  )),
  `publishedFields` = JSON_SET(`publishedFields`, '$._locales', JSON_OBJECT(
    'de', JSON_OBJECT('items', JSON_ARRAY(
      JSON_OBJECT('title', 'Installer herunterladen', 'body', 'Wählen Sie unten die Version für Ihr Betriebssystem. Jede Version ist signiert, daher sollten keine zusätzlichen Sicherheitswarnungen erscheinen.'),
      JSON_OBJECT('title', 'Installer ausführen', 'body', 'Öffnen Sie die heruntergeladene Datei und folgen Sie den Anweisungen — keine besonderen Berechtigungen über den normalen Installationsablauf Ihres Betriebssystems hinaus nötig.'),
      JSON_OBJECT('title', 'Sofort mit der Dateikonvertierung beginnen', 'body', 'Zusammenführen, Teilen, Komprimieren, Schützen und Konvertieren von Dateien vollständig offline. Dafür ist kein Konto nötig.'),
      JSON_OBJECT('title', 'Nur für KI-Funktionen anmelden', 'body', 'KI-Werkzeuge wie Vertragsvergleich und Klauselanalyse benötigen eine Internetverbindung und ein angemeldetes Konto — alles andere funktioniert auch ohne.')
    )),
    'fr', JSON_OBJECT('items', JSON_ARRAY(
      JSON_OBJECT('title', 'Téléchargez l''installateur', 'body', 'Choisissez ci-dessous la version pour votre système d''exploitation. Chaque version est signée, vous ne devriez donc pas voir d''avertissements de sécurité supplémentaires.'),
      JSON_OBJECT('title', 'Exécutez l''installateur', 'body', 'Ouvrez le fichier téléchargé et suivez les instructions — aucune autorisation particulière n''est requise au-delà du processus d''installation habituel de votre système.'),
      JSON_OBJECT('title', 'Commencez à convertir vos fichiers immédiatement', 'body', 'Fusionnez, divisez, compressez, protégez et convertissez des fichiers entièrement hors ligne. Aucun compte n''est nécessaire.'),
      JSON_OBJECT('title', 'Connectez-vous uniquement pour les fonctionnalités IA', 'body', 'Les outils IA comme la comparaison de contrats et l''analyse de clauses nécessitent une connexion internet et un compte connecté — tout le reste fonctionne sans.')
    )),
    'es', JSON_OBJECT('items', JSON_ARRAY(
      JSON_OBJECT('title', 'Descarga el instalador', 'body', 'Elige a continuación la versión para tu sistema operativo. Cada versión está firmada, por lo que no deberías ver advertencias de seguridad adicionales.'),
      JSON_OBJECT('title', 'Ejecuta el instalador', 'body', 'Abre el archivo descargado y sigue las instrucciones — no se necesitan permisos especiales más allá del proceso de instalación habitual de tu sistema.'),
      JSON_OBJECT('title', 'Empieza a convertir archivos de inmediato', 'body', 'Combina, divide, comprime, protege y convierte archivos completamente sin conexión. No se necesita cuenta para nada de esto.'),
      JSON_OBJECT('title', 'Inicia sesión solo para las funciones de IA', 'body', 'Las herramientas de IA, como la comparación de contratos y el análisis de cláusulas, necesitan conexión a internet y una cuenta iniciada — todo lo demás funciona sin ella.')
    )),
    'it', JSON_OBJECT('items', JSON_ARRAY(
      JSON_OBJECT('title', 'Scarica il programma di installazione', 'body', 'Scegli qui sotto la versione per il tuo sistema operativo. Ogni versione è firmata, quindi non dovresti vedere avvisi di sicurezza aggiuntivi.'),
      JSON_OBJECT('title', 'Esegui il programma di installazione', 'body', 'Apri il file scaricato e segui le istruzioni — non servono permessi speciali oltre alla normale procedura di installazione del tuo sistema.'),
      JSON_OBJECT('title', 'Inizia subito a convertire i file', 'body', 'Unisci, dividi, comprimi, proteggi e converti i file completamente offline. Non serve alcun account.'),
      JSON_OBJECT('title', 'Accedi solo per le funzionalità IA', 'body', 'Gli strumenti IA come il confronto contratti e l''analisi delle clausole richiedono una connessione a internet e un account collegato — tutto il resto funziona senza.')
    )),
    'ar', JSON_OBJECT('items', JSON_ARRAY(
      JSON_OBJECT('title', 'نزّل برنامج التثبيت', 'body', 'اختر أدناه النسخة المناسبة لنظام التشغيل لديك. كل نسخة موقّعة، لذا لن تظهر تحذيرات أمنية إضافية عادةً.'),
      JSON_OBJECT('title', 'شغّل برنامج التثبيت', 'body', 'افتح الملف الذي نزّلته واتبع التعليمات — لا حاجة لأي أذونات خاصة بخلاف مسار التثبيت المعتاد لنظام التشغيل لديك.'),
      JSON_OBJECT('title', 'ابدأ بتحويل الملفات على الفور', 'body', 'ادمج الملفات وقسّمها واضغطها واحمِها وحوّلها دون اتصال بالإنترنت بشكل كامل. لا حاجة لأي حساب لأي من ذلك.'),
      JSON_OBJECT('title', 'سجّل الدخول فقط لميزات الذكاء الاصطناعي', 'body', 'تحتاج أدوات الذكاء الاصطناعي، مثل مقارنة العقود وتحليل البنود، إلى اتصال بالإنترنت وحساب مسجَّل الدخول — أما البقية فتعمل دون ذلك.')
    ))
  ))
WHERE `pageId` = (SELECT id FROM `Page` WHERE slug = 'download') AND `sectionKey` = 'instructions';

UPDATE `ContentSection`
SET
  `draftFields` = JSON_SET(`draftFields`, '$._locales', JSON_OBJECT(
    'de', JSON_OBJECT('items', JSON_ARRAY(
      JSON_OBJECT('q', 'Welche Betriebssysteme werden unterstützt?', 'a', 'Windows, Mac und Linux.'),
      JSON_OBJECT('q', 'Brauche ich ein Konto, um die App zu nutzen?', 'a', 'Nein — alle Kernfunktionen laufen vollständig offline, ohne Anmeldung. Ein Konto brauchen Sie nur für KI-Funktionen.'),
      JSON_OBJECT('q', 'Werden meine Daten irgendwohin hochgeladen?', 'a', 'Kernfunktionen verarbeiten Dateien vollständig auf Ihrem Gerät. Nur KI-Funktionen senden extrahierten Text an unseren KI-Server, und das nur während der Nutzung.'),
      JSON_OBJECT('q', 'Ist die Desktop-App kostenlos?', 'a', 'Ja — die Desktop-App selbst ist kostenlos installierbar. KI-Funktionen nutzen dasselbe Guthabensystem wie die Web-App.'),
      JSON_OBJECT('q', 'Wie erhalte ich Updates?', 'a', 'Die App sucht automatisch nach Updates und fragt vor der Installation nach.')
    )),
    'fr', JSON_OBJECT('items', JSON_ARRAY(
      JSON_OBJECT('q', 'Quels systèmes d''exploitation sont pris en charge ?', 'a', 'Windows, Mac et Linux.'),
      JSON_OBJECT('q', 'Ai-je besoin d''un compte pour l''utiliser ?', 'a', 'Non — tous les outils principaux fonctionnent entièrement hors ligne, sans connexion requise. Un compte n''est nécessaire que pour les fonctionnalités IA.'),
      JSON_OBJECT('q', 'Mes données sont-elles envoyées quelque part ?', 'a', 'Les outils principaux traitent les fichiers entièrement sur votre appareil. Seules les fonctionnalités IA envoient le texte extrait à notre serveur IA, uniquement pendant leur utilisation.'),
      JSON_OBJECT('q', 'L''application de bureau est-elle gratuite ?', 'a', 'Oui — l''application de bureau elle-même est gratuite à installer. Les fonctionnalités IA utilisent le même système de crédits que l''application web.'),
      JSON_OBJECT('q', 'Comment recevoir les mises à jour ?', 'a', 'L''application vérifie automatiquement les mises à jour et vous demande confirmation avant d''en installer une.')
    )),
    'es', JSON_OBJECT('items', JSON_ARRAY(
      JSON_OBJECT('q', '¿Qué sistemas operativos son compatibles?', 'a', 'Windows, Mac y Linux.'),
      JSON_OBJECT('q', '¿Necesito una cuenta para usarla?', 'a', 'No — todas las herramientas principales funcionan completamente sin conexión y sin necesidad de iniciar sesión. Solo necesitas una cuenta para las funciones de IA.'),
      JSON_OBJECT('q', '¿Se suben mis datos a algún lugar?', 'a', 'Las herramientas principales procesan los archivos por completo en tu dispositivo. Solo las funciones de IA envían texto extraído a nuestro servidor de IA, y únicamente mientras las usas.'),
      JSON_OBJECT('q', '¿La aplicación de escritorio es gratuita?', 'a', 'Sí — la aplicación de escritorio en sí es gratuita de instalar. Las funciones de IA usan el mismo sistema de créditos que la aplicación web.'),
      JSON_OBJECT('q', '¿Cómo recibo actualizaciones?', 'a', 'La aplicación busca actualizaciones automáticamente y te pregunta antes de instalar una.')
    )),
    'it', JSON_OBJECT('items', JSON_ARRAY(
      JSON_OBJECT('q', 'Quali sistemi operativi sono supportati?', 'a', 'Windows, Mac e Linux.'),
      JSON_OBJECT('q', 'Serve un account per usarla?', 'a', 'No — tutti gli strumenti principali funzionano interamente offline, senza bisogno di accesso. Un account serve solo per le funzionalità IA.'),
      JSON_OBJECT('q', 'I miei dati vengono caricati da qualche parte?', 'a', 'Gli strumenti principali elaborano i file interamente sul tuo dispositivo. Solo le funzionalità IA inviano il testo estratto al nostro server IA, e solo mentre le usi.'),
      JSON_OBJECT('q', 'L''app desktop è gratuita?', 'a', 'Sì — l''app desktop in sé è gratuita da installare. Le funzionalità IA usano lo stesso sistema di crediti dell''app web.'),
      JSON_OBJECT('q', 'Come ricevo gli aggiornamenti?', 'a', 'L''app controlla automaticamente gli aggiornamenti e chiede conferma prima di installarne uno.')
    )),
    'ar', JSON_OBJECT('items', JSON_ARRAY(
      JSON_OBJECT('q', 'ما أنظمة التشغيل المدعومة؟', 'a', 'Windows وMac وLinux.'),
      JSON_OBJECT('q', 'هل أحتاج إلى حساب لاستخدامه؟', 'a', 'لا — تعمل جميع الأدوات الأساسية بلا اتصال بالكامل ودون الحاجة لتسجيل الدخول. تحتاج إلى حساب فقط لميزات الذكاء الاصطناعي.'),
      JSON_OBJECT('q', 'هل تُرفع بياناتي إلى أي مكان؟', 'a', 'تعالج الأدوات الأساسية الملفات بالكامل على جهازك. ميزات الذكاء الاصطناعي فقط هي التي ترسل النص المستخرج إلى خادم الذكاء الاصطناعي لدينا، وفقط أثناء استخدامها.'),
      JSON_OBJECT('q', 'هل تطبيق سطح المكتب مجاني؟', 'a', 'نعم — تثبيت تطبيق سطح المكتب نفسه مجاني. تستخدم ميزات الذكاء الاصطناعي نظام الأرصدة نفسه المستخدم في تطبيق الويب.'),
      JSON_OBJECT('q', 'كيف أحصل على التحديثات؟', 'a', 'يتحقق التطبيق من التحديثات تلقائيًا ويطلب موافقتك قبل تثبيت أي تحديث.')
    ))
  )),
  `publishedFields` = JSON_SET(`publishedFields`, '$._locales', JSON_OBJECT(
    'de', JSON_OBJECT('items', JSON_ARRAY(
      JSON_OBJECT('q', 'Welche Betriebssysteme werden unterstützt?', 'a', 'Windows, Mac und Linux.'),
      JSON_OBJECT('q', 'Brauche ich ein Konto, um die App zu nutzen?', 'a', 'Nein — alle Kernfunktionen laufen vollständig offline, ohne Anmeldung. Ein Konto brauchen Sie nur für KI-Funktionen.'),
      JSON_OBJECT('q', 'Werden meine Daten irgendwohin hochgeladen?', 'a', 'Kernfunktionen verarbeiten Dateien vollständig auf Ihrem Gerät. Nur KI-Funktionen senden extrahierten Text an unseren KI-Server, und das nur während der Nutzung.'),
      JSON_OBJECT('q', 'Ist die Desktop-App kostenlos?', 'a', 'Ja — die Desktop-App selbst ist kostenlos installierbar. KI-Funktionen nutzen dasselbe Guthabensystem wie die Web-App.'),
      JSON_OBJECT('q', 'Wie erhalte ich Updates?', 'a', 'Die App sucht automatisch nach Updates und fragt vor der Installation nach.')
    )),
    'fr', JSON_OBJECT('items', JSON_ARRAY(
      JSON_OBJECT('q', 'Quels systèmes d''exploitation sont pris en charge ?', 'a', 'Windows, Mac et Linux.'),
      JSON_OBJECT('q', 'Ai-je besoin d''un compte pour l''utiliser ?', 'a', 'Non — tous les outils principaux fonctionnent entièrement hors ligne, sans connexion requise. Un compte n''est nécessaire que pour les fonctionnalités IA.'),
      JSON_OBJECT('q', 'Mes données sont-elles envoyées quelque part ?', 'a', 'Les outils principaux traitent les fichiers entièrement sur votre appareil. Seules les fonctionnalités IA envoient le texte extrait à notre serveur IA, uniquement pendant leur utilisation.'),
      JSON_OBJECT('q', 'L''application de bureau est-elle gratuite ?', 'a', 'Oui — l''application de bureau elle-même est gratuite à installer. Les fonctionnalités IA utilisent le même système de crédits que l''application web.'),
      JSON_OBJECT('q', 'Comment recevoir les mises à jour ?', 'a', 'L''application vérifie automatiquement les mises à jour et vous demande confirmation avant d''en installer une.')
    )),
    'es', JSON_OBJECT('items', JSON_ARRAY(
      JSON_OBJECT('q', '¿Qué sistemas operativos son compatibles?', 'a', 'Windows, Mac y Linux.'),
      JSON_OBJECT('q', '¿Necesito una cuenta para usarla?', 'a', 'No — todas las herramientas principales funcionan completamente sin conexión y sin necesidad de iniciar sesión. Solo necesitas una cuenta para las funciones de IA.'),
      JSON_OBJECT('q', '¿Se suben mis datos a algún lugar?', 'a', 'Las herramientas principales procesan los archivos por completo en tu dispositivo. Solo las funciones de IA envían texto extraído a nuestro servidor de IA, y únicamente mientras las usas.'),
      JSON_OBJECT('q', '¿La aplicación de escritorio es gratuita?', 'a', 'Sí — la aplicación de escritorio en sí es gratuita de instalar. Las funciones de IA usan el mismo sistema de créditos que la aplicación web.'),
      JSON_OBJECT('q', '¿Cómo recibo actualizaciones?', 'a', 'La aplicación busca actualizaciones automáticamente y te pregunta antes de instalar una.')
    )),
    'it', JSON_OBJECT('items', JSON_ARRAY(
      JSON_OBJECT('q', 'Quali sistemi operativi sono supportati?', 'a', 'Windows, Mac e Linux.'),
      JSON_OBJECT('q', 'Serve un account per usarla?', 'a', 'No — tutti gli strumenti principali funzionano interamente offline, senza bisogno di accesso. Un account serve solo per le funzionalità IA.'),
      JSON_OBJECT('q', 'I miei dati vengono caricati da qualche parte?', 'a', 'Gli strumenti principali elaborano i file interamente sul tuo dispositivo. Solo le funzionalità IA inviano il testo estratto al nostro server IA, e solo mentre le usi.'),
      JSON_OBJECT('q', 'L''app desktop è gratuita?', 'a', 'Sì — l''app desktop in sé è gratuita da installare. Le funzionalità IA usano lo stesso sistema di crediti dell''app web.'),
      JSON_OBJECT('q', 'Come ricevo gli aggiornamenti?', 'a', 'L''app controlla automaticamente gli aggiornamenti e chiede conferma prima di installarne uno.')
    )),
    'ar', JSON_OBJECT('items', JSON_ARRAY(
      JSON_OBJECT('q', 'ما أنظمة التشغيل المدعومة؟', 'a', 'Windows وMac وLinux.'),
      JSON_OBJECT('q', 'هل أحتاج إلى حساب لاستخدامه؟', 'a', 'لا — تعمل جميع الأدوات الأساسية بلا اتصال بالكامل ودون الحاجة لتسجيل الدخول. تحتاج إلى حساب فقط لميزات الذكاء الاصطناعي.'),
      JSON_OBJECT('q', 'هل تُرفع بياناتي إلى أي مكان؟', 'a', 'تعالج الأدوات الأساسية الملفات بالكامل على جهازك. ميزات الذكاء الاصطناعي فقط هي التي ترسل النص المستخرج إلى خادم الذكاء الاصطناعي لدينا، وفقط أثناء استخدامها.'),
      JSON_OBJECT('q', 'هل تطبيق سطح المكتب مجاني؟', 'a', 'نعم — تثبيت تطبيق سطح المكتب نفسه مجاني. تستخدم ميزات الذكاء الاصطناعي نظام الأرصدة نفسه المستخدم في تطبيق الويب.'),
      JSON_OBJECT('q', 'كيف أحصل على التحديثات؟', 'a', 'يتحقق التطبيق من التحديثات تلقائيًا ويطلب موافقتك قبل تثبيت أي تحديث.')
    ))
  ))
WHERE `pageId` = (SELECT id FROM `Page` WHERE slug = 'download') AND `sectionKey` = 'faq';
