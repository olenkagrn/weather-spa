/**
 * @jest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "@/hooks/useDebounce";

jest.useFakeTimers();

describe("useDebounce", () => {
  const delay = 500;

  test("returns null and loading false initially", () => {
    const asyncFn = jest.fn();
    const { result } = renderHook(() => useDebounce("test", delay, asyncFn));

    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.hasSearched).toBe(false);
  });

  test("sets result after debounce delay", async () => {
    const asyncFn = jest.fn().mockResolvedValue("success");

    const { result } = renderHook(() => useDebounce("hello", delay, asyncFn));

    act(() => {
      jest.advanceTimersByTime(delay - 100);
    });
    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);

    await act(async () => {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });

    expect(asyncFn).toHaveBeenCalledWith("hello");
    expect(result.current.result).toBe("success");
    expect(result.current.loading).toBe(false);
    expect(result.current.hasSearched).toBe(true);
  });

  test("resets result if value is empty", () => {
    const asyncFn = jest.fn();
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, delay, asyncFn),
      { initialProps: { value: "test" } }
    );

    rerender({ value: " " });
    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.hasSearched).toBe(false);
    expect(asyncFn).not.toHaveBeenCalled();
  });

  test("clears previous timeout when value changes", async () => {
    const asyncFn = jest.fn().mockResolvedValue("first");

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, delay, asyncFn),
      { initialProps: { value: "one" } }
    );

    act(() => {
      jest.advanceTimersByTime(delay / 2);
    });

    rerender({ value: "two" });

    await act(async () => {
      jest.advanceTimersByTime(delay);
      await Promise.resolve();
    });

    expect(asyncFn).toHaveBeenCalledTimes(1);
    expect(asyncFn).toHaveBeenCalledWith("two");
    expect(result.current.result).toBe("first");
  });

  test("sets loading true while fetching and false after", async () => {
    let resolveFn: (val: string) => void;
    const asyncFn = jest.fn().mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolveFn = resolve;
        })
    );

    const { result } = renderHook(() => useDebounce("abc", delay, asyncFn));

    act(() => {
      jest.advanceTimersByTime(delay);
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveFn!("done");
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.result).toBe("done");
    expect(result.current.hasSearched).toBe(true);
  });
});
