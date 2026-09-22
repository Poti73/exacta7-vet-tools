'use client';

import { useI18n } from './i18n';

const legalNotice = {
  es: {
    eyebrow: 'AVISO LEGAL',
    title: 'Aviso legal e información del titular',
    lead: 'Información general en cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE).',
    sections: [
      {
        title: '1. Identificación del titular',
        paragraphs: [
          'En cumplimiento del deber de información establecido en la legislación vigente, se facilitan a continuación los datos identificativos del titular y responsable de la plataforma web Exacta7 (exacta7.com):',
        ],
        details: [
          { label: 'Titular / Denominación social', value: 'Yosvany Cantero Romero' },
          { label: 'NIF / CIF', value: '79373503C' },
          { label: 'Domicilio social / fiscal', value: 'Calle El Hoyo, 9B, San Miguel de Abona, 38628, Santa Cruz de Tenerife, España' },
          { label: 'Correo electrónico de contacto', value: 'info@exacta7.com' },
          { label: 'Dominio oficial', value: 'https://exacta7.com' },
        ],
      },
      {
        title: '2. Objeto y titularidad de Exacta7',
        paragraphs: [
          'Exacta7 es un espacio digital y software como servicio (SaaS) concebido como herramienta de apoyo a la decisión y cálculo para profesionales del ámbito veterinario.',
          'El acceso y uso de este sitio web atribuye la condición de usuario e implica la aceptación plena de las presentes disposiciones y de las Condiciones del Servicio.',
        ],
      },
      {
        title: '3. Propiedad intelectual e industrial',
        paragraphs: [
          'Todos los derechos de propiedad intelectual e industrial sobre el diseño gráfico, código fuente, logotipos, marcas, algoritmos de cálculo, arquitectura de información y contenidos propios de Exacta7 corresponden a su titular o a terceros que han autorizado su uso.',
          'Los datos regulatorios procedentes de organismos públicos (como el catálogo oficial de la Agencia Española de Medicamentos y Productos Sanitarios - AEMPS / CIMA Vet) pertenecen a sus respectivos organismos reguladores y se presentan con fines informativos y de apoyo técnico.',
          'Queda expresamente prohibida la reproducción, distribución, comunicación pública o transformación no autorizada de los elementos protegidos de la plataforma con fines comerciales ajenos.',
        ],
      },
      {
        title: '4. Condiciones generales de uso del sitio',
        paragraphs: [
          'El usuario se compromete a hacer un uso diligente, lícito y adecuado de los servicios y contenidos ofrecidos, absteniéndose de realizar actividades ilegales, vulnerar derechos de terceros o provocar daños en los sistemas lógicos y físicos de Exacta7.',
        ],
      },
      {
        title: '5. Enlaces externos y fuentes oficiales',
        paragraphs: [
          'Exacta7 incluye enlaces directos a sitios web de terceros y repositorios oficiales (tales como fichas técnicas de la AEMPS o literatura científica). Exacta7 no ejerce control sobre dichos sitios ajenos ni asume responsabilidad sobre la disponibilidad técnica o exactitud sobrevenida de contenidos externos gestionados por sus legítimos titulares.',
        ],
      },
      {
        title: '6. Legislación aplicable y jurisdicción',
        paragraphs: [
          'Para la resolución de cualquier controversia o cuestión litigiosa relativa a este sitio web o a las actividades en él desarrolladas, será de aplicación la legislación española vigente. Las partes se someten a los juzgados y tribunales competentes conforme a la normativa aplicable.',
        ],
      },
    ],
  },
  en: {
    eyebrow: 'LEGAL NOTICE',
    title: 'Legal notice and provider information',
    lead: 'General provider information in compliance with statutory information obligations (applicable e-commerce and information society regulations).',
    sections: [
      {
        title: '1. Platform owner identification',
        paragraphs: [
          'In compliance with applicable electronic commerce legislation, the identifying details of the provider and owner of Exacta7 (exacta7.com) are set out below:',
        ],
        details: [
          { label: 'Provider / Entity Name', value: 'Yosvany Cantero Romero' },
          { label: 'Tax ID / VAT', value: '79373503C' },
          { label: 'Registered address', value: 'Calle El Hoyo, 9B, San Miguel de Abona, 38628, Santa Cruz de Tenerife, España' },
          { label: 'Contact email', value: 'info@exacta7.com' },
          { label: 'Official domain', value: 'https://exacta7.com' },
        ],
      },
      {
        title: '2. Purpose and ownership of Exacta7',
        paragraphs: [
          'Exacta7 is a veterinary clinical decision support and calculation software-as-a-service (SaaS) workspace.',
          'Accessing and browsing this website confers the status of user and implies full acceptance of this Legal Notice and the Terms of Service.',
        ],
      },
      {
        title: '3. Intellectual and industrial property',
        paragraphs: [
          'All intellectual and industrial property rights in the software architecture, graphic design, logos, trademarks, and original contents of Exacta7 belong to the provider or its licensors.',
          'Public regulatory data (such as data from the Spanish Agency of Medicines and Medical Devices - AEMPS / CIMA Vet) remain the property of their respective regulatory authorities and are displayed for reference and technical calculation purposes.',
        ],
      },
      {
        title: '4. General terms of website use',
        paragraphs: [
          'Users undertake to use the platform and its tools lawfully, diligently, and in accordance with professional ethical standards, refraining from any unauthorised extraction or system interference.',
        ],
      },
      {
        title: '5. External links and regulatory sources',
        paragraphs: [
          'Exacta7 provides links to external official databases and technical monographs. The provider does not manage third-party external portals and is not liable for their content or technical availability.',
        ],
      },
      {
        title: '6. Governing law and jurisdiction',
        paragraphs: [
          'These provisions and the use of the platform are governed by Spanish law. Any disputes shall be submitted to the competent courts in accordance with statutory regulations.',
        ],
      },
    ],
  },
  fr: {
    eyebrow: 'MENTIONS LÉGALES',
    title: 'Mentions légales et informations sur l’éditeur',
    lead: 'Informations générales sur l’éditeur de la plateforme Exacta7 conformément aux obligations légales d’information.',
    sections: [
      {
        title: '1. Identification de l’éditeur',
        paragraphs: [
          'Les coordonnées de l’éditeur et responsable de la plateforme Exacta7 (exacta7.com) sont présentées ci-dessous :',
        ],
        details: [
          { label: 'Titulaire / Raison sociale', value: 'Yosvany Cantero Romero' },
          { label: 'NIF / Numéro fiscal', value: '79373503C' },
          { label: 'Siège social / Adresse', value: 'Calle El Hoyo, 9B, San Miguel de Abona, 38628, Santa Cruz de Tenerife, España' },
          { label: 'Courrier électronique', value: 'info@exacta7.com' },
          { label: 'Domaine officiel', value: 'https://exacta7.com' },
        ],
      },
      {
        title: '2. Objet et titularité d’Exacta7',
        paragraphs: [
          'Exacta7 est une solution logicielle en mode SaaS d’aide à la décision clinique vétérinaire et de calcul technique.',
          'L’accès et l’utilisation du site impliquent l’acceptation sans réserve des présentes mentions et des Conditions de Service.',
        ],
      },
      {
        title: '3. Propriété intellectuelle',
        paragraphs: [
          'Tous les éléments constituant la plateforme (design, code source, logos, interfaces et textes originaux) sont protégés par le droit de la propriété intellectuelle.',
          'Les informations réglementaires issues d’organismes publics (tels que l’AEMPS / CIMA Vet) appartiennent à leurs émetteurs respectifs.',
        ],
      },
      {
        title: '4. Conditions générales d’utilisation',
        paragraphs: [
          'L’utilisateur s’engage à un usage loyal et conforme aux règles professionnelles et déontologiques.',
        ],
      },
      {
        title: '5. Liens externes',
        paragraphs: [
          'Exacta7 propose des liens vers des sources institutionnelles et scientifiques externes sur lesquelles l’éditeur n’exerce aucun contrôle.',
        ],
      },
      {
        title: '6. Droit applicable',
        paragraphs: [
          'Les présentes mentions sont régies par le droit espagnol. Les litiges éventuels relèvent de la compétence des tribunaux compétents.',
        ],
      },
    ],
  },
} as const;

