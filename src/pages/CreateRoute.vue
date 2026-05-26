<template>
  <div class="create-page">

    <!-- LEFT INFO PANEL -->
    <div class="info-panel">
      <div class="info-content">
        <div class="step-pill">Step 1 of 2</div>
        <h2 class="panel-title">New Route Setup</h2>
        <p class="panel-desc">
          Define product requirements and shipping constraints before building your supply chain lane.
        </p>

        <div class="timeline">
          <div class="tl-item">
            <div class="tl-icon">
              <div class="tl-dot"></div>
              <div class="tl-line"></div>
            </div>
            <div class="tl-text">
              <strong>Requirements</strong>
              <span>Product specs &amp; constraints</span>
            </div>
          </div>
          <div class="tl-item">
            <div class="tl-icon">
              <div class="tl-dot pending"></div>
            </div>
            <div class="tl-text">
              <strong>Route Builder</strong>
              <span>Visual lane configuration</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT FORM PANEL -->
    <div class="form-panel">
      <div class="form-scroll">
      <div class="form-inner">

        <!-- 00 ROUTE -->
        <section class="card">
          <div class="card-header">
            <span class="card-num">00</span>
            <div>
              <div class="card-title">Route</div>
              <div class="card-hint">Origin and destination cities</div>
            </div>
          </div>
          <div class="inline-row">
            <div class="fg">
              <label>Origin</label>
              <input type="text" v-model="routeOrigin" placeholder="City, Country" class="inp" />
            </div>
            <div class="fg">
              <label>Destination</label>
              <input type="text" v-model="routeDestination" placeholder="City, Country" class="inp" />
            </div>
          </div>
        </section>

        <!-- 01 PRODUCT TYPE -->
        <section class="card" :class="{ 'card-error': showErrors && errors.productType }">
          <div class="card-header">
            <span class="card-num">01</span>
            <div>
              <div class="card-title">Product Type <span class="required-star">*</span></div>
              <div class="card-hint">Select the category of goods being shipped</div>
            </div>
          </div>
          <div class="error-msg" v-if="showErrors && errors.productType">Please select a product type.</div>
          <div class="product-grid">
            <label
              v-for="pt in productTypes"
              :key="pt.value"
              class="product-card"
              :class="{ active: productType === pt.value }"
            >
              <input type="radio" :value="pt.value" v-model="productType" />
              <span class="p-icon">{{ pt.icon }}</span>
              <span class="p-label">{{ pt.label }}</span>
            </label>
          </div>
        </section>

        <!-- 02 + 03 side by side -->
        <div class="two-panels">

          <section class="card" :class="{ 'card-error': showErrors && errors.packageSpecs }">
            <div class="card-header">
              <span class="card-num">02</span>
              <div>
                <div class="card-title">Package Specs <span class="required-star">*</span></div>
                <div class="card-hint">Dimensions, weight &amp; quantity</div>
              </div>
            </div>
            <div class="error-msg" v-if="showErrors && errors.packageSpecs">All dimensions, weight and quantity are required.</div>

            <div class="dims-row">
              <div class="fg">
                <label>Length <span class="unit">cm</span></label>
                <input type="number" v-model="pkg.length" placeholder="0" min="0"
                  class="inp" :class="{ 'inp-error': showErrors && !pkg.length }" />
              </div>
              <span class="dim-sep">×</span>
              <div class="fg">
                <label>Width <span class="unit">cm</span></label>
                <input type="number" v-model="pkg.width" placeholder="0" min="0"
                  class="inp" :class="{ 'inp-error': showErrors && !pkg.width }" />
              </div>
              <span class="dim-sep">×</span>
              <div class="fg">
                <label>Height <span class="unit">cm</span></label>
                <input type="number" v-model="pkg.height" placeholder="0" min="0"
                  class="inp" :class="{ 'inp-error': showErrors && !pkg.height }" />
              </div>
            </div>

            <div class="inline-row">
              <div class="fg">
                <label>Weight <span class="unit">kg</span></label>
                <input type="number" v-model="pkg.weight" placeholder="0.0" min="0" step="0.1"
                  class="inp" :class="{ 'inp-error': showErrors && !pkg.weight }" />
              </div>
              <div class="fg">
                <label>Quantity <span class="unit">units</span></label>
                <input type="number" v-model="pkg.quantity" placeholder="1" min="1"
                  class="inp" :class="{ 'inp-error': showErrors && !pkg.quantity }" />
              </div>
            </div>
          </section>

          <section class="card">
            <div class="card-header">
              <span class="card-num">03</span>
              <div>
                <div class="card-title">Storage &amp; Handling</div>
                <div class="card-hint">Temperature range &amp; fragility</div>
              </div>
            </div>

            <div class="inline-row">
              <div class="fg">
                <label>Min Temp <span class="unit">°C</span></label>
                <input type="number" v-model="tempMin" placeholder="-20" class="inp" />
              </div>
              <div class="fg">
                <label>Max Temp <span class="unit">°C</span></label>
                <input type="number" v-model="tempMax" placeholder="8" class="inp" />
              </div>
            </div>

            <div class="fg">
              <label>Fragile</label>
              <button
                type="button"
                class="fragile-btn"
                :class="{ on: isFragile }"
                @click="isFragile = !isFragile"
              >
                <span class="toggle-track"><span class="toggle-thumb"></span></span>
                <span class="fragile-text">{{ isFragile ? '⚠️ Yes, handle with care' : 'No special handling' }}</span>
              </button>
            </div>
          </section>

        </div>

        <!-- 04 CERTIFICATES -->
        <section class="card" :class="{ 'card-error': showErrors && errors.certificates }">
          <div class="card-header">
            <span class="card-num">04</span>
            <div>
              <div class="card-title">Required Certificates <span class="required-star">*</span></div>
              <div class="card-hint">Select all applicable compliance certificates</div>
            </div>
          </div>
          <div class="error-msg" v-if="showErrors && errors.certificates">Please select at least one certificate.</div>
          <div class="cert-chips">
            <label v-for="cert in certificatesList" :key="cert" class="cert-chip">
              <input type="checkbox" :value="cert" v-model="selectedCertificates" />
              <span>{{ cert }}</span>
            </label>
          </div>
        </section>

      </div>
      </div>

      <!-- STICKY FOOTER -->
      <div class="form-footer">
        <div class="actions">
          <button class="btn-ghost" @click="$router.push('/')">Cancel</button>
          <button class="btn-primary" @click="goToCanvas">
            Continue to Route Builder →
          </button>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from '@/services/api'

