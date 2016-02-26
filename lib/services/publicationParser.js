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

export const extractISSNOnline = defaultToNull(function extractISSN(result) {
    return extractTargetFromItems('Type', 'issn-online', result.RecordInfo.BibRecord.BibEntity.Identifiers, 'Value');
});

export const extractISSNPrint = defaultToNull(function extractISSN(result) {
    return extractTargetFromItems('Type', 'issn-print', result.RecordInfo.BibRecord.BibEntity.Identifiers, 'Value');
});

export const extractISBNOnline = defaultToNull(function extractISBN(result) {
    return extractTargetFromItems('Type', 'isbn-online', result.RecordInfo.BibRecord.BibEntity.Identifiers, 'Value');
});

export const extractISBNPrint = defaultToNull(function extractISBN(result) {
    return extractTargetFromItems('Type', 'isbn-print', result.RecordInfo.BibRecord.BibEntity.Identifiers, 'Value');
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
        issnOnline: extractISSNOnline(result),
        issnPrint: extractISSNPrint(result),
        isbnOnline: extractISBNOnline(result),
        isbnPrint: extractISBNPrint(result),
        type: result.Header.ResourceType,
        title: extractTitle(result),
        fullTextHoldings: result.FullTextHoldings.map(parseFullTextHolding)
    };
}
