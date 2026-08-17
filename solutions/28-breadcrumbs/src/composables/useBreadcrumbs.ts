import { type ComputedRef, computed } from 'vue'
import { type RouteParams, useRoute } from 'vue-router'

export interface Breadcrumb {
  label: string
  path: string
  /** The last crumb is the page you are on — it is not a link. */
  isCurrent: boolean
}

/** `/products/:category` + `{ category: 'tools' }` → `/products/tools`. */
function fill(pattern: string, params: RouteParams): string {
  return pattern.replace(/:([A-Za-z0-9_]+)/g, (_match, name: string) => {
    const value = params[name]
    return Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '')
  })
}

export function useBreadcrumbs(): ComputedRef<Breadcrumb[]> {
  const route = useRoute()

  return computed<Breadcrumb[]>(() => {
    const trail: Array<{ label: string; path: string }> = [{ label: 'Home', path: '/' }]

    for (const record of route.matched) {
      const crumb = record.meta.breadcrumb
      // A record without a breadcrumb is scaffolding (a layout, a redirect).
      if (!crumb) continue

      const path = fill(record.path, route.params)
      const label = typeof crumb === 'function' ? crumb(route) : crumb
      // A pathless child shares its parent's path — one crumb, not two.
      if (trail.some(existing => existing.path === path)) continue
      trail.push({ label, path })
    }

    return trail.map((crumb, index) => ({ ...crumb, isCurrent: index === trail.length - 1 }))
  })
}
