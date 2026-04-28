// app/data/jobs.ts

export interface Job {
  slug: string
  label: string
  risk: number        // 0–100
  horizon: number     // années : 2, 5 ou 10
  status: 'danger' | 'augmente' | 'resistant'
  source: string
}

// Seuils : risk > 65 → danger | 30–65 → augmente | < 30 → resistant
export const JOBS: Job[] = [
  // ── EN DANGER (> 65%) ──────────────────────────────────
  { slug: 'teleconseiller',       label: 'Téléconseiller',            risk: 78, horizon: 2,  status: 'danger',    source: 'MIT 2025' },
  { slug: 'televendeur',          label: 'Télévendeur',               risk: 92, horizon: 2,  status: 'danger',    source: 'Oxford 2013' },
  { slug: 'saisie-de-donnees',    label: 'Agent de saisie de données',risk: 90, horizon: 2,  status: 'danger',    source: 'Oxford 2013 / MIT 2025' },
  { slug: 'redacteur-web',        label: 'Rédacteur web',             risk: 76, horizon: 2,  status: 'danger',    source: 'MIT 2025' },
  { slug: 'traducteur',           label: 'Traducteur',                risk: 82, horizon: 2,  status: 'danger',    source: 'MIT 2025' },
  { slug: 'correcteur',           label: 'Correcteur / Relecteur',    risk: 85, horizon: 2,  status: 'danger',    source: 'MIT 2025' },
  { slug: 'transcripteur',        label: 'Transcripteur',             risk: 88, horizon: 2,  status: 'danger',    source: 'MIT 2025' },
  { slug: 'comptable',            label: 'Comptable',                 risk: 72, horizon: 5,  status: 'danger',    source: 'MIT 2025 / Goldman Sachs 2023' },
  { slug: 'analyste-credit',      label: 'Analyste crédit',           risk: 70, horizon: 5,  status: 'danger',    source: 'MIT 2025' },
  { slug: 'analyste-marketing',   label: 'Analyste marketing',        risk: 68, horizon: 5,  status: 'danger',    source: 'WEF 2025' },
  { slug: 'assistant-juridique',  label: 'Assistant juridique',       risk: 72, horizon: 5,  status: 'danger',    source: 'Goldman Sachs 2023' },
  { slug: 'secretaire-juridique', label: 'Secrétaire juridique',      risk: 77, horizon: 5,  status: 'danger',    source: 'Goldman Sachs 2023' },
  { slug: 'assistant-administratif', label: 'Assistant administratif',risk: 73, horizon: 5,  status: 'danger',    source: 'MIT 2025' },
  { slug: 'receptionniste',       label: 'Réceptionniste',            risk: 80, horizon: 2,  status: 'danger',    source: 'MIT 2025' },
  { slug: 'standardiste',         label: 'Standardiste',              risk: 83, horizon: 2,  status: 'danger',    source: 'Oxford 2013' },
  { slug: 'programmeur',          label: 'Programmeur',               risk: 74, horizon: 5,  status: 'danger',    source: 'MIT 2025' },
  { slug: 'agent-assurance',      label: "Agent d'assurance",         risk: 74, horizon: 5,  status: 'danger',    source: 'Oxford 2013 / MIT 2025' },
  { slug: 'journaliste-presse',   label: 'Journaliste (presse écrite)',risk: 67, horizon: 5, status: 'danger',    source: 'MIT 2025' },
  { slug: 'analyste-financier',   label: 'Analyste financier',        risk: 66, horizon: 5,  status: 'danger',    source: 'Goldman Sachs 2023' },
  { slug: 'operateur-saisie',     label: 'Opérateur de saisie',       risk: 91, horizon: 2,  status: 'danger',    source: 'Oxford 2013' },
  { slug: 'secretaire',           label: 'Secrétaire',                risk: 75, horizon: 5,  status: 'danger',    source: 'MIT 2025 / OCDE 2023' },
  { slug: 'technicien-support',   label: 'Technicien support IT',     risk: 66, horizon: 5,  status: 'danger',    source: 'MIT 2025' },
  { slug: 'caissier',             label: 'Caissier',                  risk: 78, horizon: 5,  status: 'danger',    source: 'OCDE 2023' },
  { slug: 'agent-recouvrement',   label: 'Agent de recouvrement',     risk: 80, horizon: 2,  status: 'danger',    source: 'Oxford 2013' },
  { slug: 'analyste-donnees',     label: 'Analyste données',          risk: 67, horizon: 5,  status: 'danger',    source: 'MIT 2025 / SHRM 2025' },

  // ── AUGMENTÉ (30–65%) ──────────────────────────────────
  { slug: 'chef-de-projet-it',    label: 'Chef de projet IT',         risk: 54, horizon: 5,  status: 'augmente',  source: 'OCDE 2023' },
  { slug: 'developpeur-logiciel', label: 'Développeur logiciel',      risk: 55, horizon: 5,  status: 'augmente',  source: 'MIT 2025' },
  { slug: 'designer-graphique',   label: 'Designer graphique',        risk: 58, horizon: 5,  status: 'augmente',  source: 'SHRM 2025' },
  { slug: 'ux-designer',          label: 'UX Designer',               risk: 45, horizon: 5,  status: 'augmente',  source: 'SHRM 2025' },
  { slug: 'data-scientist',       label: 'Data Scientist',            risk: 48, horizon: 5,  status: 'augmente',  source: 'SHRM 2025' },
  { slug: 'commercial',           label: 'Commercial',                risk: 52, horizon: 5,  status: 'augmente',  source: 'WEF 2025' },
  { slug: 'responsable-rh',       label: 'Responsable RH',           risk: 55, horizon: 5,  status: 'augmente',  source: 'MIT 2025' },
  { slug: 'recruteur',            label: 'Recruteur',                 risk: 58, horizon: 5,  status: 'augmente',  source: 'MIT 2025' },
  { slug: 'conseiller-financier', label: 'Conseiller financier',      risk: 48, horizon: 5,  status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'architecte-logiciel',  label: 'Architecte logiciel',       risk: 45, horizon: 10, status: 'augmente',  source: 'MIT 2025' },
  { slug: 'community-manager',    label: 'Community Manager',         risk: 55, horizon: 5,  status: 'augmente',  source: 'WEF 2025' },
  { slug: 'expert-comptable',     label: 'Expert-comptable',          risk: 55, horizon: 5,  status: 'augmente',  source: 'Goldman Sachs 2023 / MIT 2025' },
  { slug: 'consultant-strategie', label: 'Consultant en stratégie',   risk: 42, horizon: 10, status: 'augmente',  source: 'OCDE 2023' },
  { slug: 'product-manager',      label: 'Product Manager',           risk: 38, horizon: 10, status: 'augmente',  source: 'WEF 2025' },
  { slug: 'journaliste-tv',       label: 'Journaliste TV / Radio',    risk: 40, horizon: 10, status: 'augmente',  source: 'MIT 2025' },
  { slug: 'pharmacien',           label: 'Pharmacien',                risk: 42, horizon: 10, status: 'augmente',  source: 'Oxford 2013 / MIT 2025' },
  { slug: 'radiologue',           label: 'Radiologue',                risk: 48, horizon: 5,  status: 'augmente',  source: 'MIT 2025' },
  { slug: 'ingenieur-industriel', label: 'Ingénieur industriel',      risk: 45, horizon: 10, status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'directeur-marketing',  label: 'Directeur marketing',       risk: 35, horizon: 10, status: 'augmente',  source: 'WEF 2025' },
  { slug: 'gestionnaire-projet',  label: 'Gestionnaire de projet',    risk: 52, horizon: 5,  status: 'augmente',  source: 'OCDE 2023' },
  { slug: 'responsable-qualite',  label: 'Responsable qualité',       risk: 50, horizon: 5,  status: 'augmente',  source: 'OCDE 2023' },
  { slug: 'medecin-generaliste',  label: 'Médecin généraliste',       risk: 32, horizon: 10, status: 'augmente',  source: 'MIT 2025' },
  { slug: 'avocat',               label: 'Avocat',                    risk: 44, horizon: 10, status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'notaire',              label: 'Notaire',                   risk: 42, horizon: 10, status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'architecte',           label: 'Architecte',                risk: 38, horizon: 10, status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'controleur-gestion',   label: 'Contrôleur de gestion',     risk: 60, horizon: 5,  status: 'augmente',  source: 'MIT 2025 / Goldman Sachs 2023' },
  { slug: 'assistant-direction',  label: 'Assistant de direction',    risk: 62, horizon: 5,  status: 'augmente',  source: 'MIT 2025' },
  { slug: 'chef-de-produit',      label: 'Chef de produit',           risk: 48, horizon: 5,  status: 'augmente',  source: 'WEF 2025' },
  { slug: 'responsable-logistique', label: 'Responsable logistique',  risk: 45, horizon: 10, status: 'augmente',  source: 'OCDE 2023' },
  { slug: 'responsable-communication', label: 'Responsable communication', risk: 42, horizon: 10, status: 'augmente', source: 'WEF 2025' },
  { slug: 'ingenieur-civil',      label: 'Ingénieur génie civil',     risk: 32, horizon: 10, status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'chirurgien',           label: 'Chirurgien',                risk: 30, horizon: 10, status: 'augmente',  source: 'MIT 2025' },
  { slug: 'chauffeur-livreur',    label: 'Chauffeur livreur',         risk: 55, horizon: 10, status: 'augmente',  source: 'WEF 2025' },
  { slug: 'agent-immobilier',     label: 'Agent immobilier',          risk: 48, horizon: 5,  status: 'augmente',  source: 'Oxford 2013 / MIT 2025' },
  { slug: 'technicien-laboratoire', label: 'Technicien de laboratoire', risk: 38, horizon: 10, status: 'augmente', source: 'MIT 2025' },
  { slug: 'infographiste',        label: 'Infographiste',             risk: 62, horizon: 5,  status: 'augmente',  source: 'SHRM 2025' },
  { slug: 'actuaire',             label: 'Actuaire',                  risk: 62, horizon: 5,  status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'administrateur-sys',   label: 'Administrateur système',    risk: 58, horizon: 5,  status: 'augmente',  source: 'SHRM 2025' },
  { slug: 'ingenieur-reseau',     label: 'Ingénieur réseau',          risk: 50, horizon: 5,  status: 'augmente',  source: 'SHRM 2025' },
  { slug: 'responsable-si',       label: 'Responsable SI',            risk: 45, horizon: 10, status: 'augmente',  source: 'OCDE 2023' },
  { slug: 'acheteur',             label: 'Acheteur',                  risk: 52, horizon: 5,  status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'responsable-achats',   label: 'Directeur des achats',      risk: 40, horizon: 10, status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'biologiste',           label: 'Biologiste',                risk: 38, horizon: 10, status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'veterinaire',          label: 'Vétérinaire',               risk: 30, horizon: 10, status: 'augmente',  source: 'Oxford 2013 / MIT 2025' },
  { slug: 'geometre',             label: 'Géomètre',                  risk: 35, horizon: 10, status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'urbaniste',            label: 'Urbaniste',                 risk: 36, horizon: 10, status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'ingenieur-automatisme',label: 'Ingénieur automatisme',     risk: 40, horizon: 10, status: 'augmente',  source: 'WEF 2025' },
  { slug: 'formateur',            label: 'Formateur professionnel',   risk: 35, horizon: 10, status: 'augmente',  source: 'WEF 2025' },
  { slug: 'responsable-hse',      label: 'Responsable HSE',           risk: 32, horizon: 10, status: 'augmente',  source: 'OCDE 2023' },
  { slug: 'agent-de-voyage',      label: 'Agent de voyage',           risk: 65, horizon: 5,  status: 'augmente',  source: 'Oxford 2013 / MIT 2025' },
  { slug: 'employe-banque',       label: 'Employé de banque (guichet)',risk: 65, horizon: 5,  status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'chef-de-chantier',     label: 'Chef de chantier',          risk: 32, horizon: 10, status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'ingenieur-mecanique',  label: 'Ingénieur mécanique',       risk: 35, horizon: 10, status: 'augmente',  source: 'Goldman Sachs 2023' },
  { slug: 'photographe',          label: 'Photographe professionnel', risk: 50, horizon: 5,  status: 'augmente',  source: 'MIT 2025' },
  { slug: 'technicien-son',       label: 'Technicien son / image',    risk: 38, horizon: 10, status: 'augmente',  source: 'MIT 2025' },

  // ── RÉSISTANT (< 30%) ──────────────────────────────────
  { slug: 'carreleur',            label: 'Carreleur',                 risk: 8,  horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'electricien',          label: 'Électricien',               risk: 12, horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'plombier',             label: 'Plombier',                  risk: 10, horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'menuisier',            label: 'Menuisier',                 risk: 9,  horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'macon',                label: 'Maçon',                     risk: 7,  horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'infirmier',            label: 'Infirmier / Infirmière',    risk: 22, horizon: 10, status: 'resistant', source: 'MIT 2025 / OCDE 2023' },
  { slug: 'psychologue',          label: 'Psychologue',               risk: 18, horizon: 10, status: 'resistant', source: 'MIT 2025' },
  { slug: 'travailleur-social',   label: 'Travailleur social',        risk: 12, horizon: 10, status: 'resistant', source: 'MIT 2025' },
  { slug: 'enseignant-primaire',  label: 'Enseignant (primaire)',     risk: 16, horizon: 10, status: 'resistant', source: 'WEF 2025' },
  { slug: 'professeur-lycee',     label: 'Professeur (lycée)',        risk: 18, horizon: 10, status: 'resistant', source: 'WEF 2025' },
  { slug: 'chef-cuisinier',       label: 'Chef cuisinier',            risk: 18, horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'agriculteur',          label: 'Agriculteur',               risk: 10, horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'pompier',              label: 'Pompier',                   risk: 5,  horizon: 10, status: 'resistant', source: 'Oxford 2013' },
  { slug: 'policier',             label: 'Policier',                  risk: 10, horizon: 10, status: 'resistant', source: 'Oxford 2013' },
  { slug: 'kinesitherapeute',     label: 'Kinésithérapeute',          risk: 15, horizon: 10, status: 'resistant', source: 'MIT 2025' },
  { slug: 'mecanicien',           label: 'Mécanicien automobile',     risk: 14, horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'coiffeur',             label: 'Coiffeur / Esthéticien',    risk: 12, horizon: 10, status: 'resistant', source: 'Oxford 2013' },
  { slug: 'dentiste',             label: 'Dentiste',                  risk: 20, horizon: 10, status: 'resistant', source: 'Oxford 2013 / MIT 2025' },
  { slug: 'technicien-maintenance', label: 'Technicien de maintenance', risk: 15, horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'aide-soignant',        label: 'Aide-soignant',             risk: 14, horizon: 10, status: 'resistant', source: 'MIT 2025' },
  { slug: 'moniteur-auto-ecole',  label: "Moniteur d'auto-école",     risk: 18, horizon: 10, status: 'resistant', source: 'Oxford 2013' },
  { slug: 'ebeniste',             label: 'Ébéniste',                  risk: 8,  horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'osteopathe',           label: 'Ostéopathe',                risk: 16, horizon: 10, status: 'resistant', source: 'MIT 2025' },
  { slug: 'directeur-general',    label: 'Directeur général',         risk: 22, horizon: 10, status: 'resistant', source: 'WEF 2025' },
  { slug: 'ambulancier',          label: 'Ambulancier',               risk: 12, horizon: 10, status: 'resistant', source: 'MIT 2025' },
  { slug: 'sage-femme',           label: 'Sage-femme',                risk: 15, horizon: 10, status: 'resistant', source: 'MIT 2025' },
  { slug: 'ergotherapeute',       label: 'Ergothérapeute',            risk: 14, horizon: 10, status: 'resistant', source: 'Oxford 2013' },
  { slug: 'orthophoniste',        label: 'Orthophoniste',             risk: 16, horizon: 10, status: 'resistant', source: 'Oxford 2013' },
  { slug: 'educateur-specialise', label: 'Éducateur spécialisé',      risk: 12, horizon: 10, status: 'resistant', source: 'MIT 2025' },
  { slug: 'peintre-batiment',     label: 'Peintre en bâtiment',       risk: 8,  horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'soudeur',              label: 'Soudeur',                   risk: 11, horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'boulanger',            label: 'Boulanger',                 risk: 6,  horizon: 10, status: 'resistant', source: 'Oxford 2013' },
  { slug: 'patissier',            label: 'Pâtissier',                 risk: 7,  horizon: 10, status: 'resistant', source: 'Oxford 2013' },
  { slug: 'moniteur-sport',       label: 'Moniteur de sport',         risk: 13, horizon: 10, status: 'resistant', source: 'Oxford 2013' },
  { slug: 'dieteticien',          label: 'Diététicien',               risk: 20, horizon: 10, status: 'resistant', source: 'MIT 2025' },
  { slug: 'technicien-cvc',       label: 'Technicien CVC (chauffage)',risk: 10, horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'serrurier',            label: 'Serrurier',                 risk: 9,  horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'conducteur-engins',    label: "Conducteur d'engins",       risk: 18, horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'juge',                 label: 'Juge / Magistrat',          risk: 26, horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
  { slug: 'pompiste',             label: 'Technicien de surface',     risk: 8,  horizon: 10, status: 'resistant', source: 'Goldman Sachs 2023' },
]

export function findJobBySlug(slug: string): Job | undefined {
  return JOBS.find(j => j.slug === slug)
}

export function searchJobs(query: string): Job[] {
  const q = query.toLowerCase().trim()
  if (q.length < 2) return []
  return JOBS
    .filter(j => j.label.toLowerCase().includes(q))
    .slice(0, 8)
}
