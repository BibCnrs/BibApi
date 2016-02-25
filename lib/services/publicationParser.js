import clean from '../utils/clean';
import logger from './logger';

const defaultToNull = function (extractor) {
    return function (result) {
        try {
            return extractor(result) || null;
        } catch(error) {
            logger.error(error.stack);
            return null;
        }
    };
};

const decode = function (extractor) {
    return function (result) {
        return clean(extractor(result));
    };
};

export const extractTargetFromItems = function (attr, value, items, target = 'Data') {
    return items
    .filter((item) => item[attr] === value)
    .map((item) => item[target]);
};

export const extractTitle = defaultToNull(decode(function extractTitle(result) {
    return extractTargetFromItems('Type', 'main', result.RecordInfo.BibRecord.BibEntity.Titles, 'TitleFull').join(', ');
}));

export const extractISSN = defaultToNull(function extractISSN(result) {
    const issnOnlines = extractTargetFromItems('Type', 'issn-online', result.RecordInfo.BibRecord.BibEntity.Identifiers, 'Value');
    const issnPrints = extractTargetFromItems('Type', 'issn-print', result.RecordInfo.BibRecord.BibEntity.Identifiers, 'Value');

    return issnOnlines.concat(
        issnPrints
        .filter((issnPrint) => issnOnlines.indexOf(issnPrint) < 0)
    );
});

export const extractISBN = defaultToNull(function extractISSN(result) {
    const isbnOnlines = extractTargetFromItems('Type', 'isbn-online', result.RecordInfo.BibRecord.BibEntity.Identifiers, 'Value');
    const isbnPrints = extractTargetFromItems('Type', 'isbn-print', result.RecordInfo.BibRecord.BibEntity.Identifiers, 'Value');

    return isbnOnlines.concat(
        isbnPrints
        .filter((isbnPrint) => isbnOnlines.indexOf(isbnPrint) < 0)
    );
});

export const parseDate = function parseDate(rawDate) {
    const year = rawDate.substring(0, 4);
    if (year === '9999') {
        return 'présent';
    }
    return [
        rawDate.substring(4, 6), // month
        rawDate.substring(6, 8), // day
        year
    ].join('/');
};

export const parseFullTextHolding = function (fullTextHolding) {
    return {
        url: fullTextHolding.URL,
        name: fullTextHolding.Name,
        coverage: fullTextHolding.CoverageDates.map((coverageDate) => ({
            start: parseDate(coverageDate.StartDate),
            end: parseDate(coverageDate.EndDate)
        })),
        embargo: fullTextHolding.Embargo ? {
            value: fullTextHolding.Embargo || 0,
            unit: fullTextHolding.EmbargoUnit
        } : undefined
    };
};

export default function publicationParser(result) {
    return {
        id: result.ResultId,
        publicationId: result.Header.PublicationId,
        issn: extractISSN(result),
        isbn: extractISBN(result),
        type: result.Header.ResourceType,
        title: extractTitle(result),
        fullTextHoldings: result.FullTextHoldings.map(parseFullTextHolding)
    };
}
