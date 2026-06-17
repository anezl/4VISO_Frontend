<template>
  <div class="profile-page">
    <!-- HEADER -->
    <div class="page-header">
      <h1 class="page-title">My Profile</h1>
      <p class="page-desc">Manage your personal and company information</p>
    </div>

    <div class="profile-layout">
      <!-- PROFILE CARD -->
      <div class="card profile-card">
        <div class="card-header">
          <span class="card-num">01</span>
          <h2 class="card-title">Personal Information</h2>
        </div>
        <div class="card-content">
          <div class="avatar-section">
            <div class="avatar-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div class="profile-info">
              <h3 class="user-name">{{ currentUser?.name || '—' }}</h3>
              <p class="user-role">{{ currentUser?.role || '—' }}</p>
              <p class="user-email">{{ currentUser?.email || '—' }}</p>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Phone</span>
              <span class="info-value">+32 (0)2 123 45 67</span>
            </div>
            <div class="info-item">
              <span class="info-label">Country</span>
              <span class="info-value">Belgium</span>
            </div>
            <div class="info-item">
              <span class="info-label">Member Since</span>
              <span class="info-value">March 2024</span>
            </div>
            <div class="info-item">
              <span class="info-label">Department</span>
              <span class="info-value">Supply Chain</span>
            </div>
          </div>

          <button class="btn-edit">Edit Profile</button>
        </div>
      </div>

      <!-- COMPANY INFO -->
      <div class="card company-card">
        <div class="card-header">
          <span class="card-num">02</span>
          <h2 class="card-title">Company Information</h2>
        </div>
        <div class="card-content">
          <div class="company-badge">
            <span class="company-icon">🏢</span>
            <div>
              <h3 class="company-name">PharmaBe</h3>
              <p class="company-type">Pharmaceutical Distribution</p>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Company ID</span>
              <span class="info-value">BE-2024-0847</span>
            </div>
            <div class="info-item">
              <span class="info-label">Location</span>
              <span class="info-value">Mechelen, Belgium</span>
            </div>
            <div class="info-item">
              <span class="info-label">Employees</span>
              <span class="info-value">250+</span>
            </div>
            <div class="info-item">
              <span class="info-label">Industry</span>
              <span class="info-value">Pharmaceuticals</span>
            </div>
          </div>

          <div class="certifications-list">
            <p class="list-label">Company Certifications:</p>
            <div class="cert-items">
              <span class="cert-item">✓ GDP</span>
              <span class="cert-item">✓ ISO 9001</span>
              <span class="cert-item">✓ ISO 13485</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ACCOUNT SETTINGS -->
      <div class="card account-card">
        <div class="card-header">
          <span class="card-num">03</span>
          <h2 class="card-title">Account & Security</h2>
        </div>
        <div class="card-content">
          <div class="security-section">
            <div class="security-item">
              <div class="security-icon">🔐</div>
              <div>
                <h4>Password</h4>
                <p>Last changed 45 days ago</p>
              </div>
              <button class="btn-secondary">Change</button>
            </div>

            <div class="security-item">
              <div class="security-icon">📱</div>
              <div>
                <h4>Two-Factor Authentication</h4>
                <p>Disabled</p>
              </div>
              <button class="btn-secondary">Enable</button>
            </div>

            <div class="security-item">
              <div class="security-icon">🌐</div>
              <div>
                <h4>Active Sessions</h4>
                <p>1 session active</p>
              </div>
              <button class="btn-secondary">Manage</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getAuthUser } from '@/services/api'

const currentUser = computed(() => getAuthUser())
</script>

<style scoped>
.profile-page {
  padding: 40px 60px;
}

.page-header {
  margin-bottom: 36px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 8px 0;
}

.page-desc {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}

.profile-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.card {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid var(--border-color);
}

.card-num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--primary);
  color: white;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
}

.card-content {
  padding: 24px;
}

/* Profile Card */
.avatar-section {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--primary-glow);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.profile-info {
  flex: 1;
}

.user-name {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main);
}

.user-role {
  margin: 0 0 2px 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
}

.user-email {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.info-value {
  font-size: 14px;
  color: var(--text-main);
  font-weight: 500;
}

.btn-edit {
  width: 100%;
  padding: 10px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-edit:hover {
  background: var(--primary-light);
  transform: translateY(-1px);
}

/* Company Card */
.company-badge {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.company-icon {
  font-size: 32px;
}

.company-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
}

.company-type {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
}

.certifications-list {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.list-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 10px 0;
}

.cert-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cert-item {
  display: inline-block;
  padding: 6px 12px;
  background: rgba(76, 175, 80, 0.12);
  color: #4caf50;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

/* Account Card */
.security-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.security-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

.security-icon {
  font-size: 20px;
  width: 40px;
  text-align: center;
  flex-shrink: 0;
}

.security-item > div {
  flex: 1;
}

.security-item h4 {
  margin: 0 0 2px 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
}

.security-item p {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
}

.btn-secondary {
  padding: 6px 14px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-secondary:hover {
  background: rgba(0, 0, 0, 0.02);
  border-color: var(--primary);
  color: var(--primary);
}
</style>
