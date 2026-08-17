import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ScrollList from '../src/components/ScrollList.vue'

// jsdom does not implement scrollIntoView, so we stub it and assert on the calls.
const scrollIntoView = vi.fn()
Element.prototype.scrollIntoView = scrollIntoView

function render() {
  return mount(ScrollList, { attachTo: document.body })
}

async function submit(wrapper: ReturnType<typeof render>, value: string) {
  await wrapper.get('[data-testid="index"]').setValue(value)
  await wrapper.get('form').trigger('submit')
  await wrapper.vm.$nextTick()
}

beforeEach(() => {
  vi.useFakeTimers()
  scrollIntoView.mockClear()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('ScrollList', () => {
  it('renders 20 items', () => {
    expect(render().findAll('.item')).toHaveLength(20)
  })

  it('highlights and scrolls to the submitted 1-based index', async () => {
    const wrapper = render()
    await submit(wrapper, '7')

    const items = wrapper.findAll('.item')
    expect(items[6].classes()).toContain('highlighted')
    expect(items.filter(i => i.classes().includes('highlighted'))).toHaveLength(1)
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(scrollIntoView.mock.instances[0]).toBe(items[6].element)
  })

  it('accepts the first and last valid index', async () => {
    const wrapper = render()
    await submit(wrapper, '1')
    expect(wrapper.findAll('.item')[0].classes()).toContain('highlighted')

    await submit(wrapper, '20')
    expect(wrapper.findAll('.item')[19].classes()).toContain('highlighted')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('removes the highlight after about one second', async () => {
    const wrapper = render()
    await submit(wrapper, '3')
    expect(wrapper.findAll('.item')[2].classes()).toContain('highlighted')

    vi.advanceTimersByTime(999)
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.item')[2].classes()).toContain('highlighted')

    vi.advanceTimersByTime(2)
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.highlighted')).toHaveLength(0)
  })

  it('trims whitespace around a valid index', async () => {
    const wrapper = render()
    await submit(wrapper, '  4  ')
    expect(wrapper.findAll('.item')[3].classes()).toContain('highlighted')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it.each([
    ['empty', ''],
    ['whitespace only', '   '],
    ['non-numeric', 'abc'],
    ['zero', '0'],
    ['negative', '-3'],
    ['decimal', '2.5'],
    ['above the range', '21'],
  ])('rejects %s input without scrolling', async (_label, value) => {
    const wrapper = render()
    await submit(wrapper, value)

    expect(wrapper.get('[role="alert"]').text()).not.toBe('')
    expect(wrapper.findAll('.highlighted')).toHaveLength(0)
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('clears a previous error once a valid index is submitted', async () => {
    const wrapper = render()
    await submit(wrapper, 'abc')
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)

    await submit(wrapper, '5')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.findAll('.item')[4].classes()).toContain('highlighted')
  })

  it('drops the highlight when an invalid index follows a valid one', async () => {
    const wrapper = render()
    await submit(wrapper, '5')
    await submit(wrapper, '99')

    expect(wrapper.findAll('.highlighted')).toHaveLength(0)
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })

  it('restarts the highlight timer when the same item is submitted twice', async () => {
    const wrapper = render()
    await submit(wrapper, '9')

    vi.advanceTimersByTime(800)
    await submit(wrapper, '9')

    // The first timer would have fired here; a correct implementation reset it.
    vi.advanceTimersByTime(300)
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.item')[8].classes()).toContain('highlighted')
    expect(scrollIntoView).toHaveBeenCalledTimes(2)
  })

  it('keeps only the last target highlighted on rapid submissions', async () => {
    const wrapper = render()
    await submit(wrapper, '2')
    await submit(wrapper, '11')
    await submit(wrapper, '18')

    const highlighted = wrapper.findAll('.highlighted')
    expect(highlighted).toHaveLength(1)
    expect(highlighted[0].text()).toBe('Item 18')

    vi.advanceTimersByTime(1001)
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.highlighted')).toHaveLength(0)
  })
})