const terms = {
  es: {
    eyebrow: 'CONDICIONES DEL SERVICIO',
    title: 'Términos y condiciones de contratación',
    lead: 'Condiciones generales de uso y contratación del servicio SaaS Exacta7 y suscripción Exacta7 Pro.',
    sections: [
      {
        title: '1. Naturaleza del servicio SaaS',
        paragraphs: [
          'Exacta7 es una plataforma digital ofrecida en modalidad de Software como Servicio (SaaS) orientada al apoyo del trabajo profesional veterinario.',
          'La plataforma pone a disposición del usuario herramientas de consulta regulatoria, cálculo clínico asistido, registros matemáticos transparentes y recursos de consulta.',
        ],
      },
      {
        title: '2. Naturaleza clínica y advertencia profesional esencial',
        paragraphs: [
          'Exacta7 es exclusivamente un instrumento de apoyo y verificación técnica. NO sustituye bajo ninguna circunstancia el juicio clínico, diagnóstico, prescripción ni criterio autónomo del profesional veterinario colegiado o habilitado.',
          'Exacta7 NO prescribe, no selecciona automáticamente fármacos ni recomienda dosis específicas para un paciente determinado. La selección de indicaciones, vías de administración, dosis, velocidades de infusión y factores de corrección corresponde exclusivamente al profesional.',
          'Diferenciación estricta de fuentes: los datos regulatorios oficiales (autorizaciones AEMPS / CIMA Vet) y la literatura o recomendaciones clínicas se mantienen diferenciados.',
          'Los resultados de las herramientas de cálculo son cálculos matemáticos derivados estrictamente de los parámetros introducidos por el usuario y los datos de concentración seleccionados. Es responsabilidad ineludible del profesional veterinario comprobar los datos de partida, la correspondencia del producto físico y la adecuación clínica antes de cualquier preparación o administración a un paciente.',
        ],
      },
      {
        title: '3. Modalidades y planes: Exacta7 Gratis y Exacta7 Pro',
        paragraphs: [
          'Exacta7 Gratis: permite la creación de una cuenta de usuario, acceso al buscador clínico, consulta del vademécum regulatorio público y herramientas de cálculo esenciales.',
          'Exacta7 Pro: modalidad de suscripción de pago que añade acceso continuo a herramientas avanzadas (cálculo de diluciones y goteo), registro y trazabilidad de cálculos y soporte técnico prioritario.',
        ],
      },
      {
        title: '4. Precios y facturación recurrente',
        paragraphs: [
          'Las tarifas vigentes para la modalidad Pro son:',
          '• Exacta7 Pro Mensual: 7,99 €/mes (impuestos aplicables según legislación fiscal vigente). Renovación recurrente automática cada mes.',
          '• Exacta7 Pro Anual: 59,99 €/año (impuestos aplicables según legislación fiscal vigente), facturado en un único pago anual equivalente a 5 €/mes. Renovación recurrente automática cada año.',
          'El usuario autoriza el cobro periódico en el medio de pago facilitado al contratar hasta que manifieste su voluntad de cancelar.',
        ],
      },
      {
        title: '5. Procesamiento de pagos seguro mediante Stripe',
        paragraphs: [
          'Los cobros, gestión de métodos de pago y facturación recurrente se procesan de forma cifrada y segura a través de la pasarela Stripe (Stripe Payments Europe, Ltd.).',
          'Exacta7 no almacena ni tiene acceso a los números completos de tarjeta bancaria ni códigos CVC/CVV del usuario.',
        ],
      },
      {
        title: '6. Cancelación de la suscripción y conservación del acceso',
        paragraphs: [
          'El usuario puede solicitar la cancelación de su suscripción en cualquier momento y sin penalización, a través del botón «Gestionar suscripción» en su panel de /cuenta (Portal de Clientes de Stripe).',
          'Efecto de la cancelación: la cancelación detiene futuras renovaciones automáticas. El usuario conservará el acceso íntegro a todas las funciones de Exacta7 Pro hasta que concluya el período de facturación ya pagado (indicado en su cuenta como fecha de fin de período). A partir de dicha fecha, la cuenta volverá automáticamente a las condiciones del plan Gratis sin pérdida de su usuario.',
        ],
      },
      {
        title: '7. Política de reembolsos y derecho de desistimiento',
        paragraphs: [
          'Los derechos legales de las personas usuarias que tengan la condición de consumidores permanecen intactos. El derecho de desistimiento podrá ejercerse cuando resulte legalmente aplicable conforme a la normativa española y europea vigente.',
          'Las solicitudes de desistimiento o reembolso pueden enviarse a info@exacta7.com. Fuera de los supuestos en que la normativa exija un reembolso, las solicitudes podrán analizarse individualmente.',
          'La cancelación de una suscripción impide futuras renovaciones conforme a la sección 6, pero no equivale necesariamente a una solicitud de reembolso de un período ya cobrado.',
        ],
      },
      {
        title: '8. Cuenta del usuario y custodia de credenciales',
        paragraphs: [
          'El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso y de las actividades que se realicen bajo su cuenta.',
          'Exacta7 se reserva el derecho de suspender o cancelar cuentas en caso de uso fraudulento, intento de vulneración de la seguridad o infracción reiterada de las presentes condiciones.',
        ],
      },
      {
        title: '9. Disponibilidad, modificaciones y limitación de responsabilidad',
        paragraphs: [
          'Exacta7 realiza esfuerzos continuos para garantizar la máxima disponibilidad, precisión y actualización técnica del servicio. No obstante, el servicio se suministra en base al estado de la técnica y no puede garantizarse una operatividad ininterrumpida o exenta de caídas por mantenimiento programado o causas de fuerza mayor.',
          'Exacta7 no se hace responsable de daños indirectos, pérdidas de beneficio ni consecuencias derivadas de errores en la introducción de datos por parte del usuario o de decisiones clínicas adoptadas sin la debida verificación profesional.',
          'Ninguna cláusula de estas condiciones limitará responsabilidades en supuestos donde la legislación aplicable no lo permita.',
        ],
      },
    ],
  },
  en: {
    eyebrow: 'TERMS OF SERVICE',
    title: 'Terms and conditions of service',
    lead: 'General terms of use and subscription conditions for Exacta7 and Exacta7 Pro SaaS.',
    sections: [
      {
        title: '1. SaaS nature of the service',
        paragraphs: [
          'Exacta7 is a digital platform provided as Software-as-a-Service (SaaS) designed to support veterinary professionals.',
          'The platform provides regulatory consultation, structured mathematical calculations, calculation logs, and reference resources.',
        ],
      },
      {
        title: '2. Clinical nature and professional disclaimer',
        paragraphs: [
          'Exacta7 is strictly a clinical decision support and calculation tool. It DOES NOT replace the clinical judgment, diagnosis, treatment selection, or independent evaluation of a qualified veterinary professional.',
          'Exacta7 does not prescribe, nor does it automatically select medications or doses. Clinical decisions, routes, indications, and rates remain the sole responsibility of the practitioner.',
          'Official regulatory data (AEMPS / CIMA Vet) and clinical literature or recommendations are kept strictly distinct.',
          'Calculations are mathematical operations based strictly on the parameters entered and verified by the professional. Professionals must verify all entered values and check physical product packaging prior to any administration.',
        ],
      },
      {
        title: '3. Service tiers: Exacta7 Free and Exacta7 Pro',
        paragraphs: [
          'Exacta7 Free: provides an account, clinical search, public regulatory formulary, and core calculation tools.',
          'Exacta7 Pro: paid subscription tier providing advanced tools (dilutions, drip rates), transparent calculation records, and priority support.',
        ],
      },
      {
        title: '4. Pricing and automatic renewal',
        paragraphs: [
          'Current pricing for Exacta7 Pro:',
          '• Exacta7 Pro Monthly: €7.99/month (applicable taxes included/added pursuant to tax rules). Renews automatically each month.',
          '• Exacta7 Pro Annual: €59.99/year (applicable taxes included/added pursuant to tax rules), billed as a single annual payment equivalent to €5/month. Renews automatically each year.',
          'The user authorizes recurring billing to their designated payment method until cancelled.',
        ],
      },
      {
        title: '5. Secure payment processing via Stripe',
        paragraphs: [
          'All payments and recurring subscriptions are handled securely by Stripe (Stripe Payments Europe, Ltd.).',
          'Exacta7 does not store or process complete credit card numbers or security codes.',
        ],
      },
      {
        title: '6. Subscription cancellation and access retention',
        paragraphs: [
          'Users may request cancellation of their subscription at any time and without fees via the "Manage subscription" button in /cuenta (Stripe Customer Portal).',
          'Cancellation effect: cancels upcoming automatic renewals. Pro features remain fully accessible until the end of the current paid billing period. After this date, the account switches back to Free status without deleting the user account.',
        ],
      },
      {
        title: '7. Refunds and withdrawal policy',
        paragraphs: [
          'The statutory rights of users who qualify as consumers remain unaffected. The right of withdrawal may be exercised where legally applicable under current Spanish and European law.',
          'Requests for withdrawal or refunds may be sent to info@exacta7.com. Outside cases where a refund is required by law, requests may be assessed on an individual basis.',
          'Cancelling a subscription prevents future renewals in accordance with section 6, but does not necessarily constitute a request for a refund of a period already charged.',
        ],
      },
      {
        title: '8. User accounts',
        paragraphs: [
          'Users are responsible for safeguarding their login credentials and all activities occurring under their accounts.',
        ],
      },
      {
        title: '9. Availability and liability limits',
        paragraphs: [
          'While Exacta7 strives for reliable uptime and accuracy, services are provided on a reasonable technical availability basis.',
          'Exacta7 is not liable for indirect damages or decisions made without independent clinical verification by the veterinary professional.',
        ],
      },
    ],
  },
  fr: {
    eyebrow: 'CONDITIONS DU SERVICE',
    title: 'Conditions générales d’utilisation et d’abonnement',
    lead: 'Conditions régissant l’utilisation de la plateforme SaaS Exacta7 et de l’abonnement Exacta7 Pro.',
    sections: [
      {
        title: '1. Nature SaaS du service',
        paragraphs: [
          'Exacta7 est une plateforme en ligne en mode SaaS conçue pour accompagner les professionnels de santé animale.',
        ],
      },
      {
        title: '2. Nature clinique et responsabilité professionnelle',
        paragraphs: [
          'Exacta7 est un outil d’aide à la décision clinique et de calcul mathématique. Il ne remplace en aucun cas l’évaluation, le diagnostic, la prescription ni le jugement clinique autonome du vétérinaire.',
          'Exacta7 ne prescrit ni ne sélectionne automatiquement de posologie. Les données réglementaires (AEMPS) et les preuves cliniques sont rigoureusement différenciées.',
          'Les résultats sont des opérations mathématiques déterminées par les données saisies par l’utilisateur. Il appartient au vétérinaire de contrôler chaque valeur avant toute préparation.',
        ],
      },
      {
        title: '3. Formules : Exacta7 Gratuit et Exacta7 Pro',
        paragraphs: [
          'Gratuit : recherche clinique, formulaire réglementaire public et outils de calcul essentiels.',
          'Pro : outils avancés (dilutions, débit de perfusion), registres de calcul et assistance prioritaire.',
        ],
      },
      {
        title: '4. Tarifs et renouvellement automatique',
        paragraphs: [
          '• Exacta7 Pro Mensuel : 7,99 €/mois. Renouvellement tacite mensuel.',
          '• Exacta7 Pro Annuel : 59,99 €/an (équivalant à 5 €/mois). Renouvellement tacite annuel.',
          'L’utilisateur peut annuler à tout moment.',
        ],
      },
      {
        title: '5. Paiements sécurisés via Stripe',
        paragraphs: [
          'Les paiements sont traités de manière sécurisée par Stripe (Stripe Payments Europe, Ltd.). Exacta7 ne conserve aucun numéro complet de carte bancaire.',
        ],
      },
      {
        title: '6. Résiliation et maintien de l’accès',
        paragraphs: [
          'L’utilisateur peut demander la résiliation de son abonnement à tout moment et sans frais depuis le bouton « Gérer l’abonnement » de son espace /cuenta (Portail Client Stripe).',
          'L’accès Pro demeure actif jusqu’à la fin de la période de facturation en cours déjà payée.',
        ],
      },
      {
        title: '7. Remboursements et rétractation',
        paragraphs: [
          'Les droits légaux des utilisateurs ayant la qualité de consommateurs demeurent intacts. Le droit de rétractation peut être exercé lorsqu’il est légalement applicable conformément à la réglementation espagnole et européenne en vigueur.',
          'Les demandes de rétractation ou de remboursement peuvent être envoyées à info@exacta7.com. En dehors des cas où un remboursement est exigé par la loi, les demandes peuvent être examinées individuellement.',
          'La résiliation d’un abonnement empêche les futurs renouvellements conformément à la section 6, mais ne constitue pas nécessairement une demande de remboursement d’une période déjà facturée.',
        ],
      },
      {
        title: '8. Comptes utilisateurs et disponibilité',
        paragraphs: [
          'L’utilisateur est responsable de ses identifiants. Exacta7 ne saurait être tenu responsable d’un mauvais usage des outils ou de données saisies de manière erronée.',
        ],
      },
    ],
  },
} as const;

