import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Accordion from '../src/components/Accordion.vue'
import { type AccordionSection, sections } from '../src/data/sections'

function render(props: { sections?: AccordionSection[]; defaultOpen?: string | null } = {}) {
  return mount(Accordion, { props: { sections, ...props } })
}

type Wrapper = ReturnType<typeof render>

function isOpen(wrapper: Wrapper, id: string): boolean {
  return wrapper.find(`[data-testid="panel-${id}"]`).exists()
}

async function click(wrapper: Wrapper, id: string) {
  await wrapper.get(`[data-testid="header-${id}"]`).trigger('click')
}

describe('Accordion', () => {
  it('renders one header per section', () => {
    const wrapper = render()
    for (const section of sections) {
      expect(wrapper.get(`[data-testid="header-${section.id}"]`).text()).toBe(section.title)
    }
  })

  it('starts with every panel closed', () => {
    const wrapper = render()
    expect(sections.some(section => isOpen(wrapper, section.id))).toBe(false)
  })

  it('opens the clicked section', async () => {
    const wrapper = render()
    await click(wrapper, 'returns')
    expect(isOpen(wrapper, 'returns')).toBe(true)
    expect(wrapper.get('[data-testid="panel-returns"]').text()).toBe(sections[1].body)
  })

  it('keeps at most one section open', async () => {
    const wrapper = render()
    await click(wrapper, 'shipping')
    await click(wrapper, 'support')
    expect(isOpen(wrapper, 'shipping')).toBe(false)
    expect(isOpen(wrapper, 'support')).toBe(true)
    expect(sections.filter(section => isOpen(wrapper, section.id))).toHaveLength(1)
  })

  it('closes the open section when its own header is clicked again', async () => {
    const wrapper = render()
    await click(wrapper, 'shipping')
    await click(wrapper, 'shipping')
    expect(isOpen(wrapper, 'shipping')).toBe(false)
  })

  it('reflects the open state in aria-expanded', async () => {
    const wrapper = render()
    expect(wrapper.get('[data-testid="header-returns"]').attributes('aria-expanded')).toBe('false')
    await click(wrapper, 'returns')
    expect(wrapper.get('[data-testid="header-returns"]').attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('[data-testid="header-support"]').attributes('aria-expanded')).toBe('false')
  })

  it('opens the section named by defaultOpen', () => {
    const wrapper = render({ defaultOpen: 'support' })
    expect(isOpen(wrapper, 'support')).toBe(true)
    expect(isOpen(wrapper, 'shipping')).toBe(false)
  })

  it('ignores a defaultOpen that matches no section', () => {
    const wrapper = render({ defaultOpen: 'nope' })
    expect(sections.some(section => isOpen(wrapper, section.id))).toBe(false)
  })

  it('emits change with the open id, and null when it closes', async () => {
    const wrapper = render()
    await click(wrapper, 'returns')
    await click(wrapper, 'support')
    await click(wrapper, 'support')
    expect(wrapper.emitted('change')).toEqual([['returns'], ['support'], [null]])
  })

  it('renders nothing at all for an empty section list', () => {
    const wrapper = render({ sections: [] })
    expect(wrapper.findAll('button')).toHaveLength(0)
  })
})
