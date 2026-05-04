<template>
  <div class="layout">
    
    <!-- SIDEBAR -->
    <Sidebar v-if="!$route.meta.hideLayout" />

    <!-- MAIN -->
    <div class="main">

      <Header v-if="!$route.meta.hideLayout" />

      <div class="content" :class="{ 'full-page': $route.meta.hideLayout }">
        <router-view />
      </div>

    </div>

  </div>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
</script>

<style>
.layout {
  display: flex;
  height: 100vh;
  background: var(--bg-color);
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  position: relative;
}

.content.full-page {
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg-color);
}
</style>