import { createRouter, createWebHistory } from 'vue-router'
import { getAuthToken } from '../services/api'

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
    meta: { requiresAuth: true },
  },
  {
    path: '/create',
    name: 'CreateRoute',
    component: CreateRoute,
    meta: { requiresAuth: true },
  },
  {
    path: '/canvas',
    name: 'RouteCanvas',
    component: RouteCanvas,
    meta: { requiresAuth: true },
  },
  {
    path: '/lanes',
    name: 'Lanes',
    component: Lanes,
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { hideLayout: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { hideLayout: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true },
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: Notifications,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !getAuthToken()) {
    return { name: 'Login' }
  }
})

export default router
