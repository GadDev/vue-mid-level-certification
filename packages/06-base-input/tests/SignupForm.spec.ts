import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SignupForm from '../src/components/SignupForm.vue'

function render() {
  return mount(SignupForm)
}

type Wrapper = ReturnType<typeof render>

async function fill(wrapper: Wrapper, testid: string, value: string) {
  await wrapper.get(`[data-testid="${testid}"]`).setValue(value)
}

async function submit(wrapper: Wrapper) {
  await wrapper.get('[data-testid="form"]').trigger('submit')
}

function errors(wrapper: Wrapper): string[] {
  return wrapper.findAll('[data-testid="error"]').map(node => node.text())
}

describe('SignupForm', () => {
  it('renders two labelled fields and no errors up front', () => {
    const wrapper = render()
    expect(wrapper.findAll('input')).toHaveLength(2)
    expect(errors(wrapper)).toEqual([])
    expect(wrapper.find('[data-testid="summary"]').exists()).toBe(false)
  })

  it('gives each field its own id, with its label pointing at it', () => {
    const wrapper = render()
    const inputs = wrapper.findAll('input')
    const labels = wrapper.findAll('label')

    const ids = inputs.map(input => input.attributes('id'))
    expect(ids[0]).toBeTruthy()
    expect(ids[0]).not.toBe(ids[1])
    expect(labels.map(label => label.attributes('for'))).toEqual(ids)
  })

  it('keeps the parent state in sync through v-model on the child', async () => {
    const wrapper = render()
    await fill(wrapper, 'name-input', 'Ada')
    expect(wrapper.get<HTMLInputElement>('[data-testid="name-input"]').element.value).toBe('Ada')
  })

  it('blocks submission and reports both fields when empty', async () => {
    const wrapper = render()
    await submit(wrapper)

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(errors(wrapper)).toHaveLength(2)
    expect(wrapper.get('[data-testid="summary"]').text()).not.toBe('')
  })

  it('rejects a whitespace-only name', async () => {
    const wrapper = render()
    await fill(wrapper, 'name-input', '   ')
    await fill(wrapper, 'email-input', 'ada@example.com')
    await submit(wrapper)

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(errors(wrapper)).toHaveLength(1)
  })

  it.each(['ada', 'ada@', 'ada@example', 'ada example.com'])(
    'rejects the invalid email %s',
    async email => {
      const wrapper = render()
      await fill(wrapper, 'name-input', 'Ada')
      await fill(wrapper, 'email-input', email)
      await submit(wrapper)

      expect(wrapper.emitted('submit')).toBeUndefined()
      expect(errors(wrapper)).toHaveLength(1)
    }
  )

  it('emits the trimmed payload once when valid', async () => {
    const wrapper = render()
    await fill(wrapper, 'name-input', '  Ada Lovelace  ')
    await fill(wrapper, 'email-input', '  ada@example.com ')
    await submit(wrapper)

    expect(wrapper.emitted('submit')).toEqual([
      [{ name: 'Ada Lovelace', email: 'ada@example.com' }],
    ])
    expect(errors(wrapper)).toEqual([])
    expect(wrapper.find('[data-testid="summary"]').exists()).toBe(false)
  })

  it('clears an error as soon as the field becomes valid', async () => {
    const wrapper = render()
    await submit(wrapper)
    expect(errors(wrapper)).toHaveLength(2)

    await fill(wrapper, 'name-input', 'Ada')
    expect(errors(wrapper)).toHaveLength(1)

    await fill(wrapper, 'email-input', 'ada@example.com')
    expect(errors(wrapper)).toEqual([])
    expect(wrapper.find('[data-testid="summary"]').exists()).toBe(false)
  })

  it('can submit twice', async () => {
    const wrapper = render()
    await fill(wrapper, 'name-input', 'Ada')
    await fill(wrapper, 'email-input', 'ada@example.com')
    await submit(wrapper)
    await submit(wrapper)

    expect(wrapper.emitted('submit')).toHaveLength(2)
  })
})
