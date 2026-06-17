<template>
  <div class="co-page">

    <!-- ── HEADER ── -->
    <header class="co-header">
      <div class="co-hdr-left">
        <h1 class="co-title">Company Directory</h1>
        <span class="co-count-pill">{{ displayed.length }}</span>
      </div>
      <div class="co-hdr-right">
        <div class="co-search-wrap">
          <svg class="co-s-ico" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search companies, countries, certificates…"
            class="co-search-inp"
          />
          <button v-if="searchQuery" class="co-clear-btn" @click="searchQuery = ''">×</button>
        </div>
        <div class="co-type-filters">
          <button
            v-for="f in typeFilters"
            :key="f.value"
            class="co-tf-btn"
            :class="{ active: typeFilter === f.value }"
            @click="typeFilter = f.value"
          >{{ f.label }}</button>
        </div>
      </div>
    </header>

    <!-- ── GRID ── -->
    <div class="co-grid">
      <div
        v-for="company in displayed"
        :key="company.id + '-' + company._type"
        class="co-card"
      >
        <!-- Top section -->
        <div class="co-card-top">
          <div class="co-name-row">
            <span class="co-name">{{ company.name }}</span>
            <span class="co-type-badge" :class="'ctb-' + company._type">{{ typeBadge(company._type) }}</span>
            <div class="co-countries">
              <span
                v-for="cc in (company.countries || (company.country ? [company.country] : []))"
                :key="cc"
                class="co-country-tag"
              >{{ cc }}</span>
            </div>
          </div>
          <div class="co-certs" v-if="company.certificates && company.certificates.length">
            <span
              v-for="cert in company.certificates"
              :key="certName(cert)"
              class="co-cert-chip"
              :class="certChipClass(cert)"
              :title="certChipTitle(cert)"
            >
              {{ certName(cert) }}
              <span v-if="certStatus(cert) === 'expired'" class="co-cert-status-tag co-cert-status-expired">✗ expired</span>
              <span v-else-if="certStatus(cert) === 'expiring'" class="co-cert-status-tag co-cert-status-expiring">⚠ {{ certShortExpiry(cert) }}</span>
            </span>
          </div>
          <div class="co-certs" v-else>
            <span class="co-cert-chip co-cert-none">No certifications</span>
          </div>
        </div>

        <!-- Scores section -->
        <div class="co-scores" v-if="getScores(company._key)">
          <!-- Temperature -->
          <div class="co-score-col">
            <div class="co-score-metric">
              <span class="co-score-icon">🌡️</span>
              <span class="co-score-label">Temperature</span>
            </div>
            <div class="co-score-num" :style="{ color: scoreColor(getScores(company._key).temp.score) }">
              {{ getScores(company._key).temp.score }}
            </div>
            <div
              class="co-score-lbl"
              :style="{ color: scoreColor(getScores(company._key).temp.score) }"
            >{{ scoreLabel(getScores(company._key).temp.score) }}</div>
            <div class="co-score-bar-wrap">
              <div
                class="co-score-bar-fill"
                :style="{
                  width: getScores(company._key).temp.score + '%',
                  background: scoreColor(getScores(company._key).temp.score)
                }"
              ></div>
            </div>
            <div
              class="co-score-reason"
              :title="getScores(company._key).temp.reason"
            >{{ getScores(company._key).temp.reason }}</div>
          </div>
          <!-- Physical Damage -->
          <div class="co-score-col">
            <div class="co-score-metric">
              <span class="co-score-icon">📦</span>
              <span class="co-score-label">Physical</span>
            </div>
            <div class="co-score-num" :style="{ color: scoreColor(getScores(company._key).damage.score) }">
              {{ getScores(company._key).damage.score }}
            </div>
            <div
              class="co-score-lbl"
              :style="{ color: scoreColor(getScores(company._key).damage.score) }"
            >{{ scoreLabel(getScores(company._key).damage.score) }}</div>
            <div class="co-score-bar-wrap">
              <div
                class="co-score-bar-fill"
                :style="{
                  width: getScores(company._key).damage.score + '%',
                  background: scoreColor(getScores(company._key).damage.score)
                }"
              ></div>
            </div>
            <div
              class="co-score-reason"
              :title="getScores(company._key).damage.reason"
            >{{ getScores(company._key).damage.reason }}</div>
          </div>
          <!-- Timeliness -->
          <div class="co-score-col">
            <div class="co-score-metric">
              <span class="co-score-icon">⏱</span>
              <span class="co-score-label">Timeliness</span>
            </div>
            <div class="co-score-num" :style="{ color: scoreColor(getScores(company._key).time.score) }">
              {{ getScores(company._key).time.score }}
            </div>
            <div
              class="co-score-lbl"
              :style="{ color: scoreColor(getScores(company._key).time.score) }"
            >{{ scoreLabel(getScores(company._key).time.score) }}</div>
            <div class="co-score-bar-wrap">
              <div
                class="co-score-bar-fill"
                :style="{
                  width: getScores(company._key).time.score + '%',
                  background: scoreColor(getScores(company._key).time.score)
                }"
              ></div>
            </div>
            <div
              class="co-score-reason"
              :title="getScores(company._key).time.reason"
            >{{ getScores(company._key).time.reason }}</div>
          </div>
        </div>

        <!-- No data fallback -->
        <div class="co-scores co-scores-nodata" v-else>
          <div class="co-score-col co-nodata-col">
            <div class="co-score-metric">
              <span class="co-score-icon">🌡️</span>
              <span class="co-score-label">Temperature</span>
            </div>
            <div class="co-nodata-label">No data</div>
          </div>
          <div class="co-score-col co-nodata-col">
            <div class="co-score-metric">
              <span class="co-score-icon">📦</span>
              <span class="co-score-label">Physical</span>
            </div>
            <div class="co-nodata-label">No data</div>
          </div>
          <div class="co-score-col co-nodata-col">
            <div class="co-score-metric">
              <span class="co-score-icon">⏱</span>
              <span class="co-score-label">Timeliness</span>
            </div>
            <div class="co-nodata-label">No data</div>
          </div>
        </div>

      </div>
    </div>

    <!-- Empty state -->
    <div v-if="displayed.length === 0" class="co-empty">
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <p>No companies match your search.</p>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { TRANSPORT_COMPANIES, WAREHOUSES, AIRPORTS } from '@/data/companies'
import { getScores, scoreLabel, scoreColor, scoreBg } from '@/data/companyScores'
import { certName, certStatus, certStatusText, certDaysRemaining } from '@/data/certUtils'

