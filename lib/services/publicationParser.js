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

export const parseFullTextHolding = function (fullTextHolding) {
    return {
        url: fullTextHolding.URL,
        name: fullTextHolding.Name,
        coverage: fullTextHolding.CoverageDates ? fullTextHolding.CoverageDates.map((coverageDate) => ({
            start: coverageDate.StartDate,
            end: coverageDate.EndDate
        })) : null,
        embargo: fullTextHolding.Embargo ? {
            value: fullTextHolding.Embargo || 0,
            unit: fullTextHolding.EmbargoUnit
        } : undefined
    };
};

export const extractFullTextHoldings = function(result) {
    if (!result.FullTextHoldings) {
        return [];
    }

    return result.FullTextHoldings.map(parseFullTextHolding);
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
        fullTextHoldings: extractFullTextHoldings(result)
    };
}
