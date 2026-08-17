// This vitest/jsdom combination does not expose window.localStorage, so the
// suite installs a minimal in-memory Storage. Nothing in src/ depends on it —
// it only makes the browser API available under test.
if (typeof window !== 'undefined' && !window.localStorage) {
  const store = new Map<string, string>()
  const storage: Storage = {
    get length() {
      return store.size
    },
    clear: () => store.clear(),
    getItem: key => (store.has(key) ? (store.get(key) as string) : null),
    key: index => [...store.keys()][index] ?? null,
    removeItem: key => {
      store.delete(key)
    },
    setItem: (key, value) => {
      store.set(key, String(value))
    },
  }
  Object.defineProperty(window, 'localStorage', { value: storage, configurable: true })
}
