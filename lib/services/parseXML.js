import _ from 'lodash';
import { AllHtmlEntities } from 'html-entities';
const entities = new AllHtmlEntities();

export function extractSearchLink(field) {
    const regEx = /<searchLink.*?fieldCode="(.*?)".*?term="(.*?)".*?>(.*?)<\/.?searchLink>(?:<relatesTo.*?>(.*?)<\/.?relatesTo>)?/gi;

    function loop(result = []) {
        const match = regEx.exec(field);
        if(!match) {
            return result;
        }

        return loop([
            ...result,
            {
                field: match[1],
                term: match[2],
                value: match[3],
                indice: match[4]
            }
        ]);
    }

    return loop();
}

export function extractFirstValue(field) {
    const regEx = /<.*>.*<\/.*>.*?$/;

    return _.trim(field.replace(regEx, ''), ' ;');
}

export function extractLastValue(field) {
    const regEx = /^.*?<.*>.*<\/.*>/;

    return _.trim(field.replace(regEx, ''), ' ;');
}

export function parseXMLLine(xmlLine) {
    const searchLink = extractSearchLink(xmlLine);
    const lastValue = extractLastValue(xmlLine);
    if (!searchLink || !searchLink.length) {
        return lastValue;
    }

    const firstValue = extractFirstValue(xmlLine);

    return {
        searchable: [...searchLink],
        firstValue,
        lastValue
    };
}

export default function parseXML(xml) {
    return entities
    .decode(xml)
    .replace(/<.?\/?i>/gi).split(/<br.?\/?>|\s;\s/)
    .map(parseXMLLine);
}
