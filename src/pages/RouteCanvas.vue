<template>
  <div class="canvas">
    <!-- TOOLBAR -->
    <div class="toolbar">
      <div class="toolbar-left">
        <button class="btn-back" @click="$router.push('/create')">← Back</button>
      </div>
      <div class="toolbar-center">
        <h2 class="toolbar-title">Route Builder</h2>
        <p class="subtitle">Double-click to edit · Drag to reorder or change row</p>
      </div>
      <div class="toolbar-actions">
        <button class="btn-primary" @click="addNode" :disabled="removingMode || backupPickMode">
          <span>+</span> Add Node
        </button>
        <button class="btn-backup-toolbar"
          @click="enterBackupPickMode"
          :disabled="removingMode || intermediaryNodes.length === 0"
          :class="{ active: backupPickMode }">
          <span>⊕</span> {{ backupPickMode ? 'Pick a node…' : 'Add Backup' }}
        </button>
        <button class="btn-remove" :class="{ active: removingMode }" @click="toggleRemoveMode">
          <span>−</span> {{ removingMode ? 'Cancel' : 'Remove Node' }}
        </button>
      </div>
    </div>
 
    <!-- ROUTE BANNER -->
    <div class="route-banner">
      <div class="route-endpoint">
        <span class="ep-tag origin-tag">ORIGIN</span>
        <span class="ep-name">{{ originNode?.details?.location || '—' }}</span>
        <span class="ep-company">{{ originNode?.details?.company || '' }}</span>
      </div>
      <div class="banner-middle">
        <div class="banner-line"></div>
        <div class="banner-stops">{{ intermediaryNodes.length }} stop{{ intermediaryNodes.length !== 1 ? 's' : '' }}</div>
        <div class="banner-line"></div>
        <span class="banner-arrow">→</span>
      </div>
      <div class="route-endpoint">
        <span class="ep-tag dest-tag">DESTINATION</span>
        <span class="ep-name">{{ destinationNode?.details?.location || '—' }}</span>
        <span class="ep-company">{{ destinationNode?.details?.company || '' }}</span>
      </div>
    </div>
 
    <!-- LANE -->
    <div class="lane-container" ref="laneContainerRef">
      <div class="lane" ref="laneRef"
        :style="{ width: laneWidth + 'px', height: laneHeight + 'px' }"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
        @mouseleave="onMouseUp"
      >
        <!-- Snap-grid guides (appear while dragging) -->
        <div class="grid-rows" :class="{ 'grid-visible': isDragging }">
          <div v-for="row in gridRows" :key="row"
            class="grid-row-line"
            :class="{ 'grid-row-center': row === 0 }"
            :style="{ top: rowToY(row) + 'px' }"
          ></div>
        </div>
 
        <!-- SVG connectors -->
        <svg class="lane-svg">
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
            'is-dragged':  draggedIndex === index,
            'remove-mode': removingMode  && node.type === 'intermediary',
            'backup-pick': backupPickMode && node.type === 'intermediary',
          }"
          :style="nodeStyle(index)"
        >
          <!-- PRIMARY HEX -->
          <div class="hex-shadow"
            :class="{
              'remove-target':      removingMode  && node.type === 'intermediary',
              'backup-pick-target': backupPickMode && node.type === 'intermediary',
            }"
            @mousedown="onHexMouseDown($event, index)"
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
          <div class="form-panel">
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
            <button class="btn-primary" @click="saveNodeDetails">Save Details</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
 
<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
 
const router = useRouter()
 
// ─── Layout constants ───────────────────────────────────────────
const HEX_W    = 170
const HEX_H    = 170
const COL_GAP  = 90
const ROW_STEP = 110   // px between snap rows
const MIN_ROW  = -2
const MAX_ROW  =  2
const gridRows = [-2, -1, 0, 1, 2]
const DRAG_THRESHOLD = 6  // px before drag begins
 
// Column index → left-edge X
const colToX = (col) => 40 + col * (HEX_W + COL_GAP)
// Row index → vertical centre Y
const rowToY = (row) => laneHeight.value / 2 + (row || 0) * ROW_STEP
 
