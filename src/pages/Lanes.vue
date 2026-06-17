<template>
  <div class="lanes-page">

    <!-- ── HEADER ── -->
    <header class="page-header">
      <div class="hdr-left">
        <h1 class="page-title">Supply Chain Lanes</h1>
        <span class="count-pill">{{ allLanes.length }}</span>
      </div>
      <div class="hdr-right">
        <div class="search-outer">
          <div class="search-wrap">
            <svg class="s-ico" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input v-model="searchQuery" type="text" placeholder="Search lanes, companies, cities…" class="search-inp" @focus="searchFocused = true" @blur="onSearchBlur" />
            <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''; searchFocused = false">×</button>
          </div>
          <!-- Suggestions dropdown -->
          <div class="suggestions-drop" v-if="searchFocused && companySuggestions.length">
            <div
              v-for="s in companySuggestions" :key="s.id"
              class="suggestion-item"
              @mousedown.prevent="searchQuery = s.city || s.company; searchFocused = false"
            >
              <span class="sug-kind" :class="s._kind">{{ s._kind }}</span>
              <div class="sug-text">
                <span class="sug-label">{{ s._label }}</span>
                <span class="sug-sub">{{ s._sub }}</span>
              </div>
            </div>
          </div>
        </div>
        <button class="btn-new" @click="$router.push('/create')">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          New Lane
        </button>
      </div>
    </header>

    <!-- ── FILTER BAR ── -->
    <div class="filter-bar">
      <div class="filter-group">
        <span class="filter-label">Status</span>
        <button
          v-for="s in statusOptions" :key="s.value"
          class="filter-pill"
          :class="[s.cls, { active: statusFilter === s.value }]"
          @click="statusFilter = statusFilter === s.value ? '' : s.value"
        >{{ s.label }}</button>
      </div>
      <div class="filter-group">
        <span class="filter-label">Risk</span>
        <button
          v-for="r in riskOptions" :key="r.value"
          class="filter-pill"
          :class="[r.cls, { active: riskFilter === r.value }]"
          @click="riskFilter = riskFilter === r.value ? '' : r.value"
        >{{ r.label }}</button>
      </div>
    </div>

    <!-- ── LOADING ── -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>Loading lanes…</span>
    </div>

    <!-- ── ERROR ── -->
    <div v-else-if="loadError" class="error-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
      <span>{{ loadError }}</span>
      <button class="err-retry" @click="loadLanes">Retry</button>
    </div>

    <template v-else>
      <!-- ── SEARCH CONTEXT ── -->
      <div v-if="searchQuery.trim()" class="search-ctx">
        {{ displayedLanes.length }} result{{ displayedLanes.length !== 1 ? 's' : '' }} for
        <strong>"{{ searchQuery }}"</strong>
      </div>

      <!-- ── EMPTY STATE ── -->
      <div v-if="displayedLanes.length === 0" class="empty-state">
        <div class="empty-icon-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        </div>
        <p class="empty-title">{{ searchQuery ? 'No lanes found' : 'No lanes yet' }}</p>
        <p class="empty-sub">{{ searchQuery ? 'Try a different search term.' : 'Create your first supply chain lane to get started.' }}</p>
        <button v-if="!searchQuery" class="btn-empty" @click="$router.push('/create')">New Lane</button>
      </div>

      <!-- ══════════════════════════════════════════════════════════
           LANE SECTIONS
           ══════════════════════════════════════════════════════════ -->
      <div v-else class="lanes-list">
        <section
          v-for="lane in displayedLanes"
          :key="lane.id"
          class="lane-section"
          :class="{
            'has-critical': complianceMap[lane.id]?.status === 'CRITICAL',
            'has-noncompliant': complianceMap[lane.id]?.status === 'NON-COMPLIANT',
          }"
        >
          <!-- ── LANE TITLE BAR ── -->
          <div class="lane-title-bar">
            <div class="lane-title-left">
              <!-- Compliance badge (primary rating) -->
              <span class="comp-badge" :class="complianceMap[lane.id]?.status">
                <span class="comp-status">{{ complianceMap[lane.id]?.status }}</span>
                <span class="comp-fraction">{{ complianceMap[lane.id]?.passed }}/{{ complianceMap[lane.id]?.total }}</span>
              </span>
              <span class="risk-score-pill" :class="'rsp-' + laneRisk(lane).level">
                {{ laneRisk(lane).score }}/100
              </span>
              <span class="lane-name">{{ laneName(lane) }}</span>
              <span class="product-pill" :class="productClass(laneProduct(lane))">{{ laneProduct(lane) }}</span>
              <span v-if="lane.status && lane.status !== 'draft'" class="lane-status-badge" :class="'ls-' + lane.status">{{ lane.status }}</span>
              <span class="lane-date">{{ formatDate(laneDate(lane)) }}</span>
            </div>
            <div class="lane-title-right">
              <span v-for="cert in (lane.certificates || [])" :key="cert" class="cert-tag">{{ cert }}</span>

              <!-- Inline delete confirmation -->
              <template v-if="confirmingDeleteId === lane.id">
                <span class="delete-confirm-msg">Delete this lane?</span>
                <button class="del-confirm-btn" @click="deleteLane(lane.id)">Yes, delete</button>
                <button class="del-cancel-btn" @click="confirmingDeleteId = null">Cancel</button>
              </template>
              <template v-else>
                <button class="del-btn" @click="confirmingDeleteId = lane.id" title="Delete lane">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
                <button class="open-btn" @click="$router.push({ path: '/canvas', query: { laneId: lane.id } })">
                  Edit Route
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              </template>
            </div>
          </div>

          <!-- ── COMPLIANCE STRIP (collapsible) ── -->
          <div class="compliance-section">
            <div class="cs-hdr" @click="toggleComplianceStrip(lane.id)">
              <div class="cs-hdr-left">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="cs-shield-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span class="cs-hdr-label">Compliance</span>
                <!-- 5 pills — always visible in header -->
                <div class="cs-pills">
                  <span
                    v-for="c in complianceMap[lane.id]?.checks"
                    :key="c.key"
                    class="cs-pill"
                    :class="c.skip ? 'skip' : c.ok ? 'pass' : 'fail'"
                    :title="c.label"
                  >
                    <span class="cs-pill-icon">{{ c.skip ? '○' : c.ok ? '✓' : '✗' }}</span>
                    <span class="cs-pill-label">{{ c.label.split(' ')[0] }}</span>
                  </span>
                </div>
              </div>
              <svg class="cs-chevron" :class="{ open: openComplianceStrips[lane.id] }" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
            </div>

            <!-- Expanded: one row per check -->
            <div v-if="openComplianceStrips[lane.id]" class="cs-body">
              <div
                v-for="c in complianceMap[lane.id]?.checks"
                :key="c.key"
                class="cs-row"
                :class="c.skip ? 'skip' : c.ok ? 'pass' : 'fail'"
              >
                <span class="cs-row-icon">{{ c.skip ? '○' : c.ok ? '✓' : '✗' }}</span>
                <div class="cs-row-content">
                  <span class="cs-row-label">{{ c.label }}</span>
                  <span class="cs-row-detail">
                    <template v-if="c.skip">Not applicable for this lane</template>
                    <template v-else-if="c.ok">All clear</template>
                    <template v-else>{{ c.fails.join(' · ') }}</template>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- ── RISK SUMMARY STRIP (node-level alerts, collapsible) ── -->
          <div v-if="laneRisk(lane).alerts.length > 0" class="risk-strip">
            <div class="risk-strip-hdr" @click="toggleRiskPanel(lane.id)">
              <div class="risk-strip-left">
                <svg class="risk-strip-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                <span class="risk-strip-count">{{ laneRisk(lane).alerts.length }} risk alert{{ laneRisk(lane).alerts.length !== 1 ? 's' : '' }}</span>
                <span class="risk-strip-breakdown">
                  <span v-if="laneRisk(lane).counts.critical" class="rb critical">{{ laneRisk(lane).counts.critical }} critical</span>
                  <span v-if="laneRisk(lane).counts.warning"  class="rb warning">{{ laneRisk(lane).counts.warning }} warning</span>
                  <span v-if="laneRisk(lane).counts.info"     class="rb info">{{ laneRisk(lane).counts.info }} info</span>
                </span>
              </div>
              <svg class="risk-strip-chevron" :class="{ open: openRiskPanels[lane.id] }" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            <div v-if="openRiskPanels[lane.id]" class="risk-strip-body">
              <div v-for="(alert, ai) in laneRisk(lane).alerts" :key="ai" class="risk-alert-row" :class="alert.severity">
                <span class="ra-dot"></span>
                <span class="ra-node">{{ alert.node }}</span>
                <span class="ra-msg">{{ alert.message }}</span>
              </div>
            </div>
          </div>

          <!-- ── CONNECTED NODE DIAGRAM ── -->
          <div class="diagram-scroll">
            <div class="diagram-track">
              <template v-for="(node, idx) in lane.nodes" :key="node.id">

                <!-- NODE CARD (redesigned key-value layout) -->
                <div class="node-card" :class="[
                  nodeTypeClass(node, idx, lane.nodes.length),
                  validationClass(node.validationStatus),
                  { 'has-alerts': nodeAlerts(node, lane).length > 0 },
                ]">
                  <!-- Header: facility icon + location name + validation dot -->
                  <div class="card-hdr">
                    <div class="card-hdr-left">
                      <span class="fac-icon">{{ facilityIcon(node.type) }}</span>
                      <span class="card-hdr-loc">{{ node.location }}</span>
                    </div>
                    <span class="validation-dot" :class="node.validationStatus" :title="validationLabel(node.validationStatus)"></span>
                  </div>

                  <!-- Role badge -->
                  <div class="card-role-row">
                    <span class="type-badge" :class="nodeTypeClass(node, idx, lane.nodes.length)">
                      {{ nodeTypeLabel(node, idx, lane.nodes.length) }}
                    </span>
                  </div>

                  <!-- Key-value data rows -->
                  <div class="card-kv-list">
                    <div class="kv-row">
                      <span class="kv-label">Company</span>
                      <span class="kv-val" :class="{ 'kv-unverified': !carrierKnown(node.company) }">
                        {{ node.company || '—' }}
                        <span v-if="node.company && !carrierKnown(node.company)" class="kv-warn-icon" title="Not in certified carrier database">!</span>
                      </span>
                    </div>
                    <div class="kv-row">
                      <span class="kv-label">Type</span>
                      <span class="kv-val">{{ facilityLabel(node.type) }}</span>
                    </div>
                    <div class="kv-row">
                      <span class="kv-label">Temp</span>
                      <span v-if="node.temperatureControl" class="kv-val kv-temp">{{ node.temperatureControl.min }}°C – {{ node.temperatureControl.max }}°C</span>
                      <span v-else class="kv-val kv-muted">No control</span>
                    </div>
                    <div class="kv-row" v-if="node.transport">
                      <span class="kv-label">Via</span>
                      <span class="kv-val">{{ transportIcon(node.transport) }} {{ node.transport }}</span>
                    </div>
                    <div class="kv-row" v-if="node.fragile">
                      <span class="kv-label">Handling</span>
                      <span class="kv-val kv-fragile">Fragile</span>
                    </div>
                  </div>

                  <!-- Per-node risk alerts (inline, max 2) -->
                  <div class="node-alerts" v-if="nodeAlerts(node, lane).length > 0">
                    <div v-for="(a, ai) in nodeAlerts(node, lane).slice(0, 2)" :key="ai" class="node-alert" :class="a.severity">
                      <span class="na-dot"></span>
                      <span class="na-text">{{ a.short }}</span>
                    </div>
                  </div>

                  <!-- Certificates: required shown as pass/fail, extra in neutral -->
                  <div class="card-certs">
                    <template v-if="(lane.certificates || []).length > 0">
                      <span
                        v-for="c in (lane.certificates || [])"
                        :key="'req-' + c"
                        class="node-cert"
                        :class="(node.certificates || []).includes(c) ? 'cert-ok' : 'cert-missing'"
                        :title="(node.certificates || []).includes(c) ? 'Required — held' : 'Required — MISSING'"
                      >{{ c }}</span>
                      <span
                        v-for="c in (node.certificates || []).filter(c => !(lane.certificates || []).includes(c))"
                        :key="'ext-' + c"
                        class="node-cert cert-extra"
                      >{{ c }}</span>
                    </template>
                    <span v-else-if="node.certificates && node.certificates.length">
                      <span v-for="c in node.certificates" :key="c" class="node-cert cert-extra">{{ c }}</span>
                    </span>
                    <span v-else class="node-cert cert-missing">No certs</span>
                  </div>
                </div>

                <!-- TRANSPORT CONNECTOR -->
                <div v-if="idx < lane.nodes.length - 1" class="connector-wrap">
                  <div class="connector-line" :class="transportClass(lane.nodes[idx + 1].transport)"></div>
                  <button class="connector-badge" :class="transportClass(lane.nodes[idx + 1].transport)" :title="'Transport: ' + lane.nodes[idx + 1].transport">
                    {{ transportIcon(lane.nodes[idx + 1].transport) }}
                    <span class="connector-label">{{ lane.nodes[idx + 1].transport }}</span>
                  </button>
                  <div class="connector-line" :class="transportClass(lane.nodes[idx + 1].transport)"></div>
                </div>

              </template>

              <!-- ADD NODE -->
              <button class="add-node-btn" @click="$router.push({ path: '/canvas', query: { laneId: lane.id } })" title="Add a node to this lane">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
              </button>
            </div>
          </div>

          <!-- ── BACKUP ROUTES ── -->
          <div v-if="backupLanesFor(lane).length > 0" class="backup-section">
            <div class="backup-hdr" @click="toggleBackup(lane.id)">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              <span>{{ backupLanesFor(lane).length }} backup route{{ backupLanesFor(lane).length !== 1 ? 's' : '' }} for {{ lane.origin?.city }} → {{ lane.destination?.city }}</span>
              <svg class="backup-chevron" :class="{ open: openBackupPanels[lane.id] }" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            <div v-if="openBackupPanels[lane.id]" class="backup-list">
              <div v-for="bl in backupLanesFor(lane)" :key="bl.id" class="backup-row">
                <span class="comp-badge sm" :class="complianceMap[bl.id]?.status">
                  {{ complianceMap[bl.id]?.status }}
                  <span class="comp-fraction">{{ complianceMap[bl.id]?.passed }}/{{ complianceMap[bl.id]?.total }}</span>
                </span>
                <div class="backup-info">
                  <span class="backup-name">{{ laneName(bl) }}</span>
                  <span class="backup-meta">{{ bl.nodes?.length }} stops · {{ laneProduct(bl) }} · {{ formatDate(laneDate(bl)) }}</span>
                </div>
                <button class="backup-view-btn" @click="$router.push({ path: '/canvas', query: { laneId: bl.id } })">View →</button>
              </div>
            </div>
          </div>

        </section>
      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { api } from '../services/api'
