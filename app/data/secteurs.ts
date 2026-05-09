// app/data/secteurs.ts

export type JobSecteur =
  | 'cognitif-admin-finance-juridique'
  | 'tech-data-design'
  | 'marketing-comm-management'
  | 'sciences-ingenierie'
  | 'sante-care-education'
  | 'manuels-artisanat-transport'
  | 'juridique-extra-securite-divers'

export interface Secteur {
  slug: JobSecteur
  label: string
  shortLabel: string
  order: number
}

export const SECTEURS: Secteur[] = [
  { slug: 'manuels-artisanat-transport',         label: 'Manuels, artisanat, transport',           shortLabel: 'Manuels & transport',     order: 1 },
  { slug: 'cognitif-admin-finance-juridique',    label: 'Cognitif, admin, finance, juridique',     shortLabel: 'Admin & finance',         order: 2 },
  { slug: 'marketing-comm-management',           label: 'Marketing, communication, management',   shortLabel: 'Marketing & comm',        order: 3 },
  { slug: 'sante-care-education',                label: 'Santé, care, éducation',                  shortLabel: 'Santé & éducation',       order: 4 },
  { slug: 'tech-data-design',                    label: 'Tech, data, design',                      shortLabel: 'Tech & data',             order: 5 },
  { slug: 'sciences-ingenierie',                 label: 'Sciences, ingénierie, supply chain',      shortLabel: 'Sciences & ingénierie',   order: 6 },
  { slug: 'juridique-extra-securite-divers',     label: 'Juridique, sécurité, métiers divers',    shortLabel: 'Sécurité & divers',       order: 7 },
]

export function findSecteurBySlug(slug: JobSecteur): Secteur {
  const found = SECTEURS.find(s => s.slug === slug)
  if (!found) throw new Error(`Secteur ${slug} not found`)
  return found
}

export function getSecteursOrdered(): Secteur[] {
  return [...SECTEURS].sort((a, b) => a.order - b.order)
}
