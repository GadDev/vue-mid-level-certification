import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Tabs from '../src/components/Tabs.vue'
import { type Tab, tabs } from '../src/data/tabs'

function render(list: Tab[] = tabs) {
  return mount(Tabs, { props: { tabs: list } })
}

type Wrapper = ReturnType<typeof render>

function panel(wrapper: Wrapper): string {
  return wrapper.get('[data-testid="panel"]').text()
}

function selected(wrapper: Wrapper): string[] {
  return wrapper
    .findAll('[role="tab"]')
    .filter(tab => tab.attributes('aria-selected') === 'true')
    .map(tab => tab.text())
}

async function click(wrapper: Wrapper, id: string) {
  await wrapper.get(`[data-testid="tab-${id}"]`).trigger('click')
}

describe('Tabs', () => {
  it('renders one button per tab', () => {
    const wrapper = render()
    expect(wrapper.findAll('[role="tab"]').map(tab => tab.text())).toEqual([
      'Overview',
      'Specs',
      'Reviews',
    ])
  })

  it('selects the first tab and shows its content', () => {
    const wrapper = render()
    expect(selected(wrapper)).toEqual(['Overview'])
    expect(panel(wrapper)).toBe(tabs[0].content)
  })

  it('marks the active tab with the active class', async () => {
    const wrapper = render()
    expect(wrapper.get('[data-testid="tab-overview"]').classes()).toContain('active')
    await click(wrapper, 'specs')
    expect(wrapper.get('[data-testid="tab-specs"]').classes()).toContain('active')
    expect(wrapper.get('[data-testid="tab-overview"]').classes()).not.toContain('active')
  })

  it('switches content on click', async () => {
    const wrapper = render()
    await click(wrapper, 'reviews')
    expect(selected(wrapper)).toEqual(['Reviews'])
    expect(panel(wrapper)).toBe(tabs[2].content)
  })

  it('emits change once per real selection change', async () => {
    const wrapper = render()
    await click(wrapper, 'specs')
    await click(wrapper, 'specs')
    await click(wrapper, 'reviews')
    expect(wrapper.emitted('change')).toEqual([['specs'], ['reviews']])
  })

  it('keeps the selected tab after a data refresh', async () => {
    const wrapper = render()
    await click(wrapper, 'reviews')

    // Same tabs, fresh objects — as if the list had been re-fetched.
    await wrapper.setProps({ tabs: tabs.map(tab => ({ ...tab })) })
    expect(selected(wrapper)).toEqual(['Reviews'])
    expect(panel(wrapper)).toBe(tabs[2].content)
  })

  it('shows refreshed content for the tab that stayed selected', async () => {
    const wrapper = render()
    await click(wrapper, 'specs')
    await wrapper.setProps({
      tabs: tabs.map(tab => (tab.id === 'specs' ? { ...tab, content: 'Updated specs.' } : tab)),
    })
    expect(panel(wrapper)).toBe('Updated specs.')
  })

  it('falls back to the first tab when the selected one disappears', async () => {
    const wrapper = render()
    await click(wrapper, 'reviews')
    await wrapper.setProps({ tabs: tabs.filter(tab => tab.id !== 'reviews') })
    expect(selected(wrapper)).toEqual(['Overview'])
    expect(panel(wrapper)).toBe(tabs[0].content)
  })

  it('keeps the selection when tabs are appended', async () => {
    const wrapper = render()
    await click(wrapper, 'specs')
    await wrapper.setProps({ tabs: [...tabs, { id: 'faq', label: 'FAQ', content: 'Ask away.' }] })
    expect(selected(wrapper)).toEqual(['Specs'])
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(4)
  })

  it('shows the empty state and no panel without tabs', () => {
    const wrapper = render([])
    expect(wrapper.find('[data-testid="panel"]').exists()).toBe(false)
    expect(wrapper.get('[data-testid="empty"]').text()).toBe('No tabs.')
  })

  it('recovers from empty to a selected first tab', async () => {
    const wrapper = render([])
    await wrapper.setProps({ tabs })
    expect(selected(wrapper)).toEqual(['Overview'])
    expect(wrapper.find('[data-testid="empty"]').exists()).toBe(false)
  })
})
