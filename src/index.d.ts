// index.d.ts
export as namespace localeIndexOfMaker;

// Regular expression for numbers
export const NUMBER_REGEX: RegExp;

// Function to get a collator instance
export function getCollator(
    Intl: typeof globalThis.Intl,
    localesOrCollator: string | string[] | Intl.Collator,
    options?: Intl.CollatorOptions
): Intl.Collator;

// Generator function to make slices
export function makeSlicesGenerator(
    Intl: typeof globalThis.Intl,
    collator: Intl.Collator,
    string: string,
    substring: string
): Generator<{ index: number; slice: string }>;

// Function to find the index of a substring
export function indexOf(
    Intl: typeof globalThis.Intl,
    collator: Intl.Collator,
    string: string,
    substring: string
): { index: number; match: string | null };

// High-level functional interface
export function functional(
    Intl: typeof globalThis.Intl,
    string: string,
    substring: string,
    localesOrCollator: string | string[] | Intl.Collator,
    options?: Intl.CollatorOptions
): { index: number; match: string | null };

// Default export function
export default function localeIndexOfMaker(
    Intl: typeof globalThis.Intl
): (
    string: string,
    substring: string,
    localesOrCollator?: string | string[] | Intl.Collator,
    options?: Intl.CollatorOptions
) => { index: number; match: string | null };
