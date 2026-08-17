import { type ShallowRef, shallowRef } from 'vue'

export interface WindowSize {
  width: ShallowRef<number>
  height: ShallowRef<number>
}

export function useWindowSize(): WindowSize {
  // TODO: initialise from window.innerWidth/innerHeight (0 when there is no
  // window), update on 'resize', and remove the listener on scope dispose.
  const width = shallowRef(0)
  const height = shallowRef(0)

  return { width, height }
}
