/**
 * Retrieves an Intl.Collator instance.
 *
 * @param {typeof globalThis.Intl} Intl - The global Intl object.
 * @param {string | string[] | Intl.Collator} localesOrCollator - A locale string, an array of locale strings, or an existing Intl.Collator instance.
 * @param {Intl.CollatorOptions} [options] - Options for Intl.Collator.
 * @returns {Intl.Collator} An Intl.Collator instance.
 */
const getCollator = (Intl, localesOrCollator, options) => {
    if (localesOrCollator && localesOrCollator instanceof Intl.Collator) {
        return localesOrCollator;
    }

    return new Intl.Collator(localesOrCollator, {
        ...options,
        usage: 'search',
    });
};

const countOfConsideredGraphemes = (graphemes, ignorePunctuation) => {
    if (ignorePunctuation) {
        return graphemes.filter(({ considered }) => considered).length;
    }

    return graphemes.length;
};

/**
 * Generator function to create slices of a string for searching a substring.
 *
 * @param {typeof globalThis.Intl} Intl - The global Intl object.
 * @param {Intl.Collator} collator - An Intl.Collator instance for locale-specific comparison.
 * @param {string} string - The string to be searched.
 * @param {string} substring - The substring to search for.
 * @yields {{ index: number, slice: string }} An object containing the index of the slice and the slice itself.
 */
function* makeSlicesGenerator(Intl, collator, string, substring, options = {}) {
    const { ignorePunctuation, locale } = collator.resolvedOptions();

    const isConsidered = (grapheme) =>
        // Check against both punctuation and numbers
        (!options.ignoreNumbers || !/\d/.test(grapheme)) &&
        (!ignorePunctuation || collator.compare('a', `a${grapheme}`) !== 0);

    const segmenter = new Intl.Segmenter(locale, { granularity: 'grapheme' });

    const substringGraphemes = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const s of segmenter.segment(substring)) {
        if (isConsidered(s.segment)) {
            substringGraphemes.push(s.segment);
        }
    }

    const sliceArray = [];
    const stringSegments = [];

    // Adjusted to filter segments for comparison, but keep track of original index and segment
    // eslint-disable-next-line no-restricted-syntax
    for (const s of segmenter.segment(string)) {
        stringSegments.push({ considered: isConsidered(s.segment), index: s.index, segment: s.segment });
    }

    for (let i = 0; i < stringSegments.length; i++) {
        const grapheme = stringSegments[i];

        // Only push considered graphemes to sliceArray
        if (grapheme.considered) {
            sliceArray.push(grapheme);

            // Check if the sliceArray is full (according to the length of considered graphemes in the substring)
            if (countOfConsideredGraphemes(sliceArray, ignorePunctuation) === substringGraphemes.length) {
                const slice = sliceArray.map(({ segment }) => segment).join('');

                // Yield the slice if it matches the substring
                if (collator.compare(slice, substring) === 0) {
                    yield { index: sliceArray[0].index, slice };
                }

                // Remove the first element to make room for the next grapheme
                sliceArray.shift();
            }
        }
    }
}

/**
 * Finds the index of a substring in a string according to locale-specific rules.
 *
 * @param {typeof globalThis.Intl} Intl - The global Intl object.
 * @param {Intl.Collator} collator - An Intl.Collator instance for locale-specific comparison.
 * @param {string} string - The string to be searched.
 * @param {string} substring - The substring to search for.
 * @returns {{ index: number, match: string | null }} An object containing the index of the first occurrence of the substring and the matched substring. If no match is found, returns index as -1 and match as null.
 */
export const indexOf = (Intl, collator, string, substring, options) => {
    const slicesGenerator = makeSlicesGenerator(Intl, collator, string, substring, options);
    const slices = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const s of slicesGenerator) {
        slices.push(s);
    }

    for (let i = 0; i < slices.length; i++) {
        const { index, slice } = slices[i];
        if (collator.compare(slice, substring) === 0) {
            return { index, match: slice };
        }
    }
    return null;
};

/**
 * Functional wrapper for searching a substring in a string using locale-specific comparison.
 *
 * @param {typeof globalThis.Intl} Intl - The global Intl object.
 * @param {string} string - The string to be searched.
 * @param {string} substring - The substring to search for.
 * @param {string | string[] | Intl.Collator} localesOrCollator - A locale string, an array of locale strings, or an existing Intl.Collator instance.
 * @param {Intl.CollatorOptions} [options] - Options for Intl.Collator.
 * @returns {{ index: number, match: string | null }} An object containing the index of the first occurrence of the substring and the matched substring. If no match is found, returns index as -1 and match as null.
 */
const functional = (Intl, string, substring, localesOrCollator, { ignoreNumbers, ...collatorOptions } = {}) => {
    const collator = getCollator(Intl, localesOrCollator, collatorOptions);
    return indexOf(Intl, collator, string, substring, ignoreNumbers && { ignoreNumbers });
};

/**
 * Creates a locale-specific substring search function.
 *
 * @param {typeof globalThis.Intl} Intl - The global Intl object.
 * @returns {Function} A function that takes a string, a substring, optional locale or collator, and options, and returns an object with the index of the first occurrence of the substring and the matched substring. If no match is found, returns index as -1 and match as null.
 */
export default (Intl) => (string, substring, localesOrCollator, options) => {
    return functional(Intl, string, substring, localesOrCollator, options);
};
