import _ from 'lodash';

export function extractSearchLink(authorField) {
    const regEx = /<searchLink.*?fieldCode="(.*?)".*?>(.*?)<\/.?searchLink>/g;
    const match = regEx.exec(authorField);

    return match && {
        field: match[1],
        term: match[2]
    };
}

export function extractIndice(authorField) {
    const regEx = /<relatesTo.*?>(.*?)<\/.?relatesTo>/g;
    const match = regEx.exec(authorField);
    return match && match[1];
}

export function extractValue(authorField) {
    const regEx = /<.*>.*<\/.*>(.*?)$/;
    const match = regEx.exec(authorField);

    return match && _.trim(match[1], ' ;');
}

export function parseXMLLine(xmlLine) {
    const searchLink = extractSearchLink(xmlLine);
    const value = extractValue(xmlLine);
    if (!searchLink) {
        return value;
    }

    return {
        ...searchLink,
        indice: extractIndice(xmlLine),
        value
    };
}

export default function parseXML(xml) {
    return _.unescape(xml).replace(/<i.?\/?>/gi).split(/<br.?\/?>/)
    .map(parseXMLLine);
}