import lanesData from '@/data/lanes.json'
import { TRANSPORT_COMPANIES, WAREHOUSES, AIRPORTS, searchEntities } from '@/data/companies'
import { TRANSPORT_TEMP_RISK } from '@/data/tempBlocks'
import { computeRiskScore } from '@/composables/useRiskScore'

// ── Company certificate lookup map ─────────────────────────────
const CARRIER_CERTS = new Map()
TRANSPORT_COMPANIES.forEach(c => CARRIER_CERTS.set(c.name, c.certificates))
WAREHOUSES.forEach(w  => { if (!CARRIER_CERTS.has(w.company)) CARRIER_CERTS.set(w.company, w.certificates) })
AIRPORTS.forEach(a   => { if (!CARRIER_CERTS.has(a.company)) CARRIER_CERTS.set(a.company, a.certificates) })

const carrierKnown = (companyName) => companyName && CARRIER_CERTS.has(companyName)

// ── State ───────────────────────────────────────────────────────
const allLanes    = ref([])
const isLoading   = ref(true)
const loadError   = ref('')
const searchQuery = ref('')
const searchFocused = ref(false)

const openComplianceStrips = reactive({})
const openRiskPanels       = reactive({})
const openBackupPanels     = reactive({})

const statusFilter = ref('')
const riskFilter   = ref('')

