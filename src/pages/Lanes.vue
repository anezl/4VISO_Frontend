<template>
  <div class="lanes-page">

    <!-- ── COMPACT HEADER ── -->
    <header class="page-header">
      <div class="hdr-left">
        <h1 class="page-title">Supply Chain Lanes</h1>
        <span class="count-pill">{{ allLanes.length }}</span>
      </div>
      <div class="hdr-right">
        <div class="search-wrap">
          <svg class="s-ico" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input v-model="searchQuery" type="text" placeholder="Search by city…" class="search-inp" />
          <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">×</button>
        </div>
        <button class="btn-new" @click="$router.push('/create')">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          New Lane
        </button>
      </div>
    </header>

    <!-- ── SEARCH CONTEXT ── -->
    <div v-if="searchQuery.trim()" class="search-ctx">
      {{ displayedLanes.length }} result{{ displayedLanes.length !== 1 ? 's' : '' }} for
      <strong>"{{ searchQuery }}"</strong>
    </div>

    <!-- ── EMPTY STATE ── -->
    <div v-if="displayedLanes.length === 0" class="empty-state">
      <div class="empty-icon-wrap">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
      </div>
      <p class="empty-title">{{ searchQuery ? 'No lanes found' : 'No lanes yet' }}</p>
      <p class="empty-sub">{{ searchQuery ? 'Try a different city name.' : 'Create your first supply chain lane to get started.' }}</p>
      <button v-if="!searchQuery" class="btn-empty" @click="$router.push('/create')">New Lane</button>
    </div>

    <!-- ── LANES LIST ── -->
    <div v-else class="lanes-list">
      <article
        v-for="lane in displayedLanes"
        :key="lane.id"
        class="lane-card"
      >
        <div class="card-stripe" :class="productClass(lane.productType)"></div>

        <div class="card-inner">

          <!-- ROW 1: Route cities + product pill + open button -->
          <div class="row-top">
            <div class="route-info">
              <span class="city">{{ lane.origin.city }}</span>
              <svg class="arr-ico" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              <span class="city">{{ lane.destination.city }}</span>
              <span class="product-pill" :class="productClass(lane.productType)">{{ lane.productType }}</span>
            </div>
            <button class="open-btn" @click="$router.push({ path: '/canvas', query: { laneId: lane.id } })">
              Open Lane
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>

          <!-- ROW 2: Meta -->
          <div class="row-meta">
            <span class="meta-companies">{{ lane.origin.company }} → {{ lane.destination.company }}</span>
            <span class="dot-sep">·</span>
            <span class="meta-text">{{ lane.origin.country }} → {{ lane.destination.country }}</span>
            <span class="dot-sep">·</span>
            <span class="meta-text">{{ lane.nodes.length }} nodes</span>
            <span class="dot-sep">·</span>
            <span class="meta-text">{{ formatDate(lane.createdAt) }}</span>
          </div>

          <!-- ROW 3: Transport track -->
          <div class="route-track">
            <template v-for="(node, idx) in laneNodes[lane.id]" :key="node.id">
              <div
                class="track-stop"
                :class="[
                  node.isEllipsis ? 'is-ellipsis' : node.type,
                  { 'is-origin': !node.isEllipsis && idx === 0 },
                  { 'is-dest':   !node.isEllipsis && idx === laneNodes[lane.id].length - 1 },
                ]"
                :title="!node.isEllipsis ? (node.location + (node.company ? ' · ' + node.company : '')) : ''"
              >
                <div class="stop-dot"></div>
                <span class="stop-lbl">{{ node.isEllipsis ? '+' + node.count : node.location }}</span>
              </div>
              <div
                v-if="idx < laneNodes[lane.id].length - 1"
                class="track-line"
                :class="(!node.isEllipsis && node.transport === 'air') ? 'seg-air' : 'seg-ground'"
              ></div>
            </template>
          </div>

          <!-- ROW 4: Certificates -->
          <div class="row-certs">
            <span v-for="cert in lane.certificates" :key="cert" class="cert-tag">{{ cert }}</span>
          </div>

        </div>
      </article>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import lanesData from '@/data/lanes.json'

const router      = useRouter()
const allLanes    = ref(lanesData)
const searchQuery = ref('')

