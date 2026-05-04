<template>
  <div class="lanes-page">
    <div class="header">
      <h1>Your Lanes</h1>
      <p>Manage your saved supply chain routes or create new ones.</p>
    </div>

    <div class="actions">
      <button class="btn-create" @click="$router.push('/create')">
        <span class="icon">+</span> Create New Lane
      </button>
    </div>

    <div class="routes-container">
      <div v-if="savedRoutes.length === 0" class="empty-state">
        <p>No lanes created yet. Start by creating a new one!</p>
      </div>

      <div v-else class="routes-grid">
        <div 
          v-for="route in savedRoutes" 
          :key="route.id" 
          class="route-card"
          @click="$router.push('/canvas')"
        >
          <div class="route-header">
            <h3>{{ route.origin }} → {{ route.destination }}</h3>
          </div>
          <div class="route-body">
            <span class="status active">Active</span>
            <span class="date">Updated today</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const savedRoutes = ref([])

onMounted(() => {
  // Here we would normally fetch the previously created routes from a backend.
  // For now, we leave it empty as requested, showing the "No lanes created yet" message.
})
</script>

<style scoped>
.lanes-page {
  padding: 40px;
  max-width: 1000px;
  margin: 0 auto;
}

.header h1 {
  font-size: 32px;
  color: #2d3748;
  margin-bottom: 8px;
}

.header p {
  color: #718096;
  font-size: 16px;
  margin-bottom: 30px;
}

.actions {
  margin-bottom: 40px;
}

.btn-create {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--primary);
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(31, 111, 84, 0.2);
}

.btn-create:hover {
  background: var(--primary-light);
  transform: translateY(-2px);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  border: 1px dashed #cbd5e0;
  color: #a0aec0;
  font-size: 16px;
}

.routes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.route-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.route-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.route-header h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #2d3748;
}

.route-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status.active {
  background: #c6f6d5;
  color: #22543d;
}

.date {
  font-size: 12px;
  color: #a0aec0;
}
</style>