const privacy = {
  es: {
    eyebrow: 'PRIVACIDAD',
    title: 'Política de privacidad',
    lead: 'Exacta7 trata los datos personales de forma proporcionada y transparente para gestionar cuentas, suscripciones y soporte.',
    sections: [
      {
        title: '1. Responsable del tratamiento',
        text: 'El responsable del tratamiento de los datos recabados en Exacta7 es el titular del servicio indicado en el Aviso Legal. Para cualquier solicitud relacionada con la protección de datos, puedes escribir a info@exacta7.com.',
      },
      {
        title: '2. Categorías de datos tratados y finalidades',
        text: 'Tratamos distintas categorías de datos según la interacción del usuario:',
        items: [
          'Datos de cuenta y autenticación: dirección de correo electrónico e identificador interno de usuario para gestionar el registro, acceso y configuración del perfil a través de Supabase Auth.',
          'Datos de facturación y suscripción: historial de pagos, estado de suscripción y códigos de cliente procesados a través de nuestro proveedor Stripe. Exacta7 nunca almacena números de tarjeta completos ni códigos CVC.',
          'Consultas y soporte: nombre, correo y mensaje remitidos a través del formulario de contacto para atender peticiones o incidencias.',
          'Datos analíticos y técnicos: métricas agregadas de uso con Google Analytics únicamente tras consentimiento explícito.',
        ],
      },
      {
        title: '3. Datos clínicos y de pacientes',
        text: 'Exacta7 NO solicita ni requiere datos identificativos de pacientes, propietarios o historias clínicas confidenciales. Los parámetros de peso o dosis utilizados en las calculadoras se gestionan localmente en tu navegador y no se asocian a identidades reales.',
      },
      {
        title: '4. Proveedores y procesadores de pago (Stripe)',
        text: 'Para la gestión segura de las suscripciones Pro, los pagos son procesados por Stripe Payments Europe, Ltd. (proveedor de servicios de pago y encargado de tratamiento en lo pertinente). Stripe gestiona los datos de cobro conforme a sus estándares de seguridad PCI-DSS Nivel 1. Puedes consultar la política de privacidad de Stripe en https://stripe.com/es/privacy.',
      },
      {
        title: '5. Analítica y consentimiento (Google Analytics 4)',
        text: 'La analítica web con GA4 solo se activa tras tu consentimiento expreso mediante nuestro selector. La configuración excluye términos de búsqueda, dosis o cálculos clínicos.',
      },
      {
        title: '6. Tus derechos',
        text: 'Puedes ejercer tus derechos de acceso, rectificación, supresión, limitación del tratamiento y portabilidad dirigiéndote por correo electrónico a info@exacta7.com.',
      },
    ],
  },
  en: {
    eyebrow: 'PRIVACY',
    title: 'Privacy policy',
    lead: 'Exacta7 processes personal data proportionately and transparently to operate accounts, subscriptions, and support.',
    sections: [
      {
        title: '1. Data controller',
        text: 'The data controller is the service provider identified in the Legal Notice. Contact: info@exacta7.com.',
      },
      {
        title: '2. Data categories and purposes',
        text: 'We process the following categories of data:',
        items: [
          'Account & authentication data: email address and user identifier via Supabase Auth for login and profile management.',
          'Billing & subscription data: subscription status, transaction records, and customer IDs processed via Stripe. Exacta7 never stores complete credit card numbers or CVCs.',
          'Contact & support: name, email, and messages sent via the contact form to respond to enquiries.',
          'Analytics & technical data: aggregated metrics via Google Analytics 4 strictly following user consent.',
        ],
      },
      {
        title: '3. Clinical and patient data',
        text: 'Exacta7 does not collect patient names, client identities, or medical records. Calculation values remain local in your browser session.',
      },
      {
        title: '4. Payment processor (Stripe)',
        text: 'Payments and subscriptions are securely processed by Stripe Payments Europe, Ltd. Stripe complies with PCI-DSS Level 1 standards. Privacy details: https://stripe.com/privacy.',
      },
      {
        title: '5. Analytics (Google Analytics 4)',
        text: 'GA4 only runs if accepted in the consent banner. Clinical parameters and search terms are never tracked.',
      },
      {
        title: '6. Your rights',
        text: 'You may request access, rectification, erasure, or restriction of your data by writing to info@exacta7.com.',
      },
    ],
  },
  fr: {
    eyebrow: 'CONFIDENTIALITÉ',
    title: 'Politique de confidentialité',
    lead: 'Exacta7 traite vos données avec rigueur et transparence pour la gestion de votre compte, abonnement et assistance.',
    sections: [
      {
        title: '1. Responsable de traitement',
        text: 'Le responsable de traitement est l’éditeur désigné dans les Mentions Légales. Contact : info@exacta7.com.',
      },
      {
        title: '2. Données traitées et finalités',
        text: 'Nous traitons les données suivantes :',
        items: [
          'Compte et authentification : adresse e-mail et identifiant technique via Supabase Auth.',
          'Facturation et abonnements : état d’abonnement et identifiants Stripe. Aucun numéro complet de carte n’est conservé par Exacta7.',
          'Support et contact : messages envoyés via le formulaire.',
          'Analytique : mesures d’audience agrégées via Google Analytics 4 soumises à consentement préalable.',
        ],
      },
      {
        title: '3. Données cliniques',
        text: 'Exacta7 ne collecte aucune donnée nominative relative aux patients ou propriétaires.',
      },
      {
        title: '4. Prestataire de paiement (Stripe)',
        text: 'Les transactions sont sécurisées par Stripe Payments Europe, Ltd. selon les normes PCI-DSS Niveau 1.',
      },
      {
        title: '5. Vos droits',
        text: 'Vous pouvez exercer vos droits d’accès, de rectification et d’effacement en écrivant à info@exacta7.com.',
      },
    ],
  },
} as const;