const router = useRouter()
const route  = useRoute()

const routeOrigin      = ref('')
const routeDestination = ref('')

onMounted(() => {
  if (route.query.origin)      routeOrigin.value      = route.query.origin
  if (route.query.destination) routeDestination.value = route.query.destination
})

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
const certificatesList = ['GDP', 'IATA', 'ISO 9001', 'ISO 13485', 'ISO 28000']

const showErrors = ref(false)

const errors = computed(() => ({
  productType:  !productType.value,
  packageSpecs: !pkg.length || !pkg.width || !pkg.height || !pkg.weight || !pkg.quantity,
  certificates: selectedCertificates.value.length === 0,
}))

const goToCanvas = async () => {
  showErrors.value = true
  if (errors.value.productType || errors.value.packageSpecs || errors.value.certificates) return

  const routeData = {
    origin:       routeOrigin.value,
    destination:  routeDestination.value,
    productType:  productType.value,
    package:      { ...pkg },
    tempMin:      tempMin.value,
    tempMax:      tempMax.value,
    isFragile:    isFragile.value,
    certificates: selectedCertificates.value,
  }

  // Save to localStorage for RouteCanvas to read
  localStorage.setItem('routeData', JSON.stringify(routeData))

  try {
    // Also save to database
    const lane = await api.post('/lanes', {
      origin:       routeOrigin.value,
      destination:  routeDestination.value,
      cargoProfile: {
        productType:     productType.value,
        weight:          pkg.weight,
        dimensions:      `${pkg.length}x${pkg.width}x${pkg.height}cm`,
        tempRange:       `${tempMin.value}-${tempMax.value}C`,
        specialHandling: isFragile.value ? 'Fragile' : 'None',
      },
      certificates: selectedCertificates.value,
      status: 'draft',
    })
    // Store the new lane ID so RouteCanvas can update it later
    localStorage.setItem('currentLaneId', lane._id)
  } catch (err) {
    console.error('Failed to save lane to API:', err)
  }

  router.push('/canvas')
}
</script>

