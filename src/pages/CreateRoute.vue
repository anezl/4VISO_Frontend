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

    <!-- RIGHT PANEL -->
    <div class="form-panel">
      <div class="form-scroll">
        <div class="form-inner">

          <!-- ════════════════════════════════════════════════
               STEP 1: REQUIREMENTS FORM
               ════════════════════════════════════════════════ -->
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
                <div class="fg city-ac-wrap">
                  <label>Origin</label>
                  <input type="text" v-model="routeOrigin" placeholder="e.g. Amsterdam, Netherlands"
                    class="inp" autocomplete="off"
                    @input="onOriginInput" @focus="onOriginFocus" @blur="onOriginBlur" />
                  <div class="city-drop" v-if="originSugs.length">
                    <div v-for="c in originSugs" :key="c.city + c.code" class="city-item"
                      @mousedown.prevent="selectOrigin(c)">
                      <span class="ci-city">{{ c.city }}</span>
                      <span class="ci-meta">{{ c.country }} · {{ c.code }}</span>
                      <span class="ci-region">{{ c.region }}</span>
                    </div>
                  </div>
                </div>
                <div class="fg city-ac-wrap">
                  <label>Destination</label>
                  <input type="text" v-model="routeDestination" placeholder="e.g. Madrid, Spain"
                    class="inp" autocomplete="off"
                    @input="onDestInput" @focus="onDestFocus" @blur="onDestBlur" />
                  <div class="city-drop" v-if="destSugs.length">
                    <div v-for="c in destSugs" :key="c.city + c.code" class="city-item"
                      @mousedown.prevent="selectDest(c)">
                      <span class="ci-city">{{ c.city }}</span>
                      <span class="ci-meta">{{ c.country }} · {{ c.code }}</span>
                      <span class="ci-region">{{ c.region }}</span>
                    </div>
                  </div>
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
                <label v-for="pt in productTypes" :key="pt.value" class="product-card" :class="{ active: productType === pt.value }">
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
                    <input type="number" v-model="pkg.length" placeholder="0" min="0" class="inp" :class="{ 'inp-error': showErrors && !pkg.length }" />
                  </div>
                  <span class="dim-sep">×</span>
                  <div class="fg">
                    <label>Width <span class="unit">cm</span></label>
                    <input type="number" v-model="pkg.width" placeholder="0" min="0" class="inp" :class="{ 'inp-error': showErrors && !pkg.width }" />
                  </div>
                  <span class="dim-sep">×</span>
                  <div class="fg">
                    <label>Height <span class="unit">cm</span></label>
                    <input type="number" v-model="pkg.height" placeholder="0" min="0" class="inp" :class="{ 'inp-error': showErrors && !pkg.height }" />
                  </div>
                </div>
                <div class="inline-row">
                  <div class="fg">
                    <label>Weight <span class="unit">kg</span></label>
                    <input type="number" v-model="pkg.weight" placeholder="0.0" min="0" step="0.1" class="inp" :class="{ 'inp-error': showErrors && !pkg.weight }" />
                  </div>
                  <div class="fg">
                    <label>Quantity <span class="unit">units</span></label>
                    <input type="number" v-model="pkg.quantity" placeholder="1" min="1" class="inp" :class="{ 'inp-error': showErrors && !pkg.quantity }" />
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
                <div class="temp-blocks">
                  <button v-for="b in TEMP_BLOCKS" :key="b.key" type="button"
                    class="temp-block" :class="{ active: selectedTempBlock === b.key }"
                    :style="selectedTempBlock === b.key ? { borderColor: b.color, background: b.color + '14' } : {}"
                    @click="selectedTempBlock = selectedTempBlock === b.key ? '' : b.key">
                    <span class="tb-icon">{{ b.icon }}</span>
                    <span class="tb-label">{{ b.label }}</span>
                    <span class="tb-sub">{{ b.sub }}</span>
                  </button>
                </div>
                <div class="fg">
                  <label>Fragile</label>
                  <button type="button" class="fragile-btn" :class="{ on: isFragile }" @click="isFragile = !isFragile">
                    <span class="toggle-track"><span class="toggle-thumb"></span></span>
                    <span class="fragile-text">{{ isFragile ? 'Yes, handle with care' : 'No special handling' }}</span>
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
                  <div class="card-hint">Select all applicable compliance certificates for this lane</div>
                </div>
              </div>
              <div class="error-msg" v-if="showErrors && errors.certificates">Please select at least one certificate.</div>
              <div class="cert-chips">
                <label v-for="cert in certificatesList" :key="cert" class="cert-chip">
                  <input type="checkbox" :value="cert" v-model="selectedCertificates" />
                  <span>{{ cert }}</span>
                </label>
              </div>
              <!-- Cert guidance for selected product type -->
              <div v-if="productType && certGuidance.length" class="cert-guidance">
                <span class="cert-guidance-label">Recommended for {{ productTypeName }}:</span>
                <span v-for="c in certGuidance" :key="c" class="cert-guidance-tag" :class="{ selected: selectedCertificates.includes(c) }">{{ c }}</span>
              </div>
            </section>


        </div>
      </div>

      <!-- STICKY FOOTER -->
      <div class="form-footer">
        <p v-if="submitError" class="submit-error">{{ submitError }}</p>
        <div class="actions">
          <button class="btn-ghost" @click="$router.push('/')">Cancel</button>
          <button class="btn-primary" :disabled="isSubmitting" @click="proceedToBuilder">
            {{ isSubmitting ? 'Saving…' : 'Continue to Route Builder →' }}
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
import { TEMP_BLOCKS } from '@/data/tempBlocks'
import { searchCities } from '@/data/worldCities'

