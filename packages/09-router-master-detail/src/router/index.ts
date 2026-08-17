import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
  type Router,
  type RouterHistory,
} from 'vue-router'
import UserDetailView from '../views/UserDetailView.vue'
import UserListView from '../views/UserListView.vue'

// TODO:
//  - redirect '/' to the users list
//  - load the detail route lazily instead of importing it eagerly
//  - add a beforeEnter guard that redirects unknown / non-numeric ids to the list
//  - add a catch-all route rendering NotFoundView (also lazily)
export const routes: RouteRecordRaw[] = [
  { path: '/users', name: 'users', component: UserListView },
  { path: '/users/:id', name: 'user-detail', component: UserDetailView },
]

export function createAppRouter(history: RouterHistory = createWebHistory()): Router {
  return createRouter({ history, routes })
}