const searchQuery = ref('')
const typeFilter  = ref('all')

const allCompanies = [
  ...TRANSPORT_COMPANIES.map(c => ({ ...c, _type: 'transport', _key: c.name })),
  ...WAREHOUSES.map(w => ({ ...w, _type: 'warehouse', _key: w.name })),
  ...AIRPORTS.map(a => ({ ...a, _type: 'airport',   _key: a.name })),
]

const displayed = computed(() => {
  let list = allCompanies
  if (typeFilter.value !== 'all') list = list.filter(c => c._type === typeFilter.value)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c._key?.toLowerCase().includes(q) ||
      (c.countries || []).some(cc => cc.toLowerCase().includes(q)) ||
      (c.country ? c.country.toLowerCase().includes(q) : false) ||
      (c.certificates || []).some(cert => certName(cert).toLowerCase().includes(q))
    )
  }
  return list
})

const certChipClass = (cert) => {
  const s = certStatus(cert)
  if (s === 'expired')  return 'co-cert-expired'
  if (s === 'expiring') return 'co-cert-expiring'
  return ''
}

const certChipTitle = (cert) => {
  if (typeof cert === 'string') return cert
  const lines = [`${cert.name}`]
  if (cert.validFrom) lines.push(`Valid from: ${cert.validFrom}`)
  if (cert.validTo)   lines.push(`Valid to: ${cert.validTo}`)
  const txt = certStatusText(cert)
  if (txt) lines.push(txt)
  return lines.join('\n')
}

const certShortExpiry = (cert) => {
  const days = certDaysRemaining(cert)
  if (days === null) return ''
  if (days <= 0)  return 'expired'
  if (days <= 30) return `${days}d`
  return `${Math.round(days / 30)}mo`
}

