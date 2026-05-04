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

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const origin = ref('')
const destination = ref('')

const swapLocations = () => {
  const temp = origin.value
  origin.value = destination.value
  destination.value = temp
}

const findRoutes = () => {
  router.push('/canvas')
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
</style>