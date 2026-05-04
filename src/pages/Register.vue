<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo">4VISO</div>
        <h2>Create an account</h2>
        <p>Join us and start assessing supply chain risks</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="input-group">
          <label>Full Name</label>
          <div class="input-wrapper">
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <input type="text" v-model="name" placeholder="John Doe" required />
          </div>
        </div>

        <div class="input-group">
          <label>Email</label>
          <div class="input-wrapper">
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            <input type="email" v-model="email" placeholder="you@company.com" required />
          </div>
        </div>

        <div class="input-group">
          <label>Password</label>
          <div class="input-wrapper">
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input type="password" v-model="password" placeholder="••••••••" required />
          </div>
        </div>

        <button type="submit" class="submit-btn">
          Sign Up
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </form>

      <div class="auth-footer">
        <p>Already have an account? <router-link to="/login">Sign in</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')

const handleRegister = () => {
  // Mock registration: just redirect to dashboard
  router.push('/')
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top right, var(--primary-glow), transparent 40%),
              radial-gradient(circle at bottom left, rgba(0, 0, 0, 0.05), transparent 40%);
  background-color: var(--bg-color);
}

.auth-card {
  background: var(--surface-color);
  width: 100%;
  max-width: 440px;
  padding: 40px;
  border-radius: 24px;
  box-shadow: var(--shadow-float);
  border: 1px solid var(--border-color);
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  font-size: 28px;
  font-weight: 800;
  color: var(--primary);
  letter-spacing: -1px;
  margin-bottom: 16px;
}

.auth-header h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--text-main);
}

.auth-header p {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-main);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.icon {
  position: absolute;
  left: 16px;
  color: #94a3b8;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 15px;
  transition: all var(--transition-fast);
  background: #f8fafc;
  color: var(--text-main);
}

.input-wrapper input:focus {
  outline: none;
  border-color: var(--primary);
  background: var(--surface-color);
  box-shadow: 0 0 0 4px var(--primary-glow);
}

.submit-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all var(--transition-fast);
  margin-top: 8px;
}

.submit-btn:hover {
  background: var(--primary-light);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--primary-glow);
}

.auth-footer {
  margin-top: 32px;
  text-align: center;
  font-size: 14px;
  color: var(--text-muted);
}

.auth-footer a {
  color: var(--primary);
  font-weight: 600;
  margin-left: 4px;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>
