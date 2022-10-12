import get from 'lodash/get';
import omit from 'lodash/omit';

import clean from '../utils/clean';
import { defaultToNull } from '../utils/defaultTo';

const decode = function (extractor) {
    return function (result) {
        return clean(extractor(result));
    };
};

export const extractTargetFromItems = function (
    attr,
    value,
    items,
    target = 'Data',
) {
    return items
        .filter((item) => item[attr] === value)
        .map((item) => item[target]);
};

export const extractTitle = defaultToNull(
    decode(function extractTitle(result) {
        return extractTargetFromItems(
            'Type',
            'main',
            result.RecordInfo.BibRecord.BibEntity.Titles,
            'TitleFull',
        ).join(', ');
    }),
);

export const extractISSNOnline = defaultToNull(function extractISSN(result) {
    return extractTargetFromItems(
        'Type',
        'issn-online',
        result.RecordInfo.BibRecord.BibEntity.Identifiers,
        'Value',
    );
});

export const extractISSNPrint = defaultToNull(function extractISSN(result) {
    return extractTargetFromItems(
        'Type',
        'issn-print',
        result.RecordInfo.BibRecord.BibEntity.Identifiers,
        'Value',
    );
});

export const extractISBNOnline = defaultToNull(function extractISBN(result) {
    return extractTargetFromItems(
        'Type',
        'isbn-online',
        result.RecordInfo.BibRecord.BibEntity.Identifiers,
        'Value',
    );
});

export const extractISBNPrint = defaultToNull(function extractISBN(result) {
    return extractTargetFromItems(
        'Type',
        'isbn-print',
        result.RecordInfo.BibRecord.BibEntity.Identifiers,
        'Value',
    );
});

export const parseDate = (rawDate) => {
    if (!rawDate) {
        return null;
    }
    if (rawDate === 'now') {
        return {
            year: '9999',
        };
    }
    return {
        month: rawDate.substring(4, 6),
        day: rawDate.substring(6, 8),
        year: rawDate.substring(0, 4),
    };
};

export const parseFullTextHolding = function (fullTextHolding) {
    const coverage = fullTextHolding.CoverageDates
        ? fullTextHolding.CoverageDates.sort(
              ({ end: a }, { end: b }) => parseInt(b) - parseInt(a),
          ).map((coverageDate) => ({
              start: parseDate(coverageDate.StartDate),
              end: parseDate(coverageDate.EndDate),
              startIndex: coverageDate.StartDate,
              endIndex: coverageDate.EndDate,
          }))
        : null;
    return {
        url: fullTextHolding.URL,
        name: fullTextHolding.Name,
        coverage,
        isCurrent: get(coverage, '[0].end.year') === '9999',
        embargo: fullTextHolding.Embargo
            ? {
                  value: fullTextHolding.Embargo || 0,
                  unit: fullTextHolding.EmbargoUnit,
              }
            : undefined,
    };
};

const getUnitValue = (unit) => {
    switch (unit) {
        case 'Year':
            return 365;
        case 'Month':
            return 30;
        case 'Week':
            return 7;
        case 'Day':
            return 1;
    }
};

export const extractFullTextHoldings = function (result) {
    if (!result.FullTextHoldings) {
        return [];
    }

    return result.FullTextHoldings.map(parseFullTextHolding)
        .sort((a, b) => {
            const startA = get(a, 'coverage[0].startIndex', '0');
            const startB = get(b, 'coverage[0].startIndex', '0');

            return startB - startA;
        })
        .sort((a, b) => {
            const embargoA = get(a, 'embargo', {
                value: 0,
                unit: 'Year',
            });
            const aValue = embargoA.value * getUnitValue(embargoA.unit);
            const embargoB = get(b, 'embargo', {
                value: 0,
                unit: 'Year',
            });
            const bValue = embargoB.value * getUnitValue(embargoB.unit);

            return aValue - bValue;
        })
        .sort((a, b) => {
            const endA = get(a, 'coverage[0].endIndex', '0');
            const endB = get(b, 'coverage[0].endIndex', '0');

            return endB - endA;
        })
        .map(({ coverage, ...holding }) => ({
            ...holding,
            coverage: coverage
                ? coverage.map((data) => omit(data, ['startIndex', 'endIndex']))
                : undefined,
        }));
};

export default function publicationParser(result) {
    return {
        id: result.ResultId,
        publicationId: result.Header.PublicationId,
        issnOnline: extractISSNOnline(result),
        issnPrint: extractISSNPrint(result),
        isbnOnline: extractISBNOnline(result),
        isbnPrint: extractISBNPrint(result),
        type: result.Header.ResourceType,
        title: extractTitle(result),
        fullTextHoldings: extractFullTextHoldings(result),
    };
}
