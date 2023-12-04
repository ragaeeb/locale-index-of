/**
 * Retrieves an Intl.Collator instance.
 *
 * @param {string | string[] | Intl.Collator} localesOrCollator - A locale string, an array of locale strings, or an existing Intl.Collator instance.
 * @param {Intl.CollatorOptions} [options] - Options for Intl.Collator.
 * @returns {Intl.Collator} An Intl.Collator instance.
 */
const getCollator = (localesOrCollator, options) => {
    if (localesOrCollator && localesOrCollator instanceof Intl.Collator) {
        return localesOrCollator;
    }

    return new Intl.Collator(localesOrCollator, {
        ...options,
        usage: 'search',
    });
};

const filterConsideredSegments = (segmenter, isConsidered, text) => {
    const result = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const s of segmenter.segment(text)) {
        if (isConsidered(s.segment)) {
            result.push(s);
        }
    }

    return result;
};

const getContext = (collator, options) => {
    const { ignorePunctuation, locale } = collator.resolvedOptions();

    const isConsidered = (grapheme) => {
        // Check against both punctuation and numbers
        return (
            (!options.ignoreNumbers || !/\d/.test(grapheme)) &&
            (!ignorePunctuation || collator.compare('a', `a${grapheme}`) !== 0)
        );
    };

    const segmenter = new Intl.Segmenter(locale, { granularity: 'grapheme' });

    return {
        isConsidered,
        segmenter,
        collator,
    };
};

/**
 * Generator function to create slices of a string for searching a substring.
 *
 * @param {Intl.Collator} collator - An Intl.Collator instance for locale-specific comparison.
 * @param {string} string - The string to be searched.
 * @param {string} substring - The substring to search for.
 * @yields {{ index: number, slice: string }} An object containing the index of the slice and the slice itself.
 */
function* makeSlicesGenerator(context, stringSegments, substring) {
    const substringGraphemes = filterConsideredSegments(context.segmenter, context.isConsidered, substring);
    const sliceArray = [];

    for (let i = 0; i < stringSegments.length; i++) {
        sliceArray.push(stringSegments[i]);

        // Check if the sliceArray is full (according to the length of considered graphemes in the substring)
        if (sliceArray.length === substringGraphemes.length) {
            const match = sliceArray.map((s) => s.segment).join('');

            // Yield the slice if it matches the substring
            if (context.collator.compare(match, substring) === 0) {
                yield { index: sliceArray[0].index, match };
            }

            // Remove the first element to make room for the next grapheme
            sliceArray.shift();
        }
    }
}

const getMatch = (context, segments, needle) => {
    const slicesGenerator = makeSlicesGenerator(context, segments, needle);

    // eslint-disable-next-line no-restricted-syntax
    for (const s of slicesGenerator) {
        if (s) {
            return s;
        }
    }

    return null;
};

/**
 * Finds the index of a substring in a string according to locale-specific rules.
 *
 * @param {typeof globalThis.Intl} Intl - The global Intl object.
 * @param {Intl.Collator} collator - An Intl.Collator instance for locale-specific comparison.
 * @param {string} string - The string to be searched.
 * @param {string} substring - The substring to search for.
 * @returns {{ index: number, match: string | null }} An object containing the index of the first occurrence of the substring and the matched substring. If no match is found, returns index as -1 and match as null.
 */
const indexOf = (collator, string, substring, options = {}) => {
    const context = getContext(collator, options);
    const segments = filterConsideredSegments(context.segmenter, context.isConsidered, string);

    return getMatch(context, segments, substring);
};

export const getHaystackContext = (haystack, localesOrCollator, { ignoreNumbers, ...collatorOptions } = {}) => {
    const collator = getCollator(localesOrCollator, collatorOptions);
    const context = getContext(collator, { ignoreNumbers });
    const segments = filterConsideredSegments(context.segmenter, context.isConsidered, haystack);

    return { ...context, segments };
};

export const getMatches = ({ segments, ...context }, needles) => {
    const matches = [];

    for (let i = 0; i < needles.length; i++) {
        const match = getMatch(context, segments, needles[i]);
        matches.push(match);
    }

    return matches;
};

/**
 * Functional wrapper for searching a substring in a string using locale-specific comparison.
 *
 * @param {string} string - The string to be searched.
 * @param {string} substring - The substring to search for.
 * @param {string | string[] | Intl.Collator} localesOrCollator - A locale string, an array of locale strings, or an existing Intl.Collator instance.
 * @param {Intl.CollatorOptions} [options] - Options for Intl.Collator.
 * @returns {{ index: number, match: string | null }} An object containing the index of the first occurrence of the substring and the matched substring. If no match is found, returns index as -1 and match as null.
 */
const functional = (string, substring, localesOrCollator, { ignoreNumbers, ...collatorOptions } = {}) => {
    const collator = getCollator(localesOrCollator, collatorOptions);
    return indexOf(collator, string, substring, ignoreNumbers && { ignoreNumbers });
};

/**
 * Creates a locale-specific substring search function.
 *
 * @param {typeof globalThis.Intl} Intl - The global Intl object.
 * @returns {Function} A function that takes a string, a substring, optional locale or collator, and options, and returns an object with the index of the first occurrence of the substring and the matched substring. If no match is found, returns index as -1 and match as null.
 */
export default () => (string, substring, localesOrCollator, options) => {
    return functional(string, substring, localesOrCollator, options);
};
