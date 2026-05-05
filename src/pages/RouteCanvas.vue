<template>
  <div class="canvas">
    <!-- TOOLBAR -->
    <div class="toolbar">
      <div class="toolbar-left">
        <button class="btn-back" @click="$router.push('/create')">← Back</button>
      </div>
      <div class="toolbar-center">
        <h2 class="toolbar-title">Route Builder</h2>
        <p class="subtitle">Double-click a node to edit · Drag intermediary nodes to reorder</p>
      </div>
      <div class="toolbar-actions">
        <button class="btn-remove" :class="{ active: removingMode }" @click="toggleRemoveMode">
          <span>−</span> {{ removingMode ? 'Cancel' : 'Remove Node' }}
        </button>
        <button class="btn-primary" @click="addNode" :disabled="removingMode">
          <span>+</span> Add Node
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
    <div class="lane-container">
      <div class="lane" @drop="dropOnLane($event)" @dragover.prevent>
        <svg class="lane-svg">
          <line v-for="(node, i) in nodes.slice(0, nodes.length - 1)" :key="'l'+node.id"
            :x1="115 + i * 230" :y1="nodes[i].offsetY || 0"
            :x2="115 + (i+1) * 230" :y2="nodes[i+1].offsetY || 0"
            stroke="#cbd5e0" stroke-width="3" />
        </svg>

        <div v-for="(node, index) in nodes" :key="node.id"
          class="node-wrapper"
          :class="{ 'is-dragged': draggedIndex===index, 'drag-over': dragOverIndex===index, 'remove-mode': removingMode && node.type==='intermediary' }"
          :style="{ transform: `translateY(${node.offsetY||0}px)` }"
          :draggable="node.type==='intermediary' && !removingMode"
          @dragstart="dragStart(index)" @dragenter.prevent="dragEnter(index)"
          @dragleave="dragLeave(index)" @dragend="dragEnd"
          @click="removingMode && node.type==='intermediary' ? deleteNode(index) : null"
        >
          <div class="hex-shadow" :class="{ 'remove-target': removingMode && node.type==='intermediary' }">
            <div class="hex primary-hex" @dblclick="!removingMode && openModal(index)">
              <div v-if="removingMode && node.type==='intermediary'" class="remove-x">×</div>
              <template v-else>
                <div class="hex-content" v-if="node.type==='origin' || node.type==='destination'">
                  <span class="hc-loc">{{ node.details.location || (node.type==='origin' ? 'Origin' : 'Destination') }}</span>
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

          <div v-if="node.backup !== null" class="backup-connector"></div>
          <div v-if="node.backup !== null" class="hex-shadow">
            <div class="hex backup-hex" @dblclick="openModal(index)">
              <span>{{ node.backup }}</span>
              <button class="swap-btn" @click.stop="swapBackup(index)">↑↓</button>
            </div>
          </div>

          <div class="node-controls" v-if="node.type==='intermediary' && !removingMode">
            <button v-if="node.backup===null" class="btn-text add-backup-btn" @click="addBackup(index)">+ Add Backup</button>
            <button v-else class="btn-text remove-backup-btn" @click="removeBackup(index)">− Remove Backup</button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL -->
    <div class="modal-overlay" v-if="editingNodeIndex !== null" @click.self="closeModal">
      <div class="modal-duo" v-if="editingFormData">

        <!-- LEFT: transparent hex preview panel -->
        <div class="preview-panel">
          <p class="preview-lbl">Preview</p>
          <div class="hex-preview-wrap">
            <div class="hex-lg" :class="editingFormData.type">
              <template v-if="editingFormData.type==='origin' || editingFormData.type==='destination'">
                <span class="hlg-loc">{{ editingFormData.details.location || (editingFormData.type==='origin' ? 'Origin' : 'Destination') }}</span>
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

        <!-- RIGHT: white form card -->
        <div class="modal-card">
          <div class="modal-header">
            <h3>Edit {{ nodeTypeLabel(editingFormData.type) }}</h3>
            <button class="close-btn" @click="closeModal">×</button>
          </div>

          <div class="form-panel">
            <template v-if="editingFormData.type==='origin' || editingFormData.type==='destination'">
              <div class="form-group">
                <label>{{ editingFormData.type==='origin' ? 'Origin Location' : 'Destination Location' }}</label>
                <input v-model="editingFormData.details.location" class="modern-input" placeholder="City, Country" />
              </div>
              <div class="form-group">
                <label>{{ editingFormData.type==='origin' ? 'Sending Company' : 'Receiving Company' }}</label>
                <input v-model="editingFormData.details.company" class="modern-input" placeholder="e.g. PharmaCorp Inc." />
              </div>
            </template>

            <template v-if="editingFormData.type==='intermediary'">
              <div class="form-group">
                <label>Current Location</label>
                <input v-model="editingFormData.details.location" class="modern-input" placeholder="City, Airport, Port…" />
              </div>
              <div class="form-group">
                <label>Transport / Facility Type</label>
                <div class="transport-btns">
                  <button v-for="t in transportTypes" :key="t.value" type="button"
                    class="t-btn" :class="{ active: editingFormData.details.transportType===t.value }"
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

            <div class="form-group" v-if="editingFormData.backup !== null">
              <label>Backup Node Label</label>
              <input v-model="editingFormData.backup" class="modern-input" placeholder="Backup name" />
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn-cancel" @click="closeModal">Cancel</button>
            <button class="btn-primary" @click="saveNodeDetails">Save Details</button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const nodes = ref([
  { id: 1, type: 'origin',      details: { company: '', location: '' }, backup: null, offsetY: 0 },
  { id: 2, type: 'destination', details: { company: '', location: '' }, backup: null, offsetY: 0 }
])