// ─── Lane size ──────────────────────────────────────────────────
const laneContainerRef = ref(null)
const laneRef          = ref(null)
const laneHeight       = ref(500)
 
const updateLaneHeight = () => {
  laneHeight.value = laneContainerRef.value?.clientHeight || 500
}
onMounted(() => { updateLaneHeight(); window.addEventListener('resize', updateLaneHeight) })
onUnmounted(() => { window.removeEventListener('resize', updateLaneHeight) })
 
// ─── Nodes ──────────────────────────────────────────────────────
const nodes = ref([
  { id: 1, type: 'origin',      details: { company: '', location: '' },                         backups: [], row: 0 },
  { id: 2, type: 'destination', details: { company: '', location: '' },                         backups: [], row: 0 },
])
 
const originNode        = computed(() => nodes.value.find(n => n.type === 'origin'))
const destinationNode   = computed(() => nodes.value.find(n => n.type === 'destination'))
const intermediaryNodes = computed(() => nodes.value.filter(n => n.type === 'intermediary'))
const laneWidth         = computed(() => 40 + nodes.value.length * (HEX_W + COL_GAP) + 40)
 
const nodeStyle = (index) => ({
  position: 'absolute',
  left:  colToX(index) + 'px',
  // centre of hex = rowToY(row), so top = centre - HEX_H/2
  top:   (rowToY(nodes.value[index].row || 0) - HEX_H / 2) + 'px',
  width: HEX_W + 'px',
  // disable transitions while actively dragging this node
  transition: draggedIndex.value === index ? 'none' : 'top .2s cubic-bezier(.4,0,.2,1), left .2s cubic-bezier(.4,0,.2,1)',
})
 
// ─── Transport / labels ─────────────────────────────────────────
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
 
// ─── Toolbar modes ──────────────────────────────────────────────
const removingMode   = ref(false)
const backupPickMode = ref(false)
 
const toggleRemoveMode = () => {
  removingMode.value = !removingMode.value
  if (removingMode.value) backupPickMode.value = false
}
const enterBackupPickMode = () => {
  backupPickMode.value = !backupPickMode.value
  if (backupPickMode.value) removingMode.value = false
}
 
// ─── Click handler (single click = mode actions only) ───────────
// We suppress the click event if a drag just finished
let dragJustEnded = false
 
const handleHexClick = (e, index) => {
  if (dragJustEnded) { dragJustEnded = false; return }
  if (removingMode.value && nodes.value[index].type === 'intermediary') {
    deleteNode(index); return
  }
  if (backupPickMode.value && nodes.value[index].type === 'intermediary') {
    addBackupToNode(index)
    backupPickMode.value = false
  }
}
 
// ─── Modal ──────────────────────────────────────────────────────
const editingNodeIndex = ref(null)
const editingFormData  = ref(null)
 
const openModal = (index) => {
  editingNodeIndex.value = index
  editingFormData.value  = JSON.parse(JSON.stringify(nodes.value[index]))
  if (!editingFormData.value.backups) editingFormData.value.backups = []
}
const closeModal = () => { editingNodeIndex.value = null; editingFormData.value = null }
const saveNodeDetails = () => {
  if (editingNodeIndex.value !== null && editingFormData.value)
    nodes.value[editingNodeIndex.value] = { ...editingFormData.value }
  closeModal()
}
 
// ─── Node CRUD ──────────────────────────────────────────────────
const addNode = () => {
  nodes.value.splice(nodes.value.length - 1, 0, {
    id: Date.now(), type: 'intermediary',
    details: { company: '', location: '', transportType: 'road' },
    backups: [], row: 0,
  })
}
const deleteNode = (index) => {
  if (nodes.value[index].type === 'intermediary') nodes.value.splice(index, 1)
  removingMode.value = false
}
const addBackupToNode = (index) => {
  if (!nodes.value[index].backups) nodes.value[index].backups = []
  nodes.value[index].backups.push({ location: '', company: '', transportType: 'road' })
}
const removeBackup = (ni, bi) => nodes.value[ni].backups.splice(bi, 1)
const swapBackup = (ni, bi) => {
  const node = nodes.value[ni]
  const bk   = { ...node.backups[bi] }
  const pd   = { location: node.details.location, company: node.details.company, transportType: node.details.transportType }
  node.details.location      = bk.location
  node.details.company       = bk.company
  node.details.transportType = bk.transportType
  node.backups[bi] = pd
}
 
