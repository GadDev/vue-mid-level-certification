export interface User {
  id: number
  name: string
  city: string
}

const cities = ['Paris', 'Lyon', 'Nantes', 'Lille']

/** 100 users: User 1 … User 100. */
export const users: User[] = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  name: `User ${index + 1}`,
  city: cities[index % cities.length],
}))
