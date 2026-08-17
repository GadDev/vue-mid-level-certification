import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Modal from '../src/components/Modal.vue'

function render(
  props: { open?: boolean; title?: string } = {},
  slots: Record<string, string> = {}
) {
  return mount(Modal, {
    props: { open: true, ...props },
    slots: { default: '<p>Body copy</p>', ...slots },
    attachTo: document.body,
  })
}

type Wrapper = ReturnType<typeof render>

function closes(wrapper: Wrapper): number {
  return wrapper.emitted('close')?.length ?? 0
}

function pressEscape() {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
}

describe('Modal', () => {
  it('renders nothing while closed', () => {
    const wrapper = render({ open: false })
    expect(wrapper.find('[data-testid="modal"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="overlay"]').exists()).toBe(false)
  })

  it('renders a dialog while open', () => {
    const modal = render().get('[data-testid="modal"]')
    expect(modal.attributes('role')).toBe('dialog')
    expect(modal.attributes('aria-modal')).toBe('true')
  })

  it('renders the default slot as the body', () => {
    expect(render().get('[data-testid="body"]').text()).toBe('Body copy')
  })

  it('falls back to the title prop in the header', () => {
    expect(render({ title: 'Delete file' }).text()).toContain('Delete file')
  })

  it('lets the header slot replace the title', () => {
    const wrapper = render({ title: 'Delete file' }, { header: '<h2>Custom header</h2>' })
    expect(wrapper.text()).toContain('Custom header')
    expect(wrapper.text()).not.toContain('Delete file')
  })

  it('closes from the fallback footer button', async () => {
    const wrapper = render()
    await wrapper.get('[data-testid="close"]').trigger('click')
    expect(closes(wrapper)).toBe(1)
  })

  it('hands `close` to a scoped footer slot', async () => {
    const wrapper = render(
      {},
      {
        footer:
          '<template #footer="{ close }"><button data-testid="ok" @click="close">OK</button></template>',
      }
    )
    await wrapper.get('[data-testid="ok"]').trigger('click')
    expect(closes(wrapper)).toBe(1)
  })

  it('closes on a backdrop click', async () => {
    const wrapper = render()
    await wrapper.get('[data-testid="overlay"]').trigger('click')
    expect(closes(wrapper)).toBe(1)
  })

  it('stays open when the click lands inside the dialog', async () => {
    const wrapper = render()
    await wrapper.get('[data-testid="modal"]').trigger('click')
    await wrapper.get('[data-testid="body"]').trigger('click')
    expect(closes(wrapper)).toBe(0)
  })

  it('closes on Escape', () => {
    const wrapper = render()
    pressEscape()
    expect(closes(wrapper)).toBe(1)
  })

  it('ignores other keys', () => {
    const wrapper = render()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(closes(wrapper)).toBe(0)
  })

  it('ignores Escape while closed', () => {
    const wrapper = render({ open: false })
    pressEscape()
    expect(closes(wrapper)).toBe(0)
  })

  it('stops listening once it is closed again', async () => {
    const wrapper = render()
    pressEscape()
    await wrapper.setProps({ open: false })
    pressEscape()
    expect(closes(wrapper)).toBe(1)
  })

  it('removes its listener on unmount', () => {
    const wrapper = render()
    wrapper.unmount()
    pressEscape()
    expect(closes(wrapper)).toBe(0)
  })
})
