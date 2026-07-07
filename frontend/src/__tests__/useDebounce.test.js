/**
 * T-389 : `useDebouncedCallback` gardait son timer dans un `useState` et
 * retournait une fonction inline neuve à CHAQUE rendu (jamais mémoïsée) —
 * un `useEffect`/enfant mémoïsé dépendant de la stabilité référentielle de
 * la fonction retournée se re-déclenchait donc à chaque rendu du parent,
 * cassant silencieusement toute optimisation basée dessus.
 *
 * T-412 : aucun cleanup à l'unmount — un timer déjà armé au moment où le
 * composant appelant se démonte continuait de se déclencher après coup,
 * invoquant `callback` sur un composant démonté.
 */
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedCallback } from '../core/hooks/useDebounce';

describe('T-389/T-412 — useDebouncedCallback', () => {
  it('retourne la même référence de fonction entre deux rendus (callback/delay inchangés)', () => {
    const cb = vi.fn();
    const { result, rerender } = renderHook(({ delay }) => useDebouncedCallback(cb, delay), {
      initialProps: { delay: 300 },
    });
    const firstRef = result.current;
    rerender({ delay: 300 });
    expect(result.current).toBe(firstRef);
  });

  it('retourne une nouvelle référence si delay change', () => {
    const cb = vi.fn();
    const { result, rerender } = renderHook(({ delay }) => useDebouncedCallback(cb, delay), {
      initialProps: { delay: 300 },
    });
    const firstRef = result.current;
    rerender({ delay: 500 });
    expect(result.current).not.toBe(firstRef);
  });

  it('debounce réellement : un seul appel du callback après plusieurs appels rapprochés', async () => {
    vi.useFakeTimers();
    const cb = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(cb, 300));

    act(() => { result.current('a'); });
    act(() => { result.current('b'); });
    act(() => { result.current('c'); });

    expect(cb).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(300); });
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith('c');

    vi.useRealTimers();
  });

  it("T-412 : n'appelle plus le callback si le timer était déjà armé au moment du démontage", () => {
    vi.useFakeTimers();
    const cb = vi.fn();
    const { result, unmount } = renderHook(() => useDebouncedCallback(cb, 300));

    act(() => { result.current('a'); });
    unmount();
    act(() => { vi.advanceTimersByTime(300); });

    expect(cb).not.toHaveBeenCalled();

    vi.useRealTimers();
  });
});
