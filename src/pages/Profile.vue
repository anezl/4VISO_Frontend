<template>
  <div class="profile-page">
    <div class="profile-card">
      <div class="icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      <h2>Authentication Required</h2>
      <p>You need to be logged in to view your profile and manage your account settings.</p>
      
      <div class="action-buttons">
        <button class="login-btn" @click="$router.push('/login')">Log In</button>
        <button class="register-btn" @click="$router.push('/register')">Register</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
}

.profile-card {
  background: var(--surface-color);
  padding: 48px;
  border-radius: 24px;
  max-width: 480px;
  text-align: center;
  box-shadow: var(--shadow-float);
  border: 1px solid var(--border-color);
}

.icon-container {
  width: 80px;
  height: 80px;
  background: var(--primary-glow);
  color: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 12px 0;
}

p {
  color: var(--text-muted);
  font-size: 16px;
  margin: 0 0 32px 0;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

button {
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  flex: 1;
}

.login-btn {
  background: var(--primary);
  color: white;
  border: none;
}

.login-btn:hover {
  background: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--primary-glow);
}

.register-btn {
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
}

.register-btn:hover {
  background: var(--primary-glow);
}
</style>
