<template>
  <div class="settings-page">
    <!-- HEADER -->
    <div class="page-header">
      <h1 class="page-title">Settings</h1>
      <p class="page-desc">Customize your experience and manage application preferences</p>
    </div>

    <!-- SETTINGS GRID -->
    <div class="settings-grid">

      <!-- GENERAL SETTINGS -->
      <div class="card">
        <div class="card-header">
          <span class="card-icon">⚙️</span>
          <h2 class="card-title">General</h2>
        </div>
        <div class="card-content">
          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Language</label>
              <p class="setting-desc">Choose your preferred language</p>
            </div>
            <select class="setting-select">
              <option>English</option>
              <option>Français</option>
              <option>Deutsch</option>
              <option>Nederlands</option>
            </select>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Timezone</label>
              <p class="setting-desc">Set your local timezone</p>
            </div>
            <select class="setting-select">
              <option>Europe/Brussels (GMT+1)</option>
              <option>Europe/Amsterdam (GMT+1)</option>
              <option>Europe/London (GMT+0)</option>
              <option>Europe/Paris (GMT+1)</option>
            </select>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Theme</label>
              <p class="setting-desc">Choose light or dark mode</p>
            </div>
            <div class="theme-toggle">
              <button class="theme-btn active">☀️ Light</button>
              <button class="theme-btn">🌙 Dark</button>
            </div>
          </div>
        </div>
      </div>

      <!-- NOTIFICATIONS SETTINGS -->
      <div class="card">
        <div class="card-header">
          <span class="card-icon">🔔</span>
          <h2 class="card-title">Notifications</h2>
        </div>
        <div class="card-content">
          <div class="setting-toggle">
            <div class="setting-info">
              <label class="setting-label">Email Notifications</label>
              <p class="setting-desc">Receive important updates via email</p>
            </div>
            <input type="checkbox" class="toggle-checkbox" checked>
            <span class="toggle-slider"></span>
          </div>

          <div class="setting-toggle">
            <div class="setting-info">
              <label class="setting-label">Compliance Alerts</label>
              <p class="setting-desc">Get notified of compliance issues</p>
            </div>
            <input type="checkbox" class="toggle-checkbox" checked>
            <span class="toggle-slider"></span>
          </div>

          <div class="setting-toggle">
            <div class="setting-info">
              <label class="setting-label">Lane Updates</label>
              <p class="setting-desc">Status changes on active lanes</p>
            </div>
            <input type="checkbox" class="toggle-checkbox" checked>
            <span class="toggle-slider"></span>
          </div>

          <div class="setting-toggle">
            <div class="setting-info">
              <label class="setting-label">Weekly Digest</label>
              <p class="setting-desc">Weekly summary of your lanes</p>
            </div>
            <input type="checkbox" class="toggle-checkbox">
            <span class="toggle-slider"></span>
          </div>
        </div>
      </div>

      <!-- DATA & PRIVACY -->
      <div class="card">
        <div class="card-header">
          <span class="card-icon">🔒</span>
          <h2 class="card-title">Data & Privacy</h2>
        </div>
        <div class="card-content">
          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Data Export</label>
              <p class="setting-desc">Download all your lane data</p>
            </div>
            <button class="btn-secondary">Export</button>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Privacy Policy</label>
              <p class="setting-desc">View our data privacy practices</p>
            </div>
            <button class="btn-secondary">Read</button>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Data Retention</label>
              <p class="setting-desc">Archived lanes kept for 2 years</p>
            </div>
            <span class="setting-badge">2 years</span>
          </div>
        </div>
      </div>

      <!-- INTEGRATIONS -->
      <div class="card">
        <div class="card-header">
          <span class="card-icon">🔗</span>
          <h2 class="card-title">Integrations</h2>
        </div>
        <div class="card-content">
          <div class="integration-item">
            <div class="integration-logo">📊</div>
            <div class="integration-info">
              <h4>Analytics Tools</h4>
              <p>Connect your analytics platform</p>
            </div>
            <button class="btn-secondary">Connect</button>
          </div>

          <div class="integration-item">
            <div class="integration-logo">📧</div>
            <div class="integration-info">
              <h4>Email Provider</h4>
              <p>Connect email notifications</p>
            </div>
            <button class="btn-secondary">Connected ✓</button>
          </div>

          <div class="integration-item">
            <div class="integration-logo">☁️</div>
            <div class="integration-info">
              <h4>Cloud Storage</h4>
              <p>Backup your data automatically</p>
            </div>
            <button class="btn-secondary">Configure</button>
          </div>
        </div>
      </div>

      <!-- SUPPORT & HELP -->
      <div class="card">
        <div class="card-header">
          <span class="card-icon">❓</span>
          <h2 class="card-title">Support & Help</h2>
        </div>
        <div class="card-content">
          <div class="help-item">
            <div class="help-info">
              <label class="setting-label">Documentation</label>
              <p class="setting-desc">Read our complete user guide</p>
            </div>
            <button class="btn-secondary">Visit</button>
          </div>

          <div class="help-item">
            <div class="help-info">
              <label class="setting-label">Contact Support</label>
              <p class="setting-desc">Email: support@4viso.com</p>
            </div>
            <button class="btn-secondary">Contact</button>
          </div>

          <div class="help-item">
            <div class="app-version">
              <label class="setting-label">App Version</label>
              <p class="setting-desc">v1.0.0 (Latest)</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ACCOUNT ACTIONS -->
      <div class="card danger-card">
        <div class="card-header">
          <span class="card-icon">⚠️</span>
          <h2 class="card-title">Account Actions</h2>
        </div>
        <div class="card-content">
          <div class="action-item">
            <div class="action-info">
              <label class="setting-label">Reset Password</label>
              <p class="setting-desc">Reset your account password</p>
            </div>
            <button class="btn-warning">Reset</button>
          </div>

          <div class="action-item danger-action">
            <div class="action-info">
              <label class="setting-label">Delete Account</label>
              <p class="setting-desc">Permanently delete your account and all data</p>
            </div>
            <button class="btn-danger">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.settings-page {
  padding: 40px 60px;
}