const displayedLanes = computed(() => {
  if (!searchQuery.value.trim()) return allLanes.value
  const q = searchQuery.value.trim().toLowerCase()
  return allLanes.value.filter(l =>
    l.origin.city.toLowerCase().includes(q) ||
    l.destination.city.toLowerCase().includes(q)
  )
})

const laneNodes = computed(() => {
  const result = {}
  allLanes.value.forEach(lane => {
    const nodes = lane.nodes
    if (nodes.length <= 7) {
      result[lane.id] = nodes.map(n => ({ ...n, isEllipsis: false }))
    } else {
      result[lane.id] = [
        ...nodes.slice(0, 4).map(n => ({ ...n, isEllipsis: false })),
        { id: `ellipsis-${lane.id}`, isEllipsis: true, count: nodes.length - 6 },
        ...nodes.slice(-2).map(n => ({ ...n, isEllipsis: false })),
      ]
    }
  })
  return result
})

const productClass = (type) => {
  const map = {
    'Pharmaceutical':  'pharma',
    'Vaccines':        'vaccines',
    'Biological':      'biological',
    'Medical Devices': 'medical',
  }
  return map[type] ?? 'pharma'
}

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
</script>

<style scoped>
/* ─── Page shell ────────────────────────────────────────────── */
.lanes-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background: #f7f8fa;
}

/* ─── Sticky header ─────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 28px;
  height: 56px;
  background: #ffffff;
  border-bottom: 1px solid #eaecf0;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 20;
}

.hdr-left {
  display: flex;
  align-items: center;
  gap: 9px;
}

.page-title {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.15px;
}

.count-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  min-width: 24px;
}

.hdr-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Search */
.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.s-ico {
  position: absolute;
  left: 10px;
  color: #94a3b8;
  pointer-events: none;
}

.search-inp {
  height: 32px;
  padding: 0 28px 0 30px;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  font-size: 12.5px;
  color: #1e293b;
  background: #f8fafc;
  width: 200px;
  transition: width 0.2s, border-color 0.15s, box-shadow 0.15s, background 0.15s;
  font-family: inherit;
}

.search-inp:focus {
  outline: none;
  border-color: var(--primary);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(31, 111, 84, 0.08);
  width: 240px;
}

