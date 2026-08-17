import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import App from '../src/App.vue'
import ThemedPanel from '../src/components/ThemedPanel.vue'
import { createTheme, createThemeApi, type Theme } from '../src/theme'

function render(initial: Theme = 'light') {
  return mount(App, { global: { plugins: [createTheme(initial)] } })
}

type Wrapper = ReturnType<typeof render>

function text(wrapper: Wrapper, testid: string): string {
  return wrapper.get(`[data-testid="${testid}"]`).text()
}

describe('theme api', () => {
  it('starts light by default and exposes isDark', () => {
    const api = createThemeApi()
    expect(api.theme.value).toBe('light')
    expect(api.isDark.value).toBe(false)
  })

  it('accepts an initial theme', () => {
    const api = createThemeApi('dark')
    expect(api.theme.value).toBe('dark')
    expect(api.isDark.value).toBe(true)
  })

  it('toggles back and forth', () => {
    const api = createThemeApi('light')
    api.toggle()
    expect(api.theme.value).toBe('dark')
    api.toggle()
    expect(api.theme.value).toBe('light')
  })

  it('sets a theme explicitly and idempotently', () => {
    const api = createThemeApi('light')
    api.set('dark')
    api.set('dark')
    expect(api.theme.value).toBe('dark')
  })

  it('exposes the theme read-only', () => {
    const api = createThemeApi('light')
    // @ts-expect-error the api owns the theme; consumers use toggle/set
    api.theme.value = 'dark'
    expect(api.theme.value).toBe('light')
  })
})

describe('theme plugin', () => {
  it('reaches every consumer, at any depth', () => {
    const wrapper = render('light')
    expect(text(wrapper, 'toggle-theme')).toBe('light')
    expect(text(wrapper, 'panel-theme')).toBe('light')
    expect(text(wrapper, 'deep-theme')).toBe('light')
  })

  it('honours the initial theme passed to the plugin', () => {
    const wrapper = render('dark')
    expect(text(wrapper, 'deep-theme')).toBe('dark')
    expect(wrapper.get('[data-testid="panel"]').classes()).toContain('theme-dark')
  })

  it('updates every consumer when one of them toggles', async () => {
    const wrapper = render('light')
    await wrapper.get('[data-testid="toggle"]').trigger('click')

    expect(text(wrapper, 'toggle-theme')).toBe('dark')
    expect(text(wrapper, 'panel-theme')).toBe('dark')
    expect(text(wrapper, 'deep-theme')).toBe('dark')
    expect(wrapper.get('[data-testid="panel"]').classes()).toContain('theme-dark')
    expect(wrapper.get('[data-testid="panel"]').attributes('data-dark')).toBe('true')
  })

  it('supports setting the theme directly from a consumer', async () => {
    const wrapper = render('light')
    await wrapper.get('[data-testid="force-dark"]').trigger('click')
    expect(text(wrapper, 'deep-theme')).toBe('dark')

    await wrapper.get('[data-testid="force-dark"]').trigger('click')
    expect(text(wrapper, 'deep-theme')).toBe('dark')
  })

  it('gives separate apps separate theme state', async () => {
    const first = render('light')
    const second = render('light')

    await first.get('[data-testid="toggle"]').trigger('click')
    expect(text(first, 'deep-theme')).toBe('dark')
    expect(text(second, 'deep-theme')).toBe('light')
  })

  it('fails loudly when the plugin is missing', () => {
    expect(() => mount(ThemedPanel)).toThrow(/theme plugin/i)
  })
})