const router = useRouter()
const route  = useRoute()

const routeOrigin      = ref('')
const routeDestination = ref('')
const originSugs       = ref([])
const destSugs         = ref([])

onMounted(() => {
  if (route.query.origin)      routeOrigin.value      = route.query.origin
  if (route.query.destination) routeDestination.value = route.query.destination
})

// ── City autocomplete ─────────────────────────────────────────────
const onOriginInput  = () => { originSugs.value = searchCities(routeOrigin.value) }
const onOriginFocus  = () => { originSugs.value = searchCities(routeOrigin.value) }
const onOriginBlur   = () => { setTimeout(() => { originSugs.value = [] }, 150) }
const selectOrigin   = (c) => { routeOrigin.value = `${c.city}, ${c.country}`; originSugs.value = [] }

const onDestInput    = () => { destSugs.value = searchCities(routeDestination.value) }
const onDestFocus    = () => { destSugs.value = searchCities(routeDestination.value) }
const onDestBlur     = () => { setTimeout(() => { destSugs.value = [] }, 150) }
const selectDest     = (c) => { routeDestination.value = `${c.city}, ${c.country}`; destSugs.value = [] }

const productType = ref('')
const productTypes = [
  { value: 'pharmaceutical',  label: 'Pharmaceutical',  icon: '💊' },
  { value: 'vaccines',        label: 'Vaccines',        icon: '💉' },
  { value: 'biological',      label: 'Biological',      icon: '🧬' },
  { value: 'medical_devices', label: 'Medical Devices', icon: '🩺' },
]

const pkg = reactive({ length: '', width: '', height: '', weight: '', quantity: '' })

const selectedTempBlock = ref('')
const isFragile = ref(false)

const selectedCertificates = ref([])
const certificatesList = ['GDP', 'ISO 9001', 'ISO 13485', 'ISO 28000']

const showErrors   = ref(false)
const isSubmitting = ref(false)
const submitError  = ref('')

// ── Computed helpers ─────────────────────────────────────────────
const productTypeName = computed(() => {
  return productTypes.find(p => p.value === productType.value)?.label || productType.value || ''
})

const CERT_REQUIREMENTS = {
  pharmaceutical:  { required: ['GDP'],           recommended: ['ISO 9001'] },
  vaccines:        { required: ['GDP'],   recommended: ['ISO 13485'] },
  biological:      { required: ['GDP'],   recommended: ['ISO 13485'] },
  medical_devices: { required: ['ISO 13485'],     recommended: ['GDP', 'ISO 28000'] },
}

const certGuidance = computed(() => {
  const req = CERT_REQUIREMENTS[productType.value]
  if (!req) return []
  return [...req.required, ...req.recommended]
})

const errors = computed(() => ({
  productType:  !productType.value,
  packageSpecs: !pkg.length || !pkg.width || !pkg.height || !pkg.weight || !pkg.quantity,
  certificates: selectedCertificates.value.length === 0,
}))

