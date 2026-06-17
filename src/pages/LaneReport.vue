<template>
  <div class="report-page">

    <!-- ── SCREEN NAV BAR ── -->
    <div class="rpt-nav no-print">
      <div class="rpt-nav-left">
        <span class="rpt-nav-title">Route Risk Report</span>
      </div>
      <div class="rpt-nav-right">
        <button class="btn-back" @click="$router.push($route.query.laneId ? '/canvas?laneId=' + $route.query.laneId : '/lanes')">← Back to Route</button>
        <button class="btn-pdf" @click="printReport">⬇ Download PDF</button>
      </div>
    </div>

    <!-- ── PRINT COVER HEADER ── -->
    <div class="print-cover print-only">
      <div class="pcover-left">
        <img src="/4VISO_Logo.png" alt="4VISO" class="pcover-logo" />
        <div class="pcover-titles">
          <div class="pcover-main">Route Risk Report</div>
          <div class="pcover-sub">Supply Chain Risk Assessment · {{ generatedDate }}</div>
        </div>
      </div>
      <div class="pcover-right" v-if="lane">
        <span class="pcover-status" :class="'cs-' + riskScore.level">{{ riskScore.label }}</span>
      </div>
    </div>

    <div v-if="!lane" class="rpt-empty">
      <div class="rpt-empty-icon">📋</div>
      <p>Loading report…</p>
      <button class="btn-back" @click="$router.push('/lanes')">← Back to Lanes</button>
    </div>

    <div v-else class="rpt-body">

      <!-- ══ HERO BANNER ══ -->
      <div class="hero-band no-print">
        <div class="hero-left">
          <div class="hero-brand">
            <img src="/4VISO_Logo.png" alt="4VISO" class="hero-logo" />
            <span class="hero-report-label">Route Risk Report</span>
          </div>
          <div class="hero-route">
            <span class="hero-city">{{ lane.origin?.city || 'Origin' }}</span>
            <span class="hero-arrow">→</span>
            <span class="hero-city">{{ lane.destination?.city || 'Destination' }}</span>
          </div>
          <div class="hero-meta">
            <span v-if="effectiveTempBlock" class="hero-tag" :style="tempTagStyle">
              {{ tempBlockIcon(effectiveTempBlock) }} {{ tempBlockLabel(effectiveTempBlock) }} · {{ tempBlockSub(effectiveTempBlock) }}
            </span>
            <span v-if="lane.productType || lane.cargoProfile?.productType" class="hero-tag hero-tag-grey">
              {{ lane.productType || lane.cargoProfile?.productType }}
            </span>
            <span class="hero-tag hero-tag-grey">{{ (lane.nodes || []).length }} nodes</span>
          </div>
        </div>
        <div class="hero-right">
          <div class="score-ring" :class="'sr-' + riskScore.level">
            <div class="score-ring-inner">
              <span class="score-num">{{ riskScore.score }}</span>
              <span class="score-label">/ 100</span>
            </div>
          </div>
          <div class="score-verdict">
            <div class="verdict-badge" :class="'vb-' + riskScore.level">{{ riskScore.level }} RISK</div>
            <div class="verdict-counts">
              <span v-if="riskResult.counts.critical" class="vcnt vcnt-crit">● {{ riskResult.counts.critical }} critical</span>
              <span v-if="riskResult.counts.warning"  class="vcnt vcnt-warn">● {{ riskResult.counts.warning }} attention</span>
              <span v-if="!riskResult.counts.critical && !riskResult.counts.warning" class="vcnt vcnt-ok">● No attention areas</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ SECTION 1: ROUTE FLOW ══ -->
      <section class="card">
        <div class="card-head">
          <span class="card-head-num">01</span>
          <span class="card-head-title">Route Overview</span>
        </div>
        <div class="flow-track">
          <template v-for="(node, idx) in lane.nodes" :key="idx">
            <div class="flow-node" :class="flowNodeClass(idx)">
              <div class="fn-role">{{ nodeRoleLabel(idx) }}</div>
              <div class="fn-ico">{{ facilityIconForNode(node) }}</div>
              <div class="fn-loc">{{ node.location || '—' }}</div>
              <div class="fn-co">{{ node.company || '—' }}</div>
              <div class="fn-caps">
                <span class="cap-dot" :class="nodeCapTemp(node).ok ? 'cap-ok' : 'cap-fail'" :title="nodeCapTemp(node).reason">
                  {{ tempBlockIcon(effectiveTempBlock) || '🌡️' }}
                </span>
                <span class="cap-dot" :class="nodeCapFragile(node).na ? 'cap-na' : nodeCapFragile(node).ok ? 'cap-ok' : 'cap-fail'" :title="nodeCapFragile(node).reason">
                  📦
                </span>
              </div>
            </div>
            <div v-if="idx < lane.nodes.length - 1" class="flow-conn">
              <div class="fc-line" :class="'fct-' + (lane.nodes[idx + 1].transport || 'road')"></div>
              <div class="fc-label">
                <span>{{ transportIcon(lane.nodes[idx + 1].transport || 'road') }}</span>
                <span class="fc-transport-name">{{ transportLabelText(lane.nodes[idx + 1].transport || 'road') }}</span>
              </div>
              <div class="fc-risk-dot" :class="'frd-' + (getTempRisk(lane.nodes[idx + 1].transport)?.risk || 'ok')"></div>
            </div>
          </template>
        </div>
        <div class="flow-legend no-print">
          <span class="leg-item"><span class="cap-dot cap-ok">●</span> Capable</span>
          <span class="leg-item"><span class="cap-dot cap-fail">●</span> Incapable / Not verified</span>
          <span class="leg-item"><span class="cap-dot cap-na">●</span> Not applicable</span>
          <span class="leg-item frd-ok-leg">● Low transport risk</span>
          <span class="leg-item frd-warn-leg">● Medium risk</span>
          <span class="leg-item frd-crit-leg">● High risk</span>
        </div>
      </section>

      <!-- ══ SECTION 2: AREAS OF ATTENTION ══ -->
      <section class="card" v-if="riskResult.alerts.length > 0">
        <div class="card-head">
          <span class="card-head-num">02</span>
          <span class="card-head-title">Areas of Attention</span>
          <div class="alert-counts no-print">
            <span v-if="riskResult.counts.critical" class="ac-badge ac-crit">{{ riskResult.counts.critical }} Critical</span>
            <span v-if="riskResult.counts.warning"  class="ac-badge ac-warn">{{ riskResult.counts.warning }} Warning</span>
          </div>
        </div>
        <div class="alerts-list">
          <div v-for="(a, i) in riskResult.alerts" :key="i"
            class="alert-row" :class="'ar-' + a.severity">
            <div class="ar-sev-bar"></div>
            <div class="ar-icon">{{ a.severity === 'critical' ? '⛔' : a.severity === 'warning' ? '⚠️' : 'ℹ️' }}</div>
            <div class="ar-content">
              <div class="ar-node">{{ a.node }}</div>
              <div class="ar-msg">{{ a.message }}</div>
            </div>
            <div class="ar-tag" :class="'art-' + a.severity">{{ a.severity }}</div>
          </div>
        </div>
      </section>

      <section class="card" v-else>
        <div class="card-head">
          <span class="card-head-num">02</span>
          <span class="card-head-title">Areas of Attention</span>
          <span class="card-head-badge chb-ok">No Issues</span>
        </div>
        <div class="no-issues-msg">
          <span class="no-issues-icon">✓</span>
          <span>No attention areas identified for this route.</span>
        </div>
      </section>

      <!-- ══ SECTION 3: RISK BY CATEGORY ══ -->
      <section class="card">
        <div class="card-head">
          <span class="card-head-num">03</span>
          <span class="card-head-title">Risk by Category</span>
          <span class="card-head-sub">Temperature · Carriers · Certificates · Handling</span>
        </div>
        <div class="risk-cats-grid">
          <div v-for="cat in riskCategories" :key="cat.key"
            class="risk-cat" :class="'rc-' + cat.level">
            <div class="rc-top">
              <span class="rc-icon">{{ cat.icon }}</span>
              <div class="rc-info">
                <span class="rc-label">{{ cat.label }}</span>
                <span class="rc-summary">{{ cat.summary }}</span>
              </div>
              <span class="rc-badge" :class="'rcb-' + cat.level">
                {{ cat.level === 'low' ? 'Low Risk' : cat.level === 'medium' ? 'Medium Risk' : 'High Risk' }}
              </span>
            </div>
            <ul v-if="cat.issues.length" class="rc-issues">
              <li v-for="issue in cat.issues" :key="issue">{{ issue }}</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- ══ SECTION 4: NODE RISK PROFILE ══ -->
      <section class="card">
        <div class="card-head">
          <span class="card-head-num">04</span>
          <span class="card-head-title">Node Risk Profile</span>
          <span class="card-head-sub">Per-node temperature · fragile · certificates · validation</span>
        </div>

        <div class="matrix-wrap">
          <table class="matrix-table">
            <thead>
              <tr>
                <th class="mth-sticky">#</th>
                <th class="mth-sticky">Role</th>
                <th class="mth-sticky">Location / Company</th>
                <th>Temp Capable</th>
                <th>Fragile Capable</th>
                <th>Certificates</th>
                <th>Validation</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(node, idx) in lane.nodes" :key="idx" :class="matrixRowClass(idx, node)">
                <td class="mtd-num">{{ idx + 1 }}</td>
                <td>
                  <span class="role-pill" :class="roleClass(idx)">{{ nodeRoleLabel(idx) }}</span>
                </td>
                <td class="mtd-loc">
                  <div class="mtd-loc-name">{{ node.location || '—' }}</div>
                  <div class="mtd-loc-co">{{ node.company || '—' }}</div>
                </td>
                <td>
                  <div class="cap-cell" :class="nodeCapTemp(node).ok ? 'cap-cell-ok' : 'cap-cell-fail'">
                    <span class="cap-cell-icon">{{ nodeCapTemp(node).ok ? '✓' : '✗' }}</span>
                    <span class="cap-cell-txt">{{ nodeCapTemp(node).reason }}</span>
                  </div>
                </td>
                <td>
                  <div class="cap-cell" :class="nodeCapFragile(node).na ? 'cap-cell-na' : nodeCapFragile(node).ok ? 'cap-cell-ok' : 'cap-cell-fail'">
                    <span class="cap-cell-icon">{{ nodeCapFragile(node).na ? '—' : nodeCapFragile(node).ok ? '✓' : '✗' }}</span>
                    <span class="cap-cell-txt">{{ nodeCapFragile(node).reason }}</span>
                  </div>
                </td>
                <td class="mtd-certs">
                  <span v-if="!node.certificates?.length" class="cert-none">None registered</span>
                  <template v-else>
                    <span v-for="cert in (node.certificates || [])" :key="cert"
                      class="cert-chip"
                      :class="(lane.certificates || []).includes(cert) ? 'cc-req' : 'cc-extra'">{{ cert }}</span>
                  </template>
                  <span v-for="cert in missingCerts(node)" :key="'m-'+cert" class="cert-chip cc-miss">⚠ {{ cert }}</span>
                </td>
                <td>
                  <span class="val-pill" :class="'vp-' + (node.validationStatus || 'pending')">
                    {{ node.validationStatus || 'pending' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ══ SECTION 5: TRANSPORT SEGMENT ANALYSIS ══ -->
      <section class="card" v-if="transportSegments.length > 0">
        <div class="card-head">
          <span class="card-head-num">05</span>
          <span class="card-head-title">Transport Segment Analysis</span>
          <span v-if="effectiveTempBlock" class="card-head-badge" :style="tempTagStyle">
            {{ tempBlockIcon(effectiveTempBlock) }} {{ tempBlockLabel(effectiveTempBlock) }}
          </span>
        </div>

        <div class="seg-list">
          <div v-for="seg in transportSegments" :key="seg.label"
            class="seg-row" :class="'seg-' + seg.risk">
            <div class="seg-indicator" :class="'si-' + seg.risk"></div>
            <div class="seg-body">
              <div class="seg-top">
                <span class="seg-transport">{{ seg.transportIcon }} {{ seg.transportLabel }}</span>
                <span class="seg-route">{{ seg.label }}</span>
                <span class="seg-pill" :class="'sp-' + seg.risk">{{ riskLabel(seg.risk) }} Risk</span>
              </div>
              <div class="seg-reason">{{ seg.reason }}</div>
              <div v-if="seg.tempCapable !== null" class="seg-cap-note" :class="seg.tempCapable ? 'scn-ok' : 'scn-fail'">
                {{ seg.tempCapable ? '✓ Carrier is temperature-capable' : '✗ Carrier temperature capability not confirmed' }}
              </div>
            </div>
          </div>
        </div>
      </section>


    </div><!-- end rpt-body -->

    <!-- PRINT FOOTER -->
    <div class="print-footer print-only">
      <span>4VISO Supply Chain Intelligence · Confidential · Not for distribution</span>
      <span>{{ generatedDate }}</span>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { TEMP_BLOCKS, TRANSPORT_TEMP_RISK } from '@/data/tempBlocks'
import { TRANSPORT_COMPANIES, WAREHOUSES, AIRPORTS } from '@/data/companies'

const router = useRouter()
const route  = useRoute()
const lane   = ref(null)
const generatedDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

// ─── Load ──────────────────────────────────────────────────────────
onMounted(() => {
  const laneId = route.query.laneId
  if (!laneId) { router.push('/lanes'); return }
  try {
    const saved = JSON.parse(localStorage.getItem('savedLanes') || '[]')
    const found = saved.find(l => String(l.id) === String(laneId))
    if (found) { lane.value = found; return }
  } catch {}
  try {
    const rd = JSON.parse(localStorage.getItem('routeData') || '{}')
    lane.value = { id: laneId, origin: { city: rd.origin || '' }, destination: { city: rd.destination || '' },
      nodes: [], certificates: rd.certificates || [], tempBlock: rd.tempBlock || '',
      productType: rd.productType || '', status: 'draft' }
  } catch {}
})

// ─── Static lookups ───────────────────────────────────────────────
const ALL_COMPANIES = [...TRANSPORT_COMPANIES, ...WAREHOUSES, ...AIRPORTS]
const CARRIER_CERTS = new Map()
ALL_COMPANIES.forEach(c => { if (!CARRIER_CERTS.has(c.name)) CARRIER_CERTS.set(c.name, c.certificates) })

const transportTypes = [
  { value: 'road',      label: 'Road',      icon: '🚛' },
  { value: 'air',       label: 'Air',       icon: '✈️' },
  { value: 'sea',       label: 'Sea',       icon: '🚢' },
  { value: 'rail',      label: 'Rail',      icon: '🚆' },
  { value: 'warehouse', label: 'Warehouse', icon: '🏭' },
]
const facilityTypes = [
  { value: 'warehouse',    icon: '🏭' },
  { value: 'distribution', icon: '🏢' },
  { value: 'hub',          icon: '🔀' },
  { value: 'airport',      icon: '✈️' },
  { value: 'port',         icon: '⚓' },
  { value: 'rail_yard',    icon: '🚆' },
]

const transportIcon     = (t) => transportTypes.find(x => x.value === t)?.icon ?? '🚛'
const transportLabelText = (t) => transportTypes.find(x => x.value === t)?.label ?? t
const facilityIconForNode = (n) => facilityTypes.find(f => f.value === n?.type)?.icon ?? '📦'

const tempBlockIcon  = (k) => TEMP_BLOCKS.find(b => b.key === k)?.icon ?? ''
const tempBlockLabel = (k) => TEMP_BLOCKS.find(b => b.key === k)?.label ?? k ?? ''
const tempBlockSub   = (k) => TEMP_BLOCKS.find(b => b.key === k)?.sub ?? ''
const tempBlockColor = (k) => TEMP_BLOCKS.find(b => b.key === k)?.color ?? '#6b7280'

const effectiveTempBlock = computed(() => lane.value?.tempBlock || lane.value?.cargoProfile?.tempBlock || '')
const tempTagStyle = computed(() => {
  const c = tempBlockColor(effectiveTempBlock.value)
  return { background: c + '18', color: c, border: '1.5px solid ' + c + '55' }
})

const nodeRoleLabel = (idx) => {
  if (!lane.value) return ''
  if (idx === 0) return 'Origin'
  if (idx === lane.value.nodes.length - 1) return 'Destination'
  return `Stop ${idx}`
}
const flowNodeClass = (idx) => idx === 0 ? 'fn-origin' : idx === (lane.value?.nodes.length - 1) ? 'fn-dest' : 'fn-stop'
const roleClass     = (idx) => idx === 0 ? 'rp-origin' : idx === (lane.value?.nodes.length - 1) ? 'rp-dest' : 'rp-stop'

const getTempRisk = (transport) => {
  const tb = effectiveTempBlock.value
  if (!tb || !transport) return null
  return TRANSPORT_TEMP_RISK[tb]?.[transport] || null
}
const riskLabel = (risk) => risk === 'ok' ? 'Low' : risk === 'warning' ? 'Medium' : risk === 'critical' ? 'High' : ''

// ─── Per-node temperature capability ─────────────────────────────
const nodeCapTemp = (node) => {
  const tb = effectiveTempBlock.value
  if (!tb || tb === 'ambient') return { ok: true, reason: 'Ambient — no cold chain required' }
  const tbData = TEMP_BLOCKS.find(b => b.key === tb)
  if (!tbData) return { ok: true, reason: '' }

  const wh = WAREHOUSES.find(w => w.company === node.company || w.name === node.location)
  if (wh) {
    const zone = wh.tempZones.find(z => z.min <= tbData.min && z.max >= tbData.max)
    if (zone) return { ok: true, reason: `${zone.label} zone (${zone.min} to ${zone.max}°C)` }
    return { ok: false, reason: `No ${tbData.label} zone. Has: ${wh.tempZones.map(z => z.label).join(', ')}` }
  }

  const ap = AIRPORTS.find(a => a.company === node.company || a.name === node.location || a.city === node.location)
  if (ap) {
    if (ap.coldChain) return { ok: true, reason: 'Airport has certified cold chain' }
    return { ok: false, reason: 'Airport lacks certified cold chain infrastructure' }
  }

  const tc = TRANSPORT_COMPANIES.find(c => c.name === node.company)
  if (tc) {
    if (tc.certificates.includes('GDP')) return { ok: true, reason: 'GDP-certified carrier' }
    return { ok: false, reason: 'Carrier not GDP-certified for temperature control' }
  }

  return { ok: false, reason: 'Not found in database — unverified' }
}

// ─── Per-node fragile capability ──────────────────────────────────
const nodeCapFragile = (node) => {
  if (!node.fragile) return { ok: true, reason: 'Not flagged fragile', na: true }
  const company = ALL_COMPANIES.find(c => c.name === node.company)
  if (!company) return { ok: false, reason: 'Company not in database', na: false }
  if (company.certificates?.includes('ISO 13485'))
    return { ok: true, reason: 'ISO 13485 certified', na: false }
  if (company.certificates?.includes('GDP'))
    return { ok: true, reason: 'GDP covers fragile pharma handling', na: false }
  return { ok: false, reason: 'No certification for fragile handling', na: false }
}

// ─── Compliance engine ────────────────────────────────────────────
const compliance = computed(() => {
  if (!lane.value) return { status: 'N/A', passed: 0, total: 5, checks: [] }
  const required = lane.value.certificates || []
  const nodes    = lane.value.nodes || []
  const tb       = effectiveTempBlock.value

  const certFails = []
  nodes.forEach(n => {
    const miss = required.filter(c => !(n.certificates || []).includes(c))
    if (miss.length) certFails.push(`${n.location || 'Node'}: missing ${miss.join(', ')}`)
  })

  const valFails = nodes
    .filter(n => n.validationStatus !== 'validated')
    .map(n => `${n.location || 'Node'}: ${n.validationStatus === 'pending' ? 'pending review' : 'not validated'}`)

  const tempFails = []
  if (tb && tb !== 'ambient') {
    nodes.forEach(n => {
      const cap = nodeCapTemp(n)
      if (!cap.ok) tempFails.push(`${n.location || 'Node'}: ${cap.reason}`)
    })
  }

  const carrierFails = []
  nodes.forEach(n => {
    if (!n.company) { carrierFails.push(`No company at ${n.location || 'Node'}`); return }
    const dbCerts = CARRIER_CERTS.get(n.company)
    if (!dbCerts) { carrierFails.push(`${n.company}: not in certified database`); return }
    const miss = required.filter(c => !dbCerts.includes(c))
    if (miss.length) carrierFails.push(`${n.company}: missing ${miss.join(', ')}`)
  })

  const airFails = nodes
    .filter(n => n.transport === 'air' && !(n.certificates || []).includes('IATA'))
    .map(n => `${n.location || 'Node'}: air transport without IATA`)

  const checks = [
    { key: 'certCoverage', label: 'Certificate Coverage', ok: certFails.length === 0,  fails: certFails,   skip: false },
    { key: 'validation',   label: 'Node Validation',      ok: valFails.length === 0,    fails: valFails,    skip: false },
    { key: 'tempChain',    label: 'Temperature Chain',    ok: tempFails.length === 0,   fails: tempFails,   skip: !tb || tb === 'ambient' },
    { key: 'carrier',      label: 'Carrier Compliance',   ok: carrierFails.length === 0,fails: carrierFails,skip: false },
    { key: 'airTransport', label: 'Air Transport',        ok: airFails.length === 0,    fails: airFails,    skip: !nodes.some(n => n.transport === 'air') },
  ]

  const passed = checks.filter(c => c.ok).length
  const status = passed === 5 ? 'COMPLIANT' : passed >= 3 ? 'CONDITIONAL' : passed >= 1 ? 'NON-COMPLIANT' : 'CRITICAL'
  return { status, passed, total: checks.length, checks }
})

// ─── Risk score ───────────────────────────────────────────────────
const riskScore = computed(() => {
  const counts = riskResult.value.counts
  let score = 100
  score -= (counts.critical || 0) * 20
  score -= (counts.warning  || 0) * 10
  score = Math.max(0, score)
  const level = score >= 75 ? 'LOW' : score >= 45 ? 'MEDIUM' : 'HIGH'
  const label = level === 'LOW' ? 'Low Risk' : level === 'MEDIUM' ? 'Medium Risk' : 'High Risk'
  return { score, level, label }
})

// ─── Risk categories ─────────────────────────────────────────────
const riskCategories = computed(() => {
  if (!lane.value) return []
  const nodes    = lane.value.nodes || []
  const required = lane.value.certificates || []
  const tb       = effectiveTempBlock.value
  const cats     = []

  // Temperature Chain
  const tempIssues = []
  if (tb && tb !== 'ambient') {
    nodes.forEach(n => {
      const cap = nodeCapTemp(n)
      if (!cap.ok) tempIssues.push(`${n.location || 'Node'}: ${cap.reason}`)
    })
    nodes.slice(1).forEach(n => {
      const re = TRANSPORT_TEMP_RISK[tb]?.[n.transport || 'road']
      if (re && !re.ok) tempIssues.push(`${transportLabelText(n.transport)} leg: ${re.reason}`)
    })
  }
  cats.push({
    key: 'temp', icon: '🌡️', label: 'Temperature Chain',
    level: (!tb || tb === 'ambient') ? 'low' : tempIssues.length > 1 ? 'high' : tempIssues.length === 1 ? 'medium' : 'low',
    summary: !tb ? 'No temperature requirement set' : tb === 'ambient' ? 'Ambient — no cold chain required' : tempIssues.length ? `${tempIssues.length} temperature gap${tempIssues.length > 1 ? 's' : ''} identified` : 'Cold chain integrity confirmed across all nodes',
    issues: tempIssues,
  })

  // Carrier & Facility
  const carrierIssues = []
  const ALL_DB = [...TRANSPORT_COMPANIES, ...WAREHOUSES, ...AIRPORTS]
  nodes.forEach(n => {
    if (!n.company) { carrierIssues.push(`${n.location || 'Node'}: no company assigned`); return }
    const db = ALL_DB.find(c => c.name === n.company)
    if (!db) { carrierIssues.push(`${n.company}: not in certified database`); return }
    if (tb && tb !== 'ambient' && !(db.tempCapabilities || []).includes(tb))
      carrierIssues.push(`${n.company}: not ${tb} capable`)
    if (lane.value.fragile && !db.fragileCapable)
      carrierIssues.push(`${n.company}: not certified for fragile handling`)
  })
  cats.push({
    key: 'carrier', icon: '🏭', label: 'Carriers & Facilities',
    level: carrierIssues.length > 2 ? 'high' : carrierIssues.length > 0 ? 'medium' : 'low',
    summary: carrierIssues.length ? `${carrierIssues.length} carrier gap${carrierIssues.length > 1 ? 's' : ''} requiring attention` : 'All carriers and facilities verified',
    issues: carrierIssues,
  })

  // Certification coverage
  const certIssues = []
  nodes.forEach(n => {
    const miss = required.filter(c => !(n.certificates || []).includes(c))
    if (miss.length) certIssues.push(`${n.location || 'Node'}: missing ${miss.join(', ')}`)
  })
  cats.push({
    key: 'cert', icon: '📋', label: 'Certification Coverage',
    level: certIssues.length > 1 ? 'high' : certIssues.length === 1 ? 'medium' : 'low',
    summary: required.length === 0 ? 'No certifications required for this route' : certIssues.length ? `${certIssues.length} certification gap${certIssues.length > 1 ? 's' : ''} across the route` : 'Full certificate coverage confirmed',
    issues: certIssues,
  })

  // Handling & Validation
  const handlingIssues = []
  nodes.forEach(n => {
    const fc = nodeCapFragile(n)
    if (!fc.na && !fc.ok) handlingIssues.push(`${n.location || 'Node'}: ${fc.reason}`)
    if (n.validationStatus === 'not_validated') handlingIssues.push(`${n.location || 'Node'}: node not validated`)
    else if (n.validationStatus === 'pending')  handlingIssues.push(`${n.location || 'Node'}: validation pending`)
  })
  cats.push({
    key: 'handling', icon: '📦', label: 'Handling & Validation',
    level: handlingIssues.some(i => i.includes('not validated')) ? 'high' : handlingIssues.length > 0 ? 'medium' : 'low',
    summary: handlingIssues.length ? `${handlingIssues.length} handling or validation concern${handlingIssues.length > 1 ? 's' : ''}` : 'Handling and validation requirements met',
    issues: handlingIssues,
  })

  return cats
})

// ─── Transport segments ───────────────────────────────────────────
const transportSegments = computed(() => {
  if (!lane.value) return []
  const nodes = lane.value.nodes || []
  return nodes.slice(1).map((n, i) => {
    const from = nodes[i].location || `Node ${i + 1}`
    const to   = n.location || `Node ${i + 2}`
    const t    = n.transport || 'road'
    const riskEntry = getTempRisk(t)
    const tc = TRANSPORT_COMPANIES.find(c => c.name === n.company)
    const tempCapable = tc ? tc.certificates.includes('GDP') : null
    return {
      label: `${from} → ${to}`,
      transportIcon: transportIcon(t),
      transportLabel: transportLabelText(t),
      risk: riskEntry?.risk || 'ok',
      reason: riskEntry?.reason || 'No specific temperature risk for this transport mode.',
      tempCapable,
    }
  })
})

// ─── Risk alerts ──────────────────────────────────────────────────
const riskResult = computed(() => {
  if (!lane.value) return { alerts: [], counts: {}, level: 'ok' }
  const nodes    = lane.value.nodes || []
  const required = lane.value.certificates || []
  const tb       = effectiveTempBlock.value
  const alerts   = []

  nodes.forEach(n => {
    const loc = n.location || 'Unknown'
    if (n.validationStatus === 'not_validated')
      alerts.push({ severity: 'critical', node: loc, message: `${loc}: not validated — shipments may be non-compliant.` })
    else if (n.validationStatus === 'pending')
      alerts.push({ severity: 'warning', node: loc, message: `${loc}: awaiting validation review.` })

    const missing = required.filter(c => !(n.certificates || []).includes(c))
    if (missing.length)
      alerts.push({ severity: 'critical', node: loc, message: `${loc}: missing required certificates — ${missing.join(', ')}.` })

    const cap = nodeCapTemp(n)
    if (!cap.ok)
      alerts.push({ severity: 'critical', node: loc, message: `${loc}: temperature incapable — ${cap.reason}` })

    const fragCap = nodeCapFragile(n)
    if (!fragCap.na && !fragCap.ok)
      alerts.push({ severity: 'warning', node: loc, message: `${loc}: fragile handling not certified — ${fragCap.reason}` })

    if (tb && tb !== 'ambient' && n.transport && n.transport !== 'warehouse') {
      const re = TRANSPORT_TEMP_RISK[tb]?.[n.transport]
      if (re && !re.ok) alerts.push({ severity: re.risk, node: loc, message: `${loc}: ${re.reason}` })
    }
  })

  const counts = { critical: 0, warning: 0, info: 0 }
  alerts.forEach(a => { counts[a.severity] = (counts[a.severity] || 0) + 1 })
  return { alerts, counts, level: counts.critical > 0 ? 'critical' : counts.warning > 0 ? 'warning' : 'ok' }
})

const missingCerts = (node) => {
  if (!lane.value) return []
  return (lane.value.certificates || []).filter(c => !(node.certificates || []).includes(c))
}

const matrixRowClass = (idx, node) => {
  const hasCritical = missingCerts(node).length > 0 || node.validationStatus === 'not_validated' || !nodeCapTemp(node).ok
  const hasWarning  = node.validationStatus === 'pending' || (!nodeCapFragile(node).na && !nodeCapFragile(node).ok)
  return hasCritical ? 'mtr-crit' : hasWarning ? 'mtr-warn' : ''
}

const printReport = () => window.print()
</script>

<style scoped>
/* ═══ BASE ════════════════════════════════════════════════════════ */
.report-page {
  min-height: 100vh;
  background: var(--bg-color);
  font-family: inherit;
  color: #1e293b;
}

/* ═══ NAV BAR ═════════════════════════════════════════════════════ */
.rpt-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 40px; height: 60px;
  background: var(--primary);
  position: sticky; top: 0; z-index: 20;
  box-shadow: 0 2px 12px rgba(0,0,0,0.25);
}
.rpt-nav-left  { display: flex; align-items: center; gap: 16px; }
.rpt-nav-logo  { height: 28px; object-fit: contain; filter: brightness(0) invert(1); }
.rpt-nav-divider { width: 1px; height: 24px; background: rgba(255,255,255,0.2); }
.rpt-nav-title { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.75); letter-spacing: 0.02em; }
.rpt-nav-right { display: flex; gap: 10px; }



