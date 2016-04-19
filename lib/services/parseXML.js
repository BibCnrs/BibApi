import _ from 'lodash';
import { Readable } from 'stream';
import flow from 'xml-flow';
import { AllHtmlEntities } from 'html-entities';
const entities = new AllHtmlEntities();

export function parseXMLObject(data) {
    if (typeof data === 'string') {
        return _.trim(data, ' -;');
    }
    switch(data.$name) {
    case 'searchlink':
        return {
            term: decodeURIComponent(data.$attrs.term).replace(/\+/g, ' '),
            field: data.$attrs.fieldcode,
            value: data.$text
        };
    case 'relatesto':
    case 'superscript':
        return {
            indice: data.$text
        };
    case 'i':
        return data.$text;
    case 'externallink':
        return {
            url: data.$attrs.term,
            value: data.$text
        };
    case 'link':
        return {
            url: data.$attrs.linkterm,
            value: data.$text
        };
    default:
        return data;
    }
}

export function smartConcat(array, value) {
    if (!value) {
        return array;
    }
    // If current value and last array item are both string join them
    if(typeof value === 'string' && typeof array.slice(-1)[0] === 'string') {
        return [
            ...array.slice(0, -1),
            [...array.slice(-1), value].join(' ')
        ];
    }
    return [
        ...array,
        value
    ];
}

export function parseXMLLine(xmlLine) {
    return new Promise(function (resolve, reject) {
        if(!xmlLine) {
            return resolve(null);
        }
        const s = new Readable();
        s.push(`<root>-${xmlLine}-</root>`);    // ugly add "-" force flow to use $markup format even if string start and end with a tag
        s.push(null);

        const xmlStream = flow(s);
        xmlStream.on('tag:root', function(data) {
            if(data.$text) {
                return resolve(_.trim(data.$text, ' -;'));
            }
            resolve(
                data.$markup
                .map(parseXMLObject)
                .reduce(smartConcat, [])
            );
        });
        xmlStream.on('error', (e) => {
            reject(e);
        });
        xmlStream.on('end', () => resolve(xmlLine));
    });
}

export default function* parseXML(xml) {
    const result = yield entities
    .decode(xml)
    .split(/<br.?\/?>|\s;\s/)
    .map(parseXMLLine);

    return result;
}