.page-header {
  margin-bottom: 32px;
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

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
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
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid var(--border-color);
}

.card-icon {
  font-size: 20px;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
}

.card-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Settings Items */
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

.setting-info {
  flex: 1;
}

.setting-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 2px;
}

.setting-desc {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
}

.setting-select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: white;
  font-size: 12px;
  color: var(--text-main);
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
}

.theme-toggle {
  display: flex;
  gap: 8px;
}

.theme-btn {
  padding: 8px 12px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.theme-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

/* Toggle Settings */
.setting-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  position: relative;
}

.toggle-checkbox {
  appearance: none;
  width: 44px;
  height: 24px;
  background: #ccc;
  border-radius: 12px;
  cursor: pointer;
  outline: none;
  transition: background 0.3s;
  position: relative;
}

.toggle-checkbox:checked {
  background: var(--primary);
}

.toggle-checkbox::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  top: 2px;
  left: 2px;
  transition: left 0.3s;
}

.toggle-checkbox:checked::after {
  left: 22px;
}

/* Buttons */
.btn-secondary {
  padding: 8px 16px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  white-space: nowrap;
}

.btn-secondary:hover {
  background: rgba(0, 0, 0, 0.02);
  border-color: var(--primary);
  color: var(--primary);
}

.btn-warning {
  padding: 8px 16px;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  color: #ffc107;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-warning:hover {
  background: rgba(255, 193, 7, 0.2);
}

.btn-danger {
  padding: 8px 16px;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  color: #f44336;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-danger:hover {
  background: rgba(244, 67, 54, 0.2);
}

/* Integrations */
.integration-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

.integration-logo {
  font-size: 24px;
  width: 40px;
  text-align: center;
  flex-shrink: 0;
}

.integration-info {
  flex: 1;
}

.integration-info h4 {
  margin: 0 0 2px 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
}

.integration-info p {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
}

/* Help Items */
.help-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

.help-info {
  flex: 1;
}

.app-version {
  flex: 1;
}

/* Danger Card */
.danger-card {
  border-color: rgba(244, 67, 54, 0.3);
  background: rgba(244, 67, 54, 0.02);
}

.danger-card .card-header {
  background: rgba(244, 67, 54, 0.05);
  border-bottom-color: rgba(244, 67, 54, 0.2);
}

.action-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

.danger-action {
  background: rgba(244, 67, 54, 0.05);
}

.action-info {
  flex: 1;
}

.setting-badge {
  padding: 6px 12px;
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}
</style>