<style scoped>
/* ── Page shell ── */
.create-page {
  display: flex;
  height: 100%;
}

/* ── Left info panel ── */
.info-panel {
  width: 272px;
  flex-shrink: 0;
  background: var(--primary);
  position: relative;
  overflow: hidden;
}

.info-panel::before {
  content: '';
  position: absolute;
  top: -90px;
  right: -90px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  pointer-events: none;
}

.info-panel::after {
  content: '';
  position: absolute;
  bottom: -110px;
  left: -60px;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  pointer-events: none;
}

.info-content {
  padding: 52px 32px;
  position: relative;
  z-index: 1;
}

.step-pill {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 20px;
}

.panel-title {
  font-size: 22px;
  font-weight: 700;
  color: white;
  margin: 0 0 12px 0;
  line-height: 1.25;
}

.panel-desc {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  line-height: 1.65;
  margin: 0 0 44px 0;
}

/* Timeline */
.timeline {
  display: flex;
  flex-direction: column;
}

.tl-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.tl-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  padding-top: 2px;
}

.tl-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: white;
}

.tl-dot.pending {
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.4);
}

.tl-line {
  width: 1.5px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  margin: 5px 0;
}

.tl-text strong {
  display: block;
  color: white;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  margin-bottom: 4px;
}

.tl-text span {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
}

/* ── Right form panel ── */
.form-panel {
  flex: 1;
  overflow: hidden;
  background: var(--bg-color);
  display: flex;
  flex-direction: column;
}

.form-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 12px 56px;
  display: flex;
  flex-direction: column;
}

