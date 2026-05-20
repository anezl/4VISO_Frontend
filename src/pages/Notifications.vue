<template>
  <div class="notifications-page">
    <!-- HEADER -->
    <div class="page-header">
      <div class="header-top">
        <h1 class="page-title">Notifications</h1>
        <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }} new</span>
      </div>
      <p class="page-desc">Stay updated on your lanes, compliance alerts, and system events</p>
    </div>

    <!-- FILTER TABS -->
    <div class="filter-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab"
        class="tab-btn"
        :class="{ active: activeTab === tab }"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
      <button v-if="unreadCount > 0" class="btn-mark-read" @click="markAllRead">
        Mark all as read
      </button>
    </div>

    <!-- NOTIFICATIONS LIST -->
    <div class="notifications-list">
      <div v-if="filteredNotifications.length === 0" class="empty-state">
        <span class="empty-icon">📭</span>
        <p class="empty-msg">No {{ activeTab.toLowerCase() }} notifications</p>
      </div>

      <div 
        v-for="notification in filteredNotifications" 
        :key="notification.id"
        class="notification-card"
        :class="[notification.type, { unread: !notification.read }]"
        @click="notification.read = true"
      >
        <div class="notification-icon">{{ notification.icon }}</div>
        
        <div class="notification-content">
          <h3 class="notification-title">{{ notification.title }}</h3>
          <p class="notification-message">{{ notification.message }}</p>
          
          <div v-if="notification.details" class="notification-details">
            <span v-for="detail in notification.details" :key="detail" class="detail-tag">{{ detail }}</span>
          </div>

          <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
        </div>

        <button v-if="notification.action" class="notification-action" @click.stop="handleNotificationAction(notification)">
          {{ notification.action }}
        </button>

        <div class="notification-status">
          <span v-if="!notification.read" class="status-dot"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const tabs = ['All', 'Alerts', 'Updates', 'System']
const activeTab = ref('All')

const notifications = ref([
  {
    id: 1,
    type: 'alert',
    icon: '⚠️',
    title: 'Non-Compliant Lane Detected',
    message: 'Lane "Madrid → Mechelen" has a node without required GDP certification.',
    details: ['Lane-001', 'Missing: GDP', 'Risk Level: High'],
    timestamp: new Date(Date.now() - 5 * 60000),
    read: false,
    action: 'Review Lane',
  },
  {
    id: 2,
    type: 'alert',
    icon: '🚨',
    title: 'Temperature Control Issue',
    message: 'Node "Barcelona Hub" may not maintain required 2-8°C range. Check HVAC systems.',
    details: ['Barcelona Hub', 'Temperature Range: 2-8°C', 'Status: Warning'],
    timestamp: new Date(Date.now() - 15 * 60000),
    read: false,
    action: 'View Details',
  },
  {
    id: 3,
    type: 'update',
    icon: '✅',
    title: 'Lane Approved',
    message: 'Your lane "Amsterdam → Milan" has been reviewed and approved for use.',
    details: ['Lane-002', 'Status: Live', 'All requirements met'],
    timestamp: new Date(Date.now() - 1 * 3600000),
    read: false,
    action: 'Go to Lane',
  },
  {
    id: 4,
    type: 'alert',
    icon: '⏱️',
    title: 'Certificate Expiring Soon',
    message: 'Company "PharmaBe" GDP certificate expires in 30 days.',
    details: ['PharmaBe', 'Certificate: GDP', 'Expires: June 19, 2026'],
    timestamp: new Date(Date.now() - 2 * 3600000),
    read: true,
    action: 'Renew Now',
  },
  {
    id: 5,
    type: 'update',
    icon: '📊',
    title: 'Weekly Compliance Report Ready',
    message: 'Your weekly compliance report for all active lanes is now available.',
    details: ['Report Period: May 13-19', '12 lanes analyzed', '98% compliance'],
    timestamp: new Date(Date.now() - 24 * 3600000),
    read: true,
    action: 'Download',
  },
  {
    id: 6,
    type: 'alert',
    icon: '⚠️',
    title: 'Backup Node Not Used',
    message: 'Lane "Berlin → Vienna" has backup nodes that haven\'t been tested in 60 days.',
    details: ['Lane-003', 'Backup Nodes: 2', 'Last Test: 60 days ago'],
    timestamp: new Date(Date.now() - 2 * 24 * 3600000),
    read: true,
    action: 'Test Now',
  },
  {
    id: 7,
    type: 'system',
    icon: '🔧',
    title: 'System Maintenance Scheduled',
    message: 'Scheduled maintenance on June 5, 2026 from 02:00 to 04:00 UTC.',
    details: ['Date: June 5, 2026', 'Duration: 2 hours', 'Expected downtime'],
    timestamp: new Date(Date.now() - 3 * 24 * 3600000),
    read: true,
  },
  {
    id: 8,
    type: 'update',
    icon: '📱',
    title: 'New Feature Available',
    message: 'We\'ve added support for bulk lane import. Try it in your next batch.',
    details: ['Feature: Bulk Import', 'Support: CSV format', 'Version: 1.1.0'],
    timestamp: new Date(Date.now() - 4 * 24 * 3600000),
    read: true,
  },
  {
    id: 9,
    type: 'alert',
    icon: '❌',
    title: 'Lane Inactive',
    message: 'Your lane "Paris → Brussels" hasn\'t been used in 90 days. Consider archiving.',
    details: ['Lane-004', 'Status: Inactive', 'Last Used: 90 days ago'],
    timestamp: new Date(Date.now() - 5 * 24 * 3600000),
    read: true,
  },
])

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

