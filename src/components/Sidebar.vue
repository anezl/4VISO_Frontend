<template>
  <div class="sidebar" :class="{ collapsed }">

    <!-- Logo / Toggle row -->
    <div class="logo-row">
      <span v-show="!collapsed" class="logo-text">4VISO</span>
      <button class="toggle-btn" @click="collapsed = !collapsed" :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15" height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="chevron"
          :class="{ flipped: collapsed }"
        >
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
    </div>

    <!-- Nav -->
    <div class="nav">
      <div
        class="nav-item"
        :class="{ active: $route.path === '/' }"
        @click="$router.push('/')"
        title="Dashboard"
      >
        <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
        <span v-show="!collapsed" class="nav-label">Dashboard</span>
      </div>

      <div
        class="nav-item"
        :class="{ active: $route.path === '/lanes' }"
        @click="$router.push('/lanes')"
        title="Lanes"
      >
        <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
        <span v-show="!collapsed" class="nav-label">Lanes</span>
      </div>

      <div
        class="nav-item"
        :class="{ active: $route.path === '/companies' }"
        @click="$router.push('/companies')"
        title="Companies"
      >
        <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
        <span v-show="!collapsed" class="nav-label">Companies</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="sidebar-footer">
      <div class="nav-item" @click="logout" title="Log out">
        <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
        <span v-show="!collapsed" class="nav-label">Log out</span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { clearAuthSession } from '@/services/api'

const route = useRoute()
const router = useRouter()
const collapsed = ref(false)

const logout = () => {
  clearAuthSession()
  router.push('/login')
}

watch(
  () => route.path,
  (path) => { if (path === '/create' || path === '/canvas') collapsed.value = true },
  { immediate: true }
)
</script>

<style scoped>
.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--surface-color);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  z-index: 10;
  transition: width 0.25s ease;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 60px;
}

/* ── Logo row ── */
.logo-row {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.sidebar.collapsed .logo-row {
  justify-content: center;
  padding: 0;
}

.logo-text {
  font-weight: 800;
  font-size: 22px;
  color: var(--primary);
  letter-spacing: -0.5px;
  white-space: nowrap;
}

.toggle-btn {
  width: 30px;
  height: 30px;
  min-width: 30px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-muted);
  transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
  flex-shrink: 0;
}

.toggle-btn:hover {
  background: #f1f5f9;
  color: var(--primary);
  border-color: #cbd5e1;
}

.chevron {
  transition: transform 0.25s ease;
}

.chevron.flipped {
  transform: rotate(180deg);
}

/* ── Nav ── */
.nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 10px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  border-radius: 10px;
  cursor: pointer;
  color: var(--text-muted);
  font-weight: 500;
  font-size: 14px;
  transition: background var(--transition-fast), color var(--transition-fast);
  white-space: nowrap;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 11px 0;
  gap: 0;
}

.nav-item:hover {
  background: #f1f5f9;
  color: var(--text-main);
}

.nav-item.active {
  background: var(--primary);
  color: white;
}

.nav-icon {
  flex-shrink: 0;
  opacity: 0.75;
}

.nav-item.active .nav-icon {
  opacity: 1;
  color: white;
}

.nav-label {
  white-space: nowrap;
}

/* ── Footer ── */
.sidebar-footer {
  padding: 12px 10px;
  border-top: 1px solid var(--border-color);
}
</style>
