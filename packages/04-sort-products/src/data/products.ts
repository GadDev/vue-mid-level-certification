import { ref } from 'vue'

export interface Product {
  id: number
  name: string
  price: number
  rating: number
}

const initial: Product[] = [
  { id: 1, name: 'Phone', price: 700, rating: 4.5 },
  { id: 2, name: 'TV', price: 1200, rating: 4.8 },
  { id: 3, name: 'Keyboard', price: 120, rating: 4.2 },
  { id: 4, name: 'Headphones', price: 250, rating: 4.7 },
  { id: 5, name: 'Mouse', price: 250, rating: 4.2 },
]

// The source of truth is reactive and shared: if the component sorted it in
// place, every other consumer would silently see the reordered array.
export const products = ref<Product[]>(initial.map(product => ({ ...product })))

export function resetProducts(): void {
  products.value = initial.map(product => ({ ...product }))
}
