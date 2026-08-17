import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EmployeeTable from '../src/components/EmployeeTable.vue'

function render() {
  return mount(EmployeeTable)
}

describe('EmployeeTable', () => {
  it('renders a header describing its own columns', () => {
    const header = render().get('[data-testid="header-row"]')
    expect(header.findAll('th')).toHaveLength(3)
    expect(header.text()).toContain('Name')
    expect(header.text()).toContain('Salary')
  })

  it('renders its own cells through the scoped row slot', () => {
    const wrapper = render()
    expect(wrapper.findAll('[data-testid="row"]')).toHaveLength(3)
    expect(wrapper.findAll('[data-testid="cell-name"]').map(c => c.text())).toEqual([
      'Alice Johnson',
      'Bob Smith',
      'Marie Dupont',
    ])
    expect(wrapper.findAll('[data-testid="cell-role"]')[1].text()).toBe('Developer')
  })

  it('uses the index exposed by the slot as a 1-based number', () => {
    expect(
      render()
        .findAll('[data-testid="cell-index"]')
        .map(c => c.text())
    ).toEqual(['1', '2', '3'])
  })

  it('never falls back to the table default cells', () => {
    expect(render().find('[data-testid="fallback-cell"]').exists()).toBe(false)
  })

  it('renders its own footer from the slot count', () => {
    const footer = render().get('[data-testid="custom-footer"]')
    expect(footer.text()).toContain('3')
    expect(footer.text()).toContain('207000')
  })

  it('swaps to its own empty state when there are no rows', async () => {
    const wrapper = render()
    await wrapper.get('[data-testid="toggle"]').trigger('click')

    expect(wrapper.findAll('[data-testid="row"]')).toHaveLength(0)
    expect(wrapper.get('[data-testid="custom-empty"]').text()).toBe('Nobody here yet.')
    expect(wrapper.get('[data-testid="custom-footer"]').text()).toContain('0')
  })

  it('comes back when the rows are restored', async () => {
    const wrapper = render()
    await wrapper.get('[data-testid="toggle"]').trigger('click')
    await wrapper.get('[data-testid="toggle"]').trigger('click')

    expect(wrapper.findAll('[data-testid="row"]')).toHaveLength(3)
    expect(wrapper.find('[data-testid="custom-empty"]').exists()).toBe(false)
  })
})