// ─── Mouse-based drag ───────────────────────────────────────────
const draggedIndex = ref(null)
const isDragging   = ref(false)
 
// Ghost state
const ghost = reactive({ visible: false, col: 0, row: 0 })
const ghostStyle = computed(() => ({
  position: 'absolute',
  left:   colToX(ghost.col) + 'px',
  top:    (rowToY(ghost.row) - HEX_H / 2) + 'px',
  width:  HEX_W + 'px',
  height: HEX_H + 'px',
}))
 
// Track mousedown start position
let mouseDownX = 0
let mouseDownY = 0
let mouseDownIndex = -1
let draggingStarted = false
 
const snapRow = (relY) =>
  Math.max(MIN_ROW, Math.min(MAX_ROW, Math.round((relY - laneHeight.value / 2) / ROW_STEP)))
 
const snapCol = (relX, nodeCount) =>
  Math.max(1, Math.min(nodeCount - 2, Math.round((relX - 40 - HEX_W / 2) / (HEX_W + COL_GAP))))
 
const onHexMouseDown = (e, index) => {
  if (nodes.value[index].type !== 'intermediary') return
  if (removingMode.value || backupPickMode.value) return
  // Only primary mouse button
  if (e.button !== 0) return
  e.preventDefault()
  mouseDownX     = e.clientX
  mouseDownY     = e.clientY
  mouseDownIndex = index
  draggingStarted = false
}
 
const onMouseMove = (e) => {
  if (mouseDownIndex === -1) return
 
  const dx = e.clientX - mouseDownX
  const dy = e.clientY - mouseDownY
 
  if (!draggingStarted) {
    if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return
    // Threshold exceeded → start drag
    draggingStarted    = true
    draggedIndex.value = mouseDownIndex
    isDragging.value   = true
  }
 
  // Update ghost position
  const rect = laneRef.value.getBoundingClientRect()
  const relX = e.clientX - rect.left
  const relY = e.clientY - rect.top
 
  ghost.col     = snapCol(relX, nodes.value.length)
  ghost.row     = snapRow(relY)
  ghost.visible = true
}
 
const onMouseUp = (e) => {
  if (mouseDownIndex === -1) return
 
  if (draggingStarted && draggedIndex.value !== null) {
    // Commit the drop
    const rect = laneRef.value.getBoundingClientRect()
    const relX = e.clientX - rect.left
    const relY = e.clientY - rect.top
 
    const col = snapCol(relX, nodes.value.length)
    const row = snapRow(relY)
 
    const item = nodes.value.splice(draggedIndex.value, 1)[0]
    item.row   = row
    nodes.value.splice(col, 0, item)
 
    dragJustEnded = true
    // Clear after a tick so the click event (which fires after mouseup) sees it
    setTimeout(() => { dragJustEnded = false }, 50)
  }
 
  // Reset
  draggedIndex.value  = null
  isDragging.value    = false
  ghost.visible       = false
  mouseDownIndex      = -1
  draggingStarted     = false
}
</script>
 
