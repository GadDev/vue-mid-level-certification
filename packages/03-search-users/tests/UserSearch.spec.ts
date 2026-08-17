import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UserSearch from '../src/components/UserSearch.vue'

function render() {
  return mount(UserSearch)
}

type Wrapper = ReturnType<typeof render>

function shown(wrapper: Wrapper): string[] {
  return wrapper.findAll('[data-testid="user"]').map(row => row.text())
}

async function search(wrapper: Wrapper, query: string) {
  await wrapper.get('[data-testid="search"]').setValue(query)
}

describe('UserSearch', () => {
  it('shows all users initially', () => {
    expect(shown(render())).toHaveLength(5)
  })

  it('renders name and role for each user', () => {
    expect(shown(render())[0]).toContain('Alice Johnson')
    expect(shown(render())[0]).toContain('Designer')
  })

  it('reports the result count', async () => {
    const wrapper = render()
    expect(wrapper.get('[data-testid="count"]').text()).toContain('5')

    await search(wrapper, 'Bob')
    expect(wrapper.get('[data-testid="count"]').text()).toContain('1')
  })

  it('filters by name', async () => {
    const wrapper = render()
    await search(wrapper, 'Smith')
    expect(shown(wrapper)).toEqual(['Bob Smith — Developer'])
  })

  it.each(['alice', 'ALICE', 'aLiCe'])('matches case-insensitively (%s)', async query => {
    const wrapper = render()
    await search(wrapper, query)
    expect(shown(wrapper)).toHaveLength(1)
    expect(shown(wrapper)[0]).toContain('Alice Johnson')
  })

  it('matches a substring in the middle of a name', async () => {
    const wrapper = render()
    await search(wrapper, 'oh')
    expect(shown(wrapper).length).toBeGreaterThanOrEqual(2) // Johnson, John Walker
  })

  it('matches names containing spaces', async () => {
    const wrapper = render()
    await search(wrapper, 'marie dup')
    expect(shown(wrapper)).toEqual(['Marie Dupont — Developer'])
  })

  it('trims the query', async () => {
    const wrapper = render()
    await search(wrapper, '   Bob   ')
    expect(shown(wrapper)).toHaveLength(1)
  })

  it.each([
    ['an empty query', ''],
    ['a whitespace-only query', '     '],
  ])('shows every user for %s', async (_label, query) => {
    const wrapper = render()
    await search(wrapper, query)
    expect(shown(wrapper)).toHaveLength(5)
    expect(wrapper.find('[data-testid="empty"]').exists()).toBe(false)
  })

  it('shows an empty state when nothing matches', async () => {
    const wrapper = render()
    await search(wrapper, 'zzz')

    expect(shown(wrapper)).toHaveLength(0)
    expect(wrapper.get('[data-testid="empty"]').text()).not.toBe('')
    expect(wrapper.get('[data-testid="count"]').text()).toContain('0')
  })

  it('recovers when the query is cleared', async () => {
    const wrapper = render()
    await search(wrapper, 'zzz')
    await search(wrapper, '')

    expect(shown(wrapper)).toHaveLength(5)
    expect(wrapper.find('[data-testid="empty"]').exists()).toBe(false)
  })

  it('does not search by role', async () => {
    const wrapper = render()
    await search(wrapper, 'Developer')
    expect(shown(wrapper)).toHaveLength(0)
  })
})
