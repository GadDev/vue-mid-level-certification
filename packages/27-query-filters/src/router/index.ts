import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
  type Router,
  type RouterHistory,
} from 'vue-router'
import ProductsView from '../views/ProductsView.vue'

export const routes: RouteRecordRaw[] = [{ path: '/', name: 'products', component: ProductsView }]

/** The history is injected so tests can pass `createMemoryHistory()`. */
export function createAppRouter(history: RouterHistory = createWebHistory()): Router {
  return createRouter({ history, routes })
}
