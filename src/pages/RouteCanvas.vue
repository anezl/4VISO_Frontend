<template>
  <div class="rcanvas-page">

    <!-- LEFT INFO PANEL (step 2 of 2) -->
    <div class="step-panel">
      <div class="step-content">
        <div class="step-pill">Step 2 of 2</div>
        <h2 class="panel-title">Route Builder</h2>
        <p class="panel-desc">
          Visually assemble your supply chain lane. Place, connect and configure each logistics node.
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
          <div class="hint-row"><span>🖱️</span><span>Scroll to zoom</span></div>
          <div class="hint-row"><span>✋</span><span>Drag canvas to pan</span></div>
          <div class="hint-row"><span>✏️</span><span>Double-click to edit</span></div>
          <div class="hint-row"><span>↕</span><span>Drag nodes to reorder</span></div>
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
              <span v-else class="save-ind idle">Double-click to edit · Drag to reorder</span>
            </p>
          </div>
          <div class="toolbar-actions">
            <button class="btn-tool" @click="addNode" :disabled="removingMode || backupPickMode">
              <span>+</span> Add Node
            </button>
            <button class="btn-tool backup-tool"
              @click="enterBackupPickMode"
              :disabled="removingMode || intermediaryNodes.length === 0"
              :class="{ active: backupPickMode }">
              <span>⊕</span> {{ backupPickMode ? 'Pick a node…' : 'Add Backup' }}
            </button>
            <button class="btn-tool remove-tool"
              :class="{ active: removingMode }"
              @click="toggleRemoveMode">
              <span>−</span> {{ removingMode ? 'Cancel' : 'Remove Node' }}
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
            <span v-if="currentLane?.riskLevel" class="risk-badge" :class="'risk-' + currentLane.riskLevel">{{ currentLane.riskLevel }} risk</span>
            <div class="banner-line"></div>
            <span class="banner-arrow">→</span>
          </div>
          <div class="route-ep">
            <span class="ep-tag dest">DESTINATION</span>
            <span class="ep-name">{{ destinationNode?.details?.location || '—' }}</span>
            <span class="ep-company">{{ destinationNode?.details?.company || '' }}</span>
          </div>
        </div>

        <!-- CANVAS VIEWPORT (pan + zoom container) -->
        <div class="canvas-viewport" ref="viewportRef"
          :style="{ cursor: isPanning ? 'grabbing' : 'grab' }"
          @mousedown="onViewportMouseDown"
        >
          <!-- Canvas inner: receives the pan/zoom transform -->
          <div class="canvas-inner"
            :style="{
              transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`,
              transformOrigin: '0 0',
              width: laneWidth + 'px',
              height: LANE_H + 'px',
            }"
          >
            <!-- SVG connectors -->
            <svg class="lane-svg" :class="{ hidden: isDragging }">
              <line v-for="(_, i) in nodes.slice(0, nodes.length - 1)" :key="'l'+nodes[i].id"
                :x1="colToX(i)   + HEX_W / 2"
                :y1="rowToY(nodes[i].row   || 0)"
                :x2="colToX(i+1) + HEX_W / 2"
                :y2="rowToY(nodes[i+1].row || 0)"
                stroke="#B8C2CC" stroke-width="2" stroke-dasharray="6 5"
              />
            </svg>

            <!-- NODES -->
            <div v-for="(node, index) in nodes" :key="node.id"
              class="node-wrapper"
              :class="{
                'is-dragged':   draggedIndex === index,
                'remove-mode':  removingMode  && node.type === 'intermediary',
                'backup-pick':  backupPickMode && node.type === 'intermediary',
                'is-endpoint':  node.type === 'origin' || node.type === 'destination',
                'has-missing-certs': getMissingCertifications(node.certifications).length > 0,
              }"
              :style="nodeStyle(index)"
            >
              <!-- PRIMARY HEX -->
              <div class="hex-shadow"
                :class="{
                  'remove-target':      removingMode  && node.type === 'intermediary',
                  'backup-pick-target': backupPickMode && node.type === 'intermediary',
                  'backup-drop-target': backupDrag.active && backupDrag.nodeIdx === index && backupDrag.overPrimary,
                }"
                @mousedown.stop="onHexMouseDown($event, index)"
                @click="handleHexClick($event, index)"
                @dblclick="!removingMode && !backupPickMode && openModal(index)"
              >
                <div class="hex primary-hex"
                  :style="node.type === 'intermediary' ? transportHexStyle(node.details.transportType) : {}"
                >
                  <div v-if="removingMode && node.type === 'intermediary'" class="remove-x">×</div>
                  <div v-else-if="backupPickMode && node.type === 'intermediary'" class="backup-pick-icon">⊕</div>
                  <template v-else>
                    <div class="hex-content" v-if="node.type === 'origin' || node.type === 'destination'">
                      <span class="hc-loc">{{ node.details.location || (node.type === 'origin' ? 'Origin' : 'Destination') }}</span>
                      <span class="hc-company" v-if="node.details.company">{{ node.details.company }}</span>
                    </div>
                    <div class="hex-content" v-else>
                      <span class="hc-icon">{{ transportIcon(node.details.transportType) }}</span>
                      <span class="hc-loc">{{ node.details.location || 'Node' }}</span>
                      <span class="hc-company" v-if="node.details.company">{{ node.details.company }}</span>
                    </div>
                  </template>
                  <div v-if="getMissingCertifications(node.certifications).length > 0" class="cert-alert-badge" :title="`Missing: ${getMissingCertifications(node.certifications).join(', ')}`">⚠️</div>
                </div>
              </div>

              <!-- BACKUP NODES -->
              <template v-if="node.backups && node.backups.length > 0">
                <div v-for="(backup, bIndex) in node.backups" :key="'b'+bIndex" class="backup-stack">
                  <div class="backup-connector"></div>
                  <div class="hex-shadow backup-shadow-wrap"
                    :class="{ 'remove-target': removingMode }"
                    :style="backupDrag.active && backupDrag.nodeIdx === index && backupDrag.bkIdx === bIndex ? { opacity: 0 } : {}"
                    @mousedown.stop="onBackupMouseDown($event, index, bIndex)"
                    @click.stop="handleBackupClick(index, bIndex)"
                    @dblclick.stop="!removingMode && openBackupModal(index, bIndex)"
                  >
                    <div class="hex backup-hex">
                      <div v-if="removingMode" class="remove-x">×</div>
                      <div class="hex-content" v-else>
                        <span class="hc-icon">{{ transportIcon(backup.transportType) }}</span>
                        <span class="hc-loc backup-label-text">{{ backup.location || `Backup ${bIndex + 1}` }}</span>
                        <span class="hc-company" v-if="backup.company">{{ backup.company }}</span>
                      </div>
                      <div class="backup-badge" v-if="!removingMode">B{{ bIndex + 1 }}</div>
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <!-- DRAG GHOST -->
            <div v-if="isDragging && ghost.visible" class="drag-ghost" :style="ghostStyle"></div>

            <!-- BACKUP DRAG GHOST -->
            <div v-if="backupDrag.active" class="backup-drag-ghost" :style="backupGhostStyle">
              <div class="hex backup-hex">
                <div class="hex-content">
                  <span class="hc-icon">{{ transportIcon(nodes[backupDrag.nodeIdx]?.backups[backupDrag.bkIdx]?.transportType) }}</span>
                  <span class="hc-loc backup-label-text">{{ nodes[backupDrag.nodeIdx]?.backups[backupDrag.bkIdx]?.location || 'Backup' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Zoom controls overlay -->
          <div class="zoom-controls">
            <button class="zoom-btn" @click="zoomIn" title="Zoom in">+</button>
            <span class="zoom-pct">{{ Math.round(zoomLevel * 100) }}%</span>
            <button class="zoom-btn" @click="zoomOut" title="Zoom out">−</button>
            <div class="zoom-sep"></div>
            <button class="zoom-btn" @click="resetView" title="Reset view">⊡</button>
          </div>
        </div>

        </template><!-- end v-else (no loadError) -->

      </div>
    </div>

    <!-- MODAL -->
    <div class="modal-overlay" v-if="editingNodeIndex !== null" @click.self="closeModal">
      <div class="modal-duo" v-if="editingFormData">
        <div class="preview-panel">
          <p class="preview-lbl">Preview</p>
          <div class="hex-preview-wrap"
            :style="editingFormData.type === 'intermediary'
              ? { filter: `drop-shadow(0 14px 44px ${transportColors[editingFormData.details.transportType || 'road'].from}88)` }
              : {}"
          >
            <div class="hex-lg" :class="editingFormData.type"
              :style="editingFormData.type === 'intermediary' ? transportHexStyle(editingFormData.details.transportType) : {}"
            >
              <template v-if="editingFormData.type === 'origin' || editingFormData.type === 'destination'">
                <span class="hlg-loc">{{ editingFormData.details.location || (editingFormData.type === 'origin' ? 'Origin' : 'Destination') }}</span>
                <span class="hlg-co" v-if="editingFormData.details.company">{{ editingFormData.details.company }}</span>
              </template>
              <template v-else>
                <span class="hlg-icon">{{ transportIcon(editingFormData.details.transportType) }}</span>
                <span class="hlg-loc">{{ editingFormData.details.location || 'Location' }}</span>
                <span class="hlg-co" v-if="editingFormData.details.company">{{ editingFormData.details.company }}</span>
              </template>
            </div>
          </div>
          <span class="preview-type-badge">{{ nodeTypeLabel(editingFormData.type) }}</span>
        </div>
        <div class="modal-card">
          <div class="modal-header">
            <h3>Edit {{ nodeTypeLabel(editingFormData.type) }}</h3>
            <button class="close-btn" @click="closeModal">×</button>
          </div>
          <div class="modal-form">
            <template v-if="editingFormData.type === 'origin' || editingFormData.type === 'destination'">
              <div class="form-group">
                <label>{{ editingFormData.type === 'origin' ? 'Origin Location' : 'Destination Location' }}</label>
                <input v-model="editingFormData.details.location" class="modern-input" placeholder="City, Country" />
              </div>
              <div class="form-group">
                <label>{{ editingFormData.type === 'origin' ? 'Sending Company' : 'Receiving Company' }}</label>
                <input v-model="editingFormData.details.company" class="modern-input" placeholder="e.g. PharmaCorp Inc." />
              </div>
              <div class="form-group">
                <label>Facility Type</label>
                <div class="facility-btns">
                  <button v-for="f in facilityTypes" :key="f.value" type="button"
                    class="f-btn" :class="{ active: editingFormData.details.facilityType === f.value }"
                    @click="editingFormData.details.facilityType = f.value"
                    :title="f.label">
                    <span>{{ f.icon }}</span><span class="f-label">{{ f.label }}</span>
                  </button>
                </div>
              </div>
            </template>
            <template v-if="editingFormData.type === 'intermediary'">
              <div class="form-group">
                <label>Current Location</label>
                <input v-model="editingFormData.details.location" class="modern-input" placeholder="City, Airport, Port…" />
              </div>
              <div class="form-group">
                <label>Transport / Facility Type</label>
                <div class="transport-btns">
                  <button v-for="t in transportTypes" :key="t.value" type="button"
                    class="t-btn" :class="{ active: editingFormData.details.transportType === t.value }"
                    @click="editingFormData.details.transportType = t.value">
                    <span>{{ t.icon }}</span><span>{{ t.label }}</span>
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label>Company <span class="lbl-note">(certified carriers)</span></label>
                <input v-model="editingFormData.details.company" class="modern-input" placeholder="e.g. DHL, FedEx…" />
                <p class="field-hint">Certified companies matching your certificates will appear here in a future update.</p>
              </div>
            </template>
            
            <!-- CERTIFICATIONS SECTION -->
            <div class="form-divider"></div>
            <div class="form-group">
              <label class="section-label">✓ Facility Certifications</label>
              <div class="certifications-selector">
                <label v-for="cert in certificatesList" :key="cert" class="cert-checkbox">
                  <input type="checkbox" :value="cert" v-model="editingFormData.certifications" />
                  <span class="cert-text">{{ cert }}</span>
                </label>
              </div>
              <p class="field-hint">Select certifications this facility holds. Required: {{ requiredCertifications.join(', ') || 'None' }}</p>
              <div v-if="getMissingCertifications(editingFormData.certifications).length > 0" class="missing-certs-alert">
                <span class="alert-icon">⚠️</span>
                <span>Missing: {{ getMissingCertifications(editingFormData.certifications).join(', ') }}</span>
              </div>
            </div>

            <template v-if="editingFormData.type === 'intermediary' && editingFormData.backups?.length > 0">
              <div class="form-group">
                <p class="field-hint" style="margin:0">This node has {{ editingFormData.backups.length }} backup{{ editingFormData.backups.length > 1 ? 's' : '' }}. Double-click a backup hexagon to edit it.</p>
              </div>
            </template>

            <!-- EXISTING CERTIFICATIONS (from loaded data) -->
            <template v-if="editingFormData.certificates && editingFormData.certificates.length > 0 && editingFormData.type !== 'origin' && editingFormData.type !== 'destination'">
              <div class="form-divider"></div>
              <div class="form-group">
                <label class="section-label">✓ Additional Node Data</label>
                <div class="certs-display">
                  <span v-for="cert in editingFormData.certificates" :key="cert" class="cert-tag">{{ cert }}</span>
                </div>
              </div>
            </template>

            <!-- TEMPERATURE CONTROL SECTION -->
            <template v-if="editingFormData.temperatureControl && (editingFormData.temperatureControl.min !== undefined || editingFormData.temperatureControl.max !== undefined)">
              <div class="form-divider"></div>
              <div class="form-group">
                <label class="section-label">🌡️ Temperature Control</label>
                <div class="temp-display">
                  <div class="temp-row">
                    <span class="temp-min">{{ editingFormData.temperatureControl.min }}°C</span>
                    <span class="temp-to">to</span>
                    <span class="temp-max">{{ editingFormData.temperatureControl.max }}°C</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- VALIDATION & SPECIAL HANDLING -->
            <template v-if="editingFormData.validationStatus || editingFormData.fragile !== undefined">
              <div class="form-divider"></div>
              <div class="form-group">
                <label class="section-label">⚠️ Compliance & Handling</label>
                <div class="compliance-display">
                  <div v-if="editingFormData.validationStatus" class="compliance-item">
                    <span class="compliance-label">Validation Status:</span>
                    <span class="compliance-value" :class="'status-' + editingFormData.validationStatus">{{ validationStatusLabel(editingFormData.validationStatus) }}</span>
                  </div>
                  <div v-if="editingFormData.fragile !== undefined" class="compliance-item">
                    <span class="compliance-label">Fragile Goods:</span>
                    <span class="compliance-value" :class="{ 'status-fragile': editingFormData.fragile }">{{ editingFormData.fragile ? '⚠️ Yes (Requires careful handling)' : '✓ No' }}</span>
                  </div>
                </div>
              </div>
            </template>
          </div>
          <div class="modal-actions">
            <button class="btn-cancel"  @click="closeModal">Cancel</button>
            <button class="btn-save"    @click="saveNodeDetails">Save Details</button>
          </div>
        </div>
      </div>
    </div>

    <!-- BACKUP MODAL -->
    <div class="modal-overlay" v-if="editingBackupData !== null" @click.self="closeBackupModal">
      <div class="modal-duo">
        <div class="preview-panel">
          <p class="preview-lbl">Preview</p>
          <div class="hex-preview-wrap" style="filter: drop-shadow(0 14px 44px rgba(0,0,0,0.22))">
            <div class="hex-lg backup-modal-hex">
              <span class="hlg-icon">{{ transportIcon(editingBackupData?.transportType) }}</span>
              <span class="hlg-loc">{{ editingBackupData?.location || 'Location' }}</span>
              <span class="hlg-co" v-if="editingBackupData?.company">{{ editingBackupData.company }}</span>
            </div>
          </div>
          <span class="preview-type-badge">Backup Node</span>
        </div>
        <div class="modal-card">
          <div class="modal-header">
            <h3>Edit Backup Node</h3>
            <button class="close-btn" @click="closeBackupModal">×</button>
          </div>
          <div class="modal-form">
            <div class="form-group">
              <label>Location</label>
              <input v-model="editingBackupData.location" class="modern-input" placeholder="City, Airport, Port…" />
            </div>
            <div class="form-group">
              <label>Transport / Facility Type</label>
              <div class="transport-btns">
                <button v-for="t in transportTypes" :key="t.value" type="button"
                  class="t-btn" :class="{ active: editingBackupData.transportType === t.value }"
                  @click="editingBackupData.transportType = t.value">
                  <span>{{ t.icon }}</span><span>{{ t.label }}</span>
                </button>
              </div>
            </div>
            <div class="form-group">
              <label>Company <span class="lbl-note">(certified carriers)</span></label>
              <input v-model="editingBackupData.company" class="modern-input" placeholder="e.g. DHL, FedEx…" />
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" @click="closeBackupModal">Cancel</button>
            <button class="btn-save"   @click="saveBackupDetails">Save Details</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from '@/services/api'

const router = useRouter()
const route  = useRoute()

// ─── Layout constants ─────────────────────────────────────────────
const HEX_W    = 170
const HEX_H    = 170
const COL_GAP  = 90
const ROW_STEP = 110
const MIN_ROW  = -2
const MAX_ROW  =  2
const LANE_H   = 600   // fixed virtual canvas height
const gridRows = [-2, -1, 0, 1, 2]
const DRAG_THRESHOLD = 6

const colToX = (col) => 40 + col * (HEX_W + COL_GAP)
const rowToY = (row) => LANE_H / 2 + (row || 0) * ROW_STEP

// ─── Pan / Zoom ───────────────────────────────────────────────────
const viewportRef = ref(null)
const panX      = ref(0)
const panY      = ref(0)
const zoomLevel = ref(1)
const isPanning = ref(false)

let panStartX = 0, panStartY = 0, panOriginX = 0, panOriginY = 0

const centerCanvas = () => {
  if (!viewportRef.value) return
  panY.value = (viewportRef.value.clientHeight - LANE_H) / 2
  panX.value = 40
}

const onWheel = (e) => {
  e.preventDefault()
  const factor   = e.deltaY < 0 ? 1.1 : 1 / 1.1
  const newZoom  = Math.max(0.2, Math.min(3, zoomLevel.value * factor))
  const ratio    = newZoom / zoomLevel.value
  const rect     = viewportRef.value.getBoundingClientRect()
  const cx       = e.clientX - rect.left
  const cy       = e.clientY - rect.top
  panX.value     = cx - (cx - panX.value) * ratio
  panY.value     = cy - (cy - panY.value) * ratio
  zoomLevel.value = newZoom
}

const zoomTowardCenter = (factor) => {
  const newZoom = Math.max(0.2, Math.min(3, zoomLevel.value * factor))
  const ratio   = newZoom / zoomLevel.value
  if (!viewportRef.value) return
  const { width, height } = viewportRef.value.getBoundingClientRect()
  panX.value    = width  / 2 - (width  / 2 - panX.value) * ratio
  panY.value    = height / 2 - (height / 2 - panY.value) * ratio
  zoomLevel.value = newZoom
}

const zoomIn    = () => zoomTowardCenter(1.2)
const zoomOut   = () => zoomTowardCenter(1 / 1.2)
const resetView = () => { zoomLevel.value = 1; centerCanvas() }

const onViewportMouseDown = (e) => {
  if (e.button !== 0 || mouseDownIndex !== -1) return
  // hex-shadow uses @mousedown.stop, so clicks on nodes never reach here
  isPanning.value = true
  panStartX  = e.clientX
  panStartY  = e.clientY
  panOriginX = panX.value
  panOriginY = panY.value
  e.preventDefault()
}

// ─── Nodes ────────────────────────────────────────────────────────
const nodes = ref([
  { id: 1, type: 'origin',      details: { company: '', location: '', facilityType: 'warehouse' }, certifications: [], backups: [], row: 0 },
  { id: 2, type: 'destination', details: { company: '', location: '', facilityType: 'warehouse' }, certifications: [], backups: [], row: 0 },
])

const originNode        = computed(() => nodes.value.find(n => n.type === 'origin'))
const destinationNode   = computed(() => nodes.value.find(n => n.type === 'destination'))
const intermediaryNodes = computed(() => nodes.value.filter(n => n.type === 'intermediary'))
const laneWidth         = computed(() => 80 + nodes.value.length * (HEX_W + COL_GAP))

const nodeStyle = (index) => {
  if (draggedIndex.value === index) {
    const node = nodes.value[index]
    let x, y
    if (node.type === 'origin' || node.type === 'destination') {
      x = colToX(index)
      y = dragRawY.value - grabOffsetY
    } else {
      x = dragRawX.value - grabOffsetX
      y = dragRawY.value - grabOffsetY
    }
    return {
      position:   'absolute',
      left:       x + 'px',
      top:        y + 'px',
      width:      HEX_W + 'px',
      zIndex:     '100',
      transition: 'none',
      filter:     'drop-shadow(0 12px 32px rgba(0,0,0,0.22))',
    }
  }
  return {
    position:   'absolute',
    left:       colToX(index) + 'px',
    top:        (rowToY(nodes.value[index].row || 0) - HEX_H / 2) + 'px',
    width:      HEX_W + 'px',
    transition: 'top .22s cubic-bezier(.4,0,.2,1), left .22s cubic-bezier(.4,0,.2,1)',
  }
}

// ─── Transport labels ─────────────────────────────────────────────
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
  { value: 'warehouse',  label: 'Warehouse',  icon: '🏭' },
  { value: 'distribution', label: 'Distribution Center', icon: '🏢' },
  { value: 'hub',        label: 'Hub',        icon: '🔀' },
  { value: 'airport',    label: 'Airport',    icon: '✈️' },
  { value: 'port',       label: 'Port',       icon: '⚓' },
  { value: 'rail_yard',  label: 'Rail Yard',  icon: '🚆' },
]

// ─── Certifications ───────────────────────────────────────────────
const certificatesList = ['GDP', 'IATA', 'ISO 9001', 'ISO 13485', 'ISO 28000']

// ─── Required certifications from product form ────────────────────
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

const getMissingCertifications = (nodeCerts) => {
  if (!Array.isArray(nodeCerts)) nodeCerts = []
  return requiredCertifications.value.filter(c => !nodeCerts.includes(c))
}

const transportColors = {
  road:      { from: '#D97448', to: '#C46B2D' },
  air:       { from: '#D4A83A', to: '#C79A2B' },
  sea:       { from: '#2585A3', to: '#1F6F8B' },
  rail:      { from: '#5488CB', to: '#4874B5' },
  warehouse: { from: '#8267CF', to: '#6D4BC3' },
}

const transportHexStyle = (transportType) => {
  const c = transportColors[transportType] || transportColors.road
  return { background: `linear-gradient(135deg, ${c.from} 0%, ${c.to} 100%)` }
}
const nodeTypeLabel = (type) =>
  type === 'origin' ? 'Origin Node' : type === 'destination' ? 'Destination Node' : 'Intermediary Node'

const validationStatusLabel = (status) =>
  status === 'validated' ? '✓ Validated' : status === 'pending' ? '⏳ Pending Review' : '✗ Not Validated'

// ─── Toolbar modes ────────────────────────────────────────────────
const removingMode   = ref(false)
const backupPickMode = ref(false)

const toggleRemoveMode   = () => { removingMode.value = !removingMode.value; if (removingMode.value) backupPickMode.value = false }
const enterBackupPickMode = () => { backupPickMode.value = !backupPickMode.value; if (backupPickMode.value) removingMode.value = false }

// ─── Modal ────────────────────────────────────────────────────────
const editingNodeIndex = ref(null)
const editingFormData  = ref(null)

const openModal = (index) => {
  editingNodeIndex.value = index
  editingFormData.value  = JSON.parse(JSON.stringify(nodes.value[index]))
  if (!editingFormData.value.backups) editingFormData.value.backups = []
  if (!editingFormData.value.certifications) editingFormData.value.certifications = []
  if (!editingFormData.value.details.facilityType) editingFormData.value.details.facilityType = 'warehouse'
}
const closeModal      = () => { editingNodeIndex.value = null; editingFormData.value = null }
const saveNodeDetails = () => {
  if (editingNodeIndex.value !== null && editingFormData.value)
    nodes.value[editingNodeIndex.value] = { ...editingFormData.value }
  closeModal()
  saveLane()
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
const addNode = () => {
  nodes.value.splice(nodes.value.length - 1, 0, {
    id: Date.now(), type: 'intermediary',
    details: { company: '', location: '', transportType: 'road', facilityType: 'warehouse' },
    certifications: [],
    backups: [], row: 0,
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
  saveLane()
}
const removeBackup = (ni, bi) => {
  nodes.value[ni].backups.splice(bi, 1)
  saveLane()
}
const handleBackupClick = (ni, bi) => {
  if (removingMode.value) { removeBackup(ni, bi); removingMode.value = false }
}
const swapBackup = (ni, bi) => {
  const node = nodes.value[ni]
  const bk   = { ...node.backups[bi] }
  const pd   = { location: node.details.location, company: node.details.company, transportType: node.details.transportType }
  node.details.location = bk.location; node.details.company = bk.company; node.details.transportType = bk.transportType
  node.backups[bi] = pd
  saveLane()
}

// ─── Backup drag (drag backup hex onto primary to swap) ──────────
const backupDrag = reactive({ active: false, nodeIdx: -1, bkIdx: -1, rawX: 0, rawY: 0, overPrimary: false })
let bkMouseDownX = 0, bkMouseDownY = 0, bkDragStarted = false

const isOverPrimary = (relX, relY, ni) => {
  const px = colToX(ni)
  const py = rowToY(nodes.value[ni]?.row || 0) - HEX_H / 2
  return relX >= px && relX <= px + HEX_W && relY >= py && relY <= py + HEX_H
}

const backupGhostStyle = computed(() => {
  if (!backupDrag.active) return {}
  return {
    position: 'absolute',
    left: (backupDrag.rawX - HEX_W / 2) + 'px',
    top:  (backupDrag.rawY - HEX_H / 2) + 'px',
    width: HEX_W + 'px',
    height: HEX_H + 'px',
    pointerEvents: 'none',
    zIndex: 100,
    filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.28))',
    opacity: 0.85,
  }
})

const onBackupMouseDown = (e, ni, bi) => {
  if (e.button !== 0) return
  e.preventDefault()
  bkMouseDownX = e.clientX
  bkMouseDownY = e.clientY
  bkDragStarted = false
  backupDrag.nodeIdx = ni
  backupDrag.bkIdx   = bi
}

// ─── Mouse drag (nodes) ───────────────────────────────────────────
const draggedIndex  = ref(null)
const isDragging    = ref(false)
const ghost         = reactive({ visible: false, col: 0, row: 0 })
const dragRawX      = ref(0)
const dragRawY      = ref(0)
let grabOffsetX = 0
let grabOffsetY = 0

const ghostStyle = computed(() => ({
  position: 'absolute',
  left:   colToX(ghost.col) + 'px',
  top:    (rowToY(ghost.row) - HEX_H / 2) + 'px',
  width:  HEX_W + 'px',
  height: HEX_H + 'px',
}))

let mouseDownX = 0, mouseDownY = 0, mouseDownIndex = -1, draggingStarted = false
let dragJustEnded = false

const snapRow = (relY) => Math.max(MIN_ROW, Math.min(MAX_ROW, Math.round((relY - LANE_H / 2) / ROW_STEP)))
const snapCol = (relX, n) => Math.max(1, Math.min(n - 2, Math.round((relX - 40 - HEX_W / 2) / (HEX_W + COL_GAP))))

const toLaneCoords = (clientX, clientY) => {
  const rect = viewportRef.value.getBoundingClientRect()
  return {
    relX: (clientX - rect.left - panX.value) / zoomLevel.value,
    relY: (clientY - rect.top  - panY.value) / zoomLevel.value,
  }
}

const onHexMouseDown = (e, index) => {
  if (removingMode.value || backupPickMode.value || e.button !== 0) return
  e.preventDefault()
  mouseDownX     = e.clientX
  mouseDownY     = e.clientY
  mouseDownIndex = index
  draggingStarted = false
  const { relX, relY } = toLaneCoords(e.clientX, e.clientY)
  grabOffsetX = relX - colToX(index)
  grabOffsetY = relY - (rowToY(nodes.value[index].row || 0) - HEX_H / 2)
}

const handleHexClick = (e, index) => {
  if (dragJustEnded) { dragJustEnded = false; return }
  if (removingMode.value && nodes.value[index].type === 'intermediary') { deleteNode(index); return }
  if (backupPickMode.value && nodes.value[index].type === 'intermediary') { addBackupToNode(index); backupPickMode.value = false; return }
}

// Global handlers (attached to window for smooth tracking outside viewport)
const onMouseMove = (e) => {
  if (backupDrag.nodeIdx !== -1) {
    const dx = e.clientX - bkMouseDownX
    const dy = e.clientY - bkMouseDownY
    if (!bkDragStarted && Math.sqrt(dx * dx + dy * dy) >= DRAG_THRESHOLD) {
      bkDragStarted = true
      backupDrag.active = true
    }
    if (bkDragStarted) {
      const { relX, relY } = toLaneCoords(e.clientX, e.clientY)
      backupDrag.rawX = relX
      backupDrag.rawY = relY
      backupDrag.overPrimary = isOverPrimary(relX, relY, backupDrag.nodeIdx)
    }
    return
  }
  if (mouseDownIndex !== -1) {
    const dx = e.clientX - mouseDownX
    const dy = e.clientY - mouseDownY
    if (!draggingStarted) {
      if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return
      draggingStarted    = true
      draggedIndex.value = mouseDownIndex
      isDragging.value   = true
    }
    const { relX, relY } = toLaneCoords(e.clientX, e.clientY)
    dragRawX.value = relX
    dragRawY.value = relY
    const nodeType = nodes.value[mouseDownIndex].type
    if (nodeType === 'intermediary') {
      ghost.col     = snapCol(relX, nodes.value.length)
      ghost.row     = snapRow(relY)
      ghost.visible = true
    } else {
      ghost.visible = false
    }
  } else if (isPanning.value) {
    panX.value = panOriginX + (e.clientX - panStartX)
    panY.value = panOriginY + (e.clientY - panStartY)
  }
}

const onMouseUp = (e) => {
  if (backupDrag.nodeIdx !== -1) {
    if (bkDragStarted && backupDrag.overPrimary) swapBackup(backupDrag.nodeIdx, backupDrag.bkIdx)
    backupDrag.active = false
    backupDrag.nodeIdx = -1
    backupDrag.bkIdx = -1
    backupDrag.overPrimary = false
    bkDragStarted = false
    return
  }
  if (mouseDownIndex !== -1 && draggingStarted && draggedIndex.value !== null) {
    const idx      = draggedIndex.value
    const { relX, relY } = toLaneCoords(e.clientX, e.clientY)
    const nodeType = nodes.value[idx].type
    if (nodeType === 'origin' || nodeType === 'destination') {
      nodes.value[idx].row = snapRow(relY)
    } else {
      const col  = snapCol(relX, nodes.value.length)
      const row  = snapRow(relY)
      const item = nodes.value.splice(idx, 1)[0]
      item.row   = row
      nodes.value.splice(col, 0, item)
    }
    dragJustEnded = true
    setTimeout(() => { dragJustEnded = false }, 50)
    saveLane()
  }
  draggedIndex.value = null
  isDragging.value   = false
  ghost.visible      = false
  dragRawX.value     = 0
  dragRawY.value     = 0
  mouseDownIndex     = -1
  draggingStarted    = false
  isPanning.value    = false
}


// ─── Save state ───────────────────────────────────────────────────
const saveStatus   = ref('idle') // 'idle' | 'saving' | 'saved' | 'error'
const loadError    = ref('')
const currentLane  = ref(null)
let saveTimer = null

const saveLane = async () => {
  const laneId = route.query.laneId
  if (!laneId) return
  clearTimeout(saveTimer)
  saveStatus.value = 'saving'
  try {
    await api.put(`/lanes/${laneId}`, {
      nodes: nodes.value.map(n => ({
        location:     n.details.location,
        company:      n.details.company,
        transport:    n.details.transportType,
        type:         n.details.facilityType,
        certificates: n.certifications || [],
        backups:      (n.backups || []).map(b => ({
          location:      b.location      || '',
          company:       b.company       || '',
          transportType: b.transportType || 'road',
        })),
      }))
    })
    saveStatus.value = 'saved'
    saveTimer = setTimeout(() => { saveStatus.value = 'idle' }, 2000)
  } catch (err) {
    saveStatus.value = 'error'
  }
}


// ─── Mount / Unmount ──────────────────────────────────────────────
onMounted(async () => {
  await nextTick()
  centerCanvas()

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
            id:           n._id || Date.now() + i,
            type,
            details: {
              location:      n.location  || '',
              company:       n.company   || '',
              transportType: n.transport || 'road',
              facilityType:  n.type      || 'warehouse',
            },
            certifications: n.certificates || [],
            backups: (n.backups || []).map(b => ({
              location:      b.location      || '',
              company:       b.company       || '',
              transportType: b.transportType || 'road',
            })),
            row: 0,
          }
        })
      }

      // Apply origin/destination from lane document if nodes are empty or missing location
      const originCity = lane.origin?.city || ''
      const destCity   = lane.destination?.city || ''
      if (originCity && !nodes.value[0].details.location)
        nodes.value[0].details.location = originCity
      if (destCity && !nodes.value[nodes.value.length - 1].details.location)
        nodes.value[nodes.value.length - 1].details.location = destCity

    } catch (err) {
      loadError.value = 'Failed to load lane. It may have been deleted or you don\'t have access.'
    }
  } else {
    // No laneId — fill origin/dest from localStorage if available
    try {
      const stored = localStorage.getItem('routeData')
      if (stored) {
        const data = JSON.parse(stored)
        if (data.origin)      nodes.value[0].details.location                      = data.origin
        if (data.destination) nodes.value[nodes.value.length - 1].details.location = data.destination
      }
    } catch (_) {}
  }

  viewportRef.value?.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup',   onMouseUp)
})

onUnmounted(() => {
  clearTimeout(saveTimer)
  viewportRef.value?.removeEventListener('wheel', onWheel)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup',   onMouseUp)
})
</script>

<style scoped>
/* ── Page shell ── */
.rcanvas-page {
  display: flex;
  height: 100%;
}

/* ── Left info panel ── */
.step-panel {
  width: 240px;
  flex-shrink: 0;
  background: #1A3528;
  position: relative;
  overflow: hidden;
}

.step-panel::before {
  content: '';
  position: absolute;
  top: -80px; right: -80px;
  width: 240px; height: 240px;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
  pointer-events: none;
}

.step-panel::after {
  content: '';
  position: absolute;
  bottom: -100px; left: -60px;
  width: 300px; height: 300px;
  border-radius: 50%;
  background: rgba(255,255,255,0.04);
  pointer-events: none;
}

.step-content {
  padding: 48px 28px;
  position: relative;
  z-index: 1;
}

.step-pill {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 999px;
  color: rgba(255,255,255,0.75);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 18px;
}

.panel-title {
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin: 0 0 10px 0;
  line-height: 1.25;
}

.panel-desc {
  color: rgba(255,255,255,0.7);
  font-size: 12.5px;
  line-height: 1.65;
  margin: 0 0 36px 0;
}

/* Timeline */
.timeline { display: flex; flex-direction: column; }
.tl-item  { display: flex; gap: 12px; align-items: flex-start; }

.tl-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  padding-top: 1px;
}

.tl-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: var(--primary);
}

.tl-dot.done {
  background: rgba(255,255,255,0.25);
  border: 1.5px solid rgba(255,255,255,0.6);
  font-size: 10px;
  color: white;
}

.tl-line {
  width: 1.5px;
  height: 36px;
  background: rgba(255,255,255,0.2);
  margin: 4px 0;
}

.tl-text strong { display: block; color: white; font-size: 13px; font-weight: 600; margin-bottom: 3px; }
.tl-text span   { font-size: 12px; color: rgba(255,255,255,0.55); }

/* Hint box */
.hint-box {
  margin-top: 36px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hint-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: rgba(255,255,255,0.75);
}

.hint-row span:first-child { font-size: 14px; width: 18px; text-align: center; flex-shrink: 0; }

/* ── Main area ── */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: var(--bg-color);
  min-width: 0;
}

.canvas-card {
  flex: 1;
  background: var(--surface-color);
  border-radius: 16px;
  box-shadow: var(--shadow-float);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Toolbar ── */
.toolbar {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  gap: 12px;
}

.toolbar-left    { flex: 1; }
.toolbar-center  { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; }
.toolbar-actions { flex: 1; display: flex; gap: 8px; justify-content: flex-end; }

.toolbar-title { margin: 0 0 2px; font-size: 16px; font-weight: 600; color: var(--text-main); }
.toolbar-sub   { margin: 0; font-size: 11px; color: var(--text-muted); }

.save-ind        { font-size: 11px; }
.save-ind.saving { color: #64748b; }
.save-ind.saved  { color: #15803d; font-weight: 500; }
.save-ind.error  { color: #b91c1c; }
.save-ind.idle   { color: var(--text-muted); }

.canvas-load-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  color: #b91c1c;
  font-size: 14px;
}

.btn-back {
  padding: 7px 14px;
  border: 1.5px solid var(--border-color);
  border-radius: 8px;
  background: white;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: inherit;
  white-space: nowrap;
}
.btn-back:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-glow); }

.btn-tool {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border: 1.5px solid var(--border-color);
  border-radius: 8px;
  background: white;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: inherit;
  white-space: nowrap;
}
.btn-tool:hover:not(:disabled)    { border-color: var(--primary); color: var(--primary); background: var(--primary-glow); }
.btn-tool:disabled                { opacity: 0.4; cursor: not-allowed; }
.btn-tool.backup-tool.active      { border-color: var(--primary); color: var(--primary); background: var(--primary-glow); }
.btn-tool.remove-tool:hover:not(:disabled) { border-color: #ef4444; color: #ef4444; background: #fef2f2; }
.btn-tool.remove-tool.active      { border-color: #ef4444; color: #ef4444; background: #fef2f2; }

/* ── Route banner ── */
.route-banner {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-bottom: 1px solid #E8EDF2;
  padding: 12px 24px;
  flex-shrink: 0;
}

.route-ep { display: flex; flex-direction: column; gap: 3px; min-width: 140px; }

.ep-tag {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.ep-tag.origin { color: #1F7A5C; }
.ep-tag.dest   { color: #1F7A5C; }

.ep-name    { font-size: 16px; font-weight: 600; color: var(--text-main); line-height: 1.25; }
.ep-company { font-size: 11.5px; color: var(--text-muted); letter-spacing: 0.01em; }

.banner-mid {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 8px;
  padding: 0 20px;
}
.banner-line  { flex: 1; height: 1px; background: #E8EDF2; }
.banner-stops { font-size: 11px; color: var(--text-muted); white-space: nowrap; font-weight: 500; letter-spacing: 0.03em; }
.banner-arrow { font-size: 16px; color: #1F7A5C; }
.risk-badge { display: inline-flex; align-items: center; height: 18px; padding: 0 7px; border-radius: 4px; font-size: 10px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; white-space: nowrap; }
.risk-badge.risk-low    { background: #dcfce7; color: #15803d; }
.risk-badge.risk-medium { background: #fef9c3; color: #854d0e; }
.risk-badge.risk-high   { background: #fee2e2; color: #991b1b; }

/* ── Canvas viewport ── */
.canvas-viewport {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: #F7F9FB;
  background-image: radial-gradient(circle, rgba(183, 194, 207, 0.55) 1px, transparent 1px);
  background-size: 28px 28px;
  user-select: none;
}

/* ── Canvas inner (the transformed layer) ── */
.canvas-inner {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
}

/* SVG connectors */
.lane-svg {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: visible;
  transition: opacity 0.15s ease;
}

.lane-svg.hidden { opacity: 0; }


/* ── Node wrappers ── */
.node-wrapper { position: absolute; display: flex; flex-direction: column; align-items: center; z-index: 1; }
.node-wrapper.is-dragged { pointer-events: none; }

/* ── Hex ── */
.hex-shadow { filter: drop-shadow(0 6px 16px rgba(0,0,0,0.16)) drop-shadow(0 2px 4px rgba(0,0,0,0.08)); cursor: grab; transition: filter 0.22s; }
.hex-shadow:hover  { filter: drop-shadow(0 10px 26px rgba(0,0,0,0.22)) drop-shadow(0 2px 6px rgba(0,0,0,0.1)); }
.hex-shadow:active { cursor: grabbing; }
.is-endpoint .hex-shadow { filter: drop-shadow(0 8px 22px rgba(31,122,92,0.32)) drop-shadow(0 2px 5px rgba(0,0,0,0.1)); }
.is-endpoint .hex-shadow:hover { filter: drop-shadow(0 12px 30px rgba(31,122,92,0.45)) drop-shadow(0 3px 8px rgba(0,0,0,0.12)); }

.remove-target      { filter: drop-shadow(0 4px 14px rgba(239,68,68,.45)); animation: pulse-red   0.8s infinite alternate; cursor: pointer !important; }
.backup-pick-target { filter: drop-shadow(0 4px 14px rgba(31,111,84,.5));  animation: pulse-green 0.8s infinite alternate; cursor: pointer !important; }

.hex { position: relative; width: 170px; height: 170px; clip-path: polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%); display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; user-select: none; }
.hex-content { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; }
.hc-icon { font-size: 28px; line-height: 1; }
.hc-loc  { font-size: 12px; font-weight: 600; word-break: break-word; text-align: center; max-width: 95%; }
.hc-company { font-size: 9px; opacity: 0.85; word-break: break-word; text-align: center; max-width: 95%; }
.remove-x { font-size: 44px; color: rgba(255,255,255,.9); font-weight: 300; line-height: 1; }
.backup-pick-icon { font-size: 32px; }

.cert-alert-badge { position: absolute; top: -6px; right: -6px; width: 28px; height: 28px; background: #ffc107; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); cursor: help; z-index: 10; }
.node-wrapper.has-missing-certs .cert-alert-badge { animation: pulse-warning 2s infinite; }

@keyframes pulse-warning {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes pulse-red   { from { filter: drop-shadow(0 4px 8px rgba(239,68,68,.3)) } to { filter: drop-shadow(0 4px 22px rgba(239,68,68,.8)) } }
@keyframes pulse-green { from { filter: drop-shadow(0 4px 8px rgba(31,111,84,.3)) } to { filter: drop-shadow(0 4px 22px rgba(31,111,84,.8)) } }

.hex {
  width: 170px; height: 170px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 500; font-size: 13px; text-align: center;
  padding: 14px; box-sizing: border-box;
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  position: relative;
}

.primary-hex { background: linear-gradient(135deg, #1F7A5C 0%, #269e76 100%); }
.backup-hex  { background: linear-gradient(135deg, #576270 0%, #7a8b99 100%); }

.hex-content { display: flex; flex-direction: column; align-items: center; gap: 3px; width: 100%; }
.hc-icon     { font-size: 16px; }
.hc-loc      { font-size: 13px; font-weight: 500; line-height: 1.2; word-break: break-word; }
.hc-company  { font-size: 11px; opacity: 0.85; line-height: 1.2; word-break: break-word; }
.backup-label-text { font-size: 12px; }
.remove-x         { font-size: 36px; font-weight: 300; opacity: 0.9; }
.backup-pick-icon { font-size: 30px; font-weight: 300; opacity: 0.9; }

/* ── Backup stacks ── */
.backup-stack     { display: flex; flex-direction: column; align-items: center; }
.backup-connector { width: 2px; height: 14px; background: #B8C2CC; }
.backup-shadow-wrap { position: relative; }

.backup-shadow-wrap { cursor: grab; }
.backup-shadow-wrap:active { cursor: grabbing; }
.backup-badge    { position: absolute; top: 22px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,.28); color: #fff; font-size: 10px; font-weight: 600; border-radius: 10px; padding: 2px 7px; pointer-events: none; letter-spacing: .04em; }
.backup-shadow-wrap:not(.remove-target):hover { filter: drop-shadow(0 8px 20px rgba(0,0,0,0.2)) drop-shadow(0 2px 5px rgba(0,0,0,0.1)); }
.backup-drag-ghost { position: absolute; pointer-events: none; z-index: 100; }
.backup-drop-target { filter: drop-shadow(0 4px 14px rgba(31,122,92,.55)) !important; animation: pulse-green 0.8s infinite alternate; }

/* ── Drag ghost ── */
.drag-ghost {
  position: absolute; pointer-events: none; z-index: 10;
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  background: rgba(31,122,92,0.08);
  border: 2px dashed rgba(31,122,92,0.35);
  box-sizing: border-box;
}

/* ── Zoom controls ── */
.zoom-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 2px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid #E0E6ED;
  border-radius: 10px;
  padding: 4px 6px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.zoom-btn {
  width: 28px; height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 16px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all var(--transition-fast);
  font-family: inherit;
}
.zoom-btn:hover { background: #f1f5f9; color: var(--primary); }

.zoom-pct {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-main);
  min-width: 38px;
  text-align: center;
}

.zoom-sep {
  width: 1px; height: 18px;
  background: var(--border-color);
  margin: 0 2px;
}

/* ── Modal ── */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(6px); }
.modal-duo     { display: flex; align-items: center; gap: 64px; max-height: 92vh; }

.preview-panel    { display: flex; flex-direction: column; align-items: center; gap: 20px; flex-shrink: 0; }
.preview-lbl      { font-size: 11px; font-weight: 500; color: rgba(255,255,255,.75); text-transform: uppercase; letter-spacing: .1em; margin: 0; }
.hex-preview-wrap { filter: drop-shadow(0 14px 44px rgba(31,122,92,.5)); }
.hex-lg { width: 300px; height: 300px; clip-path: polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 32px; box-sizing: border-box; color: #fff; text-align: center; }
.hex-lg.origin, .hex-lg.destination, .hex-lg.intermediary { background: linear-gradient(135deg, #1F7A5C, #269e76); }
.hex-lg.backup-modal-hex { background: linear-gradient(135deg, #576270, #7a8b99); }
.hlg-icon { font-size: 36px; }
.hlg-loc  { font-size: 18px; font-weight: 600; line-height: 1.2; word-break: break-word; }
.hlg-co   { font-size: 13px; opacity: .8; word-break: break-word; }
.preview-type-badge { font-size: 11.5px; font-weight: 500; color: rgba(255,255,255,.9); background: rgba(31,122,92,.3); border: 1px solid rgba(255,255,255,.25); border-radius: 20px; padding: 6px 18px; backdrop-filter: blur(6px); letter-spacing: 0.03em; }

.modal-card    { background: #fff; width: 420px; border-radius: 20px; box-shadow: 0 24px 56px rgba(0,0,0,.2); display: flex; flex-direction: column; max-height: 88vh; flex-shrink: 0; }
.modal-header  { padding: 18px 22px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; font-size: 16px; font-weight: 600; color: var(--text-main); }
.close-btn     { background: none; border: none; font-size: 22px; color: var(--text-muted); cursor: pointer; line-height: 1; }
.close-btn:hover { color: var(--text-main); }

.modal-form  { flex: 1; overflow-y: auto; padding: 20px 22px; display: flex; flex-direction: column; gap: 16px; }
.form-group  { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 500; color: var(--text-main); }
.lbl-note    { font-size: 11px; font-weight: 400; color: var(--text-muted); }

.modern-input { width: 100%; padding: 10px 13px; border: 1.5px solid var(--border-color); border-radius: 8px; font-size: 14px; color: var(--text-main); box-sizing: border-box; font-family: inherit; transition: all var(--transition-fast); background: #fafbfc; }
.modern-input:focus { outline: none; border-color: var(--primary); background: white; box-shadow: 0 0 0 3px var(--primary-glow); }
.field-hint  { margin: 4px 0 0; font-size: 11px; color: var(--text-muted); font-style: italic; }

.transport-btns { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
.t-btn { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 4px; border: 1.5px solid var(--border-color); border-radius: 8px; background: white; cursor: pointer; font-size: 11px; color: var(--text-muted); font-family: inherit; transition: all var(--transition-fast); }
.t-btn:hover  { border-color: var(--primary); color: var(--primary); background: var(--primary-glow); }
.t-btn.active { border-color: var(--primary); background: var(--primary-glow); color: var(--primary); font-weight: 600; }
.t-btn span:first-child { font-size: 18px; }

.backups-section        { border: 1.5px solid var(--border-color); border-radius: 10px; overflow: hidden; }
.backups-section-header { padding: 9px 13px; background: #f9fafb; font-size: 13px; font-weight: 500; color: var(--text-main); border-bottom: 1px solid var(--border-color); }
.backup-editor          { padding: 13px; border-bottom: 1px solid #f1f5f9; }
.backup-editor:last-child { border-bottom: none; }
.backup-editor-header   { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.backup-editor-label    { font-size: 12px; font-weight: 600; color: #6366f1; text-transform: uppercase; letter-spacing: .06em; }
.backup-editor-remove   { background: none; border: none; font-size: 12px; color: #ef4444; cursor: pointer; font-family: inherit; padding: 2px 6px; border-radius: 4px; }
.backup-editor-remove:hover { background: #fef2f2; }

.modal-actions { padding: 13px 22px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 10px; flex-shrink: 0; }
.btn-cancel { padding: 9px 18px; background: white; border: 1.5px solid var(--border-color); color: var(--text-muted); border-radius: 8px; font-weight: 500; font-size: 13px; cursor: pointer; transition: all var(--transition-fast); font-family: inherit; }
.btn-cancel:hover { background: #f8fafc; color: var(--text-main); }
.btn-save { padding: 9px 22px; background: var(--primary); color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; transition: all var(--transition-fast); box-shadow: 0 4px 10px var(--primary-glow); font-family: inherit; }
.btn-save:hover { background: var(--primary-light); transform: translateY(-1px); }

/* ─── Certification / Compliance sections ─── */
.form-divider { height: 1px; background: var(--border-color); margin: 16px 0 12px 0; }
.section-label { display: block; font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 10px; }

.certs-display { display: flex; flex-wrap: wrap; gap: 8px; }
.cert-tag { display: inline-block; padding: 6px 12px; background: rgba(76, 175, 80, 0.12); border: 1px solid rgba(76, 175, 80, 0.3); color: #4caf50; border-radius: 6px; font-size: 12px; font-weight: 600; }

.temp-display { padding: 10px 12px; background: rgba(33, 150, 243, 0.08); border: 1px solid rgba(33, 150, 243, 0.2); border-radius: 6px; }
.temp-row { display: flex; align-items: center; justify-content: center; gap: 8px; }
.temp-min, .temp-max { font-size: 14px; font-weight: 700; color: #2196f3; }
.temp-to { font-size: 12px; color: var(--text-muted); }

.compliance-display { display: flex; flex-direction: column; gap: 8px; }
.compliance-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; background: rgba(0,0,0,0.04); border-radius: 6px; }
.compliance-label { font-size: 12px; color: var(--text-muted); font-weight: 600; min-width: 120px; }
.compliance-value { font-size: 13px; font-weight: 600; }
.status-validated { color: #4caf50; }
.status-pending { color: #ffc107; }
.status-fragile { color: #f44336; }

/* ─── Facility Types ─── */
.facility-btns { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.f-btn { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 6px; border: 1.5px solid var(--border-color); border-radius: 8px; background: white; cursor: pointer; font-size: 10px; color: var(--text-muted); font-family: inherit; transition: all var(--transition-fast); }
.f-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-glow); }
.f-btn.active { border-color: var(--primary); background: var(--primary-glow); color: var(--primary); font-weight: 600; }
.f-btn span:first-child { font-size: 16px; }
.f-label { display: block; width: 100%; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ─── Certification Selector ─── */
.certifications-selector { display: flex; flex-direction: column; gap: 8px; padding: 10px; background: #f9fafb; border: 1px solid var(--border-color); border-radius: 8px; }
.cert-checkbox { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px 8px; border-radius: 6px; transition: all var(--transition-fast); }
.cert-checkbox:hover { background: rgba(31, 122, 92, 0.08); }
.cert-checkbox input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; accent-color: var(--primary); flex-shrink: 0; }
.cert-text { font-size: 13px; color: var(--text-main); user-select: none; }

/* ─── Missing Certifications Alert ─── */
.missing-certs-alert { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; margin-top: 8px; }
.alert-icon { font-size: 14px; flex-shrink: 0; }
.missing-certs-alert span:last-child { font-size: 12px; color: #856404; font-weight: 500; }
</style>
