import { describe, expect, it } from 'vitest'
import { useCounterHistory } from '../src/composables/useCounterHistory'

describe('useCounterHistory', () => {
  it('starts at the initial value with an empty history', () => {
    const history = useCounterHistory(0)
    expect(history.count.value).toBe(0)
    expect(history.canUndo.value).toBe(false)
    expect(history.canRedo.value).toBe(false)
  })

  it('accepts a custom initial value', () => {
    expect(useCounterHistory(7).count.value).toBe(7)
  })

  it('increments and decrements', () => {
    const { count, increment, decrement } = useCounterHistory(0)
    increment()
    increment()
    decrement()
    expect(count.value).toBe(1)
  })

  it('goes negative', () => {
    const { count, decrement } = useCounterHistory(0)
    decrement()
    decrement()
    expect(count.value).toBe(-2)
  })

  it('undoes each count-changing action one step at a time', () => {
    const { count, increment, undo, canUndo } = useCounterHistory(0)
    increment()
    increment()

    undo()
    expect(count.value).toBe(1)
    undo()
    expect(count.value).toBe(0)
    expect(canUndo.value).toBe(false)
  })

  it('redoes what was undone', () => {
    const { count, increment, undo, redo, canRedo } = useCounterHistory(0)
    increment()
    undo()
    expect(canRedo.value).toBe(true)

    redo()
    expect(count.value).toBe(1)
    expect(canRedo.value).toBe(false)
  })

  it('treats reset as an undoable action', () => {
    const { count, increment, reset, undo } = useCounterHistory(0)
    increment()
    increment()
    reset()
    expect(count.value).toBe(0)

    undo()
    expect(count.value).toBe(2)
  })

  it('does not record a reset that changes nothing', () => {
    const { canUndo, reset } = useCounterHistory(0)
    reset()
    expect(canUndo.value).toBe(false)
  })

  it('clears the redo history when a new change follows an undo', () => {
    const { count, increment, decrement, undo, canRedo } = useCounterHistory(0)
    increment()
    increment()
    undo()
    expect(canRedo.value).toBe(true)

    decrement()
    expect(count.value).toBe(0)
    expect(canRedo.value).toBe(false)
  })

  it('ignores undo and redo when there is nothing to do', () => {
    const { count, undo, redo } = useCounterHistory(3)
    undo()
    redo()
    expect(count.value).toBe(3)
  })

  it('survives repeated undo/redo cycles', () => {
    const { count, increment, undo, redo } = useCounterHistory(0)
    increment()
    increment()
    increment()

    undo()
    undo()
    undo()
    undo() // one too many
    expect(count.value).toBe(0)

    redo()
    redo()
    redo()
    redo() // one too many
    expect(count.value).toBe(3)
  })

  it('exposes count as read-only', () => {
    const { count } = useCounterHistory(0)
    // @ts-expect-error the composable owns the count; callers use the actions
    count.value = 42
    expect(count.value).toBe(0)
  })

  it('gives every caller an independent counter', () => {
    const a = useCounterHistory(0)
    const b = useCounterHistory(0)
    a.increment()
    expect(a.count.value).toBe(1)
    expect(b.count.value).toBe(0)
    expect(b.canUndo.value).toBe(false)
  })
})
