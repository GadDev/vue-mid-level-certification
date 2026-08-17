import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ToastList from '../src/components/ToastList.vue'
import type { Toast } from '../src/composables/useToasts'

const queue: Toast[] = [
  { id: 1, message: 'Saved', type: 'success' },
  { id: 2, message: 'Careful', type: 'info' },
  { id: 3, message: 'Boom', type: 'error' },
]

function render(toasts: Toast[] = queue) {
  return mount(ToastList, { props: { toasts } })
}

describe('ToastList', () => {
  it('renders the queue in order', () => {
    const wrapper = render()
    expect(wrapper.findAll('[data-testid="message"]').map(node => node.text())).toEqual([
      'Saved',
      'Careful',
      'Boom',
    ])
  })

  it('tags every toast with its type', () => {
    const items = render().findAll('[data-testid="toast"]')
    expect(items[0].classes()).toContain('success')
    expect(items[1].classes()).toContain('info')
    expect(items[2].classes()).toContain('error')
  })

  it('emits dismiss with the toast id', async () => {
    const wrapper = render()
    await wrapper.findAll('[data-testid="dismiss"]')[1].trigger('click')
    expect(wrapper.emitted('dismiss')).toEqual([[2]])
  })

  it('renders nothing while the queue is empty', () => {
    const wrapper = render([])
    expect(wrapper.find('[data-testid="toasts"]').exists()).toBe(false)
  })
})
