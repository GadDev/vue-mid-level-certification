import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UserTable from '../src/components/UserTable.vue'

function render() {
  return mount(UserTable)
}

type Wrapper = ReturnType<typeof render>

function rows(wrapper: Wrapper): string[] {
  return wrapper.findAll('[data-testid="row"]').map(row => row.text())
}

function isDisabled(wrapper: Wrapper, testid: string): boolean {
  return wrapper.get<HTMLButtonElement>(`[data-testid="${testid}"]`).element.disabled
}

describe('UserTable', () => {
  it('shows the first ten users', () => {
    const wrapper = render()
    expect(rows(wrapper)).toHaveLength(10)
    expect(rows(wrapper)[0]).toBe('User 1')
    expect(wrapper.get('[data-testid="status"]').text()).toBe('Page 1 of 10')
  })

  it('pages forward and back', async () => {
    const wrapper = render()
    await wrapper.get('[data-testid="next"]').trigger('click')
    expect(rows(wrapper)[0]).toBe('User 11')
    expect(wrapper.get('[data-testid="status"]').text()).toBe('Page 2 of 10')

    await wrapper.get('[data-testid="prev"]').trigger('click')
    expect(rows(wrapper)[0]).toBe('User 1')
  })

  it('disables the controls at the ends', async () => {
    const wrapper = render()
    expect(isDisabled(wrapper, 'prev')).toBe(true)
    expect(isDisabled(wrapper, 'next')).toBe(false)

    for (let click = 0; click < 9; click++) {
      await wrapper.get('[data-testid="next"]').trigger('click')
    }
    expect(isDisabled(wrapper, 'next')).toBe(true)
    expect(isDisabled(wrapper, 'prev')).toBe(false)
  })

  it('changes the page size', async () => {
    const wrapper = render()
    await wrapper.get('[data-testid="size"]').setValue('25')
    expect(rows(wrapper)).toHaveLength(25)
    expect(wrapper.get('[data-testid="status"]').text()).toBe('Page 1 of 4')
  })

  it('resets to page 1 when the page size changes', async () => {
    const wrapper = render()
    await wrapper.get('[data-testid="next"]').trigger('click')
    await wrapper.get('[data-testid="next"]').trigger('click')
    expect(wrapper.get('[data-testid="status"]').text()).toBe('Page 3 of 10')

    await wrapper.get('[data-testid="size"]').setValue('50')
    expect(wrapper.get('[data-testid="status"]').text()).toBe('Page 1 of 2')
    expect(rows(wrapper)[0]).toBe('User 1')
  })
})
