export type FieldType = 'text' | 'email' | 'number' | 'checkbox' | 'select'

export interface FormField {
  name: string
  label: string
  type: FieldType
  required?: boolean
  /** Only used by `select` fields. */
  options?: string[]
}

export type FieldValue = string | number | boolean | null

export const schema: FormField[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'age', label: 'Age', type: 'number' },
  { name: 'plan', label: 'Plan', type: 'select', required: true, options: ['Free', 'Pro'] },
  { name: 'terms', label: 'Accept terms', type: 'checkbox', required: true },
]
