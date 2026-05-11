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

        <!-- TOOLBAR -->
        <div class="toolbar">
          <div class="toolbar-left">
            <button class="btn-back" @click="$router.push('/create')">← Back</button>
          </div>
          <div class="toolbar-center">
            <h2 class="toolbar-title">Route Builder</h2>
            <p class="toolbar-sub">Double-click to edit · Drag to reorder or change row</p>
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
                stroke="#cbd5e0" stroke-width="2.5" stroke-dasharray="6 4"
              />
            </svg>

            <!-- NODES -->
            <div v-for="(node, index) in nodes" :key="node.id"
              class="node-wrapper"
              :class="{
                'is-dragged':   draggedIndex === index,
                'remove-mode':  removingMode  && node.type === 'intermediary',
                'backup-pick':  backupPickMode && node.type === 'intermediary',
              }"
              :style="nodeStyle(index)"
            >
              <!-- PRIMARY HEX -->
              <div class="hex-shadow"
                :class="{
                  'remove-target':      removingMode  && node.type === 'intermediary',
                  'backup-pick-target': backupPickMode && node.type === 'intermediary',
                }"
                @mousedown.stop="onHexMouseDown($event, index)"
                @click="handleHexClick($event, index)"
                @dblclick="!removingMode && !backupPickMode && openModal(index)"
              >
                <div class="hex primary-hex">
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
                </div>
              </div>

              <!-- BACKUP NODES -->
              <template v-if="node.backups && node.backups.length > 0">
                <div v-for="(backup, bIndex) in node.backups" :key="'b'+bIndex" class="backup-stack">
                  <div class="backup-connector"></div>
                  <div class="hex-shadow backup-shadow-wrap">
                    <div class="hex backup-hex" @dblclick.stop="openModal(index)">
                      <div class="hex-content">
                        <span class="hc-icon">{{ transportIcon(backup.transportType) }}</span>
                        <span class="hc-loc backup-label-text">{{ backup.location || `Backup ${bIndex + 1}` }}</span>
                        <span class="hc-company" v-if="backup.company">{{ backup.company }}</span>
                      </div>
                      <div class="backup-badge">B{{ bIndex + 1 }}</div>
                      <button class="swap-btn"        @click.stop="swapBackup(index, bIndex)"   title="Swap with primary">↑↓</button>
                      <button class="remove-backup-x" @click.stop="removeBackup(index, bIndex)" title="Remove backup">×</button>
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <!-- DRAG GHOST -->
            <div v-if="isDragging && ghost.visible" class="drag-ghost" :style="ghostStyle"></div>
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

      </div>
    </div>

    <!-- MODAL -->
    <div class="modal-overlay" v-if="editingNodeIndex !== null" @click.self="closeModal">
      <div class="modal-duo" v-if="editingFormData">
        <div class="preview-panel">
          <p class="preview-lbl">Preview</p>
          <div class="hex-preview-wrap">
            <div class="hex-lg" :class="editingFormData.type">
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
            <template v-if="editingFormData.type === 'intermediary' && editingFormData.backups?.length > 0">
              <div class="backups-section">
                <div class="backups-section-header">Backup Nodes</div>
                <div v-for="(backup, bIdx) in editingFormData.backups" :key="bIdx" class="backup-editor">
                  <div class="backup-editor-header">
                    <span class="backup-editor-label">Backup {{ bIdx + 1 }}</span>
                    <button class="backup-editor-remove" @click="editingFormData.backups.splice(bIdx, 1)">× Remove</button>
                  </div>
                  <input v-model="backup.location" class="modern-input" placeholder="Location / City" style="margin-bottom:6px" />
                  <input v-model="backup.company"  class="modern-input" placeholder="Company"         style="margin-bottom:6px" />
                  <div class="transport-btns">
                    <button v-for="t in transportTypes" :key="t.value" type="button"
                      class="t-btn" :class="{ active: backup.transportType === t.value }"
                      @click="backup.transportType = t.value">
                      <span>{{ t.icon }}</span><span>{{ t.label }}</span>
                    </button>
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

  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

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
  { id: 1, type: 'origin',      details: { company: '', location: '' },                       backups: [], row: 0 },
  { id: 2, type: 'destination', details: { company: '', location: '' },                       backups: [], row: 0 },
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
const nodeTypeLabel = (type) =>
  type === 'origin' ? 'Origin Node' : type === 'destination' ? 'Destination Node' : 'Intermediary Node'

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
}
const closeModal      = () => { editingNodeIndex.value = null; editingFormData.value = null }
const saveNodeDetails = () => {
  if (editingNodeIndex.value !== null && editingFormData.value)
    nodes.value[editingNodeIndex.value] = { ...editingFormData.value }
  closeModal()
}

// ─── Node CRUD ────────────────────────────────────────────────────
const addNode = () => nodes.value.splice(nodes.value.length - 1, 0, {
  id: Date.now(), type: 'intermediary',
  details: { company: '', location: '', transportType: 'road' },
  backups: [], row: 0,
})
const deleteNode = (index) => { if (nodes.value[index].type === 'intermediary') nodes.value.splice(index, 1); removingMode.value = false }
const addBackupToNode = (index) => { if (!nodes.value[index].backups) nodes.value[index].backups = []; nodes.value[index].backups.push({ location: '', company: '', transportType: 'road' }) }
const removeBackup = (ni, bi) => nodes.value[ni].backups.splice(bi, 1)
const swapBackup   = (ni, bi) => {
  const node = nodes.value[ni]
  const bk   = { ...node.backups[bi] }
  const pd   = { location: node.details.location, company: node.details.company, transportType: node.details.transportType }
  node.details.location = bk.location; node.details.company = bk.company; node.details.transportType = bk.transportType
  node.backups[bi] = pd
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
  if (backupPickMode.value && nodes.value[index].type === 'intermediary') { addBackupToNode(index); backupPickMode.value = false }
}

