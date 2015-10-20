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

export const extractNoticeLink = defaultToNull(function extractNoticeLink(result) {
    return result.PLink;
});

export const extractCustomLinks = defaultToNull(function extractCustomLinks(result) {
    return result.FullText.CustomLinks[0].Url;
});

export const extractArticleLink = defaultToNull(function extractNoticeLink(result) {
    const url = extractCustomLinks(result);

    if (url) {
        return url;
    }

    return result.Items
    .filter((data) => data.Name === 'URL')
    .reduce((_, data) => data.Data, null);
});

export const extractTitle = defaultToNull(function extractTitle(result) {
    return result.RecordInfo.BibRecord.BibEntity.Titles
    .filter(data => data.Type === 'main')
    .reduce((_, data) => data.TitleFull, null);
});

export const extractSource = defaultToNull(function (result) {
    let sourceTitle = result.Items
    .filter((item) => item.Name === 'TitleSource')
    .reduce((_, item) => item.Data, null);

    return sourceTitle.replace(/&lt;.*?&gt;/g, ''); // remove xml tag if any
});

export const extractAuthors = defaultToNull(function extractAuthors(result) {
    return result.RecordInfo.BibRecord.BibRelationships.HasContributorRelationships
    .map(data => data.PersonEntity.Name.NameFull);
});

export const extractPublicationDate = defaultToNull(function extractPublicationDate(result) {
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

export const extractLanguages = defaultToNull(function extractLanguages(result) {
    return result.RecordInfo.BibRecord.BibEntity.Languages
    .map((data) => data.Text);
});

export const extractDatabase = defaultToNull(function extractDatabase(result) {
    return result.Header.DbLabel || result.Header.DbId;
});

export const extractSubjects = defaultToNull(function extractSubjects(result) {
    return result.RecordInfo.BibRecord.BibEntity.Subjects
    .map((data) => data.SubjectFull);
});

export const extractPublicationType = defaultToNull(function extractPublicationType(result) {
    if (result.Header.PubType) {
        return result.Header.PubType;
    }
    if (result.Header.PubId && result.Header.PubId !== 'unknown') {
        return result.Header.PubId;
    }

    if (result.Header.DbId === 'edsndl') {
        return 'Dissertation/ Thesis';
    }

    return result.Items
    .filter((item) => item.Name === 'TypePub')
    .reduce((_, item) => item.Data, null);

});

export default function (result) {
    return {
        noticeLink: extractNoticeLink(result),
        articleLink: extractArticleLink(result),
        title: extractTitle(result),
        source: extractSource(result),
        authors: extractAuthors(result),
        publicationDate: extractPublicationDate(result),
        languages: extractLanguages(result),
        database: extractDatabase(result),
        subjects: extractSubjects(result),
        publicationType: extractPublicationType(result)
    };
}