<style scoped>
/* ── Canvas ── */
.canvas { display:flex; flex-direction:column; height:calc(100% - 40px); margin:20px; padding:24px 32px; background:#fff; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,.06); box-sizing:border-box; overflow:hidden; }
 
/* ── Toolbar ── */
.toolbar { display:flex; align-items:center; margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid #edf2f7; flex-shrink:0; }
.toolbar-left    { flex:1; display:flex; align-items:center; }
.toolbar-center  { flex:1; display:flex; flex-direction:column; align-items:center; text-align:center; }
.toolbar-actions { flex:1; display:flex; gap:10px; justify-content:flex-end; }
.toolbar-title   { margin:0 0 2px; font-size:20px; font-weight:500; color:#1f2937; }
.subtitle        { margin:0; font-size:12px; color:#9ca3af; }
 
.btn-back { padding:8px 16px; border:1.5px solid #e5e7eb; border-radius:8px; background:#fff; color:#4b5563; font-size:13px; font-weight:500; cursor:pointer; transition:all .2s; white-space:nowrap; font-family:inherit; }
.btn-back:hover { border-color:var(--primary); color:var(--primary); background:rgba(31,111,84,.04); }
 
.btn-primary { display:flex; align-items:center; gap:6px; background:var(--primary); color:#fff; padding:9px 18px; border:none; border-radius:8px; font-size:13px; font-weight:500; cursor:pointer; transition:all .2s; font-family:inherit; }
.btn-primary:hover:not(:disabled) { background:var(--primary-light); transform:translateY(-1px); }
.btn-primary:disabled { opacity:.45; cursor:not-allowed; }
 
.btn-backup-toolbar { display:flex; align-items:center; gap:6px; padding:9px 18px; border:1.5px solid #e5e7eb; border-radius:8px; background:#fff; color:#6b7280; font-size:13px; font-weight:500; cursor:pointer; transition:all .2s; font-family:inherit; }
.btn-backup-toolbar:hover:not(:disabled) { border-color:var(--primary); color:var(--primary); background:rgba(31,111,84,.04); }
.btn-backup-toolbar.active { border-color:var(--primary); color:var(--primary); background:rgba(31,111,84,.08); }
.btn-backup-toolbar:disabled { opacity:.4; cursor:not-allowed; }
 
.btn-remove { display:flex; align-items:center; gap:6px; padding:9px 18px; border:1.5px solid #e5e7eb; border-radius:8px; background:#fff; color:#6b7280; font-size:13px; font-weight:500; cursor:pointer; transition:all .2s; font-family:inherit; }
.btn-remove:hover  { border-color:#ef4444; color:#ef4444; background:#fef2f2; }
.btn-remove.active { border-color:#ef4444; color:#ef4444; background:#fef2f2; }
 
/* ── Banner ── */
.route-banner   { display:flex; align-items:center; background:linear-gradient(135deg,#f0fdf6,#f9fafb); border:1.5px solid #d1fae5; border-radius:14px; padding:18px 28px; margin-bottom:20px; flex-shrink:0; }
.route-endpoint { display:flex; flex-direction:column; gap:3px; min-width:160px; }
.ep-tag         { font-size:10px; font-weight:500; letter-spacing:.08em; color:#9ca3af; text-transform:uppercase; }
.origin-tag     { color:var(--primary); }
.dest-tag       { color:#6366f1; }
.ep-name        { font-size:22px; font-weight:500; color:#1f2937; line-height:1.2; }
.ep-company     { font-size:13px; color:#6b7280; }
.banner-middle  { display:flex; align-items:center; flex:1; gap:8px; padding:0 24px; }
.banner-line    { flex:1; height:1px; background:linear-gradient(90deg,#d1fae5,#c7d2fe); }
.banner-stops   { font-size:12px; color:#9ca3af; white-space:nowrap; }
.banner-arrow   { font-size:20px; color:#6366f1; }
 
/* ── Lane ── */
.lane-container { flex:1; overflow:auto; scrollbar-width:thin; scrollbar-color:#cbd5e0 #edf2f7; user-select:none; }
.lane           { position:relative; min-width:100%; cursor:default; }
 
/* SVG connectors */
.lane-svg { position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:0; overflow:visible; }
 
/* ── Grid guides ── */
.grid-rows { position:absolute; inset:0; pointer-events:none; z-index:0; }
.grid-row-line   { position:absolute; left:0; right:0; height:1px; background:transparent; transition:background .15s; }
.grid-row-center { background:transparent; }
.grid-visible .grid-row-line   { background:rgba(203,213,224,.5); }
.grid-visible .grid-row-center { background:rgba(31,111,84,.2); }
 
/* ── Node wrappers ── */
.node-wrapper { position:absolute; display:flex; flex-direction:column; align-items:center; z-index:1; }
.node-wrapper.is-dragged { opacity:.25; pointer-events:none; }
 
/* ── Hex ── */
.hex-shadow { filter:drop-shadow(0 4px 6px rgba(0,0,0,.1)); cursor:grab; transition:filter .2s; }
.hex-shadow:hover  { filter:drop-shadow(0 6px 14px rgba(0,0,0,.18)); }
.hex-shadow:active { cursor:grabbing; }
.remove-target      { filter:drop-shadow(0 4px 14px rgba(239,68,68,.4)); animation:pulse-red   .8s infinite alternate; cursor:pointer !important; }
.backup-pick-target { filter:drop-shadow(0 4px 14px rgba(31,111,84,.5)); animation:pulse-green .8s infinite alternate; cursor:pointer !important; }
@keyframes pulse-red   { from{filter:drop-shadow(0 4px 8px rgba(239,68,68,.3))} to{filter:drop-shadow(0 4px 22px rgba(239,68,68,.8))} }
@keyframes pulse-green { from{filter:drop-shadow(0 4px 8px rgba(31,111,84,.3))} to{filter:drop-shadow(0 4px 22px rgba(31,111,84,.8))} }
 
.hex { width:170px; height:170px; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:500; font-size:13px; text-align:center; padding:14px; box-sizing:border-box; clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%); position:relative; }
.primary-hex { background:linear-gradient(135deg,var(--primary) 0%,var(--primary-light) 100%); }
.backup-hex  { background:linear-gradient(135deg,#64748b 0%,#94a3b8 100%); }
 
.hex-content       { display:flex; flex-direction:column; align-items:center; gap:3px; width:100%; }
.hc-icon           { font-size:16px; }
.hc-loc            { font-size:13px; font-weight:500; line-height:1.2; word-break:break-word; }
.hc-company        { font-size:11px; opacity:.85; line-height:1.2; word-break:break-word; }
.backup-label-text { font-size:12px; }
.remove-x          { font-size:36px; font-weight:300; opacity:.9; }
.backup-pick-icon  { font-size:30px; font-weight:300; opacity:.9; }
 
/* ── Backup stacks ── */
.backup-stack       { display:flex; flex-direction:column; align-items:center; }
.backup-connector   { width:2px; height:14px; background:#cbd5e0; }
.backup-shadow-wrap { position:relative; }
.backup-badge { position:absolute; top:22px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,.35); color:#fff; font-size:10px; font-weight:600; border-radius:10px; padding:2px 7px; pointer-events:none; letter-spacing:.04em; }
.swap-btn { position:absolute; bottom:20px; right:18px; width:24px; height:24px; border-radius:50%; background:rgba(255,255,255,.2); color:#fff; border:none; font-size:12px; cursor:pointer; opacity:0; transition:opacity .2s; display:flex; align-items:center; justify-content:center; }
.backup-hex:hover .swap-btn { opacity:1; }
.remove-backup-x { position:absolute; top:20px; right:18px; width:22px; height:22px; border-radius:50%; background:rgba(239,68,68,.5); color:#fff; border:none; font-size:14px; cursor:pointer; opacity:0; transition:opacity .2s; display:flex; align-items:center; justify-content:center; line-height:1; }
.backup-hex:hover .remove-backup-x { opacity:1; }
 
/* ── Drag ghost ── */
.drag-ghost { position:absolute; pointer-events:none; z-index:10; clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%); background:rgba(31,111,84,.13); border:2px dashed rgba(31,111,84,.4); box-sizing:border-box; }
 
/* ── Modal ── */
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.45); display:flex; align-items:center; justify-content:center; z-index:1000; backdrop-filter:blur(6px); }
.modal-duo     { display:flex; align-items:center; gap:72px; max-height:92vh; }
 
.preview-panel    { display:flex; flex-direction:column; align-items:center; gap:22px; flex-shrink:0; }
.preview-lbl      { font-size:11px; font-weight:500; color:rgba(255,255,255,.75); text-transform:uppercase; letter-spacing:.1em; margin:0; }
.hex-preview-wrap { filter:drop-shadow(0 14px 44px rgba(31,111,84,.55)); }
.hex-lg { width:320px; height:320px; clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; padding:32px; box-sizing:border-box; color:#fff; text-align:center; }
.hex-lg.origin, .hex-lg.destination, .hex-lg.intermediary { background:linear-gradient(135deg,var(--primary),var(--primary-light)); }
.hlg-icon { font-size:38px; }
.hlg-loc  { font-size:20px; font-weight:500; line-height:1.2; word-break:break-word; }
.hlg-co   { font-size:13px; opacity:.85; word-break:break-word; }
.preview-type-badge { font-size:12px; font-weight:500; color:rgba(255,255,255,.95); background:rgba(31,111,84,.35); border:1px solid rgba(255,255,255,.35); border-radius:20px; padding:6px 18px; backdrop-filter:blur(6px); }
 
.modal-card { background:#fff; width:440px; border-radius:20px; box-shadow:0 24px 56px rgba(0,0,0,.2); display:flex; flex-direction:column; max-height:88vh; flex-shrink:0; }
.modal-header { padding:20px 24px; border-bottom:1px solid #f3f4f6; display:flex; justify-content:space-between; align-items:center; }
.modal-header h3 { margin:0; font-size:17px; font-weight:500; color:#1f2937; }
.close-btn { background:none; border:none; font-size:24px; color:#9ca3af; cursor:pointer; line-height:1; }
.close-btn:hover { color:#374151; }
 
.form-panel  { flex:1; overflow-y:auto; padding:22px 24px; display:flex; flex-direction:column; gap:18px; }
.form-group  { display:flex; flex-direction:column; gap:7px; }
.form-group label { font-size:13px; font-weight:500; color:#374151; }
.lbl-note    { font-size:11px; font-weight:400; color:#9ca3af; }
.modern-input { width:100%; padding:10px 14px; border:1.5px solid #e5e7eb; border-radius:8px; font-size:14px; color:#1f2937; box-sizing:border-box; font-family:inherit; transition:all .2s; background:#fafafa; }
.modern-input:focus { outline:none; border-color:var(--primary); background:#fff; box-shadow:0 0 0 3px rgba(31,111,84,.1); }
.field-hint  { margin:4px 0 0; font-size:12px; color:#9ca3af; font-style:italic; }
 
.transport-btns { display:grid; grid-template-columns:repeat(5,1fr); gap:7px; }
.t-btn { display:flex; flex-direction:column; align-items:center; gap:4px; padding:9px 4px; border:1.5px solid #e5e7eb; border-radius:10px; background:#fff; cursor:pointer; font-size:11px; color:#4b5563; font-family:inherit; transition:all .2s; }
.t-btn:hover  { border-color:var(--primary); color:var(--primary); background:rgba(31,111,84,.04); }
.t-btn.active { border-color:var(--primary); background:rgba(31,111,84,.08); color:var(--primary); font-weight:500; }
.t-btn span:first-child { font-size:19px; }
 
.backups-section        { border:1.5px solid #e5e7eb; border-radius:12px; overflow:hidden; }
.backups-section-header { padding:10px 14px; background:#f9fafb; font-size:13px; font-weight:500; color:#374151; border-bottom:1px solid #e5e7eb; }
.backup-editor          { padding:14px; border-bottom:1px solid #f1f5f9; }
.backup-editor:last-child { border-bottom:none; }
.backup-editor-header   { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
.backup-editor-label    { font-size:12px; font-weight:600; color:#6366f1; text-transform:uppercase; letter-spacing:.06em; }
.backup-editor-remove   { background:none; border:none; font-size:12px; color:#ef4444; cursor:pointer; font-family:inherit; padding:2px 6px; border-radius:4px; }
.backup-editor-remove:hover { background:#fef2f2; }
 
.modal-actions { padding:14px 24px; border-top:1px solid #f3f4f6; display:flex; justify-content:flex-end; gap:12px; flex-shrink:0; }
.btn-cancel { padding:10px 20px; background:#fff; border:1.5px solid #e5e7eb; color:#6b7280; border-radius:8px; font-weight:500; font-size:13px; cursor:pointer; transition:all .2s; font-family:inherit; }
.btn-cancel:hover { background:#f9fafb; color:#1f2937; }
</style>