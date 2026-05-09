// app/utils/job-similars.ts
import type { Job, JobSecteur } from '~/data/jobs'
import { JOBS } from '~/data/jobs'

/**
 * Retourne les jobs du même secteur que `current`, triés par proximité de risk score,
 * limité à `limit` (défaut 5). Exclut le job `current` lui-même.
 */
export function getSimilarJobs(current: Job, limit = 5): Job[] {
  return JOBS
    .filter(j => j.secteur === current.secteur && j.slug !== current.slug)
    .sort((a, b) => Math.abs(a.risk - current.risk) - Math.abs(b.risk - current.risk))
    .slice(0, limit)
}

/**
 * Retourne tous les jobs d'un secteur donné, triés par risk croissant.
 */
export function getJobsBySecteur(secteur: JobSecteur): Job[] {
  return JOBS
    .filter(j => j.secteur === secteur)
    .sort((a, b) => a.risk - b.risk)
}

/**
 * Filtre les jobs par query (label match, case-insensitive).
 * Si query vide, retourne tous les jobs.
 */
export function searchJobsByLabel(query: string): Job[] {
  const q = query.trim().toLowerCase()
  if (q.length === 0) return JOBS
  return JOBS.filter(j => j.label.toLowerCase().includes(q))
}