const statusOptions = [
  { value: 'COMPLIANT',     label: 'Compliant',     cls: 'fp-green' },
  { value: 'CONDITIONAL',   label: 'Conditional',   cls: 'fp-amber' },
  { value: 'NON-COMPLIANT', label: 'Non-Compliant', cls: 'fp-red'   },
  { value: 'CRITICAL',      label: 'Critical',      cls: 'fp-crit'  },
]

const riskOptions = [
  { value: 'critical', label: 'Critical', cls: 'fp-red'  },
  { value: 'warning',  label: 'Warning',  cls: 'fp-amber' },
  { value: 'ok',       label: 'Clear',    cls: 'fp-green' },
]

const normalizeApiLane = (l) => ({
  ...l,
  id:          l._id  || l.id,
  productType: l.productType || l.cargoProfile?.productType,
  createdAt:   l.createdAt  || l.created_at,
})

const mergeLocalLanes = (base) => {
  try {
    const raw = localStorage.getItem('savedLanes')
    if (!raw) return base
    const local = JSON.parse(raw)
    if (!Array.isArray(local)) return base
    const existingIds = new Set(base.map(l => String(l.id)))
    const fresh = local
      .map(l => ({ ...l, id: String(l.id), _local: true }))
      .filter(l => !existingIds.has(l.id))
    return [...base, ...fresh]
  } catch {
    return base
  }
}

const loadLanes = async () => {
  isLoading.value  = true
  loadError.value  = ''
  try {
    const data = await api.get('/lanes')
    const base = Array.isArray(data) ? data.map(normalizeApiLane) : lanesData
    allLanes.value = mergeLocalLanes(base)
  } catch {
    // API unavailable (e.g. BYPASS_AUTH mode) — fall back to demo data
    allLanes.value = mergeLocalLanes(lanesData)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadLanes)

const onSearchBlur = () => { setTimeout(() => { searchFocused.value = false }, 150) }

// ── Computed ────────────────────────────────────────────────────
const displayedLanes = computed(() => {
  let lanes = allLanes.value

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    lanes = lanes.filter(l =>
      laneName(l).toLowerCase().includes(q) ||
      (l.origin?.city || '').toLowerCase().includes(q) ||
      (l.destination?.city || '').toLowerCase().includes(q) ||
      (l.nodes || []).some(n =>
        (n.location || '').toLowerCase().includes(q) ||
        (n.company  || '').toLowerCase().includes(q)
      )
    )
  }

  if (statusFilter.value) {
    lanes = lanes.filter(l => complianceMap.value[l.id]?.status === statusFilter.value)
  }

  if (riskFilter.value) {
    lanes = lanes.filter(l => laneRisk(l).level === riskFilter.value)
  }

  return lanes
})

const companySuggestions = computed(() => searchEntities(searchQuery.value))

const complianceMap = computed(() => {
  const map = {}
  allLanes.value.forEach(l => { map[l.id] = laneCompliance(l) })
  return map
})