.btn-back {
  padding: 7px 16px; background: transparent; color: rgba(255,255,255,0.65);
  border: 1px solid rgba(255,255,255,0.2); border-radius: 7px;
  font-size: 13px; font-weight: 500; cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.btn-back:hover { background: rgba(255,255,255,0.08); color: white; }
.btn-pdf {
  padding: 7px 18px; background: var(--primary); color: white;
  border: none; border-radius: 7px; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: background 0.15s;
}
.btn-pdf:hover { background: var(--primary-light); }

/* ═══ HERO BAND ═══════════════════════════════════════════════════ */
.hero-band {
  background: var(--primary);
  padding: 28px 40px 32px;
  display: flex; align-items: center; justify-content: space-between; gap: 32px;
  flex-wrap: wrap;
}
.hero-left  { display: flex; flex-direction: column; gap: 12px; }
.hero-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.hero-logo   { height: 22px; object-fit: contain; filter: brightness(0) invert(1); opacity: 0.9; }
.hero-report-label { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 0.1em; }
.hero-route { display: flex; align-items: center; gap: 12px; }
.hero-city  { font-size: 26px; font-weight: 800; color: white; letter-spacing: -0.02em; }
.hero-arrow { font-size: 22px; color: var(--primary); }
.hero-meta  { display: flex; gap: 8px; flex-wrap: wrap; }
.hero-tag {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
}
.hero-tag-grey { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.65); }

