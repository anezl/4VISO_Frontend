<template>
  <div class="create-page">
    <div class="form-container">
      <div class="page-header">
        <h1>Create New Route</h1>
        <p>Define the product requirements and shipping constraints for your new supply chain lane.</p>
      </div>

      <div class="form-content">

        <!-- PRODUCT TYPE -->
        <div class="form-section">
          <div class="section-title">
            <span class="section-icon">💊</span>
            <span>Product Type</span>
          </div>
          <div class="product-type-grid">
            <label
              v-for="pt in productTypes"
              :key="pt.value"
              class="product-card"
              :class="{ active: productType === pt.value }"
            >
              <input type="radio" :value="pt.value" v-model="productType" />
              <span class="product-icon">{{ pt.icon }}</span>
              <span class="product-label">{{ pt.label }}</span>
            </label>
          </div>
        </div>

        <!-- PACKAGE SPECIFICATIONS -->
        <div class="form-section">
          <div class="section-title">
            <span class="section-icon">📦</span>
            <span>Package Specifications</span>
          </div>

          <div class="pkg-dims-row">
            <div class="form-group">
              <label>Length <span class="unit">cm</span></label>
              <input type="number" v-model="pkg.length" placeholder="0" class="modern-input" min="0" />
            </div>
            <div class="dim-sep">×</div>
            <div class="form-group">
              <label>Width <span class="unit">cm</span></label>
              <input type="number" v-model="pkg.width" placeholder="0" class="modern-input" min="0" />
            </div>
            <div class="dim-sep">×</div>
            <div class="form-group">
              <label>Height <span class="unit">cm</span></label>
              <input type="number" v-model="pkg.height" placeholder="0" class="modern-input" min="0" />
            </div>
          </div>

          <div class="pkg-meta-row">
            <div class="form-group">
              <label>Weight <span class="unit">kg</span></label>
              <input type="number" v-model="pkg.weight" placeholder="0.0" class="modern-input" min="0" step="0.1" />
            </div>
            <div class="form-group">
              <label>Quantity <span class="unit">units</span></label>
              <input type="number" v-model="pkg.quantity" placeholder="1" class="modern-input" min="1" />
            </div>
          </div>
        </div>

        <!-- TEMPERATURE + FRAGILE -->
        <div class="form-section">
          <div class="section-title">
            <span class="section-icon">🌡️</span>
            <span>Storage &amp; Handling</span>
          </div>

          <div class="temp-fragile-row">
            <div class="form-group">
              <label>Min Temperature <span class="unit">°C</span></label>
              <input type="number" v-model="tempMin" placeholder="-20" class="modern-input" />
            </div>
            <div class="form-group">
              <label>Max Temperature <span class="unit">°C</span></label>
              <input type="number" v-model="tempMax" placeholder="8" class="modern-input" />
            </div>
            <div class="form-group fragile-group">
              <label>Fragile</label>
              <button
                type="button"
                class="fragile-toggle"
                :class="{ on: isFragile }"
                @click="isFragile = !isFragile"
              >
                <span class="toggle-track">
                  <span class="toggle-thumb"></span>
                </span>
                <span class="fragile-text">{{ isFragile ? '⚠️ Yes, handle with care' : 'No' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- CERTIFICATES -->
        <div class="form-section">
          <div class="section-title">
            <span class="section-icon">📋</span>
            <span>Required Certificates</span>
          </div>
          <div class="cert-grid">
            <label v-for="cert in certificatesList" :key="cert" class="cert-checkbox">
              <input type="checkbox" :value="cert" v-model="selectedCertificates" />
              <span class="cert-label">{{ cert }}</span>
            </label>
          </div>
        </div>

      </div>

      <!-- ACTIONS -->
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const productType = ref('')
const productTypes = [
  { value: 'pharmaceutical', label: 'Pharmaceutical', icon: '💊' },
  { value: 'vaccines',       label: 'Vaccines',       icon: '💉' },
  { value: 'biological',     label: 'Biological',     icon: '🧬' },
  { value: 'medical_devices',label: 'Medical Devices', icon: '🩺' },
]

const pkg = reactive({ length: '', width: '', height: '', weight: '', quantity: '' })

const tempMin = ref('')
const tempMax = ref('')
const isFragile = ref(false)

const selectedCertificates = ref([])
const certificatesList = [
  'GDP',
  'IATA',
  'ISO 9001',
  'ISO 13485',
  'ISO 28000',
]

const goToCanvas = () => {
  localStorage.setItem('routeData', JSON.stringify({
    productType: productType.value,
    package: { ...pkg },
    tempMin: tempMin.value,
    tempMax: tempMax.value,
    isFragile: isFragile.value,
    certificates: selectedCertificates.value,
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
  max-width: 720px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  padding: 44px;
  box-sizing: border-box;
}

/* ── Header ── */
.page-header {
  margin-bottom: 36px;
  text-align: center;
}
.page-header h1 {
  font-size: 26px;
  font-weight: 500;
  color: #1f2937;
  margin: 0 0 8px 0;
}
.page-header p {
  color: #6b7280;
  margin: 0;
  font-size: 14px;
}

/* ── Sections ── */
.form-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  padding-bottom: 10px;
  border-bottom: 1px solid #f3f4f6;
}
.section-icon {
  font-size: 16px;
}

/* ── Product Type cards ── */
.product-type-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.product-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 18px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  text-align: center;
}
.product-card input[type="radio"] {
  display: none;
}
.product-card:hover {
  border-color: var(--primary);
  background: rgba(31, 111, 84, 0.03);
}
.product-card.active {
  border-color: var(--primary);
  background: rgba(31, 111, 84, 0.07);
  box-shadow: 0 0 0 3px rgba(31, 111, 84, 0.1);
}
.product-icon {
  font-size: 28px;
}
.product-label {
  font-size: 12px;
  font-weight: 500;
  color: #4b5563;
  line-height: 1.3;
}
.product-card.active .product-label {
  color: var(--primary);
}

/* ── Package dims ── */
.pkg-dims-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}
.pkg-dims-row .form-group {
  flex: 1;
}

.dim-sep {
  font-size: 18px;
  color: #9ca3af;
  padding-bottom: 12px;
  flex-shrink: 0;
}

.pkg-meta-row {
  display: flex;
  gap: 16px;
}
.pkg-meta-row .form-group {
  flex: 1;
}

/* ── Temperature + Fragile ── */
.temp-fragile-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}
.temp-fragile-row .form-group {
  flex: 1;
  min-width: 120px;
}

/* ── Fragile toggle ── */
.fragile-group {
  flex: 1.5 !important;
}
.fragile-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  box-sizing: border-box;
}
.fragile-toggle.on {
  border-color: #f59e0b;
  background: #fffbeb;
}
.toggle-track {
  width: 36px;
  height: 20px;
  background: #d1d5db;
  border-radius: 999px;
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
}
.fragile-toggle.on .toggle-track {
  background: #f59e0b;
}
.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.fragile-toggle.on .toggle-thumb {
  transform: translateX(16px);
}
.fragile-text {
  font-size: 13px;
  color: #4b5563;
  font-weight: 500;
}