// ── 5-Check Compliance Engine ────────────────────────────────────
const laneCompliance = (lane) => {
  const required = lane.certificates || []
  const nodes    = lane.nodes        || []

  // 1. Certificate coverage — every node holds all required lane certs
  const certFails = []
  nodes.forEach(n => {
    const missing = required.filter(c => !(n.certificates || []).includes(c))
    if (missing.length) certFails.push(`${n.location}: missing ${missing.join(', ')}`)
  })

  // 2. Temperature Chain — transport modes must be appropriate for the cargo's temp block
  const tempBlock = lane.tempBlock || lane.cargoProfile?.tempBlock || ''
  const tempFails = []
  if (tempBlock && tempBlock !== 'ambient') {
    nodes.forEach(n => {
      const t = n.transport || ''
      if (!t || t === 'warehouse') return
      const riskEntry = TRANSPORT_TEMP_RISK[tempBlock]?.[t]
      if (riskEntry && !riskEntry.ok) tempFails.push(`${n.location || 'Node'}: ${t} transport — ${riskEntry.reason}`)
    })
  }
  const hasTemp = !!tempBlock

  // 4. Carrier compliance — company in DB and holds required certs
  const carrierFails = []
  nodes.forEach(n => {
    if (!n.company) { carrierFails.push(`No company at ${n.location}`); return }
    const dbCerts = CARRIER_CERTS.get(n.company)
    if (!dbCerts) { carrierFails.push(`${n.company}: not in certified carrier database`); return }
    const missing = required.filter(c => !dbCerts.includes(c))
    if (missing.length) carrierFails.push(`${n.company}: missing ${missing.join(', ')}`)
  })

  const checks = [
    { key: 'certCoverage', label: 'Certificate Coverage', ok: certFails.length === 0,    fails: certFails,    skip: false },
    { key: 'tempChain',    label: 'Temperature Chain',    ok: tempFails.length === 0,    fails: tempFails,    skip: !hasTemp },
    { key: 'carrier',      label: 'Carrier Compliance',   ok: carrierFails.length === 0, fails: carrierFails, skip: false },
  ]

  const passed = checks.filter(c => c.ok).length
  const total  = checks.length
  const status = passed === total ? 'COMPLIANT'
    : passed >= 3 ? 'CONDITIONAL'
    : passed >= 1 ? 'NON-COMPLIANT'
    : 'CRITICAL'

  return { status, passed, total, checks }
}

// ── Existing Risk Engine (node-level alerts) ─────────────────────
const nodeAlerts = (node, lane) => {
  const alerts = []
  const loc = node.location || 'Unknown'

  const required = lane.certificates || []
  const held     = node.certificates || []
  const missing  = required.filter(c => !held.includes(c))
  if (missing.length) {
    alerts.push({ severity: 'critical', short: `Missing ${missing.join(', ')}`, message: `${loc} is missing required certificate${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}.`, node: loc })
  }

  // Temperature risk based on cargo tempBlock
  const tempBlock = lane.tempBlock || lane.cargoProfile?.tempBlock || ''
  if (tempBlock && tempBlock !== 'ambient' && node.transport && node.transport !== 'warehouse') {
    const riskEntry = TRANSPORT_TEMP_RISK[tempBlock]?.[node.transport]
    if (riskEntry && !riskEntry.ok) {
      alerts.push({
        severity: riskEntry.risk,
        short: `${node.transport} transport risk`,
        message: `${loc}: ${riskEntry.reason}`,
        node: loc,
      })
    }
  }

  if (node.fragile && node.type !== 'warehouse' && node.type !== 'hub') {
    alerts.push({ severity: 'info', short: 'Fragile at transit point', message: `${loc} handles fragile goods but is a ${facilityLabel(node.type).toLowerCase()}, not a warehouse.`, node: loc })
  }

  if (!held.length) {
    alerts.push({ severity: 'warning', short: 'No certificates', message: `${loc} holds no certifications.`, node: loc })
  }

  return alerts
}

const laneRisk = (lane) => {
  const alerts = (lane.nodes || []).flatMap(n => nodeAlerts(n, lane))
  const counts  = { critical: 0, warning: 0, info: 0 }
  alerts.forEach(a => { counts[a.severity] = (counts[a.severity] || 0) + 1 })
  const tb       = lane.tempBlock || lane.cargoProfile?.tempBlock || ''
  const { score, level, label } = computeRiskScore(lane.nodes || [], lane.certificates || [], tb)
  return { score, level, label, alerts, counts }
}

// ── Delete lane ─────────────────────────────────────────────────
const confirmingDeleteId = ref(null)

const deleteLane = async (id) => {
  try { await api.delete(`/lanes/${id}`) } catch (_) {}

  // Remove from localStorage
  try {
    const saved = JSON.parse(localStorage.getItem('savedLanes') || '[]')
    localStorage.setItem('savedLanes', JSON.stringify(saved.filter(l => String(l.id) !== String(id))))
  } catch (_) {}

  allLanes.value = allLanes.value.filter(l => String(l.id) !== String(id))
  confirmingDeleteId.value = null
}

// ── Toggle handlers ─────────────────────────────────────────────
const toggleComplianceStrip = (id) => { openComplianceStrips[id] = !openComplianceStrips[id] }
const toggleRiskPanel        = (id) => { openRiskPanels[id]       = !openRiskPanels[id] }
const toggleBackup           = (id) => { openBackupPanels[id]     = !openBackupPanels[id] }

// ── Backup lanes ────────────────────────────────────────────────
const backupLanesFor = (lane) => {
  const oCity = lane.origin?.city?.toLowerCase()
  const dCity = lane.destination?.city?.toLowerCase()
  if (!oCity || !dCity) return []
  return allLanes.value.filter(l => {
    if (l.id === lane.id) return false
    return l.origin?.city?.toLowerCase() === oCity && l.destination?.city?.toLowerCase() === dCity
  })
}

// ── Lane field helpers (handles both API and static JSON formats) ─
const laneName = (lane) => {
  if (lane.name) return lane.name
  const o = lane.origin?.city       || lane.origin?.location       || 'Origin'
  const d = lane.destination?.city  || lane.destination?.location  || 'Destination'
  return `${o} → ${d}`
}
const laneProduct = (lane) => lane.productType || lane.cargoProfile?.productType || 'Pharmaceutical'
const laneDate    = (lane) => lane.createdAt   || lane.created_at  || null

// ── Display helpers ─────────────────────────────────────────────
const productClass = (type) => ({
  'Pharmaceutical': 'pharma', 'pharmaceutical': 'pharma',
  'Vaccines': 'vaccines',     'vaccines':       'vaccines',
  'Biological': 'biological', 'biological':     'biological',
  'Medical Devices': 'medical','medical_devices':'medical',
}[type] ?? 'pharma')

