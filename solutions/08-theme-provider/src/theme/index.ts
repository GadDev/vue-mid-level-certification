import {
  type App,
  type ComputedRef,
  computed,
  type InjectionKey,
  inject,
  type Plugin,
  ref,
} from 'vue'

export type Theme = 'light' | 'dark'

export interface ThemeApi {
  /** Read-only: consumers change the theme through the actions. */
  theme: ComputedRef<Theme>
  isDark: ComputedRef<boolean>
  toggle: () => void
  set: (theme: Theme) => void
}

// A typed InjectionKey is what makes inject() return ThemeApi instead of unknown.
export const themeKey: InjectionKey<ThemeApi> = Symbol('theme')

export function createThemeApi(initial: Theme = 'light'): ThemeApi {
  const theme = ref<Theme>(initial)

  return {
    theme: computed(() => theme.value),
    isDark: computed(() => theme.value === 'dark'),
    toggle: () => {
      theme.value = theme.value === 'light' ? 'dark' : 'light'
    },
    set: (next: Theme) => {
      theme.value = next
    },
  }
}

// app.provide (not provide()) is what makes a plugin's value reachable from
// every component in the app, at any depth.
export function createTheme(initial: Theme = 'light'): Plugin {
  return {
    install(app: App) {
      app.provide(themeKey, createThemeApi(initial))
    },
  }
}

export function useTheme(): ThemeApi {
  const api = inject(themeKey)
  // Failing loudly beats returning a silent default: a missing plugin is a bug,
  // not a state.
  if (!api) throw new Error('useTheme() requires the theme plugin. Did you app.use(createTheme())?')
  return api
}