// ── Navigation ───────────────────────────────────────────────────
const proceedToBuilder = async () => {
  showErrors.value = true
  if (errors.value.productType || errors.value.packageSpecs || errors.value.certificates) return
  showErrors.value  = false
  isSubmitting.value = true
  submitError.value  = ''

  const routeData = {
    origin:       routeOrigin.value,
    destination:  routeDestination.value,
    certificates: selectedCertificates.value,
    tempBlock:    selectedTempBlock.value,
    productType:  productType.value,
    fragile:      isFragile.value,
  }

  try {
    const lane = await api.post('/lanes', {
      origin:       { city: routeOrigin.value },
      destination:  { city: routeDestination.value },
      cargoProfile: {
        productType:     productType.value,
        weight:          Number(pkg.weight),
        dimensions:      `${pkg.length}x${pkg.width}x${pkg.height}cm`,
        tempRange:       selectedTempBlock.value ? TEMP_BLOCKS.find(b => b.key === selectedTempBlock.value)?.sub || '' : 'Not specified',
        tempBlock:       selectedTempBlock.value,
        specialHandling: isFragile.value ? 'Fragile' : 'None',
      },
      certificates: selectedCertificates.value,
      status: 'draft',
    })
    localStorage.setItem('routeData', JSON.stringify(routeData))
    router.push({ name: 'RouteCanvas', query: { laneId: lane._id } })
  } catch {
    // API unavailable (BYPASS_AUTH mode) — proceed without a server lane ID
    localStorage.setItem('routeData', JSON.stringify(routeData))
    router.push({ name: 'RouteCanvas' })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* ── Page shell ── */
.create-page { display: flex; height: 100%; }

/* ── Left info panel ── */
.info-panel {
  width: 272px; flex-shrink: 0; background: var(--primary);
  position: relative; overflow: hidden;
}
.info-panel::before {
  content: ''; position: absolute; top: -90px; right: -90px; width: 260px; height: 260px;
  border-radius: 50%; background: rgba(255,255,255,.06); pointer-events: none;
}
.info-panel::after {
  content: ''; position: absolute; bottom: -110px; left: -60px; width: 320px; height: 320px;
  border-radius: 50%; background: rgba(255,255,255,.04); pointer-events: none;
}
.info-content { padding: 52px 32px; position: relative; z-index: 1; }

.step-pill {
  display: inline-block; padding: 4px 12px; background: rgba(255,255,255,.15); border-radius: 999px;
  color: rgba(255,255,255,.9); font-size: 11px; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase; margin-bottom: 20px;
}
.panel-title { font-size: 22px; font-weight: 700; color: white; margin: 0 0 12px; line-height: 1.25; }
.panel-desc  { color: rgba(255,255,255,.7); font-size: 13px; line-height: 1.65; margin: 0 0 44px; }

/* Timeline */
.timeline { display: flex; flex-direction: column; }
.tl-item  { display: flex; gap: 14px; align-items: flex-start; }
.tl-icon  { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; padding-top: 2px; }

.tl-dot         { width: 10px; height: 10px; border-radius: 50%; background: white; }
.tl-dot.pending { background: transparent; border: 2px solid rgba(255,255,255,.4); }
.tl-dot.active  { background: white; box-shadow: 0 0 0 3px rgba(255,255,255,.25); }
.tl-dot.done    { background: rgba(255,255,255,.5); }

.tl-line { width: 1.5px; height: 36px; background: rgba(255,255,255,.2); margin: 5px 0; }
.tl-text strong { display: block; color: white; font-size: 13px; font-weight: 600; line-height: 1; margin-bottom: 4px; }
.tl-text span   { font-size: 12px; color: rgba(255,255,255,.55); }

/* Risk score preview in panel */
.panel-score { margin-top: 28px; display: flex; flex-direction: column; gap: 6px; }
.panel-score-badge {
  display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px;
  border-radius: 7px; font-size: 12px; font-weight: 700; letter-spacing: .03em; width: fit-content;
}
.panel-score-badge.COMPLIANT     { background: rgba(220,252,231,.9); color: #15803d; }
.panel-score-badge.CONDITIONAL   { background: rgba(255,251,235,.9); color: #b45309; }
.panel-score-badge.NON-COMPLIANT { background: rgba(254,242,242,.9); color: #dc2626; }
.panel-score-badge.CRITICAL      { background: rgba(254,242,242,.9); color: #991b1b; }
.panel-score-frac { opacity: .75; }
.panel-score-label { font-size: 11px; color: rgba(255,255,255,.6); }

/* ── Right form panel ── */
.form-panel { flex: 1; overflow: hidden; background: var(--bg-color); display: flex; flex-direction: column; }
.form-scroll { flex: 1; overflow-y: auto; padding: 12px 56px; display: flex; flex-direction: column; }
.form-inner  { width: 100%; max-width: 920px; margin: auto; display: flex; flex-direction: column; gap: 16px; }

.form-footer {
  flex-shrink: 0;
  border-top: 1px solid var(--border-color);
  background: var(--bg-color);
  padding: 10px 56px;
  box-shadow: 0 -4px 16px rgba(0,0,0,0.05);
}

/* ── Cards ── */
.card {
  background: var(--surface-color); border: 1px solid var(--border-color); border-radius: 20px;
  padding: 24px 32px; box-shadow: var(--shadow-sm); display: flex; flex-direction: column;
  gap: 18px; transition: border-color .2s, box-shadow .2s;
}
.card.card-error { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,.1); }
.required-star   { color: #ef4444; font-size: 14px; line-height: 1; }
.error-msg {
  font-size: 12px; font-weight: 500; color: #ef4444; display: flex; align-items: center; gap: 5px; margin-top: -8px;
}
.error-msg::before {
  content: '!'; display: inline-flex; align-items: center; justify-content: center;
  width: 15px; height: 15px; border-radius: 50%; background: #ef4444; color: white;
  font-size: 10px; font-weight: 700; flex-shrink: 0;
}
.inp.inp-error { border-color: #ef4444; background: #fff5f5; }
.inp.inp-error:focus { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,.12); }

.card-header { display: flex; gap: 14px; align-items: flex-start; }
.card-num {
  font-size: 11px; font-weight: 800; color: var(--primary); background: var(--primary-glow);
  padding: 4px 8px; border-radius: 6px; letter-spacing: .06em; flex-shrink: 0; margin-top: 1px;
}
.card-title { font-size: 16px; font-weight: 700; color: var(--text-main); }
.card-hint  { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

/* ── Two-panel row ── */
.two-panels { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

/* ── Product type grid ── */
.product-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
.product-card {
  display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 22px 12px;
  border: 1.5px solid var(--border-color); border-radius: 16px; cursor: pointer;
  transition: all var(--transition-fast); user-select: none; text-align: center; background: #fafbfc;
}
.product-card input[type="radio"] { display: none; }
.product-card:hover { border-color: var(--primary); background: white; transform: translateY(-2px); box-shadow: var(--shadow-md); }
.product-card.active { border-color: var(--primary); background: white; box-shadow: 0 0 0 3px var(--primary-glow); }
.p-icon  { font-size: 34px; }
.p-label { font-size: 13px; font-weight: 600; color: var(--text-muted); line-height: 1.3; }
.product-card.active .p-label { color: var(--primary); }

/* ── Form groups / inputs ── */
.fg { display: flex; flex-direction: column; gap: 6px; }
.fg label { font-size: 12px; font-weight: 600; color: var(--text-main); display: flex; align-items: center; gap: 4px; }
.unit { font-size: 11px; font-weight: 400; color: var(--text-muted); }
.inp {
  width: 100%; padding: 9px 12px; border: 1.5px solid var(--border-color); border-radius: 10px;
  font-size: 14px; color: var(--text-main); transition: all var(--transition-fast);
  box-sizing: border-box; font-family: inherit; background: #fafbfc;
}
.inp:focus { outline: none; border-color: var(--primary); background: white; box-shadow: 0 0 0 3px var(--primary-glow); }
.inp::placeholder { color: #cbd5e1; }
.dims-row { display: flex; align-items: flex-end; gap: 8px; }
.dims-row .fg { flex: 1; }
.dim-sep { font-size: 15px; color: var(--text-muted); padding-bottom: 11px; flex-shrink: 0; user-select: none; }
.inline-row { display: flex; gap: 12px; }
.inline-row .fg { flex: 1; }

/* ── Fragile toggle ── */
.fragile-btn {
  display: flex; align-items: center; gap: 12px; padding: 8px 12px; border: 1.5px solid var(--border-color);
  border-radius: 8px; background: #fafbfc; cursor: pointer; transition: all var(--transition-fast);
  width: 100%; box-sizing: border-box; font-family: inherit;
}
.fragile-btn.on { border-color: #f59e0b; background: #fffbeb; }
.toggle-track { width: 34px; height: 19px; background: #d1d5db; border-radius: 999px; position: relative; transition: background var(--transition-fast); flex-shrink: 0; }
.fragile-btn.on .toggle-track { background: #f59e0b; }
.toggle-thumb { position: absolute; top: 2px; left: 2px; width: 15px; height: 15px; background: white; border-radius: 50%; transition: transform var(--transition-fast); box-shadow: 0 1px 3px rgba(0,0,0,.2); }
.fragile-btn.on .toggle-thumb { transform: translateX(15px); }
.fragile-text { font-size: 13px; color: var(--text-main); font-weight: 500; }

/* ── Certificates ── */
.cert-chips { display: flex; flex-wrap: wrap; gap: 10px; }
.cert-chip {
  display: flex; align-items: center; gap: 8px; padding: 7px 16px; border: 1.5px solid var(--border-color);
  border-radius: 999px; cursor: pointer; transition: all var(--transition-fast); user-select: none; background: #fafbfc;
}
.cert-chip:hover { border-color: var(--primary); background: white; }
.cert-chip:has(input:checked) { border-color: var(--primary); background: var(--primary-glow); }
.cert-chip input[type="checkbox"] { width: 14px; height: 14px; accent-color: var(--primary); cursor: pointer; flex-shrink: 0; }
.cert-chip span { font-size: 14px; font-weight: 600; color: var(--text-main); }

.cert-guidance { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding-top: 4px; }
.cert-guidance-label { font-size: 12px; color: var(--text-muted); white-space: nowrap; }
.cert-guidance-tag {
  font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px;
  background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; transition: all .13s;
}
.cert-guidance-tag.selected { background: #dcfce7; color: #15803d; border-color: #86efac; }

/* ══════════════════════════════════════════════════════
   RISK REVIEW STEP
   ══════════════════════════════════════════════════════ */

/* Route summary card */
.review-summary-card { gap: 10px; background: linear-gradient(135deg, #f8fafc, #f1f5f9); }
.rr-route {
  display: flex; align-items: center; gap: 12px; font-size: 18px; font-weight: 700; color: #0f172a;
}
.rr-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.rr-pt {
  display: inline-flex; height: 22px; padding: 0 10px; border-radius: 5px; align-items: center;
  font-size: 11.5px; font-weight: 600; background: #dcfce7; color: #15803d; border: 1px solid #86efac;
}
.rr-temp {
  font-size: 12px; font-weight: 600; color: #2563eb; background: #dbeafe; padding: 2px 8px;
  border-radius: 5px; border: 1px solid #bfdbfe;
}
.rr-fragile {
  font-size: 12px; font-weight: 600; color: #d97706; background: #fffbeb; padding: 2px 8px;
  border-radius: 5px; border: 1px solid #fde68a;
}
.rr-certs { font-size: 12px; color: #64748b; }

/* Warning banner */
.review-warning {
  display: flex; gap: 12px; align-items: flex-start; padding: 14px 20px; border-radius: 12px;
  background: #fffbeb; border: 1px solid #fde68a; color: #92400e;
}
.review-warning svg { flex-shrink: 0; margin-top: 1px; color: #d97706; }
.review-warning-text { display: flex; flex-direction: column; gap: 3px; }
.review-warning-text strong { font-size: 13.5px; font-weight: 600; }
.review-warning-text span   { font-size: 12.5px; color: #78350f; line-height: 1.4; }

/* Checks card */
.review-checks-card { gap: 0; padding: 0; overflow: hidden; }
.rr-checks-hdr {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 24px; border-bottom: 1px solid var(--border-color);
}
.rr-checks-title { font-size: 15px; font-weight: 600; color: var(--text-main); }
.rr-score-badge {
  display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 5px;
  font-size: 11px; font-weight: 700; letter-spacing: .02em; border: 1px solid;
}
.rr-score-badge.COMPLIANT     { background: #dcfce7; color: #15803d; border-color: #86efac; }
.rr-score-badge.CONDITIONAL   { background: #fffbeb; color: #b45309; border-color: #fde68a; }
.rr-score-badge.NON-COMPLIANT { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
.rr-score-badge.CRITICAL      { background: #fef2f2; color: #991b1b; border-color: #ef4444; }

.rr-checks-list { display: flex; flex-direction: column; }
.rr-check-row {
  display: flex; gap: 14px; padding: 14px 24px; border-bottom: 1px solid #f1f3f6; align-items: flex-start;
  transition: background .1s;
}
.rr-check-row:last-child { border-bottom: none; }
.rr-check-row:hover { background: #fafbfc; }
.rr-check-icon {
  width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 1px;
}
.rr-check-row.pass .rr-check-icon { background: #dcfce7; color: #16a34a; }
.rr-check-row.fail .rr-check-icon { background: #fef2f2; color: #dc2626; }
.rr-check-body  { display: flex; flex-direction: column; gap: 3px; }
.rr-check-label { font-size: 13.5px; font-weight: 600; color: var(--text-main); }
.rr-check-row.fail .rr-check-label { color: #b91c1c; }
.rr-check-detail { font-size: 12.5px; color: var(--text-muted); line-height: 1.5; }

/* Recommendations card */
.review-recs-card { gap: 12px; }
.rr-recs-hdr { display: flex; align-items: center; gap: 7px; font-size: 13.5px; font-weight: 600; color: #2563eb; }
.rr-recs-list { margin: 0; padding: 0 0 0 20px; display: flex; flex-direction: column; gap: 6px; }
.rr-recs-list li { font-size: 13px; color: var(--text-muted); line-height: 1.5; }

/* ── Actions ── */
.actions { max-width: 920px; margin: 0 auto; display: flex; justify-content: flex-end; gap: 12px; }

.btn-ghost {
  padding: 11px 24px; background: white; border: 1.5px solid var(--border-color);
  color: var(--text-muted); border-radius: 8px; font-weight: 500; font-size: 14px;
  cursor: pointer; transition: all var(--transition-fast); font-family: inherit;
}
.btn-ghost:hover { background: #f8fafc; color: var(--text-main); border-color: #cbd5e1; }

.btn-primary {
  padding: 11px 28px; background: var(--primary); color: white; border: none; border-radius: 8px;
  font-weight: 600; font-size: 14px; cursor: pointer; transition: all var(--transition-fast);
  box-shadow: 0 4px 12px var(--primary-glow); font-family: inherit;
}
.btn-primary:hover { background: var(--primary-light); transform: translateY(-1px); box-shadow: 0 8px 16px var(--primary-glow); }

/* ── Responsive ── */
@media (max-width: 960px) {
  .info-panel { display: none; }
  .form-scroll { padding: 28px 24px 20px; }
  .form-footer { padding: 14px 24px; }
  .two-panels { grid-template-columns: 1fr; }
  .form-inner { max-width: 100%; }
}
@media (max-width: 560px) {
  .product-grid { grid-template-columns: repeat(2,1fr); }
  .dims-row { flex-wrap: wrap; }
  .dim-sep  { display: none; }
}

/* ── City autocomplete ── */
.city-ac-wrap { position: relative; }
.city-drop {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 200;
  background: white; border: 1.5px solid var(--border-color); border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12); overflow: hidden; max-height: 280px; overflow-y: auto;
}
.city-item {
  display: flex; align-items: center; gap: 8px; padding: 10px 14px; cursor: pointer;
  transition: background 0.1s; border-bottom: 1px solid #f8fafc;
}
.city-item:last-child { border-bottom: none; }
.city-item:hover { background: #f0fdf4; }
.ci-city   { font-size: 14px; font-weight: 600; color: var(--text-main); flex: 0 0 auto; }
.ci-meta   { font-size: 12px; color: #64748b; flex: 1; }
.ci-region { font-size: 10px; font-weight: 600; color: #94a3b8; text-transform: uppercase;
             letter-spacing: 0.06em; flex-shrink: 0; }

.temp-blocks { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.temp-block {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 16px 10px; border: 1.5px solid var(--border-color); border-radius: 14px;
  background: #fafbfc; cursor: pointer; transition: all var(--transition-fast);
  font-family: inherit; text-align: center;
}
.temp-block:hover { border-color: #94a3b8; background: white; transform: translateY(-1px); }
.temp-block.active { background: white; box-shadow: 0 0 0 3px rgba(31,122,92,0.12); }
.tb-icon  { font-size: 28px; }
.tb-label { font-size: 13px; font-weight: 700; color: var(--text-main); }
.tb-sub   { font-size: 11px; color: var(--text-muted); }
</style>
