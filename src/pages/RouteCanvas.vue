<template>
  <div class="canvas">
    <div class="toolbar">
      <div class="title-section">
        <h2>Route Builder</h2>
        <p class="subtitle">Drag intermediary nodes to reorder or move them up/down. Double-click to edit.</p>
      </div>
      <button class="btn-primary" @click="addNode">
        <span class="icon">+</span> Add Node
      </button>
    </div>

    <div class="lane-container">
      <div 
        class="lane" 
        @drop="dropOnLane($event)" 
        @dragover.prevent
      >
        <!-- SVG for diagonal dynamic connection lines -->
        <svg class="lane-svg">
          <line 
            v-for="(node, i) in nodes.slice(0, nodes.length - 1)" 
            :key="'line-'+node.id"
            :x1="115 + i * 230" 
            :y1="nodes[i].offsetY || 0" 
            :x2="115 + (i + 1) * 230" 
            :y2="nodes[i+1].offsetY || 0" 
            stroke="#cbd5e0" 
            stroke-width="3" 
          />
        </svg>

        <div
          v-for="(node, index) in nodes"
          :key="node.id"
          class="node-wrapper"
          :class="{ 
            'is-dragged': draggedIndex === index, 
            'drag-over': dragOverIndex === index 
          }"
          :style="{ transform: `translateY(${node.offsetY || 0}px)` }"
          :draggable="node.type === 'intermediary'"
          @dragstart="dragStart(index)"
          @dragenter.prevent="dragEnter(index)"
          @dragleave="dragLeave(index)"
          @dragend="dragEnd"
        >
          <!-- Main Hexagon -->
          <div class="hex-shadow">
            <div class="hex primary-hex" @dblclick="openModal(index)">
              <span>{{ node.label }}</span>

              <!-- Delete Button (Inner, Top-Right) -->
              <button 
                v-if="node.type === 'intermediary'" 
                class="inner-delete-btn" 
                @click.stop="deleteNode(index)"
                title="Eliminar nodo"
              >
                -
              </button>
            </div>
          </div>

          <!-- Connecting vertical line to backup -->
          <div v-if="node.backup !== null" class="backup-connector"></div>

          <!-- Backup Hexagon -->
          <div v-if="node.backup !== null" class="hex-shadow">
            <div class="hex backup-hex" @dblclick="openModal(index)">
              <span>{{ node.backup }}</span>
              <button 
                class="btn-icon swap-btn" 
                @click.stop="swapBackup(index)" 
                title="Swap with primary"
              >
                ↑↓
              </button>
            </div>
          </div>

          <!-- Controls under the node -->
          <div class="node-controls" v-if="node.type === 'intermediary'">
            <button 
              v-if="node.backup === null" 
              class="btn-text add-backup-btn" 
              @click="addBackup(index)"
            >
              + Add Backup
            </button>
            <button 
              v-else 
              class="btn-text remove-backup-btn" 
              @click="removeBackup(index)"
            >
              - Remove Backup
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Node Edit Modal -->
    <div class="modal-overlay" v-if="editingNodeIndex !== null" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Edit {{ editingFormData.type === 'origin' ? 'Origin Node' : (editingFormData.type === 'destination' ? 'Destination Node' : 'Intermediary Node') }}</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>Node Name (Label)</label>
            <input v-model="editingFormData.label" class="modern-input" />
          </div>

          <!-- Origin / Destination Fields -->
          <template v-if="editingFormData.type === 'origin' || editingFormData.type === 'destination'">
            <div class="form-group">
              <label>Company Name</label>
              <input v-model="editingFormData.details.company" class="modern-input" placeholder="e.g. PharmaCorp Inc." />
            </div>
            <div class="form-group">
              <label>{{ editingFormData.type === 'origin' ? 'Origin Location' : 'Destination Location' }}</label>
              <input v-model="editingFormData.details.location" class="modern-input" placeholder="City, Country" />
            </div>
          </template>

          <!-- Intermediary Fields -->
          <template v-if="editingFormData.type === 'intermediary'">
            <div class="form-group">
              <label>Location</label>
              <input v-model="editingFormData.details.location" class="modern-input" placeholder="City, Airport, etc." />
            </div>
            
            <div class="form-group">
              <label>Transport Type</label>
              <select v-model="editingFormData.details.transportType" class="modern-input">
                <option value="road">Road</option>
                <option value="air">Air</option>
                <option value="sea">Sea</option>
                <option value="rail">Rail</option>
              </select>
            </div>

            <div class="form-group checkbox-group">
              <label class="cert-checkbox">
                <input type="checkbox" v-model="editingFormData.details.isWarehouse" />
                <span class="cert-label">Is this a Warehouse / Storage facility?</span>
              </label>
            </div>

            <div class="form-group" v-if="editingFormData.details.isWarehouse">
              <label>Warehouse Company Name</label>
              <input v-model="editingFormData.details.company" class="modern-input" placeholder="e.g. DHL Storage" />
            </div>
          </template>

          <!-- Backup Field -->
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
</template>