.form-inner {
  width: 100%;
  max-width: 920px;
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-footer {
  flex-shrink: 0;
  border-top: 1px solid var(--border-color);
  background: var(--bg-color);
  padding: 10px 56px;
  box-shadow: 0 -4px 16px rgba(0,0,0,0.05);
}

/* ── Cards ── */
.card {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 24px 32px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 18px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.card.card-error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.required-star {
  color: #ef4444;
  font-size: 14px;
  line-height: 1;
}

.error-msg {
  font-size: 12px;
  font-weight: 500;
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: -8px;
}

.error-msg::before {
  content: '!';
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

.inp.inp-error {
  border-color: #ef4444;
  background: #fff5f5;
}

.inp.inp-error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
}

.card-header {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.card-num {
  font-size: 11px;
  font-weight: 800;
  color: var(--primary);
  background: var(--primary-glow);
  padding: 4px 8px;
  border-radius: 6px;
  letter-spacing: 0.06em;
  flex-shrink: 0;
  margin-top: 1px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
}

.card-hint {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
}

/* ── Two-panel row ── */
.two-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

/* ── Product type grid ── */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.product-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 22px 12px;
  border: 1.5px solid var(--border-color);
  border-radius: 16px;
  cursor: pointer;
  transition: all var(--transition-fast);
  user-select: none;
  text-align: center;
  background: #fafbfc;
}

.product-card input[type="radio"] {
  display: none;
}

.product-card:hover {
  border-color: var(--primary);
  background: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.product-card.active {
  border-color: var(--primary);
  background: white;
  box-shadow: 0 0 0 3px var(--primary-glow);
}

.p-icon {
  font-size: 34px;
}

.p-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  line-height: 1.3;
}

.product-card.active .p-label {
  color: var(--primary);
}

/* ── Shared form group ── */
.fg {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fg label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 4px;
}

.unit {
  font-size: 11px;
  font-weight: 400;
  color: var(--text-muted);
}

/* ── Inputs ── */
.inp {
  width: 100%;
  padding: 9px 12px;
  border: 1.5px solid var(--border-color);
  border-radius: 10px;
  font-size: 14px;
  color: var(--text-main);
  transition: all var(--transition-fast);
  box-sizing: border-box;
  font-family: inherit;
  background: #fafbfc;
}

.inp:focus {
  outline: none;
  border-color: var(--primary);
  background: white;
  box-shadow: 0 0 0 3px var(--primary-glow);
}

.inp::placeholder {
  color: #cbd5e1;
}

/* ── Package dims row ── */
.dims-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.dims-row .fg {
  flex: 1;
}

.dim-sep {
  font-size: 15px;
  color: var(--text-muted);
  padding-bottom: 11px;
  flex-shrink: 0;
  user-select: none;
}

.inline-row {
  display: flex;
  gap: 12px;
}

.inline-row .fg {
  flex: 1;
}

/* ── Fragile toggle ── */
.fragile-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border: 1.5px solid var(--border-color);
  border-radius: 8px;
  background: #fafbfc;
  cursor: pointer;
  transition: all var(--transition-fast);
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
}

.fragile-btn.on {
  border-color: #f59e0b;
  background: #fffbeb;
}

.toggle-track {
  width: 34px;
  height: 19px;
  background: #d1d5db;
  border-radius: 999px;
  position: relative;
  transition: background var(--transition-fast);
  flex-shrink: 0;
}

.fragile-btn.on .toggle-track {
  background: #f59e0b;
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 15px;
  height: 15px;
  background: white;
  border-radius: 50%;
  transition: transform var(--transition-fast);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.fragile-btn.on .toggle-thumb {
  transform: translateX(15px);
}

.fragile-text {
  font-size: 13px;
  color: var(--text-main);
  font-weight: 500;
}

/* ── Certificates ── */
.cert-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.cert-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 16px;
  border: 1.5px solid var(--border-color);
  border-radius: 999px;
  cursor: pointer;
  transition: all var(--transition-fast);
  user-select: none;
  background: #fafbfc;
}

.cert-chip:hover {
  border-color: var(--primary);
  background: white;
}

.cert-chip:has(input:checked) {
  border-color: var(--primary);
  background: var(--primary-glow);
}

.cert-chip input[type="checkbox"] {
  width: 14px;
  height: 14px;
  accent-color: var(--primary);
  cursor: pointer;
  flex-shrink: 0;
}

.cert-chip span {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
}

/* ── Actions ── */
.actions {
  max-width: 920px;
  margin: 0 auto;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-ghost {
  padding: 11px 24px;
  background: white;
  border: 1.5px solid var(--border-color);
  color: var(--text-muted);
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: inherit;
}

.btn-ghost:hover {
  background: #f8fafc;
  color: var(--text-main);
  border-color: #cbd5e1;
}

.btn-primary {
  padding: 11px 28px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 4px 12px var(--primary-glow);
  font-family: inherit;
}

.btn-primary:hover {
  background: var(--primary-light);
  transform: translateY(-1px);
  box-shadow: 0 8px 16px var(--primary-glow);
}

/* ── Responsive ── */
@media (max-width: 960px) {
  .info-panel { display: none; }
  .form-scroll { padding: 28px 24px 20px; }
  .form-footer { padding: 14px 24px; }
  .two-panels { grid-template-columns: 1fr; }
  .form-inner { max-width: 100%; }
}

@media (max-width: 560px) {
  .product-grid { grid-template-columns: repeat(2, 1fr); }
  .dims-row { flex-wrap: wrap; }
  .dim-sep { display: none; }
}
</style>