/* ── Shared form group ── */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 4px;
}
.unit {
  font-size: 11px;
  font-weight: 400;
  color: #9ca3af;
}

/* ── Inputs ── */
.modern-input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #1f2937;
  transition: all 0.2s;
  box-sizing: border-box;
  font-family: inherit;
  background: #fafafa;
}
.modern-input:focus {
  outline: none;
  border-color: var(--primary);
  background: white;
  box-shadow: 0 0 0 3px rgba(31, 111, 84, 0.1);
}
.modern-input::placeholder {
  color: #d1d5db;
}

/* ── Certificates ── */
.cert-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px;
}
.cert-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}
.cert-checkbox:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}
.cert-checkbox:has(input:checked) {
  border-color: var(--primary);
  background: rgba(31, 111, 84, 0.05);
}
.cert-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--primary);
  cursor: pointer;
  flex-shrink: 0;
}
.cert-label {
  font-size: 13px;
  color: #4b5563;
  font-weight: 500;
}

/* ── Actions ── */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #f3f4f6;
}
.btn-cancel {
  padding: 11px 24px;
  background: white;
  border: 1.5px solid #e5e7eb;
  color: #6b7280;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.btn-cancel:hover {
  background: #f9fafb;
  color: #1f2937;
}
.btn-primary {
  padding: 11px 28px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(31, 111, 84, 0.25);
  font-family: inherit;
}
.btn-primary:hover {
  background: var(--primary-light);
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 560px) {
  .product-type-grid { grid-template-columns: repeat(2, 1fr); }
  .pkg-dims-row { flex-direction: column; }
  .dim-sep { display: none; }
  .temp-fragile-row { flex-direction: column; }
}
</style>