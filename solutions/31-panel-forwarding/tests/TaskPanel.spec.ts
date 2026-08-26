import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import TaskPanel from '../src/components/TaskPanel.vue'
import { resetTasks } from '../src/data/tasks'

function render() {
  return mount(TaskPanel)
}

describe('TaskPanel', () => {
  beforeEach(() => {
    resetTasks()
  })

  it('renders its own header text through the forwarded slot', () => {
    expect(render().get('[data-testid="panel-header"]').text()).toBe('Tasks')
  })

  it('renders one row per task through the forwarded item slot', () => {
    const wrapper = render()
    expect(wrapper.findAll('[data-testid="item-row"]')).toHaveLength(3)
    expect(wrapper.findAll('[data-testid="cell-label"]').map(c => c.text())).toEqual([
      'Write the lesson',
      'Wire up the router',
      'Ship the release',
    ])
  })

  it('uses the index exposed by the forwarded scoped slot as a 1-based number', () => {
    expect(
      render()
        .findAll('[data-testid="cell-index"]')
        .map(c => c.text())
    ).toEqual(['1', '2', '3'])
  })

  it('renders each task done status', () => {
    expect(
      render()
        .findAll('[data-testid="cell-done"]')
        .map(c => c.text())
    ).toEqual(['No', 'Yes', 'No'])
  })

  it('never falls back to the panel default item content', () => {
    expect(render().find('[data-testid="fallback-item"]').exists()).toBe(false)
  })

  it('renders its own footer counting done tasks', () => {
    const footer = render().get('[data-testid="custom-footer"]')
    expect(footer.text()).toContain('3')
    expect(footer.text()).toContain('1')
  })

  it('swaps to its own empty message when there are no tasks', async () => {
    const wrapper = render()
    await wrapper.get('[data-testid="toggle"]').trigger('click')

    expect(wrapper.findAll('[data-testid="item-row"]')).toHaveLength(0)
    expect(wrapper.get('[data-testid="custom-empty"]').text()).toBe('No tasks yet.')
  })

  it('comes back when the tasks are restored', async () => {
    const wrapper = render()
    await wrapper.get('[data-testid="toggle"]').trigger('click')
    await wrapper.get('[data-testid="toggle"]').trigger('click')

    expect(wrapper.findAll('[data-testid="item-row"]')).toHaveLength(3)
    expect(wrapper.find('[data-testid="custom-empty"]').exists()).toBe(false)
  })

  it('never leaks the items array onto the panel frame root element', () => {
    expect(render().get('[data-testid="panel-frame"]').attributes('items')).toBeUndefined()
  })
})
