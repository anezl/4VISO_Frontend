<template>
  <div class="create-page">
    <div class="form-container">
      <div class="header">
        <h1>Create New Route</h1>
        <p>Define the requirements and constraints for your new supply chain lane.</p>
      </div>

      <div class="form-content">
        <!-- PRODUCT INFO -->
        <div class="form-group">
          <label>Product Information</label>
          <textarea
            v-model="description"
            placeholder="Describe the product, specifications, handling requirements..."
            class="modern-input"
          ></textarea>
        </div>

        <div class="split-group">
          <!-- CONSTRAINTS -->
          <div class="form-group half-width">
            <label>Max Delivery Time (hours)</label>
            <input
              type="number"
              v-model="maxTime"
              placeholder="e.g. 48"
              class="modern-input"
            />
          </div>

          <div class="form-group half-width">
            <label>Temperature (°C)</label>
            <input
              type="text"
              v-model="temperature"
              placeholder="e.g. 2-8°C"
              class="modern-input"
            />
          </div>
        </div>

        <!-- CERTIFICATES -->
        <div class="form-group">
          <label>Required Certificates</label>
          <div class="cert-grid">
            <label v-for="cert in certificatesList" :key="cert" class="cert-checkbox">
              <input
                type="checkbox"
                :value="cert"
                v-model="selectedCertificates"
              />
              <span class="cert-label">{{ cert }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- ACTION -->
      <div class="form-actions">
        <button class="btn-cancel" @click="$router.push('/lanes')">Cancel</button>
        <button class="btn-primary" @click="goToCanvas">
          Continue to Route Builder →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const description = ref('')
const selectedCertificates = ref([])
const maxTime = ref('')
const temperature = ref('')

const certificatesList = [
  'GDP',
  'Cold Chain',
  'ISO 13485',
  'GMP',
  'Validated Transport'
]

const goToCanvas = () => {
  // Guardamos en localStorage (rápido para demo)
  localStorage.setItem('routeData', JSON.stringify({
    description: description.value,
    certificates: selectedCertificates.value,
    maxTime: maxTime.value,
    temperature: temperature.value
  }))

  router.push('/canvas')
}
</script>

<style scoped>
.create-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 20px;
  min-height: 100%;
}

.form-container {
  background: white;
  width: 100%;
  max-width: 650px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 40px;
  box-sizing: border-box;
}

.header {
  margin-bottom: 30px;
  text-align: center;
}

.header h1 {
  font-size: 28px;
  color: #1f2937;
  margin: 0 0 8px 0;
  font-weight: 700;
}

.header p {
  color: #6b7280;
  margin: 0;
  font-size: 15px;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.modern-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 15px;
  color: #1f2937;
  transition: all 0.2s;
  box-sizing: border-box;
  font-family: inherit;
}

.modern-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(31, 111, 84, 0.1);
}

textarea.modern-input {
  min-height: 120px;
  resize: vertical;
}

.split-group {
  display: flex;
  gap: 20px;
}

.half-width {
  flex: 1;
}

/* Certificates Grid */
.cert-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.cert-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.cert-checkbox:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

/* Estilo para cuando el checkbox está seleccionado */
.cert-checkbox:has(input:checked) {
  border-color: var(--primary);
  background: rgba(31, 111, 84, 0.05);
}

.cert-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--primary);
  cursor: pointer;
}

.cert-label {
  font-size: 14px;
  color: #4b5563;
  font-weight: 500;
}

/* Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel {
  padding: 12px 24px;
  background: white;
  border: 1px solid #d1d5db;
  color: #4b5563;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f9fafb;
  color: #1f2937;
}

.btn-primary {
  padding: 12px 24px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(31, 111, 84, 0.2);
}

.btn-primary:hover {
  background: var(--primary-light);
  transform: translateY(-1px);
}
</style>