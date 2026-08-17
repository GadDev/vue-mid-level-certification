import { type ComputedRef, computed } from 'vue'
import { useRoute } from 'vue-router'

export interface Breadcrumb {
  label: string
  path: string
  /** The last crumb is the page you are on — it is not a link. */
  isCurrent: boolean
}

export function useBreadcrumbs(): ComputedRef<Breadcrumb[]> {
  const route = useRoute()

  return computed<Breadcrumb[]>(() => {
    // TODO: walk `route.matched`, keep the records that declare a breadcrumb,
    // resolve a function label against the current route, and mark the last
    // crumb as the current page. A record with no breadcrumb is skipped, and a
    // pathless child must not produce a duplicate crumb.
    void route
    return []
  })
}