<script setup>
import { ref } from 'vue'

const nodes = ref([
  { 
    id: 1, 
    label: 'Origin', 
    type: 'origin', 
    details: { company: '', location: '' }, 
    backup: null,
    offsetY: 0
  },
  { 
    id: 2, 
    label: 'Destination', 
    type: 'destination', 
    details: { company: '', location: '' }, 
    backup: null,
    offsetY: 0
  }
])

const draggedIndex = ref(null)
const dragOverIndex = ref(null)

/* MODAL & EDIT LOGIC */
const editingNodeIndex = ref(null)
const editingFormData = ref(null)

const openModal = (index) => {
  editingNodeIndex.value = index
  editingFormData.value = JSON.parse(JSON.stringify(nodes.value[index]))
}

const closeModal = () => {
  editingNodeIndex.value = null
  editingFormData.value = null
}

const saveNodeDetails = () => {
  if (editingNodeIndex.value !== null && editingFormData.value) {
    if (!editingFormData.value.label.trim()) {
      editingFormData.value.label = editingFormData.value.type === 'origin' ? 'Origin' : 
        (editingFormData.value.type === 'destination' ? 'Destination' : 'Node')
    }
    nodes.value[editingNodeIndex.value] = editingFormData.value
  }
  closeModal()
}

const addNode = () => {
  const newNode = {
    id: Date.now(),
    label: 'New Node',
    type: 'intermediary',
    details: { company: '', location: '', transportType: 'road', isWarehouse: false },
    backup: null,
    offsetY: 0
  }
  
  if (nodes.value.length > 0) {
    // Insert before destination
    nodes.value.splice(nodes.value.length - 1, 0, newNode)
  } else {
    nodes.value.push(newNode)
  }
}

const deleteNode = (index) => {
  if (nodes.value[index].type === 'intermediary') {
    nodes.value.splice(index, 1)
  }
}

/* BACKUP LOGIC */
const addBackup = (index) => {
  if (nodes.value[index].backup === null) {
    nodes.value[index].backup = 'Backup Node'
  }
}

const removeBackup = (index) => {
  nodes.value[index].backup = null
}

const swapBackup = (index) => {
  const n = nodes.value[index]
  if (n.backup === null) return
  const temp = n.label
  n.label = n.backup
  n.backup = temp
}

/* DRAG & DROP LOGIC (WITH 2D MOVEMENT) */
const dragStart = (index) => {
  if (nodes.value[index].type !== 'intermediary') return
  draggedIndex.value = index
}

const dragEnter = (index) => {
  if (draggedIndex.value !== index && nodes.value[index].type === 'intermediary') {
    dragOverIndex.value = index
  }
}

const dragLeave = (index) => {
  if (dragOverIndex.value === index) {
    dragOverIndex.value = null
  }
}

const dragEnd = () => {
  draggedIndex.value = null
  dragOverIndex.value = null
}

const dropOnLane = (e) => {
  if (draggedIndex.value === null) return
  
  const item = nodes.value[draggedIndex.value]
  
  // 1. Calculate Vertical Offset
  const laneEl = document.querySelector('.lane')
  const laneRect = laneEl.getBoundingClientRect()
  const laneCenterY = laneRect.top + laneRect.height / 2
  
  item.offsetY = e.clientY - laneCenterY
  
  // 2. Calculate New Index (Horizontal Reorder)
  const xInLane = e.clientX - laneRect.left
  // Padding Left 40px + Half Hex (75px) = 115px center
  // Node Width (150px) + Margin Right (80px) = 230px slot width
  let newIndex = Math.round((xInLane - 115) / 230)
  
  // Remove item
  nodes.value.splice(draggedIndex.value, 1)
  
  // Clamp index to prevent replacing Origin (0) and Destination (length - 1 after removal)
  if (newIndex < 1) newIndex = 1
  if (newIndex > nodes.value.length - 1) newIndex = nodes.value.length - 1
  
  // Insert item at new position
  nodes.value.splice(newIndex, 0, item)
  
  draggedIndex.value = null
  dragOverIndex.value = null
}
</script>

<style scoped>
.canvas {
  display: flex;
  flex-direction: column;
  height: calc(100% - 40px); 
  margin: 20px;
  padding: 30px 40px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  overflow: hidden; 
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #edf2f7;
  flex-shrink: 0;
}

