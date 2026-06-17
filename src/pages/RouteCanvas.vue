<template>
  <div class="rcanvas-page">

    <!-- LEFT PANEL – Step 2 of 2 -->
    <div class="step-panel">
      <div class="step-content">
        <div class="step-pill">Step 2 of 2</div>
        <h2 class="panel-title">Route Builder</h2>
        <p class="panel-desc">
          Assemble your supply chain lane. Add stops, choose transport modes, then finish to save.
        </p>

        <div class="timeline">
          <div class="tl-item">
            <div class="tl-icon">
              <div class="tl-dot done">✓</div>
              <div class="tl-line"></div>
            </div>
            <div class="tl-text">
              <strong>Requirements</strong>
              <span>Product specs &amp; constraints</span>
            </div>
          </div>
          <div class="tl-item">
            <div class="tl-icon">
              <div class="tl-dot"></div>
            </div>
            <div class="tl-text">
              <strong>Route Builder</strong>
              <span>Visual lane configuration</span>
            </div>
          </div>
        </div>

        <div class="hint-box">
          <div class="hint-row"><span>+</span><span>Add Node to insert a stop</span></div>
          <div class="hint-row"><span>✏️</span><span>Click a card to edit it</span></div>
          <div class="hint-row"><span>↕</span><span>Drag stops to reorder</span></div>
          <div class="hint-row"><span>✓</span><span>Finish Lane to save &amp; review</span></div>
        </div>
      </div>
    </div>

    <!-- MAIN AREA -->
    <div class="main-area">
      <div class="canvas-card">

        <!-- LOAD ERROR -->
        <div v-if="loadError" class="canvas-load-error">
          <p>{{ loadError }}</p>
          <button @click="$router.push('/lanes')">← Back to Lanes</button>
        </div>

        <template v-else>

        <!-- TOOLBAR -->
        <div class="toolbar">
          <div class="toolbar-left">
            <button class="btn-back" @click="$router.push('/lanes')">← Back</button>
          </div>
          <div class="toolbar-center">
            <h2 class="toolbar-title">Route Builder</h2>
            <p class="toolbar-sub">
              <span v-if="saveStatus === 'saving'" class="save-ind saving">Saving…</span>
              <span v-else-if="saveStatus === 'saved'" class="save-ind saved">✓ Saved</span>
              <span v-else-if="saveStatus === 'error'" class="save-ind error">⚠ Save failed</span>
              <span v-else class="save-ind idle">Click a card to edit · Drag stops to reorder</span>
            </p>
          </div>
          <div class="toolbar-actions">
            <button class="btn-tool backup-tool"
              @click="enterBackupPickMode"
              :disabled="intermediaryNodes.length === 0"
              :class="{ active: backupPickMode }">
              <span>⊕</span> {{ backupPickMode ? 'Pick node…' : 'Add Backup' }}
            </button>
            <button class="btn-finish" @click="finishLane" :disabled="isFinishing">
              {{ isFinishing ? 'Saving…' : 'Finish Lane →' }}
            </button>
          </div>
        </div>

        <!-- ROUTE BANNER -->
        <div class="route-banner">
          <div class="route-ep">
            <span class="ep-tag origin">ORIGIN</span>
            <span class="ep-name">{{ originNode?.details?.location || '—' }}</span>
            <span class="ep-company">{{ originNode?.details?.company || '' }}</span>
          </div>
          <div class="banner-mid">
            <div class="banner-line"></div>
            <span class="banner-stops">{{ intermediaryNodes.length }} stop{{ intermediaryNodes.length !== 1 ? 's' : '' }}</span>
            <span v-if="currentLane?.riskLevel" class="risk-badge" :class="'risk-' + currentLane.riskLevel">
              {{ currentLane.riskLevel }} risk
            </span>
            <div class="banner-line"></div>
            <span class="banner-arrow">→</span>
          </div>
          <div class="route-ep dest-ep">
            <span class="ep-tag dest">DESTINATION</span>
            <span class="ep-name">{{ destinationNode?.details?.location || '—' }}</span>
            <span class="ep-company">{{ destinationNode?.details?.company || '' }}</span>
          </div>
        </div>

        <!-- NODE TRACK -->
        <div class="track-scroll">
          <div class="node-track">
            <template v-for="(node, idx) in nodes" :key="node.id">

              <!-- NODE CARD -->
              <div class="node-card"
                :class="[nodeRoleClass(idx), {
                  'remove-mode': removingMode  && node.type === 'intermediary',
                  'backup-pick': backupPickMode && node.type === 'intermediary',
                  'drag-over':   dragOverIdx === idx && dragging,
                  'is-dragging': dragSrcIdx  === idx && dragging,
                }]"
                :draggable="node.type === 'intermediary'"
                @click="handleCardClick(idx)"
                @dragstart="onDragStart(idx)"
                @dragover.prevent="onDragOver(idx)"
                @drop.prevent="onDrop(idx)"
                @dragend="onDragEnd">

                <div class="nc-accent"></div>

                <div class="nc-topbar">
                  <span class="nc-role">{{ nodeRoleLabel(idx) }}</span>
                  <div class="nc-actions">
                    <span class="nc-valstatus" :class="valStatusClass(node.validationStatus)"></span>
                    <button v-if="node.type === 'intermediary' && !removingMode && !backupPickMode"
                      class="nc-del" @click.stop="deleteNode(idx)">×</button>
                  </div>
                </div>

                <div class="nc-body">
                  <div class="nc-inline-field">
                    <div class="nc-ac-wrap">
                      <input v-model="node.details.location" class="nc-inp nc-inp-loc"
                        :placeholder="node.type === 'origin' ? 'Origin city…' : node.type === 'destination' ? 'Destination city…' : 'City or facility…'"
                        @click.stop @input.stop="onNodeLocationInput(node.id, node.details.location)"
                        @focus.stop="onNodeLocationFocus(node.id, node.details.location)"
                        @blur="onNodeLocationBlur" autocomplete="off" />
                      <div class="nc-ac-drop"
                        v-if="focusedNodeId === node.id && focusedField === 'location' && activeSugs.length">
                        <div v-for="s in activeSugs" :key="s.id" class="nc-ac-item"
                          @mousedown.prevent="selectNodeCity(node.id, s)">
                          <span class="nai-main">{{ s.label }}</span>
                          <span class="nai-sub">{{ s.sub }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="nc-inline-field">
                    <div class="nc-ac-wrap">
                      <input v-model="node.details.company" class="nc-inp nc-inp-co"
                        placeholder="Facility company…"
                        @click.stop @input.stop="onNodeCompanyInput(node.id, node.details.company)"
                        @focus.stop="onNodeCompanyFocus(node.id, node.details.company)"
                        @blur="onNodeCompanyBlur" autocomplete="off" />
                      <div class="nc-ac-drop"
                        v-if="focusedNodeId === node.id && focusedField === 'company' && activeSugs.length">
                        <div v-for="s in activeSugs" :key="s.id" class="nc-ac-item"
                          @mousedown.prevent="selectNodeCompany(node.id, s)">
                          <span class="nai-main">{{ s.name }}</span>
                          <span class="nai-sub">{{ s.certificates?.slice(0,3).join(' · ') }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="nc-fac-row" @click.stop>
                    <button v-for="f in facilityTypes" :key="f.value" type="button"
                      class="nc-fac-btn" :class="{ active: node.details.facilityType === f.value }"
                      :title="f.label" @click.stop="setFacilityType(idx, f.value)">{{ f.icon }}</button>
                  </div>

                  <div v-if="routeTempBlock || routeFragile" class="nc-cap-strip nc-cap-strip-inline">
                    <span v-if="routeTempBlock" class="nc-cap"
                      :class="nodeCapTemp(node).ok === true ? 'ncc-ok' : nodeCapTemp(node).ok === false ? 'ncc-fail' : 'ncc-unknown'"
                      :title="nodeCapTemp(node).reason">
                      {{ routeTempData?.icon || '🌡️' }} {{ nodeCapTemp(node).icon }}
                    </span>
                    <span v-if="nodeCapFragile(node)" class="nc-cap"
                      :class="nodeCapFragile(node).ok === true ? 'ncc-ok' : nodeCapFragile(node).ok === false ? 'ncc-fail' : 'ncc-unknown'"
                      :title="nodeCapFragile(node).reason">
                      📦 {{ nodeCapFragile(node).icon }}
                    </span>
                  </div>
                </div>

                <div class="nc-footer">
                  <div class="nc-certs">
                    <span v-if="requiredCertifications.length === 0" class="nc-no-certs">No cert req.</span>
                    <span v-for="cert in requiredCertifications" :key="cert" class="nc-cert"
                      :class="(node.certifications || []).includes(cert) ? 'nc-cert-ok' : 'nc-cert-miss'">
                      {{ cert }}
                    </span>
                  </div>
                  <div v-if="node.backups && node.backups.length" class="nc-backup-badge">B{{ node.backups.length }}</div>
                  <div v-if="routeTempData" class="nc-temp"
                    :style="{ background: routeTempData.color + '18', color: routeTempData.color, borderColor: routeTempData.color + '44' }">
                    {{ routeTempData.icon }} {{ routeTempData.label }}
                  </div>
                </div>
              </div>

              <!-- CONNECTOR (between cards) -->
              <div v-if="idx < nodes.length - 1" class="conn-col">
                <!-- Insert node button -->
                <button class="conn-insert-btn" @click.stop="addNode(idx + 1)" title="Insert node here">+</button>

                <div class="conn-line" :class="'c-' + (nodes[idx + 1].details.transportType || 'road')"></div>

                <!-- Collapsed connector header — always visible -->
                <div class="conn-header" @click.stop="toggleConnector(idx + 1)">
                  <div class="conn-transport-lbl">
                    {{ transportIcon(nodes[idx + 1].details.transportType || 'road') }}
                    {{ transportLabel(nodes[idx + 1].details.transportType || 'road') }}
                  </div>
                  <div class="conn-risk-dot"
                    :class="'cr-' + (connRiskAssessment(idx + 1).level)">
                  </div>
                  <span class="conn-expand-icon">{{ expandedConnIdx === idx + 1 ? '▲' : '▼' }}</span>
                </div>

                <!-- Expanded transport panel -->
                <div v-if="expandedConnIdx === idx + 1" class="conn-panel" @click.stop>
                  <div class="cp-tabs">
                    <span class="cp-tab-label">Transport Mode</span>
                  </div>

                  <!-- Transport mode picker -->
                  <div class="conn-picker">
                    <button v-for="t in transportTypes" :key="t.value"
                      class="ctp-btn"
                      :class="{ active: nodes[idx + 1].details.transportType === t.value }"
                      :title="t.label"
                      @click.stop="setNodeTransport(idx + 1, t.value)">{{ t.icon }}</button>
                  </div>

                  <!-- Transport company -->
                  <div class="cp-field-label">Transport Company</div>
                  <div class="nc-ac-wrap" style="width:100%">
                    <input
                      v-model="nodes[idx + 1].details.transportCompany"
                      class="nc-inp cp-inp"
                      placeholder="Carrier for this leg…"
                      @click.stop
                      @input.stop="onConnCompanyInput(idx + 1, nodes[idx + 1].details.transportCompany)"
                      @focus.stop="onConnCompanyFocus(idx + 1, nodes[idx + 1].details.transportCompany)"
                      @blur="onConnCompanyBlur"
                      autocomplete="off" />
                    <div class="nc-ac-drop"
                      v-if="connFocusedNodeId === idx + 1 && connCompanySugs.length">
                      <div v-for="s in connCompanySugs" :key="s.id" class="nc-ac-item"
                        @mousedown.prevent="selectConnCompany(idx + 1, s)">
                        <span class="nai-main">{{ s.name }}</span>
                        <span class="nai-sub">{{ s.certificates?.slice(0,3).join(' · ') }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Risk assessment display -->
                  <div class="cp-risk-block" :class="'cpb-' + connRiskAssessment(idx + 1).level">
                    <div class="cp-risk-header">
                      <span class="cp-risk-score">{{ connRiskAssessment(idx + 1).score }}</span>
                      <span class="cp-risk-label">{{ connRiskAssessment(idx + 1).label }}</span>
                    </div>
                    <div class="cp-risk-details">
                      <div v-for="(d, di) in connRiskAssessment(idx + 1).details" :key="di"
                        class="cp-risk-detail" :class="'cpd-' + d.severity">
                        <span class="cpd-icon">{{ d.icon }}</span>
                        <span class="cpd-text">{{ d.text }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="conn-line" :class="'c-' + (nodes[idx + 1].details.transportType || 'road')"></div>
                <span class="conn-arrow">→</span>
              </div>

            </template>
          </div>
        </div>

        </template><!-- end v-else -->
      </div>
    </div>

    <!-- BACKUP MODAL -->
    <div class="modal-overlay" v-if="editingBackupData !== null" @click.self="closeBackupModal">
      <div class="modal-card-wrap">
        <div class="modal-card">
          <div class="modal-header">
            <div>
              <h3>Edit Backup Node</h3>
              <p class="modal-sub">Alternative route stop</p>
            </div>
            <button class="close-btn" @click="closeBackupModal">×</button>
          </div>
          <div class="modal-form">
            <div class="form-group">
              <label>Location</label>
              <input v-model="editingBackupData.location" class="modern-input" placeholder="City, Airport, Port…" />
            </div>
            <div class="form-group">
              <label>Transport Mode</label>
              <div class="transport-btns">
                <button v-for="t in transportTypes" :key="t.value" type="button"
                  class="t-btn" :class="{ active: editingBackupData.transportType === t.value }"
                  @click="editingBackupData.transportType = t.value">
                  <span>{{ t.icon }}</span><span>{{ t.label }}</span>
                </button>
              </div>
            </div>
            <div class="form-group">
              <label>Company</label>
              <input v-model="editingBackupData.company" class="modern-input" placeholder="e.g. DHL, FedEx…" />
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" @click="closeBackupModal">Cancel</button>
            <button class="btn-save" @click="saveBackupDetails">Save Details</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from '@/services/api'
import { searchCompanies, searchLocations, getAllCompanies, TRANSPORT_COMPANIES, WAREHOUSES, AIRPORTS } from '@/data/companies'
import { TEMP_BLOCKS, TRANSPORT_TEMP_RISK } from '@/data/tempBlocks'
import { searchCities } from '@/data/worldCities'

const router = useRouter()
const route  = useRoute()

// ─── Nodes ────────────────────────────────────────────────────────
let nextId = 100
const nodes = ref([
  { id: 1, type: 'origin',      details: { company: '', location: '', facilityType: 'warehouse', transportType: '', transportCompany: '' }, certifications: [], backups: [], validationStatus: 'pending' },
  { id: 2, type: 'destination', details: { company: '', location: '', facilityType: 'warehouse', transportType: '', transportCompany: '' }, certifications: [], backups: [], validationStatus: 'pending' },
])

const originNode        = computed(() => nodes.value.find(n => n.type === 'origin'))
const destinationNode   = computed(() => nodes.value.find(n => n.type === 'destination'))
const intermediaryNodes = computed(() => nodes.value.filter(n => n.type === 'intermediary'))

// ─── Transport types ──────────────────────────────────────────────
const transportTypes = [
  { value: 'road',      label: 'Road',      icon: '🚛' },
  { value: 'air',       label: 'Air',       icon: '✈️' },
  { value: 'sea',       label: 'Sea',       icon: '🚢' },
  { value: 'rail',      label: 'Rail',      icon: '🚆' },
  { value: 'warehouse', label: 'Warehouse', icon: '🏭' },
]
const transportIcon = (type) => transportTypes.find(x => x.value === type)?.icon ?? '🚛'

// ─── Facility types ───────────────────────────────────────────────
const facilityTypes = [
  { value: 'warehouse',    label: 'Warehouse',    icon: '🏭' },
  { value: 'distribution', label: 'Distribution', icon: '🏢' },
  { value: 'hub',          label: 'Hub',          icon: '🔀' },
  { value: 'airport',      label: 'Airport',      icon: '✈️' },
  { value: 'port',         label: 'Port',         icon: '⚓' },
  { value: 'rail_yard',    label: 'Rail Yard',    icon: '🚆' },
]

const facilityIcon = (node) => {
  const ft = node?.details?.facilityType
  const match = facilityTypes.find(f => f.value === ft)
  if (match) return match.icon
  return node?.type === 'intermediary' ? transportIcon(node?.details?.transportType) : '🏭'
}

const facilityLabel = (node) => {
  const match = facilityTypes.find(f => f.value === node?.details?.facilityType)
  return match?.label ?? (node?.type === 'intermediary' ? 'Warehouse' : 'Facility')
}

// ─── Certifications ───────────────────────────────────────────────
const certificatesList = ['GDP', 'IATA', 'ISO 9001', 'ISO 13485', 'ISO 28000']

const requiredCertifications = computed(() => {
  try {
    const stored = localStorage.getItem('routeData')
    if (stored) {
      const data = JSON.parse(stored)
      return data.certificates || []
    }
  } catch (_) {}
  return []
})

const routeTempBlock = computed(() => {
  try { return JSON.parse(localStorage.getItem('routeData') || '{}').tempBlock || '' } catch { return '' }
})
const routeTempData = computed(() => TEMP_BLOCKS.find(b => b.key === routeTempBlock.value) || null)

const getMissingCertifications = (nodeCerts) => {
  if (!Array.isArray(nodeCerts)) nodeCerts = []
  return requiredCertifications.value.filter(c => !nodeCerts.includes(c))
}

// ─── Node role helpers ────────────────────────────────────────────
const nodeRoleClass = (idx) => {
  const t = nodes.value[idx]?.type
  return t === 'origin' ? 'nc-origin' : t === 'destination' ? 'nc-destination' : 'nc-intermediary'
}

const nodeRoleLabel = (idx) => {
  const t = nodes.value[idx]?.type
  if (t === 'origin') return 'Origin'
  if (t === 'destination') return 'Destination'
  const pos = nodes.value.slice(0, idx).filter(n => n.type === 'intermediary').length + 1
  return `Stop ${pos}`
}

const nodeTypeLabel = (type) =>
  type === 'origin' ? 'Origin Node' : type === 'destination' ? 'Destination Node' : 'Intermediary Stop'

const valStatusClass = (status) => {
  if (status === 'validated') return 'vs-validated'
  if (status === 'failed')    return 'vs-failed'
  return 'vs-pending'
}

const tempBlockIcon   = (key) => TEMP_BLOCKS.find(b => b.key === key)?.icon ?? ''
const tempBlockLabel  = (key) => TEMP_BLOCKS.find(b => b.key === key)?.label ?? ''
const transportLabel  = (type) => transportTypes.find(t => t.value === type)?.label ?? type
const transportRiskLevel = (transport, tempBlock) => {
  if (!tempBlock || !transport || transport === '') return null
  return TRANSPORT_TEMP_RISK[tempBlock]?.[transport] || null
}

const routeFragile = computed(() => {
  try { return JSON.parse(localStorage.getItem('routeData') || '{}').fragile === true } catch { return false }
})

const ALL_DB = [...TRANSPORT_COMPANIES, ...WAREHOUSES, ...AIRPORTS]

// ─── Inline card editing ──────────────────────────────────────────
const focusedNodeId = ref(null)
const focusedField  = ref(null)  // 'location' | 'company'
const activeSugs    = ref([])

const onNodeLocationInput = (nodeId, val) => {
  focusedNodeId.value = nodeId
  focusedField.value  = 'location'
  const citySugs = searchCities(val, 5).map(c => ({
    id: 'c-' + c.code + c.city, label: c.city, sub: `${c.country} · ${c.code}`,
    company: null, facilityType: null,
  }))
  const facSugs = searchLocations(val).slice(0, 4).map(s => ({
    id: s.id, label: s.label, sub: s.sub, company: s.company, facilityType: s.facilityType,
  }))
  activeSugs.value = [...citySugs, ...facSugs].slice(0, 8)
}
const onNodeLocationFocus = (nodeId, val) => { onNodeLocationInput(nodeId, val) }
const onNodeLocationBlur  = () => {
  setTimeout(() => { activeSugs.value = []; focusedNodeId.value = null; focusedField.value = null }, 150)
  saveLane()
}
const selectNodeCity = (nodeId, s) => {
  const node = nodes.value.find(n => n.id === nodeId)
  if (!node) return
  node.details.location = s.label
  if (s.company && !node.details.company)    node.details.company      = s.company
  if (s.facilityType)                        node.details.facilityType = s.facilityType
  activeSugs.value = []; focusedNodeId.value = null; focusedField.value = null
  saveLane()
}

const onNodeCompanyInput = (nodeId, val) => {
  focusedNodeId.value = nodeId
  focusedField.value  = 'company'
  activeSugs.value = val.length === 0 ? getAllCompanies(6) : searchCompanies(val)
}
const onNodeCompanyFocus = (nodeId, val) => { onNodeCompanyInput(nodeId, val) }
const onNodeCompanyBlur  = () => {
  setTimeout(() => { activeSugs.value = []; focusedNodeId.value = null; focusedField.value = null }, 150)
  saveLane()
}
const selectNodeCompany = (nodeId, s) => {
  const node = nodes.value.find(n => n.id === nodeId)
  if (!node) return
  node.details.company = s.name
  if (s.certificates?.length) {
    node.certifications = s.certificates.filter(c => requiredCertifications.value.includes(c))
  }
  activeSugs.value = []; focusedNodeId.value = null; focusedField.value = null
  saveLane()
}
const setFacilityType = (idx, type) => { nodes.value[idx].details.facilityType = type; saveLane() }

// ─── Transport connector state ────────────────────────────────────
const expandedConnIdx   = ref(null)  // index of expanded connector (the idx of the destination node)
const connCompanySugs   = ref([])
const connFocusedNodeId = ref(null)

const toggleConnector = (idx) => {
  expandedConnIdx.value = expandedConnIdx.value === idx ? null : idx
  connCompanySugs.value = []
}

const closeConnPanel = () => { expandedConnIdx.value = null }
onMounted(() => document.addEventListener('click', closeConnPanel))
onBeforeUnmount(() => document.removeEventListener('click', closeConnPanel))

const onConnCompanyInput = (idx, val) => {
  connFocusedNodeId.value = idx
  connCompanySugs.value   = val.length === 0 ? getAllCompanies(6) : searchCompanies(val)
}
const onConnCompanyFocus = (idx, val) => { onConnCompanyInput(idx, val) }
const onConnCompanyBlur  = () => {
  setTimeout(() => { connCompanySugs.value = []; connFocusedNodeId.value = null }, 150)
  saveLane()
}
const selectConnCompany = (idx, s) => {
  nodes.value[idx].details.transportCompany = s.name
  connCompanySugs.value = []; connFocusedNodeId.value = null
  saveLane()
}

// Transport risk for a specific transport + company + tempBlock combination
const connRiskAssessment = (idx) => {
  const node = nodes.value[idx]
  if (!node) return { score: null, level: 'ok', label: 'N/A', details: [] }
  const tb         = routeTempBlock.value
  const transport  = node.details?.transportType || 'road'
  const company    = node.details?.transportCompany || node.details?.company || ''
  const details    = []
  let score        = 100

  // Transport mode vs temp block
  if (tb && tb !== 'ambient') {
    const re = TRANSPORT_TEMP_RISK[tb]?.[transport]
    if (re && !re.ok) {
      score -= re.risk === 'critical' ? 40 : 20
      details.push({ icon: '🌡️', text: re.reason, severity: re.risk })
    } else {
      details.push({ icon: '✓', text: 'Transport mode suitable for temperature requirement', severity: 'ok' })
    }
  }

  // Company capability check
  if (company) {
    const tc = [...TRANSPORT_COMPANIES, ...WAREHOUSES, ...AIRPORTS].find(c => c.name === company)
    if (tc) {
      if (tb && !(tc.tempCapabilities || []).includes(tb)) {
        score -= 30
        details.push({ icon: '✗', text: `${company}: not ${tb} capable`, severity: 'critical' })
      } else if (tb) {
        details.push({ icon: '✓', text: `${company}: temperature capable`, severity: 'ok' })
      }
      if (routeFragile.value && !tc.fragileCapable) {
        score -= 20
        details.push({ icon: '✗', text: `${company}: not certified for fragile handling`, severity: 'warning' })
      } else if (routeFragile.value) {
        details.push({ icon: '✓', text: `${company}: fragile capable`, severity: 'ok' })
      }
    } else {
      score -= 10
      details.push({ icon: '?', text: `${company}: not in certified database`, severity: 'warning' })
    }
  } else {
    details.push({ icon: '⚠️', text: 'No transport company assigned', severity: 'warning' })
    score -= 10
  }

  const level = score >= 85 ? 'ok' : score >= 60 ? 'warning' : 'critical'
  const label = score >= 85 ? 'Low Risk' : score >= 60 ? 'Medium Risk' : 'High Risk'
  return { score: Math.max(0, score), level, label, details }
}

// Returns { ok, icon, reason } for temperature capability of a node
const nodeCapTemp = (node) => {
  const tb = routeTempBlock.value
  if (!tb || tb === 'ambient') return { ok: true, icon: '✓', reason: 'Ambient — no cold chain required' }
  const wh = WAREHOUSES.find(w => w.company === node.details?.company || w.name === node.details?.location)
  if (wh) {
    if ((wh.tempCapabilities || []).includes(tb)) return { ok: true, icon: '✓', reason: `${tb} storage confirmed` }
    return { ok: false, icon: '✗', reason: `No ${tb} capability (has: ${(wh.tempCapabilities||[]).join(', ')})` }
  }
  const ap = AIRPORTS.find(a => a.company === node.details?.company || a.name === node.details?.location)
  if (ap) {
    if ((ap.tempCapabilities || []).includes(tb)) return { ok: true, icon: '✓', reason: `Airport: ${tb} capable` }
    return { ok: false, icon: '✗', reason: `Airport not ${tb} capable` }
  }
  const tc = TRANSPORT_COMPANIES.find(c => c.name === node.details?.company)
  if (tc) {
    if ((tc.tempCapabilities || []).includes(tb)) return { ok: true, icon: '✓', reason: `Carrier: ${tb} capable` }
    return { ok: false, icon: '✗', reason: `Carrier not ${tb} capable` }
  }
  return { ok: null, icon: '?', reason: 'Not in database — unverified' }
}

// Returns { ok, icon, reason } for fragile handling capability of a node
const nodeCapFragile = (node) => {
  if (!routeFragile.value) return null
  const company = ALL_DB.find(c => c.name === node.details?.company)
  if (!company) return { ok: null, icon: '?', reason: 'Company not in database' }
  if (company.fragileCapable) return { ok: true, icon: '✓', reason: 'Fragile handling certified' }
  return { ok: false, icon: '✗', reason: 'Not certified for fragile handling' }
}

// ─── Toolbar modes ────────────────────────────────────────────────
const removingMode   = ref(false)
const backupPickMode = ref(false)

const toggleRemoveMode    = () => { removingMode.value = !removingMode.value; backupPickMode.value = false }
const enterBackupPickMode = () => { backupPickMode.value = !backupPickMode.value; removingMode.value = false }

const handleCardClick = (idx) => {
  if (removingMode.value && nodes.value[idx].type === 'intermediary') { deleteNode(idx) }
  else if (backupPickMode.value && nodes.value[idx].type === 'intermediary') {
    addBackupToNode(idx); backupPickMode.value = false
  }
}

// ─── Backup modal ─────────────────────────────────────────────────
const editingBackupRef  = reactive({ nodeIdx: null, bkIdx: null })
const editingBackupData = ref(null)

const openBackupModal = (ni, bi) => {
  editingBackupRef.nodeIdx = ni
  editingBackupRef.bkIdx   = bi
  editingBackupData.value  = { ...nodes.value[ni].backups[bi] }
}
const closeBackupModal = () => {
  editingBackupRef.nodeIdx = null
  editingBackupRef.bkIdx   = null
  editingBackupData.value  = null
}
const saveBackupDetails = () => {
  if (editingBackupRef.nodeIdx !== null && editingBackupData.value)
    nodes.value[editingBackupRef.nodeIdx].backups[editingBackupRef.bkIdx] = { ...editingBackupData.value }
  closeBackupModal()
  saveLane()
}

// ─── Node CRUD ────────────────────────────────────────────────────
const addNode = (insertIdx = nodes.value.length - 1) => {
  nodes.value.splice(insertIdx, 0, {
    id: nextId++, type: 'intermediary',
    details: { company: '', location: '', facilityType: 'warehouse', transportType: 'road', transportCompany: '' },
    certifications: [], backups: [], validationStatus: 'pending',
  })
  saveLane()
}

const deleteNode = (index) => {
  if (nodes.value[index].type === 'intermediary') nodes.value.splice(index, 1)
  removingMode.value = false
  saveLane()
}

const addBackupToNode = (index) => {
  if (!nodes.value[index].backups) nodes.value[index].backups = []
  nodes.value[index].backups.push({ location: '', company: '', transportType: 'road' })
  openBackupModal(index, nodes.value[index].backups.length - 1)
}

// ─── Inline transport picker ───────────────────────────────────────
const setNodeTransport = (idx, type) => {
  nodes.value[idx].details.transportType = type
  saveLane()
}

// ─── HTML5 drag-to-reorder ─────────────────────────────────────────
const dragging    = ref(false)
const dragSrcIdx  = ref(null)
const dragOverIdx = ref(null)

const onDragStart = (idx) => {
  dragSrcIdx.value  = idx
  dragging.value    = true
  dragOverIdx.value = null
}

const onDragOver = (idx) => {
  if (!dragging.value) return
  const src = nodes.value[dragSrcIdx.value]
  if (!src || src.type !== 'intermediary') return
  if (nodes.value[idx].type === 'origin' || nodes.value[idx].type === 'destination') {
    dragOverIdx.value = null
    return
  }
  dragOverIdx.value = idx
}

const onDrop = (idx) => {
  const src = dragSrcIdx.value !== null ? nodes.value[dragSrcIdx.value] : null
  if (!src || src.type !== 'intermediary' || dragSrcIdx.value === idx) { onDragEnd(); return }
  const tgt = nodes.value[idx]
  if (tgt.type === 'origin' || tgt.type === 'destination') { onDragEnd(); return }
  const item = nodes.value.splice(dragSrcIdx.value, 1)[0]
  const insertAt = dragSrcIdx.value < idx ? idx - 1 : idx
  nodes.value.splice(insertAt, 0, item)
  onDragEnd()
  saveLane()
}

const onDragEnd = () => {
  dragging.value    = false
  dragSrcIdx.value  = null
  dragOverIdx.value = null
}

// ─── Save / Finish ────────────────────────────────────────────────
const saveStatus  = ref('idle')
const loadError   = ref('')
const currentLane = ref(null)
const isFinishing = ref(false)
let saveTimer = null

const buildPayload = () => ({
  nodes: nodes.value.map(n => ({
    location:        n.details.location,
    company:         n.details.company,
    transport:       n.details.transportType,
    transportCompany: n.details.transportCompany,
    type:            n.details.facilityType,
    certificates:    n.certifications || [],
    backups: (n.backups || []).map(b => ({
      location:      b.location      || '',
      company:       b.company       || '',
      transportType: b.transportType || 'road',
    })),
  })),
})

const saveLane = async () => {
  const laneId = route.query.laneId
  if (!laneId) return
  clearTimeout(saveTimer)
  saveStatus.value = 'saving'
  try {
    await api.put(`/lanes/${laneId}`, buildPayload())
    saveStatus.value = 'saved'
    saveTimer = setTimeout(() => { saveStatus.value = 'idle' }, 2000)
  } catch {
    saveStatus.value = 'error'
  }
}

const saveToLocalStorage = () => {
  try {
    const existing = JSON.parse(localStorage.getItem('savedLanes') || '[]')
    const routeData = JSON.parse(localStorage.getItem('routeData') || '{}')
    const laneId = route.query.laneId || `local-${Date.now()}`

    const lane = {
      id:          String(laneId),
      origin:      { city: nodes.value[0]?.details?.location || routeData.origin || '' },
      destination: { city: nodes.value[nodes.value.length - 1]?.details?.location || routeData.destination || '' },
      nodes: nodes.value.map(n => ({
        location:         n.details.location      || '',
        company:          n.details.company       || '',
        transport:        n.details.transportType || 'road',
        transportCompany: n.details.transportCompany || '',
        type:             n.details.facilityType  || 'warehouse',
        certificates:     n.certifications        || [],
        backups:          n.backups               || [],
        validationStatus: n.validationStatus      || 'pending',
      })),
      certificates: routeData.certificates || [],
      tempBlock:    routeData.tempBlock    || '',
      productType:  routeData.productType  || '',
      status:       'active',
      riskLevel:    'low',
      createdAt:    new Date().toISOString(),
    }

    const i = existing.findIndex(l => String(l.id) === String(laneId))
    if (i >= 0) existing[i] = lane
    else existing.push(lane)

    localStorage.setItem('savedLanes', JSON.stringify(existing))
  } catch (e) {
    console.error('Failed to save lane locally:', e)
  }
}

const finishLane = async () => {
  isFinishing.value = true
  const laneId = route.query.laneId
  try {
    if (laneId) await api.put(`/lanes/${laneId}`, buildPayload())
  } catch {}
  saveToLocalStorage()
  isFinishing.value = false
  router.push({ name: 'LaneReport', query: { laneId: route.query.laneId || 'local' } })
}

// ─── Mount ────────────────────────────────────────────────────────
onMounted(async () => {
  await nextTick()
  const laneId = route.query.laneId

  if (laneId) {
    try {
      const lane = await api.get(`/lanes/${laneId}`)
      currentLane.value = lane

      if (lane.nodes && lane.nodes.length > 0) {
        nodes.value = lane.nodes.map((n, i) => {
          const isFirst = i === 0
          const isLast  = i === lane.nodes.length - 1
          const type    = isFirst ? 'origin' : isLast ? 'destination' : 'intermediary'
          return {
            id: n._id || nextId++, type,
            details: {
              location:         n.location         || '',
              company:          n.company          || '',
              transportType:    n.transport        || 'road',
              facilityType:     n.type             || 'warehouse',
              transportCompany: n.transportCompany || '',
            },
            certifications:  n.certificates || [],
            backups: (n.backups || []).map(b => ({
              location:      b.location      || '',
              company:       b.company       || '',
              transportType: b.transportType || 'road',
            })),
            validationStatus: n.validationStatus || 'pending',
          }
        })
      }

      const originCity = lane.origin?.city || ''
      const destCity   = lane.destination?.city || ''
      if (originCity && !nodes.value[0].details.location)
        nodes.value[0].details.location = originCity
      if (destCity && !nodes.value[nodes.value.length - 1].details.location)
        nodes.value[nodes.value.length - 1].details.location = destCity

    } catch {
      // API unavailable — restore full lane from savedLanes, fall back to routeData
      try {
        const saved = JSON.parse(localStorage.getItem('savedLanes') || '[]')
        const found = saved.find(l => String(l.id) === String(laneId))
        if (found && found.nodes && found.nodes.length > 0) {
          nodes.value = found.nodes.map((n, i) => {
            const isFirst = i === 0
            const isLast  = i === found.nodes.length - 1
            const type    = isFirst ? 'origin' : isLast ? 'destination' : 'intermediary'
            return {
              id: nextId++, type,
              details: {
                location:         n.location         || '',
                company:          n.company          || '',
                transportType:    n.transport        || 'road',
                facilityType:     n.type             || 'warehouse',
                transportCompany: n.transportCompany || '',
              },
              certifications:  n.certificates || [],
              backups: (n.backups || []).map(b => ({
                location:      b.location      || '',
                company:       b.company       || '',
                transportType: b.transportType || 'road',
              })),
              validationStatus: n.validationStatus || 'pending',
            }
          })
        } else {
          const data = JSON.parse(localStorage.getItem('routeData') || '{}')
          if (data.origin)      nodes.value[0].details.location = data.origin
          if (data.destination) nodes.value[nodes.value.length - 1].details.location = data.destination
        }
      } catch (_) {}
    }
  } else {
    try {
      const data = JSON.parse(localStorage.getItem('routeData') || '{}')
      if (data.origin)      nodes.value[0].details.location = data.origin
      if (data.destination) nodes.value[nodes.value.length - 1].details.location = data.destination
    } catch (_) {}
  }
})
</script>

<style scoped>
/* ── Page shell ── */
.rcanvas-page { display: flex; height: 100%; }

/* ── Left panel ── */
.step-panel {
  width: 240px; flex-shrink: 0;
  background: #1A3528;
  position: relative; overflow: hidden;
}
.step-panel::before {
  content: ''; position: absolute;
  top: -80px; right: -80px;
  width: 240px; height: 240px;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
  pointer-events: none;
}
.step-panel::after {
  content: ''; position: absolute;
  bottom: -100px; left: -60px;
  width: 300px; height: 300px;
  border-radius: 50%;
  background: rgba(255,255,255,0.04);
  pointer-events: none;
}
.step-content { padding: 48px 28px; position: relative; z-index: 1; }

.step-pill {
  display: inline-block; padding: 4px 12px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 999px;
  color: rgba(255,255,255,0.75);
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.08em; text-transform: uppercase;
  margin-bottom: 18px;
}
.panel-title { font-size: 20px; font-weight: 700; color: white; margin: 0 0 10px 0; line-height: 1.25; }
.panel-desc  { color: rgba(255,255,255,0.7); font-size: 12.5px; line-height: 1.65; margin: 0 0 36px 0; }

.timeline { display: flex; flex-direction: column; }
.tl-item  { display: flex; gap: 12px; align-items: flex-start; }
.tl-icon  { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; padding-top: 1px; }
.tl-dot   { width: 18px; height: 18px; border-radius: 50%; background: white; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: var(--primary); }
.tl-dot.done { background: rgba(255,255,255,0.25); border: 1.5px solid rgba(255,255,255,0.6); color: white; }
.tl-line  { width: 1.5px; height: 36px; background: rgba(255,255,255,0.2); margin: 4px 0; }
.tl-text strong { display: block; color: white; font-size: 13px; font-weight: 600; margin-bottom: 3px; }
.tl-text span   { font-size: 12px; color: rgba(255,255,255,0.55); }

.hint-box {
  margin-top: 36px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 14px 16px;
  display: flex; flex-direction: column; gap: 10px;
}
.hint-row { display: flex; align-items: center; gap: 10px; font-size: 12px; color: rgba(255,255,255,0.75); }
.hint-row span:first-child { font-size: 14px; width: 18px; text-align: center; flex-shrink: 0; }

/* ── Main area ── */
.main-area {
  flex: 1; display: flex; flex-direction: column;
  padding: 20px; background: var(--bg-color); min-width: 0;
}
.canvas-card {
  flex: 1; background: var(--surface-color);
  border-radius: 16px; box-shadow: var(--shadow-float);
  border: 1px solid var(--border-color);
  display: flex; flex-direction: column; overflow: hidden;
}

/* ── Toolbar ── */
.toolbar {
  display: flex; align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0; gap: 12px;
}
.toolbar-left    { flex: 1; }
.toolbar-center  { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; }
.toolbar-actions { flex: 1; display: flex; gap: 8px; justify-content: flex-end; align-items: center; }

.toolbar-title { margin: 0 0 2px; font-size: 16px; font-weight: 600; color: var(--text-main); }
.toolbar-sub   { margin: 0; font-size: 11px; color: var(--text-muted); }
.save-ind        { font-size: 11px; }
.save-ind.saving { color: #64748b; }
.save-ind.saved  { color: #15803d; font-weight: 500; }
.save-ind.error  { color: #b91c1c; }
.save-ind.idle   { color: var(--text-muted); }

.canvas-load-error {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; gap: 12px; color: #b91c1c; font-size: 14px;
}

.btn-back {
  padding: 7px 14px;
  border: 1.5px solid var(--border-color); border-radius: 8px;
  background: white; color: var(--text-muted);
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: all var(--transition-fast); font-family: inherit; white-space: nowrap;
}
.btn-back:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-glow); }

.btn-tool {
  display: flex; align-items: center; gap: 5px;
  padding: 7px 14px;
  border: 1.5px solid var(--border-color); border-radius: 8px;
  background: white; color: var(--text-muted);
  font-size: 12px; font-weight: 500; cursor: pointer;
  transition: all var(--transition-fast); font-family: inherit; white-space: nowrap;
}
.btn-tool:hover:not(:disabled)             { border-color: var(--primary); color: var(--primary); background: var(--primary-glow); }
.btn-tool:disabled                         { opacity: 0.4; cursor: not-allowed; }
.btn-tool.backup-tool.active               { border-color: var(--primary); color: var(--primary); background: var(--primary-glow); }
.btn-tool.remove-tool:hover:not(:disabled) { border-color: #ef4444; color: #ef4444; background: #fef2f2; }
.btn-tool.remove-tool.active               { border-color: #ef4444; color: #ef4444; background: #fef2f2; }

.btn-finish {
  padding: 8px 20px;
  background: var(--primary); color: white;
  border: none; border-radius: 8px;
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all var(--transition-fast); font-family: inherit; white-space: nowrap;
  box-shadow: 0 2px 8px var(--primary-glow);
}
.btn-finish:hover:not(:disabled) { background: var(--primary-light); transform: translateY(-1px); }
.btn-finish:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Route banner ── */
.route-banner {
  display: flex; align-items: center;
  background: #ffffff; border-bottom: 1px solid #E8EDF2;
  padding: 12px 24px; flex-shrink: 0;
}
.route-ep { display: flex; flex-direction: column; gap: 3px; min-width: 140px; }
.dest-ep  { text-align: right; }
.ep-tag { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
.ep-tag.origin, .ep-tag.dest { color: #1F7A5C; }
.ep-name    { font-size: 16px; font-weight: 600; color: var(--text-main); line-height: 1.25; }
.ep-company { font-size: 11.5px; color: var(--text-muted); }
.banner-mid { display: flex; align-items: center; flex: 1; gap: 8px; padding: 0 20px; }
.banner-line  { flex: 1; height: 1px; background: #E8EDF2; }
.banner-stops { font-size: 11px; color: var(--text-muted); white-space: nowrap; font-weight: 500; }
.banner-arrow { font-size: 16px; color: #1F7A5C; }
.risk-badge { display: inline-flex; align-items: center; height: 18px; padding: 0 7px; border-radius: 4px; font-size: 10px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; white-space: nowrap; }
.risk-badge.risk-low    { background: #dcfce7; color: #15803d; }
.risk-badge.risk-medium { background: #fef9c3; color: #854d0e; }
.risk-badge.risk-high   { background: #fee2e2; color: #991b1b; }

/* ── Track ── */
.track-scroll {
  flex: 1; overflow-x: auto; overflow-y: auto;
  padding: 40px 40px 60px;
  background: #F7F9FB;
  background-image: radial-gradient(circle, rgba(183,194,207,0.55) 1px, transparent 1px);
  background-size: 28px 28px;
}
.node-track {
  display: flex; align-items: center;
  width: max-content; min-height: 320px;
}

/* ── Node card ── */
.node-card {
  width: 250px; min-height: 180px;
  background: white; border-radius: 16px;
  border: 2px solid var(--border-color);
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  display: flex; flex-direction: column;
  transition: box-shadow 0.2s, border-color 0.2s;
  flex-shrink: 0; overflow: visible; user-select: none;
}
.node-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.14); }
.node-card.is-dragging    { opacity: 0.45; }
.node-card.drag-over      { border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-glow); }
.node-card.remove-mode    { border-color: #ef4444; animation: pulse-card-red 0.8s ease-in-out infinite alternate; }
.node-card.backup-pick    { border-color: var(--primary); animation: pulse-card-green 0.8s ease-in-out infinite alternate; }

@keyframes pulse-card-red   { from { box-shadow: 0 0 0 2px rgba(239,68,68,.2); } to { box-shadow: 0 0 0 7px rgba(239,68,68,.1); } }
@keyframes pulse-card-green { from { box-shadow: 0 0 0 2px rgba(31,122,92,.2); } to { box-shadow: 0 0 0 7px rgba(31,122,92,.1); } }

.nc-accent { height: 5px; width: 100%; }
.nc-origin .nc-accent      { background: linear-gradient(90deg, #1F7A5C, #34d399); }
.nc-destination .nc-accent { background: linear-gradient(90deg, #1F7A5C, #34d399); }
.nc-intermediary .nc-accent { background: linear-gradient(90deg, #6366f1, #8b5cf6); }

.nc-topbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 14px; border-bottom: 1px solid var(--border-color);
}
.nc-role { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); }
.nc-actions { display: flex; align-items: center; gap: 6px; }
.nc-valstatus { width: 8px; height: 8px; border-radius: 50%; background: #d1d5db; flex-shrink: 0; }
.nc-valstatus.vs-validated { background: #22c55e; }
.nc-valstatus.vs-pending   { background: #f59e0b; }
.nc-valstatus.vs-failed    { background: #ef4444; }
.nc-del { background: none; border: none; color: #ef4444; font-size: 16px; cursor: pointer; line-height: 1; padding: 0 2px; border-radius: 4px; opacity: 0.5; }
.nc-del:hover { opacity: 1; background: #fef2f2; }

.nc-body { flex: 1; display: flex; flex-direction: column; padding: 10px 10px 6px; gap: 6px; }

/* ── Inline inputs ── */
.nc-inline-field { position: relative; }
.nc-ac-wrap      { position: relative; }
.nc-inp {
  width: 100%; padding: 5px 8px; border: 1.5px solid #e2e8f0; border-radius: 7px;
  font-size: 12px; color: #1e293b; background: #f8fafc;
  font-family: inherit; box-sizing: border-box; transition: all 0.15s; outline: none;
}
.nc-inp:focus   { border-color: #1F7A5C; background: white; box-shadow: 0 0 0 2px rgba(31,122,92,0.12); }
.nc-inp-loc     { font-weight: 600; font-size: 12.5px; }
.nc-inp-co      { color: #64748b; }
.nc-inp::placeholder { color: #b0bac5; font-weight: 400; }

.nc-ac-drop {
  position: absolute; top: calc(100% + 2px); left: 0; right: 0; z-index: 300;
  background: white; border: 1.5px solid #e2e8f0; border-radius: 9px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.14); overflow: hidden; max-height: 180px; overflow-y: auto;
}
.nc-ac-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 7px 10px; cursor: pointer; border-bottom: 1px solid #f8fafc; gap: 6px;
}
.nc-ac-item:last-child { border-bottom: none; }
.nc-ac-item:hover { background: #f0fdf4; }
.nai-main { font-size: 12px; font-weight: 600; color: #1e293b; }
.nai-sub  { font-size: 10px; color: #64748b; text-align: right; flex-shrink: 0; max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.nc-fac-row { display: flex; gap: 3px; flex-wrap: wrap; }
.nc-fac-btn {
  width: 24px; height: 24px; border: 1.5px solid #e2e8f0; border-radius: 5px;
  background: #f8fafc; cursor: pointer; font-size: 11px; padding: 0;
  display: flex; align-items: center; justify-content: center; transition: all 0.12s;
}
.nc-fac-btn:hover  { border-color: #1F7A5C; background: #f0fdf4; }
.nc-fac-btn.active { border-color: #1F7A5C; background: #dcfce7; }

.nc-cap-strip { display: flex; gap: 5px; flex-wrap: wrap; }
.nc-cap-strip-inline { justify-content: flex-start; margin-top: 2px; }
.nc-cap {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 5px;
  cursor: default; letter-spacing: 0.02em;
}
.ncc-ok      { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.ncc-fail    { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
.ncc-unknown { background: #fef9c3; color: #854d0e; border: 1px solid #fde68a; }

.nc-footer {
  padding: 10px 14px; border-top: 1px solid var(--border-color);
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 4px; min-height: 38px;
}
.nc-certs        { display: flex; flex-wrap: wrap; gap: 3px; flex: 1; }
.nc-cert         { font-size: 9.5px; font-weight: 600; padding: 2px 6px; border-radius: 4px; letter-spacing: 0.03em; }
.nc-cert-ok      { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.nc-cert-miss    { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
.nc-no-certs     { font-size: 9.5px; color: #94a3b8; font-style: italic; }
.nc-backup-badge { font-size: 10px; font-weight: 700; padding: 3px 8px; background: #ede9fe; color: #7c3aed; border-radius: 4px; flex-shrink: 0; }
.nc-temp {
  font-size: 9.5px; font-weight: 700; padding: 2px 7px; border-radius: 4px;
  border: 1px solid; letter-spacing: 0.03em; white-space: nowrap; flex-shrink: 0;
}

/* ── Connector ── */
.conn-col {
  display: flex; flex-direction: column; align-items: center;
  width: 130px; flex-shrink: 0; position: relative; z-index: 10;
}

/* Insert node button */
.conn-insert-btn {
  width: 24px; height: 24px; border-radius: 50%;
  border: 2px dashed #94a3b8; background: white; color: #94a3b8;
  font-size: 14px; font-weight: 700; line-height: 1;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; padding: 0; transition: all 0.15s;
  opacity: 0.45; flex-shrink: 0;
}
.conn-col:hover .conn-insert-btn,
.conn-insert-btn:hover {
  opacity: 1; border-color: #1F7A5C; color: #1F7A5C;
  background: #f0fdf4; transform: scale(1.15);
  border-style: solid;
}

.conn-line { width: 2px; height: 16px; background: #B8C2CC; border-radius: 2px; flex-shrink: 0; }
.conn-line.c-road      { background: #D97448; }
.conn-line.c-air       { background: #D4A83A; }
.conn-line.c-sea       { background: #2585A3; }
.conn-line.c-rail      { background: #5488CB; }
.conn-line.c-warehouse { background: #8267CF; }

.conn-header {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  padding: 5px 8px; cursor: pointer; border-radius: 8px;
  background: white; border: 1px solid var(--border-color);
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  transition: all 0.15s; min-width: 90px;
}
.conn-header:hover { border-color: #1F7A5C; box-shadow: 0 2px 8px rgba(31,122,92,0.15); }

.conn-transport-lbl {
  font-size: 11px; font-weight: 600; color: var(--text-main);
  white-space: nowrap; display: flex; align-items: center; gap: 3px;
}
.conn-risk-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.cr-ok       { background: #22c55e; }
.cr-warning  { background: #f59e0b; }
.cr-critical { background: #ef4444; }
.conn-expand-icon { font-size: 8px; color: #94a3b8; }
.conn-arrow { font-size: 16px; color: var(--primary); flex-shrink: 0; }

/* Expanded panel */
.conn-panel {
  background: white; border: 1.5px solid var(--border-color); border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12); padding: 10px; width: 200px;
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  z-index: 200; display: flex; flex-direction: column; gap: 8px;
}
.cp-tabs { display: flex; align-items: center; justify-content: space-between; }
.cp-tab-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #64748b; }
.cp-field-label { font-size: 10px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
.cp-inp { font-size: 12px; }

.conn-picker {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px;
}
.ctp-btn {
  height: 28px; border: 1.5px solid var(--border-color); border-radius: 6px;
  background: white; cursor: pointer; font-size: 14px;
  display: flex; align-items: center; justify-content: center; transition: all 0.15s; padding: 0;
}
.ctp-btn:hover  { border-color: var(--primary); background: var(--primary-glow); }
.ctp-btn.active { border-color: var(--primary); background: var(--primary-glow); }

/* Risk block */
.cp-risk-block { border-radius: 8px; padding: 8px 10px; }
.cpb-ok       { background: #f0fdf4; border: 1px solid #bbf7d0; }
.cpb-warning  { background: #fffbeb; border: 1px solid #fde68a; }
.cpb-critical { background: #fef2f2; border: 1px solid #fecaca; }
.cp-risk-header { display: flex; align-items: baseline; gap: 6px; margin-bottom: 6px; }
.cp-risk-score  { font-size: 20px; font-weight: 800; color: #1e293b; line-height: 1; }
.cp-risk-label  { font-size: 11px; font-weight: 600; color: #64748b; }
.cpb-ok       .cp-risk-score { color: #15803d; }
.cpb-warning  .cp-risk-score { color: #b45309; }
.cpb-critical .cp-risk-score { color: #b91c1c; }
.cp-risk-details { display: flex; flex-direction: column; gap: 3px; }
.cp-risk-detail { display: flex; gap: 5px; align-items: flex-start; font-size: 10.5px; }
.cpd-icon { flex-shrink: 0; font-size: 11px; }
.cpd-text { line-height: 1.4; color: #475569; }
.cpd-critical .cpd-text { color: #b91c1c; }
.cpd-warning  .cpd-text { color: #854d0e; }
.cpd-ok       .cpd-text { color: #15803d; }

/* ── Backup Modal ── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; backdrop-filter: blur(6px);
}
.modal-card-wrap { display: flex; align-items: center; }
.modal-card {
  background: #fff; width: 480px; border-radius: 20px;
  box-shadow: 0 24px 56px rgba(0,0,0,0.2);
  display: flex; flex-direction: column; max-height: 88vh;
}
.modal-header {
  padding: 18px 22px; border-bottom: 1px solid var(--border-color);
  display: flex; justify-content: space-between; align-items: flex-start;
}
.modal-header h3 { margin: 0 0 2px; font-size: 16px; font-weight: 600; color: var(--text-main); }
.modal-sub       { margin: 0; font-size: 12px; color: var(--text-muted); }
.close-btn { background: none; border: none; font-size: 22px; color: var(--text-muted); cursor: pointer; line-height: 1; flex-shrink: 0; }
.close-btn:hover { color: var(--text-main); }

.modal-form { flex: 1; overflow-y: auto; padding: 20px 22px; display: flex; flex-direction: column; gap: 16px; }
.form-group       { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 500; color: var(--text-main); }

.modern-input {
  width: 100%; padding: 10px 13px;
  border: 1.5px solid var(--border-color); border-radius: 8px;
  font-size: 14px; color: var(--text-main);
  box-sizing: border-box; font-family: inherit;
  transition: all var(--transition-fast); background: #fafbfc;
}
.modern-input:focus { outline: none; border-color: var(--primary); background: white; box-shadow: 0 0 0 3px var(--primary-glow); }

.transport-btns { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
.t-btn {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 8px 4px; border: 1.5px solid var(--border-color); border-radius: 8px;
  background: white; cursor: pointer; font-size: 11px;
  color: var(--text-muted); font-family: inherit; transition: all var(--transition-fast);
}
.t-btn:hover  { border-color: var(--primary); color: var(--primary); background: var(--primary-glow); }
.t-btn.active { border-color: var(--primary); background: var(--primary-glow); color: var(--primary); font-weight: 600; }
.t-btn span:first-child { font-size: 18px; }

.backups-list { display: flex; flex-direction: column; gap: 6px; }
.bk-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: #f9fafb; border: 1px solid var(--border-color); border-radius: 8px; }
.bk-icon   { font-size: 16px; flex-shrink: 0; }
.bk-loc    { font-size: 13px; font-weight: 500; color: var(--text-main); flex: 1; }
.bk-co     { font-size: 11px; color: var(--text-muted); }
.bk-remove { background: none; border: none; color: #ef4444; font-size: 16px; cursor: pointer; padding: 0 4px; border-radius: 4px; flex-shrink: 0; }
.bk-remove:hover { background: #fef2f2; }

.modal-actions { padding: 13px 22px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 10px; flex-shrink: 0; }
.btn-cancel { padding: 9px 18px; background: white; border: 1.5px solid var(--border-color); color: var(--text-muted); border-radius: 8px; font-weight: 500; font-size: 13px; cursor: pointer; transition: all var(--transition-fast); font-family: inherit; }
.btn-cancel:hover { background: #f8fafc; color: var(--text-main); }
.btn-save { padding: 9px 22px; background: var(--primary); color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; transition: all var(--transition-fast); box-shadow: 0 4px 10px var(--primary-glow); font-family: inherit; }
.btn-save:hover { background: var(--primary-light); transform: translateY(-1px); }
</style>
