export type Role = 'admin' | 'member'

export interface User {
  id: number
  email: string
  role: Role
}

export const INVALID_CREDENTIALS = 'Invalid email or password.'

const accounts: Array<User & { password: string }> = [
  { id: 1, email: 'admin@example.com', password: 'secret', role: 'admin' },
  { id: 2, email: 'member@example.com', password: 'secret', role: 'member' },
]

/** Rejects with `INVALID_CREDENTIALS` when the pair is unknown. */
export function login(email: string, password: string): Promise<User> {
  const account = accounts.find(item => item.email === email && item.password === password)
  return account
    ? Promise.resolve({ id: account.id, email: account.email, role: account.role })
    : Promise.reject(new Error(INVALID_CREDENTIALS))
}
