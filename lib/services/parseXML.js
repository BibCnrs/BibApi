import _ from 'lodash';
import { AllHtmlEntities } from 'html-entities';
const entities = new AllHtmlEntities();

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
    const regEx = /.*?<.*>.*<\/.*>/;

    return _.trim(authorField.replace(regEx, ''), ' ;');
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
    return entities
    .decode(xml)
    .replace(/<i.?\/?>/gi).split(/<br.?\/?>/)
    .map(parseXMLLine);
}
