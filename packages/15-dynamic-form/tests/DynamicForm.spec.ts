import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DynamicForm from '../src/components/DynamicForm.vue'
import { type FormField, schema } from '../src/data/schema'

function render(fields: FormField[] = schema) {
  return mount(DynamicForm, { props: { fields } })
}

type Wrapper = ReturnType<typeof render>

function field(wrapper: Wrapper, name: string) {
  return wrapper.get(`[data-testid="field-${name}"]`)
}

function hasError(wrapper: Wrapper, name: string): boolean {
  return wrapper.find(`[data-testid="error-${name}"]`).exists()
}

async function submit(wrapper: Wrapper) {
  await wrapper.get('form').trigger('submit')
}

/** Fill everything the default schema marks required. */
async function fillRequired(wrapper: Wrapper) {
  await field(wrapper, 'name').setValue('Ada')
  await field(wrapper, 'email').setValue('ada@example.com')
  await field(wrapper, 'plan').setValue('Pro')
  await field(wrapper, 'terms').setValue(true)
}

describe('DynamicForm', () => {
  it('renders one labelled control per field', () => {
    const wrapper = render()
    for (const spec of schema) {
      expect(wrapper.find(`[data-testid="field-${spec.name}"]`).exists()).toBe(true)
    }
    expect(wrapper.findAll('label').map(label => label.text())).toEqual(
      schema.map(spec => spec.label)
    )
  })

  it('renders the control that matches each field type', () => {
    const wrapper = render()
    expect(field(wrapper, 'name').attributes('type')).toBe('text')
    expect(field(wrapper, 'email').attributes('type')).toBe('email')
    expect(field(wrapper, 'age').attributes('type')).toBe('number')
    expect(field(wrapper, 'terms').attributes('type')).toBe('checkbox')
    expect(field(wrapper, 'plan').element.tagName).toBe('SELECT')
  })

  it('renders the options of a select field', () => {
    const wrapper = render()
    expect(
      field(wrapper, 'plan')
        .findAll('option')
        .map(option => option.text())
    ).toEqual(['Free', 'Pro'])
  })

  it('links every label to its control', () => {
    const wrapper = render()
    const labels = wrapper.findAll('label')
    for (const [index, spec] of schema.entries()) {
      const id = labels[index].attributes('for')
      expect(id).toBeTruthy()
      expect(field(wrapper, spec.name).attributes('id')).toBe(id)
    }
  })

  it('shows no errors before the first submit', async () => {
    const wrapper = render()
    await field(wrapper, 'name').setValue('')
    expect(schema.some(spec => hasError(wrapper, spec.name))).toBe(false)
  })

  it('blocks submission and flags every missing required field', async () => {
    const wrapper = render()
    await submit(wrapper)
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(hasError(wrapper, 'name')).toBe(true)
    expect(hasError(wrapper, 'email')).toBe(true)
    expect(hasError(wrapper, 'plan')).toBe(true)
    expect(hasError(wrapper, 'terms')).toBe(true)
    expect(hasError(wrapper, 'age')).toBe(false)
  })

  it('treats whitespace as missing', async () => {
    const wrapper = render()
    await fillRequired(wrapper)
    await field(wrapper, 'name').setValue('   ')
    await submit(wrapper)
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(hasError(wrapper, 'name')).toBe(true)
  })

  it('requires a checkbox to be checked, not merely present', async () => {
    const wrapper = render()
    await fillRequired(wrapper)
    await field(wrapper, 'terms').setValue(false)
    await submit(wrapper)
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(hasError(wrapper, 'terms')).toBe(true)
  })

  it('emits typed values once the form is valid', async () => {
    const wrapper = render()
    await fillRequired(wrapper)
    await field(wrapper, 'age').setValue('36')
    await submit(wrapper)

    expect(wrapper.emitted('submit')).toEqual([
      [{ name: 'Ada', email: 'ada@example.com', age: 36, plan: 'Pro', terms: true }],
    ])
  })

  it('trims strings and leaves an untouched number null', async () => {
    const wrapper = render()
    await fillRequired(wrapper)
    await field(wrapper, 'name').setValue('  Ada  ')
    await submit(wrapper)

    const payload = wrapper.emitted('submit')?.[0][0] as Record<string, unknown>
    expect(payload.name).toBe('Ada')
    expect(payload.age).toBeNull()
  })

  it('clears an error as soon as the field is filled in', async () => {
    const wrapper = render()
    await submit(wrapper)
    expect(hasError(wrapper, 'name')).toBe(true)

    await field(wrapper, 'name').setValue('Ada')
    expect(hasError(wrapper, 'name')).toBe(false)
  })

  it('adapts to a different schema', async () => {
    const wrapper = render([{ name: 'nickname', label: 'Nickname', type: 'text' }])
    expect(wrapper.findAll('label')).toHaveLength(1)
    await field(wrapper, 'nickname').setValue('ada')
    await submit(wrapper)
    expect(wrapper.emitted('submit')).toEqual([[{ nickname: 'ada' }]])
  })
})
