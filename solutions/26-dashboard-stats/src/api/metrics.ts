export interface Reading {
  id: number
  label: string
  value: number
}

export const LOAD_ERROR = 'Could not load metrics.'

/** A fake API payload — deliberately messy: it contains junk values. */
export const payload: unknown[] = [
  { id: 1, label: 'Mon', value: 120 },
  { id: 2, label: 'Tue', value: 80 },
  { id: 3, label: 'Wed', value: 'n/a' },
  { id: 4, label: 'Thu', value: 200 },
  { id: 5, label: 'Fri', value: Number.NaN },
]

export function fetchMetrics(): Promise<unknown[]> {
  return new Promise(resolve => setTimeout(() => resolve(payload), 200))
}
