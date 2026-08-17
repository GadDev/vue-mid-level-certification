import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
  type Router,
  type RouterHistory,
} from 'vue-router'
import { findUser } from '../data/users'
import UserListView from '../views/UserListView.vue'

export const routes: RouteRecordRaw[] = [
  { path: '/', redirect: { name: 'users' } },
  { path: '/users', name: 'users', component: UserListView },
  {
    path: '/users/:id',
    name: 'user-detail',
    // Lazy: the detail view is a separate chunk, only fetched on first visit.
    component: () => import('../views/UserDetailView.vue'),
    // The guard keeps bad ids out of the view entirely, so the component can
    // assume the user exists.
    beforeEnter: to => {
      const raw = to.params.id
      const id = Number(Array.isArray(raw) ? raw[0] : raw)
      if (!Number.isInteger(id) || !findUser(id)) return { name: 'users' }
      return true
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
  },
]

export function createAppRouter(history: RouterHistory = createWebHistory()): Router {
  return createRouter({ history, routes })
}
