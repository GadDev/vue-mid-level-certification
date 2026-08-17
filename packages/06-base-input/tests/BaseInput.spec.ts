import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BaseInput from '../src/components/BaseInput.vue'

function render(props: Record<string, unknown> = {}, attrs: Record<string, unknown> = {}) {
  return mount(BaseInput, {
    props: { label: 'Name', modelValue: '', ...props },
    attrs,
  })
}

describe('BaseInput', () => {
  it('renders a label bound to the input', () => {
    const wrapper = render()
    const id = wrapper.get('input').attributes('id')

    expect(id).toBeTruthy()
    expect(wrapper.get('label').attributes('for')).toBe(id)
    expect(wrapper.get('label').text()).toContain('Name')
  })

  it('shows the current value', () => {
    expect(render({ modelValue: 'Ada' }).get<HTMLInputElement>('input').element.value).toBe('Ada')
  })

  it('emits update:modelValue instead of mutating the prop', async () => {
    const wrapper = render()
    await wrapper.get('input').setValue('Grace')

    expect(wrapper.emitted('update:modelValue')).toEqual([['Grace']])
    expect(wrapper.props('modelValue')).toBe('')
  })

  it('reflects a new value pushed down from the parent', async () => {
    const wrapper = render()
    await wrapper.setProps({ modelValue: 'Alan' })
    expect(wrapper.get<HTMLInputElement>('input').element.value).toBe('Alan')
  })

  it('renders no error by default', () => {
    const wrapper = render()
    expect(wrapper.find('[data-testid="error"]').exists()).toBe(false)
    expect(wrapper.get('input').attributes('aria-invalid')).toBe('false')
  })

  it('renders the error message with role="alert"', () => {
    const wrapper = render({ error: 'Name is required.' })
    const error = wrapper.get('[data-testid="error"]')

    expect(error.text()).toBe('Name is required.')
    expect(error.attributes('role')).toBe('alert')
    expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
  })

  it('marks the field as required', () => {
    const wrapper = render({ required: true })
    expect(wrapper.get('input').attributes('required')).toBeDefined()
    expect(wrapper.get('label').text()).toContain('*')
  })

  it('forwards extra attributes to the input, not the wrapper', () => {
    const wrapper = render({}, { placeholder: 'Ada Lovelace', type: 'email', 'data-testid': 'x' })

    const input = wrapper.get('input')
    expect(input.attributes('placeholder')).toBe('Ada Lovelace')
    expect(input.attributes('type')).toBe('email')
    expect(input.attributes('data-testid')).toBe('x')
    expect(wrapper.get('.field').attributes('placeholder')).toBeUndefined()
    expect(wrapper.get('.field').attributes('data-testid')).toBeUndefined()
  })
})
