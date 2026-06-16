<template>
  <div class="auth-container">
    <div class="auth-card">

      <!-- Loading -->
      <template v-if="status === 'loading'">
        <div class="spinner"></div>
        <p>Verifying your email…</p>
      </template>

      <!-- Success -->
      <template v-else-if="status === 'success'">
        <div class="icon-wrap success">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
        <h2>Email confirmed!</h2>
        <p>Your account is now active. You can log in.</p>
        <router-link to="/login" class="btn-primary">Go to Login</router-link>
      </template>

      <!-- Error -->
      <template v-else>
        <div class="icon-wrap error">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
        </div>
        <h2>Verification failed</h2>
        <p>{{ errorMsg }}</p>
        <router-link to="/register" class="btn-primary">Register again</router-link>
      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { apiRequest } from '@/services/api'

const route  = useRoute()
const status   = ref<'loading' | 'success' | 'error'>('loading')
const errorMsg = ref('The link is invalid or has already been used.')

onMounted(async () => {
  const token = route.query.token as string | undefined
  if (!token) {
    status.value = 'error'
    return
  }
  try {
    await apiRequest(`/auth/verify-email?token=${token}`)
    status.value = 'success'
  } catch (err) {
    status.value = 'error'
    if (err instanceof Error) errorMsg.value = err.message
  }
})
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color);
}

.auth-card {
  background: var(--surface-color);
  width: 100%;
  max-width: 400px;
  padding: 48px 40px;
  border-radius: 24px;
  box-shadow: var(--shadow-float);
  border: 1px solid var(--border-color);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.icon-wrap {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.icon-wrap.success { background: #dcfce7; color: #15803d; }
.icon-wrap.error   { background: #fee2e2; color: #991b1b; }

h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

p {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.5;
}

.btn-primary {
  display: inline-block;
  margin-top: 8px;
  padding: 11px 32px;
  background: var(--primary);
  color: white;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  transition: background 0.15s;
}

.btn-primary:hover { background: var(--primary-light); }

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
