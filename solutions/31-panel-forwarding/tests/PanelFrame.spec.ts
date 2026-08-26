import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PanelFrame from '../src/components/PanelFrame.vue'

interface Row {
  id: number
  name: string
}

const rows: Row[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
]

describe('PanelFrame', () => {
  it('renders its own title', () => {
    const wrapper = mount(PanelFrame, { props: { title: 'Tasks' }, attrs: { items: rows } })
    expect(wrapper.get('[data-testid="panel-frame-title"]').text()).toBe('Tasks')
  })

  it('forwards the items prop through to the wrapped panel', () => {
    const wrapper = mount(PanelFrame, { props: { title: 'Tasks' }, attrs: { items: rows } })
    expect(wrapper.findAll('[data-testid="item-row"]')).toHaveLength(2)
  })

  it('does not leak the forwarded prop onto its own root element', () => {
    const wrapper = mount(PanelFrame, { props: { title: 'Tasks' }, attrs: { items: rows } })
    expect(wrapper.get('[data-testid="panel-frame"]').attributes('items')).toBeUndefined()
  })

  it('forwards a named slot it never declared itself', () => {
    const wrapper = mount(PanelFrame, {
      props: { title: 'Tasks' },
      attrs: { items: rows },
      slots: { header: '<span class="h">Custom header</span>' },
    })

    expect(wrapper.get('.h').text()).toBe('Custom header')
    expect(wrapper.get('[data-testid="panel-header"]').text()).toBe('Custom header')
  })

  it('forwards a scoped slot with its parameters intact', () => {
    const wrapper = mount(PanelFrame, {
      props: { title: 'Tasks' },
      attrs: { items: rows },
      slots: {
        item: '<span class="i">{{ params.index }}:{{ params.item.name }}</span>',
      },
    })

    expect(wrapper.findAll('.i').map(node => node.text())).toEqual(['0:Alice', '1:Bob'])
    expect(wrapper.find('[data-testid="fallback-item"]').exists()).toBe(false)
  })

  it('forwards the empty slot', () => {
    const wrapper = mount(PanelFrame, {
      props: { title: 'Tasks' },
      attrs: { items: [] as Row[] },
      slots: { empty: '<span class="e">Nothing</span>' },
    })

    expect(wrapper.get('.e').text()).toBe('Nothing')
  })

  it('forwards the footer slot with its count', () => {
    const wrapper = mount(PanelFrame, {
      props: { title: 'Tasks' },
      attrs: { items: rows },
      slots: { footer: '<span class="f">{{ params.count }} total</span>' },
    })

    expect(wrapper.get('.f').text()).toBe('2 total')
  })

  it('leaves an unsupplied slot to fall back to the wrapped panel default', () => {
    const wrapper = mount(PanelFrame, {
      props: { title: 'Tasks' },
      attrs: { items: rows },
      slots: { header: '<span class="h">Custom</span>' },
    })

    expect(wrapper.get('[data-testid="panel-footer"]').text()).toBe('2 items')
  })

  it('renders a fresh item count when the forwarded items change', () => {
    const wrapper = mount(PanelFrame, {
      props: { title: 'Tasks' },
      attrs: { items: [rows[1]] },
    })

    expect(wrapper.findAll('[data-testid="item-row"]')).toHaveLength(1)
  })
})
