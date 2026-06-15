import { createRouter, createWebHistory } from 'vue-router'
import { api, getAuthToken, clearAuthSession } from '../services/api'

import Dashboard from '../pages/Dashboard.vue'
import CreateRoute from '../pages/CreateRoute.vue'
import RouteCanvas from '../pages/RouteCanvas.vue'
import Lanes from '../pages/Lanes.vue'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import Profile from '../pages/Profile.vue'
import Settings from '../pages/Settings.vue'
import Notifications from '../pages/Notifications.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/create',
    name: 'CreateRoute',
    component: CreateRoute,
  },
  {
    path: '/canvas',
    name: 'RouteCanvas',
    component: RouteCanvas,
  },
  {
    path: '/lanes',
    name: 'Lanes',
    component: Lanes,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { hideLayout: true, public: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { hideLayout: true, public: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: Notifications,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

//REMOVE BEFORE SHIPPING -- #Pascal
const BYPASS_AUTH = true


// null = not yet checked, true/false = result of /auth/me
let authVerified: boolean | null = null

router.beforeEach(async (to) => {
  if (BYPASS_AUTH) return
  
  // Validate the stored token against the server exactly once per page load.
  if (authVerified === null) {
    if (getAuthToken()) {
      try {
        await api.get('/auth/me')
        authVerified = true
      } catch {
        clearAuthSession()
        authVerified = false
      }
    } else {
      authVerified = false
    }
  }

  const isPublic = to.meta.public === true

  if (!authVerified && !isPublic) {
    return { name: 'Login' }
  }

  if (authVerified && isPublic) {
    return { name: 'Dashboard' }
  }
})

export default router
