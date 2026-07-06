import { bench, describe } from "vitest";

// A mock complex calculation for benchmarking example
const computeFibonacci = (n: number): number => {
  if (n <= 1) return n;
  return computeFibonacci(n - 1) + computeFibonacci(n - 2);
};

// A mock array processing task
const processLargeArray = () => {
  const arr = Array.from({ length: 10000 }, (_, i) => i);
  return arr.filter(n => n % 2 === 0).map(n => n * 2).reduce((a, b) => a + b, 0);
};

describe("Performance Benchmarks", () => {
  bench("Fibonacci 20", () => {
    computeFibonacci(20);
  });

  bench("Process large array (Filter/Map/Reduce)", () => {
    processLargeArray();
  });
});
