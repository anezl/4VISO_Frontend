// Certificate utility helpers
// Cert objects: { name, validFrom, validTo }
// Cert strings: legacy / node-level simple names

export function certName(c) {
  return typeof c === 'string' ? c : (c?.name ?? '')
}

export function certNames(certs) {
  return (certs || []).map(certName)
}

export function certDaysRemaining(c) {
  if (typeof c === 'string' || !c?.validTo) return null
  const expiry = new Date(c.validTo)
  const today  = new Date()
  today.setHours(0, 0, 0, 0)
  expiry.setHours(0, 0, 0, 0)
  return Math.floor((expiry - today) / 86400000)
}

export function certStatus(c) {
  const days = certDaysRemaining(c)
  if (days === null) return 'unknown'
  if (days < 0)      return 'expired'
  if (days <= 180)   return 'expiring'
  return 'valid'
}

export function certStatusText(c) {
  const days = certDaysRemaining(c)
  if (days === null) return null
  if (days < 0) {
    const d = Math.abs(days)
    return d < 30 ? `Expired ${d} days ago` : `Expired ${Math.round(d / 30)} months ago`
  }
  if (days === 0)  return 'Expires today'
  if (days === 1)  return 'Expires tomorrow'
  if (days <= 30)  return `Expires in ${days} days`
  const months = Math.round(days / 30)
  if (months <= 6) return `Expires in ${months} month${months > 1 ? 's' : ''}`
  return null
}

export function getExpiringCerts(certs) {
  return (certs || []).filter(c => {
    const s = certStatus(c)
    return s === 'expired' || s === 'expiring'
  })
}
