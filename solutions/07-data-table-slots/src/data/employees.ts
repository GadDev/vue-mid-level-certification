export interface Employee {
  id: number
  name: string
  role: string
  salary: number
}

export const employees: Employee[] = [
  { id: 1, name: 'Alice Johnson', role: 'Designer', salary: 62000 },
  { id: 2, name: 'Bob Smith', role: 'Developer', salary: 71000 },
  { id: 3, name: 'Marie Dupont', role: 'Developer', salary: 74000 },
]