const filteredNotifications = computed(() => {
  let filtered = notifications.value
  
  if (activeTab.value !== 'All') {
    filtered = filtered.filter(n => {
      if (activeTab.value === 'Alerts') return n.type === 'alert'
      if (activeTab.value === 'Updates') return n.type === 'update'
      if (activeTab.value === 'System') return n.type === 'system'
      return true
    })
  }

  return filtered.sort((a, b) => b.timestamp - a.timestamp)
})

const formatTime = (timestamp) => {
  const now = new Date()
  const diffMs = now - timestamp
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const markAllRead = () => {
  notifications.value.forEach(n => {
    n.read = true
  })
}

const handleNotificationAction = (notification) => {
  console.log('Action clicked for notification:', notification.id)
  // In a real app, this would navigate or perform an action
}
</script>

<style scoped>
.notifications-page {
  padding: 40px 60px;
}

.page-header {
  margin-bottom: 32px;
}

.header-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.unread-badge {
  display: inline-block;
  padding: 4px 10px;
  background: #f44336;
  color: white;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.page-desc {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 16px;
}

.tab-btn {
  padding: 8px 16px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
  margin-bottom: -16px;
  padding-bottom: 16px;
  font-family: inherit;
}

.tab-btn:hover {
  color: var(--text-main);
}

.tab-btn.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.btn-mark-read {
  margin-left: auto;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-mark-read:hover {
  background: rgba(0, 0, 0, 0.02);
  color: var(--text-main);
  border-color: var(--primary);
}

/* Notifications List */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-msg {
  font-size: 14px;
  margin: 0;
}

/* Notification Card */
.notification-card {
  display: grid;
  grid-template-columns: 32px 1fr auto 32px;
  gap: 12px;
  align-items: flex-start;
  padding: 16px;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.notification-card:hover {
  background: rgba(0, 0, 0, 0.02);
  border-color: rgba(0, 0, 0, 0.1);
}

.notification-card.unread {
  background: rgba(33, 150, 243, 0.04);
  border-color: rgba(33, 150, 243, 0.2);
}

.notification-icon {
  font-size: 20px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-content {
  min-width: 0;
}

.notification-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
}

.notification-message {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.4;
}

.notification-details {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.detail-tag {
  display: inline-block;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
}

.notification-time {
  display: block;
  font-size: 11px;
  color: rgba(0, 0, 0, 0.4);
  font-weight: 500;
}

/* Alert styling */
.notification-card.alert {
  border-left: 3px solid #f44336;
}

.notification-card.alert.unread {
  background: rgba(244, 67, 54, 0.04);
  border-color: rgba(244, 67, 54, 0.3);
}

/* Update styling */
.notification-card.update {
  border-left: 3px solid #4caf50;
}

.notification-card.update.unread {
  background: rgba(76, 175, 80, 0.04);
  border-color: rgba(76, 175, 80, 0.3);
}

/* System styling */
.notification-card.system {
  border-left: 3px solid #2196f3;
}

.notification-card.system.unread {
  background: rgba(33, 150, 243, 0.04);
  border-color: rgba(33, 150, 243, 0.3);
}

/* Action Button */
.notification-action {
  padding: 6px 12px;
  background: rgba(33, 150, 243, 0.1);
  border: 1px solid rgba(33, 150, 243, 0.3);
  color: #2196f3;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  white-space: nowrap;
}

.notification-action:hover {
  background: rgba(33, 150, 243, 0.2);
}

/* Status Indicator */
.notification-status {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #2196f3;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
