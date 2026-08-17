import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ShoppingList from '../src/components/ShoppingList.vue'

function render() {
  return mount(ShoppingList)
}

type Wrapper = ReturnType<typeof render>

function names(wrapper: Wrapper): string[] {
  return wrapper.findAll('[data-testid="item-name"]').map(n => n.text())
}

async function add(wrapper: Wrapper, value: string) {
  await wrapper.get('[data-testid="new-item"]').setValue(value)
  await wrapper.get('[data-testid="add-form"]').trigger('submit')
}

async function clickIn(wrapper: Wrapper, row: number, testid: string) {
  await wrapper.findAll('li')[row].get(`[data-testid="${testid}"]`).trigger('click')
}

describe('ShoppingList', () => {
  it('starts with three items', () => {
    expect(names(render())).toEqual(['Coffee', 'Apples', 'Bread'])
  })

  it('adds a trimmed item and clears the input', async () => {
    const wrapper = render()
    await add(wrapper, '  Milk  ')

    expect(names(wrapper)).toEqual(['Coffee', 'Apples', 'Bread', 'Milk'])
    expect(wrapper.get<HTMLInputElement>('[data-testid="new-item"]').element.value).toBe('')
  })

  it.each([
    ['blank', ''],
    ['whitespace only', '   '],
  ])('rejects a %s name', async (_label, value) => {
    const wrapper = render()
    await add(wrapper, value)
    expect(names(wrapper)).toHaveLength(3)
  })

  it('deletes the clicked item only', async () => {
    const wrapper = render()
    await clickIn(wrapper, 1, 'delete')
    expect(names(wrapper)).toEqual(['Coffee', 'Bread'])
  })

  it('duplicates an item without reusing its id', async () => {
    const wrapper = render()
    await clickIn(wrapper, 0, 'duplicate')

    expect(names(wrapper).filter(n => n === 'Coffee')).toHaveLength(2)

    // Unique keys: editing one copy must not put the other into edit mode.
    const coffeeRows = wrapper.findAll('li').filter(li => li.text().includes('Coffee'))
    await coffeeRows[0].get('[data-testid="edit"]').trigger('click')
    expect(wrapper.findAll('[data-testid="edit-input"]')).toHaveLength(1)
  })

  it('renames an item through inline editing', async () => {
    const wrapper = render()
    await clickIn(wrapper, 0, 'edit')

    expect(wrapper.get<HTMLInputElement>('[data-testid="edit-input"]').element.value).toBe('Coffee')
    await wrapper.get('[data-testid="edit-input"]').setValue('  Tea  ')
    await wrapper.get('[data-testid="save"]').trigger('click')

    expect(names(wrapper)).toEqual(['Tea', 'Apples', 'Bread'])
    expect(wrapper.find('[data-testid="edit-input"]').exists()).toBe(false)
  })

  it('edits only one item at a time', async () => {
    const wrapper = render()
    await clickIn(wrapper, 0, 'edit')
    await clickIn(wrapper, 1, 'edit')

    expect(wrapper.findAll('[data-testid="edit-input"]')).toHaveLength(1)
    expect(wrapper.get<HTMLInputElement>('[data-testid="edit-input"]').element.value).toBe('Apples')
  })

  it.each([
    ['blank', ''],
    ['whitespace only', '   '],
  ])('keeps the original name when saving a %s edit', async (_label, value) => {
    const wrapper = render()
    await clickIn(wrapper, 2, 'edit')
    await wrapper.get('[data-testid="edit-input"]').setValue(value)
    await wrapper.get('[data-testid="save"]').trigger('click')

    expect(names(wrapper)).toEqual(['Coffee', 'Apples', 'Bread'])
  })

  it('leaves edit mode behind when the edited item is deleted', async () => {
    const wrapper = render()
    await clickIn(wrapper, 1, 'edit')
    const editedRow = wrapper.findAll('li')[1]
    await editedRow.get('[data-testid="delete"]').trigger('click')

    expect(names(wrapper)).toEqual(['Coffee', 'Bread'])
    expect(wrapper.find('[data-testid="edit-input"]').exists()).toBe(false)
    expect(wrapper.findAll('[data-testid="item-name"]')).toHaveLength(2)
  })

  it('sorts A–Z', async () => {
    const wrapper = render()
    await wrapper.get('[data-testid="sort"]').trigger('click')
    expect(names(wrapper)).toEqual(['Apples', 'Bread', 'Coffee'])
  })

  it('keeps the same item in edit mode when sorting mid-edit', async () => {
    const wrapper = render()
    await clickIn(wrapper, 0, 'edit') // Coffee
    await wrapper.get('[data-testid="sort"]').trigger('click')

    const editInputs = wrapper.findAll('[data-testid="edit-input"]')
    expect(editInputs).toHaveLength(1)
    expect(editInputs[0].element).toBeInstanceOf(HTMLInputElement)
    expect((editInputs[0].element as HTMLInputElement).value).toBe('Coffee')

    // Coffee sorts last, so the edit row must have moved with it.
    const rows = wrapper.findAll('li')
    expect(rows[rows.length - 1].find('[data-testid="edit-input"]').exists()).toBe(true)

    await wrapper.get('[data-testid="edit-input"]').setValue('Cocoa')
    await wrapper.get('[data-testid="save"]').trigger('click')
    expect(names(wrapper)).toEqual(['Apples', 'Bread', 'Cocoa'])
  })

  it('sorts newly added items too', async () => {
    const wrapper = render()
    await add(wrapper, 'Almonds')
    await wrapper.get('[data-testid="sort"]').trigger('click')
    expect(names(wrapper)).toEqual(['Almonds', 'Apples', 'Bread', 'Coffee'])
  })
})
