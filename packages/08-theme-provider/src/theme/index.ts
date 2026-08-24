import { type App, type ComputedRef, computed, type InjectionKey, type Plugin, ref } from 'vue'

export type Theme = 'light' | 'dark'

export interface ThemeApi {
  /** Read-only: consumers change the theme through the actions. */
  theme: ComputedRef<Theme>
  isDark: ComputedRef<boolean>
  toggle: () => void
  set: (theme: Theme) => void
}

// TODO: a typed InjectionKey so inject() returns ThemeApi, not unknown
export const themeKey: InjectionKey<ThemeApi> = Symbol('theme')

export function createThemeApi(_initial: Theme = 'light'): ThemeApi {
  // TODO: hold the theme in a ref, expose it read-only, plus isDark/toggle/set
  throw new Error('not implemented')
}

export function createTheme(_initial: Theme = 'light'): Plugin {
  // TODO: a plugin whose install() provides the api app-wide
  return { install(_app: App) {} }
}

export function useTheme(): ThemeApi {
  // TODO: inject the api and throw a helpful error when the plugin is missing
  throw new Error('not implemented')
}