const typeBadge = (t) => ({ transport: 'Transport', warehouse: 'Warehouse', airport: 'Airport' }[t] || t)
const typeFilters = [
  { value: 'all',       label: 'All' },
  { value: 'transport', label: 'Transport' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'airport',   label: 'Airport' },
]
</script>

<style scoped>
/* ── PAGE ── */
.co-page {
  min-height: 100vh;
  background: #F0F2F5;
  display: flex;
  flex-direction: column;
}

/* ── HEADER ── */
.co-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  height: 68px;
  flex-shrink: 0;
}

.co-hdr-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.co-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.co-count-pill {
  background: #e2e8f0;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: 20px;
}

.co-hdr-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.co-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.co-s-ico {
  position: absolute;
  left: 10px;
  color: #94a3b8;
  pointer-events: none;
}

.co-search-inp {
  padding: 8px 32px 8px 30px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  color: #1e293b;
  background: #f8fafc;
  width: 260px;
  outline: none;
  transition: border-color 0.15s;
}

.co-search-inp:focus {
  border-color: #1F7A5C;
  background: #fff;
}

.co-clear-btn {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  font-size: 16px;
  line-height: 1;
  padding: 0;
}

.co-type-filters {
  display: flex;
  gap: 4px;
}

.co-tf-btn {
  padding: 6px 14px;
  border-radius: 7px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.co-tf-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.co-tf-btn.active {
  background: #1F7A5C;
  color: #fff;
  border-color: #1F7A5C;
}

/* ── GRID ── */
.co-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 16px;
  padding: 24px 32px;
}

/* ── CARD ── */
.co-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07), 0 2px 10px rgba(0,0,0,0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.15s;
}

.co-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06);
}

/* ── CARD TOP ── */
.co-card-top {
  padding: 18px 20px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.co-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.co-name {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
}

/* Type badges */
.co-type-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: 20px;
  white-space: nowrap;
}

.ctb-transport {
  background: #dbeafe;
  color: #1d4ed8;
}

.ctb-warehouse {
  background: #ede9fe;
  color: #7c3aed;
}

.ctb-airport {
  background: #fef3c7;
  color: #b45309;
}

/* Country tags */
.co-countries {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.co-country-tag {
  font-size: 10px;
  font-weight: 600;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 4px;
  padding: 1px 5px;
}

/* Cert chips */
.co-certs {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.co-cert-chip {
  font-size: 11px;
  font-weight: 500;
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
  border-radius: 5px;
  padding: 2px 7px;
}

.co-cert-none {
  background: #f8fafc;
  color: #94a3b8;
  border-color: #e2e8f0;
}

.co-cert-expiring {
  background: #fffbeb;
  color: #92400e;
  border-color: #fde68a;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.co-cert-expired {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fecaca;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.co-cert-status-tag {
  font-size: 9px;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 3px;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.co-cert-status-expired  { background: rgba(185,28,28,0.12); color: #b91c1c; }
.co-cert-status-expiring { background: rgba(146,64,14,0.12);  color: #92400e; }

/* ── SCORES SECTION ── */
.co-scores {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  background: #fafbfc;
  border-top: 1px solid #f1f5f9;
  flex: 1;
}

.co-score-col {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-right: 1px solid #f1f5f9;
}

.co-score-col:last-child {
  border-right: none;
}

.co-score-metric {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 2px;
}

.co-score-icon {
  font-size: 13px;
  line-height: 1;
}

.co-score-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.co-score-num {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.1;
}

.co-score-lbl {
  font-size: 10px;
  font-weight: 600;
  margin-top: -2px;
}

/* Score bar */
.co-score-bar-wrap {
  width: 100%;
  height: 5px;
  background: #e2e8f0;
  border-radius: 99px;
  overflow: hidden;
  margin: 4px 0 3px;
}

.co-score-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.3s ease;
}

/* Reason text */
.co-score-reason {
  font-size: 11px;
  color: #64748b;
  font-style: italic;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  cursor: default;
}

/* No data state */
.co-scores-nodata .co-nodata-col {
  align-items: center;
  justify-content: center;
}

.co-nodata-label {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
  margin-top: 6px;
}

/* ── EMPTY STATE ── */
.co-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 24px;
  color: #94a3b8;
  font-size: 14px;
}

.co-empty p {
  margin: 0;
}
</style>
