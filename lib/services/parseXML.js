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

export function extractFirstValue(authorField) {
    const regEx = /<.*>.*<\/.*>.*?$/;

    return _.trim(authorField.replace(regEx, ''), ' ;');
}

export function extractLastValue(authorField) {
    const regEx = /^.*?<.*>.*<\/.*>/;

    return _.trim(authorField.replace(regEx, ''), ' ;');
}

export function parseXMLLine(xmlLine) {
    const searchLink = extractSearchLink(xmlLine);
    const lastValue = extractLastValue(xmlLine);
    if (!searchLink) {
        return lastValue;
    }

    const firstValue = extractFirstValue(xmlLine);

    return {
        ...searchLink,
        indice: extractIndice(xmlLine),
        firstValue,
        lastValue
    };
}

export default function parseXML(xml) {
    return entities
    .decode(xml)
    .replace(/<i.?\/?>/gi).split(/<br.?\/?>/)
    .map(parseXMLLine);
}
