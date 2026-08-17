import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SearchPanel from '../src/components/SearchPanel.vue'

function render() {
  return mount(SearchPanel)
}

type Wrapper = ReturnType<typeof render>

function term(wrapper: Wrapper): string {
  return wrapper.get('[data-testid="term"]').text()
}

describe('SearchPanel', () => {
  it('starts empty', () => {
    const wrapper = render()
    expect(term(wrapper)).toBe('')
    expect(wrapper.find('[data-testid="empty"]').exists()).toBe(true)
  })

  it('passes the label down to the field', () => {
    expect(render().get('[data-testid="label"]').text()).toBe('Search')
  })

  it('lifts what the user types up to the parent', async () => {
    const wrapper = render()
    await wrapper.get('[data-testid="input"]').setValue('anvil')

    expect(term(wrapper)).toBe('anvil')
    expect(wrapper.find('[data-testid="empty"]').exists()).toBe(false)
  })

  it('keeps the input and the parent showing the same value', async () => {
    const wrapper = render()
    await wrapper.get('[data-testid="input"]').setValue('anvil')

    // The input is bound to the parent's value, so the two cannot disagree.
    expect(wrapper.get<HTMLInputElement>('[data-testid="input"]').element.value).toBe(term(wrapper))
  })

  it('clears from the child button', async () => {
    const wrapper = render()
    await wrapper.get('[data-testid="input"]').setValue('anvil')
    expect(term(wrapper)).toBe('anvil')

    await wrapper.get('[data-testid="clear"]').trigger('click')
    expect(term(wrapper)).toBe('')
    expect(wrapper.get<HTMLInputElement>('[data-testid="input"]').element.value).toBe('')
    expect(wrapper.find('[data-testid="empty"]').exists()).toBe(true)
  })
})
