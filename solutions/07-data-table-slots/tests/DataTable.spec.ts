import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DataTable from '../src/components/DataTable.vue'

interface Row {
  id: number
  name: string
}

const rows: Row[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
]

describe('DataTable', () => {
  it('renders one row per item', () => {
    const wrapper = mount(DataTable, { props: { items: rows } })
    expect(wrapper.findAll('[data-testid="row"]')).toHaveLength(2)
  })

  it('renders the caption only when given', () => {
    expect(
      mount(DataTable, { props: { items: rows } })
        .find('[data-testid="caption"]')
        .exists()
    ).toBe(false)
    expect(
      mount(DataTable, { props: { items: rows, caption: 'People' } })
        .get('[data-testid="caption"]')
        .text()
    ).toBe('People')
  })

  it('falls back to default header, row and footer content', () => {
    const wrapper = mount(DataTable, { props: { items: rows } })

    expect(wrapper.get('[data-testid="header-row"]').text()).toContain('Item')
    expect(wrapper.findAll('[data-testid="fallback-cell"]').map(c => c.text())).toEqual(['1', '2'])
    expect(wrapper.get('tfoot').text()).toContain('2')
  })

  it('lets the consumer replace the header', () => {
    const wrapper = mount(DataTable, {
      props: { items: rows },
      slots: { header: '<th>Name</th><th>Extra</th>' },
    })

    const header = wrapper.get('[data-testid="header-row"]')
    expect(header.findAll('th')).toHaveLength(2)
    expect(header.text()).not.toContain('Item')
  })

  it('passes item and index to the row slot', () => {
    const wrapper = mount(DataTable, {
      props: { items: rows },
      slots: {
        row: '<td class="i">{{ params.index }}</td><td class="n">{{ params.item.name }}</td>',
      },
    })

    expect(wrapper.findAll('.i').map(c => c.text())).toEqual(['0', '1'])
    expect(wrapper.findAll('.n').map(c => c.text())).toEqual(['Alice', 'Bob'])
    expect(wrapper.find('[data-testid="fallback-cell"]').exists()).toBe(false)
  })

  it('shows the empty fallback when there are no items', () => {
    const wrapper = mount(DataTable, { props: { items: [] as Row[] } })

    expect(wrapper.findAll('[data-testid="row"]')).toHaveLength(0)
    expect(wrapper.get('[data-testid="empty-row"]').text()).toBe('No data.')
  })

  it('lets the consumer replace the empty state', () => {
    const wrapper = mount(DataTable, {
      props: { items: [] as Row[] },
      slots: { empty: '<span class="none">Nothing</span>' },
    })

    expect(wrapper.get('.none').text()).toBe('Nothing')
    expect(wrapper.get('[data-testid="empty-row"]').text()).not.toContain('No data.')
  })

  it('hides the empty row as soon as there are items', async () => {
    const wrapper = mount(DataTable, { props: { items: [] as Row[] } })
    expect(wrapper.find('[data-testid="empty-row"]').exists()).toBe(true)

    await wrapper.setProps({ items: rows })
    expect(wrapper.find('[data-testid="empty-row"]').exists()).toBe(false)
    expect(wrapper.findAll('[data-testid="row"]')).toHaveLength(2)
  })

  it('passes the count to the footer slot', () => {
    const wrapper = mount(DataTable, {
      props: { items: rows },
      slots: { footer: '<span class="c">{{ params.count }} total</span>' },
    })

    expect(wrapper.get('.c').text()).toBe('2 total')
  })

  it('keeps rows keyed by id when the list changes', async () => {
    const wrapper = mount(DataTable, { props: { items: rows } })
    await wrapper.setProps({ items: [rows[1]] })

    expect(wrapper.findAll('[data-testid="row"]')).toHaveLength(1)
    expect(wrapper.get('[data-testid="fallback-cell"]').text()).toBe('2')
  })
})
