import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick } from 'vue'
import NotesPanel from '../src/components/NotesPanel.vue'
import { useWindowSize } from '../src/composables/useWindowSize'

function setWindowWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true, writable: true })
  window.dispatchEvent(new Event('resize'))
}

const originalWidth = window.innerWidth

beforeEach(() => {
  window.localStorage.clear()
  setWindowWidth(1024)
})

afterEach(() => {
  setWindowWidth(originalWidth)
})

describe('useWindowSize', () => {
  it('starts from the current window size', () => {
    const scope = effectScope()
    // biome-ignore lint/style/noNonNullAssertion: the scope always returns a value here
    const { width, height } = scope.run(() => useWindowSize())!

    expect(width.value).toBe(window.innerWidth)
    expect(height.value).toBe(window.innerHeight)
    scope.stop()
  })

  it('follows resize events', () => {
    const scope = effectScope()
    // biome-ignore lint/style/noNonNullAssertion: the scope always returns a value here
    const { width } = scope.run(() => useWindowSize())!

    setWindowWidth(500)
    expect(width.value).toBe(500)
    scope.stop()
  })

  it('removes its resize listener when the scope is disposed', () => {
    const remove = vi.spyOn(window, 'removeEventListener')
    const scope = effectScope()
    // biome-ignore lint/style/noNonNullAssertion: the scope always returns a value here
    const { width } = scope.run(() => useWindowSize())!

    scope.stop()
    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function))

    setWindowWidth(320)
    expect(width.value).toBe(1024)
    remove.mockRestore()
  })
})

describe('NotesPanel', () => {
  it('starts from an empty note', () => {
    const wrapper = mount(NotesPanel)
    expect(wrapper.get<HTMLInputElement>('[data-testid="note"]').element.value).toBe('')
    expect(wrapper.get<HTMLInputElement>('[data-testid="pinned"]').element.checked).toBe(false)
  })

  it('shows the window width and the derived layout', async () => {
    const wrapper = mount(NotesPanel)
    expect(wrapper.get('[data-testid="width"]').text()).toBe('1024')
    expect(wrapper.get('[data-testid="layout"]').text()).toBe('wide')

    setWindowWidth(500)
    await nextTick()
    expect(wrapper.get('[data-testid="width"]').text()).toBe('500')
    expect(wrapper.get('[data-testid="layout"]').text()).toBe('narrow')
  })

  it('persists the note and restores it on a fresh mount', async () => {
    const first = mount(NotesPanel)
    await first.get('[data-testid="note"]').setValue('buy milk')
    await first.get('[data-testid="pinned"]').setValue(true)
    await nextTick()
    first.unmount()

    const second = mount(NotesPanel)
    expect(second.get<HTMLInputElement>('[data-testid="note"]').element.value).toBe('buy milk')
    expect(second.get<HTMLInputElement>('[data-testid="pinned"]').element.checked).toBe(true)
  })

  it('clears the note', async () => {
    const wrapper = mount(NotesPanel)
    await wrapper.get('[data-testid="note"]').setValue('buy milk')
    await wrapper.get('[data-testid="clear"]').trigger('click')
    await nextTick()

    expect(wrapper.get<HTMLInputElement>('[data-testid="note"]').element.value).toBe('')
    expect(JSON.parse(window.localStorage.getItem('note') as string)).toEqual({
      text: '',
      pinned: false,
    })
  })

  it('leaves no listeners behind after unmount', () => {
    const remove = vi.spyOn(window, 'removeEventListener')
    mount(NotesPanel).unmount()

    expect(remove).toHaveBeenCalledWith('storage', expect.any(Function))
    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function))
    remove.mockRestore()
  })
})
