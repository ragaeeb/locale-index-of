const NUMBER_REGEX = /\d/;

/**
 * Retrieves an Intl.Collator instance.
 *
 * @param {typeof globalThis.Intl} Intl - The global Intl object.
 * @param {string | string[] | Intl.Collator} localesOrCollator - A locale string, an array of locale strings, or an existing Intl.Collator instance.
 * @param {Intl.CollatorOptions} [options] - Options for Intl.Collator.
 * @returns {Intl.Collator} An Intl.Collator instance.
 */
export const getCollator = (Intl, localesOrCollator, options) => {
    if (localesOrCollator && localesOrCollator instanceof Intl.Collator) {
        return localesOrCollator;
    }

    return new Intl.Collator(localesOrCollator, {
        ...options,
        usage: 'search',
    });
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
export function* makeSlicesGenerator(Intl, collator, string, substring, { ignoreNumbers } = {}) {
    const { ignorePunctuation, locale } = collator.resolvedOptions();
    const punctuationCollator = ignorePunctuation ? new Intl.Collator(locale, { ignorePunctuation: true }) : null;

    const isConsidered = (grapheme) => {
        // When ignoring punctuation, treat space (' ') as not considered
        const isNumber = NUMBER_REGEX.test(grapheme);

        // Check against both punctuation and numbers
        return (!ignoreNumbers || !isNumber) && (!ignorePunctuation || collator.compare('a', `a${grapheme}`) !== 0);
    };

    const countOfConsideredGraphemes = (graphemes) =>
        punctuationCollator ? graphemes.filter(({ considered }) => considered).length : graphemes.length;

    const segmenter = Intl.Segmenter
        ? new Intl.Segmenter(locale, { granularity: 'grapheme' })
        : {
              *segment(str) {
                  let index = 0;
                  for (let i = 0; i < str.length; i++) {
                      const segment = str[i];
                      yield { index, segment };
                      index += segment.length;
                  }
              },
          };

    const substringGraphemes = Array.from(segmenter.segment(substring)).filter(({ segment }) => isConsidered(segment));
    const substringLength = substringGraphemes.length;

    const sliceArray = [];
    // Adjusted to filter segments for comparison, but keep track of original index and segment
    const stringSegments = Array.from(segmenter.segment(string)).map(({ index, segment }) => ({
        considered: isConsidered(segment),
        index,
        segment,
    }));

    for (let i = 0; i < stringSegments.length; i++) {
        const grapheme = stringSegments[i];
        const considered = isConsidered(grapheme.segment);

        // Only push considered graphemes to sliceArray
        if (considered) {
            sliceArray.push({ ...grapheme, considered });

            // Check if the sliceArray is full (according to the length of considered graphemes in the substring)
            if (countOfConsideredGraphemes(sliceArray) === substringLength) {
                const slice = sliceArray.map(({ segment }) => segment).join('');
                const { index } = sliceArray[0];

                // Yield the slice if it matches the substring
                if (collator.compare(slice, substring) === 0) {
                    yield { index, slice };
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
    const slices = Array.from(slicesGenerator);

    for (let i = 0; i < slices.length; i++) {
        const { index, slice } = slices[i];
        if (collator.compare(slice, substring) === 0) {
            return { index, match: slice };
        }
    }
    return { index: -1, match: null };
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
export const functional = (Intl, string, substring, localesOrCollator, { ignoreNumbers, ...collatorOptions } = {}) => {
    const collator = getCollator(Intl, localesOrCollator, collatorOptions);
    return indexOf(Intl, collator, string, substring, ignoreNumbers && { ignoreNumbers });
};

/**
 * Creates a locale-specific substring search function.
 *
 * @param {typeof globalThis.Intl} Intl - The global Intl object.
 * @returns {Function} A function that takes a string, a substring, optional locale or collator, and options, and returns an object with the index of the first occurrence of the substring and the matched substring. If no match is found, returns index as -1 and match as null.
 */
export default (Intl) => (string, substring, localesOrCollator, options) =>
    functional(Intl, string, substring, localesOrCollator, options);