.hero-right { display: flex; align-items: center; gap: 20px; }

/* Score ring */
.score-ring {
  width: 90px; height: 90px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 4px solid rgba(255,255,255,0.08);
  position: relative; flex-shrink: 0;
}
.score-ring.sr-COMPLIANT     { border-color: #22c55e; box-shadow: 0 0 20px rgba(34,197,94,0.3); }
.score-ring.sr-CONDITIONAL   { border-color: #f59e0b; box-shadow: 0 0 20px rgba(245,158,11,0.3); }
.score-ring.sr-NON-COMPLIANT { border-color: #ef4444; box-shadow: 0 0 20px rgba(239,68,68,0.3); }
.score-ring.sr-CRITICAL      { border-color: #991b1b; box-shadow: 0 0 20px rgba(153,27,27,0.4); }
.score-ring.sr-LOW    { border-color: #22c55e; box-shadow: 0 0 20px rgba(34,197,94,0.3); }
.score-ring.sr-MEDIUM { border-color: #f59e0b; box-shadow: 0 0 20px rgba(245,158,11,0.3); }
.score-ring.sr-HIGH   { border-color: #ef4444; box-shadow: 0 0 20px rgba(239,68,68,0.4); }

.score-ring-inner { display: flex; flex-direction: column; align-items: center; line-height: 1; }
.score-num   { font-size: 30px; font-weight: 800; color: white; }
.score-denom { font-size: 13px; color: rgba(255,255,255,0.5); font-weight: 600; }
.score-label { font-size: 9px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 2px; }

.score-verdict { display: flex; flex-direction: column; gap: 8px; }
.verdict-badge {
  padding: 6px 16px; border-radius: 6px; font-size: 12px; font-weight: 800;
  letter-spacing: 0.06em; text-align: center;
}
.vb-COMPLIANT     { background: rgba(34,197,94,0.2);  color: #4ade80; border: 1px solid rgba(34,197,94,0.3); }
.vb-CONDITIONAL   { background: rgba(245,158,11,0.2); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); }
.vb-NON-COMPLIANT { background: rgba(239,68,68,0.2);  color: #f87171; border: 1px solid rgba(239,68,68,0.3); }
.vb-CRITICAL      { background: rgba(153,27,27,0.4);  color: #fca5a5; border: 1px solid #991b1b; }
.vb-LOW    { background: rgba(34,197,94,0.2);  color: #4ade80; border: 1px solid rgba(34,197,94,0.3); }
.vb-MEDIUM { background: rgba(245,158,11,0.2); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); }
.vb-HIGH   { background: rgba(239,68,68,0.2);  color: #f87171; border: 1px solid rgba(239,68,68,0.3); }

.verdict-counts { display: flex; flex-direction: column; gap: 3px; }
.vcnt { font-size: 11px; font-weight: 600; }
.vcnt-crit { color: #f87171; }
.vcnt-warn { color: #fbbf24; }
.vcnt-ok   { color: #4ade80; }

/* ═══ BODY ════════════════════════════════════════════════════════ */
.rpt-body {
  max-width: 1200px; margin: 0 auto;
  padding: 32px 40px 80px;
  display: flex; flex-direction: column; gap: 20px;
}
.rpt-empty { display: flex; flex-direction: column; align-items: center; padding: 80px; gap: 16px; color: #64748b; }
.rpt-empty-icon { font-size: 40px; }

/* ═══ CARD ════════════════════════════════════════════════════════ */
.card {
  background: white; border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04);
}
.card-head {
  display: flex; align-items: center; gap: 12px;
  padding: 18px 28px 16px;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfc;
}
.card-head-num {
  font-size: 11px; font-weight: 800; color: white;
  background: var(--primary); border-radius: 5px; padding: 2px 7px;
  letter-spacing: 0.04em;
}
.card-head-title {
  font-size: 15px; font-weight: 700; color: #0f172a;
}
.card-head-sub {
  font-size: 12px; color: #94a3b8; margin-left: auto;
}
.card-head-badge {
  margin-left: auto; padding: 3px 10px; border-radius: 5px; font-size: 11px; font-weight: 700; letter-spacing: 0.04em;
}
.chb-COMPLIANT     { background: #dcfce7; color: #15803d; }
.chb-CONDITIONAL   { background: #fef9c3; color: #854d0e; }
.chb-NON-COMPLIANT { background: #fef2f2; color: #b91c1c; }
.chb-CRITICAL      { background: #fef2f2; color: #7f1d1d; border: 1px solid #ef4444; }
.chb-ok { background: #dcfce7; color: #15803d; }

/* ═══ FLOW TRACK ══════════════════════════════════════════════════ */
.flow-track {
  display: flex; align-items: flex-start; overflow-x: auto;
  padding: 24px 28px; gap: 0;
}
.flow-node {
  min-width: 130px; max-width: 160px; flex-shrink: 0;
  padding: 14px 12px; border-radius: 12px; border: 2px solid #e2e8f0;
  background: #f8fafc; display: flex; flex-direction: column; gap: 4px;
}
.flow-node.fn-origin, .flow-node.fn-dest { border-color: var(--primary); background: #f0fdf4; }
.flow-node.fn-stop  { border-color: #6366f1; background: #f5f3ff; }
.fn-role { font-size: 8.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.09em; color: #64748b; }
.fn-ico  { font-size: 18px; }
.fn-loc  { font-size: 12px; font-weight: 700; color: #0f172a; line-height: 1.2; }
.fn-co   { font-size: 10px; color: #64748b; }
.fn-caps { display: flex; gap: 5px; margin-top: 6px; }
.cap-dot {
  width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center;
  justify-content: center; font-size: 11px; cursor: default; flex-shrink: 0;
}
.cap-ok   { background: #dcfce7; color: #15803d; }
.cap-fail { background: #fef2f2; color: #b91c1c; }
.cap-na   { background: #f1f5f9; color: #94a3b8; }

.flow-conn {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; min-width: 56px; gap: 3px; padding-top: 28px; flex-shrink: 0;
}
.fc-line { width: 100%; height: 3px; border-radius: 2px; background: #B8C2CC; }
.fct-road      { background: #D97448; }
.fct-air       { background: #D4A83A; }
.fct-sea       { background: #2585A3; }
.fct-rail      { background: #5488CB; }
.fct-warehouse { background: #8267CF; }
.fc-label { display: flex; flex-direction: column; align-items: center; gap: 1px; }
.fc-transport-name { font-size: 8.5px; font-weight: 700; color: #64748b; white-space: nowrap; }
.fc-risk-dot { width: 10px; height: 10px; border-radius: 50%; }
.frd-ok       { background: #22c55e; }
.frd-warning  { background: #f59e0b; }
.frd-critical { background: #ef4444; }

.flow-legend {
  display: flex; gap: 16px; flex-wrap: wrap;
  padding: 10px 28px 16px; border-top: 1px solid #f8fafc;
  font-size: 11px; color: #64748b;
}
.leg-item { display: flex; align-items: center; gap: 4px; }
.frd-ok-leg   { color: #22c55e; font-weight: 600; }
.frd-warn-leg { color: #f59e0b; font-weight: 600; }
.frd-crit-leg { color: #ef4444; font-weight: 600; }

/* ═══ COMPLIANCE CHECKS GRID ══════════════════════════════════════ */
.checks-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px; padding: 24px 28px;
}
.check-card {
  border-radius: 10px; border: 1.5px solid #e2e8f0;
  padding: 16px; display: flex; flex-direction: column; gap: 10px;
}
.check-card.cc-pass { border-color: #86efac; background: #f0fdf4; }
.check-card.cc-fail { border-color: #fca5a5; background: #fff5f5; }
.check-card.cc-skip { border-color: #e2e8f0; background: #fafbfc; opacity: 0.6; }

.cc-top { display: flex; align-items: flex-start; gap: 12px; }
.cc-icon-wrap {
  width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 800;
}
.cc-pass .cc-icon-wrap { background: #22c55e; color: white; }
.cc-fail .cc-icon-wrap { background: #ef4444; color: white; }
.cc-skip .cc-icon-wrap { background: #e2e8f0; color: #94a3b8; }

.cc-info { display: flex; flex-direction: column; gap: 2px; }
.cc-label { font-size: 13px; font-weight: 700; color: #1e293b; }
.cc-status-text { font-size: 11px; color: #64748b; }
.cc-pass .cc-status-text { color: #16a34a; }
.cc-fail .cc-status-text { color: #b91c1c; font-weight: 600; }

.cc-fails { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 4px; }
.cc-fails li {
  font-size: 11.5px; color: #b91c1c; padding: 5px 8px;
  background: rgba(239,68,68,0.07); border-radius: 5px; border-left: 2px solid #ef4444;
}

/* ═══ NODE MATRIX ═════════════════════════════════════════════════ */
.matrix-wrap { overflow-x: auto; padding: 0 0 2px; }
.matrix-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.matrix-table th {
  padding: 10px 16px; background: #f8fafc; border-bottom: 2px solid #e2e8f0;
  font-size: 10.5px; font-weight: 700; color: #64748b; text-transform: uppercase;
  letter-spacing: 0.05em; white-space: nowrap; text-align: left;
}
.mth-sticky { position: sticky; left: 0; z-index: 1; background: #f8fafc; }
.matrix-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
.matrix-table tr:last-child td { border-bottom: none; }
.matrix-table tr.mtr-crit td { background: #fff5f5; }
.matrix-table tr.mtr-warn td { background: #fffbf0; }
.matrix-table tr:not(.mtr-crit):not(.mtr-warn):hover td { background: #fafbfc; }

.mtd-num  { font-size: 11px; font-weight: 700; color: #94a3b8; width: 32px; }
.mtd-loc-name { font-weight: 600; color: #1e293b; }
.mtd-loc-co   { font-size: 11px; color: #64748b; margin-top: 1px; }
.mtd-certs    { display: flex; flex-wrap: wrap; gap: 4px; align-items: flex-start; }

.role-pill { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; white-space: nowrap; }
.rp-origin, .rp-dest { background: #dcfce7; color: #15803d; }
.rp-stop  { background: #ede9fe; color: #6d28d9; }

.cap-cell {
  display: flex; gap: 6px; align-items: flex-start;
  padding: 6px 8px; border-radius: 6px; min-width: 140px;
}
.cap-cell-ok   { background: #f0fdf4; }
.cap-cell-fail { background: #fef2f2; }
.cap-cell-na   { background: #f8fafc; }
.cap-cell-icon {
  font-size: 11px; font-weight: 800; flex-shrink: 0; margin-top: 1px;
  width: 16px; text-align: center;
}
.cap-cell-ok   .cap-cell-icon { color: #16a34a; }
.cap-cell-fail .cap-cell-icon { color: #dc2626; }
.cap-cell-na   .cap-cell-icon { color: #94a3b8; }
.cap-cell-txt { font-size: 11px; line-height: 1.4; color: #475569; }
.cap-cell-ok   .cap-cell-txt { color: #15803d; }
.cap-cell-fail .cap-cell-txt { color: #b91c1c; }

.cert-chip {
  font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 4px; white-space: nowrap;
  display: inline-block;
}
.cc-req   { background: #dcfce7; color: #15803d; }
.cc-extra { background: #f1f5f9; color: #475569; }
.cc-miss  { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
.cert-none { font-size: 11px; color: #94a3b8; font-style: italic; }

.val-pill {
  font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 4px; white-space: nowrap;
}
.vp-validated     { background: #dcfce7; color: #15803d; }
.vp-pending       { background: #fef9c3; color: #854d0e; }
.vp-not_validated { background: #fef2f2; color: #b91c1c; }

/* ═══ TRANSPORT SEGMENTS ══════════════════════════════════════════ */
.seg-list { display: flex; flex-direction: column; gap: 0; padding: 16px 28px 24px; }
.seg-row {
  display: flex; align-items: stretch; gap: 0;
  border-radius: 10px; margin-bottom: 10px; overflow: hidden;
  border: 1px solid #e2e8f0;
}
.seg-row.seg-ok       { border-color: #86efac; }
.seg-row.seg-warning  { border-color: #fde68a; }
.seg-row.seg-critical { border-color: #fca5a5; }

.seg-indicator { width: 5px; flex-shrink: 0; }
.si-ok       { background: #22c55e; }
.si-warning  { background: #f59e0b; }
.si-critical { background: #ef4444; }

.seg-body { flex: 1; padding: 14px 16px; display: flex; flex-direction: column; gap: 6px; background: white; }
.seg-top  { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.seg-transport { font-size: 13px; font-weight: 700; color: #1e293b; }
.seg-route     { font-size: 12px; color: #64748b; flex: 1; min-width: 0; }
.seg-pill { font-size: 10.5px; font-weight: 700; padding: 2px 9px; border-radius: 4px; white-space: nowrap; }
.sp-ok       { background: #dcfce7; color: #15803d; }
.sp-warning  { background: #fef9c3; color: #854d0e; }
.sp-critical { background: #fef2f2; color: #b91c1c; }
.seg-reason  { font-size: 12px; color: #64748b; }
.seg-cap-note { font-size: 11px; font-weight: 600; padding: 4px 8px; border-radius: 5px; display: inline-block; }
.scn-ok   { background: #f0fdf4; color: #16a34a; }
.scn-fail { background: #fef2f2; color: #dc2626; }

/* ═══ RISK ALERTS ═════════════════════════════════════════════════ */
.alert-counts { display: flex; gap: 6px; margin-left: auto; }
.ac-badge { font-size: 10.5px; font-weight: 700; padding: 3px 10px; border-radius: 5px; }
.ac-crit { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
.ac-warn { background: #fef9c3; color: #854d0e; border: 1px solid #fde68a; }

.alerts-list { display: flex; flex-direction: column; padding: 16px 28px 24px; gap: 8px; }
.alert-row {
  display: flex; align-items: flex-start; gap: 0;
  border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0;
}
.ar-critical { border-color: #fca5a5; }
.ar-warning  { border-color: #fde68a; }
.ar-info     { border-color: #bfdbfe; }

.ar-sev-bar { width: 4px; flex-shrink: 0; }
.ar-critical .ar-sev-bar { background: #ef4444; }
.ar-warning  .ar-sev-bar { background: #f59e0b; }
.ar-info     .ar-sev-bar { background: #3b82f6; }

.ar-icon { padding: 12px 10px 12px 12px; font-size: 14px; flex-shrink: 0; }
.ar-content { flex: 1; padding: 12px 12px 12px 0; display: flex; flex-direction: column; gap: 2px; }
.ar-node { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #475569; }
.ar-msg  { font-size: 13px; color: #1e293b; line-height: 1.4; }
.ar-tag  { align-self: flex-start; margin: 12px 12px 12px 0; font-size: 9.5px; font-weight: 700; padding: 2px 7px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
.art-critical { background: #fef2f2; color: #b91c1c; }
.art-warning  { background: #fef9c3; color: #854d0e; }
.art-info     { background: #eff6ff; color: #1d4ed8; }

/* ═══ NO-ISSUES MESSAGE ═══════════════════════════════════════════ */
.no-issues-msg {
  display: flex; align-items: center; gap: 12px;
  padding: 24px 28px; color: #15803d; font-size: 14px; font-weight: 500;
}
.no-issues-icon { font-size: 20px; }

/* ═══ RISK CATEGORIES ═════════════════════════════════════════════ */
.risk-cats-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px; padding: 24px 28px;
}
.risk-cat {
  border-radius: 10px; border: 1.5px solid #e2e8f0;
  padding: 16px; display: flex; flex-direction: column; gap: 10px;
}
.rc-low    { border-color: #86efac; background: #f0fdf4; }
.rc-medium { border-color: #fde68a; background: #fffbeb; }
.rc-high   { border-color: #fca5a5; background: #fff5f5; }

.rc-top { display: flex; align-items: flex-start; gap: 10px; }
.rc-icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
.rc-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.rc-label   { font-size: 13px; font-weight: 700; color: #1e293b; }
.rc-summary { font-size: 11.5px; color: #64748b; line-height: 1.4; }
.rc-low    .rc-summary { color: #15803d; }
.rc-medium .rc-summary { color: #92400e; }
.rc-high   .rc-summary { color: #b91c1c; }

.rc-badge {
  font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 5px;
  white-space: nowrap; flex-shrink: 0; align-self: flex-start;
}
.rcb-low    { background: #dcfce7; color: #15803d; }
.rcb-medium { background: #fef9c3; color: #854d0e; }
.rcb-high   { background: #fef2f2; color: #b91c1c; }

.rc-issues {
  margin: 0; padding: 0; list-style: none;
  display: flex; flex-direction: column; gap: 4px;
}
.rc-issues li {
  font-size: 11.5px; padding: 5px 8px;
  border-radius: 5px; line-height: 1.4;
}
.rc-low    .rc-issues li { color: #15803d; background: rgba(34,197,94,0.08); border-left: 2px solid #22c55e; }
.rc-medium .rc-issues li { color: #92400e; background: rgba(245,158,11,0.08); border-left: 2px solid #f59e0b; }
.rc-high   .rc-issues li { color: #b91c1c; background: rgba(239,68,68,0.07); border-left: 2px solid #ef4444; }

/* ═══ PRINT ═══════════════════════════════════════════════════════ */
.print-only { display: none; }

@media print {
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .no-print  { display: none !important; }
  .print-only { display: flex !important; }

  .report-page { background: white; }

  .print-cover {
    justify-content: space-between; align-items: flex-start;
    padding: 0 0 24px; border-bottom: 3px solid var(--primary); margin-bottom: 28px;
  }
  .pcover-left  { display: flex; align-items: center; gap: 16px; }
  .pcover-logo  { height: 36px; object-fit: contain; filter: brightness(0); }
  .pcover-titles { display: flex; flex-direction: column; gap: 3px; }
  .pcover-main  { font-size: 20px; font-weight: 800; color: var(--primary); }
  .pcover-sub   { font-size: 11px; color: #64748b; }
  .pcover-right { display: flex; align-items: center; }
  .pcover-status {
    padding: 6px 16px; border-radius: 6px; font-size: 13px; font-weight: 800; letter-spacing: 0.05em;
  }
  .cs-COMPLIANT     { background: #dcfce7; color: #15803d; }
  .cs-CONDITIONAL   { background: #fef9c3; color: #854d0e; }
  .cs-NON-COMPLIANT { background: #fef2f2; color: #b91c1c; }
  .cs-CRITICAL      { background: #fef2f2; color: #7f1d1d; border: 1px solid #ef4444; }
  .cs-LOW    { background: #dcfce7; color: #15803d; }
  .cs-MEDIUM { background: #fef9c3; color: #854d0e; }
  .cs-HIGH   { background: #fef2f2; color: #b91c1c; }

  .rpt-body { padding: 0; max-width: 100%; gap: 16px; }
  .card { border-radius: 8px; box-shadow: none; break-inside: avoid; page-break-inside: avoid; }
  .card-head { padding: 12px 20px; }
  .risk-cats-grid { padding: 16px 20px; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .flow-track  { padding: 16px 20px; }
  .matrix-wrap { overflow: visible; }
  .seg-list    { padding: 12px 20px 16px; }
  .alerts-list { padding: 12px 20px 16px; }

  .print-footer {
    display: flex !important; justify-content: space-between; align-items: center;
    border-top: 1px solid #e2e8f0; padding: 12px 0; margin-top: 20px;
    font-size: 10px; color: #94a3b8;
  }
}
</style>
