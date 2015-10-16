'use strict';

const defaultToNull = function (extractor) {
    return function (result) {
        try {
            return extractor(result) || null;
        } catch(error) {
            console.error(error);
            return null;
        }
    };
};

export const extractNoticeLink = defaultToNull(function (result) {
    return result.PLink;
});

export const extractTitle = defaultToNull(function(result) {
    return result.RecordInfo.BibRecord.BibEntity.Titles
    .filter(data => data.Type === 'main')
    .reduce((_, data) => data.TitleFull, null);
});

export const extractAuthors = defaultToNull(function (result) {
    return result.RecordInfo.BibRecord.BibRelationships.HasContributorRelationships
    .map(data => data.PersonEntity.Name.NameFull);
});

export const extractPublicationDate = defaultToNull(function (result) {
    return result.RecordInfo.BibRecord.BibRelationships.IsPartOfRelationships[0].BibEntity.Dates
    .filter(data => data.Type === 'published')
    .reduce((result, data) => {
        const date = new Date(`${data.M}/${data.D}/${data.Y}`);
        if (date.toString() === 'Invalid Date') {
            throw new Error('Invalid Date');
        }

        return date;
    }, null);
});

export const extractLanguages = defaultToNull(function (result) {
    return result.RecordInfo.BibRecord.BibEntity.Languages
    .map((data) => data.Text);
});

export const extractDatabase = defaultToNull(function (result) {
    return result.Header.DbLabel;
});

export const extractSubjects = defaultToNull(function (result) {
    return result.RecordInfo.BibRecord.BibEntity.Subjects
    .map((data) => data.SubjectFull);
});

export const extractPublicationType = defaultToNull(function (result) {
    return result.Header.PubType;
});

export default function (result) {
    return {
        noticeLink: extractNoticeLink(result),
        title: extractTitle(result),
        authors: extractAuthors(result),
        publicationDate: extractPublicationDate(result),
        languages: extractLanguages(result),
        database: extractDatabase(result),
        subjects: extractSubjects(result),
        publicationType: extractPublicationType(result)
    };
}
