<template>
  <div class="dashboard">
    <!-- BACKGROUND IFRAME -->
    <iframe src="/logistics_world_balanced.html" class="dashboard-bg"></iframe>
    <div class="dashboard-bg-overlay"></div>

    <div class="dashboard-content">

      <div class="header-section">
        <h1>Lane Risk Assessment</h1>
        <p>Analyze and optimize your supply chain routes with AI-powered risk scoring.</p>
      </div>

      <div class="search-card">
        <div class="inputs-container">
          <div class="input-group">
            <label>Origin</label>
            <div class="input-box">
              <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <input type="text" v-model="origin" placeholder="City, Country or Port">
            </div>
          </div>

          <div class="swap-icon-container">
            <button class="swap-btn" @click="swapLocations">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 16-4-4 4-4"/><path d="M3 12h18"/><path d="m17 8 4 4-4 4"/></svg>
            </button>
          </div>

          <div class="input-group">
            <label>Destination</label>
            <div class="input-box">
              <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
              <input type="text" v-model="destination" placeholder="City, Country or Port">
            </div>
          </div>
        </div>

        <button class="find-btn" @click="findRoutes">
          <span>Find Secure Lanes</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>

        <div class="create-link-wrapper">
          <button class="create-link" @click="$router.push('/create')">
            <span>+ Create a new lane manually</span>
          </button>
        </div>
      </div>

      <!-- LANE RESULTS -->
      <transition name="fade">
        <div v-if="searchTriggered" class="results-section">
          <div v-if="filteredLanes.length === 0" class="no-results-box">
            <span class="no-results-icon">🔍</span>
            <p class="no-results-msg">No secure lanes found for this route</p>
            <button class="btn-create-lane" @click="createNewLane">+ Create new lane</button>
          </div>
          <div v-else class="lanes-grid">
            <div v-for="lane in filteredLanes" :key="lane.id" class="lane-card">
              <div class="lane-card-top">
                <span class="lane-route-text">{{ lane.origin.city }} → {{ lane.destination.city }}</span>
                <span class="lane-product-badge">{{ lane.productType }}</span>
              </div>
              <div class="lane-card-meta">
                <div class="meta-item">
                  <span class="meta-label">Certificates</span>
                  <span class="meta-value certs">{{ lane.certificates.join(' · ') }}</span>
                </div>
                <div class="meta-row">
                  <div class="meta-item">
                    <span class="meta-label">Nodes</span>
                    <span class="meta-value">{{ lane.nodes.length }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Created</span>
                    <span class="meta-value">{{ lane.createdAt }}</span>
                  </div>
                </div>
              </div>
              <button class="open-lane-btn" @click="openLane(lane)">Open Lane →</button>
            </div>
          </div>
        </div>
      </transition>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import lanes from '@/data/lanes.json'

const router = useRouter()
const origin = ref('')
const destination = ref('')
const searchTriggered = ref(false)
const filteredLanes = ref([])

const swapLocations = () => {
  const temp = origin.value
  origin.value = destination.value
  destination.value = temp
}

const findRoutes = () => {
  searchTriggered.value = true
  const o = origin.value.trim().toLowerCase()
  const d = destination.value.trim().toLowerCase()
  filteredLanes.value = lanes.filter(lane => {
    const matchOrigin = !o || lane.origin.city.toLowerCase().includes(o)
    const matchDest   = !d || lane.destination.city.toLowerCase().includes(d)
    return matchOrigin && matchDest
  })
}

const createNewLane = () => {
  router.push({ path: '/create', query: { origin: origin.value, destination: destination.value } })
}

const openLane = (lane) => {
  router.push({ path: '/canvas', query: { laneId: lane.id } })
}
</script>

<style scoped>
.dashboard {
  position: relative;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dashboard-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  z-index: 0;
  pointer-events: none; /* allows clicking through to dashboard elements if needed, though they have higher z-index */
}

.dashboard-bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(240, 242, 244, 0.6); /* light grey tint */
  backdrop-filter: blur(0.5px);
  -webkit-backdrop-filter: blur(0.5px);
  z-index: 0;
  pointer-events: none;
}

.dashboard-content {
  position: relative;
  z-index: 1;
  padding: 60px 60px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.header-section {
  margin-bottom: 60px;
  text-align: center;
}

.header-section h1 {
  font-size: 40px;
  font-weight: 800;
  margin: 0 0 12px 0;
  color: var(--text-main);
  letter-spacing: -1px;
}

.header-section p {
  color: var(--text-muted);
  font-size: 18px;
  margin: 0;
}

/* SEARCH CARD */
.search-card {
  background: var(--surface-color);
  padding: 32px;
  border-radius: 24px;
  width: 70%;
  margin: 0 auto;
  box-shadow: var(--shadow-float);
  border: 1px solid var(--border-color);
}

.inputs-container {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
}

.input-box {
  position: relative;
  display: flex;
  align-items: center;
}

.icon {
  position: absolute;
  left: 16px;
  color: #94a3b8;
}

.input-box input {
  width: 100%;
  padding: 18px 20px 18px 50px;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  font-size: 16px;
  background: #f8fafc;
  color: var(--text-main);
  transition: all var(--transition-fast);
}

.input-box input:focus {
  outline: none;
  border-color: var(--primary);
  background: var(--surface-color);
  box-shadow: 0 0 0 4px var(--primary-glow);
}

.swap-icon-container {
  padding-bottom: 2px;
}

.swap-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.swap-btn:hover {
  background: #f8fafc;
  color: var(--primary);
  border-color: var(--primary);
}

/* BUTTON */
.find-btn {
  width: 100%;
  background: var(--primary); /* Uses exact same var(--primary) as header */
  color: white;
  padding: 16px;
  border-radius: 12px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all var(--transition-fast);
}

.find-btn:not(:disabled):hover {
  background: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px var(--primary-glow);
}

/* CREATE LINK */
.create-link-wrapper {
  text-align: center;
  margin-top: 24px;
}

.create-link {
  background: transparent;
  border: none;
  color: var(--primary);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all var(--transition-fast);
}

.create-link:hover {
  background: var(--primary-glow);
}

/* RESULTS SECTION */
.dashboard-content {
  overflow-y: auto;
}

.results-section {
  width: 70%;
  margin: 28px auto 0;
}

/* No results */
.no-results-box {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 48px 32px;
  text-align: center;
  box-shadow: var(--shadow-float);
}

.no-results-icon {
  font-size: 36px;
  display: block;
  margin-bottom: 12px;
}

.no-results-msg {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-main);
  margin: 0 0 20px 0;
}

.btn-create-lane {
  background: var(--primary);
  color: white;
  padding: 12px 24px;
  border-radius: 10px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-create-lane:hover {
  background: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px var(--primary-glow);
}

/* Lane cards grid */
.lanes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding-bottom: 40px;
}

.lane-card {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow-float);
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.lane-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
}

.lane-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.lane-route-text {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.3;
}

.lane-product-badge {
  font-size: 11px;
  font-weight: 600;
  background: var(--primary-glow);
  color: var(--primary);
  border-radius: 20px;
  padding: 4px 10px;
  white-space: nowrap;
  flex-shrink: 0;
}

.lane-card-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meta-row {
  display: flex;
  gap: 24px;
}

.meta-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.meta-value {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-main);
}

.meta-value.certs {
  font-size: 12px;
  color: var(--text-muted);
}

.open-lane-btn {
  margin-top: auto;
  width: 100%;
  background: transparent;
  border: 1.5px solid var(--primary);
  color: var(--primary);
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.open-lane-btn:hover {
  background: var(--primary);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 6px 14px var(--primary-glow);
}

/* Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>