.title-section h2 {
  margin: 0 0 8px 0;
  color: #2d3748;
  font-size: 24px;
  font-weight: 600;
}

.subtitle {
  margin: 0;
  color: #718096;
  font-size: 14px;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--primary);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  box-shadow: 0 2px 4px rgba(31, 111, 84, 0.2);
}

.btn-primary:hover { background: var(--primary-light); transform: translateY(-1px); }
.btn-primary:active { transform: translateY(0); }

/* Lane Layout */
.lane-container {
  flex: 1; 
  overflow-x: auto;
  overflow-y: hidden;
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #edf2f7;
}

.lane {
  display: inline-flex; 
  align-items: center; /* Centered vertically as requested */
  padding: 40px 40px; /* Padding for start/end spacing */
  min-width: 100%;
  min-height: 100%;
  position: relative;
}

/* SVG Connection Lines */
.lane-svg {
  position: absolute;
  top: 50%; /* Anchor to the middle */
  left: 0;
  width: 100%;
  height: 0; /* Lets overflow render */
  overflow: visible;
  pointer-events: none; /* Let mouse events pass through to drag/drop */
  z-index: 0;
}

.node-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 150px;
  margin-right: 80px; 
  transition: transform 0.1s, opacity 0.2s; /* Faster transform for drag feel */
  z-index: 1;
}
.node-wrapper:last-child { margin-right: 0; }
.node-wrapper.is-dragged { opacity: 0.4; transform: scale(0.95); }
.node-wrapper.drag-over { transform: translateX(15px); }

/* Hexagon Shapes */
.hex-shadow {
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
  z-index: 1;
  transition: filter 0.2s;
  cursor: grab;
}
.hex-shadow:active { cursor: grabbing; }
.hex-shadow:hover { filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.15)); }

/* Non-draggable hex cursor */
.node-wrapper[draggable="false"] .hex-shadow { cursor: pointer; }

.hex {
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  font-size: 16px;
  text-align: center;
  padding: 15px;
  box-sizing: border-box;
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  position: relative;
}

.primary-hex { background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%); }
.backup-hex { background: linear-gradient(135deg, #718096 0%, #a0aec0 100%); }

/* Delete Button Inside Hexagon */
.inner-delete-btn {
  position: absolute;
  top: 15px;
  right: 25px; /* Stay within clip-path */
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  border: none;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s, transform 0.1s;
  z-index: 2;
}

.inner-delete-btn:hover {
  color: white;
  transform: scale(1.2);
}

.backup-connector {
  width: 2px;
  height: 20px;
  background: #cbd5e0;
  margin: 5px 0;
}

/* Controls */
.node-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-top: 10px;
}

.swap-btn {
  position: absolute;
  bottom: 15px;
  right: 25px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  font-size: 14px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s, background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.backup-hex:hover .swap-btn { opacity: 1; }
.swap-btn:hover { background: rgba(255, 255, 255, 0.4); }

.btn-text {
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
}
.add-backup-btn { color: var(--primary); }
.add-backup-btn:hover { background: rgba(31, 111, 84, 0.1); }
.remove-backup-btn { color: #a0aec0; }
.remove-backup-btn:hover { background: rgba(160, 174, 192, 0.1); }

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.modal-content {
  background: white;
  width: 100%; max-width: 500px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  display: flex; flex-direction: column;
  max-height: 90vh;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #edf2f7;
  display: flex; justify-content: space-between; align-items: center;
}
.modal-header h3 { margin: 0; font-size: 18px; font-weight: 700; color: #2d3748; }
.close-btn { background: none; border: none; font-size: 24px; color: #a0aec0; cursor: pointer; }
.close-btn:hover { color: #4a5568; }

.modal-body {
  padding: 24px;
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 20px;
}

.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-size: 14px; font-weight: 600; color: #4a5568; }
.modern-input {
  width: 100%; padding: 12px 14px; border: 1px solid #cbd5e0;
  border-radius: 8px; font-size: 14px; transition: all 0.2s; box-sizing: border-box;
  font-family: inherit; color: #2d3748;
}
.modern-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(31, 111, 84, 0.1); }

.checkbox-group { margin-top: 8px; }
.cert-checkbox { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.cert-checkbox input[type="checkbox"] { width: 18px; height: 18px; accent-color: var(--primary); }
.cert-label { font-size: 14px; color: #4a5568; }

.modal-actions {
  padding: 16px 24px; border-top: 1px solid #edf2f7;
  display: flex; justify-content: flex-end; gap: 12px;
}
.btn-cancel {
  padding: 10px 20px; background: white; border: 1px solid #cbd5e0;
  color: #4a5568; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.btn-cancel:hover { background: #f7fafc; color: #2d3748; }
</style>