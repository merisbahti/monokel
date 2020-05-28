import { renderHook, act } from '@testing-library/react-hooks'
import { createPartialSetState } from './index'
import { useState } from 'react'
import { optic } from 'optics-ts'

test('should work with objects and arrays', () => {
  type topState = {
    a: { b: Array<number> }
  }

  const initialState: topState = { a: { b: [1, 2, 3] } }
  const myOptic = optic<topState>()
    .prop('a')
    .prop('b')
    .elems()

  const { result: stateResult } = renderHook(() => useState(initialState))
  const partialSetState = createPartialSetState(stateResult.current[1], myOptic)

  act(() => {
    partialSetState(oldValue => oldValue + 5)
  })

  expect(stateResult.current[0]).toStrictEqual({
    a: { b: [1, 2, 3].map(x => x + 5) },
  })
})

test('should work with objects and arrays', () => {
  type topState = {
    a: { b: Array<number> }
  }

  const initialState: topState = { a: { b: [1, 2, 3] } }
  const myOptic = optic<topState>()
    .prop('a')
    .prop('b')
    .index(10)

  const { result: stateResult } = renderHook(() => useState(initialState))
  const partialSetState = createPartialSetState(stateResult.current[1], myOptic)

  act(() => {
    partialSetState(oldValue => oldValue + 5)
  })

  expect(stateResult.current[0]).toStrictEqual(initialState)
})
