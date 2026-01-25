/**
 * Simple seeded pseudo-random number generator (PRNG).
 * Uses a linear congruential generator (LCG) algorithm.
 * 
 * Ideally, we want something simple and fast that is deterministic across runs.
 */
export function seededRandom(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;

  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

/**
 * Creates a stable seed from a string or object.
 * Uses a simple hash function.
 */
export function createSeed(input: string | number | object): number {
  const str = typeof input === 'object' ? JSON.stringify(input) : String(input);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
