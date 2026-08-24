import {
  inject,
  type App,
  type ComputedRef,
  computed,
  type InjectionKey,
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

const isDark = computed(() => {
  return false
})

const theme = computed<Theme>(() => {
  return 'light'
})
// TODO: a typed InjectionKey so inject() returns ThemeApi, not unknown
export const themeKey: InjectionKey<ThemeApi> = Symbol('theme')

export function createThemeApi(_initial: Theme = 'light'): ThemeApi {
  // TODO: hold the theme in a ref, expose it read-only, plus isDark/toggle/set
  const _theme = ref<Theme>(_initial)
  const theme = computed(() => _theme.value)

  const isDark = computed(() => _theme.value === 'dark')

  function toggle() {
    _theme.value = _theme.value === 'light' ? 'light' : 'dark'
  }

  function set(next: Theme) {
    _theme.value = next
  }

  return { theme, isDark, toggle, set }
}

export function createTheme(_initial: Theme = 'light'): Plugin {
  // TODO: a plugin whose install() provides the api app-wide
  return {
    install(_app: App, _initial) {
      const api = createThemeApi(_initial)
      _app.provide(themeKey, api)
    },
  }
}

export function useTheme(): ThemeApi {
  // TODO: inject the api and throw a helpful error when the plugin is missing
  const api = inject(themeKey)
  if (!api) {
    throw new Error(
      'useTheme() was called without the theme plugin installed. Did you forget app.use(createTheme())?'
    )
  }
  return api
}