const originNode      = computed(() => nodes.value.find(n => n.type === 'origin'))
const destinationNode = computed(() => nodes.value.find(n => n.type === 'destination'))
const intermediaryNodes = computed(() => nodes.value.filter(n => n.type === 'intermediary'))

const transportTypes = [
  { value: 'road',      label: 'Road',      icon: '🚛' },
  { value: 'air',       label: 'Air',       icon: '✈️' },
  { value: 'sea',       label: 'Sea',       icon: '🚢' },
  { value: 'rail',      label: 'Rail',      icon: '🚆' },
  { value: 'warehouse', label: 'Warehouse', icon: '🏭' },
]

const transportIcon = (type) => {
  const t = transportTypes.find(x => x.value === type)
  return t ? t.icon : '🚛'
}

const nodeTypeLabel = (type) => {
  if (type === 'origin') return 'Origin Node'
  if (type === 'destination') return 'Destination Node'
  return 'Intermediary Node'
}

// ── Remove Mode ──
const removingMode = ref(false)
const toggleRemoveMode = () => { removingMode.value = !removingMode.value }

// ── Modal ──
const editingNodeIndex = ref(null)
const editingFormData  = ref(null)

const openModal = (index) => {
  editingNodeIndex.value = index
  editingFormData.value  = JSON.parse(JSON.stringify(nodes.value[index]))
}
const closeModal = () => { editingNodeIndex.value = null; editingFormData.value = null }
const saveNodeDetails = () => {
  if (editingNodeIndex.value !== null && editingFormData.value) {
    nodes.value[editingNodeIndex.value] = editingFormData.value
  }
  closeModal()
}

// ── Nodes ──
const addNode = () => {
  const n = { id: Date.now(), type: 'intermediary', details: { company: '', location: '', transportType: 'road', isWarehouse: false }, backup: null, offsetY: 0 }
  nodes.value.splice(nodes.value.length - 1, 0, n)
}
const deleteNode = (index) => {
  if (nodes.value[index].type === 'intermediary') nodes.value.splice(index, 1)
  removingMode.value = false
}
const addBackup    = (i) => { nodes.value[i].backup = 'Backup Node' }
const removeBackup = (i) => { nodes.value[i].backup = null }
const swapBackup   = (i) => {
  const n = nodes.value[i]; const t = n.label; n.label = n.backup; n.backup = t
}

