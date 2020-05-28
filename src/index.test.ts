import { renderHook, act } from '@testing-library/react-hooks'
import { createPartialSetState } from './index'
import { useState } from 'react'
import { optic } from 'optics-ts'
import * as io from 'io-ts'

test('should only update matching prisms in a multi focal optic, traversal of prisms', () => {
  const aIO = io.type({ a: io.number })
  const bIO = io.type({ b: io.string })
  type A = typeof aIO._A
  type B = typeof bIO._A
  type TopState = {
    abs: Array<A | B>
  }

  const initialState: TopState = {
    abs: [{ a: 5 }, { b: 'hello' }, { a: 10 }, { b: 'waddup' }],
  }
  const updatedState: TopState = {
    abs: [{ a: 50 }, { b: 'hello' }, { a: 100 }, { b: 'waddup' }],
  }

  const myOptic = optic<TopState>()
    .prop('abs')
    .elems()
    .guard(aIO.is)
    .prop('a')

  const { result: stateResult } = renderHook(() => useState(initialState))
  const partialSetState = createPartialSetState(stateResult.current[1], myOptic)

  act(() => {
    partialSetState(oldValue => oldValue * 10)
  })

  expect(stateResult.current[0]).toStrictEqual(updatedState)
})

test('should work with multi-focal optics, a.k.a traversals', () => {
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

test('should update deeply and correctly', () => {
  type topState = {
    a: { b: Array<number> }
  }

  const initialState: topState = { a: { b: [1, 2, 3] } }
  const myOptic = optic<topState>()
    .prop('a')
    .prop('b')
    .index(0)

  const { result: stateResult } = renderHook(() => useState(initialState))
  const partialSetState = createPartialSetState(stateResult.current[1], myOptic)

  act(() => {
    partialSetState(10)
  })

  expect(stateResult.current[0]).toStrictEqual({ a: { b: [10, 2, 3] } })
})

test('should not update non-existing index', () => {
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
