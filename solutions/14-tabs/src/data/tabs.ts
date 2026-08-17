export interface Tab {
  id: string
  label: string
  content: string
}

export const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', content: 'What this product does.' },
  { id: 'specs', label: 'Specs', content: '1.2 kg, aluminium, 12 h battery.' },
  { id: 'reviews', label: 'Reviews', content: '4.6 out of 5 from 320 buyers.' },
]
