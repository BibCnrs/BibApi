import _ from 'lodash';
import { AllHtmlEntities } from 'html-entities';
const entities = new AllHtmlEntities();

export function extractSearchLink(field) {
    const regEx = /<searchLink.*?fieldCode="(.*?)".*?term="(.*?)".*?>(.*?)<\/.?searchLink>\s?(?:<(?:(?:relatesTo)|(?:superscript)).*?>(.*?)<\/.?(?:(?:relatesTo)|(?:superscript))>)?/gi;

    function loop(result = []) {
        const match = regEx.exec(field);
        if(!match) {
            return result;
        }

        return loop([
            ...result,
            {
                field: match[1],
                term: decodeURIComponent(match[2]).replace(/\+/g, ' '),
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

export function extractIndice(field) {
    const regEx = /<(?:(?:relatesTo)|(?:superscript)).*?>(.*?)<\/.?(?:(?:relatesTo)|(?:superscript))>/g;
    const match = regEx.exec(field);

    return match && match[1];
}

export function parseLabelValue(field) {
    return field.split('<i>')
    .slice(1)
    .reduce((result, data) => {
        const d = data.split(/<\/.?i>/);
        return {
            ...result,
            [_.trim(d[0], ' :')]: parseXMLLine(d[1])
        };
    }, {});
}

export function parseXMLLine(xmlLine) {
    if(!xmlLine) {
        return;
    }
    const regex = /^<i>/;
    if(regex.exec(xmlLine)) {
        return parseLabelValue(xmlLine);
    }
    const searchLink = extractSearchLink(xmlLine);
    const lastValue = extractLastValue(xmlLine);
    if (!searchLink || !searchLink.length) {
        const indice = extractIndice(xmlLine);
        if (indice) {
            return {
                indice,
                lastValue
            };
        }
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
    .split(/<br.?\/?>|\s;\s/)
    .map(parseXMLLine);
}
