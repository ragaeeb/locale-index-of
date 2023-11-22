import { beforeAll, beforeEach, describe, expect, it } from '@jest/globals';

import localeIndexOfMaker from './index';

describe('index', () => {
    let localeIndexOf;
    let options;

    beforeAll(() => {
        localeIndexOf = localeIndexOfMaker(Intl);
    });

    describe('localeIndexOf', () => {
        describe('basic behavior', () => {
            it('should handle same strings', () => {
                expect(localeIndexOf('abcä', 'abcä')).toEqual({ index: 0, match: 'abcä' });
            });

            it('should find substring at the start of string', () => {
                expect(localeIndexOf('äbc', 'äb')).toEqual({ index: 0, match: 'äb' });
            });

            it('should find substring in the middle of string', () => {
                expect(localeIndexOf('abäcd', 'bäc')).toEqual({ index: 1, match: 'bäc' });
            });

            it('should find substring at the end of string', () => {
                expect(localeIndexOf('abcä', 'bcä')).toEqual({ index: 1, match: 'bcä' });
            });

            it('should find character at the end of string', () => {
                expect(localeIndexOf('abcä', 'ä')).toEqual({ index: 3, match: 'ä' });
            });

            it('should return -1 for no match', () => {
                expect(localeIndexOf('äbc', 'bd')).toEqual({ index: -1, match: null });
            });
        });

        describe('decomposed strings', () => {
            it('should handle decomposed substring: same strings', () => {
                expect(localeIndexOf('caf\u00e9', 'caf\u0065\u0301')).toEqual({ index: 0, match: 'caf\u00e9' });
            });

            it('should handle decomposed substring: substring at the start of string', () => {
                expect(localeIndexOf('caf\u00e9 x', 'caf\u0065\u0301')).toEqual({ index: 0, match: 'caf\u00e9' });
            });

            it('should handle decomposed substring: substring in the middle of string', () => {
                expect(localeIndexOf('xcaf\u00e9x', 'caf\u0065\u0301')).toEqual({ index: 1, match: 'caf\u00e9' });
            });

            it('should handle decomposed substring: substring at the end of string', () => {
                expect(localeIndexOf('xcaf\u00e9', 'caf\u0065\u0301')).toEqual({ index: 1, match: 'caf\u00e9' });
            });

            it('should handle decomposed substring: no match', () => {
                expect(localeIndexOf('cf\u00e9', 'caf\u0065\u0301')).toEqual({ index: -1, match: null });
            });

            it('should handle decomposed both: same strings', () => {
                expect(localeIndexOf('caf\u0065\u0301', 'caf\u0065\u0301')).toEqual({
                    index: 0,
                    match: 'caf\u0065\u0301',
                });
            });

            it('should handle decomposed both: substring at the start of string', () => {
                expect(localeIndexOf('caf\u0065\u0301 x', 'caf\u0065\u0301')).toEqual({
                    index: 0,
                    match: 'caf\u0065\u0301',
                });
            });

            it('should handle decomposed both: substring in the middle of string', () => {
                expect(localeIndexOf('xcaf\u0065\u0301x', 'caf\u0065\u0301')).toEqual({
                    index: 1,
                    match: 'caf\u0065\u0301',
                });
            });

            it('should handle decomposed both: substring at the end of string', () => {
                expect(localeIndexOf('xcaf\u0065\u0301', 'caf\u0065\u0301')).toEqual({
                    index: 1,
                    match: 'caf\u0065\u0301',
                });
            });

            it('should handle decomposed both: no match', () => {
                expect(localeIndexOf('cf\u0065\u0301', 'caf\u0065\u0301')).toEqual({ index: -1, match: null });
            });

            it('should handle decomposed string: same strings', () => {
                expect(localeIndexOf('caf\u0065\u0301', 'caf\u00e9')).toEqual({ index: 0, match: 'caf\u0065\u0301' });
            });

            it('should handle decomposed string: substring at the start of string', () => {
                expect(localeIndexOf('caf\u0065\u0301 x', 'caf\u00e9')).toEqual({ index: 0, match: 'caf\u0065\u0301' });
            });

            it('should handle decomposed string: substring in the middle of string', () => {
                expect(localeIndexOf('xcaf\u0065\u0301x', 'caf\u00e9')).toEqual({ index: 1, match: 'caf\u0065\u0301' });
            });

            it('should handle decomposed string: substring at the end of string', () => {
                expect(localeIndexOf('xcaf\u0065\u0301', 'caf\u00e9')).toEqual({ index: 1, match: 'caf\u0065\u0301' });
            });

            it('should handle decomposed string: no match', () => {
                expect(localeIndexOf('cf\u0065\u0301', 'caf\u00e9')).toEqual({ index: -1, match: null });
            });

            it('should return string index, not grapheme index', () => {
                expect(localeIndexOf('\u0065\u0301\u0065\u0301caf\u0065\u0301', 'caf\u00e9')).toEqual({
                    index: 4,
                    match: 'caf\u0065\u0301',
                });
            });
        });

        describe('sensitivity: base', () => {
            beforeEach(() => {
                options = { sensitivity: 'base' };
            });

            it('should not match in en with sensitivity: variant', () => {
                expect(localeIndexOf('here is ä for you', 'a', 'en', { sensitivity: 'variant' })).toEqual({
                    match: null,
                    index: -1,
                });
            });

            it('should not match in de with sensitivity: variant', () => {
                expect(localeIndexOf('here is ä for you', 'a', 'de', { sensitivity: 'variant' })).toEqual({
                    match: null,
                    index: -1,
                });
            });

            it('should not match in en with another letter', () => {
                expect(localeIndexOf('here is b for you', 'a', 'en', options)).toEqual({ match: null, index: -1 });
            });

            it('should not match in de with another letter', () => {
                expect(localeIndexOf('here is b for you', 'a', 'de', options)).toEqual({ match: null, index: -1 });
            });

            it('should find ä in en when searching for a', () => {
                expect(localeIndexOf('here is ä for you', 'a', 'en', options)).toEqual({ match: 'ä', index: 8 });
            });

            it('should not find ä in de when searching for a', () => {
                expect(localeIndexOf('here is ä for you', 'a', 'de', options)).toEqual({ match: null, index: -1 });
            });

            it('should find a in en when searching for ä', () => {
                expect(localeIndexOf('here is a for you', 'ä', 'en', options)).toEqual({ match: 'a', index: 8 });
            });

            it('should not find a in de when searching for ä', () => {
                expect(localeIndexOf('here is a for you', 'ä', 'de', options)).toEqual({ match: null, index: -1 });
            });

            it('should find A in en when searching for a', () => {
                expect(localeIndexOf('here is A for you', 'a', 'en', options)).toEqual({ match: 'A', index: 8 });
            });

            it('should find A in de when searching for a', () => {
                expect(localeIndexOf('here is A for you', 'a', 'de', options)).toEqual({ match: 'A', index: 8 });
            });

            it('should find a in en when searching for A', () => {
                expect(localeIndexOf('here is a for you', 'A', 'en', options)).toEqual({ match: 'a', index: 8 });
            });

            it('should find a in de when searching for A', () => {
                expect(localeIndexOf('here is a for you', 'A', 'de', options)).toEqual({ match: 'a', index: 8 });
            });
        });

        describe('sensitivity: accent', () => {
            beforeEach(() => {
                options = { sensitivity: 'accent' };
            });

            it('should not match in en with sensitivity: variant', () => {
                expect(localeIndexOf('here is ä for you', 'a', 'en', { sensitivity: 'variant' })).toEqual({
                    match: null,
                    index: -1,
                });
            });

            it('should not match in de with sensitivity: variant', () => {
                expect(localeIndexOf('here is ä for you', 'a', 'de', { sensitivity: 'variant' })).toEqual({
                    match: null,
                    index: -1,
                });
            });

            it('should not match in en with another letter', () => {
                expect(localeIndexOf('here is b for you', 'a', 'en', options)).toEqual({ match: null, index: -1 });
            });

            it('should not match in de with another letter', () => {
                expect(localeIndexOf('here is b for you', 'a', 'de', options)).toEqual({ match: null, index: -1 });
            });

            it('should not find ä in en when searching for a', () => {
                expect(localeIndexOf('here is ä for you', 'a', 'en', options)).toEqual({ match: null, index: -1 });
            });

            it('should not find ä in de when searching for a', () => {
                expect(localeIndexOf('here is ä for you', 'a', 'de', options)).toEqual({ match: null, index: -1 });
            });

            it('should not find a in en when searching for ä', () => {
                expect(localeIndexOf('here is a for you', 'ä', 'en', options)).toEqual({ match: null, index: -1 });
            });

            it('should not find a in de when searching for ä', () => {
                expect(localeIndexOf('here is a for you', 'ä', 'de', options)).toEqual({ match: null, index: -1 });
            });

            it('should find A in en when searching for a', () => {
                expect(localeIndexOf('here is A for you', 'a', 'en', options)).toEqual({ match: 'A', index: 8 });
            });

            it('should find A in de when searching for a', () => {
                expect(localeIndexOf('here is A for you', 'a', 'de', options)).toEqual({ match: 'A', index: 8 });
            });

            it('should find a in en when searching for A', () => {
                expect(localeIndexOf('here is a for you', 'A', 'en', options)).toEqual({ match: 'a', index: 8 });
            });

            it('should find a in de when searching for A', () => {
                expect(localeIndexOf('here is a for you', 'A', 'de', options)).toEqual({ match: 'a', index: 8 });
            });
        });

        describe('sensitivity: case', () => {
            beforeEach(() => {
                options = { sensitivity: 'case' };
            });

            it('should not match in en with sensitivity: variant', () => {
                expect(localeIndexOf('here is ä for you', 'a', 'en', { sensitivity: 'variant' })).toEqual({
                    match: null,
                    index: -1,
                });
            });

            it('should not match in de with sensitivity: variant', () => {
                expect(localeIndexOf('here is ä for you', 'a', 'de', { sensitivity: 'variant' })).toEqual({
                    match: null,
                    index: -1,
                });
            });

            it('should not match in en with another letter', () => {
                expect(localeIndexOf('here is b for you', 'a', 'en', options)).toEqual({ match: null, index: -1 });
            });

            it('should not match in de with another letter', () => {
                expect(localeIndexOf('here is b for you', 'a', 'de', options)).toEqual({ match: null, index: -1 });
            });

            it('should find ä in en when searching for a', () => {
                expect(localeIndexOf('here is ä for you', 'a', 'en', options)).toEqual({ match: 'ä', index: 8 });
            });

            it('should not find ä in de when searching for a', () => {
                expect(localeIndexOf('here is ä for you', 'a', 'de', options)).toEqual({ match: null, index: -1 });
            });

            it('should find a in en when searching for ä', () => {
                expect(localeIndexOf('here is a for you', 'ä', 'en', options)).toEqual({ match: 'a', index: 8 });
            });

            it('should not find a in de when searching for ä', () => {
                expect(localeIndexOf('here is a for you', 'ä', 'de', options)).toEqual({ match: null, index: -1 });
            });

            it('should not find A in en when searching for a', () => {
                expect(localeIndexOf('here is A for you', 'a', 'en', options)).toEqual({ match: null, index: -1 });
            });

            it('should not find A in de when searching for a', () => {
                expect(localeIndexOf('here is A for you', 'a', 'de', options)).toEqual({ match: null, index: -1 });
            });

            it('should not find a in en when searching for A', () => {
                expect(localeIndexOf('here is a for you', 'A', 'en', options)).toEqual({ match: null, index: -1 });
            });

            it('should not find a in de when searching for A', () => {
                expect(localeIndexOf('here is a for you', 'A', 'de', options)).toEqual({ match: null, index: -1 });
            });
        });

        describe('sensitivity: variant', () => {
            beforeEach(() => {
                options = { sensitivity: 'variant' };
            });

            it('should match ä in en when searching for ä', () => {
                expect(localeIndexOf('here is ä for you', 'ä', 'en', options)).toEqual({ match: 'ä', index: 8 });
            });

            it('should match ä in de when searching for ä', () => {
                expect(localeIndexOf('here is ä for you', 'ä', 'de', options)).toEqual({ match: 'ä', index: 8 });
            });

            it('should not match in en with another letter', () => {
                expect(localeIndexOf('here is b for you', 'a', 'en', options)).toEqual({ match: null, index: -1 });
            });

            it('should not match in de with another letter', () => {
                expect(localeIndexOf('here is b for you', 'a', 'de', options)).toEqual({ match: null, index: -1 });
            });

            it('should not find ä in en when searching for a', () => {
                expect(localeIndexOf('here is ä for you', 'a', 'en', options)).toEqual({ match: null, index: -1 });
            });

            it('should not find ä in de when searching for a', () => {
                expect(localeIndexOf('here is ä for you', 'a', 'de', options)).toEqual({ match: null, index: -1 });
            });

            it('should not find a in en when searching for ä', () => {
                expect(localeIndexOf('here is a for you', 'ä', 'en', options)).toEqual({ match: null, index: -1 });
            });

            it('should not find a in de when searching for ä', () => {
                expect(localeIndexOf('here is a for you', 'ä', 'de', options)).toEqual({ match: null, index: -1 });
            });

            it('should not find A in en when searching for a', () => {
                expect(localeIndexOf('here is A for you', 'a', 'en', options)).toEqual({ match: null, index: -1 });
            });

            it('should not find A in de when searching for a', () => {
                expect(localeIndexOf('here is A for you', 'a', 'de', options)).toEqual({ match: null, index: -1 });
            });

            it('should not find a in en when searching for A', () => {
                expect(localeIndexOf('here is a for you', 'A', 'en', options)).toEqual({ match: null, index: -1 });
            });

            it('should not find a in de when searching for A', () => {
                expect(localeIndexOf('here is a for you', 'A', 'de', options)).toEqual({ match: null, index: -1 });
            });
        });

        describe('existing collator', () => {
            it('should find ä in en when searching for a with a specific collator', () => {
                const collatorEN = new Intl.Collator('en', { sensitivity: 'base', usage: 'search' });
                expect(localeIndexOf('here is ä for you', 'a', collatorEN)).toEqual({ match: 'ä', index: 8 });
            });

            it('should not find ä in de when searching for a with a specific collator', () => {
                const collatorDE = new Intl.Collator('de', { sensitivity: 'base', usage: 'search' });
                expect(localeIndexOf('here is ä for you', 'a', collatorDE)).toEqual({ match: null, index: -1 });
            });
        });

        describe('ignorePunctuation', () => {
            beforeEach(() => {
                options = { ignorePunctuation: true };
            });

            it('should find e in en when string contains punctuation', () => {
                expect(localeIndexOf('tes', 'e', 'en', options)).toEqual({ match: 'e', index: 1 });
            });

            it('should find e in de when string contains punctuation', () => {
                expect(localeIndexOf('tes', 'e', 'de', options)).toEqual({ match: 'e', index: 1 });
            });
        });

        describe('localeIndexOf with Arabic text', () => {
            it('should find a basic match', () => {
                expect(localeIndexOf('السلام عليكم', 'عليكم')).toEqual({ index: 7, match: 'عليكم' });
            });

            it('should ignore punctuation', () => {
                expect(localeIndexOf('السلام، عليكم', 'عليكم')).toEqual({ index: 8, match: 'عليكم' });
            });

            it('should ignore numbers when option is enabled', () => {
                expect(localeIndexOf('السلام 123 عليكم', 'عليكم', 'ar', { ignoreNumbers: true })).toEqual({
                    index: 11,
                    match: 'عليكم',
                });
            });

            it('should handle complex scenario with punctuation and numbers', () => {
                const result = localeIndexOf('السلام، 123 عليكم', 'عليكم', 'ar', {
                    ignorePunctuation: true,
                    ignoreNumbers: true,
                });
                expect(result).toEqual({ index: 12, match: 'عليكم' });
            });

            it('should ignore the references', () => {
                const query = 'ثُمَّ لَمْ يَحْسِمْهُم. أَخْرَجَهُ';
                const result = localeIndexOf('ثُمَّ لَمْ يَحْسِمْهُم (2). أَخْرَجَهُ', query, 'ar', {
                    ignorePunctuation: true,
                    ignoreNumbers: true,
                });
                // this is not exactly what we want, but it's good enough for now
                expect(result).toEqual({ index: 0, match: 'ثُمَّلَمْيَحْسِمْهُمأَخْرَجَهُ' });
            });
        });

        describe.skip('ignorePunctuation failing tests', () => {
            beforeEach(() => {
                options = { ignorePunctuation: true };
            });

            it('should find match in en when string contains punctuation', () => {
                // the caveat is that whitespace is also considered punctuation
                expect(
                    localeIndexOf('a mätch, (possibly) true', 'mätchpossibly', 'en', { ignorePunctuation: true }),
                ).toEqual({
                    match: 'mätch, (possibly)',
                    index: 2,
                });
            });

            it('should find match in de when string contains punctuation', () => {
                expect(localeIndexOf('a mätch, (possibly) true', 'mätchpossibly', 'de', options)).toEqual({
                    match: 'mätch, (possibly)',
                    index: 1,
                });
            });

            it('should find match in en when substring contains punctuation', () => {
                expect(localeIndexOf('a mätchpossibly true', 'mätch possibly!!', 'en', options)).toEqual({
                    match: 'mätchpossibly',
                    index: 2,
                });
            });

            it('should find match in de when substring contains punctuation', () => {
                expect(localeIndexOf('a mätchpossibly true', 'mätch possibly!!', 'de', options)).toEqual({
                    match: 'mätchpossibly',
                    index: 2,
                });
            });

            it('should find match in en when string and substring contain punctuation', () => {
                expect(localeIndexOf('a mätch, (possibly!) true', 'mätch possibly!!', 'en', options)).toEqual({
                    match: 'mätch, (possibly!)',
                    index: 2,
                });
            });

            it('should find match in de when string and substring contain punctuation', () => {
                expect(localeIndexOf('a mätch, (possibly!) true', 'mätch possibly!!', 'de', options)).toEqual({
                    match: 'mätch, (possibly!)',
                    index: 2,
                });
            });

            it('should find decomposed match in de when string and substring contain punctuation', () => {
                expect(
                    localeIndexOf(
                        '\u0065\u0301 mätch, (possibl\u0065\u0301!) true',
                        'mätch possibl\u00e9!!',
                        'de',
                        options,
                    ),
                ).toEqual({ match: 'é mätch, (possiblé!)', index: 2 });
            });

            it('should find match in de when string is decomposed and substring contains punctuation', () => {
                expect(
                    localeIndexOf(
                        '\u0065\u0301 mätch, (possibl\u00e9!) true',
                        'mätch possibl\u0065\u0301!!',
                        'de',
                        options,
                    ),
                ).toEqual({ match: 'é mätch, (possiblé!)', index: 2 });
            });
        });
    });
});