// ── Drag ──
const draggedIndex = ref(null)
const dragOverIndex = ref(null)
const dragStart  = (i) => { if (nodes.value[i].type !== 'intermediary') return; draggedIndex.value = i }
const dragEnter  = (i) => { if (draggedIndex.value !== i && nodes.value[i].type === 'intermediary') dragOverIndex.value = i }
const dragLeave  = (i) => { if (dragOverIndex.value === i) dragOverIndex.value = null }
const dragEnd    = () => { draggedIndex.value = null; dragOverIndex.value = null }
const dropOnLane = (e) => {
  if (draggedIndex.value === null) return
  const item = nodes.value[draggedIndex.value]
  const laneEl = document.querySelector('.lane')
  const r = laneEl.getBoundingClientRect()
  item.offsetY = e.clientY - (r.top + r.height / 2)
  let ni = Math.round((e.clientX - r.left - 115) / 230)
  nodes.value.splice(draggedIndex.value, 1)
  if (ni < 1) ni = 1
  if (ni > nodes.value.length - 1) ni = nodes.value.length - 1
  nodes.value.splice(ni, 0, item)
  draggedIndex.value = null; dragOverIndex.value = null
}
</script>

<style scoped>
/* ── Canvas shell ── */
.canvas { display:flex; flex-direction:column; height:calc(100% - 40px); margin:20px; padding:24px 32px; background:#fff; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,.06); box-sizing:border-box; overflow:hidden; }

/* ── Toolbar ── */
.toolbar { display:flex; align-items:center; margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid #edf2f7; flex-shrink:0; }
.toolbar-left { flex:1; display:flex; align-items:center; }
.toolbar-center { flex:1; display:flex; flex-direction:column; align-items:center; text-align:center; }
.toolbar-actions { flex:1; display:flex; gap:10px; justify-content:flex-end; }
.toolbar-title { margin:0 0 2px; font-size:20px; font-weight:500; color:#1f2937; }
.subtitle { margin:0; font-size:12px; color:#9ca3af; }

.btn-back { padding:8px 16px; border:1.5px solid #e5e7eb; border-radius:8px; background:#fff; color:#4b5563; font-size:13px; font-weight:500; cursor:pointer; transition:all .2s; white-space:nowrap; font-family:inherit; }
.btn-back:hover { border-color:var(--primary); color:var(--primary); background:rgba(31,111,84,.04); }

.btn-primary { display:flex; align-items:center; gap:6px; background:var(--primary); color:#fff; padding:9px 18px; border:none; border-radius:8px; font-size:13px; font-weight:500; cursor:pointer; transition:all .2s; font-family:inherit; }
.btn-primary:hover:not(:disabled) { background:var(--primary-light); transform:translateY(-1px); }
.btn-primary:disabled { opacity:.45; cursor:not-allowed; }

.btn-remove { display:flex; align-items:center; gap:6px; padding:9px 18px; border:1.5px solid #e5e7eb; border-radius:8px; background:#fff; color:#6b7280; font-size:13px; font-weight:500; cursor:pointer; transition:all .2s; font-family:inherit; }
.btn-remove:hover { border-color:#ef4444; color:#ef4444; background:#fef2f2; }
.btn-remove.active { border-color:#ef4444; color:#ef4444; background:#fef2f2; }

/* ── Route Banner ── */
.route-banner { display:flex; align-items:center; gap:0; background:linear-gradient(135deg,#f0fdf6 0%,#f9fafb 100%); border:1.5px solid #d1fae5; border-radius:14px; padding:18px 28px; margin-bottom:20px; flex-shrink:0; }
.route-endpoint { display:flex; flex-direction:column; gap:3px; min-width:160px; }
.ep-tag { font-size:10px; font-weight:500; letter-spacing:.08em; color:#9ca3af; text-transform:uppercase; }
.origin-tag { color:var(--primary); }
.dest-tag { color:#6366f1; }
.ep-name { font-size:22px; font-weight:500; color:#1f2937; line-height:1.2; }
.ep-company { font-size:13px; color:#6b7280; }
.banner-middle { display:flex; align-items:center; flex:1; gap:8px; padding:0 24px; }
.banner-line { flex:1; height:1px; background:linear-gradient(90deg,#d1fae5,#c7d2fe); }
.banner-stops { font-size:12px; color:#9ca3af; white-space:nowrap; }
.banner-arrow { font-size:20px; color:#6366f1; }

/* ── Lane ── */
.lane-container { flex:1; overflow-x:auto; overflow-y:hidden; scrollbar-width:thin; scrollbar-color:#cbd5e0 #edf2f7; }
.lane { display:inline-flex; align-items:center; padding:40px; min-width:100%; min-height:100%; position:relative; }
.lane-svg { position:absolute; top:50%; left:0; width:100%; height:0; overflow:visible; pointer-events:none; z-index:0; }

/* ── Nodes ── */
.node-wrapper { position:relative; display:flex; flex-direction:column; align-items:center; width:150px; margin-right:80px; transition:transform .15s, opacity .2s; z-index:1; }
.node-wrapper:last-child { margin-right:0; }
.node-wrapper.is-dragged { opacity:.35; transform:scale(.95) !important; }
.node-wrapper.drag-over { transform:translateX(12px) !important; }
.node-wrapper.remove-mode { cursor:pointer; }

.hex-shadow { filter:drop-shadow(0 4px 6px rgba(0,0,0,.1)); cursor:pointer; transition:filter .2s; }
.hex-shadow:hover { filter:drop-shadow(0 6px 14px rgba(0,0,0,.16)); }
.remove-target { filter:drop-shadow(0 4px 14px rgba(239,68,68,.4)); animation:pulse-red .8s infinite alternate; }
@keyframes pulse-red { from { filter:drop-shadow(0 4px 8px rgba(239,68,68,.3)); } to { filter:drop-shadow(0 4px 20px rgba(239,68,68,.7)); } }

.hex { width:200px; height:200px; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:500; font-size:13px; text-align:center; padding:14px; box-sizing:border-box; clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%); position:relative; }
.primary-hex { background:linear-gradient(135deg,var(--primary) 0%,var(--primary-light) 100%); }
.backup-hex  { background:linear-gradient(135deg,#718096 0%,#a0aec0 100%); }

.hex-content { display:flex; flex-direction:column; align-items:center; gap:3px; width:100%; }
.hc-icon { font-size:18px; }
.hc-loc  { font-size:16px; font-weight:500; line-height:1.2; word-break:break-word; }
.hc-company { font-size:13px; opacity:.85; line-height:1.2; word-break:break-word; }

.remove-x { font-size:40px; font-weight:300; opacity:.9; }

.backup-connector { width:2px; height:18px; background:#cbd5e0; margin:4px 0; }
.swap-btn { position:absolute; bottom:14px; right:22px; width:26px; height:26px; border-radius:50%; background:rgba(255,255,255,.2); color:#fff; border:none; font-size:13px; cursor:pointer; opacity:0; transition:opacity .2s; display:flex; align-items:center; justify-content:center; }
.backup-hex:hover .swap-btn { opacity:1; }

.node-controls { display:flex; flex-direction:column; align-items:center; gap:4px; margin-top:8px; }
.btn-text { background:none; border:none; font-size:12px; font-weight:500; cursor:pointer; padding:4px 8px; border-radius:6px; transition:all .2s; font-family:inherit; }
.add-backup-btn { color:var(--primary); }
.add-backup-btn:hover { background:rgba(31,111,84,.1); }
.remove-backup-btn { color:#a0aec0; }
.remove-backup-btn:hover { background:rgba(160,174,192,.1); }

/* ── Modal ── */
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.45); display:flex; align-items:center; justify-content:center; z-index:1000; backdrop-filter:blur(6px); }

/* Two-panel duo layout */
.modal-duo { display:flex; align-items:center; gap:72px; max-height:92vh; }

/* LEFT: transparent hex panel */
.preview-panel { display:flex; flex-direction:column; align-items:center; gap:22px; flex-shrink:0; }
.preview-lbl { font-size:11px; font-weight:500; color:rgba(255,255,255,.75); text-transform:uppercase; letter-spacing:.1em; margin:0; }
.hex-preview-wrap { filter:drop-shadow(0 14px 44px rgba(31,111,84,.55)); }
.hex-lg { width:380px; height:380px; clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; padding:32px; box-sizing:border-box; color:#fff; text-align:center; transition:all .35s; }
.hex-lg.origin      { background:linear-gradient(135deg,var(--primary),var(--primary-light)); }
.hex-lg.destination { background:linear-gradient(135deg,var(--primary),var(--primary-light)); }
.hex-lg.intermediary{ background:linear-gradient(135deg,var(--primary),var(--primary-light)); }
.hlg-icon { font-size:42px; }
.hlg-loc  { font-size:22px; font-weight:500; line-height:1.2; word-break:break-word; }
.hlg-co   { font-size:14px; opacity:.85; line-height:1.2; word-break:break-word; }
.preview-type-badge { font-size:12px; font-weight:500; color:rgba(255,255,255,.95); background:rgba(31,111,84,.35); border:1px solid rgba(255,255,255,.35); border-radius:20px; padding:6px 18px; backdrop-filter:blur(6px); }

/* RIGHT: white form card */
.modal-card { background:#fff; width:440px; border-radius:20px; box-shadow:0 24px 56px rgba(0,0,0,.2); display:flex; flex-direction:column; max-height:88vh; flex-shrink:0; }
.modal-header { padding:20px 24px; border-bottom:1px solid #f3f4f6; display:flex; justify-content:space-between; align-items:center; }
.modal-header h3 { margin:0; font-size:17px; font-weight:500; color:#1f2937; }
.close-btn { background:none; border:none; font-size:24px; color:#9ca3af; cursor:pointer; line-height:1; }
.close-btn:hover { color:#374151; }

/* Form panel */
.form-panel { flex:1; overflow-y:auto; padding:22px 24px; display:flex; flex-direction:column; gap:18px; }
.form-group { display:flex; flex-direction:column; gap:7px; }
.form-group label { font-size:13px; font-weight:500; color:#374151; }
.lbl-note { font-size:11px; font-weight:400; color:#9ca3af; }
.modern-input { width:100%; padding:10px 14px; border:1.5px solid #e5e7eb; border-radius:8px; font-size:14px; color:#1f2937; box-sizing:border-box; font-family:inherit; transition:all .2s; background:#fafafa; }
.modern-input:focus { outline:none; border-color:var(--primary); background:#fff; box-shadow:0 0 0 3px rgba(31,111,84,.1); }
.field-hint { margin:4px 0 0; font-size:12px; color:#9ca3af; font-style:italic; }

/* Transport buttons */
.transport-btns { display:grid; grid-template-columns:repeat(5,1fr); gap:7px; }
.t-btn { display:flex; flex-direction:column; align-items:center; gap:4px; padding:9px 4px; border:1.5px solid #e5e7eb; border-radius:10px; background:#fff; cursor:pointer; font-size:11px; color:#4b5563; font-family:inherit; transition:all .2s; }
.t-btn:hover { border-color:var(--primary); color:var(--primary); background:rgba(31,111,84,.04); }
.t-btn.active { border-color:var(--primary); background:rgba(31,111,84,.08); color:var(--primary); font-weight:500; }
.t-btn span:first-child { font-size:19px; }

.modal-actions { padding:14px 24px; border-top:1px solid #f3f4f6; display:flex; justify-content:flex-end; gap:12px; flex-shrink:0; }
.btn-cancel { padding:10px 20px; background:#fff; border:1.5px solid #e5e7eb; color:#6b7280; border-radius:8px; font-weight:500; font-size:13px; cursor:pointer; transition:all .2s; font-family:inherit; }
.btn-cancel:hover { background:#f9fafb; color:#1f2937; }
</style>