const formatDate = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const nodeTypeClass  = (_node, idx, total) => idx === 0 ? 'origin' : idx === total - 1 ? 'destination' : 'intermediary'
const nodeTypeLabel  = (_node, idx, total) => idx === 0 ? 'Origin' : idx === total - 1 ? 'Destination' : `Stop ${idx}`
const validationClass = (s) => s || 'not_validated'
const validationLabel = (s) => s === 'validated' ? 'Validated' : s === 'pending' ? 'Pending review' : 'Not validated'

const facilityIcon  = (t) => ({ warehouse: '🏭', airport: '✈️', hub: '🔀', port: '⚓', distribution: '🏢' }[t] ?? '📦')
const facilityLabel = (t) => ({ warehouse: 'Warehouse', airport: 'Airport', hub: 'Hub', port: 'Port', distribution: 'Distribution' }[t] ?? t)
const transportIcon = (t) => ({ road: '🚛', air: '✈️', sea: '🚢', rail: '🚆' }[t] ?? '🚛')
const transportClass = (t) => t || 'road'
</script>

<style scoped>
/* ── Page shell ────────────────────────────────────────────────── */
.lanes-page { display: flex; flex-direction: column; min-height: 100%; background: #f4f5f7; }

/* ── Sticky header ─────────────────────────────────────────────── */
.page-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; padding: 0 28px; height: 56px;
  background: #fff; border-bottom: 1px solid #e3e5e8;
  flex-shrink: 0; position: sticky; top: 0; z-index: 20;
}
.hdr-left  { display: flex; align-items: center; gap: 9px; }
.page-title { font-size: 15px; font-weight: 600; color: #0f172a; margin: 0; letter-spacing: -0.15px; }
.count-pill {
  display: inline-flex; align-items: center; justify-content: center;
  background: #f1f5f9; color: #64748b; font-size: 11px; font-weight: 600;
  padding: 2px 8px; border-radius: 999px; border: 1px solid #e2e8f0; min-width: 24px;
}
.hdr-right { display: flex; align-items: center; gap: 8px; }

/* ── Search + suggestions ──────────────────────────────────────── */
.search-outer { position: relative; }
.search-wrap  { position: relative; display: flex; align-items: center; }
.s-ico { position: absolute; left: 10px; color: #94a3b8; pointer-events: none; }
.search-inp {
  height: 32px; padding: 0 28px 0 30px; border: 1px solid #e2e8f0; border-radius: 7px;
  font-size: 12.5px; color: #1e293b; background: #f8fafc; width: 220px;
  transition: width .2s, border-color .15s, box-shadow .15s, background .15s; font-family: inherit;
}
.search-inp:focus { outline: none; border-color: var(--primary); background: #fff; box-shadow: 0 0 0 3px rgba(31,111,84,.08); width: 260px; }
.search-inp::placeholder { color: #c8d1dc; }
.clear-btn { position: absolute; right: 7px; background: none; border: none; font-size: 15px; color: #94a3b8; cursor: pointer; line-height: 1; padding: 2px 3px; border-radius: 4px; }
.clear-btn:hover { color: #475569; }

.suggestions-drop {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0;
  background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,.1); z-index: 100; overflow: hidden;
}
.suggestion-item {
  display: flex; align-items: center; gap: 10px; padding: 8px 12px; cursor: pointer;
  transition: background .1s;
}
.suggestion-item:hover { background: #f8fafc; }
.sug-kind {
  font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em;
  padding: 2px 6px; border-radius: 3px; white-space: nowrap; flex-shrink: 0;
}
.sug-kind.warehouse { background: #dcfce7; color: #15803d; }
.sug-kind.airport   { background: #dbeafe; color: #1d4ed8; }
.sug-kind.company   { background: #f3e8ff; color: #7c3aed; }
.sug-text { display: flex; flex-direction: column; min-width: 0; }
.sug-label { font-size: 12.5px; font-weight: 500; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sug-sub   { font-size: 11px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.btn-new {
  display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 13px;
  background: #0f172a; color: #fff; border: none; border-radius: 7px;
  font-size: 12.5px; font-weight: 500; cursor: pointer; font-family: inherit; white-space: nowrap;
  transition: background .15s;
}
.btn-new:hover { background: #1e293b; }

/* ── Filter bar ─────────────────────────────────────────────────── */
.filter-bar {
  display: flex; align-items: center; gap: 20px; padding: 7px 28px;
  background: #fff; border-bottom: 1px solid #e3e5e8; flex-shrink: 0; flex-wrap: wrap;
}
.filter-group { display: flex; align-items: center; gap: 6px; }
.filter-label {
  font-size: 10.5px; font-weight: 700; color: #94a3b8; text-transform: uppercase;
  letter-spacing: .07em; white-space: nowrap;
}
.filter-pill {
  height: 25px; padding: 0 10px; border-radius: 5px; font-size: 11px; font-weight: 500;
  border: 1px solid #e2e8f0; background: #f8fafc; color: #64748b;
  cursor: pointer; font-family: inherit; transition: all .13s; white-space: nowrap;
}
.filter-pill:hover { border-color: #cbd5e1; background: #f1f5f9; color: #334155; }
.filter-pill.active { border-color: transparent; color: #fff; }
.filter-pill.fp-green.active  { background: #15803d; }
.filter-pill.fp-amber.active  { background: #d97706; }
.filter-pill.fp-red.active    { background: #dc2626; }
.filter-pill.fp-crit.active   { background: #991b1b; }
.filter-pill.fp-blue.active   { background: #2563eb; }

/* ── Loading / Error ───────────────────────────────────────────── */
.loading-state { display: flex; align-items: center; gap: 10px; padding: 48px 28px; color: #64748b; font-size: 13px; }
.loading-spinner { width: 18px; height: 18px; border: 2px solid #e2e8f0; border-top-color: var(--primary); border-radius: 50%; animation: spin .8s linear infinite; flex-shrink: 0; }
@keyframes spin { to { transform: rotate(360deg); } }
.error-state { display: flex; align-items: center; gap: 10px; padding: 28px; background: #fef2f2; color: #dc2626; font-size: 13px; }
.err-retry { margin-left: 8px; padding: 4px 12px; background: #fff; border: 1px solid #fecaca; border-radius: 6px; color: #dc2626; font-size: 12px; cursor: pointer; font-family: inherit; }
.err-retry:hover { background: #fef2f2; }

/* ── Search context / Empty ────────────────────────────────────── */
.search-ctx { padding: 10px 28px 0; font-size: 12px; color: #64748b; }
.search-ctx strong { color: #1e293b; font-weight: 600; }
.empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 40px; text-align: center; }
.empty-icon-wrap { width: 48px; height: 48px; border-radius: 12px; background: #f1f5f9; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; color: #94a3b8; margin-bottom: 16px; }
.empty-title { font-size: 15px; font-weight: 600; color: #1e293b; margin: 0 0 6px; }
.empty-sub   { font-size: 13px; color: #6b7280; margin: 0 0 20px; max-width: 300px; line-height: 1.5; }
.btn-empty   { height: 34px; padding: 0 16px; background: #0f172a; color: #fff; border: none; border-radius: 7px; font-size: 13px; font-weight: 500; cursor: pointer; font-family: inherit; }
.btn-empty:hover { background: #1e293b; }

/* ══════════════════════════════════════════════════════════════
   LANE SECTIONS
   ══════════════════════════════════════════════════════════════ */
.lanes-list { padding: 20px 28px 40px; display: flex; flex-direction: column; gap: 20px; flex: 1; }

.lane-section {
  background: #fff; border: 1px solid #e3e5e8; border-radius: 14px; overflow: hidden;
  transition: box-shadow .2s;
}
.lane-section:hover          { box-shadow: 0 4px 20px rgba(0,0,0,.06); }
.lane-section.has-noncompliant { border-color: #fca5a5; }
.lane-section.has-critical   { border-color: #ef4444; box-shadow: 0 0 0 2px rgba(239,68,68,.1); }

/* ── Lane title bar ─────────────────────────────────────────────── */
.lane-title-bar {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 10px; padding: 14px 20px;
  border-bottom: 1px solid #eef0f3; background: #fafbfc;
}
.lane-title-left  { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.lane-title-right { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.lane-name  { font-size: 15px; font-weight: 600; color: #0f172a; letter-spacing: -0.2px; }
.risk-score-pill {
  display: inline-flex; align-items: center; height: 22px; padding: 0 8px;
  border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.02em;
  border: 1px solid currentColor; flex-shrink: 0;
}
.rsp-ok       { background: #dcfce7; color: #15803d; border-color: #86efac; }
.rsp-warning  { background: #fffbeb; color: #b45309; border-color: #fde68a; }
.rsp-critical { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
.lane-date  { font-size: 11.5px; color: #94a3b8; }

/* Compliance badge */
.comp-badge {
  display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px 3px 7px;
  border-radius: 5px; font-size: 10.5px; font-weight: 700; letter-spacing: .03em;
  white-space: nowrap; border: 1px solid;
}
.comp-badge.COMPLIANT     { background: #dcfce7; color: #15803d; border-color: #86efac; }
.comp-badge.CONDITIONAL   { background: #fffbeb; color: #b45309; border-color: #fde68a; }
.comp-badge.NON-COMPLIANT { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
.comp-badge.CRITICAL      { background: #fef2f2; color: #991b1b; border-color: #ef4444; animation: pulse-crit 1.8s ease-in-out infinite; }
@keyframes pulse-crit { 0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); } 50% { box-shadow: 0 0 0 3px rgba(239,68,68,.3); } }

.comp-badge.sm { font-size: 9.5px; padding: 2px 6px; }
.comp-fraction { opacity: .75; }

/* Product + status pills */
.product-pill {
  display: inline-flex; align-items: center; height: 20px; padding: 0 8px; border-radius: 4px;
  font-size: 10.5px; font-weight: 600; letter-spacing: .03em; white-space: nowrap;
}
.product-pill.pharma     { background: #dcfce7; color: #15803d; }
.product-pill.vaccines   { background: #f3e8ff; color: #7c3aed; }
.product-pill.biological { background: #dbeafe; color: #1d4ed8; }
.product-pill.medical    { background: #fff7ed; color: #c2410c; }

.lane-status-badge {
  display: inline-flex; align-items: center; height: 20px; padding: 0 8px; border-radius: 4px;
  font-size: 10px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase;
}
.ls-pending  { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
.ls-live     { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
.ls-archived { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }

.cert-tag {
  display: inline-flex; align-items: center; height: 20px; padding: 0 8px;
  border-radius: 4px; background: #f1f5f9; border: 1px solid #e2e8f0;
  font-size: 10.5px; font-weight: 600; color: #64748b; letter-spacing: .02em;
}
.open-btn {
  display: inline-flex; align-items: center; gap: 5px; height: 28px; padding: 0 12px;
  border: 1px solid #e2e8f0; border-radius: 6px; background: #fff; color: #64748b;
  font-size: 11.5px; font-weight: 500; cursor: pointer; font-family: inherit; white-space: nowrap;
  transition: all .13s;
}
.open-btn:hover { background: #0f172a; border-color: #0f172a; color: #fff; }

.del-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px;
  border: 1px solid #e2e8f0; border-radius: 6px; background: #fff; color: #94a3b8;
  cursor: pointer; transition: all .13s; flex-shrink: 0;
}
.del-btn:hover { border-color: #fca5a5; background: #fef2f2; color: #dc2626; }

.delete-confirm-msg {
  font-size: 12px; font-weight: 500; color: #dc2626; white-space: nowrap;
}
.del-confirm-btn {
  height: 28px; padding: 0 11px;
  background: #dc2626; color: #fff; border: none; border-radius: 6px;
  font-size: 11.5px; font-weight: 600; cursor: pointer; font-family: inherit; white-space: nowrap;
  transition: background .13s;
}
.del-confirm-btn:hover { background: #b91c1c; }
.del-cancel-btn {
  height: 28px; padding: 0 11px;
  border: 1px solid #e2e8f0; border-radius: 6px; background: #fff; color: #64748b;
  font-size: 11.5px; font-weight: 500; cursor: pointer; font-family: inherit; white-space: nowrap;
  transition: all .13s;
}
.del-cancel-btn:hover { background: #f8fafc; color: #334155; }

/* ══════════════════════════════════════════════════════════════
   COMPLIANCE STRIP
   ══════════════════════════════════════════════════════════════ */
.compliance-section { border-bottom: 1px solid #eef0f3; }

.cs-hdr {
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 20px; cursor: pointer; user-select: none;
  background: #f8fafb; transition: background .12s;
}
.cs-hdr:hover { background: #f1f5f9; }
.cs-hdr-left  { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.cs-shield-icon { color: #64748b; flex-shrink: 0; }
.cs-hdr-label   { font-size: 12px; font-weight: 600; color: #475569; white-space: nowrap; }

.cs-pills { display: flex; gap: 5px; flex-wrap: wrap; }
.cs-pill {
  display: inline-flex; align-items: center; gap: 3px; padding: 2px 7px;
  border-radius: 4px; font-size: 10.5px; font-weight: 600; white-space: nowrap;
  border: 1px solid;
}
.cs-pill.pass { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
.cs-pill.fail { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
.cs-pill.skip { background: #f8fafc; color: #94a3b8; border-color: #e2e8f0; }
.cs-pill-icon  { font-size: 10px; }

.cs-chevron { color: #94a3b8; transition: transform .2s; flex-shrink: 0; }
.cs-chevron.open { transform: rotate(180deg); }

/* Expanded compliance body */
.cs-body { background: #f8fafb; border-top: 1px solid #eef0f3; }
.cs-row {
  display: flex; align-items: flex-start; gap: 10px; padding: 8px 20px;
  border-bottom: 1px solid #eef0f3; font-size: 12px; line-height: 1.4;
}
.cs-row:last-child { border-bottom: none; }
.cs-row-icon { font-size: 12px; font-weight: 700; flex-shrink: 0; margin-top: 1px; min-width: 14px; }
.cs-row.pass .cs-row-icon { color: #16a34a; }
.cs-row.fail .cs-row-icon { color: #dc2626; }
.cs-row.skip .cs-row-icon { color: #94a3b8; }
.cs-row-content { display: flex; flex-direction: column; gap: 2px; }
.cs-row-label  { font-weight: 600; color: #334155; }
.cs-row.pass .cs-row-label { color: #15803d; }
.cs-row.fail .cs-row-label { color: #b91c1c; }
.cs-row.skip .cs-row-label { color: #94a3b8; }
.cs-row-detail { color: #64748b; }

/* ══════════════════════════════════════════════════════════════
   RISK SUMMARY STRIP
   ══════════════════════════════════════════════════════════════ */
.risk-strip { border-bottom: 1px solid #eef0f3; }
.risk-strip-hdr {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 20px; cursor: pointer; user-select: none;
  background: #fffbf5; transition: background .12s;
}
.risk-strip-hdr:hover { background: #fff7eb; }
.risk-strip-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.risk-strip-icon  { color: #d97706; flex-shrink: 0; }
.risk-strip-count { font-size: 12.5px; font-weight: 600; color: #92400e; }
.risk-strip-breakdown { display: flex; gap: 6px; }
.rb { font-size: 10.5px; font-weight: 600; padding: 1px 7px; border-radius: 3px; }
.rb.critical { background: #fef2f2; color: #dc2626; }
.rb.warning  { background: #fffbeb; color: #d97706; }
.rb.info     { background: #eff6ff; color: #2563eb; }
.risk-strip-chevron { color: #94a3b8; transition: transform .2s; flex-shrink: 0; }
.risk-strip-chevron.open { transform: rotate(180deg); }
.risk-strip-body { padding: 0 20px 12px; display: flex; flex-direction: column; gap: 4px; background: #fffbf5; }
.risk-alert-row { display: flex; align-items: flex-start; gap: 8px; padding: 7px 10px; border-radius: 6px; font-size: 12px; line-height: 1.4; }
.risk-alert-row.critical { background: #fef2f2; }
.risk-alert-row.warning  { background: #fffbeb; }
.risk-alert-row.info     { background: #eff6ff; }
.ra-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
.risk-alert-row.critical .ra-dot { background: #dc2626; }
.risk-alert-row.warning  .ra-dot { background: #d97706; }
.risk-alert-row.info     .ra-dot { background: #2563eb; }
.ra-node { font-weight: 600; color: #334155; white-space: nowrap; flex-shrink: 0; }
.ra-msg  { color: #64748b; }

/* ══════════════════════════════════════════════════════════════
   DIAGRAM TRACK
   ══════════════════════════════════════════════════════════════ */
.diagram-scroll { overflow-x: auto; overflow-y: hidden; padding: 24px 20px 28px; -webkit-overflow-scrolling: touch; }
.diagram-scroll::-webkit-scrollbar { height: 6px; }
.diagram-scroll::-webkit-scrollbar-track { background: transparent; }
.diagram-scroll::-webkit-scrollbar-thumb { background: #d4d8de; border-radius: 3px; }
.diagram-scroll::-webkit-scrollbar-thumb:hover { background: #b0b5be; }
.diagram-track { display: flex; align-items: stretch; gap: 0; min-width: max-content; }

/* ══════════════════════════════════════════════════════════════
   NODE CARD — redesigned key-value layout
   ══════════════════════════════════════════════════════════════ */
.node-card {
  width: 228px; background: #fff; border: 1.5px solid #e0e4ea; border-radius: 12px;
  padding: 14px 16px; display: flex; flex-direction: column; gap: 0; flex-shrink: 0;
  position: relative; transition: border-color .15s, box-shadow .15s;
}
.node-card:hover { border-color: #c5cad2; box-shadow: 0 3px 14px rgba(0,0,0,.07); }

/* Top accent by role */
.node-card.origin      { border-top: 3px solid #1f6f54; }
.node-card.destination { border-top: 3px solid #0f172a; }
.node-card.intermediary{ border-top: 3px solid #3b82f6; }

/* Background tint for risky validation status */
.node-card.not_validated { background: #fffbfb; }
.node-card.pending       { background: #fffdf5; }

/* Alert border */
.node-card.has-alerts { border-left: 3px solid #f59e0b; }
.node-card.has-alerts.not_validated { border-left-color: #ef4444; }

/* Card header */
.card-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.card-hdr-left { display: flex; align-items: center; gap: 6px; min-width: 0; }
.fac-icon { font-size: 14px; flex-shrink: 0; line-height: 1; }
.card-hdr-loc { font-size: 14px; font-weight: 600; color: #0f172a; letter-spacing: -0.15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.validation-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.validation-dot.validated     { background: #22c55e; box-shadow: 0 0 0 2px rgba(34,197,94,.2); }
.validation-dot.pending       { background: #facc15; box-shadow: 0 0 0 2px rgba(250,204,21,.2); }
.validation-dot.not_validated { background: #ef4444; box-shadow: 0 0 0 2px rgba(239,68,68,.15); }

/* Role badge */
.card-role-row { margin-bottom: 8px; }
.type-badge { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; padding: 2px 7px; border-radius: 4px; }
.type-badge.origin      { background: #dcfce7; color: #15803d; }
.type-badge.destination { background: #f1f5f9; color: #334155; }
.type-badge.intermediary{ background: #dbeafe; color: #1d4ed8; }

/* Key-value list */
.card-kv-list { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
.kv-row { display: flex; align-items: baseline; gap: 6px; }
.kv-label { font-size: 10.5px; color: #94a3b8; font-weight: 500; min-width: 52px; flex-shrink: 0; }
.kv-val { font-size: 11.5px; color: #334155; font-weight: 500; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.kv-val.kv-temp     { color: #2563eb; font-weight: 600; }
.kv-val.kv-muted    { color: #c8d1dc; font-style: italic; font-weight: 400; }
.kv-val.kv-fragile  { color: #d97706; font-weight: 600; }
.kv-val.kv-unverified { color: #94a3b8; }
.kv-warn-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 13px; height: 13px; border-radius: 50%; background: #f59e0b; color: #fff;
  font-size: 9px; font-weight: 800; margin-left: 3px; flex-shrink: 0; vertical-align: middle;
}

/* Inline node alerts */
.node-alerts { display: flex; flex-direction: column; gap: 3px; margin-bottom: 8px; }
.node-alert { display: flex; align-items: center; gap: 5px; padding: 3px 7px; border-radius: 5px; font-size: 10.5px; font-weight: 600; line-height: 1.3; }
.node-alert.critical { background: #fef2f2; color: #b91c1c; }
.node-alert.warning  { background: #fffbeb; color: #92400e; }
.node-alert.info     { background: #eff6ff; color: #1e40af; }
.na-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.node-alert.critical .na-dot { background: #dc2626; }
.node-alert.warning  .na-dot { background: #d97706; }
.node-alert.info     .na-dot { background: #3b82f6; }
.na-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Certificates */
.card-certs { display: flex; flex-wrap: wrap; gap: 4px; margin-top: auto; padding-top: 8px; border-top: 1px solid #f1f3f6; }
.node-cert {
  font-size: 9.5px; font-weight: 600; padding: 2px 6px; border-radius: 3px;
  border: 1px solid; letter-spacing: .02em;
}
.node-cert.cert-ok      { background: #dcfce7; color: #15803d; border-color: #86efac; }
.node-cert.cert-missing { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
.node-cert.cert-extra   { background: #f1f5f9; color: #64748b; border-color: #e2e8f0; }

/* ── Transport connectors ─────────────────────────────────────── */
.connector-wrap { display: flex; align-items: center; flex-shrink: 0; min-width: 80px; position: relative; align-self: center; }
.connector-line { flex: 1; height: 2px; min-width: 14px; }
.connector-line.road { background: #d1d5db; }
.connector-line.air  { background: repeating-linear-gradient(90deg, #93c5fd 0,#93c5fd 5px,transparent 5px,transparent 11px); }
.connector-line.sea  { background: repeating-linear-gradient(90deg, #67e8f9 0,#67e8f9 5px,transparent 5px,transparent 11px); }
.connector-line.rail { background: repeating-linear-gradient(90deg, #a78bfa 0,#a78bfa 5px,transparent 5px,transparent 11px); }
.connector-badge {
  display: flex; align-items: center; gap: 4px; flex-shrink: 0;
  padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;
  cursor: pointer; border: 1.5px solid; background: #fff;
  transition: all .15s; font-family: inherit; white-space: nowrap;
}
.connector-badge.road { color: #92400e; border-color: #fde68a; background: #fffbeb; }
.connector-badge.road:hover { background: #fef3c7; }
.connector-badge.air  { color: #1d4ed8; border-color: #bfdbfe; background: #eff6ff; }
.connector-badge.air:hover  { background: #dbeafe; }
.connector-badge.sea  { color: #0e7490; border-color: #a5f3fc; background: #ecfeff; }
.connector-badge.sea:hover  { background: #cffafe; }
.connector-badge.rail { color: #6d28d9; border-color: #ddd6fe; background: #f5f3ff; }
.connector-badge.rail:hover { background: #ede9fe; }
.connector-label { text-transform: capitalize; }

/* ── Add node button ─────────────────────────────────────────── */
.add-node-btn {
  display: flex; align-items: center; justify-content: center;
  width: 44px; min-height: 44px; border: 2px dashed #d1d5db; border-radius: 12px;
  background: transparent; color: #94a3b8; cursor: pointer; flex-shrink: 0;
  align-self: center; margin-left: 6px; transition: all .15s;
}
.add-node-btn:hover { border-color: #3b82f6; color: #3b82f6; background: rgba(59,130,246,.04); }

/* ══════════════════════════════════════════════════════════════
   BACKUP ROUTES
   ══════════════════════════════════════════════════════════════ */
.backup-section { border-top: 1px solid #eef0f3; }
.backup-hdr {
  display: flex; align-items: center; gap: 8px; padding: 10px 20px; cursor: pointer;
  user-select: none; font-size: 12px; color: #64748b; background: #f8fafb;
  transition: background .12s;
}
.backup-hdr:hover { background: #f1f5f9; }
.backup-hdr svg { flex-shrink: 0; }
.backup-hdr span { flex: 1; }
.backup-chevron { color: #94a3b8; transition: transform .2s; flex-shrink: 0; }
.backup-chevron.open { transform: rotate(180deg); }
.backup-list { display: flex; flex-direction: column; gap: 0; }
.backup-row {
  display: flex; align-items: center; gap: 12px; padding: 10px 20px;
  border-top: 1px solid #f1f3f6; background: #fafbfc;
}
.backup-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.backup-name { font-size: 12.5px; font-weight: 600; color: #1e293b; }
.backup-meta { font-size: 11px; color: #94a3b8; }
.backup-view-btn {
  display: inline-flex; align-items: center; height: 26px; padding: 0 10px;
  border: 1px solid #e2e8f0; border-radius: 5px; background: #fff;
  font-size: 11.5px; font-weight: 500; color: #64748b; cursor: pointer; font-family: inherit;
  white-space: nowrap; transition: all .13s;
}
.backup-view-btn:hover { background: #0f172a; border-color: #0f172a; color: #fff; }

/* ── Responsive ───────────────────────────────────────────────── */
@media (max-width: 768px) {
  .page-header { padding: 0 16px; }
  .lanes-list  { padding: 12px 16px 24px; }
  .lane-title-bar { padding: 12px 14px; flex-direction: column; align-items: flex-start; }
  .lane-title-right { width: 100%; justify-content: flex-end; }
  .diagram-scroll { padding: 16px 14px 20px; }
  .node-card { width: 196px; padding: 12px 13px; }
  .search-inp { width: 160px; }
  .search-inp:focus { width: 200px; }
  .cs-hdr { padding: 8px 14px; }
  .cs-body .cs-row { padding: 7px 14px; }
  .risk-strip-hdr { padding: 8px 14px; }
  .risk-strip-body { padding: 0 14px 10px; }
}
</style>
