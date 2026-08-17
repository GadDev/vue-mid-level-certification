export interface User {
  id: number
  name: string
  role: string
  bio: string
}

export const users: User[] = [
  { id: 1, name: 'Alice Johnson', role: 'Designer', bio: 'Design systems and accessibility.' },
  { id: 2, name: 'Bob Smith', role: 'Developer', bio: 'Vue, Vite and build tooling.' },
  { id: 3, name: 'Marie Dupont', role: 'Developer', bio: 'Data visualisation and SVG.' },
  { id: 4, name: 'John Walker', role: 'QA Engineer', bio: 'End-to-end testing at scale.' },
]

export function findUser(id: number): User | undefined {
  return users.find(user => user.id === id)
}
