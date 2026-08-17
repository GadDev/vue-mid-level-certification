import { type Ref, ref } from 'vue'

/**
 * A ref backed by localStorage, kept in sync across tabs.
 */
export function useLocalStorage<T>(_key: string, initial: T): Ref<T> {
  // TODO:
  //  - read the stored value on creation, falling back to `initial` when the
  //    key is missing OR the stored JSON is corrupt
  //  - persist on change (deep — nested fields count)
  //  - listen for 'storage' events and pick up changes for this key only
  //  - remove that listener when the owning scope is disposed
  //  - never touch window unguarded: this must survive SSR
  return ref(initial) as Ref<T>
}