const cookies = {
  es: {
    eyebrow: 'COOKIES',
    title: 'Política de cookies',
    lead: 'Exacta7 utiliza almacenamiento técnico necesario y, únicamente con tu permiso, medición analítica agregada.',
    necessary: 'Almacenamiento y tecnologías necesarias',
    necessaryText: 'Conservamos tus preferencias esenciales en el navegador (idioma, sesión y estado del banner de consentimiento). Asimismo, el entorno de pasarela y pago de Stripe utiliza tecnologías técnicas estrictamente necesarias para la autenticación segura de transacciones y prevención de fraude financiero (cumplimiento PCI-DSS / PSD2).',
    ga: 'Google Analytics 4 (opcional)',
    gaText: 'Solo si aceptas las cookies analíticas, GA4 recopila información sobre páginas visitadas y eventos de navegación general. La medición está bloqueada por defecto (Consent Mode v2) y nunca recoge términos de búsqueda clínica ni parámetros de cálculo.',
    choice: 'Gestión y modificación de preferencias',
    choiceText: 'Puedes modificar tu elección o eliminar las cookies y almacenamiento local de exacta7.com en cualquier momento desde los ajustes de privacidad de tu navegador.',
  },
  en: {
    eyebrow: 'COOKIES',
    title: 'Cookie policy',
    lead: 'Exacta7 uses strictly necessary technical storage and, only with your consent, aggregated analytics.',
    necessary: 'Necessary storage and technologies',
    necessaryText: 'We store your essential browser preferences (language, session, and consent status). Furthermore, Stripe’s checkout and payment services utilize strictly necessary technical tokens to authenticate secure transactions and prevent financial fraud (PCI-DSS / PSD2 compliance).',
    ga: 'Google Analytics 4 (optional)',
    gaText: 'Only if you accept analytics, GA4 measures visited pages and general actions. Measurement is blocked by default (Consent Mode v2) and excludes search text or clinical parameters.',
    choice: 'Manage your choices',
    choiceText: 'You can clear exacta7.com cookies and local storage in your browser settings at any time to reconfigure consent.',
  },
  fr: {
    eyebrow: 'COOKIES',
    title: 'Politique relative aux cookies',
    lead: 'Exacta7 utilise un stockage technique nécessaire et, avec votre accord, une mesure d’audience.',
    necessary: 'Stockage et technologies nécessaires',
    necessaryText: 'Nous conservons vos préférences techniques (langue, session et consentement). De plus, les flux de paiement sécurisé Stripe mobilisent des technologies indispensables pour la prévention de la fraude et la sécurité bancaire (normes PCI-DSS / DSP2).',
    ga: 'Google Analytics 4 (facultatif)',
    gaText: 'GA4 n’enregistre de métriques que si vous acceptez le consentement. Les paramètres cliniques ne sont jamais transmis.',
    choice: 'Modifier votre choix',
    choiceText: 'Vous pouvez effacer le stockage et les cookies à tout moment dans les options de votre navigateur.',
  },
} as const;

