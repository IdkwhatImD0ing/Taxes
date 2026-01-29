'use client'

import { useState, useCallback, useTransition } from 'react'

interface AsyncActionState<T> {
  isLoading: boolean
  error: string | null
  data: T | null
}

interface UseAsyncActionOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

interface UseAsyncActionReturn<T, Args extends unknown[]> extends AsyncActionState<T> {
  execute: (...args: Args) => Promise<T | null>
  reset: () => void
  isPending: boolean
}

/**
 * Custom hook for handling async actions with consistent loading/error states.
 * Uses React's useTransition for non-blocking updates.
 * 
 * @example
 * const { execute, isLoading, error } = useAsyncAction(
 *   async (id: string) => {
 *     const result = await deleteItem(id)
 *     if (result.error) throw new Error(result.error)
 *     return result
 *   },
 *   { onSuccess: () => console.log('Deleted!') }
 * )
 */
export function useAsyncAction<T, Args extends unknown[]>(
  action: (...args: Args) => Promise<T>,
  options?: UseAsyncActionOptions
): UseAsyncActionReturn<T, Args> {
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<AsyncActionState<T>>({
    isLoading: false,
    error: null,
    data: null,
  })

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      
      try {
        let result: T | null = null
        
        await new Promise<void>((resolve) => {
          startTransition(async () => {
            try {
              result = await action(...args)
              setState({ isLoading: false, error: null, data: result })
              options?.onSuccess?.()
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : 'An error occurred'
              setState({ isLoading: false, error: errorMessage, data: null })
              options?.onError?.(errorMessage)
            }
            resolve()
          })
        })
        
        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred'
        setState({ isLoading: false, error: errorMessage, data: null })
        options?.onError?.(errorMessage)
        return null
      }
    },
    [action, options]
  )

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, data: null })
  }, [])

  return {
    ...state,
    execute,
    reset,
    isPending,
  }
}

/**
 * Simpler hook for actions that don't return data, just track loading/error state.
 * 
 * @example
 * const { execute, isLoading, error } = useAsyncMutation(
 *   async () => {
 *     const result = await saveDraft()
 *     if (result.error) throw new Error(result.error)
 *   }
 * )
 */
export function useAsyncMutation<Args extends unknown[]>(
  action: (...args: Args) => Promise<{ error?: string } | void>,
  options?: UseAsyncActionOptions
) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (...args: Args): Promise<boolean> => {
      setIsLoading(true)
      setError(null)
      
      try {
        const result = await action(...args)
        
        if (result && 'error' in result && result.error) {
          setError(result.error)
          options?.onError?.(result.error)
          setIsLoading(false)
          return false
        }
        
        options?.onSuccess?.()
        setIsLoading(false)
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred'
        setError(errorMessage)
        options?.onError?.(errorMessage)
        setIsLoading(false)
        return false
      }
    },
    [action, options]
  )

  const reset = useCallback(() => {
    setError(null)
  }, [])

  return {
    execute,
    isLoading,
    error,
    reset,
  }
}

