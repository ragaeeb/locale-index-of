# Enhanced Locale IndexOf

This project is an enhanced version of the original `localeIndexOf` library, which provides a locale-aware, Intl-powered version of `indexOf` with additional functionalities and improvements. It extends the capabilities of `Intl.Collator.compare()` to search, allowing for more sophisticated string comparison and searching based on locale settings.

## Acknowledgments

This project is built upon the work of Tom Adler, the creator of the original `localeIndexOf` library. His innovative approach to locale-aware string searching laid the groundwork for further enhancements. You can find the original project [here](https://github.com/arty-name/locale-index-of).

## Features

-   **Locale-Aware Searching**: Utilizes `Intl.Collator` for locale-specific string comparison.
-   **Generator Functionality**: Includes a generator function for creating slices of a string, aiding in complex search scenarios.
-   **Enhanced Options**: Additional options for handling numbers, punctuation, and other locale-specific nuances in string comparison.
-   **Flexible API**: Provides various methods for different use cases, including direct string comparison and functional programming approaches.

## Installation

```sh
npm install @ragaeeb/locale-index-of
```

## Usage

```js
import localeIndexOfMaker from '@ragaeeb/locale-index-of';
const localeIndexOf = localeIndexOfMaker(Intl);

// Example usage
localeIndexOf('a café', 'cafe', 'de', { sensitivity: 'base' }); // = 2
```

## Advanced Usage

### Ignoring Numbers with `ignoreNumbers` Option

The `ignoreNumbers` option allows you to perform searches while ignoring numeric characters in the string. This is particularly useful in scenarios where numbers in the text should not influence the search results for textual content.

#### Example

```js
import localeIndexOfMaker from 'enhanced-locale-index-of';
const localeIndexOf = localeIndexOfMaker(Intl);

// Example with ignoreNumbers
const result = localeIndexOf('123 Hello World 456', 'Hello', 'en', { ignoreNumbers: true });
console.log(result); // { index: 4, match: 'Hello' }
```

In this example, the search for 'Hello' is performed in a string that contains numbers. With the ignoreNumbers option set to true, the function ignores the numbers and correctly finds 'Hello' at index 4.

### Returning {match, index} Objects

For more detailed results, the function can return objects containing both the match substring and its index in the original string.

#### Example

```js
import localeIndexOfMaker from 'enhanced-locale-index-of';
const localeIndexOf = localeIndexOfMaker(Intl);

// Example usage returning {match, index}
const detailedResult = localeIndexOf('A quick brown fox', 'quick', 'en');
console.log(detailedResult); // { index: 2, match: 'quick' }
```

This example demonstrates how you can retrieve both the matched substring and its position in the source string, providing more context for the search result.

## API

### `getCollator(Intl, localesOrCollator, options)`

-   **Parameters**:
    -   `Intl`: The global Intl object.
    -   `localesOrCollator`: A locale string, an array of locale strings, or an existing Intl.Collator instance.
    -   `options`: Options for Intl.Collator.
-   **Returns**: An Intl.Collator instance.

### `makeSlicesGenerator(Intl, collator, string, substring)`

-   **Parameters**:
    -   `Intl`: The global Intl object.
    -   `collator`: An Intl.Collator instance for locale-specific comparison.
    -   `string`: The string to be searched.
    -   `substring`: The substring to search for.
-   **Yields**: Objects containing the index of the slice and the slice itself.

### `indexOf(Intl, collator, string, substring)`

-   **Parameters**:
    -   `Intl`: The global Intl object.
    -   `collator`: An Intl.Collator instance for locale-specific comparison.
    -   `string`: The string to be searched.
    -   `substring`: The substring to search for.
-   **Returns**: An object containing the index of the first occurrence of the substring and the matched substring.

### Additional Functions

-   `functional(Intl, string, substring, localesOrCollator, options)`: A high-level functional interface for substring searching.
-   Default export function: Creates a locale-specific substring search function.

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to check [issues page](your-issues-link) if you want to contribute.

## License

This project is [MIT licensed](your-license-link).

## See Also

-   [`Intl.Collator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Collator)
-   [`String.prototype.localeCompare`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare)

```

```
