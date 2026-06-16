<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="icon-wrap">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
      </div>
      <h2>Check your email</h2>
      <p v-if="email">We sent a confirmation link to <strong>{{ email }}</strong>.</p>
      <p v-else>We sent a confirmation link to your email address.</p>
      <p class="sub">Click the link in the email to activate your account, then come back to log in.</p>
      <router-link to="/login" class="btn-login">Go to Login</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
const email = useRoute().query.email as string | undefined
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
  max-width: 420px;
  padding: 48px 40px;
  border-radius: 24px;
  box-shadow: var(--shadow-float);
  border: 1px solid var(--border-color);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #dcfce7;
  color: #1f6f54;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

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

p strong { color: var(--text-main); }

.sub { font-size: 13px; }

.btn-login {
  display: inline-block;
  margin-top: 12px;
  padding: 11px 32px;
  background: var(--primary);
  color: white;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  transition: background 0.15s;
}

.btn-login:hover { background: var(--primary-light); }
</style>
