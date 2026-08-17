import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalizedLoaded,
  type RouteRecordRaw,
  type Router,
  type RouterHistory,
} from 'vue-router'
import CategoryView from '../views/CategoryView.vue'
import HomeView from '../views/HomeView.vue'
import ProductsLayout from '../views/ProductsLayout.vue'
import ProductsView from '../views/ProductsView.vue'
import ProductView from '../views/ProductView.vue'
import SettingsView from '../views/SettingsView.vue'

/** A crumb label is either fixed, or derived from the current route. */
export type Crumb = string | ((route: RouteLocationNormalizedLoaded) => string)

declare module 'vue-router' {
  interface RouteMeta {
    breadcrumb?: Crumb
  }
}

function capitalise(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView, meta: { breadcrumb: 'Home' } },
  {
    path: '/products',
    component: ProductsLayout,
    meta: { breadcrumb: 'Products' },
    children: [
      { path: '', name: 'products', component: ProductsView },
      {
        path: ':category',
        name: 'category',
        component: CategoryView,
        meta: { breadcrumb: route => capitalise(String(route.params.category)) },
        children: [
          {
            path: ':id',
            name: 'product',
            component: ProductView,
            meta: { breadcrumb: route => `Item #${route.params.id}` },
          },
        ],
      },
    ],
  },
  // No breadcrumb meta on purpose: this route must be skipped.
  { path: '/settings', name: 'settings', component: SettingsView },
]

/** The history is injected so tests can pass `createMemoryHistory()`. */
export function createAppRouter(history: RouterHistory = createWebHistory()): Router {
  return createRouter({ history, routes })
}
