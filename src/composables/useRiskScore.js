import { TRANSPORT_TEMP_RISK } from '@/data/tempBlocks'
import { getScores } from '@/data/companyScores'

/**
 * Compute a unified 0–100 risk score for a route.
 *
 * Weights: certs 30% · temp/transport 25% · company temp 20% · company damage 15% · company timeliness 10%
 * Thresholds: ≥85 → LOW (ok) · ≥60 → MEDIUM (warning) · <60 → HIGH (critical)
 *
 * @param {Array}  nodes        - normalized nodes: { company, transport, certificates[] }
 * @param {Array}  requiredCerts - required certification strings for the route
 * @param {string} tempBlock    - cargo temperature block key (e.g. 'cold', 'frozen', 'ambient', '')
 * @returns {{ score: number, level: 'ok'|'warning'|'critical', label: 'LOW'|'MEDIUM'|'HIGH' }}
 */
export function computeRiskScore(nodes, requiredCerts, tempBlock) {
  if (!nodes || nodes.length === 0) return { score: 100, level: 'ok', label: 'LOW' }

  const nodeScores = nodes.map((node, idx) => {
    const certs     = node.certificates || []
    const company   = node.company      || ''
    const transport = idx > 0 ? (node.transport || '') : ''
    const cs        = getScores(company)

    // 30% — certification coverage
    const certScore = requiredCerts.length === 0
      ? 100
      : Math.round(100 * requiredCerts.filter(c => certs.includes(c)).length / requiredCerts.length)

    // 25% — temperature / transport compatibility
    let tempScore = 100
    if (tempBlock && tempBlock !== 'ambient' && idx > 0) {
      const re = TRANSPORT_TEMP_RISK[tempBlock]?.[transport]
      if (re && !re.ok) tempScore = re.risk === 'critical' ? 0 : 40
    }

    // 20% company temp performance · 15% physical handling · 10% timeliness
    const compTemp   = cs ? cs.temp.score   : 0
    const compDamage = cs ? cs.damage.score : 0
    const compTime   = cs ? cs.time.score   : 0

    return (certScore * 0.30) + (tempScore * 0.25) + (compTemp * 0.20) + (compDamage * 0.15) + (compTime * 0.10)
  })

  const score = Math.round(nodeScores.reduce((a, b) => a + b, 0) / nodeScores.length)
  const level = score >= 85 ? 'ok'  : score >= 60 ? 'warning'  : 'critical'
  const label = score >= 85 ? 'LOW' : score >= 60 ? 'MEDIUM'   : 'HIGH'
  return { score, level, label }
}
