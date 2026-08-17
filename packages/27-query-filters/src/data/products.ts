export interface Product {
  id: number
  name: string
  price: number
}

export const PAGE_SIZE = 5

export const products: Product[] = [
  { id: 1, name: 'Anvil', price: 120 },
  { id: 2, name: 'Bucket', price: 12 },
  { id: 3, name: 'Chisel', price: 30 },
  { id: 4, name: 'Drill', price: 210 },
  { id: 5, name: 'Easel', price: 75 },
  { id: 6, name: 'File', price: 8 },
  { id: 7, name: 'Gauge', price: 45 },
  { id: 8, name: 'Hammer', price: 25 },
  { id: 9, name: 'Ink', price: 6 },
  { id: 10, name: 'Jigsaw', price: 180 },
  { id: 11, name: 'Kettle', price: 40 },
  { id: 12, name: 'Ladder', price: 95 },
]
