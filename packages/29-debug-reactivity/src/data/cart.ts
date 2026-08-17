export interface Line {
  id: number
  name: string
  price: number
}

export const initialLines: Line[] = [
  { id: 1, name: 'Anvil', price: 120 },
  { id: 2, name: 'Bucket', price: 12 },
  { id: 3, name: 'Chisel', price: 30 },
]
