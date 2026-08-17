import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CopyButton from '../src/components/CopyButton.vue'

let writeText: ReturnType<typeof vi.fn>

function render(text = 'npm create vue@latest') {
  return mount(CopyButton, { props: { text } })
}

type Wrapper = ReturnType<typeof render>

async function click(wrapper: Wrapper) {
  await wrapper.get('[data-testid="copy"]').trigger('click')
  await flushPromises()
}

beforeEach(() => {
  vi.useFakeTimers()
  writeText = vi.fn(async () => {})
  vi.stubGlobal('navigator', { clipboard: { writeText } })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('CopyButton', () => {
  it('offers to copy', () => {
    const wrapper = render()
    expect(wrapper.get('[data-testid="copy"]').text()).toBe('Copy')
    expect(wrapper.find('[data-testid="error"]').exists()).toBe(false)
  })

  it('copies the text and confirms for two seconds', async () => {
    const wrapper = render()
    await click(wrapper)

    expect(writeText).toHaveBeenCalledWith('npm create vue@latest')
    expect(wrapper.get('[data-testid="copy"]').text()).toBe('Copied!')

    await vi.advanceTimersByTimeAsync(1999)
    expect(wrapper.get('[data-testid="copy"]').text()).toBe('Copied!')

    await vi.advanceTimersByTimeAsync(1)
    expect(wrapper.get('[data-testid="copy"]').text()).toBe('Copy')
  })

  it('shows an error when the write is refused', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'))
    const wrapper = render()
    await click(wrapper)

    expect(wrapper.get('[data-testid="error"]').text()).not.toBe('')
    expect(wrapper.get('[data-testid="copy"]').text()).toBe('Copy')
  })

  it('disables itself without a clipboard', () => {
    vi.stubGlobal('navigator', {})
    const wrapper = render()
    expect(wrapper.get<HTMLButtonElement>('[data-testid="copy"]').element.disabled).toBe(true)
  })
})
