import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Rating from '../src/components/Rating.vue'

function render(props: { modelValue?: number; max?: number; readonly?: boolean } = {}) {
  return mount(Rating, { props: { modelValue: 0, ...props } })
}

type Wrapper = ReturnType<typeof render>

function filled(wrapper: Wrapper): number {
  return wrapper.findAll('button').filter(star => star.classes().includes('filled')).length
}

function emittedValues(wrapper: Wrapper): number[] {
  return (wrapper.emitted('update:modelValue') ?? []).map(args => args[0] as number)
}

async function key(wrapper: Wrapper, name: string) {
  await wrapper.get('[data-testid="rating"]').trigger('keydown', { key: name })
}

describe('Rating', () => {
  it('renders five stars by default', () => {
    expect(render().findAll('button')).toHaveLength(5)
  })

  it('honours a custom max', () => {
    expect(render({ max: 3 }).findAll('button')).toHaveLength(3)
  })

  it('fills the stars up to the current value', () => {
    const wrapper = render({ modelValue: 3 })
    expect(filled(wrapper)).toBe(3)
    expect(wrapper.get('[data-testid="value"]').text()).toBe('3')
  })

  it('emits the clicked value', async () => {
    const wrapper = render()
    await wrapper.get('[data-testid="star-4"]').trigger('click')
    expect(emittedValues(wrapper)).toEqual([4])
  })

  it('clears the rating when the current value is clicked again', async () => {
    const wrapper = render({ modelValue: 2 })
    await wrapper.get('[data-testid="star-2"]').trigger('click')
    expect(emittedValues(wrapper)).toEqual([0])
  })

  it('previews on hover without committing', async () => {
    const wrapper = render({ modelValue: 1 })
    await wrapper.get('[data-testid="star-4"]').trigger('mouseenter')
    expect(filled(wrapper)).toBe(4)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('restores the real value when the pointer leaves', async () => {
    const wrapper = render({ modelValue: 1 })
    await wrapper.get('[data-testid="star-4"]').trigger('mouseenter')
    await wrapper.get('[data-testid="rating"]').trigger('mouseleave')
    expect(filled(wrapper)).toBe(1)
  })

  it('steps up and down with the arrow keys', async () => {
    const wrapper = render({ modelValue: 2 })
    await key(wrapper, 'ArrowRight')
    expect(emittedValues(wrapper)).toEqual([3])

    await wrapper.setProps({ modelValue: 3 })
    await key(wrapper, 'ArrowLeft')
    expect(emittedValues(wrapper)).toEqual([3, 2])
  })

  it('clamps the arrow keys to the ends of the scale', async () => {
    const top = render({ modelValue: 5 })
    await key(top, 'ArrowRight')
    expect(emittedValues(top)).toEqual([])

    const bottom = render({ modelValue: 0 })
    await key(bottom, 'ArrowLeft')
    expect(emittedValues(bottom)).toEqual([])
  })

  it('jumps to both ends with Home and End', async () => {
    const wrapper = render({ modelValue: 3 })
    await key(wrapper, 'Home')
    await key(wrapper, 'End')
    expect(emittedValues(wrapper)).toEqual([0, 5])
  })

  it('leaves unrelated keys alone', async () => {
    const wrapper = render({ modelValue: 3 })
    await key(wrapper, 'a')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('is focusable so the keyboard can reach it', () => {
    expect(render().get('[data-testid="rating"]').attributes('tabindex')).toBe('0')
  })

  it('exposes its value and bounds to assistive tech', () => {
    const wrapper = render({ modelValue: 2, max: 7 })
    const group = wrapper.get('[data-testid="rating"]')
    expect(group.attributes('aria-valuenow')).toBe('2')
    expect(group.attributes('aria-valuemin')).toBe('0')
    expect(group.attributes('aria-valuemax')).toBe('7')
  })

  it('ignores clicks and keys while readonly', async () => {
    const wrapper = render({ modelValue: 2, readonly: true })
    await wrapper.get('[data-testid="star-5"]').trigger('click')
    await key(wrapper, 'ArrowRight')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.get('[data-testid="rating"]').attributes('tabindex')).toBeUndefined()
  })

  it('does not preview on hover while readonly', async () => {
    const wrapper = render({ modelValue: 2, readonly: true })
    await wrapper.get('[data-testid="star-5"]').trigger('mouseenter')
    expect(filled(wrapper)).toBe(2)
  })
})
