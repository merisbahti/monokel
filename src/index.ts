import * as O from 'optics-ts'
import { useCallback } from 'react'
import { Dispatch, SetStateAction } from 'react'

type SetState<S> = Dispatch<SetStateAction<S>>

export const usePartialSetState = <S, A>(
  setState: SetState<S>,
  optic:
    | O.Lens<S, any, A>
    | O.Prism<S, any, A>
    | O.Iso<S, any, A>
    | O.Traversal<S, any, A>
    | O.Equivalence<S, any, A>,
): SetState<A> =>
  useCallback(usePartialSetState(setState, optic), [setState, optic])

export const createPartialSetState = <S, A>(
  setState: SetState<S>,
  optic:
    | O.Lens<S, any, A>
    | O.Prism<S, any, A>
    | O.Iso<S, any, A>
    | O.Traversal<S, any, A>
    | O.Equivalence<S, any, A>,
): SetState<A> => updater =>
  setState(
    O.modify(optic)(oldValue =>
      updater instanceof Function ? updater(oldValue) : updater,
    ),
  )

