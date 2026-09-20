'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Locale = 'es' | 'en' | 'fr';
const copy = {
  es: {
    skip:'Saltar al contenido', navMedicines:'Vademécum', navTools:'Herramientas', navIndications:'Indicaciones', navHistory:'Historial', plans:'Planes', navSources:'Fuentes', navAbout:'Sobre Exacta7', navContact:'Contacto', privacy:'Privacidad', cookies:'Cookies', navLabel:'Navegación principal', home:'inicio',
    footerMethod:'Metodología y fuentes', footerStatus:'Catálogo regulatorio AEMPS publicado', footerCredit:'Proyecto desarrollado por', footerCreditTail:'Tecnología con pulso veterinario.',
    language:'Idioma', globalSearch:'Búsqueda global', clinicalSearch:'Búsqueda clínica', searchExacta:'Buscar en Exacta7', searchLong:'Buscar medicamentos, calculadoras y fuentes', searchPlaceholder:'Principio activo, nombre comercial, especie o vía…',
    all:'Todo', searchContext:'BUSCA POR NOMBRE O CONTEXTO', explore:'EXPLORA EL CONOCIMIENTO CLÍNICO', searchHelp:'Encuentra fichas, herramientas y referencias en un solo lugar.', noResults:'Sin resultados', results:'resultados', result:'resultado', for:'para',
    noMatches:'No encontramos coincidencias', noMatchesHelp:'Prueba con menos términos, un principio activo o una vía. El catálogo solo contiene información disponible para consulta pública.', clear:'Limpiar búsqueda', approximate:'Correspondencia aproximada · comprueba el nombre', clinicalChoice:'La selección clínica corresponde al profesional.', calculateFor:'Calcular para',
    groupMedicines:'MEDICAMENTOS', groupIndications:'INDICACIONES', groupCalculators:'CALCULADORAS', groupTools:'HERRAMIENTAS', groupReferences:'REFERENCIAS',
    regulatoryProduct:'Producto AEMPS/CIMA Vet',
  },
  en: {
    skip:'Skip to content', navMedicines:'Formulary', navTools:'Tools', navIndications:'Indications', navHistory:'History', plans:'Plans', navSources:'Sources', navAbout:'About Exacta7', navContact:'Contact', privacy:'Privacy', cookies:'Cookies', navLabel:'Main navigation', home:'home',
    footerMethod:'Methodology and sources', footerStatus:'AEMPS regulatory catalogue published', footerCredit:'A project by', footerCreditTail:'Technology with a veterinary pulse.',
    language:'Language', globalSearch:'Global search', clinicalSearch:'Clinical search', searchExacta:'Search Exacta7', searchLong:'Search medicines, calculators and sources', searchPlaceholder:'Active ingredient, trade name, species or route…',
    all:'All', searchContext:'SEARCH BY NAME OR CONTEXT', explore:'EXPLORE CLINICAL KNOWLEDGE', searchHelp:'Find records, tools and references in one place.', noResults:'No results', results:'results', result:'result', for:'for',
    noMatches:'No matches found', noMatchesHelp:'Try fewer terms, an active ingredient or a route. The catalogue only contains information available for public consultation.', clear:'Clear search', approximate:'Approximate match · check the name', clinicalChoice:'Clinical selection remains the professional’s responsibility.', calculateFor:'Calculate for',
    groupMedicines:'MEDICINES', groupIndications:'INDICATIONS', groupCalculators:'CALCULATORS', groupTools:'TOOLS', groupReferences:'REFERENCES',
    regulatoryProduct:'AEMPS/CIMA Vet product',
  },
  fr: {
    skip:'Aller au contenu', navMedicines:'Formulaire', navTools:'Outils', navIndications:'Indications', navHistory:'Historique', plans:'Formules', navSources:'Sources', navAbout:'À propos', navContact:'Contact', privacy:'Confidentialité', cookies:'Cookies', navLabel:'Navigation principale', home:'accueil',
    footerMethod:'Méthodologie et sources', footerStatus:'Catalogue réglementaire AEMPS publié', footerCredit:'Projet développé par', footerCreditTail:'La technologie au rythme vétérinaire.',
    language:'Langue', globalSearch:'Recherche globale', clinicalSearch:'Recherche clinique', searchExacta:'Rechercher dans Exacta7', searchLong:'Rechercher médicaments, calculateurs et sources', searchPlaceholder:'Principe actif, nom commercial, espèce ou voie…',
    all:'Tout', searchContext:'RECHERCHER PAR NOM OU CONTEXTE', explore:'EXPLORER LES CONNAISSANCES CLINIQUES', searchHelp:'Retrouvez fiches, outils et références au même endroit.', noResults:'Aucun résultat', results:'résultats', result:'résultat', for:'pour',
    noMatches:'Aucune correspondance', noMatchesHelp:'Essayez moins de termes, un principe actif ou une voie. Le catalogue contient uniquement des informations accessibles au public.', clear:'Effacer', approximate:'Correspondance approximative · vérifiez le nom', clinicalChoice:'La sélection clinique relève du professionnel.', calculateFor:'Calculer pour',
    groupMedicines:'MÉDICAMENTS', groupIndications:'INDICATIONS', groupCalculators:'CALCULATEURS', groupTools:'OUTILS', groupReferences:'RÉFÉRENCES',
    regulatoryProduct:'Produit AEMPS/CIMA Vet',
  },
} as const;
type Key = keyof typeof copy.es;
const LocaleContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void; t: (key: Key) => string }>({ locale:'es', setLocale:()=>{}, t:key=>copy.es[key] });

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es');
  // Locale persistence is an external browser store and is only available after hydration.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { const saved = localStorage.getItem('exacta7-locale'); if (saved === 'es' || saved === 'en' || saved === 'fr') setLocaleState(saved); }, []);
  function setLocale(value: Locale) { setLocaleState(value); localStorage.setItem('exacta7-locale', value); document.documentElement.lang = value; }
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  return <LocaleContext.Provider value={{ locale, setLocale, t:key=>copy[locale][key] }}>{children}</LocaleContext.Provider>;
}
export function useI18n() { return useContext(LocaleContext); }
export function LanguageSelector() {
  const { locale, setLocale, t } = useI18n();
  return <label className="language-selector"><span className="sr-only">{t('language')}</span><select aria-label={t('language')} value={locale} onChange={event=>setLocale(event.target.value as Locale)}><option value="es">ES</option><option value="en">EN</option><option value="fr">FR</option></select></label>;
}
