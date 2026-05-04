<template>
  <div class="sidebar">
    <div class="logo-container">
      <span class="logo-text">4VISO</span>
    </div>

    <div class="nav">
      <div 
        class="nav-item"
        :class="{ active: $route.path === '/' }"
        @click="$router.push('/')"
      >
        <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
        <span>Dashboard</span>
      </div>

      <div 
        class="nav-item"
        :class="{ active: $route.path === '/lanes' }"
        @click="$router.push('/lanes')"
      >
        <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
        <span>Lanes</span>
      </div>
    </div>
    
    <div class="sidebar-footer">
      <div class="nav-item" @click="$router.push('/login')">
        <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
        <span>Log out</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 260px;
  background: var(--surface-color);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  z-index: 10;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 72px;
  padding: 0 24px;
  border-bottom: 1px solid var(--border-color);
}

.logo-text {
  font-weight: 800;
  font-size: 24px;
  color: var(--primary);
  letter-spacing: -0.5px;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  padding: 24px 16px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  color: var(--text-muted);
  font-weight: 500;
  transition: all var(--transition-fast);
}

.nav-icon {
  opacity: 0.8;
  transition: all var(--transition-fast);
}

.nav-item:hover {
  background: #f1f5f9;
  color: var(--text-main);
}

.nav-item.active {
  background: var(--primary);
  color: white;
}

.nav-item.active .nav-icon {
  opacity: 1;
  color: white;
}

.sidebar-footer {
  margin-top: auto;
  padding: 16px;
  border-top: 1px solid var(--border-color);
}
</style>