// Global handlers (attached to window for smooth tracking outside viewport)
const onMouseMove = (e) => {
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

// ─── Mount / Unmount ──────────────────────────────────────────────
onMounted(async () => {
  await nextTick()
  centerCanvas()
  viewportRef.value.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup',   onMouseUp)
})

onUnmounted(() => {
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

/* ── Left info panel (same style as CreateRoute) ── */
.step-panel {
  width: 240px;
  flex-shrink: 0;
  background: var(--primary);
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
  background: rgba(255,255,255,0.15);
  border-radius: 999px;
  color: rgba(255,255,255,0.9);
  font-size: 11px;
  font-weight: 700;
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
  background: rgba(255,255,255,0.08);
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
  background: linear-gradient(135deg, #f0fdf6, #f9fafb);
  border-bottom: 1px solid var(--border-color);
  padding: 14px 24px;
  flex-shrink: 0;
}

.route-ep { display: flex; flex-direction: column; gap: 2px; min-width: 140px; }

.ep-tag {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.ep-tag.origin { color: var(--primary); }
.ep-tag.dest   { color: var(--primary); }

.ep-name    { font-size: 18px; font-weight: 500; color: var(--text-main); line-height: 1.2; }
.ep-company { font-size: 12px; color: var(--text-muted); }

.banner-mid {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 8px;
  padding: 0 20px;
}
.banner-line  { flex: 1; height: 1px; background: var(--primary-glow); }
.banner-stops { font-size: 11px; color: var(--text-muted); white-space: nowrap; }
.banner-arrow { font-size: 18px; color: var(--primary); }

/* ── Canvas viewport ── */
.canvas-viewport {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: #f1f5f9;
  background-image: radial-gradient(circle, #94a3b8 1px, transparent 1px);
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
.hex-shadow { filter: drop-shadow(0 4px 8px rgba(0,0,0,0.12)); cursor: grab; transition: filter 0.2s; }
.hex-shadow:hover  { filter: drop-shadow(0 6px 16px rgba(0,0,0,0.2)); }
.hex-shadow:active { cursor: grabbing; }

.remove-target      { filter: drop-shadow(0 4px 14px rgba(239,68,68,.45)); animation: pulse-red   0.8s infinite alternate; cursor: pointer !important; }
.backup-pick-target { filter: drop-shadow(0 4px 14px rgba(31,111,84,.5));  animation: pulse-green 0.8s infinite alternate; cursor: pointer !important; }

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

.primary-hex { background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%); }
.backup-hex  { background: linear-gradient(135deg, #64748b 0%, #94a3b8 100%); }

.hex-content { display: flex; flex-direction: column; align-items: center; gap: 3px; width: 100%; }
.hc-icon     { font-size: 16px; }
.hc-loc      { font-size: 13px; font-weight: 500; line-height: 1.2; word-break: break-word; }
.hc-company  { font-size: 11px; opacity: 0.85; line-height: 1.2; word-break: break-word; }
.backup-label-text { font-size: 12px; }
.remove-x         { font-size: 36px; font-weight: 300; opacity: 0.9; }
.backup-pick-icon { font-size: 30px; font-weight: 300; opacity: 0.9; }

/* ── Backup stacks ── */
.backup-stack     { display: flex; flex-direction: column; align-items: center; }
.backup-connector { width: 2px; height: 14px; background: #cbd5e0; }
.backup-shadow-wrap { position: relative; }

.backup-badge    { position: absolute; top: 22px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,.35); color: #fff; font-size: 10px; font-weight: 600; border-radius: 10px; padding: 2px 7px; pointer-events: none; letter-spacing: .04em; }
.swap-btn        { position: absolute; bottom: 20px; right: 18px; width: 24px; height: 24px; border-radius: 50%; background: rgba(255,255,255,.2); color: #fff; border: none; font-size: 12px; cursor: pointer; opacity: 0; transition: opacity .2s; display: flex; align-items: center; justify-content: center; }
.backup-hex:hover .swap-btn { opacity: 1; }
.remove-backup-x { position: absolute; top: 20px; right: 18px; width: 22px; height: 22px; border-radius: 50%; background: rgba(239,68,68,.5); color: #fff; border: none; font-size: 14px; cursor: pointer; opacity: 0; transition: opacity .2s; display: flex; align-items: center; justify-content: center; }
.backup-hex:hover .remove-backup-x { opacity: 1; }

/* ── Drag ghost ── */
.drag-ghost {
  position: absolute; pointer-events: none; z-index: 10;
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  background: rgba(31,111,84,0.12);
  border: 2px dashed rgba(31,111,84,0.4);
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
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 4px 6px;
  box-shadow: var(--shadow-md);
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
.hex-preview-wrap { filter: drop-shadow(0 14px 44px rgba(31,111,84,.55)); }
.hex-lg { width: 300px; height: 300px; clip-path: polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 32px; box-sizing: border-box; color: #fff; text-align: center; }
.hex-lg.origin, .hex-lg.destination, .hex-lg.intermediary { background: linear-gradient(135deg, var(--primary), var(--primary-light)); }
.hlg-icon { font-size: 36px; }
.hlg-loc  { font-size: 18px; font-weight: 500; line-height: 1.2; word-break: break-word; }
.hlg-co   { font-size: 13px; opacity: .85; word-break: break-word; }
.preview-type-badge { font-size: 12px; font-weight: 500; color: rgba(255,255,255,.95); background: rgba(31,111,84,.35); border: 1px solid rgba(255,255,255,.35); border-radius: 20px; padding: 6px 18px; backdrop-filter: blur(6px); }

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
</style>
