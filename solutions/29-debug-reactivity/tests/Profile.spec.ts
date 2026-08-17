import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Profile from '../src/components/Profile.vue'

function render() {
  return mount(Profile)
}

type Wrapper = ReturnType<typeof render>

function text(wrapper: Wrapper, testid: string): string {
  return wrapper.get(`[data-testid="${testid}"]`).text()
}

async function click(wrapper: Wrapper, testid: string) {
  await wrapper.get(`[data-testid="${testid}"]`).trigger('click')
}

describe('Profile', () => {
  it('renders the initial profile with nothing saved', () => {
    const wrapper = render()
    expect(text(wrapper, 'name')).toBe('Ada')
    expect(text(wrapper, 'city')).toBe('Paris')
    expect(text(wrapper, 'saves')).toBe('0')
  })

  it('saves when the name changes', async () => {
    const wrapper = render()
    await click(wrapper, 'rename')
    expect(text(wrapper, 'name')).toBe('Grace')
    expect(text(wrapper, 'saves')).toBe('1')
    expect(text(wrapper, 'last')).toBe('Grace')
  })

  it('saves when a nested field changes', async () => {
    const wrapper = render()
    await click(wrapper, 'move')
    expect(text(wrapper, 'city')).toBe('Lyon')
    expect(text(wrapper, 'saves')).toBe('1')
  })

  it('counts each change once', async () => {
    const wrapper = render()
    await click(wrapper, 'rename')
    await click(wrapper, 'move')
    expect(text(wrapper, 'saves')).toBe('2')
  })

  it('does not save when nothing actually changed', async () => {
    const wrapper = render()
    await click(wrapper, 'rename')
    await click(wrapper, 'rename')
    expect(text(wrapper, 'saves')).toBe('1')
  })
})
