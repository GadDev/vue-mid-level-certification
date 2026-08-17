export interface Product {
  id: number
  name: string
  price: number
}

export const products: Product[] = [
  { id: 1, name: 'Keyboard', price: 89 },
  { id: 2, name: 'Monitor', price: 249 },
  { id: 3, name: 'Mouse', price: 39 },
  { id: 4, name: 'Webcam', price: 65 },
]