export function AvisoLegalContent() {
  const { locale } = useI18n();
  const copy = legalNotice[locale];
  return (
    <article className="page-intro legal-page">
      <p className="eyebrow">{copy.eyebrow}</p>
      <h1>{copy.title}</h1>
      <p className="lead">{copy.lead}</p>
      {copy.sections.map((section) => (
        <section key={section.title} className="legal-section">
          <h2>{section.title}</h2>
          {section.paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
          {'details' in section && Array.isArray(section.details) && (
            <dl className="legal-details-list">
              {section.details.map((d) => (
                <div key={d.label} className="legal-detail-item">
                  <dt><strong>{d.label}:</strong></dt>
                  <dd>{d.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      ))}
    </article>
  );
}

export function TerminosContent() {
  const { locale } = useI18n();
  const copy = terms[locale];
  return (
    <article className="page-intro legal-page">
      <p className="eyebrow">{copy.eyebrow}</p>
      <h1>{copy.title}</h1>
      <p className="lead">{copy.lead}</p>
      {copy.sections.map((section) => (
        <section key={section.title} className="legal-section">
          <h2>{section.title}</h2>
          {section.paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </section>
      ))}
    </article>
  );
}

export function PrivacyContent() {
  const { locale } = useI18n();
  const copy = privacy[locale];
  return (
    <article className="page-intro legal-page">
      <p className="eyebrow">{copy.eyebrow}</p>
      <h1>{copy.title}</h1>
      <p className="lead">{copy.lead}</p>
      {copy.sections.map((section) => (
        <section key={section.title} className="legal-section">
          <h2>{section.title}</h2>
          <p>{section.text}</p>
          {'items' in section && Array.isArray(section.items) && (
            <ul>
              {section.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </article>
  );
}

export function CookiesContent() {
  const { locale } = useI18n();
  const copy = cookies[locale];
  return (
    <article className="page-intro legal-page">
      <p className="eyebrow">{copy.eyebrow}</p>
      <h1>{copy.title}</h1>
      <p className="lead">{copy.lead}</p>
      <h2>{copy.necessary}</h2>
      <p>{copy.necessaryText}</p>
      <h2>{copy.ga}</h2>
      <p>{copy.gaText}</p>
      <h2>{copy.choice}</h2>
      <p>{copy.choiceText}</p>
    </article>
  );
}