.search-inp::placeholder { color: #c8d1dc; }

.clear-btn {
  position: absolute;
  right: 7px;
  background: none;
  border: none;
  font-size: 15px;
  color: #94a3b8;
  cursor: pointer;
  line-height: 1;
  padding: 2px 3px;
  border-radius: 4px;
  transition: color 0.1s;
}

.clear-btn:hover { color: #475569; }

/* New Lane button */
.btn-new {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 13px;
  background: #0f172a;
  color: #fff;
  border: none;
  border-radius: 7px;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
  white-space: nowrap;
}

.btn-new:hover { background: #1e293b; }

/* ─── Search context ────────────────────────────────────────── */
.search-ctx {
  padding: 10px 28px 0;
  font-size: 12px;
  color: #64748b;
}

.search-ctx strong { color: #1e293b; font-weight: 600; }

/* ─── Empty state ───────────────────────────────────────────── */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  text-align: center;
}

.empty-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 6px;
}

.empty-sub {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 20px;
  max-width: 300px;
  line-height: 1.5;
}

.btn-empty {
  height: 34px;
  padding: 0 16px;
  background: #0f172a;
  color: #fff;
  border: none;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
}

.btn-empty:hover { background: #1e293b; }

/* ─── Lanes list ────────────────────────────────────────────── */
.lanes-list {
  padding: 16px 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  flex: 1;
}

/* ─── Lane card ─────────────────────────────────────────────── */
.lane-card {
  background: #ffffff;
  border: 1px solid #eaecf0;
  border-radius: 10px;
  display: flex;
  overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.lane-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
}

/* Left accent stripe by product type */
.card-stripe {
  width: 3px;
  flex-shrink: 0;
}
.card-stripe.pharma     { background: #1f6f54; }
.card-stripe.vaccines   { background: #7c3aed; }
.card-stripe.biological { background: #2563eb; }
.card-stripe.medical    { background: #ea580c; }

.card-inner {
  flex: 1;
  padding: 14px 18px 13px;
  display: flex;
  flex-direction: column;
  gap: 9px;
  min-width: 0;
}

/* ─── Row 1: Route title ────────────────────────────────────── */
.row-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.route-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.city {
  font-size: 17px;
  font-weight: 600;
  color: #0f172a;
  letter-spacing: -0.25px;
  white-space: nowrap;
}

.arr-ico {
  color: #c4cbd5;
  flex-shrink: 0;
}

.product-pill {
  display: inline-flex;
  align-items: center;
  height: 19px;
  padding: 0 7px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.03em;
  white-space: nowrap;
  flex-shrink: 0;
}

.product-pill.pharma     { background: #dcfce7; color: #15803d; }
.product-pill.vaccines   { background: #f3e8ff; color: #7c3aed; }
.product-pill.biological { background: #dbeafe; color: #1d4ed8; }
.product-pill.medical    { background: #fff7ed; color: #c2410c; }

.open-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 11px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #fff;
  color: #64748b;
  font-size: 11.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.13s, border-color 0.13s, color 0.13s;
  font-family: inherit;
  white-space: nowrap;
  flex-shrink: 0;
}

.open-btn:hover {
  background: #0f172a;
  border-color: #0f172a;
  color: #fff;
}

/* ─── Row 2: Meta ───────────────────────────────────────────── */
.row-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
}

.meta-companies {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.dot-sep {
  color: #d1d5db;
  font-size: 12px;
  flex-shrink: 0;
  user-select: none;
}

.meta-text {
  font-size: 12px;
  color: #6b7280;
}

/* ─── Row 3: Route track ────────────────────────────────────── */
.route-track {
  display: flex;
  align-items: flex-start;
  overflow: hidden;
  padding: 2px 0;
}

.track-stop {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}

.stop-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #94a3b8;
  flex-shrink: 0;
  transition: transform 0.15s;
}

/* Node type colors */
.track-stop.warehouse .stop-dot { background: #1f6f54; }
.track-stop.airport   .stop-dot { background: #3b82f6; }
.track-stop.hub       .stop-dot { background: #8b5cf6; }

/* Origin: green ring */
.track-stop.is-origin .stop-dot {
  background: #1f6f54;
  box-shadow: 0 0 0 2.5px rgba(31, 111, 84, 0.18);
}

/* Destination: dark ring */
.track-stop.is-dest .stop-dot {
  background: #0f172a;
  box-shadow: 0 0 0 2.5px rgba(15, 23, 42, 0.13);
}

/* Ellipsis stop */
.track-stop.is-ellipsis .stop-dot {
  background: #e2e8f0;
  width: 6px;
  height: 6px;
}

.track-stop.is-ellipsis .stop-lbl {
  font-weight: 600;
  color: #94a3b8;
}

.stop-lbl {
  font-size: 10px;
  color: #9ca3af;
  white-space: nowrap;
  max-width: 68px;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

.lane-card:hover .stop-dot { transform: scale(1.15); }

/* Connector line — aligned to center of 8px dot (margin-top = (8-1.5)/2 = 3.25px) */
.track-line {
  flex: 1;
  height: 1.5px;
  margin-top: 3.25px;
  min-width: 14px;
}

.track-line.seg-ground { background: #e2e8f0; }
.track-line.seg-air {
  background: repeating-linear-gradient(
    90deg,
    #93c5fd 0px,
    #93c5fd 4px,
    transparent 4px,
    transparent 9px
  );
}

/* ─── Row 4: Certificates ───────────────────────────────────── */
.row-certs {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
}

.cert-tag {
  display: inline-flex;
  align-items: center;
  height: 19px;
  padding: 0 7px;
  border-radius: 4px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  font-size: 10.5px;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.02em;
}

/* ─── Responsive ────────────────────────────────────────────── */
@media (max-width: 768px) {
  .page-header    { padding: 0 20px; }
  .lanes-list     { padding: 12px 20px 24px; }
  .city           { font-size: 15px; }
  .search-inp     { width: 160px; }
  .search-inp:focus { width: 190px; }
  .row-meta       { display: none; }
}
</style>
