import { createRouter, createWebHistory } from 'vue-router'

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
    component: Dashboard
  },
  {
    path: '/create',
    name: 'CreateRoute',
    component: CreateRoute
  },
  {
    path: '/canvas',
    name: 'RouteCanvas',
    component: RouteCanvas
  },
  {
    path: '/lanes',
    name: 'Lanes',
    component: Lanes
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { hideLayout: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { hideLayout: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: Notifications
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router